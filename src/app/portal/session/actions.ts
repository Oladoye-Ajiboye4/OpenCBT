"use server";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "cbt_session";
const SECRET = process.env.SESSION_SECRET ?? "opencbt-default-secret-change-me";

type SessionPayload = {
    studentId: string;
    examId: string;
};

type AnswerMap = Record<string, string>;

type QuestionOption = string;

function toQuestionOptions(options: unknown): QuestionOption[] {
    if (!Array.isArray(options)) {
        return [];
    }

    return options.filter((item): item is string => typeof item === "string");
}

function isAnswerCorrect(
    correctAnswer: string,
    selectedOption: string,
    options: QuestionOption[]
): boolean {
    const normalizedCorrect = correctAnswer.trim();
    const normalizedSelected = selectedOption.trim();

    if (normalizedCorrect === normalizedSelected) {
        return true;
    }

    const letterToIndex: Record<string, string> = {
        A: "0",
        B: "1",
        C: "2",
        D: "3",
    };

    if (letterToIndex[normalizedCorrect.toUpperCase()] === normalizedSelected) {
        return true;
    }

    const selectedIndex = Number(normalizedSelected);
    if (
        Number.isInteger(selectedIndex) &&
        selectedIndex >= 0 &&
        selectedIndex < options.length &&
        options[selectedIndex]?.trim() === normalizedCorrect
    ) {
        return true;
    }

    return false;
}

function verifyPayload(token: string): SessionPayload | null {
    const [payloadPart, signaturePart] = token.split(".");

    if (!payloadPart || !signaturePart) {
        return null;
    }

    const expectedSig = createHmac("sha256", SECRET)
        .update(payloadPart)
        .digest("base64url");

    const expectedBuffer = Buffer.from(expectedSig);
    const actualBuffer = Buffer.from(signaturePart);

    if (
        expectedBuffer.length !== actualBuffer.length ||
        !timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
        return null;
    }

    try {
        const decoded = Buffer.from(payloadPart, "base64url").toString("utf8");
        const parsed = JSON.parse(decoded) as Partial<SessionPayload>;

        if (!parsed.studentId || !parsed.examId) {
            return null;
        }

        return {
            studentId: parsed.studentId,
            examId: parsed.examId,
        };
    } catch {
        return null;
    }
}

async function getSessionPayload() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionCookie) {
        return null;
    }

    return verifyPayload(sessionCookie);
}

export async function getExamSessionContext() {
    const session = await getSessionPayload();
    if (!session) {
        return { error: "Invalid session." };
    }

    const exam = await prisma.exam.findUnique({
        where: { id: session.examId },
        select: {
            id: true,
            title: true,
            duration: true,
            questions: {
                orderBy: { id: "asc" },
                select: {
                    id: true,
                    text: true,
                    options: true,
                    marks: true,
                    correctAnswer: true,
                },
            },
        },
    });

    if (!exam) {
        return { error: "Exam session not found." };
    }

    return {
        studentId: session.studentId,
        examId: session.examId,
        examTitle: exam.title,
        durationMinutes: exam.duration,
        // Zero-trust response: never expose correct answers to client runtime.
        questions: exam.questions.map((question) => {
            const { correctAnswer: _ignored, ...safeQuestion } = question;
            return {
                ...safeQuestion,
                options: toQuestionOptions(question.options),
            };
        }),
    };
}

export async function syncExamProgress(
    studentId: string,
    examId: string,
    answers: AnswerMap
) {
    const session = await getSessionPayload();

    if (!session) {
        return { error: "Invalid session." };
    }

    const resolvedStudentId = studentId || session.studentId;
    const resolvedExamId = examId || session.examId;

    if (
        resolvedStudentId !== session.studentId ||
        resolvedExamId !== session.examId
    ) {
        return { error: "Session mismatch." };
    }

    const entries = Object.entries(answers);
    if (entries.length === 0) {
        return { ok: true, syncedCount: 0 };
    }

    await prisma.$transaction(
        entries.map(([questionId, selectedOption]) =>
            prisma.examResponse.upsert({
                where: {
                    studentId_examId_questionId: {
                        studentId: resolvedStudentId,
                        examId: resolvedExamId,
                        questionId,
                    },
                },
                create: {
                    studentId: resolvedStudentId,
                    examId: resolvedExamId,
                    questionId,
                    selectedOption,
                },
                update: {
                    selectedOption,
                },
            })
        )
    );

    return { ok: true, syncedCount: entries.length };
}

export async function submitFinalExam(
    studentId: string,
    examId: string,
    answers: AnswerMap
) {
    const session = await getSessionPayload();

    if (!session) {
        return { error: "Invalid session." };
    }

    const resolvedStudentId = studentId || session.studentId;
    const resolvedExamId = examId || session.examId;

    if (
        resolvedStudentId !== session.studentId ||
        resolvedExamId !== session.examId
    ) {
        return { error: "Session mismatch." };
    }

    const student = await prisma.student.findUnique({
        where: { id: resolvedStudentId },
        select: { matricNumber: true },
    });

    const exam = await prisma.exam.findUnique({
        where: { id: resolvedExamId },
        select: {
            courseId: true,
            questions: {
                select: {
                    id: true,
                    correctAnswer: true,
                    options: true,
                    marks: true,
                },
            },
        },
    });

    if (!student || !exam) {
        return { error: "Session entities could not be resolved." };
    }

    const answerEntries = Object.entries(answers);

    let score = 0;
    let totalMarks = 0;

    for (const question of exam.questions) {
        const marks = question.marks > 0 ? question.marks : 1;
        totalMarks += marks;

        const selectedOption = answers[question.id];
        if (!selectedOption) {
            continue;
        }

        if (
            isAnswerCorrect(
                question.correctAnswer,
                selectedOption,
                toQuestionOptions(question.options)
            )
        ) {
            score += marks;
        }
    }

    await prisma.$transaction(async (tx) => {
        if (answerEntries.length > 0) {
            for (const [questionId, selectedOption] of answerEntries) {
                await tx.examResponse.upsert({
                    where: {
                        studentId_examId_questionId: {
                            studentId: resolvedStudentId,
                            examId: resolvedExamId,
                            questionId,
                        },
                    },
                    create: {
                        studentId: resolvedStudentId,
                        examId: resolvedExamId,
                        questionId,
                        selectedOption,
                    },
                    update: {
                        selectedOption,
                    },
                });
            }
        }

        await tx.enrollment.updateMany({
            where: {
                studentId: resolvedStudentId,
                courseId: exam.courseId,
            },
            data: {
                status: "COMPLETED",
                sessionStatus: "COMPLETED",
            },
        });

        await tx.result.upsert({
            where: {
                studentId_examId: {
                    studentId: resolvedStudentId,
                    examId: resolvedExamId,
                },
            },
            create: {
                studentId: resolvedStudentId,
                examId: resolvedExamId,
                score,
                totalMarks,
                status: "PENDING",
            },
            update: {
                score,
                totalMarks,
                status: "PENDING",
            },
        });

        await tx.examToken.deleteMany({
            where: {
                examId: resolvedExamId,
                matricNumber: student.matricNumber,
            },
        });
    });

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);

    return {
        ok: true,
        redirectTo:
            "/portal/success?message=Exam%20Submitted%20Successfully.%20You%20may%20now%20close%20this%20window.",
    };
}

export async function pingSession(
    studentId: string,
    examId: string,
    currentQuestion: number
) {
    const session = await getSessionPayload();

    if (!session) {
        return { error: "Invalid session." };
    }

    const resolvedStudentId = studentId || session.studentId;
    const resolvedExamId = examId || session.examId;

    if (
        resolvedStudentId !== session.studentId ||
        resolvedExamId !== session.examId
    ) {
        return { error: "Session mismatch." };
    }

    const exam = await prisma.exam.findUnique({
        where: { id: resolvedExamId },
        select: { courseId: true },
    });

    if (!exam) {
        return { error: "Exam not found." };
    }

    await prisma.enrollment.updateMany({
        where: {
            studentId: resolvedStudentId,
            courseId: exam.courseId,
        },
        data: {
            sessionStatus: "ACTIVE",
            currentQuestion,
            lastPing: new Date(),
        },
    });

    return { ok: true };
}

export async function logMalpractice(
    studentId: string,
    examId: string,
    anomalyType: string,
    base64Snapshot?: string
) {
    const session = await getSessionPayload();

    if (!session) {
        return { error: "Invalid session." };
    }

    const resolvedStudentId = studentId || session.studentId;
    const resolvedExamId = examId || session.examId;

    if (
        resolvedStudentId !== session.studentId ||
        resolvedExamId !== session.examId
    ) {
        return { error: "Session mismatch." };
    }

    await prisma.proctorLog.create({
        data: {
            studentId: resolvedStudentId,
            examId: resolvedExamId,
            anomalyType,
            description: anomalyType,
            snapshotUrl: base64Snapshot || null,
        },
    });

    return { ok: true };
}
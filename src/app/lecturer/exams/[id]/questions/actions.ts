"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

type CsvRow = {
    questionText?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctAnswer?: string;
};

async function assertLecturerExamAccess(examId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        return { error: "Authentication required." } as const;
    }

    const lecturer = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
    });

    if (!lecturer) {
        return { error: "Lecturer account not found." } as const;
    }

    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        select: {
            id: true,
            status: true,
            course: {
                select: {
                    lecturerId: true,
                },
            },
        },
    });

    if (!exam || exam.course.lecturerId !== lecturer.id) {
        return { error: "You do not have access to this exam." } as const;
    }

    if (exam.status !== "UPCOMING") {
        return { error: "Question editing is locked once an exam is active or completed." } as const;
    }

    return { ok: true } as const;
}

function normalizeCorrectAnswer(value: string): string | null {
    const normalized = value.trim();

    if (!normalized) {
        return null;
    }

    const upper = normalized.toUpperCase();
    if (["A", "B", "C", "D"].includes(upper)) {
        return upper;
    }

    if (["0", "1", "2", "3"].includes(normalized)) {
        const map = ["A", "B", "C", "D"];
        return map[Number(normalized)] ?? null;
    }

    return normalized;
}

export async function addManualQuestion(examId: string, formData: FormData) {
    const access = await assertLecturerExamAccess(examId);
    if ("error" in access) {
        return access;
    }

    const text = String(formData.get("text") ?? "").trim();
    const optionA = String(formData.get("optionA") ?? "").trim();
    const optionB = String(formData.get("optionB") ?? "").trim();
    const optionC = String(formData.get("optionC") ?? "").trim();
    const optionD = String(formData.get("optionD") ?? "").trim();
    const correctAnswerInput = String(formData.get("correctAnswer") ?? "").trim();

    if (!text || !optionA || !optionB || !optionC || !optionD || !correctAnswerInput) {
        return { error: "Please provide complete question and options." };
    }

    const correctAnswer = normalizeCorrectAnswer(correctAnswerInput);
    if (!correctAnswer) {
        return { error: "Invalid correct answer." };
    }

    await prisma.$executeRaw`
        INSERT INTO "Question" ("id", "examId", "text", "options", "correctAnswer", "marks")
        VALUES (${randomUUID()}, ${examId}, ${text}, ${JSON.stringify([optionA, optionB, optionC, optionD])}::jsonb, ${correctAnswer}, 1)
    `;

    revalidatePath(`/lecturer/exams/${examId}/questions`);
    revalidatePath(`/portal/session`);
    return { success: "Question added." };
}

export async function uploadQuestionsCsv(examId: string, formData: FormData) {
    const access = await assertLecturerExamAccess(examId);
    if ("error" in access) {
        return access;
    }

    const file = formData.get("csvFile");
    if (!(file instanceof File)) {
        return { error: "Please attach a CSV file." };
    }

    const csvContent = await file.text();
    const parsed = Papa.parse<CsvRow>(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
    });

    if (parsed.errors.length > 0) {
        return { error: "CSV parsing failed. Please verify headers and data format." };
    }

    const records = parsed.data
        .map((row) => {
            const questionText = row.questionText?.trim() ?? "";
            const optionA = row.optionA?.trim() ?? "";
            const optionB = row.optionB?.trim() ?? "";
            const optionC = row.optionC?.trim() ?? "";
            const optionD = row.optionD?.trim() ?? "";
            const normalizedCorrect = normalizeCorrectAnswer(row.correctAnswer ?? "");

            if (
                !questionText ||
                !optionA ||
                !optionB ||
                !optionC ||
                !optionD ||
                !normalizedCorrect
            ) {
                return null;
            }

            return {
                examId,
                text: questionText,
                options: [optionA, optionB, optionC, optionD],
                correctAnswer: normalizedCorrect,
                marks: 1,
            };
        })
        .filter((item): item is { examId: string; text: string; options: string[]; correctAnswer: string; marks: number } => Boolean(item));

    if (records.length === 0) {
        return { error: "No valid rows found. Expected headers: questionText, optionA, optionB, optionC, optionD, correctAnswer" };
    }

    for (const record of records) {
        await prisma.$executeRaw`
            INSERT INTO "Question" ("id", "examId", "text", "options", "correctAnswer", "marks")
            VALUES (${randomUUID()}, ${examId}, ${record.text}, ${JSON.stringify(record.options)}::jsonb, ${record.correctAnswer}, ${record.marks})
        `;
    }

    revalidatePath(`/lecturer/exams/${examId}/questions`);
    revalidatePath(`/portal/session`);

    return { success: `${records.length} questions uploaded.` };
}

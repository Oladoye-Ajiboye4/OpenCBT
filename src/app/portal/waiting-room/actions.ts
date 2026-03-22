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

export async function getWaitingRoomContext() {
    const session = await getSessionPayload();

    if (!session) {
        return { error: "Invalid session." };
    }

    const exam = await prisma.exam.findUnique({
        where: { id: session.examId },
        select: {
            id: true,
            title: true,
            status: true,
            scheduledDate: true,
            courseId: true,
        },
    });

    if (!exam) {
        return { error: "Exam context not found." };
    }

    const student = await prisma.student.findUnique({
        where: { id: session.studentId },
        select: { firstName: true, lastName: true },
    });

    return {
        studentId: session.studentId,
        examId: session.examId,
        examTitle: exam.title,
        examStatus: exam.status,
        scheduledDateISO: exam.scheduledDate.toISOString(),
        courseId: exam.courseId,
        studentName: student
            ? `${student.firstName} ${student.lastName}`.trim()
            : "Student",
    };
}

export async function setWaitingRoomStatus() {
    const session = await getSessionPayload();

    if (!session) {
        return { error: "Invalid session." };
    }

    const exam = await prisma.exam.findUnique({
        where: { id: session.examId },
        select: { courseId: true },
    });

    if (!exam) {
        return { error: "Exam not found." };
    }

    await prisma.enrollment.updateMany({
        where: {
            studentId: session.studentId,
            courseId: exam.courseId,
        },
        data: {
            sessionStatus: "WAITING",
            currentQuestion: 1,
        },
    });

    return { ok: true };
}

export async function activateStudentSession() {
    const session = await getSessionPayload();

    if (!session) {
        return { error: "Invalid session." };
    }

    const exam = await prisma.exam.findUnique({
        where: { id: session.examId },
        select: { courseId: true },
    });

    if (!exam) {
        return { error: "Exam not found." };
    }

    await prisma.enrollment.updateMany({
        where: {
            studentId: session.studentId,
            courseId: exam.courseId,
        },
        data: {
            sessionStatus: "ACTIVE",
            lastPing: new Date(),
        },
    });

    return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

async function assertLecturerResultAccess(resultId: string) {
    const prismaAny = prisma as any;
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

    const result = (await prismaAny.result.findUnique({
        where: { id: resultId },
        select: {
            id: true,
            examId: true,
            exam: {
                select: {
                    course: {
                        select: {
                            lecturerId: true,
                        },
                    },
                },
            },
        },
    })) as {
        id: string;
        examId: string;
        exam: {
            course: {
                lecturerId: string | null;
            };
        };
    } | null;

    if (!result || result.exam.course.lecturerId !== lecturer.id) {
        return { error: "You do not have access to this result." } as const;
    }

    return { ok: true, examId: result.examId } as const;
}

export async function approveResultByLecturer(resultId: string) {
    const prismaAny = prisma as any;
    const access = await assertLecturerResultAccess(resultId);
    if ("error" in access) {
        return access;
    }

    await prismaAny.result.update({
        where: { id: resultId },
        data: {
            status: "APPROVED_BY_LECTURER",
        },
    });

    revalidatePath(`/lecturer/exams/${access.examId}/results`);
    revalidatePath("/admin/results");
    return { success: true };
}

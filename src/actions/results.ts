"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendStudentResultEmail } from "@/lib/mail";

async function assertAdminSession() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        return { error: "Authentication required." } as const;
    }

    const admin = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
        return { error: "Admin access required." } as const;
    }

    return { ok: true } as const;
}

export async function publishResults(resultId: string) {
    try {
        const access = await assertAdminSession();
        if ("error" in access) {
            return access;
        }

        const prismaAny = prisma as any;
        const result = (await prismaAny.result.findUnique({
            where: { id: resultId },
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                exam: {
                    select: {
                        title: true,
                        course: {
                            select: {
                                code: true,
                            },
                        },
                    },
                },
            },
        })) as {
            id: string;
            status: string;
            score: number;
            totalMarks: number;
            student: {
                firstName: string;
                lastName: string;
                email: string;
            };
            exam: {
                title: string;
                course: {
                    code: string;
                };
            };
        } | null;

        if (!result) {
            return { error: "Result not found." };
        }

        if (result.status !== "APPROVED_BY_LECTURER") {
            return { error: "Only lecturer-approved results can be published." };
        }

        await prismaAny.result.update({
            where: { id: resultId },
            data: { status: "PUBLISHED" },
        });

        const emailResult = await sendStudentResultEmail(
            result.student.email,
            `${result.student.firstName} ${result.student.lastName}`.trim(),
            result.exam.course.code,
            result.score,
            result.totalMarks
        );

        if (emailResult?.error) {
            return { error: "Result published, but email dispatch failed." };
        }

        revalidatePath("/admin/results");
        return { success: true, message: "Result published and email dispatched successfully." };
    } catch (error) {
        console.error(error);
        return { error: "An unexpected network error occurred." };
    }
}

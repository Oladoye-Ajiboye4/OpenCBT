import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { FlagsClient } from "./FlagsClient";

export default async function LecturerFlagsPage() {
    const prismaAny = prisma as any;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/sign-in");
    }

    const lecturer = await prisma.user.findUnique({
        where: { email: user.email! },
        select: { id: true },
    });

    if (!lecturer) {
        redirect("/sign-in");
    }

    const logs = (await prismaAny.proctorLog.findMany({
        where: {
            exam: {
                course: {
                    lecturerId: lecturer.id,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        include: {
            student: {
                select: {
                    firstName: true,
                    lastName: true,
                    matricNumber: true,
                },
            },
            exam: {
                select: {
                    title: true,
                },
            },
        },
        take: 200,
    })) as Array<{
        id: string;
        infractionType?: string;
        anomalyType?: string;
        details?: string | null;
        description?: string;
        snapshotUrl?: string | null;
        timestamp?: Date;
        createdAt?: Date;
        student?: {
            firstName: string;
            lastName: string;
            matricNumber: string;
        };
        exam?: {
            title: string;
        };
    }>;

    return (
        <FlagsClient
            flags={logs.map((log) => ({
                id: log.id,
                matricNumber: log.student?.matricNumber ?? "Unknown",
                studentName: `${log.student?.firstName ?? "Unknown"} ${log.student?.lastName ?? "Student"}`.trim(),
                examTitle: log.exam?.title ?? "Unknown Exam",
                anomalyType: log.anomalyType ?? log.infractionType ?? "Unknown anomaly",
                description: log.description ?? log.details ?? "No details provided",
                snapshotUrl: log.snapshotUrl ?? null,
                createdAtISO: (log.createdAt ?? log.timestamp ?? new Date()).toISOString(),
            }))}
        />
    );
}

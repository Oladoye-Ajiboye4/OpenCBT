import { AlertTriangle, ShieldCheck, Users, Timer } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { MonitorAutoRefresh } from "./MonitorAutoRefresh";

type MonitorPageProps = {
    params: Promise<{ id: string }>;
};

type EnrollmentMonitorRow = {
    sessionStatus: string;
    currentQuestion: number;
    lastPing: Date | null;
    student: {
        id: string;
        firstName: string;
        lastName: string;
        matricNumber: string;
    };
};

type ProctorLogRow = {
    id: string;
    anomalyType?: string;
    infractionType?: string;
    description?: string;
    details?: string | null;
    snapshotUrl?: string | null;
    createdAt?: Date;
    timestamp?: Date;
    student?: {
        firstName: string;
        lastName: string;
    };
};

export default async function ExamMonitorPage({ params }: MonitorPageProps) {
    const { id: examId } = await params;

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

    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        select: {
            id: true,
            title: true,
            course: {
                select: {
                    id: true,
                    code: true,
                    lecturerId: true,
                },
            },
        },
    });

    if (!exam || exam.course.lecturerId !== lecturer.id) {
        redirect("/lecturer/exams");
    }

    const enrollments = (await prisma.enrollment.findMany({
        where: {
            courseId: exam.course.id,
            sessionStatus: {
                in: ["WAITING", "ACTIVE", "COMPLETED"],
            },
        },
        select: {
            sessionStatus: true,
            currentQuestion: true,
            lastPing: true,
            student: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    matricNumber: true,
                },
            },
        },
        orderBy: {
            enrolledAt: "asc",
        },
    })) as EnrollmentMonitorRow[];

    const logs = (await prisma.proctorLog.findMany({
        where: { examId },
        include: {
            student: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
        orderBy: { createdAt: "desc" } as never,
        take: 40,
    })) as ProctorLogRow[];

    const cutoffDate = new Date();
    cutoffDate.setSeconds(cutoffDate.getSeconds() - 30);

    const waitingStudents = enrollments.filter((row) => row.sessionStatus === "WAITING");
    const activeHealthy = enrollments.filter(
        (row) => row.sessionStatus === "ACTIVE" && row.lastPing && row.lastPing >= cutoffDate
    );
    const disconnected = enrollments.filter(
        (row) =>
            row.sessionStatus === "ACTIVE" &&
            (!row.lastPing || row.lastPing < cutoffDate)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <MonitorAutoRefresh />

            <section className="bg-white rounded-3xl border border-accent p-6 shadow-sm">
                <h1 className="text-3xl font-black text-primary">Live Monitor Command Center</h1>
                <p className="mt-2 text-secondary font-medium">
                    {exam.title} · {exam.course.code}
                </p>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-accent p-6">
                    <div className="flex items-center gap-2 text-primary mb-4">
                        <Users className="w-5 h-5" />
                        <h2 className="text-xl font-black">Waiting Room</h2>
                    </div>
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {waitingStudents.length === 0 ? (
                            <li className="text-sm text-[#6E6E6E]">No students waiting.</li>
                        ) : (
                            waitingStudents.map((entry) => (
                                <li
                                    key={entry.student.id}
                                    className="text-sm font-semibold text-primary bg-[#F8F2ED] border border-accent rounded-lg px-3 py-2"
                                >
                                    {entry.student.firstName} {entry.student.lastName} ({entry.student.matricNumber})
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div className="bg-white rounded-3xl border border-accent p-6">
                    <div className="flex items-center gap-2 text-green-700 mb-4">
                        <ShieldCheck className="w-5 h-5" />
                        <h2 className="text-xl font-black">Active & Healthy</h2>
                    </div>
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {activeHealthy.length === 0 ? (
                            <li className="text-sm text-[#6E6E6E]">No healthy active sessions yet.</li>
                        ) : (
                            activeHealthy.map((entry) => (
                                <li
                                    key={entry.student.id}
                                    className="text-sm font-semibold text-[#1F5130] bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                                >
                                    {entry.student.firstName} {entry.student.lastName} · Q{entry.currentQuestion}
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div className="bg-white rounded-3xl border border-accent p-6">
                    <div className="flex items-center gap-2 text-amber-700 mb-4">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-xl font-black">Disconnected / Network Issue</h2>
                    </div>
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                        {disconnected.length === 0 ? (
                            <li className="text-sm text-[#6E6E6E]">No disconnections currently detected.</li>
                        ) : (
                            disconnected.map((entry) => (
                                <li
                                    key={entry.student.id}
                                    className="text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                                >
                                    {entry.student.firstName} {entry.student.lastName}
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div className="bg-white rounded-3xl border border-accent p-6">
                    <div className="flex items-center gap-2 text-red-700 mb-4">
                        <Timer className="w-5 h-5" />
                        <h2 className="text-xl font-black">Malpractice Feed</h2>
                    </div>

                    <div className="space-y-4 max-h-112 overflow-y-auto pr-1">
                        {logs.length === 0 ? (
                            <p className="text-sm text-[#6E6E6E]">No malpractice logs captured yet.</p>
                        ) : (
                            logs.map((log) => (
                                <article
                                    key={log.id}
                                    className="rounded-xl border border-red-200 bg-red-50 p-3"
                                >
                                    <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                                        {log.anomalyType || log.infractionType || "Unknown anomaly"}
                                    </p>
                                    <p className="text-sm font-semibold text-primary mt-1">
                                        {log.student?.firstName || "Unknown"} {log.student?.lastName || "Student"}
                                    </p>
                                    <p className="text-sm text-[#6A4C41] mt-1">
                                        {log.description || log.details || "No details provided."}
                                    </p>
                                    {log.snapshotUrl ? (
                                        <img
                                            src={log.snapshotUrl}
                                            alt="Malpractice Snapshot"
                                            className="mt-3 w-full max-h-44 object-cover rounded-lg border border-red-200"
                                        />
                                    ) : null}
                                    <p className="text-[11px] text-[#7A6156] mt-2">
                                        {new Date(log.createdAt || log.timestamp || 0).toLocaleString()}
                                    </p>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

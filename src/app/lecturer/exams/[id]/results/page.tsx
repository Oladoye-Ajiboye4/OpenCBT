import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { approveResultByLecturer } from "./actions";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function LecturerExamResultsPage({ params }: PageProps) {
    const { id: examId } = await params;
    const prismaAny = prisma as any;

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        redirect("/sign-in");
    }

    const lecturer = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
    });

    if (!lecturer) {
        redirect("/sign-in");
    }

    const exam = (await prismaAny.exam.findUnique({
        where: { id: examId },
        select: {
            id: true,
            title: true,
            course: {
                select: {
                    code: true,
                    lecturerId: true,
                },
            },
            results: {
                orderBy: { score: "desc" },
                include: {
                    student: {
                        select: {
                            firstName: true,
                            lastName: true,
                            matricNumber: true,
                            email: true,
                        },
                    },
                },
            },
        },
    })) as
        | {
            id: string;
            title: string;
            course: {
                code: string;
                lecturerId: string | null;
            };
            results: Array<{
                id: string;
                score: number;
                totalMarks: number;
                status: string;
                student: {
                    firstName: string;
                    lastName: string;
                    matricNumber: string;
                    email: string;
                };
            }>;
        }
        | null;

    if (!exam || exam.course.lecturerId !== lecturer.id) {
        redirect("/lecturer/exams");
    }

    return (
        <div className="max-w-7xl mx-auto space-y-7 pb-16">
            <section className="bg-white rounded-3xl border border-accent p-7 shadow-sm">
                <p className="text-xs font-bold tracking-[0.16em] uppercase text-secondary/80">Exam Result Workflow</p>
                <h1 className="mt-2 text-3xl font-black text-primary">{exam.title}</h1>
                <p className="text-sm font-semibold text-secondary mt-1">{exam.course.code}</p>
                <Link
                    href="/lecturer/exams"
                    className="inline-flex mt-4 px-4 py-2 rounded-lg border border-accent text-sm font-bold text-primary hover:bg-accent"
                >
                    Back to Exams
                </Link>
            </section>

            <section className="bg-white rounded-3xl border border-accent shadow-sm overflow-hidden">
                <div className="p-5 border-b border-accent bg-accent/30">
                    <h2 className="text-lg font-black text-primary">Auto-Graded Results</h2>
                </div>

                {exam.results.length === 0 ? (
                    <p className="p-6 text-sm font-semibold text-secondary">No result records yet for this exam.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-secondary">
                            <thead className="bg-accent text-xs uppercase font-bold text-primary">
                                <tr>
                                    <th className="px-5 py-4">Student</th>
                                    <th className="px-5 py-4">Score</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-accent">
                                {exam.results.map((result) => {
                                    const action = async (_formData: FormData) => {
                                        "use server";
                                        await approveResultByLecturer(result.id);
                                    };
                                    return (
                                        <tr key={result.id}>
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-primary">
                                                    {result.student.firstName} {result.student.lastName}
                                                </p>
                                                <p className="font-mono text-xs">{result.student.matricNumber}</p>
                                            </td>
                                            <td className="px-5 py-4 font-black text-primary">
                                                {result.score}/{result.totalMarks}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="px-2 py-1 rounded-md bg-accent border border-accent text-xs font-bold">
                                                    {result.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {result.status === "PENDING" ? (
                                                    <form action={action}>
                                                        <button
                                                            type="submit"
                                                            className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90"
                                                        >
                                                            Approve & Send to Admin
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <span className="text-xs font-bold text-secondary">Reviewed</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

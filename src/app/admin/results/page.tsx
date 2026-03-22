import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { publishResults } from "@/actions/results";

export default async function AdminResultsPage() {
    const prismaAny = prisma as any;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        redirect("/sign-in");
    }

    const admin = await prisma.user.findUnique({
        where: { email: user.email },
        select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
        redirect("/admin");
    }

    const results = (await prismaAny.result.findMany({
        where: {
            status: "APPROVED_BY_LECTURER",
        },
        orderBy: {
            examId: "asc",
        },
        include: {
            student: {
                select: {
                    firstName: true,
                    lastName: true,
                    matricNumber: true,
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
    })) as Array<{
        id: string;
        score: number;
        totalMarks: number;
        student: {
            firstName: string;
            lastName: string;
            matricNumber: string;
            email: string;
        };
        exam: {
            title: string;
            course: {
                code: string;
            };
        };
    }>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16">
            <section className="bg-white rounded-3xl border border-accent p-7 shadow-sm">
                <p className="text-xs font-bold tracking-[0.16em] uppercase text-secondary/80">Admin Publication Queue</p>
                <h1 className="mt-2 text-3xl font-black text-primary">Approved Results</h1>
                <p className="mt-2 text-sm font-semibold text-secondary">
                    Publish lecturer-approved results to finalize release and email students automatically.
                </p>
            </section>

            <section className="bg-white rounded-3xl border border-accent shadow-sm overflow-hidden">
                <div className="p-5 border-b border-accent bg-accent/30">
                    <h2 className="text-lg font-black text-primary">Pending Publication</h2>
                </div>

                {results.length === 0 ? (
                    <p className="p-6 text-sm font-semibold text-secondary">No approved results awaiting publication.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-secondary">
                            <thead className="bg-accent text-xs uppercase font-bold text-primary">
                                <tr>
                                    <th className="px-5 py-4">Student</th>
                                    <th className="px-5 py-4">Exam</th>
                                    <th className="px-5 py-4">Score</th>
                                    <th className="px-5 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-accent">
                                {results.map((result) => {
                                    const action = async (_formData: FormData) => {
                                        "use server";
                                        await publishResults(result.id);
                                    };

                                    return (
                                        <tr key={result.id}>
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-primary">
                                                    {result.student.firstName} {result.student.lastName}
                                                </p>
                                                <p className="font-mono text-xs">{result.student.matricNumber}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-primary">{result.exam.title}</p>
                                                <p className="text-xs font-semibold">{result.exam.course.code}</p>
                                            </td>
                                            <td className="px-5 py-4 font-black text-primary">
                                                {result.score}/{result.totalMarks}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <form action={action}>
                                                    <button
                                                        type="submit"
                                                        className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90"
                                                    >
                                                        Publish Results
                                                    </button>
                                                </form>
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

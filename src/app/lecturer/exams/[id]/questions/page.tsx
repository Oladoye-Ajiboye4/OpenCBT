import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { addManualQuestion, uploadQuestionsCsv } from "./actions";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function LecturerQuestionBuilderPage({ params }: PageProps) {
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
            status: true,
            course: {
                select: {
                    code: true,
                    lecturerId: true,
                },
            },
        },
    });

    if (!exam || exam.course.lecturerId !== lecturer.id) {
        redirect("/lecturer/exams");
    }

    if (exam.status !== "UPCOMING") {
        redirect("/lecturer/exams");
    }

    const questions = await prisma.$queryRaw<
        Array<{
            id: string;
            text: string;
            correctAnswer: string;
            marks: number;
        }>
    >`
        SELECT "id", "text", "correctAnswer", "marks"
        FROM "Question"
        WHERE "examId" = ${examId}
        ORDER BY "id" DESC
    `;

    const manualAction = async (formData: FormData) => {
        "use server";
        await addManualQuestion(examId, formData);
    };

    const csvAction = async (formData: FormData) => {
        "use server";
        await uploadQuestionsCsv(examId, formData);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16">
            <section className="bg-white border border-accent rounded-3xl p-7 shadow-sm">
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#745F56]">Question Builder</p>
                <h1 className="mt-2 text-3xl font-black text-primary">{exam.title}</h1>
                <p className="mt-1 text-sm font-semibold text-[#745F56]">{exam.course.code}</p>
                <div className="mt-5 flex items-center gap-3">
                    <Link
                        href="/lecturer/exams"
                        className="px-4 py-2 rounded-lg border border-accent text-sm font-bold text-primary hover:bg-[#F4EFEA]"
                    >
                        Back to Exams
                    </Link>
                    <span className="text-sm font-bold text-secondary">
                        Total Questions: {questions.length}
                    </span>
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <form action={manualAction} className="bg-white border border-accent rounded-3xl p-7 space-y-4 shadow-sm">
                    <h2 className="text-xl font-black text-primary">Manual Entry</h2>
                    <textarea
                        name="text"
                        required
                        rows={4}
                        className="w-full p-3 rounded-xl border-2 border-accent text-primary font-medium focus:outline-none focus:border-primary"
                        placeholder="Enter question text"
                    />
                    <input name="optionA" required className="w-full p-3 rounded-xl border-2 border-accent" placeholder="Option A" />
                    <input name="optionB" required className="w-full p-3 rounded-xl border-2 border-accent" placeholder="Option B" />
                    <input name="optionC" required className="w-full p-3 rounded-xl border-2 border-accent" placeholder="Option C" />
                    <input name="optionD" required className="w-full p-3 rounded-xl border-2 border-accent" placeholder="Option D" />

                    <div>
                        <label className="block text-sm font-bold text-secondary mb-2">Correct Answer</label>
                        <select
                            name="correctAnswer"
                            required
                            className="w-full p-3 rounded-xl border-2 border-accent bg-white"
                        >
                            <option value="">Select</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-[#5C3C3C]"
                    >
                        Add Question
                    </button>
                </form>

                <form action={csvAction} className="bg-white border border-accent rounded-3xl p-7 space-y-4 shadow-sm">
                    <h2 className="text-xl font-black text-primary">CSV Upload</h2>
                    <p className="text-sm font-medium text-[#6A4D43]">
                        Required headers: questionText, optionA, optionB, optionC, optionD, correctAnswer
                    </p>
                    <input
                        name="csvFile"
                        type="file"
                        accept=".csv,text/csv"
                        required
                        className="w-full p-3 rounded-xl border-2 border-dashed border-[#D8C6BA] bg-[#FBF7F3]"
                    />
                    <button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-[#5C3C3C]"
                    >
                        Upload CSV Questions
                    </button>
                </form>
            </section>

            <section className="bg-white border border-accent rounded-3xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-accent bg-[#F4EFEA]/40">
                    <h3 className="text-lg font-black text-primary">Current Question Bank</h3>
                </div>
                {questions.length === 0 ? (
                    <p className="p-6 text-sm font-semibold text-[#6A4D43]">No questions added yet.</p>
                ) : (
                    <ol className="divide-y divide-accent">
                        {questions.map((question) => (
                            <li key={question.id} className="p-5">
                                <p className="font-bold text-primary">{question.text}</p>
                                <p className="mt-2 text-xs font-semibold text-[#7A6156]">Correct: {question.correctAnswer}</p>
                            </li>
                        ))}
                    </ol>
                )}
            </section>
        </div>
    );
}

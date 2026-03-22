type SuccessPageProps = {
    searchParams: Promise<{ message?: string }>;
};

export default async function PortalSuccessPage({ searchParams }: SuccessPageProps) {
    const params = await searchParams;
    const message =
        params.message ??
        "Exam Submitted Successfully. You may now close this window.";

    return (
        <main className="min-h-screen bg-[#F4EFEA] text-[#2E1F1A] flex items-center justify-center p-6">
            <section className="w-full max-w-2xl bg-white border border-[#CCBBAE] rounded-3xl shadow-xl p-10 text-center">
                <h1 className="text-4xl font-black text-primary">Submission Complete</h1>
                <p className="mt-5 text-lg font-medium text-[#5A3A2E]">{message}</p>
            </section>
        </main>
    );
}
type SuccessPageProps = {
    searchParams: Promise<{ message?: string }>;
};

export default async function PortalSuccessPage({ searchParams }: SuccessPageProps) {
    const params = await searchParams;
    const message =
        params.message ??
        "Exam Submitted Successfully. You may now close this window.";

    return (
        <main className="min-h-screen bg-accent text-primary flex items-center justify-center p-6">
            <section className="w-full max-w-2xl bg-white border border-accent rounded-3xl shadow-xl p-10 text-center">
                <h1 className="text-4xl font-black text-primary">Submission Complete</h1>
                <p className="mt-5 text-lg font-medium text-secondary">{message}</p>
            </section>
        </main>
    );
}
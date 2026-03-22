import Link from "next/link";

export default function GlobalNotFound() {
    return (
        <main className="min-h-screen bg-accent text-primary flex items-center justify-center p-6">
            <section className="w-full max-w-xl bg-white border border-accent rounded-3xl shadow-sm p-8 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary/80">404</p>
                <h1 className="mt-3 text-4xl font-black">Page Not Found</h1>
                <p className="mt-4 text-secondary font-medium">
                    The page you are looking for does not exist or was moved.
                </p>

                <Link
                    href="/"
                    className="inline-flex mt-8 h-12 px-6 items-center justify-center rounded-xl bg-primary text-white font-bold hover:bg-primary/90"
                >
                    Return to Dashboard
                </Link>
            </section>
        </main>
    );
}

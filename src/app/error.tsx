"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
            <body className="min-h-screen bg-accent text-primary flex items-center justify-center p-6">
                <main className="w-full max-w-xl bg-white border border-accent rounded-3xl shadow-sm p-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary/80">Unexpected Error</p>
                    <h1 className="mt-3 text-4xl font-black">Something went wrong</h1>
                    <p className="mt-4 text-secondary font-medium">
                        An unexpected issue interrupted this page. You can retry safely.
                    </p>

                    <button
                        type="button"
                        onClick={reset}
                        className="mt-8 h-12 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary/90"
                    >
                        Try Again
                    </button>
                </main>
            </body>
        </html>
    );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function MonitorAutoRefresh() {
    const router = useRouter();

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            router.refresh();
        }, 5000);

        return () => window.clearInterval(intervalId);
    }, [router]);

    return null;
}

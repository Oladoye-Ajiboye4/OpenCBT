"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    activateStudentSession,
    getWaitingRoomContext,
    setWaitingRoomStatus,
} from "@/app/portal/waiting-room/actions";

type WaitingContext = {
    studentId: string;
    examId: string;
    examTitle: string;
    examStatus: string;
    scheduledDateISO: string;
    courseId: string;
    studentName: string;
};

const POLL_INTERVAL_MS = 3_000;

function formatCountdown(msRemaining: number) {
    if (msRemaining <= 0) {
        return "00:00:00";
    }

    const totalSeconds = Math.floor(msRemaining / 1000);
    const hours = Math.floor(totalSeconds / 3600)
        .toString()
        .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60)
        .toString()
        .padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}

export default function WaitingRoomPage() {
    const router = useRouter();
    const [context, setContext] = useState<WaitingContext | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [cameraStatus, setCameraStatus] = useState<"idle" | "testing" | "granted" | "denied">(
        "idle"
    );
    const [error, setError] = useState("");
    const [nowMs, setNowMs] = useState(0);

    useEffect(() => {
        let active = true;

        const boot = async () => {
            await setWaitingRoomStatus();
            const response = await getWaitingRoomContext();

            if (!active) {
                return;
            }

            if (response?.error) {
                setError(response.error);
                return;
            }

            setContext(response as WaitingContext);
        };

        void boot();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!agreed) {
            return;
        }

        const timerId = window.setInterval(() => {
            setNowMs(Date.now());
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [agreed]);

    useEffect(() => {
        if (!context) {
            return;
        }

        let active = true;

        const pollContext = async () => {
            const response = await getWaitingRoomContext();
            if (!active) {
                return;
            }

            if (response?.error) {
                setError(response.error);
                return;
            }

            const latest = response as WaitingContext;
            setContext(latest);

            if (latest.examStatus === "ACTIVE" && agreed) {
                const activation = await activateStudentSession();
                if (!activation?.error) {
                    router.push("/portal/session");
                }
            }
        };

        void pollContext();

        const pollId = window.setInterval(() => {
            void pollContext();
        }, POLL_INTERVAL_MS);

        const handleFocus = () => {
            void pollContext();
        };

        const handleVisibility = () => {
            if (!document.hidden) {
                void pollContext();
            }
        };

        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            active = false;
            window.clearInterval(pollId);
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [agreed, context, router]);

    const scheduledMs = context ? new Date(context.scheduledDateISO).getTime() : 0;
    const countdown = useMemo(() => formatCountdown(scheduledMs - nowMs), [nowMs, scheduledMs]);

    const testWebcam = async () => {
        setCameraStatus("testing");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach((track) => track.stop());
            setCameraStatus("granted");
        } catch {
            setCameraStatus("denied");
        }
    };

    return (
        <main className="min-h-screen bg-[#F4EFEA] text-[#2E1F1A] p-6 md:p-10">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white rounded-3xl border border-[#CCBBAE] p-8 shadow-sm">
                    <h1 className="text-3xl font-black text-primary tracking-tight">Pre-Flight Guidelines</h1>
                    <p className="mt-2 text-[#6B5146] font-medium">
                        {context ? `Welcome ${context.studentName}.` : "Preparing your session..."} Review and
                        accept all rules before entering the exam hall.
                    </p>

                    <ul className="mt-6 space-y-3 text-sm font-semibold text-primary list-disc pl-5">
                        <li>You must remain in fullscreen mode.</li>
                        <li>Tab switching or exiting the window is tracked and strictly prohibited.</li>
                        <li>Your webcam will record your face and environment continuously using AI.</li>
                        <li>Ensure your room is well-lit.</li>
                    </ul>

                    <div className="mt-8 space-y-4">
                        <button
                            type="button"
                            onClick={testWebcam}
                            disabled={cameraStatus === "testing"}
                            className="h-12 px-5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-[#F2E6DD] transition disabled:opacity-60"
                        >
                            {cameraStatus === "testing" ? "Testing Webcam..." : "Test Webcam"}
                        </button>

                        <p className="text-sm font-medium text-[#6B5146]">
                            {cameraStatus === "granted"
                                ? "Webcam access granted."
                                : cameraStatus === "denied"
                                    ? "Webcam permission denied. Please allow camera access to continue."
                                    : "Run webcam test to verify permission before exam start."}
                        </p>

                        <label className="flex items-start gap-3 p-4 rounded-xl border border-[#D8C7BC] bg-[#FAF6F2]">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(event) => {
                                    const nextValue = event.target.checked;
                                    setAgreed(nextValue);
                                    if (nextValue) {
                                        setNowMs(Date.now());
                                    }
                                }}
                                className="mt-1 w-4 h-4 accent-primary"
                            />
                            <span className="text-sm font-bold text-primary leading-relaxed">
                                I agree to the terms, allow video recording, and understand I am being continuously
                                monitored.
                            </span>
                        </label>
                    </div>

                    {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
                </section>

                <section className="bg-white rounded-3xl border border-[#CCBBAE] p-8 shadow-sm">
                    <h2 className="text-3xl font-black text-primary tracking-tight">Waiting Room</h2>
                    <p className="mt-2 text-[#6B5146] font-medium">
                        Stay on this page. Once the lecturer activates the exam, you will be redirected
                        automatically.
                    </p>

                    <div className="mt-7 p-5 rounded-2xl border border-[#D8C7BC] bg-[#F9F3ED]">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6B5146]">Exam Status</p>
                        <p className="mt-2 text-2xl font-black text-primary">
                            {context?.examStatus ?? "PENDING"}
                        </p>
                        {context?.examTitle ? (
                            <p className="mt-2 text-sm font-semibold text-[#6B5146]">{context.examTitle}</p>
                        ) : null}
                    </div>

                    {agreed ? (
                        <div className="mt-6 p-5 rounded-2xl border border-[#D8C7BC] bg-[#F9F3ED]">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6B5146]">
                                Countdown To Scheduled Start
                            </p>
                            <p className="mt-2 text-5xl font-black text-primary">{countdown}</p>
                        </div>
                    ) : (
                        <p className="mt-6 text-sm font-semibold text-[#6B5146]">
                            Accept the agreement to reveal the start countdown.
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}

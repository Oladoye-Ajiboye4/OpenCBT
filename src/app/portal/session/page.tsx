"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import { useProctoring } from "@/hooks/useProctoring";
import { useVisionProctoring } from "@/hooks/useVisionProctoring";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
    getExamSessionContext,
    logMalpractice,
    pingSession,
    submitFinalExam,
} from "@/app/portal/session/actions";

type Question = {
    id: string;
    text: string;
    options: string[];
    marks: number;
};

type SessionContext = {
    studentId: string;
    examId: string;
    examTitle?: string;
    durationMinutes?: number;
    questions: Question[];
};

const DEFAULT_EXAM_DURATION_SECONDS = 45 * 60;

function toServerAnswerShape(answers: Record<string, number>): Record<string, string> {
    const payload: Record<string, string> = {};
    for (const [questionId, selectedOption] of Object.entries(answers)) {
        payload[questionId] = String(selectedOption);
    }
    return payload;
}

export default function SecureExamSessionPage() {
    const router = useRouter();
    const webcamRef = useRef<Webcam | null>(null);
    const finalizingRef = useRef(false);
    const anomalyLogRef = useRef<Map<string, number>>(new Map());

    const [isStartingExam, setIsStartingExam] = useState(false);
    const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
    const [examStarted, setExamStarted] = useState(false);
    const [submissionReason, setSubmissionReason] = useState<
        "completed" | "time-up" | "malpractice" | null
    >(null);
    const [fullscreenError, setFullscreenError] = useState("");
    const [sessionError, setSessionError] = useState("");
    const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
    const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
    const [timeLeft, setTimeLeft] = useState(DEFAULT_EXAM_DURATION_SECONDS);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});

    const questions = sessionContext?.questions ?? [];

    useEffect(() => {
        let active = true;

        const loadSession = async () => {
            const response = await getExamSessionContext();

            if (!active) {
                return;
            }

            if (response?.error) {
                setSessionError(response.error);
                return;
            }

            if (!response?.studentId || !response?.examId) {
                setSessionError("Invalid session payload.");
                return;
            }

            const context: SessionContext = {
                studentId: response.studentId,
                examId: response.examId,
                examTitle: response.examTitle,
                durationMinutes: response.durationMinutes,
                questions: Array.isArray(response.questions)
                    ? response.questions
                        .filter(
                            (question): question is Question =>
                                typeof question?.id === "string" &&
                                typeof question?.text === "string" &&
                                Array.isArray(question?.options) &&
                                typeof question?.marks === "number"
                        )
                        .map((question) => ({
                            id: question.id,
                            text: question.text,
                            options: question.options,
                            marks: question.marks,
                        }))
                    : [],
            };

            setSessionContext(context);

            if (typeof context.durationMinutes === "number" && context.durationMinutes > 0) {
                setTimeLeft(context.durationMinutes * 60);
            }
        };

        void loadSession();

        return () => {
            active = false;
        };
    }, []);

    const clearSessionSnapshot = useCallback(() => {
        if (!sessionContext) {
            return;
        }

        const key = `opencbt:exam:${sessionContext.examId}:student:${sessionContext.studentId}:answers`;
        window.localStorage.removeItem(key);
    }, [sessionContext]);

    const finalizeExam = useCallback(
        async (reason: "completed" | "time-up" | "malpractice") => {
            if (finalizingRef.current) {
                return;
            }

            finalizingRef.current = true;
            setIsSubmittingFinal(true);
            let finalized = false;

            if (document.fullscreenElement) {
                void document.exitFullscreen();
            }

            if (!sessionContext) {
                setSubmissionReason(reason);
                setIsSubmittingFinal(false);
                return;
            }

            try {
                const result = await submitFinalExam(
                    sessionContext.studentId,
                    sessionContext.examId,
                    toServerAnswerShape(answers)
                );

                if (result?.error) {
                    setSessionError(result.error);
                    setSubmissionReason(reason);
                    return;
                }

                finalized = true;
                clearSessionSnapshot();

                if (reason === "malpractice") {
                    setSubmissionReason("malpractice");
                    return;
                }

                const redirectTo =
                    result.redirectTo ||
                    "/portal/success?message=Exam%20Submitted%20Successfully.%20You%20may%20now%20close%20this%20window.";
                setSubmissionReason(reason);
                setRedirectTarget(redirectTo);
            } catch {
                setSessionError("Final submission failed. Please try again.");
                setSubmissionReason(reason);
            } finally {
                setIsSubmittingFinal(false);
                if (!finalized) {
                    finalizingRef.current = false;
                }
            }
        },
        [answers, clearSessionSnapshot, router, sessionContext]
    );

    useEffect(() => {
        if (!redirectTarget || submissionReason === "malpractice") {
            return;
        }

        router.push(redirectTarget);
    }, [redirectTarget, router, submissionReason]);

    const handleAnomalyEvent = useCallback(
        (payload: { key: string; message: string; scoreDelta: number }) => {
            if (!sessionContext) {
                return;
            }

            const severeAnomalyKeys = new Set(["visibility-hidden", "vision-multiple-faces"]);
            if (!severeAnomalyKeys.has(payload.key)) {
                return;
            }

            const now = Date.now();
            const lastLoggedAt = anomalyLogRef.current.get(payload.key) ?? 0;

            if (now - lastLoggedAt < 10_000) {
                return;
            }

            anomalyLogRef.current.set(payload.key, now);

            const snapshot = webcamRef.current?.getScreenshot({
                width: 320,
                height: 240,
            });

            void logMalpractice(
                sessionContext.studentId,
                sessionContext.examId,
                payload.message,
                snapshot || undefined
            );
        },
        [sessionContext]
    );

    const { malpracticeScore, warnings, activeAnomalies, registerAnomaly } = useProctoring({
        enabled: examStarted && !submissionReason,
        onKillSwitch: () => {
            void finalizeExam("malpractice");
        },
        onAnomalyEvent: handleAnomalyEvent,
    });

    useVisionProctoring({
        enabled: examStarted && !submissionReason,
        webcamRef,
        onAnomaly: registerAnomaly,
    });

    const handleHydrateAnswers = useCallback((restoredAnswers: Record<string, number>) => {
        setAnswers((prev) => {
            const merged = { ...restoredAnswers, ...prev };
            const prevKeys = Object.keys(prev);
            const mergedKeys = Object.keys(merged);

            if (prevKeys.length === mergedKeys.length) {
                const changed = mergedKeys.some(
                    (key) => prev[key] !== merged[key]
                );

                if (!changed) {
                    return prev;
                }
            }

            return merged;
        });
    }, []);

    const { cloudStatus, lastCloudSyncAt, pushToCloud } = useAutoSave({
        enabled:
            examStarted &&
            !submissionReason &&
            Boolean(sessionContext?.studentId) &&
            Boolean(sessionContext?.examId),
        studentId: sessionContext?.studentId ?? "",
        examId: sessionContext?.examId ?? "",
        answers,
        onHydrateAnswers: handleHydrateAnswers,
    });

    useEffect(() => {
        if (!examStarted || submissionReason) {
            return;
        }

        if (timeLeft <= 0) {
            void finalizeExam("time-up");
            return;
        }

        const timerId = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timerId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [examStarted, finalizeExam, submissionReason, timeLeft]);

    useEffect(() => {
        if (!examStarted || submissionReason || !sessionContext) {
            return;
        }

        const sendPing = () => {
            void pingSession(
                sessionContext.studentId,
                sessionContext.examId,
                currentQuestionIndex + 1
            );
        };

        sendPing();

        const heartbeatId = window.setInterval(sendPing, 10_000);

        return () => window.clearInterval(heartbeatId);
    }, [examStarted, currentQuestionIndex, sessionContext, submissionReason]);

    const formattedTime = useMemo(() => {
        const minutes = Math.floor(timeLeft / 60)
            .toString()
            .padStart(2, "0");
        const seconds = (timeLeft % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    }, [timeLeft]);

    const activeQuestion = questions[currentQuestionIndex];

    const securityColor =
        malpracticeScore <= 30
            ? "bg-emerald-500"
            : malpracticeScore <= 70
                ? "bg-amber-500"
                : "bg-red-600";

    const cloudStatusLabel =
        cloudStatus === "saving"
            ? "Saving..."
            : cloudStatus === "saved"
                ? "Saved to Cloud"
                : cloudStatus === "error"
                    ? "Cloud Save Failed"
                    : "Idle";

    const handleStartSecureMode = async () => {
        setFullscreenError("");
        setIsStartingExam(true);

        try {
            await document.documentElement.requestFullscreen();
            setExamStarted(true);
        } catch {
            setFullscreenError(
                "Fullscreen request was blocked. Please allow fullscreen to continue."
            );
        } finally {
            setIsStartingExam(false);
        }
    };

    const handleAnswerSelect = (questionId: string, optionIndex: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmitNow = async () => {
        await pushToCloud();
        await finalizeExam("completed");
    };

    if (submissionReason === "malpractice") {
        return (
            <div className="min-h-screen bg-[#F4EFEA] text-[#2E1F1A] flex items-center justify-center p-6">
                <div className="max-w-xl w-full bg-white border-2 border-red-200 rounded-3xl p-10 text-center shadow-xl">
                    <h1 className="text-4xl font-black text-red-700">Flagged for Malpractice</h1>
                    <p className="mt-4 text-lg text-[#5A3A2E] font-medium">
                        Your exam has been automatically submitted due to repeated security
                        violations.
                    </p>
                    <p className="mt-5 text-sm text-[#7A5A4D]">
                        Total infractions: {warnings.length} | Malpractice score: {malpracticeScore}%
                    </p>
                </div>
            </div>
        );
    }

    if (submissionReason) {
        return (
            <div className="min-h-screen bg-[#F4EFEA] text-[#2E1F1A] flex items-center justify-center p-6">
                <div className="max-w-xl w-full bg-white border border-[#C9B9AE] rounded-3xl p-10 text-center shadow-xl">
                    <h1 className="text-4xl font-black text-primary">Exam Submitted</h1>
                    <p className="mt-4 text-lg text-[#5A3A2E] font-medium">
                        {submissionReason === "time-up"
                            ? "Time has elapsed and your script was auto-submitted."
                            : "Your answers have been submitted successfully."}
                    </p>
                    {sessionError ? (
                        <p className="mt-5 text-sm font-semibold text-red-700">{sessionError}</p>
                    ) : null}
                </div>
            </div>
        );
    }

    if (!examStarted) {
        return (
            <div className="min-h-screen bg-[#F4EFEA] text-[#2E1F1A] flex items-center justify-center p-6">
                <div className="max-w-2xl w-full text-center bg-white border border-[#C9B9AE] rounded-3xl p-10 shadow-xl">
                    <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
                        Secure Examination Mode
                    </h1>
                    <p className="mt-5 text-lg text-[#5D453D] font-medium">
                        This exam requires fullscreen mode with active proctoring. Do not
                        switch tabs, exit fullscreen, or attempt copy/paste operations.
                    </p>
                    {sessionContext?.examTitle ? (
                        <p className="mt-4 text-sm font-bold text-[#6E574D]">
                            Exam: {sessionContext.examTitle}
                        </p>
                    ) : null}
                    {sessionContext && sessionContext.questions.length === 0 ? (
                        <p className="mt-3 text-sm text-red-700 font-semibold">
                            No questions have been configured for this exam yet.
                        </p>
                    ) : null}
                    <button
                        type="button"
                        onClick={handleStartSecureMode}
                        disabled={isStartingExam || Boolean(sessionError)}
                        className="mt-10 w-full h-16 rounded-2xl bg-primary text-[#F8F1EA] text-lg font-black hover:bg-[#3B2727] transition disabled:opacity-60"
                    >
                        {isStartingExam
                            ? "Entering Secure Mode..."
                            : "I am ready. Enter Secure Fullscreen Mode."}
                    </button>
                    {fullscreenError ? (
                        <p className="mt-4 text-sm text-red-700 font-semibold">{fullscreenError}</p>
                    ) : null}
                    {sessionError ? (
                        <p className="mt-4 text-sm text-red-700 font-semibold">{sessionError}</p>
                    ) : null}
                </div>
            </div>
        );
    }

    if (!activeQuestion) {
        return (
            <div className="min-h-screen bg-[#F4EFEA] text-[#2E1F1A] flex items-center justify-center p-6">
                <div className="max-w-xl w-full bg-white border border-[#C9B9AE] rounded-3xl p-10 text-center shadow-xl">
                    <h1 className="text-3xl font-black text-primary">No Questions Available</h1>
                    <p className="mt-4 text-base text-[#5A3A2E] font-medium">
                        This exam has no question bank yet. Please contact your lecturer.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="h-screen overflow-hidden bg-[#F4EFEA] text-[#2E1F1A] p-4 md:p-6">
            <div className="h-full grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-6">
                <section className="lg:col-span-7 h-full bg-white rounded-3xl border border-[#CCBBAE] p-6 md:p-8 flex flex-col">
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-sm font-bold tracking-wide text-[#6E574D]">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                void handleSubmitNow();
                            }}
                            disabled={isSubmittingFinal}
                            className="px-4 py-2 rounded-xl bg-primary text-[#F8F1EA] text-sm font-bold hover:bg-[#3B2727] disabled:opacity-60"
                        >
                            {isSubmittingFinal ? "Submitting..." : "Submit Exam"}
                        </button>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-[#3E2A23] leading-snug">
                        {activeQuestion.text}
                    </h2>

                    <div className="mt-8 space-y-4">
                        {activeQuestion.options.map((option, index) => {
                            const selected = answers[activeQuestion.id] === index;

                            return (
                                <label
                                    key={option}
                                    className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-3 cursor-pointer transition ${selected
                                        ? "border-primary bg-[#EFE3DA]"
                                        : "border-[#E2D4C8] bg-[#FBF7F3] hover:border-[#BCA89B]"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${activeQuestion.id}`}
                                        checked={selected}
                                        onChange={() => handleAnswerSelect(activeQuestion.id, index)}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <span className="text-base font-semibold text-[#3E2A23]">{option}</span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-8 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="h-12 px-6 rounded-xl border-2 border-primary text-primary font-bold disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                            }
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="h-12 px-6 rounded-xl bg-primary text-[#F8F1EA] font-bold disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </section>

                <aside className="lg:col-span-3 h-full bg-white rounded-3xl border border-[#CCBBAE] p-5 flex flex-col gap-4 overflow-hidden">
                    <div className="rounded-2xl border-2 border-primary overflow-hidden bg-[#EDE1D7] h-44 sm:h-52">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            screenshotQuality={0.7}
                            mirrored
                            className="w-full h-full object-cover"
                            videoConstraints={{ facingMode: "user" }}
                        />
                    </div>

                    <div className="rounded-2xl bg-[#F8EFE7] border border-[#D9C9BC] p-4 text-center">
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#6C5248]">Time Left</p>
                        <p className="text-5xl font-black text-primary mt-1">{formattedTime}</p>
                        <p className="mt-2 text-xs font-semibold text-[#6C5248]">{cloudStatusLabel}</p>
                        {lastCloudSyncAt ? (
                            <p className="mt-1 text-[11px] text-[#7F675A]">
                                Last cloud sync: {lastCloudSyncAt.toLocaleTimeString()}
                            </p>
                        ) : null}
                    </div>

                    <div className="rounded-2xl border border-[#D9C9BC] p-4 bg-[#FBF7F3]">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-primary">Security Status</p>
                            <p className="text-sm font-black text-primary">{malpracticeScore}%</p>
                        </div>
                        <div className="h-3 rounded-full bg-[#E8DCD4] overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${securityColor}`}
                                style={{ width: `${malpracticeScore}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-[#6C5248]">Green: 0-30, Yellow: 31-70, Red: 71-99</p>
                        <div className="mt-3 space-y-2 max-h-24 overflow-y-auto">
                            {activeAnomalies.length === 0 ? (
                                <p className="text-xs text-[#7F675A]">No active anomalies detected.</p>
                            ) : (
                                activeAnomalies.map((anomaly) => (
                                    <p
                                        key={anomaly}
                                        className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1"
                                    >
                                        {anomaly}
                                    </p>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#D9C9BC] p-4 bg-[#FBF7F3] min-h-0 flex flex-col">
                        <p className="text-sm font-bold text-primary mb-3">Question Navigator</p>
                        <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-1">
                            {Array.from({ length: questions.length }, (_, i) => {
                                const questionId = i + 1;
                                const resolvedQuestionId = questions[i]?.id;
                                const answered = resolvedQuestionId
                                    ? answers[resolvedQuestionId] !== undefined
                                    : false;
                                const isActive = currentQuestionIndex === i;

                                return (
                                    <button
                                        key={questionId}
                                        type="button"
                                        onClick={() => setCurrentQuestionIndex(i)}
                                        className={`h-9 rounded-lg text-sm font-bold transition ${answered
                                            ? "bg-primary text-[#F8F1EA]"
                                            : "bg-[#D9D4CF] text-primary"
                                            } ${isActive ? "ring-2 ring-[#2E1F1A]" : ""}`}
                                    >
                                        {questionId}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}

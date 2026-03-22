"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { syncExamProgress } from "@/app/portal/session/actions";

type UseAutoSaveOptions = {
    enabled: boolean;
    studentId: string;
    examId: string;
    answers: Record<string, number>;
    onHydrateAnswers: (answers: Record<string, number>) => void;
};

type CloudSyncStatus = "idle" | "saving" | "saved" | "error";

const CLOUD_SYNC_INTERVAL_MS = 60_000;

function toServerShape(answers: Record<string, number>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [questionId, selectedOption] of Object.entries(answers)) {
        result[questionId] = String(selectedOption);
    }
    return result;
}

export function useAutoSave({
    enabled,
    studentId,
    examId,
    answers,
    onHydrateAnswers,
}: UseAutoSaveOptions) {
    const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>("idle");
    const [lastCloudSyncAt, setLastCloudSyncAt] = useState<Date | null>(null);
    const hasPendingRef = useRef(false);

    const storageKey = useMemo(() => {
        if (!studentId || !examId) {
            return "";
        }
        return `opencbt:exam:${examId}:student:${studentId}:answers`;
    }, [examId, studentId]);

    useEffect(() => {
        if (!enabled || !storageKey) {
            return;
        }

        const stored = window.localStorage.getItem(storageKey);
        if (!stored) {
            return;
        }

        try {
            const parsed = JSON.parse(stored) as Record<string, number>;
            const hydrated: Record<string, number> = {};

            for (const [questionId, selectedOption] of Object.entries(parsed)) {
                if (questionId && typeof selectedOption === "number") {
                    hydrated[questionId] = selectedOption;
                }
            }

            onHydrateAnswers(hydrated);
        } catch {
            window.localStorage.removeItem(storageKey);
        }
    }, [enabled, onHydrateAnswers, storageKey]);

    useEffect(() => {
        if (!enabled || !storageKey) {
            return;
        }

        window.localStorage.setItem(storageKey, JSON.stringify(answers));
        hasPendingRef.current = true;
    }, [answers, enabled, storageKey]);

    const pushToCloud = useCallback(async () => {
        if (!enabled || !studentId || !examId || !hasPendingRef.current) {
            return;
        }

        setCloudStatus("saving");

        const result = await syncExamProgress(studentId, examId, toServerShape(answers));

        if (result?.error) {
            setCloudStatus("error");
            return;
        }

        hasPendingRef.current = false;
        setCloudStatus("saved");
        setLastCloudSyncAt(new Date());
    }, [answers, enabled, examId, studentId]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const intervalId = window.setInterval(() => {
            void pushToCloud();
        }, CLOUD_SYNC_INTERVAL_MS);

        const handleOnline = () => {
            void pushToCloud();
        };

        window.addEventListener("online", handleOnline);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("online", handleOnline);
        };
    }, [enabled, pushToCloud]);

    const clearLocalSnapshot = useCallback(() => {
        if (storageKey) {
            window.localStorage.removeItem(storageKey);
        }
        hasPendingRef.current = false;
    }, [storageKey]);

    return {
        cloudStatus,
        lastCloudSyncAt,
        pushToCloud,
        clearLocalSnapshot,
    };
}
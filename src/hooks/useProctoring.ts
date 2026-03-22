"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseProctoringOptions = {
    enabled: boolean;
    onKillSwitch: () => void;
    onAnomalyEvent?: (payload: RegisterAnomalyInput) => void;
};

type RegisterAnomalyInput = {
    key: string;
    message: string;
    scoreDelta: number;
    cooldownMs?: number;
    holdMs?: number;
};

const MAX_SCORE = 100;

export function useProctoring({ enabled, onKillSwitch, onAnomalyEvent }: UseProctoringOptions) {
    const [malpracticeScore, setMalpracticeScore] = useState(0);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [activeAnomalies, setActiveAnomalies] = useState<string[]>([]);
    const killSwitchTriggeredRef = useRef(false);
    const onKillSwitchRef = useRef(onKillSwitch);
    const onAnomalyEventRef = useRef(onAnomalyEvent);
    const cooldownTrackerRef = useRef<Map<string, number>>(new Map());
    const anomalyTimeoutRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        onKillSwitchRef.current = onKillSwitch;
    }, [onKillSwitch]);

    useEffect(() => {
        onAnomalyEventRef.current = onAnomalyEvent;
    }, [onAnomalyEvent]);

    const registerAnomaly = useCallback(
        ({
            key,
            message,
            scoreDelta,
            cooldownMs = 1500,
            holdMs = 12000,
        }: RegisterAnomalyInput) => {
            if (!enabled) {
                return;
            }

            const now = Date.now();
            const lastSeen = cooldownTrackerRef.current.get(key);
            if (typeof lastSeen === "number" && now - lastSeen < cooldownMs) {
                return;
            }
            cooldownTrackerRef.current.set(key, now);

            onAnomalyEventRef.current?.({
                key,
                message,
                scoreDelta,
                cooldownMs,
                holdMs,
            });

            setWarnings((prev) => [...prev, message]);
            setActiveAnomalies((prev) => (prev.includes(message) ? prev : [...prev, message]));

            const existingTimeout = anomalyTimeoutRef.current.get(key);
            if (existingTimeout) {
                window.clearTimeout(existingTimeout);
            }

            const timeoutId = window.setTimeout(() => {
                setActiveAnomalies((prev) => prev.filter((item) => item !== message));
                anomalyTimeoutRef.current.delete(key);
            }, holdMs);

            anomalyTimeoutRef.current.set(key, timeoutId);

            if (scoreDelta <= 0) {
                return;
            }

            setMalpracticeScore((prev) => {
                const nextScore = Math.min(MAX_SCORE, prev + scoreDelta);

                if (nextScore >= MAX_SCORE && !killSwitchTriggeredRef.current) {
                    killSwitchTriggeredRef.current = true;
                    // Defer side effects to avoid triggering state updates during React render.
                    window.setTimeout(() => {
                        onKillSwitchRef.current();
                    }, 0);
                }

                return nextScore;
            });
        },
        [enabled]
    );

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                registerAnomaly({
                    key: "visibility-hidden",
                    message: "Tab switched or window minimized",
                    scoreDelta: 25,
                    holdMs: 15000,
                });
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                registerAnomaly({
                    key: "fullscreen-exit",
                    message: "Exited secure fullscreen",
                    scoreDelta: 15,
                    holdMs: 15000,
                });
            }
        };

        const blockContextMenu = (event: MouseEvent) => {
            event.preventDefault();
        };

        const blockClipboardAction = (event: ClipboardEvent) => {
            event.preventDefault();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("contextmenu", blockContextMenu);
        document.addEventListener("copy", blockClipboardAction);
        document.addEventListener("paste", blockClipboardAction);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("contextmenu", blockContextMenu);
            document.removeEventListener("copy", blockClipboardAction);
            document.removeEventListener("paste", blockClipboardAction);
        };
    }, [enabled, registerAnomaly]);

    useEffect(() => {
        const timeoutMap = anomalyTimeoutRef.current;

        return () => {
            timeoutMap.forEach((timeoutId) => window.clearTimeout(timeoutId));
            timeoutMap.clear();
        };
    }, []);

    return {
        malpracticeScore,
        warnings,
        activeAnomalies,
        registerAnomaly,
    };
}
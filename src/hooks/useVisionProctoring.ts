"use client";

import { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";

type VisionAnomalyPayload = {
    key: string;
    message: string;
    scoreDelta: number;
    holdMs?: number;
};

type UseVisionProctoringOptions = {
    enabled: boolean;
    webcamRef: React.RefObject<Webcam | null>;
    onAnomaly: (payload: VisionAnomalyPayload) => void;
};

const CHECK_INTERVAL_MS = 3000;
const DARKNESS_THRESHOLD = 40;

export function useVisionProctoring({
    enabled,
    webcamRef,
    onAnomaly,
}: UseVisionProctoringOptions) {
    const modelRef = useRef<blazeface.BlazeFaceModel | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const onAnomalyRef = useRef(onAnomaly);

    useEffect(() => {
        onAnomalyRef.current = onAnomaly;
    }, [onAnomaly]);

    useEffect(() => {
        let mounted = true;

        const loadModel = async () => {
            try {
                const model = await blazeface.load();
                if (mounted) {
                    modelRef.current = model;
                }
            } catch {
                onAnomalyRef.current({
                    key: "vision-model-load-failed",
                    message: "Vision proctoring model failed to load",
                    scoreDelta: 0,
                    holdMs: 20000,
                });
            }
        };

        void loadModel();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let cancelled = false;

        const ensureCanvas = () => {
            if (!canvasRef.current) {
                canvasRef.current = document.createElement("canvas");
            }
            return canvasRef.current;
        };

        const analyzeFrame = async () => {
            if (cancelled || !modelRef.current) {
                return;
            }

            const webcam = webcamRef.current;
            const video = webcam?.video;

            if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
                return;
            }

            let predictions: blazeface.NormalizedFace[] = [];

            try {
                predictions = await modelRef.current.estimateFaces(video, false);
            } catch {
                onAnomalyRef.current({
                    key: "vision-prediction-failed",
                    message: "Vision prediction temporarily unavailable",
                    scoreDelta: 0,
                    holdMs: 8000,
                });
                return;
            }

            if (predictions.length === 0) {
                onAnomalyRef.current({
                    key: "vision-no-face",
                    message: "Face not detected. Please look at the screen.",
                    scoreDelta: 10,
                });
            }

            if (predictions.length > 1) {
                onAnomalyRef.current({
                    key: "vision-multiple-faces",
                    message: "Multiple faces detected in the frame!",
                    scoreDelta: 30,
                    holdMs: 16000,
                });
            }

            const canvas = ensureCanvas();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            if (!context) {
                return;
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            let brightnessAccumulator = 0;
            let samples = 0;

            // Sample every 16 bytes to lower CPU usage while still approximating scene luminance.
            for (let index = 0; index < pixels.length; index += 16) {
                const r = pixels[index] ?? 0;
                const g = pixels[index + 1] ?? 0;
                const b = pixels[index + 2] ?? 0;
                brightnessAccumulator += (r + g + b) / 3;
                samples += 1;
            }

            const averageBrightness = samples > 0 ? brightnessAccumulator / samples : 0;

            if (averageBrightness < DARKNESS_THRESHOLD) {
                onAnomalyRef.current({
                    key: "vision-dark-environment",
                    message: "Environment is too dark. Please turn on a light.",
                    scoreDelta: 0,
                });
            }
        };

        const intervalId = window.setInterval(() => {
            void analyzeFrame();
        }, CHECK_INTERVAL_MS);

        void analyzeFrame();

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [enabled, webcamRef]);
}
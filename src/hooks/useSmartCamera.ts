import { useState, useCallback, useRef, useEffect } from 'react';
import { CameraView } from 'expo-camera';
import { poseDetectionService, BackendAnalysisResult } from '../services/PoseDetectionService';
import { Pose } from '../types';
import AppConfig from '../config/appConfig';

interface SmartCameraResult {
    poses: Pose[];
    isDetecting: boolean;
    // Backend Stats
    repCount: number;
    stage: string | null;
    feedback: string[];
    formScore: number;
    resetStats: () => Promise<void>;
    finishWorkoutSession: () => Promise<BackendAnalysisResult | null>;
    isProcessingResults: boolean;
}

export const useSmartCamera = (
    isActive: boolean,
    cameraRef: React.RefObject<any>,
    exerciseId: string = 'push-ups'
): SmartCameraResult => {
    // State
    const [poses, setPoses] = useState<Pose[]>([]); // Will remain empty in streaming mode
    const [isDetecting, setIsDetecting] = useState(false);
    const [isProcessingResults, setIsProcessingResults] = useState(false);

    // Backend Stats State
    const [repCount, setRepCount] = useState(0);
    const [stage, setStage] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string[]>([]);
    const [formScore, setFormScore] = useState(0);

    // Refs for loop control (avoid state updates during capture)
    const isProcessingRef = useRef(false);
    const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
    // Unique ID for the current workout session
    const sessionIdRef = useRef<string>(Date.now().toString());

    // Generate a new session ID when the camera becomes active
    useEffect(() => {
        if (isActive) {
            sessionIdRef.current = Date.now().toString();
        }
    }, [isActive]);


    const runDetectionLoop = useCallback(async () => {
        // If conditions not met, reschedule and try again later
        if (!isActive || !cameraRef.current || isProcessingRef.current) {
            if (isActive) {
                loopTimerRef.current = setTimeout(runDetectionLoop, 100);
            }
            return;
        }

        isProcessingRef.current = true;
        try {
            // 1. Capture Frame - Optimized for server upload speed
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.3, // Reduced from 0.5 for faster upload (30% smaller files)
                base64: true,
                shutterSound: false,
                skipProcessing: true,
                // fastMode disabled - causes crashes with base64 on some devices
            });

            if (!photo || !photo.base64) return;

            // 2. Stream Frame to Backend Server (Fire and Forget)
            if (AppConfig.features.enablePoseDetection) {
                const base64 = photo.base64;
                // We do NOT await this. We let it upload in the background so the loop stays fast.
                poseDetectionService.streamFrame(base64, exerciseId, sessionIdRef.current);
            }
        } catch (err) {
            // Silently catch camera fast-capture errors
        } finally {
            isProcessingRef.current = false;
            // Schedule next frame - We can go faster now since we aren't waiting for the server
            if (isActive) {
                loopTimerRef.current = setTimeout(runDetectionLoop, 300); // ~3 fps - enough for rep counting, saves server processing
            }
        }
    }, [isActive, cameraRef, exerciseId]);

    useEffect(() => {
        if (isActive) {
            setIsDetecting(true);
            setRepCount(0);
            setFeedback([]);
            setFormScore(0);

            // Initialize pose detection service
            poseDetectionService.initialize().then(() => {
                runDetectionLoop();
            });
        } else {
            setIsDetecting(false);
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
            }
        }

        return () => {
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
            }
        };
    }, [isActive, runDetectionLoop]);

    const finishWorkoutSession = useCallback(async () => {
        setIsProcessingResults(true);
        try {
            const result = await poseDetectionService.finishWorkout(sessionIdRef.current);
            setRepCount(result.rep_count);
            setFeedback(result.feedback);
            setFormScore(result.form_score);
            return result; // return the result so the caller gets fresh data
        } catch (e) {
            console.warn("Failed to finish workout session", e);
            setFeedback(["Failed to get results from server."]);
            return null;
        } finally {
            setIsProcessingResults(false);
        }
    }, [exerciseId]);

    const resetStats = useCallback(async () => {
        setRepCount(0);
        setStage(null);
        setFeedback([]);
        setFormScore(0);
        await poseDetectionService.resetStats(exerciseId);
    }, [exerciseId]);

    return {
        poses,
        isDetecting,
        repCount,
        stage,
        feedback,
        formScore,
        resetStats,
        finishWorkoutSession,
        isProcessingResults
    };
};

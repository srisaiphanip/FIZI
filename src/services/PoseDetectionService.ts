/**
 * PoseDetectionService
 * 
 * Handles pose detection by sending frames to the Python backend (MediaPipe).
 * This replaces the on-device TensorFlow.js implementation.
 */

import { Pose, Keypoint } from '../types';

// Use local IP for testing
const POSE_API_URL = "http://localhost:5002"; // Assumes running on same machine or port forwarded

export interface BackendAnalysisResult {
    poses: Pose[];
    rep_count: number;
    stage: string | null;
    feedback: string[];
    form_score: number;
    isReady: boolean;
    error: string | null;
}

class PoseDetectionService {
    private isInitialized: boolean = false;
    private initializationError: string | null = null;

    /**
     * Check if the service is ready
     */
    get isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * Get any initialization error
     */
    get error(): string | null {
        return this.initializationError;
    }

    /**
     * Initialize connection to backend (simple ping)
     */
    async initialize(): Promise<boolean> {
        try {
            console.log('[PoseDetection] Connecting to Python backend...');
            // In a real app, you might want to use the actual device IP if running on a phone
            // For now, localhost is fine if using adb reverse or similar
            const response = await fetch(`${POSE_API_URL}/health`);
            if (response.ok) {
                console.log('[PoseDetection] Connected to backend!');
                this.isInitialized = true;
                this.initializationError = null;
                return true;
            } else {
                throw new Error('Backend responded with error');
            }
        } catch (error: any) {
            console.warn('[PoseDetection] Connection failed (server might be starting):', error.message);
            // We set it to true anyway to allow retries during the loop
            this.isInitialized = true;
            return true;
        }
    }

    /**
     * Detect poses from a base64 image string
     * @param base64Image - Base64 encoded image frame
     * @param exerciseId - The ID of the exercise being performed
     * @returns BackendAnalysisResult containing poses and workout stats
     */
    async detectPose(base64Image: string, exerciseId: string = 'push-ups'): Promise<BackendAnalysisResult> {
        // Default empty result
        const emptyResult: BackendAnalysisResult = {
            poses: [],
            rep_count: 0,
            stage: null,
            feedback: [],
            form_score: 0,
            isReady: this.isInitialized,
            error: null
        };

        if (!this.isInitialized) return emptyResult;

        try {
            const response = await fetch(`${POSE_API_URL}/pose`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image,
                    exerciseId: exerciseId
                }),
            });

            if (!response.ok) return emptyResult;

            const data = await response.json();

            if (data.error) {
                return { ...emptyResult, error: data.error };
            }

            // Map backend keypoints to our Keypoint interface
            const keypoints: Keypoint[] = (data.keypoints || []).map((kp: any) => ({
                name: kp.name,
                x: kp.x, // Normalized 0-1
                y: kp.y, // Normalized 0-1
                z: kp.z,
                score: kp.score
            }));

            // Wrap in Pose object
            const pose: Pose = {
                keypoints: keypoints,
                score: data.score || 0
            };

            return {
                poses: keypoints.length > 0 ? [pose] : [],
                rep_count: data.rep_count || 0,
                stage: data.stage || null,
                feedback: data.feedback || [],
                form_score: (data.score || 0) * 100, // Assuming 0-1 from backend, converting to 0-100 for frontend
                isReady: true,
                error: null
            };

        } catch (error) {
            // console.warn('[PoseDetection] Request failed');
            return emptyResult;
        }
    }

    /**
     * Reset stats for a specific exercise on the backend
     */
    async resetStats(exerciseId: string): Promise<boolean> {
        if (!this.isInitialized) return false;

        try {
            await fetch(`${POSE_API_URL}/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exerciseId }),
            });
            console.log(`[PoseDetection] Stats reset for ${exerciseId}`);
            return true;
        } catch (error) {
            console.warn('[PoseDetection] Reset failed:', error);
            return false;
        }
    }

    /**
     * Clean up
     */
    async dispose(): Promise<void> {
        this.isInitialized = false;
    }
}

export const poseDetectionService = new PoseDetectionService();

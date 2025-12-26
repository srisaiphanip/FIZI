export interface PlanMetrics {
    totalVolume: number; // Total sets x reps
    averageSessionDuration: number;
    weeklyIntensity: number; // 1-10 scale
    targetCalorieBurn?: number;
    expectedProgressPerWeek?: string;
}

export interface UserProgress {
    week: number;
    exerciseId: string;
    completedReps: number;
    targetReps: number;
    weight: number;
    difficulty: 'easy' | 'moderate' | 'hard';
}

export interface PerformancePrediction {
    predictedMaxStrength: number;
    estimatedFatLoss: number; // kg
    estimatedMuscleGain: number; // kg
    injuryRiskScore: number; // 0-100
    recommendedDeloadWeek: number;
}

export interface Point {
    x: number;
    y: number;
    z?: number;
}

export interface Keypoint {
    name: string;
    x: number;
    y: number;
    z?: number;
    score: number;
}

export interface Pose {
    keypoints: Keypoint[];
    score: number;
}

export interface FormCheck {
    name: string;
    description: string;
    severity: 'error' | 'warning' | 'tip';
    checkFunction: (pose: Pose) => boolean;
    feedback: {
        visual: string;
        audio: string;
    };
}

export interface FormValidation {
    isValid: boolean;
    score: number; // 0-100
    errors: {
        severity: 'error' | 'warning' | 'tip';
        message: string;
        visualCue: string;
        audioCue: string;
    }[];
}

export interface Feedback {
    visual: string;
    audio: string;
    haptic?: 'light' | 'medium' | 'heavy';
}

export interface ExerciseStage {
    name: string;
    angleRanges: {
        joint: string;
        min: number;
        max: number;
        optimal: number;
    }[];
    duration?: number;
}

/**
 * Exercise Definition (Database Model)
 */
export interface Exercise {
    id: string;
    name: string;
    category: 'strength' | 'cardio' | 'flexibility';
    muscleGroups: string[];
    keypoints: number[]; // Relevant body landmarks
    stages: ExerciseStage[];
    formChecks: FormCheck[];

    // Extended fields for workout planning
    equipment?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    primaryGoal?: 'strength' | 'hypertrophy' | 'endurance';
    contraindications?: string[];
    alternatives?: string[];

    // Fields from refined generator
    sets?: number;
    reps?: string;
    rest?: number;
    notes?: string;
    modifications?: string[];
    targetMuscle?: string;
    description?: string;
    steps?: string[];
    tips?: string[];
}

/**
 * Exercise Instance in a Workout (Refined)
 */
export interface PlannedExercise {
    exerciseId: string; // Internal system ID
    name: string;      // Display name
    exerciseName?: string; // Legacy field for compatibility
    sets: number;
    reps: string;      // e.g., "8-12", "5", "max"
    rest: number;      // seconds
    notes?: string;
    modifications?: string[];
    completed?: boolean;
    targetMuscle?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    age: number;
    weight: number; // kg
    height: number; // cm

    // Existing fields (maintained for app compatibility)
    fitnessGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility';
    workoutExperience?: 'beginner' | 'intermediate' | 'advanced';
    healthIssues?: string[];
    fitnessAssessment?: {
        pushups: number;
        squats?: number;
        plankSeconds?: number;
    };
    equipmentAccess?: 'bodyweight' | 'home_equipment' | 'gym';
    availableEquipment?: string[];
    workoutPlanId?: string;

    // Refined fields (for generator)
    primaryGoal?: 'weight_loss' | 'muscle_gain' | 'stamina' | 'flexibility';
    experience?: 'beginner' | 'intermediate' | 'advanced';
    maxPushups?: number;
    maxSquats?: number;
    plankDuration?: number;
    injuries?: string[];
    medicalConditions?: string[];
    location?: 'home_bodyweight' | 'home_equipped' | 'gym';
    equipment?: string[];

    createdAt: Date;
    updatedAt: Date;
    bodyMetrics?: {
        chest?: number;
        waist?: number;
        arms?: number;
        legs?: number;
    };
    transformationPhotos: string[];
}

export interface WorkoutSession {
    day: string; // "Monday", etc.
    dayOfWeek: number; // 0-6
    focus: string;
    exercises: PlannedExercise[];
    duration: number; // minutes
    estimatedDuration?: number; // Legacy field for compatibility
    intensity: 'low' | 'moderate' | 'high';
    warmup?: string;
    cooldown?: string;
    notes?: string;
    isRestDay?: boolean;
}

export interface WorkoutPlan {
    id: string; // Firestore ID
    userId: string;
    planLevel: number;
    userProfile: UserProfile;
    planName: string;
    frequency: number; // workouts per week
    duration: number; // weeks
    sessions: WorkoutSession[]; // Replaces weeklySchedule
    progressionStrategy: string;
    metrics: PlanMetrics;
    predictions?: PerformancePrediction;
    nutritionGuidelines?: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

// Legacy aliases for backward compatibility where possible
export type DailyWorkout = WorkoutSession;

export interface WorkoutSessionHistory {
    id: string;
    userId: string;
    exercise: string;
    startTime: Date;
    endTime: Date;
    duration: number; // seconds

    performance: {
        totalReps: number;
        validReps: number;
        invalidReps: number;
        averageFormScore: number;
        caloriesBurned: number;
    };

    formErrors: {
        type: string;
        count: number;
        timestamps: number[];
    }[];

    videoURL?: string;
}

export interface ProgressStats {
    userId: string;
    period: 'daily' | 'weekly' | 'monthly';
    date: string; // YYYY-MM-DD

    totalWorkouts: number;
    totalDuration: number;
    totalReps: number;
    averageFormScore: number;
    caloriesBurned: number;

    exerciseBreakdown: {
        [exerciseId: string]: {
            count: number;
            reps: number;
            duration: number;
        };
    };

    personalRecords?: {
        maxReps?: { exercise: string; count: number; date: string; };
        longestSession?: { duration: number; date: string; };
        bestFormScore?: { score: number; exercise: string; date: string; };
    };
}

export interface TransformationPhoto {
    id: string;
    userId: string;
    photoURL: string;
    uploadDate: Date;
    bodyMetrics: {
        weight: number;
        measurements?: {
            chest?: number;
            waist?: number;
            arms?: number;
            legs?: number;
        };
    };
    workoutsSinceLastPhoto: number;
}

export interface AvatarParameters {
    bodyFat: number; // 0-1
    muscleSize: number; // 0-1
    height: number; // meters
    muscles: {
        chest: number;
        arms: number;
        legs: number;
        core: number;
        back: number;
    };
}

export interface GestureType {
    name: string;
    emoji: string;
}

export interface HandLandmark {
    x: number;
    y: number;
    z: number;
}

export interface DetectionResult {
    gesture: GestureType;
    confidence: number;
    landmarks?: HandLandmark[];
}

export interface ExerciseInstructions {
    exerciseId: string;
    exerciseName: string;
    description: string;
    imageUri: string;
    steps: string[];
    tips: string[];
    lastUpdated?: any;
}

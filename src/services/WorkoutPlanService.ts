import {
    UserProfile,
    WorkoutPlan,
    WorkoutSession,
    PlannedExercise,
    PlanMetrics,
    UserProgress,
    PerformancePrediction,
    Exercise,
    ExerciseInstructions
} from '../types';
import { db } from './firebaseConfig';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    query,
    where,
    getDocs,
    Timestamp
} from 'firebase/firestore';

// ============================================
// LEVEL 1: BASIC PLAN GENERATOR
// ============================================

class Level1PlanGenerator {
    protected exerciseDatabase = this.initializeExerciseDatabase();

    protected initializeExerciseDatabase(): Record<string, PlannedExercise[]> {
        return {
            bodyweight: [
                {
                    exerciseId: 'push-ups',
                    name: 'Push-ups',
                    sets: 3,
                    reps: '8-12',
                    rest: 60,
                    difficulty: 'beginner',
                    targetMuscle: 'chest',
                    modifications: ['Incline push-ups', 'Knee push-ups'],
                },
                {
                    exerciseId: 'squats',
                    name: 'Squats',
                    sets: 3,
                    reps: '12-15',
                    rest: 60,
                    difficulty: 'beginner',
                    targetMuscle: 'legs',
                    modifications: ['Wall sits', 'Assisted squats'],
                },
                {
                    exerciseId: 'plank',
                    name: 'Plank',
                    sets: 3,
                    reps: '30-60 seconds',
                    rest: 45,
                    difficulty: 'beginner',
                    targetMuscle: 'core',
                },
                {
                    exerciseId: 'lunges',
                    name: 'Lunges',
                    sets: 3,
                    reps: '10 each leg',
                    rest: 60,
                    difficulty: 'beginner',
                    targetMuscle: 'legs',
                },
                {
                    exerciseId: 'burpees',
                    name: 'Burpees',
                    sets: 3,
                    reps: '8-10',
                    rest: 90,
                    difficulty: 'intermediate',
                    targetMuscle: 'full_body',
                },
            ],
            dumbbells: [
                {
                    exerciseId: 'db-bench-press',
                    name: 'Dumbbell Bench Press',
                    sets: 4,
                    reps: '8-12',
                    rest: 90,
                    difficulty: 'intermediate',
                    targetMuscle: 'chest',
                },
                {
                    exerciseId: 'db-rows',
                    name: 'Dumbbell Rows',
                    sets: 4,
                    reps: '8-12',
                    rest: 90,
                    difficulty: 'intermediate',
                    targetMuscle: 'back',
                },
                {
                    exerciseId: 'db-squats',
                    name: 'Dumbbell Squats',
                    sets: 3,
                    reps: '10-15',
                    rest: 60,
                    difficulty: 'intermediate',
                    targetMuscle: 'legs',
                },
                {
                    exerciseId: 'db-deadlifts',
                    name: 'Dumbbell Deadlifts',
                    sets: 4,
                    reps: '6-10',
                    rest: 120,
                    difficulty: 'advanced',
                    targetMuscle: 'full_body',
                },
            ],
            gym: [
                {
                    exerciseId: 'bb-bench-press',
                    name: 'Barbell Bench Press',
                    sets: 4,
                    reps: '6-10',
                    rest: 120,
                    difficulty: 'advanced',
                    targetMuscle: 'chest',
                },
                {
                    exerciseId: 'bb-squats',
                    name: 'Barbell Squats',
                    sets: 4,
                    reps: '6-10',
                    rest: 120,
                    difficulty: 'advanced',
                    targetMuscle: 'legs',
                },
                {
                    exerciseId: 'deadlift',
                    name: 'Deadlifts',
                    sets: 3,
                    reps: '3-5',
                    rest: 180,
                    difficulty: 'advanced',
                    targetMuscle: 'full_body',
                },
            ],
        };
    }

    protected determinePlanFrequency(experience: string, goal: string): number {
        // Updated to 6 days/week as per new requirement
        return 6;
    }

    protected calculateBaselineIntensity(
        maxPushups: number,
        maxSquats: number,
        plankDuration: number
    ): 'low' | 'moderate' | 'high' {
        const score = maxPushups + maxSquats + plankDuration / 10;
        if (score < 50) return 'low';
        if (score < 100) return 'moderate';
        return 'high';
    }

    protected getAvailableExercises(location: string, equipment: string[]): PlannedExercise[] {
        let exercises: PlannedExercise[] = [];
        if (location.includes('bodyweight')) {
            exercises = [...this.exerciseDatabase.bodyweight];
        } else if (location === 'gym') {
            exercises = [...this.exerciseDatabase.bodyweight, ...this.exerciseDatabase.gym];
        } else if (location === 'home_equipped') {
            exercises = [...this.exerciseDatabase.bodyweight];
            if (equipment.includes('Dumbbells')) {
                exercises = [...exercises, ...this.exerciseDatabase.dumbbells];
            }
        }
        return exercises;
    }

    protected filterExercisesForLimitations(exercises: PlannedExercise[], injuries: string[]): PlannedExercise[] {
        const restrictedMovements: Record<string, string[]> = {
            'knee pain': ['squats', 'lunges', 'jump'],
            'lower back pain': ['deadlift', 'rows'],
            'shoulder injury': ['push', 'overhead', 'pull'],
        };

        return exercises.filter(exercise => {
            return !injuries.some(injury =>
                (restrictedMovements[injury.toLowerCase()] || []).some(move =>
                    exercise.name.toLowerCase().includes(move)
                )
            );
        });
    }

    protected mapExerciseStrings(exStrings: string[]): PlannedExercise[] {
        return exStrings.map(ex => {
            const [namePart, detailPart] = ex.split(': ');
            // Handle cases where reps might not be in "SetsxReps" format
            const setsPart = detailPart?.includes('x') ? detailPart.split('x')[0] : '3';
            const repsPart = detailPart?.includes('x') ? detailPart.split('x')[1] : (detailPart || '10-12');

            return {
                exerciseId: namePart.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: namePart,
                sets: parseInt(setsPart) || 3,
                reps: repsPart,
                rest: 60,
                completed: false
            };
        });
    }

    protected buildGoalSessions(
        goal: string,
        frequency: number,
        exercises: PlannedExercise[]
    ): WorkoutSession[] {
        const sessions: WorkoutSession[] = [];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const level1Data = [
            { day: 'Monday', focus: 'Upper Body A', duration: 50, exercises: ['Push-ups: 3x8-12', 'Lat Pulldowns: 3x10-12', 'Shoulder Press Machine: 3x10-12', 'Bicep Curls: 3x10-12', 'Tricep Pushdowns: 3x12-15'], notes: 'Focus on form perfection' },
            { day: 'Tuesday', focus: 'Lower Body A', duration: 50, exercises: ['Bodyweight Squats: 3x12-15', 'Leg Press Machine: 3x12-15', 'Lunges: 3x10 each leg', 'Leg Curl Machine: 3x12-15', 'Calf Raises: 3x15-20'], notes: 'Control every rep' },
            { day: 'Wednesday', focus: 'Upper Body B', duration: 50, exercises: ['Chest Dips (Assisted): 3x6-10', 'Bodyweight Rows: 3x8-12', 'Lateral Raises: 3x12-15', 'Barbell Curls: 3x10-12', 'Overhead Tricep Extension: 3x12-15'], notes: 'Increase volume from Monday' },
            { day: 'Thursday', focus: 'Lower Body B', duration: 50, exercises: ['Leg Extensions: 3x12-15', 'Bulgarian Split Squats: 3x10 each', 'Leg Curl: 3x8-12', 'Adductor Machine: 3x15-20', 'Calf Raises: 3x15-20'], notes: 'Unilateral focus for balance' },
            { day: 'Friday', focus: 'Full Body Strength', duration: 55, exercises: ['Compound Push (Push-ups/Dips): 3x6-10', 'Compound Pull (Rows): 3x6-10', 'Squats: 3x8-12', 'Plank: 3x45-60 sec', 'Burpees: 3x8-10'], notes: 'Heavy compound movements' },
            { day: 'Saturday', focus: 'Recovery & Cardio', duration: 40, exercises: ['Light Stretching: 10 min', 'Walking/Jogging: 20 min', 'Core Work: 10 min', 'Mobility: 10 min'], notes: 'Active recovery day' },
        ];

        level1Data.forEach((data) => {
            const dayOfWeek = dayNames.indexOf(data.day);
            sessions.push({
                day: data.day,
                dayOfWeek,
                focus: data.focus,
                exercises: this.mapExerciseStrings(data.exercises),
                duration: data.duration,
                intensity: 'moderate',
                warmup: '5 min dynamic warm-up',
                cooldown: '5 min stretching',
                notes: data.notes
            });
        });

        return sessions;
    }

    protected calculateMetrics(sessions: WorkoutSession[], frequency: number): PlanMetrics {
        const totalVolume = sessions.reduce((sum, session) => {
            return sum + session.exercises.reduce((exSum, ex) => {
                const reps = parseInt(ex.reps.split('-')[0]) || 10;
                return exSum + ex.sets * reps;
            }, 0);
        }, 0);

        return {
            totalVolume,
            averageSessionDuration: sessions.length > 0 ? Math.round(
                sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
            ) : 0,
            weeklyIntensity: frequency > 3 ? 7 : 5,
            expectedProgressPerWeek: 'Gradual improvement in form and stamina',
        };
    }

    public generatePlan(userId: string, profile: UserProfile): WorkoutPlan {
        const frequency = this.determinePlanFrequency(profile.experience || 'beginner', profile.primaryGoal || 'weight_loss');
        let exercises = this.getAvailableExercises(profile.location || 'home_bodyweight', profile.equipment || []);
        exercises = this.filterExercisesForLimitations(exercises, [
            ...(profile.injuries || []),
            ...(profile.medicalConditions || []),
        ]);

        const sessions = this.buildGoalSessions(profile.primaryGoal || 'weight_loss', frequency, exercises);
        const metrics = this.calculateMetrics(sessions, frequency);

        return {
            id: '',
            userId,
            planLevel: 1,
            userProfile: profile,
            planName: `LEVEL 1 - ${(profile.experience || 'BEGINNER').toUpperCase()} - ${(profile.primaryGoal || 'WEIGHT LOSS').replace('_', ' ').toUpperCase()}`,
            frequency,
            duration: 12,
            sessions,
            progressionStrategy: 'Focus on proper form. Increase reps each week.',
            metrics,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };
    }
}

// ============================================
// LEVEL 2: ADVANCED SELECTION & PERIODIZATION
// ============================================

class Level2PlanGenerator extends Level1PlanGenerator {
    protected initializeExerciseDatabase(): Record<string, PlannedExercise[]> {
        const base = super.initializeExerciseDatabase();
        return {
            ...base,
            dumbbells: [
                ...base.dumbbells,
                {
                    exerciseId: 'db-flyes',
                    name: 'Dumbbell Flyes',
                    sets: 3,
                    reps: '12-15',
                    rest: 60,
                    difficulty: 'intermediate',
                    targetMuscle: 'chest',
                },
                {
                    exerciseId: 'db-raises',
                    name: 'Dumbbell Lateral Raises',
                    sets: 3,
                    reps: '12-15',
                    rest: 45,
                    difficulty: 'intermediate',
                    targetMuscle: 'shoulders',
                },
            ],
        };
    }

    protected buildGoalSessions(goal: string, frequency: number, exercises: PlannedExercise[]): WorkoutSession[] {
        const sessions: WorkoutSession[] = [];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const level2Data = [
            { day: 'Monday', focus: 'Upper Body Push A', duration: 60, exercises: ['Dumbbell Bench Press: 4x8-12', 'Incline Dumbbell Press: 3x8-12', 'Dumbbell Flyes: 3x12-15', 'Lateral Raises: 3x12-15', 'Tricep Rope Pushdowns: 3x12-15'], notes: 'Strength phase - moderate weight' },
            { day: 'Tuesday', focus: 'Lower Body A', duration: 60, exercises: ['Dumbbell Squats: 4x10-15', 'Bulgarian Split Squats: 3x10 each', 'Leg Curl Machine: 3x8-12', 'Leg Extensions: 3x10-15', 'Calf Raises: 3x15-20'], notes: 'Volume phase - multiple angles' },
            { day: 'Wednesday', focus: 'Upper Body Pull A', duration: 60, exercises: ['Dumbbell Rows: 4x8-12', 'Lat Pulldowns (Wide Grip): 3x8-12', 'Face Pulls: 3x12-15', 'Barbell Curls: 4x8-12', 'Hammer Curls: 3x10-12'], notes: 'Back + bicep focus' },
            { day: 'Thursday', focus: 'Upper Body Push B', duration: 60, exercises: ['Machine Chest Press: 4x10-12', 'Cable Flyes: 3x12-15', 'Dumbbell Shoulder Press: 4x8-12', 'Machine Lateral Raises: 3x12-15', 'Dips: 3x8-12'], notes: 'Hypertrophy phase - higher reps' },
            { day: 'Friday', focus: 'Lower Body B', duration: 60, exercises: ['Leg Press Machine: 4x10-15', 'Romanian Deadlifts: 3x8-12', 'Hack Squats: 3x8-12', 'Leg Curl: 4x8-12', 'Adductors/Abductors: 3x15-20'], notes: 'Machine-based lower body work' },
            { day: 'Saturday', focus: 'Full Body + Conditioning', duration: 50, exercises: ['Compound Push: 3x8-10', 'Compound Pull: 3x8-10', 'Compound Leg: 3x8-10', 'Core Circuit: 3 rounds', 'Light Cardio: 10 min'], notes: 'Light weight, high volume' },
        ];

        level2Data.forEach((data) => {
            const dayOfWeek = dayNames.indexOf(data.day);
            sessions.push({
                day: data.day,
                dayOfWeek,
                focus: data.focus,
                exercises: this.mapExerciseStrings(data.exercises),
                duration: data.duration,
                intensity: 'high',
                notes: data.notes
            });
        });

        return sessions;
    }

    public generatePlan(userId: string, profile: UserProfile): WorkoutPlan {
        const plan = super.generatePlan(userId, profile);
        plan.planLevel = 2;
        plan.planName = `LEVEL 2 - ${(profile.experience || 'BEGINNER').toUpperCase()} - PERIODIZED`;
        plan.progressionStrategy = 'Linear periodization: increase weight/reps every 2 weeks.';
        plan.metrics.weeklyIntensity = 7;
        return plan;
    }
}

// ============================================
// LEVEL 3: RECOVERY PROTOCOLS
// ============================================

class Level3PlanGenerator extends Level2PlanGenerator {
    protected buildGoalSessions(goal: string, frequency: number, exercises: PlannedExercise[]): WorkoutSession[] {
        const sessions: WorkoutSession[] = [];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const level3Data = [
            { day: 'Monday', focus: 'Push Day (Strength)', duration: 65, exercises: ['Barbell Bench Press: 4x6-8', 'Incline Barbell Press: 3x8-10', 'Dumbbell Bench Press: 3x8-12', 'Machine Shoulder Press: 3x8-12', 'Close Grip Bench Press: 3x8-10', 'Tricep Rope Pushdowns: 3x10-12'], notes: 'Heavy strength focus - 2 min rest' },
            { day: 'Tuesday', focus: 'Pull Day (Strength)', duration: 65, exercises: ['Barbell Rows: 4x6-8', 'Weighted Pull-ups: 4x6-8', 'Chest-Supported Rows: 3x8-12', 'Lat Pulldowns: 3x8-12', 'Barbell Curls: 3x8-10', 'Face Pulls: 3x12-15'], notes: 'Posterior chain emphasis' },
            { day: 'Wednesday', focus: 'Legs Day (Strength)', duration: 70, exercises: ['Barbell Squats: 4x6-8', 'Deadlifts: 3x3-5', 'Leg Press Machine: 3x8-12', 'Leg Curl: 4x8-12', 'Leg Extensions: 3x10-15', 'Calf Raises: 3x12-15'], notes: 'King of exercises - proper form' },
            { day: 'Thursday', focus: 'Push Day (Hypertrophy)', duration: 60, exercises: ['Dumbbell Bench Press: 4x8-12', 'Incline Dumbbell Press: 3x10-12', 'Pec Deck Machine: 3x12-15', 'Dumbbell Shoulder Press: 3x10-12', 'Machine Lateral Raises: 3x12-15', 'Rope Pushdowns: 3x12-15'], notes: '60-90 sec rest - muscle building' },
            { day: 'Friday', focus: 'Pull Day (Hypertrophy)', duration: 60, exercises: ['Dumbbell Rows: 4x8-12', 'Assisted Pull-ups: 4x8-12', 'Machine Row: 3x10-12', 'Cable Lat Pulldown: 3x10-12', 'Dumbbell Curls: 3x10-12', 'Reverse Flyes: 3x12-15'], notes: 'Higher reps for pump' },
            { day: 'Saturday', focus: 'Legs (Hypertrophy/Accessories)', duration: 65, exercises: ['Leg Press: 4x8-12', 'Hack Squats: 3x10-12', 'Leg Curl: 4x10-12', 'Leg Extensions: 3x12-15', 'Bulgarian Split Squats: 3x10 each', 'Calf Raises: 3x15-20'], notes: 'Volume + weak point focus' }
        ];

        level3Data.forEach((data) => {
            const dayOfWeek = dayNames.indexOf(data.day);
            sessions.push({
                day: data.day,
                dayOfWeek,
                focus: data.focus,
                exercises: this.mapExerciseStrings(data.exercises),
                duration: data.duration,
                intensity: 'high',
                warmup: '15 min dynamic warm-up + mobility work',
                cooldown: '10 min cool-down + stretching',
                notes: data.notes,
            });
        });

        return sessions;
    }

    public generatePlan(userId: string, profile: UserProfile): WorkoutPlan {
        const plan = super.generatePlan(userId, profile);
        plan.planLevel = 3;
        plan.planName = `LEVEL 3 - ${(profile.experience || 'INTERMEDIATE').toUpperCase()} - RECOVERY OPTIMIZED`;
        plan.progressionStrategy = 'Undulating periodization: variety in rep ranges weekly.';
        plan.metrics.weeklyIntensity = 8;
        return plan;
    }
}

// ============================================
// LEVEL 4: AI ADAPTATION
// ============================================

class Level4PlanGenerator extends Level3PlanGenerator {
    protected buildGoalSessions(goal: string, frequency: number, exercises: PlannedExercise[]): WorkoutSession[] {
        const sessions: WorkoutSession[] = [];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const level4Data = [
            { day: 'Monday', focus: 'Upper Body A (AI-Optimized)', duration: 60, exercises: ['Primary Push (AI-selected): 4 sets', 'Secondary Push (Variation): 3 sets', 'Isolation Exercise 1: 3 sets', 'Isolation Exercise 2: 3 sets', 'Accessory Work: 3 sets', 'Core: 2 sets'], notes: 'AI selects based on weak points & recovery' },
            { day: 'Tuesday', focus: 'Lower Body A (Performance-Optimized)', duration: 65, exercises: ['Primary Leg Exercise: 4 sets', 'Secondary Leg Exercise: 3 sets', 'Hamstring Isolation: 3 sets', 'Quad Isolation: 3 sets', 'Accessory (Glutes/Calves): 3 sets', 'Core: 2 sets'], notes: 'Real-time intensity adjustment' },
            { day: 'Wednesday', focus: 'Upper Body B (Adaptive-Loading)', duration: 60, exercises: ['Primary Pull (AI-selected): 4 sets', 'Secondary Pull (Variation): 3 sets', 'Isolation Exercise 1: 3 sets', 'Isolation Exercise 2: 3 sets', 'Accessory Work: 3 sets', 'Core: 2 sets'], notes: 'Auto-adjusts based on HRV & sleep' },
            { day: 'Thursday', focus: 'Upper Body C (Weak Point Focus)', duration: 60, exercises: ['Weak Point Exercise 1: 4 sets', 'Weak Point Exercise 2: 4 sets', 'Supporting Exercise 1: 3 sets', 'Supporting Exercise 2: 3 sets', 'Accessory: 2 sets', 'Core: 2 sets'], notes: 'AI targets identified weak points' },
            { day: 'Friday', focus: 'Lower Body B (Recovery-Based)', duration: 60, exercises: ['Primary Compound: 4 sets', 'Secondary Compound: 3 sets', 'Hypertrophy Work: 3 sets', 'Isolation 1: 3 sets', 'Isolation 2: 3 sets', 'Core/Conditioning: 2 sets'], notes: 'Intensity scaled by recovery score' },
            { day: 'Saturday', focus: 'Full Body Finisher (AI-Customized)', duration: 50, exercises: ['Compound Push: 3 sets', 'Compound Pull: 3 sets', 'Compound Leg: 3 sets', 'Weak Point Accessory: 2 sets', 'Cardio Finisher: 10 min'], notes: 'Light weight, high engagement, fun' }
        ];

        level4Data.forEach((data) => {
            const dayOfWeek = dayNames.indexOf(data.day);
            sessions.push({
                day: data.day,
                dayOfWeek,
                focus: data.focus,
                exercises: this.mapExerciseStrings(data.exercises),
                duration: data.duration,
                intensity: 'high',
                notes: data.notes
            });
        });

        return sessions;
    }

    public generatePlan(userId: string, profile: UserProfile): WorkoutPlan {
        const plan = super.generatePlan(userId, profile);
        plan.planLevel = 4;
        plan.planName = `LEVEL 4 - ${(profile.experience || 'ADVANCED').toUpperCase()} - AI-ADAPTIVE`;
        plan.progressionStrategy = 'AI-Powered: real-time adjustment based on RPE and completion rates.';
        plan.metrics.weeklyIntensity = 9;
        return plan;
    }
}

// ============================================
// LEVEL 5: ML-OPTIMIZED ECOSYSTEM
// ============================================

class Level5PlanGenerator extends Level4PlanGenerator {
    protected predictPerformance(profile: UserProfile): PerformancePrediction {
        return {
            predictedMaxStrength: (profile.maxSquats || 60) * 1.15,
            estimatedFatLoss: profile.primaryGoal === 'weight_loss' ? (profile.weight || 80) * 0.08 : 0,
            estimatedMuscleGain: profile.primaryGoal === 'muscle_gain' ? (profile.weight || 80) * 0.05 : 0,
            injuryRiskScore: 15,
            recommendedDeloadWeek: 4,
        };
    }

    protected buildGoalSessions(goal: string, frequency: number, exercises: PlannedExercise[]): WorkoutSession[] {
        const sessions: WorkoutSession[] = [];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const level5Data = [
            { day: 'Monday', focus: 'Push (ML Predicted Volume)', duration: 65, exercises: ['Primary Barbell Movement: 4-5 sets (ML-predicted reps)', 'Secondary Push Variation: 3-4 sets', 'Hypertrophy Isolation 1: 3-4 sets', 'Hypertrophy Isolation 2: 3-4 sets', 'Accessories (ML-selected): 2-3 sets', 'Core/Conditioning: 2 sets'], notes: 'Volume predicted by ML + wearable data' },
            { day: 'Tuesday', focus: 'Pull (Wearable Data Synced)', duration: 65, exercises: ['Primary Pull Compound: 4-5 sets (HRV-adjusted)', 'Secondary Pull Variation: 3-4 sets', 'Lat Isolation: 3-4 sets', 'Bicep Isolation: 3-4 sets', 'Rear Delt Work: 2-3 sets', 'Core: 2 sets'], notes: 'Intensity based on HRV, sleep quality, HR' },
            { day: 'Wednesday', focus: 'Legs (HRV-Based Intensity)', duration: 70, exercises: ['Primary Lower (Adjusted by HRV): 4-5 sets', 'Secondary Lower: 3-4 sets', 'Quad Isolation: 3-4 sets', 'Hamstring Isolation: 3-4 sets', 'Accessory (Glutes/Calves): 2-3 sets', 'Core: 2 sets'], notes: 'Form analysis + tempo auto-adjusted' },
            { day: 'Thursday', focus: 'Upper (Predictive Form Analysis)', duration: 65, exercises: ['Compound Push/Pull Variation: 4 sets', 'Secondary Movement: 3-4 sets', 'Isolation 1 (ML-selected): 3-4 sets', 'Isolation 2 (Weak Point): 3-4 sets', 'Accessories: 2-3 sets', 'Conditioning: 2 sets'], notes: 'Real-time form feedback + corrections' },
            { day: 'Friday', focus: 'Lower (ML Recovery Optimized)', duration: 65, exercises: ['Primary Compound: 4-5 sets (fatigue-adjusted)', 'Secondary Compound: 3-4 sets', 'Hypertrophy Work: 3-4 sets', 'Isolation 1: 3 sets', 'Isolation 2: 3 sets', 'Conditioning: 2 sets'], notes: 'Volume auto-reduced if recovery poor' },
            { day: 'Saturday', focus: 'Full Body (Personalized Weak Points)', duration: 60, exercises: ['Weak Point 1 (ML-identified): 4 sets', 'Weak Point 2 (ML-identified): 4 sets', 'Compound Movement: 3 sets', 'Accessory Push: 3 sets', 'Accessory Pull: 3 sets', 'HIIT/Conditioning: 10 min'], notes: 'ML predicts optimal rep ranges & tempo' }
        ];

        level5Data.forEach((data) => {
            const dayOfWeek = dayNames.indexOf(data.day);
            sessions.push({
                day: data.day,
                dayOfWeek,
                focus: data.focus,
                exercises: this.mapExerciseStrings(data.exercises),
                duration: data.duration,
                intensity: 'high',
                notes: data.notes
            });
        });

        return sessions;
    }

    public generatePlan(userId: string, profile: UserProfile): WorkoutPlan {
        let plan = super.generatePlan(userId, profile) as any;
        plan.planLevel = 5;
        plan.planName = `LEVEL 5 - ${(profile.experience || 'ADVANCED').toUpperCase()} - ML-OPTIMIZED`;

        const predictions = this.predictPerformance(profile);
        plan.predictions = predictions;
        plan.nutritionGuidelines = profile.primaryGoal === 'weight_loss' ? 'High protein, caloric deficit.' : 'High carb, surplus.';
        plan.progressionStrategy = `ML-Optimized: Predictive injury prevention. Forecasted strength: +${Math.round(predictions.predictedMaxStrength - (profile.maxSquats || 60))}kg.`;

        return plan;
    }
}

// ============================================
// MAIN SERVICE FACADE
// ============================================

class WorkoutPlanService {
    private generators = {
        1: new Level1PlanGenerator(),
        2: new Level2PlanGenerator(),
        3: new Level3PlanGenerator(),
        4: new Level4PlanGenerator(),
        5: new Level5PlanGenerator(),
    };

    public generateWorkoutPlan(userProfile: UserProfile, forcedLevel?: number): WorkoutPlan {
        // Map app profile to generator expected fields
        const profile: UserProfile = {
            ...userProfile,
            primaryGoal: userProfile.primaryGoal || (userProfile.fitnessGoal as any) || 'weight_loss',
            experience: userProfile.experience || userProfile.workoutExperience || 'beginner',
            maxPushups: userProfile.maxPushups || userProfile.fitnessAssessment?.pushups || 10,
            maxSquats: userProfile.maxSquats || userProfile.fitnessAssessment?.squats || 20,
            plankDuration: userProfile.plankDuration || userProfile.fitnessAssessment?.plankSeconds || 30,
            injuries: userProfile.injuries || userProfile.healthIssues || [],
            medicalConditions: userProfile.medicalConditions || [],
            location: userProfile.location || (userProfile.equipmentAccess === 'bodyweight' ? 'home_bodyweight' : 'home_equipped'),
            equipment: userProfile.equipment || userProfile.availableEquipment || [],
        };

        let level = forcedLevel || 1;
        if (!forcedLevel) {
            if (profile.experience === 'advanced') level = 5;
            else if (profile.experience === 'intermediate') level = 3;
            else if ((profile.maxPushups || 0) > 30) level = 2;
        }

        return this.generators[level as keyof typeof this.generators].generatePlan(profile.uid, profile);
    }

    async saveWorkoutPlan(plan: WorkoutPlan): Promise<string> {
        try {
            const planRef = doc(collection(db, 'workout_plans'));
            const planWithId = { ...plan, id: planRef.id, updatedAt: new Date() };
            const plainPlan = JSON.parse(JSON.stringify(planWithId));
            await setDoc(planRef, plainPlan);
            return planRef.id;
        } catch (error) {
            console.error('Error saving workout plan:', error);
            throw error;
        }
    }

    async getUserWorkoutPlan(userId: string): Promise<WorkoutPlan | null> {
        try {
            const plansRef = collection(db, 'workout_plans');
            const q = query(plansRef, where('userId', '==', userId), where('isActive', '==', true));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) return null;
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            } as WorkoutPlan;
        } catch (error) {
            console.error('Error getting user workout plan:', error);
            return null;
        }
    }

    async updateExerciseCompletion(planId: string, dayOfWeek: number, exerciseId: string, completed: boolean): Promise<boolean> {
        try {
            const planRef = doc(db, 'workout_plans', planId);
            const planSnap = await getDoc(planRef);
            if (!planSnap.exists()) return false;
            const plan = planSnap.data() as WorkoutPlan;
            const session = plan.sessions.find(s => s.dayOfWeek === dayOfWeek);
            if (session) {
                const exercise = session.exercises.find(e => e.exerciseId === exerciseId);
                if (exercise) {
                    exercise.completed = completed;
                    await updateDoc(planRef, { sessions: plan.sessions });
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error updating exercise completion:', error);
            return false;
        }
    }

    async getExerciseInstructions(exerciseId: string): Promise<ExerciseInstructions | null> {
        try {
            const instructionsRef = doc(db, 'exercise_instructions', exerciseId);
            const docSnap = await getDoc(instructionsRef);
            if (docSnap.exists()) {
                return docSnap.data() as ExerciseInstructions;
            }
            return null;
        } catch (error) {
            console.error('Error getting exercise instructions:', error);
            return null;
        }
    }

    async seedInstructions(instructions: ExerciseInstructions[]): Promise<void> {
        try {
            for (const item of instructions) {
                const docRef = doc(db, 'exercise_instructions', item.exerciseId);
                await setDoc(docRef, { ...item, lastUpdated: Timestamp.now() });
            }
            console.log('Successfully seeded instructions');
        } catch (error) {
            console.error('Error seeding instructions:', error);
            throw error;
        }
    }
}

export const workoutPlanService = new WorkoutPlanService();

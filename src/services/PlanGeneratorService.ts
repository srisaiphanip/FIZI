import {
    UserProfile,
    WorkoutPlan,
    WorkoutSession,
    PlannedExercise,
    Exercise,
    PlanMetrics
} from '../types';
import { exercises } from '../models/exercises';

export class PlanGeneratorService {
    /**
     * Generates a personalized workout plan based on the user's profile
     */
    static generatePlan(userId: string, profile: UserProfile): WorkoutPlan {
        // Robustness: Ensure profile has necessary nested objects
        const safeProfile: UserProfile = {
            ...profile,
            progressSystem: profile.progressSystem || {
                currentLevel: profile.level || 1,
                currentXP: profile.xp || 0,
                levelProgress: ((profile.xp || 0) % 1000) / 10,
                totalWorkouts: profile.totalWorkouts || 0,
                achievements: []
            },
            fitnessProfile: profile.fitnessProfile || {
                equipmentAccess: 'bodyweight',
                availableEquipment: [],
                experienceLevel: 'beginner',
                fitnessGoals: ['Weight Loss'],
                healthIssues: [],
                availableDays: 3
            }
        };

        const availableExercises = this.filterExercises(safeProfile);
        const sessions = this.createSessions(safeProfile, availableExercises);
        const metrics = this.calculateMetrics(sessions);

        return {
            id: `plan_${Date.now()}`,
            userId,
            name: `${profile.fitnessProfile.fitnessGoals[0] || 'Fitness'} Plan`,
            description: `A customized ${profile.fitnessProfile.experienceLevel} plan focusing on ${profile.fitnessProfile.fitnessGoals.join(', ')}.`,
            sessions,
            metrics,
            difficulty: profile.fitnessProfile.experienceLevel,
            frequency: profile.fitnessProfile.availableDays,
            duration: 4, // 4 weeks
            startDate: new Date(),
            endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks
            status: 'active',
            isActive: true,
            levelRequirement: profile.progressSystem.currentLevel
        };
    }

    /**
     * Filters exercises based on user's equipment and level
     */
    private static filterExercises(profile: UserProfile): Exercise[] {
        const { equipmentAccess } = profile.fitnessProfile;
        const availableEquipment = profile.fitnessProfile.availableEquipment || [];
        const { currentLevel } = profile.progressSystem;

        const filtered = exercises.filter(ex => {
            // 1. Level check
            const isUnlocked = ex.unlockLevel <= currentLevel;
            if (!isUnlocked) return false;

            // 2. Granular Equipment check
            if (equipmentAccess === 'gym') return true;

            const hasRequiredItems = ex.requiredEquipment.length === 0 ||
                ex.requiredEquipment.every(req => availableEquipment.includes(req));

            if (!hasRequiredItems) return false;

            // 3. High-level category fallback
            return this.checkEquipmentMatch(equipmentAccess, ex.equipmentRequired);
        });

        // Safety Fallback: If no exercises found (e.g. data mismatch), 
        // return at least basic bodyweight exercises
        if (filtered.length === 0) {
            console.warn('[PlanGenerator] No exercises matched filters. Using bodyweight fallback.');
            return exercises.filter(ex => ex.equipmentRequired === 'bodyweight' && ex.unlockLevel <= currentLevel);
        }

        return filtered;
    }

    private static checkEquipmentMatch(userAccess: 'bodyweight' | 'home' | 'gym', exerciseReq: 'bodyweight' | 'home' | 'gym'): boolean {
        if (userAccess === 'gym') return true; // Gym access includes everything
        if (userAccess === 'home') return exerciseReq !== 'gym'; // Home access includes bodyweight and home
        return exerciseReq === 'bodyweight'; // Bodyweight only
    }

    /**
     * Creates sessions based on available days and goals
     */
    private static createSessions(profile: UserProfile, availableExercises: Exercise[]): WorkoutSession[] {
        const sessions: WorkoutSession[] = [];
        const { availableDays } = profile.fitnessProfile;

        // Simple 28-day schedule based on frequency
        for (let i = 0; i < 28; i++) {
            const dayOfWeek = i % 7;
            // Distribute workouts across the week
            const isWorkoutDay = this.isWorkoutDay(dayOfWeek, availableDays);

            if (isWorkoutDay) {
                sessions.push({
                    id: `session_${i}`,
                    day: i + 1,
                    dayOfWeek: i % 7,
                    title: `Full Body Workout - Day ${i + 1}`,
                    focus: profile.fitnessProfile.fitnessGoals[0] || 'Full Body Strength',
                    exercises: this.selectExercisesForSession(profile, availableExercises),
                    status: 'scheduled',
                    type: 'strength',
                    duration: 45,
                    isRestDay: false
                });
            } else {
                sessions.push({
                    id: `rest_${i}`,
                    day: i + 1,
                    dayOfWeek: i % 7,
                    title: 'Rest & Recovery',
                    focus: 'Rest & Recovery',
                    exercises: [],
                    status: 'completed',
                    type: 'rest',
                    duration: 0,
                    isRestDay: true,
                    notes: 'Take today to recover and prepare for your next workout.'
                });
            }
        }

        return sessions;
    }

    private static isWorkoutDay(day: number, frequency: number): boolean {
        // If user wants rest ONLY on Sunday, they need a 6-day frequency.
        // But we'll try to honor Saturday as a workout day for everyone.

        if (frequency >= 6) return day !== 0; // 6 days: Rest on Sunday

        // Custom distribution that favors Saturday (day 6) and keeps Sunday (day 0) as rest
        switch (frequency) {
            case 5: return [1, 2, 4, 5, 6].includes(day); // Mon, Tue, Thu, Fri, Sat (Rest: Wed, Sun)
            case 4: return [1, 2, 4, 6].includes(day);    // Mon, Tue, Thu, Sat (Rest: Wed, Fri, Sun)
            case 3: return [1, 3, 6].includes(day);       // Mon, Wed, Sat (Rest: Tue, Thu, Fri, Sun)
            case 2: return [2, 6].includes(day);          // Tue, Sat
            case 1: return day === 6;                     // Sat
            default: return day !== 0;                    // Fallback to 6 days if frequency is weird
        }
    }

    /**
     * Selects and scales exercises for a single session
     */
    private static selectExercisesForSession(profile: UserProfile, pool: Exercise[]): PlannedExercise[] {
        // Shuffle and pick 5-7 exercises
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(6, pool.length));

        return selected.map(ex => {
            const levelBonus = profile.progressSystem.currentLevel - ex.unlockLevel;
            const reps = ex.baseReps + (levelBonus * ex.repIncrement);
            const sets = ex.baseSets + Math.floor(levelBonus / 5) * ex.setIncrement;

            return {
                ...ex,
                exerciseId: ex.id,
                reps,
                sets,
                rest: 60,
                completed: false
            };
        });
    }

    private static calculateMetrics(sessions: WorkoutSession[]): PlanMetrics {
        const workoutSessions = sessions.filter(s => s.type !== 'rest');
        return {
            totalVolume: workoutSessions.length * 15, // Dummy calculation
            averageSessionDuration: 45,
            weeklyIntensity: 5,
            totalWorkouts: workoutSessions.length,
            estimatedCalories: workoutSessions.length * 300,
            focusMuscles: ['Full Body'],
            weeklyFrequency: Math.round(workoutSessions.length / 4)
        };
    }
}

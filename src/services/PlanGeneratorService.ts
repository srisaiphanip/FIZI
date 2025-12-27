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
        const availableExercises = this.filterExercises(profile);
        const sessions = this.createSessions(profile, availableExercises);
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

        return exercises.filter(ex => {
            // 1. Level check
            const isUnlocked = ex.unlockLevel <= currentLevel;
            if (!isUnlocked) return false;

            // 2. Granular Equipment check
            // If user has 'gym' access, traditionally they have everything
            if (equipmentAccess === 'gym') return true;

            // Otherwise, check specific items
            const hasRequiredItems = ex.requiredEquipment.length === 0 ||
                ex.requiredEquipment.every(req => availableEquipment.includes(req));

            if (!hasRequiredItems) return false;

            // 3. High-level category fallback
            return this.checkEquipmentMatch(equipmentAccess, ex.equipmentRequired);
        });
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
                    exercises: this.selectExercisesForSession(profile, availableExercises),
                    status: 'scheduled',
                    type: 'strength',
                    duration: 45
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
                    duration: 0
                });
            }
        }

        return sessions;
    }

    private static isWorkoutDay(day: number, frequency: number): boolean {
        if (frequency >= 6) return day !== 0; // 6 days: Rest on Sunday
        if (frequency >= 5) return day !== 0 && day !== 6; // 5 days: Rest on Weekend
        if (frequency >= 4) return [1, 2, 4, 5].includes(day); // 4 days: Mon, Tue, Thu, Fri
        if (frequency >= 3) return [1, 3, 5].includes(day); // 3 days: Mon, Wed, Fri
        if (frequency >= 2) return [2, 4].includes(day); // 2 days: Tue, Thu
        return day === 3; // 1 day: Wed
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

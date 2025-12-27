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
import { PlanGeneratorService } from './PlanGeneratorService';
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

class WorkoutPlanService {
    /**
     * Calculates initial level based on experience and assessment scores
     */
    public calculateInitialLevel(profile: UserProfile): number {
        // Use the new progress system level if available
        if (profile.progressSystem?.currentLevel) {
            return profile.progressSystem.currentLevel;
        }

        let baseLevel = 1;

        // Experience contribution
        const experience = profile.fitnessProfile?.experienceLevel || profile.workoutExperience || 'beginner';
        switch (experience) {
            case 'beginner': baseLevel = 1; break;
            case 'intermediate': baseLevel = 3; break;
            case 'advanced': baseLevel = 5; break;
        }

        return baseLevel;
    }

    public generateWorkoutPlan(userProfile: UserProfile, forcedLevel?: number): WorkoutPlan {
        // Ensure profile is consistent with new structure
        return PlanGeneratorService.generatePlan(userProfile.uid, userProfile);
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
            const session = plan.sessions.find((s: WorkoutSession) => s.dayOfWeek === dayOfWeek);
            if (session) {
                const exercise = session.exercises.find((e: PlannedExercise) => e.exerciseId === exerciseId);
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

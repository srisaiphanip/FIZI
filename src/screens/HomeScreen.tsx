import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchWorkoutStats } from '../store/slices/workoutSlice';
import { fetchWorkoutPlan } from '../store/slices/workoutPlanSlice';
import MotivationalTip from '../components/MotivationalTip';
import { Spacing, Shadows, Layout, ThemeColorsType, ThemeShadowsType } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import { seedAllInstructions } from '../store/slices/exerciseSlice';
import { ExerciseInstructions, WorkoutSession } from '../types';
import { setRecoveryStatus, updatePlanLevel, regenerateUserPlan } from '../store/slices/workoutPlanSlice';
import { avatarService, AvatarState, AVATAR_LEVELS } from '../services/AvatarService';
import LevelXPCard from '../components/LevelXPCard';
import { HomeHeader } from '../components/home/HomeHeader';
import { DailyStatusCard } from '../components/home/DailyStatusCard';
import { WeeklySchedule } from '../components/home/WeeklySchedule';
import { getSimplifiedFocus } from '../utils/workoutUtils';


interface HomeScreenProps {
    navigation: any;
}

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const dispatch = useAppDispatch();
    const { colors, gradients, shadows, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
    const { user } = useAppSelector((state) => state.auth);
    const { stats } = useAppSelector((state) => state.workout);
    const { currentPlan, todaysWorkout, recoveryStatus, loading: planLoading } = useAppSelector((state) => state.workoutPlan);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
    const scrollViewRef = React.useRef<ScrollView>(null);
    const scheduleLayoutY = React.useRef<number>(0);
    const [avatarState, setAvatarState] = useState<AvatarState | null>(null);

    const loadAvatarState = async () => {
        const state = await avatarService.getAvatarState();
        setAvatarState(state);
    };

    useEffect(() => {
        loadAvatarState();
    }, []);

    useEffect(() => {
        dispatch(fetchWorkoutStats('week'));
        if (user?.uid) {
            dispatch(fetchWorkoutPlan(user.uid));
        }

        const today = new Date().getDay();
        // Mon=1 -> 0, Tue=2 -> 1, ..., Sat=6 -> 5, Sun=0 -> 6
        if (today === 0) {
            setSelectedDayIndex(6);
        } else {
            setSelectedDayIndex(today - 1);
        }
    }, [dispatch, user?.uid]); // Removed todaysWorkout.id to prevent loops during regen

    // Auto-Enforce 7-Day Active Split
    useEffect(() => {
        if (currentPlan && user && !planLoading) {
            const uniqueDays = new Set(currentPlan.sessions.map(s => s.dayOfWeek));
            const hasRestOrRecovery = currentPlan.sessions.some(
                s => s.type === 'rest' ||
                    s.isRestDay === true ||
                    s.focus?.toLowerCase().includes('rest') ||
                    s.focus?.toLowerCase().includes('recovery')
            );

            const isIncomplete = uniqueDays.size < 7;

            if (hasRestOrRecovery || isIncomplete) {
                console.log('[HomeScreen] Invalid plan (Rest detected or Incomplete days). Enforcing 7-day split...');
                const forcedProfile = JSON.parse(JSON.stringify(user));
                if (!forcedProfile.fitnessProfile) {
                    forcedProfile.fitnessProfile = { availableDays: 7 };
                } else {
                    forcedProfile.fitnessProfile.availableDays = 7;
                }
                dispatch(regenerateUserPlan(forcedProfile));
            }
        }
    }, [currentPlan?.id, user?.uid, planLoading]);




    const handleStartExercise = (exercise: any) => {
        // Handle multiple possible ID property names
        const exerciseId = exercise.exerciseId || exercise.id || exercise.name?.toLowerCase().replace(/\s+/g, '-');

        navigation.navigate('ExerciseInstructions', {
            exerciseId: exerciseId,
            exerciseName: exercise.name || exercise.exerciseName,
            targetSets: exercise.sets,
            targetReps: exercise.reps,
            fromPlan: true
        });
    };

    const getRecoveryTips = () => {
        const tips = {
            good: [
                '✓ Sleep 8-9 hours tonight',
                '✓ Hydrate well (3-4L water)',
                '✓ Eat protein + carbs within 1 hr',
                '✓ Light stretching or mobility'
            ],
            moderate: [
                '⚠ Get adequate sleep (8+ hrs)',
                '⚠ Increase water intake (4L+)',
                '⚠ Active recovery: 15 min walk',
                '⚠ Foam rolling for sore muscles'
            ],
            poor: [
                '🔴 MANDATORY REST - No training',
                '🔴 Focus on sleep (9-10 hrs)',
                '🔴 Ice/heat therapy for sore areas',
                '🔴 Extra protein + carbs today'
            ]
        };
        return tips[recoveryStatus] || tips.good;
    };

    const isRestDay = todaysWorkout?.isRestDay || !todaysWorkout;

    const getNextWorkout = () => {
        if (!currentPlan) return null;
        const today = new Date().getDay();
        // Look for the next workout day in the next 7 days
        for (let i = 1; i <= 7; i++) {
            const checkDay = (today + i) % 7;
            const session = currentPlan.sessions.find(s => s.dayOfWeek === checkDay && !s.isRestDay && s.type !== 'rest');
            if (session && session.exercises.length > 0) return session;
        }
        return null;
    };

    const nextWorkout = isRestDay ? getNextWorkout() : null;

    const handleRecoveryChange = (status: 'good' | 'moderate' | 'poor') => {
        dispatch(setRecoveryStatus(status));
    };

    const handleSeedData = async () => {
        // 1. Seed Instructions (Fix Images)
        const initialInstructions: ExerciseInstructions[] = [
            {
                exerciseId: 'push-ups',
                exerciseName: 'Push-ups',
                description: 'A fundamental upper body exercise targeting chest, shoulders, and triceps.',
                imageUri: 'asset://push-ups.png',
                steps: [
                    'Start in a high plank position with hands slightly wider than shoulders',
                    'Keep your body in a straight line from head to heels',
                    'Lower your body until chest nearly touches the ground',
                    'Push back up to starting position'
                ],
                tips: [
                    'Keep core engaged throughout',
                    'Don\'t let hips sag or pike up',
                    'Breathe in on the way down, out on the way up'
                ]
            },
            {
                exerciseId: 'squats',
                exerciseName: 'Squats',
                description: 'A compound lower body exercise that builds leg and glute strength.',
                imageUri: 'asset://squats.png',
                steps: [
                    'Stand with feet shoulder-width apart, toes slightly out',
                    'Keep chest up and core engaged',
                    'Lower down by bending knees and pushing hips back',
                    'Go until thighs are parallel to ground',
                    'Push through heels to return to standing'
                ],
                tips: [
                    'Keep knees tracking over toes',
                    'Don\'t let knees cave inward',
                    'Weight should be on your heels'
                ]
            },
            {
                exerciseId: 'plank',
                exerciseName: 'Plank',
                description: 'An isometric core exercise that builds overall stability.',
                imageUri: 'asset://plank.png',
                steps: [
                    'Start in a forearm plank position',
                    'Keep elbows directly under shoulders',
                    'Body should form a straight line',
                    'Hold the position'
                ],
                tips: [
                    'Don\'t let hips sag or pike up',
                    'Squeeze glutes and core',
                    'Breathe steadily throughout'
                ]
            },
            {
                exerciseId: 'bicep-curls',
                exerciseName: 'Bicep Curls',
                description: 'An isolation exercise targeting the biceps.',
                imageUri: 'asset://bicep-curls.png',
                steps: [
                    'Stand with feet hip-width apart',
                    'Hold weights with arms fully extended',
                    'Curl weights up toward shoulders',
                    'Lower back down with control'
                ],
                tips: [
                    'Keep elbows close to body',
                    'Don\'t swing or use momentum',
                    'Control the weight on the way down'
                ]
            },
            {
                exerciseId: 'burpees',
                exerciseName: 'Burpees',
                description: 'A full-body explosive exercise that builds strength and cardio endurance.',
                imageUri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop',
                steps: [
                    'Stand with feet shoulder-width apart',
                    'Lower into a squat position and place hands on floor',
                    'Kick feet back into a plank position',
                    'Perform a push-up (optional but recommended)',
                    'Jump feet back toward hands',
                    'Explode up into a jump with arms overhead'
                ],
                tips: [
                    'Maintain a strong core during the plank',
                    'Land softly on your feet',
                    'Move at a steady, rhythmic pace'
                ]
            },
            {
                exerciseId: 'mountain-climbers',
                exerciseName: 'Mountain Climbers',
                description: 'A dynamic core exercise that mimics the motion of climbing a mountain.',
                imageUri: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=500&auto=format&fit=crop',
                steps: [
                    'Start in a high plank position',
                    'Drive your right knee toward your chest',
                    'Quickly switch legs, driving the left knee forward',
                    'Keep your hips low and back flat',
                    'Continue alternating legs at a fast pace'
                ],
                tips: [
                    'Keep shoulders directly over wrists',
                    'Don\'t let your butt pike up in the air',
                    'Breathe rhythmically'
                ]
            }
        ];

        dispatch(seedAllInstructions(initialInstructions));

        // 2. Fix Schedule (Force Regenerate Plan)
        if (user?.uid) {
            // Force 7 days to verify custom split logic
            // Use JSON parse/stringify to break any redux immutability or reference issues
            const forcedProfile = JSON.parse(JSON.stringify(user));
            if (!forcedProfile.fitnessProfile) {
                forcedProfile.fitnessProfile = { availableDays: 7 };
            } else {
                forcedProfile.fitnessProfile.availableDays = 7;
            }

            const result = await dispatch(regenerateUserPlan(forcedProfile)).unwrap();
            alert(`Plan Regenerated!\nFreq: ${result.frequency}\nSplit: ${result.sessions.slice(0, 3).map(s => s.focus).join(', ')}`);
        } else {
            alert('Fixing Schedule & Images... Wait 5 seconds for update! 🛠️');
        }
    };

    return (
        <LinearGradient
            colors={gradients.background}
            style={styles.container}
        >
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <HomeHeader
                    user={user}
                    onAvatarPress={() => navigation.navigate('Avatar')}
                />

                {/* Level & XP Progress Card */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('LevelProgress')}
                    activeOpacity={0.9}
                >
                    <LevelXPCard
                        level={avatarState?.level || user?.progressSystem?.currentLevel || user?.level || 1}
                        xp={avatarState?.xp || user?.progressSystem?.currentXP || user?.xp || 0}
                        totalWorkouts={avatarState?.totalWorkouts || user?.progressSystem?.totalWorkoutsCompleted || user?.totalWorkouts || 0}
                    />
                </TouchableOpacity>

                {/* Motivational Tip */}
                <View style={styles.section}>
                    <MotivationalTip />
                </View>

                {/* Dynamic Status Card */}
                <DailyStatusCard isRestDay={isRestDay} />

                {/* Today's Workout Header */}
                {todaysWorkout && !todaysWorkout.isRestDay && (
                    <BlurView intensity={20} tint="dark" style={styles.todayWorkoutCard}>
                        <View style={styles.workoutHeader}>
                            <View>
                                <Text style={styles.workoutTitle}>Today's Workout 🎯</Text>
                                <Text style={styles.workoutFocus}>{getSimplifiedFocus(todaysWorkout.focus)}</Text>
                            </View>
                        </View>

                        <View style={styles.workoutMetaContainer}>
                            <Text style={styles.workoutDuration}>
                                ⏱️ {todaysWorkout.duration} min  •  {todaysWorkout.exercises.length} exercises
                            </Text>
                            {todaysWorkout.exercises.length > 0 && (
                                <View style={styles.progressBadge}>
                                    <Text style={styles.progressText}>
                                        {todaysWorkout.exercises.filter(e => e.completed).length}/{todaysWorkout.exercises.length} ✓
                                    </Text>
                                </View>
                            )}
                        </View>
                    </BlurView>
                )}

                {/* Exercise List */}
                {todaysWorkout && !todaysWorkout.isRestDay && (
                    <View style={styles.exercisesList}>
                        {todaysWorkout.exercises.length > 0 ? (
                            todaysWorkout.exercises.map((exercise, index) => (
                                <BlurView key={`${exercise.exerciseId}-${index}`} intensity={15} tint="dark" style={styles.exerciseCard}>
                                    <View style={styles.exerciseCardHeader}>
                                        <View style={styles.exerciseInfo}>
                                            <View style={styles.exerciseNumberBadge}>
                                                <Text style={styles.exerciseNumber}>{index + 1}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.exerciseCardName}>{exercise.displayName || exercise.name || exercise.exerciseName}</Text>
                                                <Text style={styles.exerciseCardTarget}>
                                                    {exercise.sets} sets × {exercise.reps} reps
                                                </Text>
                                            </View>
                                        </View>
                                        {exercise.completed && (
                                            <View style={styles.completedBadge}>
                                                <Text style={styles.completedIcon}>✓</Text>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.startExerciseButton,
                                            exercise.completed && styles.startExerciseButtonCompleted
                                        ]}
                                        onPress={() => handleStartExercise(exercise)}
                                    >
                                        <Text style={styles.startExerciseButtonText}>
                                            {exercise.completed ? 'Repeat Exercise' : 'Start Exercise'} →
                                        </Text>
                                    </TouchableOpacity>
                                </BlurView>
                            ))
                        ) : (
                            <BlurView intensity={20} tint="dark" style={styles.emptyExercisesCard}>
                                <Text style={styles.emptyExercisesText}>No exercises found for this session. Try adjusting your profile!</Text>
                            </BlurView>
                        )}
                    </View>
                )}

                {/* Rest Day Card */}
                {todaysWorkout && (todaysWorkout.isRestDay || todaysWorkout.type === 'rest') && (
                    <View>
                        <BlurView intensity={20} tint="dark" style={styles.todayWorkoutCard}>
                            <View style={styles.workoutHeader}>
                                <View>
                                    <View style={styles.restDayBadge}>
                                        <Text style={styles.workoutTitle}>Rest Day 😌</Text>
                                    </View>
                                    <Text style={styles.workoutFocus}>{todaysWorkout.focus || 'Rest & Recovery'}</Text>
                                </View>
                            </View>
                            <Text style={styles.restDayMessage}>
                                {(todaysWorkout.notes || 'Take today to recover and prepare for your next workout.').replace(/\*\*/g, '')}
                            </Text>
                        </BlurView>


                        {nextWorkout && (
                            <View style={styles.nextWorkoutContainer}>
                                <Text style={styles.nextWorkoutLabel}>Preview: Next Workout 🔜</Text>
                                <BlurView intensity={15} tint="dark" style={styles.nextWorkoutCard}>
                                    <View style={styles.nextWorkoutHeader}>
                                        <Text style={styles.nextWorkoutTitle}>{getSimplifiedFocus(nextWorkout.focus)}</Text>
                                        <Text style={styles.nextWorkoutDay}>
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][nextWorkout.dayOfWeek || 0]}
                                        </Text>
                                    </View>
                                    <View style={styles.nextExercisesPreview}>
                                        {nextWorkout.exercises.slice(0, 3).map((ex, idx) => (
                                            <View key={idx} style={styles.nextExerciseItem}>
                                                <Text style={styles.nextExerciseBullet}>•</Text>
                                                <Text style={styles.nextExerciseName}>{ex.displayName || ex.name}</Text>
                                            </View>
                                        ))}
                                        {nextWorkout.exercises.length > 3 && (
                                            <Text style={styles.moreExercisesText}>+ {nextWorkout.exercises.length - 3} more exercises</Text>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        style={styles.viewPlanButton}
                                        onPress={() => {
                                            const targetDayIndex = nextWorkout.dayOfWeek === 0 ? 6 : (nextWorkout.dayOfWeek || 0) - 1;
                                            setSelectedDayIndex(targetDayIndex);
                                            // Scroll to schedule section
                                            scrollViewRef.current?.scrollTo({ x: 0, y: scheduleLayoutY.current, animated: true });
                                        }}
                                    >
                                        <Text style={styles.viewPlanButtonText}>View Full Plan</Text>
                                    </TouchableOpacity>
                                </BlurView>
                            </View>
                        )}
                    </View>
                )}

                {/* Main Action - Start Workout */}


                {/* Recovery Status Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recovery Status ❤️</Text>
                    <View style={styles.recoveryGrid}>
                        {(['good', 'moderate', 'poor'] as const).map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.recoveryButton,
                                    recoveryStatus === status && (styles[`recoveryButton${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof styles] as any),
                                ]}
                                onPress={() => handleRecoveryChange(status)}
                            >
                                <Text style={[
                                    styles.recoveryButtonText,
                                    recoveryStatus === status && styles.recoveryButtonTextActive
                                ]}>
                                    {status === 'good' ? '🟢 Good' : status === 'moderate' ? '🟡 Moderate' : '🔴 Poor'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recovery Tips */}
                <View style={styles.section}>
                    <BlurView intensity={20} tint="dark" style={styles.tipsCard}>
                        <Text style={styles.tipsTitle}>{isRestDay ? '🌙 Rest Day Tips' : '💪 Post-Workout Tips'}</Text>
                        <View style={styles.tipsList}>
                            {getRecoveryTips().map((tip, idx) => (
                                <View key={idx} style={styles.tipItem}>
                                    <Text style={styles.tipText}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    </BlurView>
                </View>

                {/* Weekly Schedule Grid */}
                {currentPlan && (
                    <WeeklySchedule
                        currentPlan={currentPlan}
                        selectedDayIndex={selectedDayIndex}
                        onDaySelect={setSelectedDayIndex}
                        onLayout={(event) => {
                            const layout = event.nativeEvent.layout;
                            scheduleLayoutY.current = layout.y;
                        }}
                    />
                )}

                {/* Selected Day Details */}
                {selectedDayIndex !== null && currentPlan && (
                    <View style={styles.section}>
                        <BlurView intensity={30} tint="dark" style={styles.detailsCard}>
                            <View style={styles.detailsHeader}>
                                <View style={styles.detailsTitleContainer}>
                                    <MaterialCommunityIcons name="flash" size={24} color={colors.accentCyan} />
                                    <Text style={styles.detailsTitle}>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][selectedDayIndex]} - {getSimplifiedFocus(currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.focus || 'Workout')}

                                    </Text>
                                </View>
                                <View style={styles.detailsDurationBadge}>
                                    <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textPrimary} />
                                    <Text style={styles.detailsDurationText}>
                                        {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.duration} min
                                    </Text>
                                </View>
                            </View>

                            {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.notes && (
                                <View style={styles.detailsNotes}>
                                    <Text style={styles.detailsNotesText}>
                                        {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.notes}
                                    </Text>
                                </View>
                            )}

                            <Text style={styles.exercisesTitle}>Exercises:</Text>
                            <View style={styles.detailsExercises}>
                                {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.exercises.map((exercise, idx) => (
                                    <View key={idx} style={styles.detailExerciseItem}>
                                        <Text style={styles.detailExerciseNumber}>{idx + 1}.</Text>
                                        <Text style={styles.detailExerciseText}>{exercise.name}: {exercise.sets}x{exercise.reps}</Text>
                                    </View>
                                ))}
                            </View>
                        </BlurView>
                    </View>
                )}

                {/* Level Training Split Breakdown - REMOVED */}

                {/* Secondary Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigation.navigate('History')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.historyButtonGradient}
                        >
                            <View style={styles.historyContent}>
                                <View style={styles.historyIconContainer}>
                                    <MaterialCommunityIcons name="history" size={28} color={colors.accentCyan} />
                                </View>
                                <View style={styles.historyTextContainer}>
                                    <Text style={styles.historyTitle}>Workout History</Text>
                                    <Text style={styles.historySubtitle}>View past sessions & detailed stats</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>







                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const createStyles = (colors: ThemeColorsType, shadows: ThemeShadowsType) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.l,
        paddingTop: 80,
        paddingBottom: 100,
    },
    header: {
        marginBottom: Spacing.l,
    },
    section: {
        marginBottom: Spacing.l,
    },

    // Workout Card
    todayWorkoutCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        overflow: 'hidden',
        marginBottom: Spacing.l,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassSurface,
        ...shadows.card,
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.m,
    },
    workoutTitle: {
        fontSize: 10,
        color: colors.accentPink,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    restDayBadge: {
        backgroundColor: colors.accentPink + '26',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: Layout.borderRadius.round,
        alignSelf: 'flex-start',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.accentPink + '4D',
    },
    workoutFocus: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    viewLibraryLink: {
        backgroundColor: colors.glassSurface,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: Layout.borderRadius.round,
    },
    viewLibraryText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    workoutDuration: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    workoutMetaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressBadge: {
        backgroundColor: colors.accentSuccess + '26',
        paddingHorizontal: Spacing.m,
        paddingVertical: 4,
        borderRadius: Layout.borderRadius.round,
        borderWidth: 1,
        borderColor: colors.accentSuccess + '4D',
    },
    progressText: {
        fontSize: 12,
        color: colors.accentSuccess,
        fontWeight: '700',
    },

    // Exercise List
    exercisesList: {
        gap: Spacing.m,
        marginBottom: Spacing.l,
    },
    exerciseCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassSurface,
        ...shadows.small,
    },
    exerciseCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    exerciseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    exerciseNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.glassSurface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    exerciseNumber: {
        color: colors.textSecondary,
        fontWeight: '700',
        fontSize: 14,
    },
    exerciseCardName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    exerciseCardTarget: {
        fontSize: 13,
        color: colors.accentCyan,
        fontWeight: '600',
    },
    completedBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.accentSuccess,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.glow,
        shadowColor: colors.accentSuccess,
    },
    completedIcon: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    startExerciseButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: Layout.borderRadius.s,
        backgroundColor: colors.glassSurface,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    startExerciseButtonCompleted: {
        backgroundColor: colors.accentSuccess + '1A',
        borderColor: colors.accentSuccess,
    },
    startExerciseButtonText: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 14,
    },
    emptyExercisesCard: {
        padding: Spacing.l,
        borderRadius: Layout.borderRadius.m,
        alignItems: 'center',
        backgroundColor: colors.glassSurface,
        ...shadows.card,
    },
    emptyExercisesText: {
        color: colors.textSecondary,
        textAlign: 'center',
    },

    // Next Workout Preview
    nextWorkoutContainer: {
        marginTop: Spacing.l,
    },
    nextWorkoutLabel: {
        fontSize: 14,
        color: colors.textTertiary,
        marginBottom: Spacing.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    nextWorkoutCard: {
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.m,
        backgroundColor: colors.glassSurface,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        overflow: 'hidden',
        ...shadows.card,
    },
    nextWorkoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.s,
    },
    nextWorkoutTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    nextWorkoutDay: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    nextExercisesPreview: {
        marginBottom: Spacing.m,
    },
    nextExerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nextExerciseBullet: {
        color: colors.accentCyan,
        marginRight: 8,
        fontSize: 16,
    },
    nextExerciseName: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    moreExercisesText: {
        color: colors.textTertiary,
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    },
    viewPlanButton: {
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: colors.glassBorder,
    },
    viewPlanButtonText: {
        color: colors.accentCyan,
        fontWeight: '600',
        fontSize: 13,
    },

    // Start Button (Main)
    startButtonContainer: {
        marginBottom: Spacing.l,
        ...shadows.glow,
        shadowColor: colors.primaryStart,
    },
    startButton: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    startButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.m,
    },
    startButtonIcon: {
        fontSize: 32,
    },
    startButtonText: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    startButtonSubtext: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
        letterSpacing: 1,
    },

    // Section Titles
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: Spacing.m,
        paddingLeft: Spacing.xs,
        borderLeftWidth: 3,
        borderLeftColor: colors.accentCyan,
    },

    // Recovery Grid
    recoveryGrid: {
        flexDirection: 'row',
        gap: Spacing.s,
    },
    recoveryButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: Layout.borderRadius.m,
        backgroundColor: colors.glassSurface,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    recoveryButtonGood: {
        backgroundColor: colors.accentSuccess + '1A',
        borderColor: colors.accentSuccess,
    },
    recoveryButtonModerate: {
        backgroundColor: colors.accentYellow + '1A',
        borderColor: colors.accentYellow,
    },
    recoveryButtonPoor: {
        backgroundColor: colors.accentError + '1A',
        borderColor: colors.accentError,
    },
    recoveryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    recoveryButtonTextActive: {
        color: colors.textPrimary,
        fontWeight: '800',
    },

    // Details Card
    detailsCard: {
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.m,
        backgroundColor: colors.glassSurface,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...shadows.card,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    detailsTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        flex: 1,
        marginRight: Spacing.s,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
    },
    detailsDurationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.glassSurface,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: Layout.borderRadius.round,
    },
    detailsDurationText: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: '600',
    },
    detailsNotes: {
        backgroundColor: colors.glassSurface,
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.s,
        marginBottom: Spacing.m,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    detailsNotesText: {
        color: colors.textSecondary,
        fontStyle: 'italic',
        fontSize: 14,
        lineHeight: 20,
    },
    restDayDetailContainer: {
        width: '100%',
    },
    exercisesTitle: {
        fontSize: 14,
        color: colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.s,
        fontWeight: '600',
    },
    detailsExercises: {
        width: '100%',
        gap: 8,
    },
    detailExerciseItem: {
        flexDirection: 'row',
        gap: Spacing.s,
        paddingVertical: 8,
    },
    detailExerciseNumber: {
        color: colors.accentCyan,
        fontWeight: 'bold',
        width: 24,
    },
    detailExerciseText: {
        color: colors.textPrimary,
        fontSize: 14,
        flex: 1,
    },

    // Tips Card
    tipsCard: {
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
        backgroundColor: colors.glassSurface,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...shadows.card,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: Spacing.m,
    },
    tipsList: {
        gap: 8,
    },
    tipItem: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    tipText: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },

    // Rest Day Details
    restDayMessage: {
        color: colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: Spacing.m,
    },

    // Actions
    actionsContainer: {
        marginBottom: Spacing.l,
    },
    historyButton: {
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...shadows.card,
    },
    historyButtonGradient: {
        padding: Spacing.m,
    },
    historyContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.accentCyan + '26',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
        borderWidth: 1,
        borderColor: colors.accentCyan + '4D',
    },
    historyTextContainer: {
        flex: 1,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    historySubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
    },

    // Logout
    logoutButton: {
        alignItems: 'center',
        paddingVertical: Spacing.m,
    },
    logoutText: {
        color: colors.textTertiary,
        fontSize: 14,
        fontWeight: '600',
    },

    // Training Split
    splitList: {
        gap: 8,
    },
    splitItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.glassBorder,
    },
    splitDay: {
        color: colors.accentCyan,
        fontWeight: '600',
        width: 80,
    },
    splitFocus: {
        color: colors.textSecondary,
        flex: 1,
    },
    splitItemRest: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.glassBorder,
        opacity: 0.7,
    },
    splitDayRest: {
        color: colors.accentPink,
        fontWeight: '600',
        width: 80,
    },
    splitFocusRest: {
        color: colors.textTertiary,
        flex: 1,
        fontStyle: 'italic',
    },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { signOut } from '../store/slices/authSlice';
import { fetchWorkoutStats } from '../store/slices/workoutSlice';
import { fetchWorkoutPlan } from '../store/slices/workoutPlanSlice';
import MotivationalTip from '../components/MotivationalTip';
import { Colors, Gradients, Spacing, Shadows, Layout } from '../theme/Theme';
import { seedAllInstructions } from '../store/slices/exerciseSlice';
import { ExerciseInstructions, WorkoutSession } from '../types';
import { setRecoveryStatus, updatePlanLevel } from '../store/slices/workoutPlanSlice';

interface HomeScreenProps {
    navigation: any;
}

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { stats } = useAppSelector((state) => state.workout);
    const { currentPlan, todaysWorkout, recoveryStatus, loading: planLoading } = useAppSelector((state) => state.workoutPlan);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchWorkoutStats('week'));
        if (user?.uid) {
            dispatch(fetchWorkoutPlan(user.uid));
        }

        if (todaysWorkout) {
            console.log('[HomeScreen] Today\'s Workout:', todaysWorkout.title);
            console.log('[HomeScreen] Exercises count:', todaysWorkout.exercises?.length || 0);
            if (todaysWorkout.exercises?.length > 0) {
                console.log('[HomeScreen] First Exercise:', todaysWorkout.exercises[0].name);
            }
        }

        const today = new Date().getDay();
        if (today !== 0) {
            setSelectedDayIndex(today - 1);
        }
    }, [dispatch, user?.uid, todaysWorkout?.id]);


    const handleSignOut = async () => {
        await dispatch(signOut());
    };

    const handleStartExercise = (exercise: any) => {
        // Handle multiple possible ID property names
        const exerciseId = exercise.exerciseId || exercise.id || exercise.name?.toLowerCase().replace(/\s+/g, '-');
        console.log('HomeScreen: Starting exercise with data:', JSON.stringify(exercise));
        console.log('HomeScreen: Extracted exerciseId:', exerciseId);

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

    const handleSeedData = () => {
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
        alert('Cloud DB re-synced! Wait 5 seconds, then tap a workout to see your images! 🧪');
    };

    return (
        <LinearGradient
            colors={Gradients.background}
            style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.title}>{user?.displayName || 'Champion'}! 👋</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarCircle} onPress={() => navigation.navigate('Avatar')}>
                        <Text style={styles.avatarText}>{user?.displayName?.[0] || 'U'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Level & XP Progress Card */}
                <TouchableOpacity
                    style={styles.xpCard}
                    onPress={() => navigation.navigate('LevelProgress')}
                >
                    <BlurView intensity={20} tint="light" style={styles.xpCardContent}>
                        <View style={styles.xpHeader}>
                            <View>
                                <Text style={styles.xpLabel}>Current Level</Text>
                                <Text style={styles.levelValue}>{user?.progressSystem?.currentLevel || 1}</Text>
                            </View>
                            <View style={styles.xpCircle}>
                                <Text style={styles.xpEmoji}>✨</Text>
                            </View>
                        </View>
                        <View style={styles.xpBarContainer}>
                            <View style={styles.xpBarBg}>
                                <LinearGradient
                                    colors={Gradients.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.xpBarFill,
                                        { width: `${Math.min(100, (user?.progressSystem?.currentXP || 0) % 1000 / 10)}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.xpPercentage}>
                                {Math.round((user?.progressSystem?.currentXP || 0) % 1000 / 10)}%
                            </Text>
                        </View>
                    </BlurView>
                </TouchableOpacity>

                {/* Motivational Tip */}
                <View style={styles.section}>
                    <MotivationalTip />
                </View>


                {/* Dynamic Status Card */}
                <BlurView intensity={30} tint="light" style={styles.todayStatusCard}>
                    <View style={styles.statusRow}>
                        <View>
                            <Text style={styles.statusLabel}>Today's Status</Text>
                            <Text style={styles.statusDate}>
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                        <View style={styles.statusBadgeContainer}>
                            {isRestDay ? (
                                <View style={styles.statusBadgeRest}>
                                    <Text style={styles.statusEmoji}>😌</Text>
                                    <Text style={styles.statusBadgeText}>REST DAY</Text>
                                </View>
                            ) : (
                                <View style={styles.statusBadgeWorkout}>
                                    <Text style={styles.statusEmoji}>💪</Text>
                                    <Text style={styles.statusBadgeText}>WORKOUT</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </BlurView>

                {/* Today's Workout Header */}
                {todaysWorkout && !todaysWorkout.isRestDay && (
                    <BlurView intensity={20} tint="light" style={styles.todayWorkoutCard}>
                        <View style={styles.workoutHeader}>
                            <View>
                                <Text style={styles.workoutTitle}>Today's Workout 🎯</Text>
                                <Text style={styles.workoutFocus}>{todaysWorkout.focus}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('ExerciseLibrary')}
                                style={styles.viewLibraryLink}
                            >
                                <Text style={styles.viewLibraryText}>Library →</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.workoutDuration}>
                            ⏱️ {todaysWorkout.duration} min  •  {todaysWorkout.exercises.length} exercises
                        </Text>
                    </BlurView>
                )}

                {/* Exercise List */}
                {todaysWorkout && !todaysWorkout.isRestDay && (
                    <View style={styles.exercisesList}>
                        {todaysWorkout.exercises.length > 0 ? (
                            todaysWorkout.exercises.map((exercise, index) => (
                                <BlurView key={`${exercise.exerciseId}-${index}`} intensity={20} tint="light" style={styles.exerciseCard}>
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
                            <BlurView intensity={20} tint="light" style={styles.emptyExercisesCard}>
                                <Text style={styles.emptyExercisesText}>No exercises found for this session. Try adjusting your profile!</Text>
                            </BlurView>
                        )}
                    </View>
                )}

                {/* Rest Day Card */}
                {todaysWorkout && todaysWorkout.isRestDay && (
                    <View>
                        <BlurView intensity={20} tint="light" style={styles.todayWorkoutCard}>
                            <View style={styles.workoutHeader}>
                                <Text style={styles.workoutTitle}>Rest Day 😌</Text>
                                <Text style={styles.workoutFocus}>{todaysWorkout.focus || 'Recovery is important!'}</Text>
                            </View>
                            <Text style={styles.restDayMessage}>
                                {todaysWorkout.notes || 'Take today to recover and prepare for your next workout.'}
                            </Text>
                        </BlurView>

                        {nextWorkout && (
                            <View style={styles.nextWorkoutContainer}>
                                <Text style={styles.nextWorkoutLabel}>Preview: Next Workout 🔜</Text>
                                <BlurView intensity={15} tint="light" style={styles.nextWorkoutCard}>
                                    <View style={styles.nextWorkoutHeader}>
                                        <Text style={styles.nextWorkoutTitle}>{nextWorkout.focus}</Text>
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
                                        onPress={() => setSelectedDayIndex(nextWorkout.dayOfWeek || 0)}
                                    >
                                        <Text style={styles.viewPlanButtonText}>View Full Plan</Text>
                                    </TouchableOpacity>
                                </BlurView>
                            </View>
                        )}
                    </View>
                )}

                {/* Main Action - Start Workout */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ExerciseInstructions', { exerciseId: 'push-ups' })}
                    style={styles.startButtonContainer}
                >
                    <LinearGradient
                        colors={Gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.startButton}
                    >
                        <View style={styles.startButtonContent}>
                            <Text style={styles.startButtonIcon}>🏋️</Text>
                            <View>
                                <Text style={styles.startButtonText}>Start Workout</Text>
                                <Text style={styles.startButtonSubtext}>AI-Powered Form Correction</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

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
                    <BlurView intensity={10} tint="light" style={styles.tipsCard}>
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
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📅 Weekly Schedule</Text>
                        <View style={styles.weeklyGrid}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                                const dayOfWeek = (idx + 1) % 7;
                                const session = currentPlan.sessions.find(s => s.dayOfWeek === dayOfWeek);
                                const isToday = new Date().getDay() === dayOfWeek;
                                const isSelected = selectedDayIndex === idx;
                                const isSunday = idx === 6;

                                return (
                                    <TouchableOpacity
                                        key={day}
                                        onPress={() => setSelectedDayIndex(idx)}
                                        style={[
                                            styles.gridDayCard,
                                            isToday && styles.gridDayToday,
                                            isSelected && styles.gridDaySelected,
                                            isSunday && styles.gridDayRest
                                        ]}
                                    >
                                        <Text style={[
                                            styles.gridDayLabel,
                                            isToday && styles.gridDayLabelToday,
                                            isSelected && styles.gridDayLabelSelected,
                                            isSunday && styles.gridDayLabelRest
                                        ]}>{day}</Text>
                                        <Text style={styles.gridDayIcon}>{isSunday ? '🧘' : '💪'}</Text>
                                        <Text style={[
                                            styles.gridDayFocus,
                                            isToday && styles.gridDayFocusToday,
                                            isSelected && styles.gridDayFocusSelected,
                                            isSunday && styles.gridDayFocusRest
                                        ]} numberOfLines={1}>
                                            {isSunday ? 'Rest' : (session?.focus?.split('(')[0].trim() || 'Workout')}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text style={styles.gridHint}>💜 = Today | Select any day to see details</Text>
                    </View>
                )}

                {/* Selected Day Details */}
                {selectedDayIndex !== null && currentPlan && (
                    <View style={styles.section}>
                        <BlurView intensity={30} tint="light" style={styles.detailsCard}>
                            {selectedDayIndex === 6 ? (
                                // Sunday / Rest Day View
                                <View style={styles.restDayDetailContainer}>
                                    <View style={styles.detailsHeader}>
                                        <View style={styles.detailsTitleContainer}>
                                            <MaterialCommunityIcons name="tea" size={24} color={Colors.accentSuccess} />
                                            <Text style={styles.detailsTitle}>Sunday - Rest & Recovery</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailsNotes}>
                                        <Text style={styles.detailsNotesText}>
                                            Recovery is just as important as the workout itself. Use today to let your muscles repair, hydrate well, and get extra sleep.
                                        </Text>
                                    </View>
                                    <Text style={styles.exercisesTitle}>Recovery Tips:</Text>
                                    <View style={styles.detailsExercises}>
                                        {['8-9 hours of sleep', 'Light stretching/yoga', 'Hydrate (3-4L)', 'Meal Prep for the week'].map((tip, idx) => (
                                            <View key={idx} style={styles.detailExerciseItem}>
                                                <Text style={styles.detailExerciseNumber}>{idx + 1}.</Text>
                                                <Text style={styles.detailExerciseText}>{tip}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                // Regular Workout View
                                <>
                                    <View style={styles.detailsHeader}>
                                        <View style={styles.detailsTitleContainer}>
                                            <MaterialCommunityIcons name="flash" size={24} color={Colors.accentCyan} />
                                            <Text style={styles.detailsTitle}>
                                                {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.day} - {currentPlan.sessions.find(s => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.focus}
                                            </Text>
                                        </View>
                                        <View style={styles.detailsDurationBadge}>
                                            <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.textPrimary} />
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
                                </>
                            )}
                        </BlurView>
                    </View>
                )}



                {/* Secondary Actions */}
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('History')}
                    >
                        <BlurView intensity={10} tint="light" style={styles.actionCardBlur}>
                            <Text style={styles.actionIcon}>📊</Text>
                            <Text style={styles.actionTitle}>History</Text>
                        </BlurView>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Avatar')}
                    >
                        <BlurView intensity={10} tint="light" style={styles.actionCardBlur}>
                            <Text style={styles.actionIcon}>🏆</Text>
                            <Text style={styles.actionTitle}>Avatar</Text>
                        </BlurView>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>



                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.l,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    greeting: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.glassSurface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primaryStart,
    },
    section: {
        marginBottom: Spacing.l,
    },

    // Stats Card
    statsCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        marginBottom: Spacing.xl,
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    statsSubtitle: {
        fontSize: 12,
        color: Colors.accentCyan,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.glassBorder,
    },

    // Start Button
    startButtonContainer: {
        ...Shadows.glow,
        marginBottom: Spacing.l,
    },
    startButton: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    startButtonSubtext: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },

    // Actions Grid
    actionsGrid: {
        flexDirection: 'row',
        gap: Spacing.m,
        marginBottom: Spacing.xl,
    },
    actionCard: {
        flex: 1,
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
        height: 100,
    },
    actionCardBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.glassSurface,
    },
    actionIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
    },

    // Today's Workout Card
    todayWorkoutCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        marginBottom: Spacing.xl,
    },
    workoutHeader: {
        marginBottom: Spacing.m,
    },
    workoutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    workoutFocus: {
        fontSize: 14,
        color: Colors.accentCyan,
    },
    workoutDuration: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: Spacing.m,
    },
    exercisesScroll: {
        marginTop: Spacing.s,
    },
    exerciseChip: {
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
        borderRadius: Layout.borderRadius.m,
        padding: 12,
        marginRight: Spacing.s,
        minWidth: 120,
    },
    exerciseName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    exerciseDetails: {
        fontSize: 12,
        color: Colors.textSecondary,
    },

    // Exercise List
    exercisesList: {
        gap: Spacing.m,
        marginBottom: Spacing.xl,
    },
    exerciseCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        backgroundColor: Colors.glassSurface,
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
        flex: 1,
        gap: Spacing.m,
    },
    exerciseNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primaryStart,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exerciseNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    exerciseCardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    exerciseCardTarget: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    completedBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.accentSuccess,
        justifyContent: 'center',
        alignItems: 'center',
    },
    completedIcon: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: 'bold',
    },
    startExerciseButton: {
        backgroundColor: Colors.primaryStart,
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        alignItems: 'center',
    },
    startExerciseButtonCompleted: {
        backgroundColor: 'rgba(108, 99, 255, 0.5)',
    },
    startExerciseButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },

    restDayMessage: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
        textAlign: 'center',
        marginTop: Spacing.s,
    },

    logoutButton: {
        alignItems: 'center',
        padding: Spacing.m,
    },
    logoutText: {
        color: Colors.textTertiary,
        fontSize: 14,
    },

    // Dynamic Status Card
    todayStatusCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        marginBottom: Spacing.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statusDate: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    statusBadgeContainer: {
        alignItems: 'center',
    },
    statusBadgeRest: {
        alignItems: 'center',
    },
    statusBadgeWorkout: {
        alignItems: 'center',
    },
    statusEmoji: {
        fontSize: 32,
        marginBottom: 4,
    },
    statusBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.accentCyan,
    },

    // Recovery Grid
    recoveryGrid: {
        flexDirection: 'row',
        gap: Spacing.s,
        marginBottom: Spacing.m,
    },
    recoveryButton: {
        flex: 1,
        paddingVertical: Spacing.m,
        borderRadius: Layout.borderRadius.m,
        backgroundColor: Colors.glassSurface,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    recoveryButtonGood: {
        backgroundColor: Colors.accentSuccess,
        borderColor: Colors.accentSuccess,
    },
    recoveryButtonModerate: {
        backgroundColor: '#D97706', // Yellow/Orange
        borderColor: '#D97706',
    },
    recoveryButtonPoor: {
        backgroundColor: Colors.accentError,
        borderColor: Colors.accentError,
    },
    recoveryButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.textSecondary,
    },
    recoveryButtonTextActive: {
        color: Colors.textPrimary,
    },

    // Tips Card
    tipsCard: {
        padding: Spacing.l,
        borderRadius: Layout.borderRadius.l,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
    },
    tipsList: {
        gap: Spacing.s,
    },
    tipItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: Spacing.s,
        borderRadius: Layout.borderRadius.s,
    },
    tipText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },



    // Existing Styles...
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
    },
    weeklyScroll: {
        marginBottom: Spacing.m,
    },
    dayCard: {
        width: 100,
        padding: Spacing.s,
        borderRadius: Layout.borderRadius.m,
        marginRight: Spacing.s,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    todayDayCard: {
        borderColor: Colors.primaryStart,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        borderWidth: 2,
    },
    dayLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    todayLabel: {
        color: Colors.primaryStart,
    },
    dayStatus: {
        alignItems: 'center',
        gap: 4,
    },
    dayIcon: {
        fontSize: 18,
    },
    dayFocus: {
        fontSize: 10,
        color: Colors.textTertiary,
        textAlign: 'center',
    },


    // Weekly Grid
    weeklyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
    },
    gridDayCard: {
        flex: 1,
        minWidth: width / 4.2, // Adjusted for 7 days
        padding: Spacing.s,
        borderRadius: Layout.borderRadius.m,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        marginBottom: 8,
    },
    gridDayRest: {
        borderColor: 'rgba(34, 197, 94, 0.3)', // Green shade for rest
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
    },
    gridDayToday: {
        borderColor: 'rgba(168, 85, 247, 0.5)', // Purple indicator
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
    },
    gridDaySelected: {
        borderColor: Colors.primaryStart,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
    },
    gridDayLabel: {
        fontSize: 12,
        color: Colors.textTertiary,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    gridDayLabelToday: {
        color: '#A855F7',
    },
    gridDayLabelRest: {
        color: Colors.accentSuccess,
    },
    gridDayLabelSelected: {
        color: Colors.primaryStart,
    },
    gridDayIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    gridDayFocus: {
        fontSize: 11,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontWeight: '600',
    },
    gridDayFocusToday: {
        color: Colors.textPrimary,
    },
    gridDayFocusRest: {
        color: 'rgba(255, 255, 255, 0.4)',
    },
    gridDayFocusSelected: {
        color: Colors.textPrimary,
    },
    gridHint: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: Spacing.s,
        fontStyle: 'italic',
    },

    // Selected Details
    detailsCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
        gap: 8,
        flex: 1,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        flex: 1,
    },
    detailsDurationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryStart,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    detailsDurationText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    detailsNotes: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.m,
        marginBottom: Spacing.m,
    },
    detailsNotesText: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    exercisesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.s,
    },
    detailsExercises: {
        gap: 8,
    },
    detailExerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: Spacing.s,
        borderRadius: Layout.borderRadius.s,
        gap: 8,
    },
    detailExerciseNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primaryStart,
    },
    detailExerciseText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    restDayDetailContainer: {
        paddingVertical: Spacing.s,
    },
    // Progression Styles
    xpCard: {
        marginHorizontal: Spacing.l,
        marginBottom: Spacing.l,
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        ...Shadows.card,
    },
    xpCardContent: {
        padding: Spacing.m,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    xpLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    levelValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    xpCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    xpEmoji: {
        fontSize: 20,
    },
    xpBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    xpBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    xpBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    xpPercentage: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.primaryStart,
        width: 35,
    },
    viewLibraryLink: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    viewLibraryText: {
        fontSize: 14,
        color: Colors.primaryStart,
        fontWeight: 'bold',
    },
    emptyExercisesCard: {
        padding: Spacing.xl,
        borderRadius: Layout.borderRadius.l,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        alignItems: 'center',
        marginVertical: Spacing.m,
    },
    emptyExercisesText: {
        color: Colors.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    nextWorkoutContainer: {
        marginTop: Spacing.l,
        marginBottom: Spacing.m,
    },
    nextWorkoutLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.s,
        marginLeft: Spacing.s,
    },
    nextWorkoutCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    nextWorkoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    nextWorkoutTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primaryStart,
    },
    nextWorkoutDay: {
        fontSize: 14,
        color: Colors.textSecondary,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    nextExercisesPreview: {
        gap: Spacing.s,
        marginBottom: Spacing.m,
    },
    nextExerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nextExerciseBullet: {
        color: Colors.primaryStart,
        fontSize: 18,
        marginRight: 8,
    },
    nextExerciseName: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    moreExercisesText: {
        color: Colors.textTertiary,
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 4,
    },
    viewPlanButton: {
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.3)',
    },
    viewPlanButtonText: {
        color: Colors.primaryStart,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

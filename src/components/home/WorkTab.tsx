import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LevelXPCard from '../LevelXPCard';
import MotivationalTip from '../MotivationalTip';
import { DailyStatusCard } from './DailyStatusCard';
import { WeeklySchedule } from './WeeklySchedule';
import { LinearGradient } from 'expo-linear-gradient';
import { getSimplifiedFocus } from '../../utils/workoutUtils';
import { useTheme } from '../../hooks/useTheme';
import { useBilling } from '../../context/BillingContext';
import { AvatarState } from '../../services/AvatarService';

interface WorkTabProps {
    user: any;
    navigation: any;
    avatarState: AvatarState | null;
    todaysWorkout: any;
    isRestDay: boolean;
    nextWorkout: any;
    recoveryStatus: 'good' | 'moderate' | 'poor';
    currentPlan: any;
    selectedDayIndex: number | null;
    scrollViewRef: React.RefObject<any>;
    scheduleLayoutY: React.MutableRefObject<number>;
    onStartExercise: (exercise: any) => void;
    onRecoveryChange: (status: 'good' | 'moderate' | 'poor') => void;
    onDaySelect: (index: number) => void;
    getRecoveryTips: () => string[];
    styles: any;
}

export function WorkTab({
    user,
    navigation,
    avatarState,
    todaysWorkout,
    isRestDay,
    nextWorkout,
    recoveryStatus,
    currentPlan,
    selectedDayIndex,
    scrollViewRef,
    scheduleLayoutY,
    onStartExercise,
    onRecoveryChange,
    onDaySelect,
    getRecoveryTips,
    styles,
}: WorkTabProps) {
    const { colors } = useTheme();
    const { purchased } = useBilling();

    return (
        <>
            {/* Level & XP Progress Card */}
            <TouchableOpacity
                onPress={() => navigation.navigate('LevelProgress')}
                activeOpacity={0.9}
            >
                <LevelXPCard
                    level={avatarState?.level || user?.progressSystem?.currentLevel || user?.level || 1}
                    xp={avatarState?.xp || user?.progressSystem?.currentXP || user?.xp || 0}
                    totalWorkouts={avatarState?.totalWorkouts || user?.progressSystem?.totalWorkoutsCompleted || user?.totalWorkouts || 0}
                    purchased={purchased}
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
                                    {todaysWorkout.exercises.filter((e: any) => e.completed).length}/{todaysWorkout.exercises.length} ✓
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
                        todaysWorkout.exercises.map((exercise: any, index: number) => (
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
                                    onPress={() => onStartExercise(exercise)}
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
                                    {nextWorkout.exercises.slice(0, 3).map((ex: any, idx: number) => (
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
                                        onDaySelect(targetDayIndex);
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
                            onPress={() => onRecoveryChange(status)}
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
                        {getRecoveryTips().map((tip: string, idx: number) => (
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
                    onDaySelect={onDaySelect}
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
                                <Text style={styles.detailsTitle} numberOfLines={2}>
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][selectedDayIndex]} - {getSimplifiedFocus(currentPlan.sessions.find((s: any) => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.focus || 'Workout')}
                                </Text>
                            </View>
                            <View style={styles.detailsDurationBadge}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textPrimary} />
                                <Text style={styles.detailsDurationText}>
                                    {Math.round(currentPlan.sessions.find((s: any) => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.duration || 0)} min
                                </Text>
                            </View>
                        </View>

                        {currentPlan.sessions.find((s: any) => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.notes && (
                            <View style={styles.detailsNotes}>
                                <Text style={styles.detailsNotesText}>
                                    {currentPlan.sessions.find((s: any) => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.notes}
                                </Text>
                            </View>
                        )}

                        <Text style={styles.exercisesTitle}>Exercises:</Text>
                        <View style={styles.detailsExercises}>
                            {currentPlan.sessions.find((s: any) => s.dayOfWeek === (selectedDayIndex + 1) % 7)?.exercises.map((exercise: any, idx: number) => (
                                <View key={idx} style={styles.detailExerciseItem}>
                                    <Text style={styles.detailExerciseNumber}>{idx + 1}.</Text>
                                    <Text style={styles.detailExerciseText}>{exercise.name}: {exercise.sets}x{exercise.reps}</Text>
                                </View>
                            ))}
                        </View>
                    </BlurView>
                </View>
            )}

            {/* Secondary Actions */}
            <View style={styles.actionsContainer}>
                {/* Exercise Library */}
                <TouchableOpacity
                    style={[styles.historyButton, { marginBottom: 12 }]}
                    onPress={() => navigation.navigate('ExerciseLibrary')}
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
                                <MaterialCommunityIcons name="dumbbell" size={28} color={colors.accentCyan} />
                            </View>
                            <View style={styles.historyTextContainer}>
                                <Text style={styles.historyTitle}>Exercise Library</Text>
                                <Text style={styles.historySubtitle}>Browse all exercises & instructions</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Workout History */}
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
        </>
    );
}

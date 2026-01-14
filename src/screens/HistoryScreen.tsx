/**
 * HistoryScreen
 * 
 * Displays workout history and performance stats.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import {
    fetchWorkoutHistory,
    fetchWorkoutStats,
    fetchPersonalBests
} from '../store/slices/workoutSlice';
import { Spacing, Layout, Shadows, ThemeColorsType, ThemeShadowsType } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';

interface HistoryScreenProps {
    navigation: any;
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
    const { colors, gradients, shadows, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
    const dispatch = useAppDispatch();
    const { history, stats, personalBests, loading, error } = useAppSelector(
        (state) => state.workout
    );
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

    useEffect(() => {
        loadData();
    }, [selectedPeriod]);

    const loadData = async () => {
        try {
            await Promise.all([
                dispatch(fetchWorkoutHistory(20)),
                dispatch(fetchWorkoutStats(selectedPeriod)),
                dispatch(fetchPersonalBests())
            ]);
        } catch (err) {
            console.error('[HistoryScreen] Error loading data:', err);
        }
    };

    const onRefresh = async () => {
        console.log('[HistoryScreen] Manual refresh triggered');
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const formatDate = (date: any): string => {
        const d = date?.toDate ? date.toDate() : new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return d.toLocaleDateString();
    };

    return (
        <LinearGradient colors={gradients.background} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={colors.primaryStart} />
                </TouchableOpacity>
                <Text style={styles.title}>History & Stats</Text>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaryStart} />
                }
            >
                {/* Stats Overview */}
                <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.statsCard}>
                    <Text style={styles.sectionTitle}>Performance Overview</Text>

                    {/* Period Selector */}
                    <View style={styles.periodSelector}>
                        {(['week', 'month', 'all'] as const).map((period) => (
                            <TouchableOpacity
                                key={period}
                                style={[
                                    styles.periodButton,
                                    selectedPeriod === period && styles.periodButtonActive,
                                ]}
                                onPress={() => setSelectedPeriod(period)}
                            >
                                <Text
                                    style={[
                                        styles.periodButtonText,
                                        selectedPeriod === period && styles.periodButtonTextActive,
                                    ]}
                                >
                                    {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalReps}</Text>
                            <Text style={styles.statLabel}>Total Reps</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatDuration(stats.totalDuration)}</Text>
                            <Text style={styles.statLabel}>Training Time</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{stats.totalCalories}</Text>
                            <Text style={styles.statLabel}>Calories</Text>
                        </View>
                    </View>

                    <View style={styles.avgScoreContainer}>
                        <Text style={styles.avgScoreLabel}>Average Form Accuracy</Text>
                        <Text style={[
                            styles.avgScoreValue,
                            stats.averageFormScore >= 80 ? styles.scoreGood :
                                stats.averageFormScore >= 60 ? styles.scoreWarning : styles.scoreBad
                        ]}>
                            {stats.averageFormScore}%
                        </Text>
                    </View>
                </BlurView>

                {/* Personal Bests */}
                {(personalBests.maxReps || personalBests.longestWorkout || personalBests.bestFormScore) && (
                    <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.bestsCard}>
                        <Text style={styles.sectionTitle}>🏆 Personal Bests</Text>

                        {personalBests.maxReps && (
                            <View style={styles.bestItem}>
                                <View style={styles.bestIconContainer}>
                                    <Text style={styles.bestIcon}>💪</Text>
                                </View>
                                <View style={styles.bestInfo}>
                                    <Text style={styles.bestValue}>{personalBests.maxReps.value} reps</Text>
                                    <Text style={styles.bestLabel}>{personalBests.maxReps.exercise}</Text>
                                </View>
                            </View>
                        )}

                        {personalBests.longestWorkout && (
                            <View style={styles.bestItem}>
                                <View style={styles.bestIconContainer}>
                                    <Text style={styles.bestIcon}>⏱️</Text>
                                </View>
                                <View style={styles.bestInfo}>
                                    <Text style={styles.bestValue}>
                                        {formatDuration(personalBests.longestWorkout.value)}
                                    </Text>
                                    <Text style={styles.bestLabel}>Longest Session</Text>
                                </View>
                            </View>
                        )}

                        {personalBests.bestFormScore && (
                            <View style={styles.bestItem}>
                                <View style={styles.bestIconContainer}>
                                    <Text style={styles.bestIcon}>⭐</Text>
                                </View>
                                <View style={styles.bestInfo}>
                                    <Text style={styles.bestValue}>{personalBests.bestFormScore.value}%</Text>
                                    <Text style={styles.bestLabel}>Highest Form Score</Text>
                                </View>
                            </View>
                        )}
                    </BlurView>
                )}

                {/* Workout History */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Recent Activities</Text>

                    {error && (
                        <BlurView intensity={10} tint={isDark ? "light" : "dark"} style={styles.errorState}>
                            <Text style={styles.errorIcon}>⚠️</Text>
                            <Text style={styles.errorText}>Failed to load history</Text>
                            <Text style={styles.errorSubtext}>{error}</Text>
                            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </BlurView>
                    )}

                    {!error && loading && history.length === 0 ? (
                        <ActivityIndicator color={colors.primaryStart} size="large" style={{ marginTop: 20 }} />
                    ) : !error && history.length === 0 ? (
                        <BlurView intensity={10} tint={isDark ? "light" : "dark"} style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🏋️</Text>
                            <Text style={styles.emptyText}>No workouts yet</Text>
                            <Text style={styles.emptySubtext}>Complete a workout to see it here</Text>
                        </BlurView>
                    ) : !error && (
                        history.map((workout) => (
                            <BlurView key={workout.id} intensity={15} tint={isDark ? "light" : "dark"} style={styles.workoutItem}>
                                <View style={styles.workoutHeaderRow}>
                                    <View>
                                        <Text style={styles.workoutExercise}>{workout.exerciseName}</Text>
                                        <Text style={styles.workoutDate}>{formatDate(workout.createdAt)}</Text>
                                    </View>
                                    <View style={[
                                        styles.scoreBadge,
                                        workout.averageFormScore >= 80 ? styles.scoreBadgeGood :
                                            workout.averageFormScore >= 60 ? styles.scoreBadgeWarning : styles.scoreBadgeBad
                                    ]}>
                                        <Text style={styles.scoreBadgeText}>{workout.averageFormScore}%</Text>
                                    </View>
                                </View>
                                <View style={styles.workoutDetails}>
                                    <View style={styles.detailPill}>
                                        <MaterialCommunityIcons name="repeat" size={14} color={colors.textSecondary} />
                                        <Text style={styles.workoutStat}>{workout.reps} reps</Text>
                                    </View>
                                    <View style={styles.detailPill}>
                                        <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                                        <Text style={styles.workoutStat}>{formatDuration(workout.duration)}</Text>
                                    </View>
                                    <View style={styles.detailPill}>
                                        <MaterialCommunityIcons name="fire" size={14} color={colors.textSecondary} />
                                        <Text style={styles.workoutStat}>{workout.caloriesBurned || 0} kcal</Text>
                                    </View>
                                </View>
                            </BlurView>
                        ))
                    )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: Spacing.l,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 12,
        marginLeft: -10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 16,
    },

    // Stats Card
    statsCard: {
        backgroundColor: colors.glassSurface,
        borderRadius: Layout.borderRadius.m,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        overflow: 'hidden',
        ...shadows.card,
    },
    periodSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 8,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: Layout.borderRadius.s,
        backgroundColor: colors.glassSurface,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: colors.primaryStart,
        borderColor: colors.primaryStart,
    },
    periodButtonText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    periodButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statItem: {
        width: '47%',
        backgroundColor: colors.glassSurface,
        borderRadius: Layout.borderRadius.s,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...shadows.small,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textTertiary,
        marginTop: 4,
    },
    avgScoreContainer: {
        marginTop: 20,
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.glassBorder,
    },
    avgScoreLabel: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 4,
    },
    avgScoreValue: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    scoreGood: {
        color: colors.accentSuccess,
    },
    scoreWarning: {
        color: colors.accentYellow,
    },
    scoreBad: {
        color: colors.accentError,
    },

    // Personal Bests Card
    bestsCard: {
        backgroundColor: colors.accentYellow + '1A', // ~10% opacity for better visibility
        borderRadius: Layout.borderRadius.m,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.accentYellow + '4D', // ~30% opacity
        overflow: 'hidden',
        ...shadows.card,
    },
    bestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: colors.glassSurface,
        padding: 12,
        borderRadius: Layout.borderRadius.s,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    bestIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.accentYellow + '1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bestIcon: {
        fontSize: 22,
    },
    bestInfo: {
        flex: 1,
    },
    bestValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    bestLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },

    // History Card
    historySection: {
        marginBottom: 20,
    },
    workoutItem: {
        borderRadius: Layout.borderRadius.m,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassSurface,
        overflow: 'hidden',
        ...shadows.small,
    },
    workoutHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    workoutExercise: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    workoutDate: {
        fontSize: 13,
        color: colors.textTertiary,
        marginTop: 2,
    },
    scoreBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    scoreBadgeGood: { backgroundColor: colors.accentSuccess + '33' },
    scoreBadgeWarning: { backgroundColor: colors.accentWarning + '33' },
    scoreBadgeBad: { backgroundColor: colors.accentError + '33' },
    scoreBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    workoutDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    detailPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glassSurface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        gap: 4,
    },
    workoutStat: {
        fontSize: 13,
        color: colors.textSecondary,
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        borderRadius: Layout.borderRadius.m,
        backgroundColor: colors.glassSurface,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderStyle: 'dashed',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },

    // Error State
    errorState: {
        alignItems: 'center',
        paddingVertical: 40,
        borderRadius: Layout.borderRadius.m,
        borderWidth: 1,
        borderColor: colors.accentError,
        backgroundColor: colors.accentError + '1A',
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.accentError,
        marginBottom: 4,
    },
    errorSubtext: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 32,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: colors.primaryStart,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: Layout.borderRadius.m,
        ...shadows.small,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

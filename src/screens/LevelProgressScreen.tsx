import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { RootState } from '../store';
import { ProgressionService } from '../services/ProgressionService';
import { Colors, Gradients, Spacing, Layout, Shadows } from '../theme/Theme';

interface LevelProgressScreenProps {
    navigation: any;
}

export default function LevelProgressScreen({ navigation }: LevelProgressScreenProps) {
    const { user } = useSelector((state: RootState) => state.auth);

    const progress = user?.progressSystem || {
        currentLevel: 1,
        currentXP: 0,
        xpToNextLevel: 1000,
        totalWorkoutsCompleted: 0,
        unlockedExercises: []
    };

    const currentLevel = progress.currentLevel;
    const currentXP = progress.currentXP;

    const levelThreshold = ProgressionService.getXPThresholdForLevel(currentLevel);
    const nextLevelThreshold = ProgressionService.getXPThresholdForLevel(currentLevel + 1);
    const xpInCurrentLevel = currentXP - levelThreshold;
    const xpRequiredForLevel = nextLevelThreshold - levelThreshold;
    const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForLevel) * 100));

    const unlockedExercises = ProgressionService.getExercisesUnlockedAtLevel(currentLevel);
    const upNext = ProgressionService.getExercisesUnlockedAtLevel(currentLevel + 1);

    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Level Up Progress</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Level Card */}
                <BlurView intensity={20} tint="light" style={styles.levelCard}>
                    <LinearGradient
                        colors={Gradients.primary}
                        style={styles.levelCircle}
                    >
                        <Text style={styles.levelNumber}>{currentLevel}</Text>
                        <Text style={styles.levelLabel}>LEVEL</Text>
                    </LinearGradient>

                    <View style={styles.xpInfo}>
                        <View style={styles.xpHeader}>
                            <Text style={styles.xpText}>{xpInCurrentLevel} / {xpRequiredForLevel} XP</Text>
                            <Text style={styles.percentText}>{progressPercent}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <LinearGradient
                                colors={Gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressFill, { width: `${progressPercent}%` }]}
                            />
                        </View>
                        <Text style={styles.totalXP}>Total XP: {currentXP.toLocaleString()}</Text>
                    </View>
                </BlurView>

                {/* Unlocked This Level */}
                {unlockedExercises.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🏆 Unlocked at Level {currentLevel}</Text>
                        <View style={styles.unlockGrid}>
                            {unlockedExercises.map(ex => (
                                <View key={ex.id} style={styles.unlockItem}>
                                    <Text style={styles.unlockIcon}>✨</Text>
                                    <Text style={styles.unlockName}>{ex.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Coming Soon */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔜 Coming at Level {currentLevel + 1}</Text>
                    {upNext.length > 0 ? (
                        <View style={styles.unlockGrid}>
                            {upNext.map(ex => (
                                <View key={ex.id} style={styles.lockedItem}>
                                    <Text style={styles.lockedIcon}>🔒</Text>
                                    <Text style={styles.lockedName}>{ex.name}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <BlurView intensity={10} style={styles.emptyCard}>
                            <Text style={styles.emptyText}>Keep training to unlock advanced exercises!</Text>
                        </BlurView>
                    )}
                </View>

                {/* Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Progression Stats</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{progress.totalWorkoutsCompleted}</Text>
                            <Text style={styles.statLabel}>Workouts</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{currentLevel * 5}%</Text>
                            <Text style={styles.statLabel}>Strength Bonus</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('ExerciseLibrary')}
                >
                    <LinearGradient
                        colors={Gradients.primary}
                        style={styles.actionGradient}
                    >
                        <Text style={styles.actionText}>View Exercise Library</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: Spacing.l,
        paddingBottom: Spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: Spacing.m,
    },
    backButtonText: {
        color: Colors.primaryStart,
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
    },
    levelCard: {
        borderRadius: Layout.borderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        ...Shadows.glow,
    },
    levelCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    levelNumber: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    levelLabel: {
        fontSize: 10,
        color: Colors.textPrimary,
        opacity: 0.8,
    },
    xpInfo: {
        width: '100%',
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    xpText: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    percentText: {
        color: Colors.primaryStart,
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
    totalXP: {
        color: Colors.textSecondary,
        fontSize: 12,
        textAlign: 'center',
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
    },
    unlockGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    unlockItem: {
        backgroundColor: 'rgba(0, 200, 83, 0.1)',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 200, 83, 0.3)',
    },
    unlockIcon: {
        marginRight: 8,
    },
    unlockName: {
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    lockedItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.6,
    },
    lockedIcon: {
        marginRight: 8,
    },
    lockedName: {
        color: Colors.textSecondary,
    },
    emptyCard: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 16,
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
    actionButton: {
        marginTop: Spacing.m,
    },
    actionGradient: {
        padding: 16,
        borderRadius: Layout.borderRadius.m,
        alignItems: 'center',
        ...Shadows.glow,
    },
    actionText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

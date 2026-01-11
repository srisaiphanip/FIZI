import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Shadows, Layout, Gradients } from '../theme/Theme';
import { AVATAR_LEVELS, AvatarState } from '../services/AvatarService';

interface LevelXPCardProps {
    level: number;
    xp: number;
    totalWorkouts: number;
}

export default function LevelXPCard({ level, xp, totalWorkouts }: LevelXPCardProps) {
    // Helper to calculate progress
    const getLevelProgress = () => {
        const currentLevelInfo = AVATAR_LEVELS.find(l => l.level === level) || AVATAR_LEVELS[0];
        const nextLevel = AVATAR_LEVELS.find(l => l.level === level + 1);

        if (!nextLevel) return 100;

        const currentLevelXP = currentLevelInfo.minXP || 0;
        const nextLevelXP = nextLevel.minXP || 1000;

        // Ensure we don't have negative progress if logic drifts
        const progress = Math.max(0, xp - currentLevelXP);
        const totalNeeded = nextLevelXP - currentLevelXP;

        return Math.min(100, (progress / totalNeeded) * 100);
    };

    const getXPText = () => {
        const nextLevel = AVATAR_LEVELS.find(l => l.level === level + 1);
        if (!nextLevel) return 'Max Level';

        const formatValue = (val: number) => {
            if (val >= 10000) return (val / 1000).toFixed(1) + 'k';
            return val.toLocaleString();
        };

        return `${formatValue(xp)} / ${formatValue(nextLevel.minXP)} XP`;
    };

    const currentLevelIcon = AVATAR_LEVELS.find(l => l.level === level)?.icon || '✨';

    return (
        <View style={styles.cardContainer}>
            <BlurView intensity={20} tint="dark" style={styles.content}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.label}>Current Level</Text>
                        <Text style={styles.levelValue}>{level}</Text>
                    </View>
                    <View style={styles.iconCircle}>
                        <Text style={styles.emoji}>{currentLevelIcon}</Text>
                    </View>
                </View>

                <View style={styles.barContainer}>
                    <View style={styles.barBg}>
                        <LinearGradient
                            colors={Gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                                styles.barFill,
                                { width: `${getLevelProgress()}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.percentage}>{getXPText()}</Text>
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        marginBottom: Spacing.l,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        ...Shadows.card,
    },
    content: {
        padding: Spacing.m,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    label: {
        fontSize: 14,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    levelValue: {
        fontSize: 36,
        fontWeight: '900',
        color: Colors.textPrimary,
        textShadowColor: Colors.primaryStart,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.glassHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    emoji: {
        fontSize: 24,
    },
    barContainer: {
        marginTop: Spacing.s,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
    barBg: {
        flex: 1,
        height: 12,
        backgroundColor: Colors.glassSurface,
        borderRadius: 6,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 6,
    },
    percentage: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.accentCyan,
        textAlign: 'right',
        minWidth: 100,
    },
});

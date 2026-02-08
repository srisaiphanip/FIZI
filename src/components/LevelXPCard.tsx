import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Spacing, Shadows, Layout, ThemeColorsType, ThemeShadowsType } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import { AVATAR_LEVELS } from '../services/AvatarService';

interface LevelXPCardProps {
    level: number;
    xp: number;
    totalWorkouts: number;
}

export default function LevelXPCard({ level, xp, totalWorkouts }: LevelXPCardProps) {
    const { colors, gradients, shadows, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);

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

    const currentLevelInfo = AVATAR_LEVELS.find(l => l.level === level) || AVATAR_LEVELS[0];
    const currentLevelIcon = currentLevelInfo.icon || '✨';
    const currentLevelName = currentLevelInfo.name || 'Rookie';

    return (
        <View style={styles.cardContainer}>
            {/* Main Gradient Background */}
            <LinearGradient
                colors={isDark
                    ? ['rgba(20, 20, 30, 0.8)', 'rgba(30, 30, 45, 0.9)']
                    : ['rgba(255, 255, 255, 0.85)', 'rgba(240, 245, 255, 0.9)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Subtle Overlay Gradient for Gloss */}
            <LinearGradient
                colors={isDark
                    ? [colors.accentCyan + '10', 'transparent']
                    : [colors.primaryStart + '05', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 0.8 }}
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.label}>Current Rank</Text>
                        <View style={styles.levelNameContainer}>
                            <Text style={styles.levelName}>{currentLevelName}</Text>
                            <View style={styles.levelPill}>
                                <Text style={styles.levelPillText}>Lvl {level}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Level Icon with Glow Ring */}
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={[colors.accentCyan + '40', 'transparent']}
                            style={styles.iconGlow}
                        />
                        <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.iconCircle}>
                            <Text style={styles.emoji}>{currentLevelIcon}</Text>
                        </BlurView>
                    </View>
                </View>

                {/* Main Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.xpLabel}>XP Progress</Text>
                        <Text style={styles.xpValue}>{getXPText()}</Text>
                    </View>

                    <View style={styles.barContainer}>
                        <View style={styles.barBg}>
                            <LinearGradient
                                colors={gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.barFill,
                                    { width: `${getLevelProgress()}%` }
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* Footer Stats */}
                <View style={styles.footer}>
                    <LinearGradient
                        colors={isDark
                            ? [colors.cardSurface, colors.cardSurface]
                            : ['rgba(255,255,255, 0.5)', 'rgba(255,255,255, 0.2)']}
                        style={styles.statBadge}
                    >
                        <MaterialCommunityIcons name="trophy-outline" size={16} color={colors.accentYellow} />
                        <Text style={styles.statLabel}>Total Workouts</Text>
                        <Text style={styles.statValue}>{totalWorkouts}</Text>
                    </LinearGradient>
                </View>
            </View>
        </View>
    );
}

const createStyles = (colors: ThemeColorsType, shadows: ThemeShadowsType) => StyleSheet.create({
    cardContainer: {
        borderRadius: Layout.borderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.l,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        minHeight: 180,
        ...shadows.card,
    },
    content: {
        padding: Spacing.m,
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.l,
    },
    label: {
        fontSize: 12,
        color: colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: '700',
        marginBottom: 4,
    },
    levelNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    levelName: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: -0.5,
        textShadowColor: colors.backgroundDarker,
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    iconContainer: {
        position: 'relative',
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconGlow: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        opacity: 0.6,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        overflow: 'hidden',
    },
    emoji: {
        fontSize: 28,
    },
    levelPill: {
        marginLeft: 8,
        backgroundColor: colors.glassHighlight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.accentCyan + '40',
    },
    levelPillText: {
        color: colors.accentCyan,
        fontWeight: '800',
        fontSize: 14,
    },

    // Progress
    progressSection: {
        marginBottom: Spacing.m,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    xpLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    xpValue: {
        fontSize: 12,
        color: colors.accentCyan,
        fontWeight: '700',
        fontFamily: 'System', // Monospace if available, else System
    },
    barContainer: {
        height: 14,
        backgroundColor: colors.backgroundDarker,
        borderRadius: 7,
        padding: 2,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    barBg: {
        flex: 1,
        borderRadius: 5,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 5,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        gap: 8,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 13,
        color: colors.textPrimary,
        fontWeight: '800',
    },
});

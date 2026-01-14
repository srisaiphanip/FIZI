import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Spacing, Layout, ThemeColorsType, ThemeShadowsType } from '../../theme/Theme';
import { useTheme } from '../../hooks/useTheme';
import { WorkoutPlan } from '../../types';
import { getSimplifiedFocus } from '../../utils/workoutUtils';


interface WeeklyScheduleProps {
    currentPlan: WorkoutPlan;
    selectedDayIndex: number | null;
    onDaySelect: (index: number) => void;
    onLayout?: (event: any) => void;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
    currentPlan,
    selectedDayIndex,
    onDaySelect,
    onLayout
}) => {
    const { colors, shadows } = useTheme();
    const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
    return (
        <View style={styles.section} onLayout={onLayout}>
            <Text style={styles.sectionTitle}>📅 Weekly Schedule</Text>
            <View style={styles.weeklyGrid}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const dayOfWeek = (idx + 1) % 7;
                    const session = currentPlan.sessions.find(s => s.dayOfWeek === dayOfWeek);
                    const isToday = new Date().getDay() === dayOfWeek;
                    const isSelected = selectedDayIndex === idx;
                    const isRest = session?.isRestDay || session?.type === 'rest';

                    return (
                        <TouchableOpacity
                            key={day}
                            onPress={() => onDaySelect(idx)}
                            style={[
                                styles.gridDayCard,
                                isToday && styles.gridDayToday,
                                isSelected && styles.gridDaySelected
                            ]}
                        >
                            <Text style={[
                                styles.gridDayLabel,
                                isToday && styles.gridDayLabelToday,
                                isSelected && styles.gridDayLabelSelected
                            ]}>{day}</Text>
                            <Text style={styles.gridDayIcon}>💪</Text>
                            <Text style={[
                                styles.gridDayFocus,
                                isToday && styles.gridDayFocusToday,
                                isSelected && styles.gridDayFocusSelected
                            ]} numberOfLines={1}>
                                {getSimplifiedFocus(session?.focus || 'Workout')}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <Text style={styles.gridHint}>💜 = Today | Select any day to see details</Text>
        </View>
    );
};

const createStyles = (colors: ThemeColorsType, shadows: ThemeShadowsType) => StyleSheet.create({
    section: {
        marginBottom: Spacing.l,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: Spacing.m,
        marginLeft: Spacing.xs,
    },
    weeklyGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.xs,
        marginBottom: Spacing.s,
    },
    // Grid Day Card
    gridDayCard: {
        flex: 1, // Distribute evenly
        aspectRatio: 0.6,
        borderRadius: Layout.borderRadius.m, // Maximum rounding
        backgroundColor: colors.glassSurface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        marginHorizontal: 2, // Minimal spacing
        ...shadows.small,
    },
    gridDayToday: {
        backgroundColor: colors.primaryStart + '33', // 20% opacity
        borderColor: colors.primaryStart,
    },
    gridDaySelected: {
        backgroundColor: colors.primaryStart,
        borderColor: colors.primaryStart,
        transform: [{ scale: 1.05 }],
        ...shadows.glow,
    },
    gridDayRest: {
        backgroundColor: colors.glassSurface,
        borderColor: colors.glassBorder,
        opacity: 0.6,
    },
    gridDayLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
    },
    gridDayLabelToday: {
        color: colors.primaryStart,
        fontWeight: 'bold',
    },
    gridDayLabelSelected: {
        color: '#FFFFFF',
    },
    gridDayLabelRest: {
        color: colors.textTertiary,
    },
    gridDayIcon: {
        fontSize: 16,
        marginBottom: 4,
    },
    gridDayFocus: {
        fontSize: 9,
        color: colors.textSecondary,
        textAlign: 'center',
        width: '100%',
        paddingHorizontal: 2,
    },
    gridDayFocusToday: {
        color: colors.textPrimary,
        fontWeight: '600',
    },
    gridDayFocusSelected: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    gridDayFocusRest: {
        color: colors.textTertiary,
        fontStyle: 'italic',
    },
    gridHint: {
        fontSize: 12,
        color: colors.textTertiary,
        textAlign: 'center',
        marginTop: Spacing.s,
    },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Layout } from '../../theme/Theme';
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
                                isSelected && styles.gridDaySelected,
                                isRest && styles.gridDayRest
                            ]}
                        >
                            <Text style={[
                                styles.gridDayLabel,
                                isToday && styles.gridDayLabelToday,
                                isSelected && styles.gridDayLabelSelected,
                                isRest && styles.gridDayLabelRest
                            ]}>{day}</Text>
                            <Text style={styles.gridDayIcon}>{isRest ? '🧘' : '💪'}</Text>
                            <Text style={[
                                styles.gridDayFocus,
                                isToday && styles.gridDayFocusToday,
                                isSelected && styles.gridDayFocusSelected,
                                isRest && styles.gridDayFocusRest
                            ]} numberOfLines={1}>
                                {isRest ? 'Rest' : getSimplifiedFocus(session?.focus || 'Workout')}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <Text style={styles.gridHint}>💜 = Today | Select any day to see details</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: Spacing.l,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
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
        borderRadius: Layout.borderRadius.l, // Maximum rounding
        backgroundColor: Colors.glassSurface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        marginHorizontal: 2, // Minimal spacing
    },
    gridDayToday: {
        backgroundColor: 'rgba(124, 58, 237, 0.2)', // Primary purple tint
        borderColor: Colors.primaryStart,
    },
    gridDaySelected: {
        backgroundColor: Colors.primaryStart,
        borderColor: Colors.primaryStart,
        transform: [{ scale: 1.05 }],
    },
    gridDayRest: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    gridDayLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
    },
    gridDayLabelToday: {
        color: Colors.primaryStart,
        fontWeight: 'bold',
    },
    gridDayLabelSelected: {
        color: '#FFFFFF',
    },
    gridDayLabelRest: {
        color: Colors.textTertiary,
    },
    gridDayIcon: {
        fontSize: 16,
        marginBottom: 4,
    },
    gridDayFocus: {
        fontSize: 9,
        color: Colors.textSecondary,
        textAlign: 'center',
        width: '100%',
        paddingHorizontal: 2,
    },
    gridDayFocusToday: {
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    gridDayFocusSelected: {
        color: 'rgba(255, 255, 255, 0.9)',
    },
    gridDayFocusRest: {
        color: Colors.textTertiary,
        fontStyle: 'italic',
    },
    gridHint: {
        fontSize: 12,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginTop: Spacing.s,
    },
});

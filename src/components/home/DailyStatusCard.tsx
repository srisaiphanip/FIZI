import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, Layout, Shadows } from '../../theme/Theme';

interface DailyStatusCardProps {
    isRestDay: boolean;
}

export const DailyStatusCard: React.FC<DailyStatusCardProps> = ({ isRestDay }) => {
    return (
        <BlurView intensity={30} tint="dark" style={styles.todayStatusCard}>
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
    );
};

const styles = StyleSheet.create({
    todayStatusCard: {
        marginBottom: Spacing.l,
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        ...Shadows.card,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.m,
    },
    statusLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    statusDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    statusBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadgeWorkout: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(74, 222, 128, 0.1)', // Cyan tint
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: Layout.borderRadius.round, // Pill shape
        borderWidth: 1,
        borderColor: Colors.accentSuccess,
    },
    statusBadgeRest: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: Layout.borderRadius.round, // Pill shape
        borderWidth: 1,
        borderColor: Colors.textSecondary,
    },
    statusBadgeText: {
        color: Colors.textPrimary,
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    statusEmoji: {
        fontSize: 16,
    },
});

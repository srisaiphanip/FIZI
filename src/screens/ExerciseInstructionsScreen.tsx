import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Gradients, Spacing, Shadows, Layout } from '../theme/Theme';
import { getExerciseById } from '../models/exercises';

interface ExerciseInstructionsScreenProps {
    navigation: any;
}

const { width, height } = Dimensions.get('window');

export default function ExerciseInstructionsScreen({ navigation }: ExerciseInstructionsScreenProps) {
    const params = navigation.params || {};
    const exerciseId = params.exerciseId || 'push-ups';
    const exercise = getExerciseById(exerciseId);

    if (!exercise) {
        return (
            <LinearGradient colors={Gradients.background} style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.errorText}>Exercise data not found.</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    const handleStart = () => {
        navigation.navigate('Camera', {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            targetSets: params.targetSets,
            targetReps: params.targetReps,
            fromPlan: params.fromPlan
        });
    };

    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Back Button */}
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.headerBackButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={Colors.textPrimary} />
                </TouchableOpacity>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <MaterialCommunityIcons
                        name="dumbbell"
                        size={80}
                        color={Colors.primaryStart}
                        style={styles.heroIcon}
                    />
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{exercise.category.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Description */}
                <BlurView intensity={10} tint="light" style={styles.card}>
                    <Text style={styles.cardTitle}>About Exercise</Text>
                    <Text style={styles.descriptionText}>{exercise.description || "Perfect your form with AI-powered correction."}</Text>
                </BlurView>

                {/* Steps */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Execution Steps</Text>
                    <View style={styles.stepsTextContainer}>
                        {(exercise.instructions || exercise.steps)?.map((step: string, index: number) => (
                            <View key={index} style={styles.bulletPointRow}>
                                <Text style={styles.bulletPoint}>•</Text>
                                <Text style={styles.stepTextSimple}>{step}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Tips */}
                {exercise.tips && exercise.tips.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pro Tips 💡</Text>
                        <BlurView intensity={15} tint="light" style={styles.tipsCard}>
                            {exercise.tips.map((tip, index) => (
                                <View key={index} style={styles.tipRow}>
                                    <MaterialCommunityIcons name="check-circle-outline" size={20} color={Colors.accentCyan} />
                                    <Text style={styles.tipText}>{tip}</Text>
                                </View>
                            ))}
                        </BlurView>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Sticky Start Button */}
            <View style={styles.footer}>
                <TouchableOpacity activeOpacity={0.9} onPress={handleStart} style={styles.startWorkoutButtonContainer}>
                    <LinearGradient
                        colors={Gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.startWorkoutButton}
                    >
                        <Text style={styles.startWorkoutButtonText}>Start Exercise</Text>
                        <MaterialCommunityIcons name="play-circle" size={24} color={Colors.textPrimary} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

function getIconForExercise(id: string): any {
    // Temporarily using dumbbell for all exercises
    return 'dumbbell';

    /* Original icon mapping:
    switch (id) {
        case 'push-ups': return 'arm-flex';
        case 'squats': return 'human-handsdown';
        case 'plank': return 'floor-lamp';
        case 'bicep-curls': return 'weight-lifter';
        case 'burpees': return 'run-fast';
        case 'jumping-jacks': return 'human-greeting';
        default: return 'lightning-bolt';
    }
    */
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.l,
        paddingTop: 50,
    },
    headerBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.glassSurface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.m,
    },
    heroIcon: {
        marginBottom: Spacing.m,
        ...Shadows.glow,
    },
    exerciseName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.s,
    },
    categoryBadge: {
        backgroundColor: 'rgba(0, 210, 211, 0.2)',
        paddingHorizontal: Spacing.m,
        paddingVertical: 4,
        borderRadius: Layout.borderRadius.round,
        borderWidth: 1,
        borderColor: Colors.accentCyan,
    },
    categoryText: {
        color: Colors.accentCyan,
        fontSize: 12,
        fontWeight: 'bold',
    },
    card: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        marginBottom: Spacing.xl,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.s,
    },
    descriptionText: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
    },
    stepsTextContainer: {
        gap: Spacing.s,
    },
    bulletPointRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.s,
    },
    bulletPoint: {
        color: Colors.primaryStart,
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: Spacing.m,
        lineHeight: 22,
    },
    stepTextSimple: {
        flex: 1,
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    stepCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        marginBottom: Spacing.m,
    },
    stepNumberContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primaryStart,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
    },
    stepNumber: {
        color: Colors.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    tipsCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.m,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.s,
        gap: Spacing.s,
    },
    tipText: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.l,
        paddingBottom: 40,
        backgroundColor: 'transparent',
    },
    startWorkoutButtonContainer: {
        ...Shadows.glow,
    },
    startWorkoutButton: {
        height: 64,
        borderRadius: Layout.borderRadius.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.m,
    },
    startWorkoutButtonText: {
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: Colors.textPrimary,
        fontSize: 18,
        marginBottom: Spacing.m,
    },
    backButton: {
        padding: Spacing.m,
        backgroundColor: Colors.primaryStart,
        borderRadius: Layout.borderRadius.m,
    },
    backButtonText: {
        color: Colors.textPrimary,
        fontWeight: 'bold',
    },
});

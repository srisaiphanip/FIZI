import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NutritionService from '../../services/NutritionService';
import { DietPlan } from '../../types/nutrition';

const { width } = Dimensions.get('window');

interface DietTabProps {
    user: any;
}

export function DietTab({ user }: DietTabProps) {
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMealIndex, setSelectedMealIndex] = useState(0);

    useEffect(() => {
        loadDietPlan();
    }, []);

    const loadDietPlan = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const plan = await NutritionService.generateDietPlan(user);
            setDietPlan(plan);
        } catch (error) {
            console.error('Error loading diet plan:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !dietPlan) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Calculating your personalized nutrition plan...</Text>
            </View>
        );
    }

    const { nutritionProfile, foodSuggestions, preworkoutTips, postworkoutTips, guidelines } = dietPlan;

    return (
        <>
            {/* Goal Header */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.goalHeader}
            >
                <Text style={styles.goalText}>
                    {user?.fitnessGoal.replace('_', ' ').toUpperCase() || 'MAINTENANCE'}
                </Text>
            </LinearGradient>

            {/* Daily Calorie Target */}
            <View style={styles.calorieCard}>
                <Text style={styles.sectionTitle}>Daily Calorie Target</Text>
                <View style={styles.calorieCircle}>
                    <Text style={styles.calorieNumber}>{nutritionProfile.dailyCalories}</Text>
                    <Text style={styles.calorieLabel}>calories</Text>
                </View>
                <View style={styles.metabolicInfo}>
                    <View style={styles.metabolicItem}>
                        <Text style={styles.metabolicLabel}>BMR</Text>
                        <Text style={styles.metabolicValue}>{Math.round(nutritionProfile.bmr)}</Text>
                    </View>
                    <View style={styles.metabolicItem}>
                        <Text style={styles.metabolicLabel}>TDEE</Text>
                        <Text style={styles.metabolicValue}>{Math.round(nutritionProfile.tdee)}</Text>
                    </View>
                    <View style={styles.metabolicItem}>
                        <Text style={styles.metabolicLabel}>Water</Text>
                        <Text style={styles.metabolicValue}>{nutritionProfile.waterIntake}L</Text>
                    </View>
                </View>
            </View>

            {/* Macronutrient Breakdown */}
            <View style={styles.macroCard}>
                <Text style={styles.sectionTitle}>Daily Macros</Text>

                {/* Protein */}
                <View style={styles.macroRow}>
                    <View style={styles.macroInfo}>
                        <Text style={styles.macroName}>Protein</Text>
                        <Text style={styles.macroAmount}>{nutritionProfile.macros.protein}g</Text>
                    </View>
                    <View style={styles.macroBarContainer}>
                        <View style={[styles.macroBar, { width: `${nutritionProfile.macroPercentages.protein}%`, backgroundColor: '#ff6b6b' }]} />
                    </View>
                    <Text style={styles.macroPercent}>{nutritionProfile.macroPercentages.protein}%</Text>
                </View>

                {/* Carbs */}
                <View style={styles.macroRow}>
                    <View style={styles.macroInfo}>
                        <Text style={styles.macroName}>Carbs</Text>
                        <Text style={styles.macroAmount}>{nutritionProfile.macros.carbs}g</Text>
                    </View>
                    <View style={styles.macroBarContainer}>
                        <View style={[styles.macroBar, { width: `${nutritionProfile.macroPercentages.carbs}%`, backgroundColor: '#4ecdc4' }]} />
                    </View>
                    <Text style={styles.macroPercent}>{nutritionProfile.macroPercentages.carbs}%</Text>
                </View>

                {/* Fats */}
                <View style={styles.macroRow}>
                    <View style={styles.macroInfo}>
                        <Text style={styles.macroName}>Fats</Text>
                        <Text style={styles.macroAmount}>{nutritionProfile.macros.fats}g</Text>
                    </View>
                    <View style={styles.macroBarContainer}>
                        <View style={[styles.macroBar, { width: `${nutritionProfile.macroPercentages.fats}%`, backgroundColor: '#f7b731' }]} />
                    </View>
                    <Text style={styles.macroPercent}>{nutritionProfile.macroPercentages.fats}%</Text>
                </View>
            </View>

            {/* Meal Timing */}
            <View style={styles.mealCard}>
                <Text style={styles.sectionTitle}>Meal Schedule ({nutritionProfile.mealPlan.mealsPerDay} meals/day)</Text>
                {nutritionProfile.mealPlan.mealTimings.map((meal: any, index: number) => (
                    <TouchableOpacity
                        key={meal.id}
                        style={[styles.mealRow, selectedMealIndex === index && styles.mealRowSelected]}
                        onPress={() => setSelectedMealIndex(index)}
                    >
                        <View style={styles.mealTimeContainer}>
                            <Text style={styles.mealTime}>{meal.time}</Text>
                        </View>
                        <View style={styles.mealContent}>
                            <Text style={styles.mealName}>{meal.name}</Text>
                            {meal.notes && <Text style={styles.mealNotes}>{meal.notes}</Text>}
                            <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                        </View>
                        <View style={styles.mealMacros}>
                            <Text style={styles.mealMacroText}>P: {meal.macros.protein}g</Text>
                            <Text style={styles.mealMacroText}>C: {meal.macros.carbs}g</Text>
                            <Text style={styles.mealMacroText}>F: {meal.macros.fats}g</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Food Suggestions */}
            <View style={styles.foodCard}>
                <Text style={styles.sectionTitle}>Food Suggestions</Text>

                {/* Protein */}
                <Text style={styles.foodCategoryTitle}>🥩 Protein Sources</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.foodScroll}>
                    {foodSuggestions.protein.slice(0, 6).map((food: any, index: number) => (
                        <View key={index} style={styles.foodItem}>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <Text style={styles.foodServing}>{food.servingSize}</Text>
                            <Text style={styles.foodCalories}>{food.calories} cal</Text>
                            <Text style={styles.foodProtein}>{food.protein}g protein</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Carbs */}
                <Text style={styles.foodCategoryTitle}>🍞 Carb Sources</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.foodScroll}>
                    {foodSuggestions.carbs.slice(0, 6).map((food: any, index: number) => (
                        <View key={index} style={styles.foodItem}>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <Text style={styles.foodServing}>{food.servingSize}</Text>
                            <Text style={styles.foodCalories}>{food.calories} cal</Text>
                            <Text style={styles.foodCarbs}>{food.carbs}g carbs</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Healthy Fats */}
                <Text style={styles.foodCategoryTitle}>🥑 Healthy Fats</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.foodScroll}>
                    {foodSuggestions.fats.slice(0, 6).map((food: any, index: number) => (
                        <View key={index} style={styles.foodItem}>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <Text style={styles.foodServing}>{food.servingSize}</Text>
                            <Text style={styles.foodCalories}>{food.calories} cal</Text>
                            <Text style={styles.foodFats}>{food.fats}g fats</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Guidelines */}
            <View style={styles.guidelinesCard}>
                <Text style={styles.sectionTitle}>Nutrition Guidelines</Text>
                {guidelines.map((guideline: string, index: number) => (
                    <View key={index} style={styles.guidelineRow}>
                        <Text style={styles.guidelineBullet}>•</Text>
                        <Text style={styles.guidelineText}>{guideline}</Text>
                    </View>
                ))}
            </View>

            {/* Workout Nutrition Tips */}
            <View style={styles.workoutTipsCard}>
                <Text style={styles.sectionTitle}>💪 Workout Nutrition</Text>

                <Text style={styles.tipSubtitle}>Pre-Workout</Text>
                {preworkoutTips.map((tip: string, index: number) => (
                    <View key={index} style={styles.tipRow}>
                        <Text style={styles.tipBullet}>✓</Text>
                        <Text style={styles.tipText}>{tip}</Text>
                    </View>
                ))}

                <Text style={[styles.tipSubtitle, { marginTop: 15 }]}>Post-Workout</Text>
                {postworkoutTips.map((tip: string, index: number) => (
                    <View key={index} style={styles.tipRow}>
                        <Text style={styles.tipBullet}>✓</Text>
                        <Text style={styles.tipText}>{tip}</Text>
                    </View>
                ))}
            </View>

            <View style={{ height: 40 }} />
        </>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    goalHeader: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
    },
    goalText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    calorieCard: {
        backgroundColor: '#1a1f3a',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 15,
    },
    calorieCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15,
    },
    calorieNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    calorieLabel: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
    },
    metabolicInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    metabolicItem: {
        alignItems: 'center',
    },
    metabolicLabel: {
        fontSize: 12,
        color: '#8e9aaf',
        marginBottom: 5,
    },
    metabolicValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    macroCard: {
        backgroundColor: '#1a1f3a',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
    },
    macroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    macroInfo: {
        width: 80,
    },
    macroName: {
        fontSize: 14,
        color: '#8e9aaf',
        marginBottom: 3,
    },
    macroAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    macroBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#2a2f4a',
        borderRadius: 4,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    macroBar: {
        height: '100%',
        borderRadius: 4,
    },
    macroPercent: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8e9aaf',
        width: 45,
        textAlign: 'right',
    },
    mealCard: {
        backgroundColor: '#1a1f3a',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
    },
    mealRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2f4a',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    mealRowSelected: {
        backgroundColor: '#667eea',
    },
    mealTimeContainer: {
        marginRight: 15,
    },
    mealTime: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    mealContent: {
        flex: 1,
    },
    mealName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 3,
    },
    mealNotes: {
        fontSize: 12,
        color: '#8e9aaf',
        fontStyle: 'italic',
        marginBottom: 3,
    },
    mealCalories: {
        fontSize: 14,
        color: '#4ecdc4',
        fontWeight: '600',
    },
    mealMacros: {
        alignItems: 'flex-end',
    },
    mealMacroText: {
        fontSize: 11,
        color: '#8e9aaf',
        marginBottom: 2,
    },
    foodCard: {
        backgroundColor: '#1a1f3a',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
    },
    foodCategoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginTop: 10,
        marginBottom: 10,
    },
    foodScroll: {
        marginBottom: 15,
    },
    foodItem: {
        backgroundColor: '#2a2f4a',
        borderRadius: 12,
        padding: 12,
        marginRight: 10,
        width: 120,
    },
    foodName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 5,
    },
    foodServing: {
        fontSize: 11,
        color: '#8e9aaf',
        marginBottom: 8,
    },
    foodCalories: {
        fontSize: 12,
        color: '#4ecdc4',
        marginBottom: 3,
    },
    foodProtein: {
        fontSize: 11,
        color: '#ff6b6b',
    },
    foodCarbs: {
        fontSize: 11,
        color: '#4ecdc4',
    },
    foodFats: {
        fontSize: 11,
        color: '#f7b731',
    },
    guidelinesCard: {
        backgroundColor: '#1a1f3a',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
    },
    guidelineRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    guidelineBullet: {
        color: '#667eea',
        fontSize: 16,
        marginRight: 10,
        fontWeight: 'bold',
    },
    guidelineText: {
        flex: 1,
        fontSize: 14,
        color: '#8e9aaf',
        lineHeight: 20,
    },
    workoutTipsCard: {
        backgroundColor: '#1a1f3a',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
    },
    tipSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 10,
    },
    tipRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    tipBullet: {
        color: '#4ecdc4',
        fontSize: 14,
        marginRight: 10,
        fontWeight: 'bold',
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: '#8e9aaf',
        lineHeight: 18,
    },
});

import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Image,
    Animated,
    Modal,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import { ThemeColorsType, ThemeShadowsType, Layout, Spacing } from '../../theme/Theme';
import NutritionService from '../../services/NutritionService';
import { DietPlan, FoodSuggestion } from '../../types/nutrition';

interface DietTabProps {
    user: any;
}

export function DietTab({ user }: DietTabProps) {
    const { colors, gradients, shadows, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, shadows, isDark), [colors, shadows, isDark]);
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedMealIndices, setExpandedMealIndices] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
    const [eatenMealIds, setEatenMealIds] = useState<string[]>([]);
    const [takenSupplementIds, setTakenSupplementIds] = useState<string[]>([]);
    const [dietaryPreference, setDietaryPreference] = useState<'veg' | 'non-veg'>('non-veg');
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
    const [waterDrank, setWaterDrank] = useState(0); // L consumed

    // Generate last 7 days for calendar strip
    const weekDates = useMemo(() => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - 3 + i); // 3 days back, 3 days forward
            dates.push(d);
        }
        return dates;
    }, []);
    // Weekly rotating recipes - one for each day
    const weeklyRecipes = useMemo(() => [
        // Monday - Veg
        {
            title: 'Avocado & Quinoa Power Bowl',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
            calories: 450,
            time: '15 min',
            difficulty: 'Easy',
            dietaryType: 'veg',
            ingredients: [
                '1 cup cooked Quinoa',
                '1/2 Avocado, sliced',
                '1/2 cup Chickpeas, rinsed',
                '1/4 Cucumber, diced',
                '1 tbsp Olive Oil',
                'Lemon juice to taste',
                'Salt & Pepper'
            ],
            instructions: [
                'In a bowl, combine the cooked quinoa, chickpeas, and cucumber.',
                'Top with fresh avocado slices.',
                'Drizzle with olive oil and lemon juice.',
                'Season with salt and pepper to taste.'
            ],
            macros: { protein: 12, carbs: 45, fats: 18 }
        },
        // Tuesday - Non-Veg
        {
            title: 'Grilled Salmon with Asparagus',
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80',
            calories: 520,
            time: '25 min',
            difficulty: 'Medium',
            dietaryType: 'non-veg',
            ingredients: [
                '1 Salmon Fillet (6oz)',
                '1 bunch Asparagus, trimmed',
                '1 tbsp Olive Oil',
                '1 clove Garlic, minced',
                'Lemon slices',
                'Fresh dill'
            ],
            instructions: [
                'Season salmon fillet with salt, pepper, and minced garlic.',
                'Toss asparagus with olive oil and season.',
                'Grill or pan-sear salmon for 4-5 mins per side.',
                'Grill asparagus until tender (approx 5 mins).',
                'Serve with lemon wedges and fresh dill.'
            ],
            macros: { protein: 42, carbs: 5, fats: 28 }
        },
        // Wednesday - Veg
        {
            title: 'Mediterranean Chickpea Bowl',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
            calories: 380,
            time: '20 min',
            difficulty: 'Easy',
            dietaryType: 'veg',
            ingredients: [
                '1 cup Chickpeas',
                '1/2 cup Cherry Tomatoes, halved',
                '1/4 cup Cucumber, diced',
                '2 tbsp Feta Cheese (optional)',
                '1 tbsp Olive Oil',
                'Dried Oregano'
            ],
            instructions: [
                'Rinse and drain chickpeas.',
                'In a bowl, mix chickpeas, tomatoes, and cucumber.',
                'Crumble toppings over the salad.',
                'Drizzle with olive oil and sprinkle oregano.',
                'Toss gently to combine.'
            ],
            macros: { protein: 14, carbs: 40, fats: 15 }
        },
        // Thursday - Non-Veg
        {
            title: 'Chicken Teriyaki with Broccoli',
            image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&q=80',
            calories: 480,
            time: '30 min',
            difficulty: 'Medium',
            dietaryType: 'non-veg',
            ingredients: [
                '1 Chicken Breast, cubed',
                '1 cup Broccoli florets',
                '2 tbsp Teriyaki Sauce',
                '1/2 cup Brown Rice, cooked',
                '1 tsp Sesame Seeds',
                'Green onions for garnish'
            ],
            instructions: [
                'Sauté chicken cubes in a pan until golden.',
                'Add broccoli and a splash of water, cover to steam for 3 mins.',
                'Pour in teriyaki sauce and toss to coat.',
                'Serve over brown rice.',
                'Garnish with sesame seeds and green onions.'
            ],
            macros: { protein: 35, carbs: 55, fats: 10 }
        },
        // Friday - Veg
        {
            title: 'Thai Peanut Tofu Stir-Fry',
            image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
            calories: 420,
            time: '20 min',
            difficulty: 'Easy',
            dietaryType: 'veg',
            ingredients: [
                '1 block Firm Tofu, cubed',
                '1 cup Mixed Veggies (Bell pepper, snap peas)',
                '2 tbsp Peanut Butter',
                '1 tbsp Soy Sauce (or Tamari)',
                '1 tsp Sriracha',
                '1/2 Lime'
            ],
            instructions: [
                'Pan-fry tofu cubes until crispy.',
                'Stir-fry mixed vegetables until tender-crisp.',
                'Whisk peanut butter, soy sauce, sriracha, and lime juice for sauce.',
                'Add tofu back to pan with veggies and pour sauce over.',
                'Toss to combine and serve warm.'
            ],
            macros: { protein: 22, carbs: 30, fats: 24 }
        },
        // Saturday - Non-Veg
        {
            title: 'Honey Garlic Shrimp & Veggies',
            image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&q=80',
            calories: 390,
            time: '18 min',
            difficulty: 'Easy',
            dietaryType: 'non-veg',
            ingredients: [
                '1/2 lb Shrimp, peeled',
                '1 Zucchini, sliced',
                '1 tbsp Honey',
                '1 tbsp Soy Sauce',
                '1 clove Garlic, minced',
                'Red pepper flakes'
            ],
            instructions: [
                'Whisk honey, soy sauce, and garlic.',
                'Sauté zucchini in a pan for 3 mins.',
                'Add shrimp and cook until pink (2-3 mins).',
                'Pour sauce into pan and simmer until thickened.',
                'Serve immediately, sprinkled with red pepper flakes.'
            ],
            macros: { protein: 30, carbs: 25, fats: 12 }
        },
        // Sunday - Veg
        {
            title: 'Roasted Veggie Buddha Bowl',
            image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=500&q=80',
            calories: 410,
            time: '35 min',
            difficulty: 'Medium',
            dietaryType: 'veg',
            ingredients: [
                '1 cup Sweet Potato, cubed',
                '1 cup Kale, chopped',
                '1/2 cup Chickpeas',
                '1 tbsp Tahini',
                'Lemon juice',
                '1 tbsp Pumpkin Seeds'
            ],
            instructions: [
                'Roast sweet potato cubes at 400°F (200°C) for 25 mins.',
                'Massage kale with a little olive oil.',
                'Assemble bowl with roasted sweet potato, kale, and chickpeas.',
                'Whisk tahini and lemon juice with water for dressing.',
                'Drizzle dressing and top with pumpkin seeds.'
            ],
            macros: { protein: 12, carbs: 55, fats: 16 }
        }
    ], []);

    const defaultSupplements = useMemo(() => [
        { id: 'supp_1', name: 'Whey Protein', icon: 'cup-water', calories: 120 },
        { id: 'supp_2', name: 'Creatine Monohydrate', icon: 'atom', calories: 0 },
        { id: 'supp_3', name: 'Omega-3 (Fish Oil)', icon: 'fish', calories: 20 },
        { id: 'supp_4', name: 'Multivitamin', icon: 'pill', calories: 0 }
    ], []);

    const consumedCalories = useMemo(() => {
        if (!dietPlan) return 0;
        const mealCals = dietPlan.nutritionProfile.mealPlan.mealTimings
            .filter(m => eatenMealIds.includes(m.id))
            .reduce((sum, m) => sum + m.calories, 0);
        const suppCals = defaultSupplements
            .filter(s => takenSupplementIds.includes(s.id))
            .reduce((sum, s) => sum + s.calories, 0);
        return mealCals + suppCals;
    }, [eatenMealIds, takenSupplementIds, dietPlan, defaultSupplements]);

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

    const filteredSuggestions = useMemo(() => {
        if (!dietPlan || !dietPlan.foodSuggestions) return null;
        const suggestions = dietPlan.foodSuggestions;

        // For veg: exclude non-veg items only
        // For non-veg: show ALL items (non-veg people eat everything)
        const filterFn = (food: any) => {
            if (dietaryPreference === 'veg') {
                return food.dietaryType !== 'non-veg';
            } else {
                return true; // show all items
            }
        };

        return {
            protein: suggestions.protein.filter(filterFn),
            carbs: suggestions.carbs.filter(filterFn),
            fats: suggestions.fats.filter(filterFn),
            vegetables: suggestions.vegetables.filter(filterFn),
            fruits: suggestions.fruits.filter(filterFn)
        };
    }, [dietPlan, dietaryPreference]);

    // Get current day's recipe (0 = Sunday, 1 = Monday, etc.)
    const dailyRecipe = useMemo(() => {
        const day = new Date().getDay(); // 0 is Sunday
        // Convert so 0 is Monday (index 0) and 6 is Sunday (index 6)
        const adjustedIndex = day === 0 ? 6 : day - 1;
        return weeklyRecipes[adjustedIndex];
    }, [weeklyRecipes]);

    if (loading || !dietPlan) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accentCyan} />
                <Text style={styles.loadingText}>Calculating your personalized nutrition plan...</Text>
            </View>
        );
    }

    const { nutritionProfile, preworkoutTips, postworkoutTips, guidelines } = dietPlan;
    const calorieProgress = Math.min(consumedCalories / nutritionProfile.dailyCalories, 1);
    const caloriesRemaining = Math.max(nutritionProfile.dailyCalories - consumedCalories, 0);

    const toggleMeal = (id: string) => {
        setEatenMealIds(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);
    };

    const toggleSupplement = (id: string) => {
        setTakenSupplementIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
    };

    const getFoodInsight = (category: string, foodName: string) => {
        if (category === 'protein') return 'High Bioavailability';
        if (category === 'carbs') {
            if (foodName.toLowerCase().includes('rice') || foodName.toLowerCase().includes('potato')) return 'Slow Digestion';
            return 'Fiber Rich';
        }
        if (category === 'fats') return 'Heart Healthy';
        return 'Nutrient Dense';
    };

    return (
        <>
            {/* Goal Header */}
            <LinearGradient
                colors={gradients.ocean}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.goalHeader}
            >
                <Text style={styles.goalText}>
                    {user?.fitnessGoal?.replace('_', ' ').toUpperCase() || 'MAINTENANCE'}
                </Text>
                <View style={styles.preferenceToggle}>
                    <TouchableOpacity
                        style={[styles.prefOption, dietaryPreference === 'veg' && styles.prefOptionActive]}
                        onPress={() => setDietaryPreference('veg')}
                    >
                        <MaterialCommunityIcons name="leaf" size={16} color={dietaryPreference === 'veg' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.prefText, dietaryPreference === 'veg' && styles.prefTextActive]}>VEG</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.prefOption, dietaryPreference === 'non-veg' && styles.prefOptionActive]}
                        onPress={() => setDietaryPreference('non-veg')}
                    >
                        <MaterialCommunityIcons name="food-steak" size={16} color={dietaryPreference === 'non-veg' ? '#FFF' : colors.textSecondary} />
                        <Text style={[styles.prefText, dietaryPreference === 'non-veg' && styles.prefTextActive]}>NON-VEG</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Calorie Progress Card */}
            <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "light" : "dark"} style={styles.calorieCard}>
                <View style={styles.calorieHeaderRow}>
                    <View>
                        <Text style={styles.sectionTitle}>Daily Fuel</Text>
                        <Text style={styles.calorieGoalText}>Target: {nutritionProfile.dailyCalories} kcal</Text>
                    </View>
                    <View style={styles.calorieSummary}>
                        <Text style={styles.remainingValue}>{caloriesRemaining}</Text>
                        <Text style={styles.remainingLabel}>Remaining</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressHeaderRow}>
                        <View style={styles.progressLabelGroup}>
                            <MaterialCommunityIcons name="fire" size={28} color={colors.accentWarning} style={{ marginRight: 6, alignSelf: 'center' }} />
                            <Text style={styles.consumedValue}>{consumedCalories}</Text>
                            <Text style={styles.consumedLabel}>KCAL EATEN</Text>
                        </View>
                        <View style={styles.progressPercentGroup}>
                            <View style={[styles.percentBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                <Text style={styles.percentValue}>{Math.round(calorieProgress * 100)}%</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <LinearGradient
                            colors={gradients.ocean}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                                styles.progressBarFill,
                                { width: `${calorieProgress * 100}%` }
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.metabolicInfo}>
                    <View style={styles.metabolicItem}>
                        <MaterialCommunityIcons name="fire" size={16} color={colors.textTertiary} style={{ marginBottom: 4 }} />
                        <Text style={styles.metabolicLabel}>BMR</Text>
                        <Text style={styles.metabolicValue}>{Math.round(nutritionProfile.bmr)}</Text>
                    </View>
                    <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <View style={styles.metabolicItem}>
                        <MaterialCommunityIcons name="run" size={16} color={colors.textTertiary} style={{ marginBottom: 4 }} />
                        <Text style={styles.metabolicLabel}>TDEE</Text>
                        <Text style={styles.metabolicValue}>{Math.round(nutritionProfile.tdee)}</Text>
                    </View>
                    <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <View style={styles.metabolicItem}>
                        <MaterialCommunityIcons name="water-outline" size={16} color={colors.textTertiary} style={{ marginBottom: 4 }} />
                        <Text style={styles.metabolicLabel}>Water</Text>
                        <Text style={styles.metabolicValue}>{nutritionProfile.waterIntake}L</Text>
                    </View>
                </View>
            </BlurView>

            {/* Macronutrient Breakdown */}
            <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "light" : "dark"} style={styles.macroCard}>
                <Text style={styles.sectionTitle}>Daily Macros</Text>

                {/* Protein */}
                <View style={styles.macroRow}>
                    <View style={styles.macroInfo}>
                        <Text style={styles.macroName}>Protein</Text>
                        <Text style={styles.macroAmount}>{nutritionProfile.macros.protein}g</Text>
                    </View>
                    <View style={styles.macroBarContainer}>
                        <View style={[styles.macroBar, { width: `${nutritionProfile.macroPercentages.protein}%`, backgroundColor: colors.accentPink }]} />
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
                        <View style={[styles.macroBar, { width: `${nutritionProfile.macroPercentages.carbs}%`, backgroundColor: colors.accentCyan }]} />
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
                        <View style={[styles.macroBar, { width: `${nutritionProfile.macroPercentages.fats}%`, backgroundColor: colors.accentYellow }]} />
                    </View>
                    <Text style={styles.macroPercent}>{nutritionProfile.macroPercentages.fats}%</Text>
                </View>
            </BlurView>

            <View style={styles.mealContainer}>
                <Text style={styles.sectionTitle}>Meal Schedule ({nutritionProfile.mealPlan.mealsPerDay} meals/day)</Text>
                {nutritionProfile.mealPlan.mealTimings.map((meal: any, index: number) => {
                    const isEaten = eatenMealIds.includes(meal.id);
                    const isSelected = expandedMealIndices.has(index);

                    // Get suggestion based on meal type and calories
                    const getSuggestionItems = () => {
                        const cals = meal.calories;
                        if (meal.id === 'breakfast') {
                            if (dietaryPreference === 'veg') return [
                                { icon: 'barley', text: `Oats (${Math.round(cals / 4)}g) + Milk` },
                                { icon: 'sprout', text: '1 Banana + Almonds' }
                            ];
                            return [
                                { icon: 'egg', text: `${Math.round(cals / 70)} Eggs + Toast` },
                                { icon: 'cup', text: 'Greek Yogurt + Berries' }
                            ];
                        }
                        if (meal.id === 'lunch' || meal.id === 'dinner') {
                            if (dietaryPreference === 'veg') return [
                                { icon: 'cheese', text: `Tofu/Paneer (${Math.round(cals / 2.5)}g)` },
                                { icon: 'bowl-mix', text: 'Rice/Quinoa + Veggies' } // Changed rice to bowl-mix
                            ];
                            return [
                                { icon: 'food-drumstick', text: `Chicken Breast (${Math.round(cals / 1.5)}g)` },
                                { icon: 'bowl-mix', text: 'Rice + Veggies' }
                            ];
                        }
                        if (meal.id === 'snack' || meal.id === 'preworkout') {
                            return [
                                { icon: 'food-apple', text: '1 Apple + Peanut Butter' }, // Changed fruit-apple to food-apple
                                { icon: 'cup-water', text: 'Whey Protein Shake' }
                            ];
                        }
                        return [
                            { icon: 'cup', text: 'Protein Shake' },
                            { icon: 'peanut', text: 'Handful of Nuts' }
                        ];
                    };

                    return (
                        <TouchableOpacity
                            key={meal.id}
                            activeOpacity={0.9}
                            style={[
                                styles.mealRow,
                                isSelected && { flexDirection: 'column', alignItems: 'stretch' },
                                isEaten && styles.mealRowEaten
                            ]}
                            disabled={true} // Disable turning off the expansion
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    style={[styles.checkCircle, isEaten && styles.checkCircleActive]}
                                    onPress={() => toggleMeal(meal.id)}
                                >
                                    {isEaten && <MaterialCommunityIcons name="check" size={16} color="#FFF" />}
                                </TouchableOpacity>
                                <View style={styles.mealContent}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={[styles.mealName, isEaten && styles.strikethrough]}>{meal.name}</Text>
                                        <Text style={[styles.mealCalories, isEaten && { color: '#FFF' }]}>{meal.calories} kcal</Text>
                                    </View>
                                    <View style={styles.mealSpecs}>
                                        <Text style={[styles.mealTime, isEaten && { color: 'rgba(255,255,255,0.7)' }]}>{meal.time}</Text>
                                    </View>
                                </View>
                            </View>

                            {isSelected && (
                                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.glassBorder }}>
                                    {/* Component: Macro Breakdown */}
                                    {meal.macros && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
                                            <View style={{ alignItems: 'center' }}>
                                                <Text style={{ color: colors.accentCyan, fontSize: 12, fontWeight: '700' }}>{meal.macros.protein}g</Text>
                                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>Protein</Text>
                                            </View>
                                            <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                            <View style={{ alignItems: 'center' }}>
                                                <Text style={{ color: colors.accentYellow, fontSize: 12, fontWeight: '700' }}>{meal.macros.carbs}g</Text>
                                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>Carbs</Text>
                                            </View>
                                            <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                            <View style={{ alignItems: 'center' }}>
                                                <Text style={{ color: '#FF6B6B', fontSize: 12, fontWeight: '700' }}>{meal.macros.fats}g</Text>
                                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>Fats</Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Component: Structured Suggestions */}
                                    <Text style={{ fontSize: 11, color: colors.accentCyan, fontWeight: '800', marginBottom: 8, letterSpacing: 1 }}>SUGGESTED MEAL</Text>
                                    <View>
                                        {getSuggestionItems().map((item, idx) => (
                                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                                <MaterialCommunityIcons name={item.icon as any} size={14} color={colors.textSecondary} style={{ marginRight: 8, opacity: 0.8 }} />
                                                <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, fontWeight: '500' }}>{item.text}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Supplements Checklist */}
            <View style={styles.supplementsSection}>
                <Text style={styles.sectionTitle}>Daily Supplements</Text>
                <View style={styles.supplementsGrid}>
                    {defaultSupplements.map((supp) => {
                        const isTaken = takenSupplementIds.includes(supp.id);
                        return (
                            <TouchableOpacity
                                key={supp.id}
                                style={[styles.suppItem, isTaken && styles.suppItemActive]}
                                onPress={() => toggleSupplement(supp.id)}
                            >
                                <MaterialCommunityIcons
                                    name={supp.icon as any}
                                    size={24}
                                    color={isTaken ? '#FFF' : colors.accentCyan}
                                />
                                <Text style={[styles.suppName, isTaken && { color: '#FFF' }]} numberOfLines={2}>{supp.name}</Text>
                                {isTaken && (
                                    <View style={styles.suppCheck}>
                                        <MaterialCommunityIcons name="check" size={10} color={colors.accentCyan} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Food Suggestions */}
            <View style={styles.foodSection}>
                <Text style={styles.sectionTitle}>Smart Food Choices</Text>

                <Text style={styles.foodCategoryTitle}>Proteins</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: Spacing.m }}
                    nestedScrollEnabled={true}
                >
                    {filteredSuggestions?.protein.slice(0, 6).map((food: any, index: number) => (
                        <BlurView key={index} intensity={20} tint={isDark ? "light" : "dark"} style={styles.foodItem}>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <Text style={styles.foodServing}>{food.servingSize}</Text>
                            <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                            <Text style={[styles.foodProtein, { color: colors.accentPink }]}>{food.protein}g protein</Text>
                            <View style={styles.foodInsightBadge}>
                                <Text style={styles.foodInsightText}>{getFoodInsight('protein', food.name)}</Text>
                            </View>
                        </BlurView>
                    ))}
                </ScrollView>

                <Text style={styles.foodCategoryTitle}>Carbohydrates</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: Spacing.m }}
                    nestedScrollEnabled={true}
                >
                    {filteredSuggestions?.carbs.slice(0, 6).map((food: any, index: number) => (
                        <BlurView key={index} intensity={20} tint={isDark ? "light" : "dark"} style={styles.foodItem}>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <Text style={styles.foodServing}>{food.servingSize}</Text>
                            <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                            <Text style={[styles.foodCarbs, { color: colors.accentCyan }]}>{food.carbs}g carbs</Text>
                            <View style={styles.foodInsightBadge}>
                                <Text style={styles.foodInsightText}>{getFoodInsight('carbs', food.name)}</Text>
                            </View>
                        </BlurView>
                    ))}
                </ScrollView>

                <Text style={styles.foodCategoryTitle}>Healthy Fats</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: Spacing.m }}
                    nestedScrollEnabled={true}
                >
                    {filteredSuggestions?.fats.slice(0, 6).map((food: any, index: number) => (
                        <BlurView key={index} intensity={20} tint={isDark ? "light" : "dark"} style={styles.foodItem}>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <Text style={styles.foodServing}>{food.servingSize}</Text>
                            <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                            <Text style={[styles.foodFats, { color: colors.accentYellow }]}>{food.fats}g fats</Text>
                            <View style={styles.foodInsightBadge}>
                                <Text style={styles.foodInsightText}>{getFoodInsight('fats', food.name)}</Text>
                            </View>
                        </BlurView>
                    ))}
                </ScrollView>
            </View>

            {/* Recipe of the Day */}
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.recipeCard}
                onPress={() => setSelectedRecipe(dailyRecipe)}
            >
                <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.recipeCard}>
                    <Image source={{ uri: dailyRecipe.image }} style={styles.recipeImage} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.recipeGradient}
                    />
                    <View style={styles.recipeBadge}>
                        <Text style={styles.recipeBadgeText}>RECIPE OF THE DAY</Text>
                    </View>
                    <View style={styles.recipeInfo}>
                        <Text style={styles.recipeTitle}>{dailyRecipe.title}</Text>
                        <View style={styles.recipeMeta}>
                            <View style={styles.recipeMetaItem}>
                                <MaterialCommunityIcons name="fire" size={14} color={colors.accentWarning} />
                                <Text style={styles.recipeMetaText}>{dailyRecipe.calories} kcal</Text>
                            </View>
                            <View style={styles.recipeMetaItem}>
                                <MaterialCommunityIcons name="clock-outline" size={14} color={colors.accentCyan} />
                                <Text style={styles.recipeMetaText}>{dailyRecipe.time}</Text>
                            </View>
                            <View style={styles.recipeMetaItem}>
                                <MaterialCommunityIcons name="chef-hat" size={14} color={colors.accentPink} />
                                <Text style={styles.recipeMetaText}>{dailyRecipe.difficulty}</Text>
                            </View>
                        </View>
                    </View>
                </BlurView>
            </TouchableOpacity>

            {/* Guidelines */}
            <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.guidelinesCard}>
                <Text style={styles.sectionTitle}>Nutrition Guidelines</Text>
                {guidelines.map((guideline: string, index: number) => (
                    <View key={index} style={styles.guidelineRow}>
                        <MaterialCommunityIcons name="check-circle-outline" size={16} color={colors.accentCyan} style={styles.guidelineIcon} />
                        <Text style={styles.guidelineText}>{guideline}</Text>
                    </View>
                ))}
            </BlurView>

            {/* Workout Nutrition Tips */}
            <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.workoutTipsCard}>
                <Text style={styles.sectionTitle}>💪 Workout Nutrition</Text>

                <Text style={styles.tipSubtitle}>Pre-Workout</Text>
                {preworkoutTips.map((tip: string, index: number) => (
                    <View key={index} style={styles.tipRow}>
                        <MaterialCommunityIcons name="flash" size={14} color={colors.accentYellow} style={styles.tipIcon} />
                        <Text style={styles.tipText}>{tip}</Text>
                    </View>
                ))}

                <Text style={[styles.tipSubtitle, { marginTop: 15 }]}>Post-Workout</Text>
                {postworkoutTips.map((tip: string, index: number) => (
                    <View key={index} style={styles.tipRow}>
                        <MaterialCommunityIcons name="heart-flash" size={14} color={colors.accentPink} style={styles.tipIcon} />
                        <Text style={styles.tipText}>{tip}</Text>
                    </View>
                ))}
            </BlurView>

            {/* Recipe Details Modal */}
            <Modal
                visible={!!selectedRecipe}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedRecipe(null)}
            >
                <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={styles.modalContainer}>
                    {selectedRecipe && (
                        <View style={{ flex: 1 }}>
                            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                                <View>
                                    <Image source={{ uri: selectedRecipe.image }} style={styles.modalImage} />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                                        style={styles.modalImageGradient}
                                    />
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => setSelectedRecipe(null)}
                                    >
                                        <MaterialCommunityIcons name="close" size={24} color="#FFF" />
                                    </TouchableOpacity>
                                    <View style={styles.modalTitleContainer}>
                                        <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
                                    </View>
                                </View>

                                <View style={styles.modalContent}>
                                    <View style={styles.modalMetaRow}>
                                        <View style={styles.modalMetaBadge}>
                                            <MaterialCommunityIcons name="fire" size={16} color={colors.accentWarning} />
                                            <Text style={styles.modalMetaText}>{selectedRecipe.calories} kcal</Text>
                                        </View>
                                        <View style={styles.modalMetaBadge}>
                                            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.accentCyan} />
                                            <Text style={styles.modalMetaText}>{selectedRecipe.time}</Text>
                                        </View>
                                        <View style={styles.modalMetaBadge}>
                                            <MaterialCommunityIcons name="chef-hat" size={16} color={colors.accentPink} />
                                            <Text style={styles.modalMetaText}>{selectedRecipe.difficulty}</Text>
                                        </View>
                                    </View>

                                    {/* Macro Breakdown Badge */}
                                    {selectedRecipe.macros && (
                                        <View style={styles.modalMacros}>
                                            <View style={styles.macroBadgeItem}>
                                                <Text style={[styles.macroBadgeLabel, { color: colors.accentPink }]}>Protein</Text>
                                                <Text style={styles.macroBadgeValue}>{selectedRecipe.macros.protein}g</Text>
                                            </View>
                                            <View style={styles.verticalDivider} />
                                            <View style={styles.macroBadgeItem}>
                                                <Text style={[styles.macroBadgeLabel, { color: colors.accentCyan }]}>Carbs</Text>
                                                <Text style={styles.macroBadgeValue}>{selectedRecipe.macros.carbs}g</Text>
                                            </View>
                                            <View style={styles.verticalDivider} />
                                            <View style={styles.macroBadgeItem}>
                                                <Text style={[styles.macroBadgeLabel, { color: colors.accentYellow }]}>Fats</Text>
                                                <Text style={styles.macroBadgeValue}>{selectedRecipe.macros.fats}g</Text>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>Ingredients</Text>
                                        {selectedRecipe.ingredients?.map((ing: string, i: number) => (
                                            <View key={i} style={styles.ingredientRow}>
                                                <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.accentCyan} style={{ marginRight: 12, opacity: 0.8 }} />
                                                <Text style={styles.ingredientText}>{ing}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>Instructions</Text>
                                        {selectedRecipe.instructions?.map((inst: string, i: number) => (
                                            <View key={i} style={styles.instructionCard}>
                                                <View style={styles.instructionNumberContainer}>
                                                    <Text style={styles.instructionNumber}>{i + 1}</Text>
                                                </View>
                                                <Text style={styles.instructionText}>{inst}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </BlurView>
            </Modal>
        </>
    );
}

const createStyles = (colors: ThemeColorsType, shadows: ThemeShadowsType, isDark: boolean) => StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        color: colors.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        fontWeight: '500',
    },
    tabHeader: {
        paddingTop: Dimensions.get('window').height * 0.08,
        paddingBottom: Spacing.xl,
        paddingHorizontal: 24,
        borderBottomLeftRadius: Layout.borderRadius.xl,
        borderBottomRightRadius: Layout.borderRadius.xl,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    preferenceToggle: {
        flexDirection: 'row',
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        borderRadius: 20,
        padding: 2,
    },
    prefOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
    },
    prefOptionActive: {
        backgroundColor: colors.accentCyan,
    },
    prefText: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.textSecondary,
        marginLeft: 4,
    },
    prefTextActive: {
        color: '#FFF',
    },
    goalHeader: {
        paddingVertical: Spacing.s,
        paddingHorizontal: 20,
        borderRadius: Layout.borderRadius.m,
        marginBottom: Spacing.m,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    goalText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    calorieCard: {
        marginHorizontal: 8,
        marginBottom: Spacing.l,
        padding: Spacing.l,
        borderRadius: Layout.borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
        ...shadows.card,
    },
    calorieHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.l,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    calorieGoalText: {
        fontSize: 12,
        color: colors.textTertiary,
        fontWeight: '600',
    },
    calorieSummary: {
        alignItems: 'flex-end',
    },
    remainingValue: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.accentCyan,
    },
    remainingLabel: {
        fontSize: 10,
        color: colors.textTertiary,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    progressContainer: {
        marginVertical: Spacing.m,
        paddingHorizontal: Spacing.xs,
    },
    progressHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    progressLabelGroup: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    progressPercentGroup: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    percentBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    progressBarBackground: {
        height: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 8,
    },
    consumedValue: {
        fontSize: 36,
        fontWeight: '900',
        color: colors.textPrimary,
        marginRight: 6,
        letterSpacing: -1,
    },
    consumedLabel: {
        fontSize: 12,
        color: colors.textTertiary,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    percentValue: {
        fontSize: 14,
        fontWeight: '900',
        color: colors.accentCyan,
    },
    metabolicInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: Spacing.l,
        paddingTop: Spacing.l,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: -Spacing.l,
        paddingHorizontal: Spacing.l,
        marginBottom: -Spacing.l,
        paddingBottom: Spacing.l,
    },
    metabolicItem: {
        alignItems: 'center',
    },
    metabolicLabel: {
        fontSize: 10,
        color: colors.textTertiary,
        fontWeight: '700',
        marginBottom: 2,
    },
    metabolicValue: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '800',
    },
    macroCard: {
        marginHorizontal: 8,
        marginBottom: Spacing.m,
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    macroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.m,
    },
    macroInfo: {
        width: 70,
    },
    macroName: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    macroAmount: {
        fontSize: 10,
        color: colors.textTertiary,
    },
    macroBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        marginHorizontal: Spacing.m,
        overflow: 'hidden',
    },
    macroBar: {
        height: '100%',
        borderRadius: 4,
    },
    macroPercent: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.textPrimary,
        width: 35,
        textAlign: 'right',
    },
    mealContainer: {
        paddingHorizontal: 12,
        marginBottom: Spacing.xl,
    },
    mealRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.l,
        backgroundColor: colors.cardSurface,
        marginBottom: Spacing.s,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...shadows.card,
    },
    mealRowSelected: {
        backgroundColor: colors.accentCyan,
        borderColor: colors.accentCyan,
    },
    mealRowEaten: {
        opacity: 0.8,
        backgroundColor: colors.cardSurface,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.accentCyan,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.m,
    },
    checkCircleActive: {
        backgroundColor: colors.accentCyan,
    },
    mealContent: {
        flex: 1,
    },
    mealName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    strikethrough: {
        textDecorationLine: 'line-through',
        color: colors.textTertiary,
    },
    mealSpecs: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    mealTime: {
        fontSize: 10,
        color: colors.textTertiary,
        marginRight: 8,
    },
    mealCalories: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.accentCyan,
    },
    mealMacros: {
        alignItems: 'flex-end',
    },
    mealMacroText: {
        fontSize: 9,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    supplementsSection: {
        paddingHorizontal: 12,
        marginBottom: Spacing.xl,
    },
    supplementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
        marginTop: Spacing.m,
    },
    suppItem: {
        width: (Dimensions.get('window').width - 72) / 2,
        backgroundColor: colors.cardSurface,
        margin: 8,
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.l,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...shadows.card,
    },
    suppItemActive: {
        backgroundColor: colors.accentCyan,
        borderColor: colors.accentCyan,
    },
    suppName: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textPrimary,
        marginTop: 8,
        textAlign: 'center',
    },
    suppCheck: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 2,
    },
    foodSection: {
        paddingHorizontal: 12,
        marginBottom: Spacing.xl,
    },
    foodCategoryTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textSecondary,
        marginTop: Spacing.l,
        marginBottom: Spacing.m,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    foodScroll: {
        marginHorizontal: -8,
        paddingHorizontal: 8,
    },
    foodItem: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.s,
        marginRight: 8,
        width: 130,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    foodName: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    foodServing: {
        fontSize: 10,
        color: colors.textTertiary,
        marginBottom: 6,
    },
    foodCalories: {
        fontSize: 12,
        color: colors.textPrimary,
        fontWeight: '600',
        marginBottom: 2,
    },
    foodProtein: {
        fontSize: 11,
        fontWeight: '700',
    },
    foodCarbs: {
        fontSize: 11,
        fontWeight: '700',
    },
    foodFats: {
        fontSize: 11,
        fontWeight: '700',
    },
    foodInsightBadge: {
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    foodInsightText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#FFF',
        textTransform: 'uppercase',
    },
    recipeCard: {
        marginHorizontal: 8,
        height: 200,
        borderRadius: Layout.borderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.xl,
        ...shadows.card,
    },
    recipeImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    recipeGradient: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    recipeBadge: {
        position: 'absolute',
        top: Spacing.m,
        left: Spacing.m,
        backgroundColor: colors.accentCyan,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        zIndex: 2,
    },
    recipeBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
    },
    recipeInfo: {
        position: 'absolute',
        bottom: Spacing.m,
        left: Spacing.m,
        right: Spacing.m,
        zIndex: 2,
    },
    recipeTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    recipeMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recipeMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    recipeMetaText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    guidelinesCard: {
        marginHorizontal: 8,
        marginBottom: Spacing.l,
        padding: Spacing.l,
        borderRadius: Layout.borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    guidelineRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: Spacing.m,
    },
    guidelineIcon: {
        marginTop: 2,
        marginRight: Spacing.s,
    },
    guidelineText: {
        fontSize: 13,
        color: colors.textSecondary,
        flex: 1,
        lineHeight: 18,
    },
    workoutTipsCard: {
        marginHorizontal: 8,
        marginBottom: 100,
        padding: Spacing.l,
        borderRadius: Layout.borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tipSubtitle: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textPrimary,
        marginTop: Spacing.m,
        marginBottom: Spacing.s,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    tipIcon: {
        marginRight: Spacing.s,
    },
    tipText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
    },
    modalImage: {
        width: '100%',
        height: 300,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    modalContent: {
        flex: 1,
        marginTop: -30,
        backgroundColor: isDark ? '#121212' : '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: Spacing.l,
        paddingBottom: 40,
        minHeight: Dimensions.get('window').height - 250,
    },
    modalHeader: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 28, // increased
        fontWeight: '800',
        color: '#FFF', // Always white on image
        textAlign: 'left',
        marginBottom: Spacing.m,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    modalMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.s, // Reduced from xl
        marginTop: Spacing.s,
    },
    modalMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    modalMetaText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginLeft: 6,
    },
    modalMacros: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginTop: 0, // Removed extra margin
    },
    modalMacroText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    modalSection: {
        marginBottom: Spacing.xl,
    },
    modalSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: Spacing.m,
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    bulletPoint: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.accentCyan,
        marginRight: 12,
    },
    ingredientText: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
    },

    instructionText: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 24,
        flex: 1,
    },
    modalImageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    modalTitleContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    modalMetaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    macroBadgeItem: {
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    macroBadgeLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 2,
    },
    macroBadgeValue: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    verticalDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    instructionCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    instructionNumberContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.accentCyan,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    instructionNumber: {
        fontSize: 14,
        fontWeight: '900',
        color: '#000', // Black text on Cyan background
    },
});

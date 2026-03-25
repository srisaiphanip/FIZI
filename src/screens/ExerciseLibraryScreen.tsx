import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getExerciseImage } from '../config/imageMap';
import { RootState } from '../store';
import { setExerciseLibraryScrollOffset } from '../store/slices/uiSlice';
import { exercises } from '../models/exercises';
import { Spacing, Layout, Shadows, ThemeColorsType } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import { avatarService } from '../services/AvatarService';

interface ExerciseLibraryScreenProps {
    navigation: any;
}

export default function ExerciseLibraryScreen({ navigation }: ExerciseLibraryScreenProps) {
    const { colors, gradients, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { user } = useSelector((state: RootState) => state.auth);
    const { exerciseLibraryScrollOffset } = useSelector((state: RootState) => state.ui);
    const dispatch = useDispatch();
    const startDate = React.useRef(Date.now());
    const [searchQuery, setSearchQuery] = useState('');
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'chest' | 'legs' | 'back' | 'abs' | 'arms'>('all');

    const [userLevel, setUserLevel] = useState(1);

    React.useEffect(() => {
        let isMounted = true;
        const loadLevel = async () => {
            const state = await avatarService.getAvatarState();
            if (state && isMounted) {
                // Ensure we get the latest level from DB or Redux (Firestore cache first, then server)
                setUserLevel(state.level);
            }
        };
        loadLevel();
        return () => { isMounted = false; };
    }, []);

    const filteredExercises = useMemo(() => {
        return exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ex.muscleGroups[0].toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || ex.muscleGroups[0].toLowerCase().includes(selectedCategory);
            return matchesSearch && matchesCategory;
        }).sort((a, b) => a.unlockLevel - b.unlockLevel);
    }, [searchQuery, selectedCategory]);

    // Restore scroll position
    React.useEffect(() => {
        if (exerciseLibraryScrollOffset > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: exerciseLibraryScrollOffset, animated: false });
            }, 100);
        }
    }, []);

    const categories = [
        { id: 'all', label: 'All', icon: '🔍' },
        { id: 'chest', label: 'Chest', icon: '💪' },
        { id: 'legs', label: 'Legs', icon: '🦵' },
        { id: 'back', label: 'Back', icon: '🧗' },
        { id: 'abs', label: 'Core', icon: '🧱' },
    ];

    return (
        <LinearGradient colors={gradients.background} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Exercise Library</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.searchBar}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </BlurView>
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() => setSelectedCategory(cat.id as any)}
                        style={[
                            styles.categoryItem,
                            selectedCategory === cat.id && styles.categoryItemActive
                        ]}
                    >
                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                        <Text style={[
                            styles.categoryLabel,
                            selectedCategory === cat.id && styles.categoryLabelActive
                        ]}>{cat.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                ref={scrollViewRef}
                style={styles.content}
                showsVerticalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    dispatch(setExerciseLibraryScrollOffset(e.nativeEvent.contentOffset.y));
                }}
                onScrollEndDrag={(e) => {
                    dispatch(setExerciseLibraryScrollOffset(e.nativeEvent.contentOffset.y));
                }}
                scrollEventThrottle={16}
            >
                <View style={styles.grid}>
                    {filteredExercises.map(ex => {
                        const isUnlocked = ex.unlockLevel <= userLevel;
                        return (
                            <TouchableOpacity
                                key={ex.id}
                                style={[styles.exerciseCard, !isUnlocked && styles.exerciseCardLocked]}
                                onPress={() => navigation.navigate('ExerciseInstructions', { exerciseId: ex.id, fromLibrary: true })}
                            >
                                <View style={styles.imagePlaceholder}>
                                    {getExerciseImage(ex.id) ? (
                                        <Image
                                            source={getExerciseImage(ex.id)}
                                            style={styles.exerciseImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <Text style={styles.exerciseEmoji}>
                                            {ex.name.includes('Push') ? '💪' : ex.name.includes('Squat') ? '🦵' : '🏋️'}
                                        </Text>
                                    )}
                                    {!isUnlocked && (
                                        <BlurView intensity={40} style={styles.lockOverlay}>
                                            <Text style={styles.lockIcon}>🔒</Text>
                                            <Text style={styles.unlockLevel}>Level {ex.unlockLevel}</Text>
                                        </BlurView>
                                    )}
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.exerciseName} numberOfLines={1}>{ex.name}</Text>
                                    <Text style={styles.exerciseMuscle}>{ex.muscleGroups[0]}</Text>
                                    <View style={styles.tagRow}>
                                        <View style={[styles.tag, styles.difficultyTag]}>
                                            <Text style={styles.tagText}>{ex.difficulty}</Text>
                                        </View>
                                        <View style={[styles.tag, styles.equipmentTag]}>
                                            <Text style={styles.tagText}>{ex.equipmentRequired}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const createStyles = (colors: ThemeColorsType) => StyleSheet.create({
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
        color: colors.primaryStart,
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    searchContainer: {
        paddingHorizontal: Spacing.l,
        marginBottom: Spacing.m,
    },
    searchBar: {
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    searchInput: {
        padding: 12,
        color: colors.textPrimary,
        fontSize: 16,
    },
    categoryScroll: {
        paddingLeft: Spacing.l,
        marginBottom: Spacing.m,
        flexGrow: 0,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glassSurface,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryItemActive: {
        backgroundColor: colors.primaryStart + '33', // 20% opacity
        borderColor: colors.primaryStart,
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    categoryLabel: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    categoryLabelActive: {
        color: colors.textPrimary,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    exerciseCard: {
        width: '48%',
        backgroundColor: colors.glassSurface,
        borderRadius: Layout.borderRadius.m,
        marginBottom: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...Shadows.card,
    },
    exerciseCardLocked: {
        opacity: 0.8,
    },
    imagePlaceholder: {
        height: 120,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: Layout.borderRadius.m,
    },
    exerciseImage: {
        width: '100%',
        height: '100%',
    },
    exerciseEmoji: {
        fontSize: 40,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    unlockLevel: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: colors.primaryStart,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    cardInfo: {
        padding: 12,
    },
    exerciseName: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    exerciseMuscle: {
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 8,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    tag: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    difficultyTag: {
        backgroundColor: colors.glassSurface,
    },
    equipmentTag: {
        backgroundColor: colors.primaryStart + '1A', // 10% opacity
    },
    tagText: {
        fontSize: 10,
        color: colors.textTertiary,
        textTransform: 'capitalize',
    },
});

/**
 * AvatarScreen
 * 
 * Displays user's fitness avatar with transformation progress,
 * achievements, and level progression.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Image,
    Platform,
    Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { uploadPhoto, signOut, updateProfile, changePassword } from '../store/slices/authSlice';
import { regenerateUserPlan } from '../store/slices/workoutPlanSlice';
import { UserProfile } from '../types';
import {
    avatarService,
    AvatarState,
    AVATAR_LEVELS,
    ACHIEVEMENTS
} from '../services/AvatarService';
import { feetToCm, metersToCm, cmToFeet, cmToMeters, formatHeight } from '../utils/unitConversion';
import { exercises } from '../models/exercises'; // Import exercises data
import { Spacing, Layout, Shadows, ThemeColorsType, ThemeShadowsType } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COMMON_HEALTH_ISSUES = [
    'knee_pain', 'lower_back_pain', 'shoulder_injury', 'wrist_pain',
    'ankle_injury', 'hip_injury', 'neck_pain', 'heart_condition'
];

const EQUIPMENT_OPTIONS = [
    { id: 'dumbbells', label: 'Dumbbells' },
    { id: 'resistance_bands', label: 'Resistance Bands' },
    { id: 'pull_up_bar', label: 'Pull-up Bar' },
    { id: 'yoga_mat', label: 'Yoga Mat' },
    { id: 'bench', label: 'Bench' },
    { id: 'kettlebells', label: 'Kettlebells' },
];

interface AvatarScreenProps {
    navigation: any;
}

export default function AvatarScreen({ navigation }: AvatarScreenProps) {
    const dispatch = useAppDispatch();
    const { colors, gradients, shadows, isDark, toggleTheme } = useTheme();
    const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
    const { user, loading: authLoading } = useAppSelector((state) => state.auth);
    const [avatarState, setAvatarState] = useState<AvatarState | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMetricsModal, setShowMetricsModal] = useState(false);
    const [showUserInfoModal, setShowUserInfoModal] = useState(false);
    const [currentWeight, setCurrentWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');
    const [showAllLevels, setShowAllLevels] = useState(false);

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAge, setEditAge] = useState('');
    const [editWeight, setEditWeight] = useState('');
    const [editHeight, setEditHeight] = useState('');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft' | 'm'>('cm');
    const [editGender, setEditGender] = useState('');
    const [editFitnessGoal, setEditFitnessGoal] = useState<UserProfile['fitnessGoal']>('muscle_gain');
    const [editExperienceLevel, setEditExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
    const [editEquipmentAccess, setEditEquipmentAccess] = useState<'bodyweight' | 'home' | 'gym'>('bodyweight');
    const [editHealthIssues, setEditHealthIssues] = useState<string[]>([]);
    const [editAvailableEquipment, setEditAvailableEquipment] = useState<string[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Change Password State
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadAvatarState();
    }, []);

    const loadAvatarState = async () => {
        setLoading(true);
        const state = await avatarService.getAvatarState();
        setAvatarState(state);
        if (state?.bodyMetrics.currentWeight) {
            setCurrentWeight(state.bodyMetrics.currentWeight.toString());
        }
        if (state?.bodyMetrics.goalWeight) {
            setGoalWeight(state.bodyMetrics.goalWeight.toString());
        }
        setLoading(false);
    };

    const handlePickImage = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission Required', 'Please allow access to your photos to upload a profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                await dispatch(uploadPhoto(uri)).unwrap();
                Alert.alert('Success', 'Profile photo updated!');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update photo');
        }
    };

    const handleUpdateMetrics = async () => {
        const weight = parseFloat(currentWeight);
        const goal = parseFloat(goalWeight);

        if (isNaN(weight) || weight <= 0) {
            Alert.alert('Invalid Weight', 'Please enter a valid weight');
            return;
        }

        await avatarService.updateBodyMetrics({
            currentWeight: weight,
            goalWeight: isNaN(goal) ? undefined : goal,
        });

        setShowMetricsModal(false);
        loadAvatarState();
        Alert.alert('Success', 'Body metrics updated!');
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(signOut()).unwrap();
                            // Navigation to Auth stack is handled automatically
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to sign out');
                        }
                    }
                }
            ]
        );
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            await dispatch(changePassword({ current: currentPassword, new: newPassword })).unwrap();
            Alert.alert('Success', 'Password changed successfully');
            setShowChangePasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            let message = error.message || 'Failed to change password';
            if (message.includes('wrong-password') || message.includes('auth/invalid-credential')) {
                message = 'Incorrect current password';
            } else if (message.includes('weak-password')) {
                message = 'Password must be at least 6 characters';
            } else if (message.includes('requires-recent-login')) {
                message = 'Please sign out and sign in again to change your password';
            }
            Alert.alert('Error', message);
        }
    };

    const startEditingProfile = () => {
        setEditName(user?.displayName || '');
        setEditWeight(user?.weight?.toString() || '');
        // Initial set based on current unit (default cm)
        setEditHeight(user?.height?.toString() || '');
        // Note: For now we default to cm when opening, but we could persist preference if needed
        setEditAge(user?.age?.toString() || '');
        setEditFitnessGoal(user?.fitnessGoal || 'muscle_gain');
        setEditExperienceLevel(user?.workoutExperience || (user?.fitnessProfile?.experienceLevel as any) || 'beginner');
        setEditEquipmentAccess(user?.fitnessProfile?.equipmentAccess || 'bodyweight');
        setEditHealthIssues(user?.fitnessProfile?.healthIssues || []);
        setEditAvailableEquipment(user?.fitnessProfile?.availableEquipment || []);
        setIsEditingProfile(true);
    };

    const handleSaveProfile = async () => {
        try {
            const updates: Partial<UserProfile> = {
                displayName: editName,
                weight: parseFloat(editWeight) || 0,
                height: heightUnit === 'cm'
                    ? parseFloat(editHeight)
                    : heightUnit === 'ft'
                        ? feetToCm(editHeight)
                        : metersToCm(parseFloat(editHeight)),
                age: parseInt(editAge) || 0,
                fitnessGoal: editFitnessGoal,
                workoutExperience: editExperienceLevel,
                fitnessProfile: {
                    ...(user?.fitnessProfile || {
                        availableDays: 7,
                        fitnessGoals: [editFitnessGoal || 'weight_loss'],
                        healthIssues: [],
                        availableEquipment: [],
                        experienceLevel: editExperienceLevel || 'beginner',
                        equipmentAccess: editEquipmentAccess || 'bodyweight'
                    }),
                    experienceLevel: editExperienceLevel,
                    equipmentAccess: editEquipmentAccess,
                    healthIssues: editHealthIssues,
                    availableEquipment: editAvailableEquipment as any[],
                    availableDays: 7, // Enforce 7-day split
                    fitnessGoals: [editFitnessGoal], // Sync inner goal
                }
            };

            const updatedProfile = await dispatch(updateProfile(updates)).unwrap();

            // 2. Trigger Plan Regeneration with updated profile
            await dispatch(regenerateUserPlan(updatedProfile)).unwrap();

            setIsEditingProfile(false);
            setShowSuccessModal(true);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        }
    };

    const toggleEditHealthIssue = (issue: string) => {
        setEditHealthIssues(prev =>
            prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
        );
    };

    const toggleEditEquipment = (equipment: string) => {
        setEditAvailableEquipment(prev =>
            prev.includes(equipment) ? prev.filter(e => e !== equipment) : [...prev, equipment]
        );
    };


    const getAvatarEmoji = (level: number): string => {
        const levelData = AVATAR_LEVELS.find(l => l.level === level);
        return levelData?.icon || '🏃';
    };

    const getProgressToNextLevel = (): { workouts: number; reps: number } | null => {
        if (!avatarState) return null;
        return avatarService.getNextLevelRequirements(avatarState.level);
    };

    const calculateProgress = (current: number, required: number): number => {
        return Math.min(100, Math.round((current / required) * 100));
    };

    if (loading) {
        return (
            <LinearGradient colors={gradients.background} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primaryStart} />
            </LinearGradient>
        );
    }

    if (!avatarState) {
        return (
            <LinearGradient colors={gradients.background} style={styles.container}>
                <Text style={styles.errorText}>Failed to load avatar</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.backLink}>Go Back</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    const nextLevel = getProgressToNextLevel();

    // Calculate missing body composition metrics on-the-fly if not present
    const getBodyComposition = () => {
        if (!user) return undefined;

        // If bodyComposition exists and has all data, return it
        if (user.bodyComposition?.bmi && user.bodyComposition?.bodyFat && user.bodyComposition?.bmr) {
            return user.bodyComposition;
        }

        // Calculate missing metrics
        const w = user.weight;
        const h = user.height;
        const a = user.age;
        const gender = user.gender || 'male';

        if (!w || !h || !a) return user?.bodyComposition;

        // BMI
        const bmi = w / Math.pow(h / 100, 2);

        // BMR (Mifflin-St Jeor)
        const bmr = gender === 'male'
            ? (10 * w) + (6.25 * h) - (5 * a) + 5
            : (10 * w) + (6.25 * h) - (5 * a) - 161;

        // Body Fat % (Deurenberg)
        const bfPercent = (1.20 * bmi) + (0.23 * a) - (gender === 'male' ? 16.2 : 5.4);
        const bodyFatKg = w * (Math.max(5, Math.min(50, bfPercent)) / 100);

        // Skeletal Muscle
        const lbm = w * (1 - bfPercent / 100);
        const skeletalMuscleKg = lbm * 0.45;

        // Visceral Fat
        const visceralFatRatio = 0.10 + Math.max(0, (bmi - 22) * 0.01);
        const visceralFatKg = bodyFatKg * Math.min(0.30, visceralFatRatio);
        const visceralFatPercent = (visceralFatKg / w) * 100;

        // Trunk Subcutaneous Fat
        const trunkFatKg = bodyFatKg * 0.5;
        const trunkSubcutaneousFatKg = trunkFatKg * 0.85;

        // Body Age
        const baseBMR20 = gender === 'male'
            ? (10 * w) + (6.25 * h) - (5 * 20) + 5
            : (10 * w) + (6.25 * h) - (5 * 20) - 161;
        const decadesAfter20 = Math.max(0, (a - 20) / 10);
        const expectedBMR = baseBMR20 * Math.pow(0.98, decadesAfter20);
        const bmrDeviation = bmr - expectedBMR;
        const bmrDeclinePerYear = baseBMR20 * 0.002;
        const ageAdjustment = bmrDeviation / bmrDeclinePerYear;
        const metabolicAge = Math.round(a - ageAdjustment);

        return {
            bmi: parseFloat(bmi.toFixed(1)),
            bmr: Math.round(bmr),
            bodyFat: parseFloat(bodyFatKg.toFixed(1)),
            visceralFat: parseFloat(Math.max(1, Math.min(15, visceralFatPercent)).toFixed(1)),
            trunkSubcutaneousFat: parseFloat(Math.max(1, Math.min(30, trunkSubcutaneousFatKg)).toFixed(1)),
            bodyAge: Math.max(15, Math.min(100, metabolicAge)),
            skeletalMuscle: parseFloat(Math.max(10, Math.min(50, skeletalMuscleKg)).toFixed(1)),
        };
    };

    const getMetricStatusColor = (type: string, value: number) => {
        if (!user || value === undefined) return colors.textPrimary;
        const gender = user.gender || 'male';
        const age = user.age || 30;

        switch (type) {
            case 'bmi':
                if (value >= 18.5 && value < 25) return colors.accentSuccess;
                if ((value >= 25 && value < 30) || (value < 18.5)) return colors.accentYellow;
                return colors.accentError;
            case 'bodyFat':
                // thresholds in kg, need to convert to % for meaningful comparison with general ranges if possible,
                // but thresholds in my plan were for %, and bodyComp returns kg.
                // Let's recalculate % for the check.
                const bfPercent = (value / (user.weight || 70)) * 100;
                if (gender === 'male') {
                    if (bfPercent >= 10 && bfPercent <= 20) return colors.accentSuccess;
                    if (bfPercent > 20 && bfPercent <= 25) return colors.accentYellow;
                    return colors.accentError;
                } else {
                    if (bfPercent >= 18 && bfPercent <= 28) return colors.accentSuccess;
                    if (bfPercent > 28 && bfPercent <= 33) return colors.accentYellow;
                    return colors.accentError;
                }
            case 'visceralFat':
                if (value < 10) return colors.accentSuccess;
                if (value >= 10 && value < 15) return colors.accentYellow;
                return colors.accentError;
            case 'skeletalMuscle':
                // value is in kg. Calculate % of body weight.
                const smPercent = (value / (user.weight || 70)) * 100;
                if (gender === 'male') {
                    if (smPercent > 40) return colors.accentSuccess;
                    if (smPercent >= 33 && smPercent <= 40) return colors.accentYellow;
                    return colors.accentError;
                } else {
                    if (smPercent > 30) return colors.accentSuccess;
                    if (smPercent >= 24 && smPercent <= 30) return colors.accentYellow;
                    return colors.accentError;
                }
            case 'bodyAge':
                if (value <= age) return colors.accentSuccess;
                if (value <= age + 5) return colors.accentYellow;
                return colors.accentError;
            default:
                return colors.textPrimary;
        }
    };

    const bodyComp = getBodyComposition();

    return (
        <LinearGradient colors={gradients.background} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonGeneric}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Hero Journey</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar Display */}
                <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.avatarCard}>
                    <View>
                        <LinearGradient
                            colors={gradients.primary}
                            style={styles.avatarCircle}
                        >
                            {user?.photoURL ? (
                                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.defaultAvatarContainer}>
                                    <MaterialCommunityIcons
                                        name="account-circle"
                                        size={140}
                                        color="rgba(255, 255, 255, 0.9)"
                                    />
                                </View>
                            )}
                            {authLoading && (
                                <View style={styles.uploadingOverlay}>
                                    <ActivityIndicator color="#FFF" />
                                </View>
                            )}
                        </LinearGradient>
                    </View>

                    <Text style={styles.userName}>{user?.displayName || 'Champion'}</Text>
                    <Text style={styles.levelName}>{avatarState.levelName}</Text>
                    <Text style={styles.levelBadge}>Level {avatarState.level}</Text>

                    {/* Streak */}
                    <View style={styles.streakContainer}>
                        <LinearGradient
                            colors={gradients.fire}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.streakGradient}
                        >
                            <Text style={styles.streakIcon}>🔥</Text>
                            <Text style={styles.streakText}>{avatarState.currentStreak} Day Streak</Text>
                        </LinearGradient>
                    </View>
                </BlurView>

                {/* Progress to Next Level */}
                {nextLevel && (
                    <BlurView intensity={10} tint="default" style={styles.progressCard}>
                        <Text style={styles.sectionTitle}>Next Level Progress</Text>

                        <View style={styles.progressItem}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Workouts</Text>
                                <Text style={styles.progressValue}>
                                    {avatarState.totalWorkouts} / {nextLevel.workouts}
                                </Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <LinearGradient
                                    colors={gradients.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.progressFill,
                                        { width: `${calculateProgress(avatarState.totalWorkouts, nextLevel.workouts)}%` }
                                    ]}
                                />
                            </View>
                        </View>

                        <View style={styles.progressItem}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Total Reps</Text>
                                <Text style={styles.progressValue}>
                                    {avatarState.totalReps} / {nextLevel.reps}
                                </Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <LinearGradient
                                    colors={gradients.ocean}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.progressFill,
                                        { width: `${calculateProgress(avatarState.totalReps, nextLevel.reps)}%` }
                                    ]}
                                />
                            </View>
                        </View>
                    </BlurView>
                )}

                {/* User Info Section */}
                <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.userInfoCard}>
                    <TouchableOpacity
                        style={styles.userInfoButton}
                        onPress={() => setShowUserInfoModal(true)}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons name="account-details-outline" size={24} color={colors.accentCyan} />
                        </View>
                        <View style={styles.userInfoTextContainer}>
                            <Text style={styles.userInfoTitle}>User Profile Information</Text>
                            <Text style={styles.userInfoSubtitle}>View your registration details</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                </BlurView>

                {/* Exercise Library */}
                <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.userInfoCard}>
                    <TouchableOpacity
                        style={styles.userInfoButton}
                        onPress={() => navigation.navigate('ExerciseLibrary')}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons name="dumbbell" size={24} color={colors.accentCyan} />
                        </View>
                        <View style={styles.userInfoTextContainer}>
                            <Text style={styles.userInfoTitle}>Browse Exercise Library</Text>
                            <Text style={styles.userInfoSubtitle}>Explore all available exercises</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                </BlurView>

                {/* Lifetime Stats */}
                <BlurView intensity={10} tint={isDark ? "light" : "dark"} style={styles.statsCard}>
                    <Text style={styles.sectionTitle}>Lifetime Stats</Text>
                    <View style={styles.statsGrid}>
                        {[
                            { label: 'Workouts', value: avatarState.totalWorkouts },
                            { label: 'Total Reps', value: avatarState.totalReps },
                            { label: 'Minutes', value: `${avatarState.totalMinutes}m` },
                            { label: 'Best Streak', value: avatarState.longestStreak },
                        ].map((stat, i) => (
                            <View key={i} style={styles.statItem}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </BlurView>

                {/* Body Metrics */}
                <BlurView intensity={15} tint={isDark ? "light" : "dark"} style={styles.metricsCard}>
                    <View style={styles.metricsHeader}>
                        <Text style={styles.sectionTitle}>Body Metrics</Text>
                        <TouchableOpacity onPress={() => setShowMetricsModal(true)}>
                            <Text style={styles.editButton}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    {avatarState.bodyMetrics.startWeight ? (
                        <View style={styles.metricsContent}>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Start</Text>
                                <Text style={styles.metricValue}>
                                    {avatarState.bodyMetrics.startWeight} <Text style={styles.unit}>kg</Text>
                                </Text>
                            </View>
                            <View style={styles.metricArrow}>
                                <Text style={styles.arrowText}>→</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Current</Text>
                                <Text style={styles.metricValue}>
                                    {avatarState.bodyMetrics.currentWeight || '--'} <Text style={styles.unit}>kg</Text>
                                </Text>
                            </View>
                            {avatarState.bodyMetrics.goalWeight && (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={styles.metricArrow}>
                                        <Text style={styles.arrowText}>→</Text>
                                    </View>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>Goal</Text>
                                        <Text style={[styles.metricValue, styles.goalValue]}>
                                            {avatarState.bodyMetrics.goalWeight} <Text style={[styles.unit, styles.goalValue]}>kg</Text>
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addMetricsButton}
                            onPress={() => setShowMetricsModal(true)}
                        >
                            <Text style={styles.addMetricsText}>+ Add your body metrics</Text>
                        </TouchableOpacity>
                    )}
                </BlurView>

                {/* Achievements */}
                <BlurView intensity={10} tint={isDark ? "light" : "dark"} style={styles.achievementsCard}>
                    <Text style={styles.sectionTitle}>
                        Achievements ({avatarState.achievements.length}/{ACHIEVEMENTS.length})
                    </Text>
                    <View style={styles.achievementsGrid}>
                        {ACHIEVEMENTS.map((achievement) => {
                            const isEarned = avatarState.achievements.includes(achievement.id);
                            return (
                                <View
                                    key={achievement.id}
                                    style={[
                                        styles.achievementItem,
                                        !isEarned && styles.achievementLocked
                                    ]}
                                >
                                    <Text style={[styles.achievementIcon, !isEarned && { opacity: 0.5 }]}>
                                        {isEarned ? achievement.icon : '🔒'}
                                    </Text>
                                    <Text style={[
                                        styles.achievementName,
                                        !isEarned && styles.achievementNameLocked
                                    ]}>
                                        {achievement.name}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </BlurView>

                {/* Level Roadmap */}
                <BlurView intensity={10} tint={isDark ? "light" : "dark"} style={styles.roadmapCard}>
                    <Text style={styles.sectionTitle}>Level Map & Unlocks</Text>
                    {AVATAR_LEVELS.slice(0, showAllLevels ? undefined : 1).map((level) => {
                        // Find exercises that unlock at this level
                        const levelExercises = exercises.filter(ex => ex.unlockLevel === level.level);

                        return (
                            <View
                                key={level.level}
                                style={[
                                    styles.roadmapItem,
                                    avatarState.level > level.level && styles.roadmapItemActive, // Past
                                    avatarState.level === level.level && styles.roadmapItemCurrent // Current
                                ]}
                            >
                                <Text style={styles.roadmapIcon}>{level.icon}</Text>
                                <View style={styles.roadmapInfo}>
                                    <Text style={[
                                        styles.roadmapName,
                                        avatarState.level >= level.level && styles.roadmapNameActive
                                    ]}>
                                        Lv.{level.level} - {level.name}
                                    </Text>
                                    <Text style={styles.roadmapReq}>
                                        {level.minWorkouts} workouts • {level.minReps} reps
                                    </Text>

                                    {/* Unlocked Exercises List */}
                                    {levelExercises.length > 0 && (
                                        <View style={styles.unlockedExercisesContainer}>
                                            <Text style={styles.unlockedLabel}>Unlocks:</Text>
                                            <View style={styles.unlockedList}>
                                                {levelExercises.map(ex => (
                                                    <Text key={ex.id} style={styles.unlockedItem}>• {ex.displayName}</Text>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                                {avatarState.level >= level.level && (
                                    <Text style={styles.roadmapCheck}>✓</Text>
                                )}
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={styles.showMoreButton}
                        onPress={() => setShowAllLevels(!showAllLevels)}
                    >
                        <Text style={styles.showMoreText}>
                            {showAllLevels ? 'Show Less' : `Show More (${AVATAR_LEVELS.length - 1})`}
                        </Text>
                        <MaterialCommunityIcons
                            name={showAllLevels ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={colors.primaryStart}
                        />
                    </TouchableOpacity>
                </BlurView>

                {/* Appearance Section */}
                <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.menuCard}>
                    <Text style={styles.sectionTitle}>Appearance</Text>

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={toggleTheme}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons
                                name={isDark ? "weather-night" : "white-balance-sunny"}
                                size={22}
                                color={colors.textPrimary}
                            />
                        </View>
                        <Text style={styles.menuItemText}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
                        <View style={{
                            width: 50,
                            height: 30,
                            borderRadius: 15,
                            backgroundColor: isDark ? colors.primaryStart : '#ddd',
                            justifyContent: 'center',
                            alignItems: isDark ? 'flex-end' : 'flex-start',
                            paddingHorizontal: 2
                        }}>
                            <View style={{
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                backgroundColor: '#FFF',
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 2.5,
                                elevation: 2
                            }} />
                        </View>
                    </TouchableOpacity>
                </BlurView>

                {/* Support & Legal Section */}
                <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.menuCard}>
                    <Text style={styles.sectionTitle}>Support & Legal</Text>

                    {/* Privacy Policy */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Linking.openURL('https://github.com/fizifitnessgenie/Legal/blob/main/Privacy-Policy.md')}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons name="shield-account-outline" size={22} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.menuItemText}>Privacy Policy</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    {/* Terms of Service */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Linking.openURL('https://github.com/fizifitnessgenie/Legal/blob/main/Terms-of-Service.md')}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons name="file-document-outline" size={22} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.menuItemText}>Terms of Service</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    {/* About Us */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('AboutUs')}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons name="information-outline" size={22} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.menuItemText}>About Us</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    {/* Camera & Data Usage */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('DataUsage')}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons name="camera-outline" size={22} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.menuItemText}>Camera & Data Usage</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    {/* Contact Support */}
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => Linking.openURL('mailto:fizi.fitnessgenie@gmail.com')}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons name="email-outline" size={22} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.menuItemText}>Contact Support</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                </BlurView>

                {/* Account Actions Section */}
                <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.menuCard}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    {/* Change Password */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setShowChangePasswordModal(true)}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons name="lock-reset" size={22} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.menuItemText}>Change Password</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    {/* Sign Out */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={handleSignOut}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons name="logout" size={22} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.menuItemText}>Sign Out</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>

                    {/* Delete Account */}
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => Linking.openURL('mailto:fizi.fitnessgenie@gmail.com?subject=Delete Account Request&body=Please delete my account data associated with this email.')}
                    >
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                            <MaterialCommunityIcons name="delete-outline" size={22} color={colors.accentError} />
                        </View>
                        <Text style={[styles.menuItemText, { color: colors.accentError }]}>Delete Account</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                </BlurView>

                {/* Health Disclaimer */}
                <View style={styles.disclaimerContainer}>
                    <Text style={styles.disclaimerText}>
                        Disclaimer: This app provides general fitness guidance only. It is not a medical application. Consult a qualified professional before starting any workout program.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* User Info Modal */}
            {showUserInfoModal && (
                <BlurView intensity={80} tint={isDark ? "light" : "dark"} style={styles.modalOverlay}>
                    <View style={[styles.modal, { maxHeight: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Registration Details</Text>
                            <TouchableOpacity
                                style={styles.closeModalButton}
                                onPress={() => setShowUserInfoModal(false)}
                            >
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Personal Details */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.modalSectionTitle}>Personal Details</Text>
                                <TouchableOpacity onPress={isEditingProfile ? handleSaveProfile : startEditingProfile}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <MaterialCommunityIcons
                                            name={isEditingProfile ? "check" : "pencil"}
                                            size={16}
                                            color={colors.primaryStart}
                                        />
                                        <Text style={{ color: colors.primaryStart, fontWeight: '600' }}>
                                            {isEditingProfile ? 'Save' : 'Edit'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Name</Text>
                                {isEditingProfile ? (
                                    <TextInput
                                        style={styles.editInput}
                                        value={editName}
                                        onChangeText={setEditName}
                                        placeholder="Name"
                                        placeholderTextColor={colors.textTertiary}
                                    />
                                ) : (
                                    <Text style={styles.infoValue}>{user?.displayName || '--'}</Text>
                                )}
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Age</Text>
                                {isEditingProfile ? (
                                    <TextInput
                                        style={styles.editInput}
                                        value={editAge}
                                        onChangeText={setEditAge}
                                        keyboardType="number-pad"
                                        placeholder="Age"
                                        placeholderTextColor={colors.textTertiary}
                                    />
                                ) : (
                                    <Text style={styles.infoValue}>{user?.age || '--'} years</Text>
                                )}
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Gender</Text>
                                {isEditingProfile ? (
                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        <TouchableOpacity onPress={() => setEditGender('male')}>
                                            <Text style={[styles.infoValue, editGender === 'male' && { color: colors.primaryStart }]}>Male</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.infoValue}>|</Text>
                                        <TouchableOpacity onPress={() => setEditGender('female')}>
                                            <Text style={[styles.infoValue, editGender === 'female' && { color: colors.primaryStart }]}>Female</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{user?.gender || '--'}</Text>
                                )}
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Weight</Text>
                                {isEditingProfile ? (
                                    <TextInput
                                        style={styles.editInput}
                                        value={editWeight}
                                        onChangeText={setEditWeight}
                                        keyboardType="decimal-pad"
                                        placeholder="kg"
                                        placeholderTextColor={colors.textTertiary}
                                    />
                                ) : (
                                    <Text style={styles.infoValue}>{user?.weight || '--'} kg</Text>
                                )}
                            </View>
                            <View style={styles.infoRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <Text style={[styles.infoLabel, { flex: 0, marginRight: 8 }]}>Height</Text>

                                    {isEditingProfile && (
                                        <View style={styles.unitSelector}>
                                            {(['cm', 'ft', 'm'] as const).map((unit) => (
                                                <TouchableOpacity
                                                    key={unit}
                                                    style={[styles.unitButton, heightUnit === unit && styles.unitButtonActive]}
                                                    onPress={() => {
                                                        // Convert current value to new unit when switching
                                                        let newHeight = editHeight;
                                                        // First convert to cm
                                                        let cmVal = 0;
                                                        if (heightUnit === 'cm') cmVal = parseFloat(editHeight) || 0;
                                                        else if (heightUnit === 'ft') cmVal = feetToCm(editHeight);
                                                        else cmVal = metersToCm(parseFloat(editHeight));

                                                        setHeightUnit(unit);

                                                        // Then convert to new unit
                                                        if (unit === 'cm') newHeight = cmVal.toString();
                                                        else if (unit === 'ft') newHeight = cmToFeet(cmVal);
                                                        else newHeight = cmToMeters(cmVal).toString();

                                                        setEditHeight(newHeight);
                                                    }}
                                                >
                                                    <Text style={[styles.unitText, heightUnit === unit && styles.unitTextActive]}>{unit}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                {isEditingProfile ? (
                                    <TextInput
                                        style={styles.editInput}
                                        value={editHeight}
                                        onChangeText={setEditHeight}
                                        keyboardType={heightUnit === 'ft' ? 'default' : 'numeric'}
                                        placeholder={heightUnit}
                                        placeholderTextColor={colors.textTertiary}
                                    />
                                ) : (
                                    <Text style={styles.infoValue}>{formatHeight(user?.height || 0, heightUnit)}</Text>
                                )}
                            </View>

                            {/* Body Composition */}
                            <Text style={styles.modalSectionTitle}>Body Composition</Text>
                            <Text style={[styles.summaryInfo, { fontSize: 11, marginBottom: 8, fontStyle: 'italic' }]}>
                                Your Current vs. Healthy Range
                            </Text>

                            <View style={styles.infoRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.infoLabel}>Current BMI</Text>
                                    <Text style={[styles.infoValue, { color: getMetricStatusColor('bmi', bodyComp?.bmi || 0) }]}>{bodyComp?.bmi?.toFixed(1) || '--'}</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={[styles.infoLabel, { fontSize: 11 }]}>Healthy Range</Text>
                                    <Text style={[styles.infoValue, { fontSize: 12, color: colors.accentSuccess }]}>18.5 - 24.9</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.infoLabel}>Body Fat</Text>
                                    <Text style={[styles.infoValue, { color: getMetricStatusColor('bodyFat', bodyComp?.bodyFat || 0) }]}>{bodyComp?.bodyFat || '--'} kg</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={[styles.infoLabel, { fontSize: 11 }]}>Healthy Range</Text>
                                    <Text style={[styles.infoValue, { fontSize: 12, color: colors.accentSuccess }]}>
                                        {user?.gender === 'male' ? '10-20%' : '18-28%'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.infoLabel}>BMR</Text>
                                    <Text style={styles.infoValue}>{bodyComp?.bmr || '--'} kcal</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={[styles.infoLabel, { fontSize: 11 }]}>Daily Calories</Text>
                                    <Text style={[styles.infoValue, { fontSize: 12, color: colors.textSecondary }]}>Base metabolism</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.infoLabel}>Visceral Fat</Text>
                                    <Text style={[styles.infoValue, { color: getMetricStatusColor('visceralFat', bodyComp?.visceralFat || 0) }]}>{bodyComp?.visceralFat || '--'}%</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={[styles.infoLabel, { fontSize: 11 }]}>Healthy Range</Text>
                                    <Text style={[styles.infoValue, { fontSize: 12, color: colors.accentSuccess }]}>{'<10%'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.infoLabel}>Skeletal Muscle</Text>
                                    <Text style={[styles.infoValue, { color: getMetricStatusColor('skeletalMuscle', bodyComp?.skeletalMuscle || 0) }]}>{bodyComp?.skeletalMuscle || '--'} kg</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={[styles.infoLabel, { fontSize: 11 }]}>Healthy Range</Text>
                                    <Text style={[styles.infoValue, { fontSize: 12, color: colors.accentSuccess }]}>
                                        {user?.gender === 'male' ? '>40% body wt' : '>30% body wt'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.infoLabel}>Body Age</Text>
                                    <Text style={[styles.infoValue, { color: getMetricStatusColor('bodyAge', bodyComp?.bodyAge || 0) }]}>{bodyComp?.bodyAge || '--'} years</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={[styles.infoLabel, { fontSize: 11 }]}>Target</Text>
                                    <Text style={[styles.infoValue, { fontSize: 12, color: colors.accentSuccess }]}>
                                        Equal to age ({user?.age || '--'})
                                    </Text>
                                </View>
                            </View>

                            {/* Fitness Profile */}
                            <Text style={styles.modalSectionTitle}>Fitness Profile</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Primary Goal</Text>
                                {isEditingProfile ? (
                                    <View style={styles.editOptionsContainer}>
                                        {[
                                            { value: 'weight_loss', label: 'Loss' },
                                            { value: 'muscle_gain', label: 'Gain' },
                                            { value: 'endurance', label: 'Endure' },
                                            { value: 'flexibility', label: 'Flex' },
                                        ].map(goal => (
                                            <TouchableOpacity
                                                key={goal.value}
                                                onPress={() => setEditFitnessGoal(goal.value as any)}
                                                style={[styles.editOptionChip, editFitnessGoal === goal.value && styles.editOptionChipActive]}
                                            >
                                                <Text style={[styles.editOptionText, editFitnessGoal === goal.value && styles.editOptionTextActive]}>{goal.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
                                        {user?.fitnessGoal?.replace('_', ' ') || '--'}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Experience</Text>
                                {isEditingProfile ? (
                                    <View style={styles.editOptionsContainer}>
                                        {['beginner', 'intermediate', 'advanced'].map(exp => (
                                            <TouchableOpacity
                                                key={exp}
                                                onPress={() => setEditExperienceLevel(exp as any)}
                                                style={[styles.editOptionChip, editExperienceLevel === exp && styles.editOptionChipActive]}
                                            >
                                                <Text style={[styles.editOptionText, editExperienceLevel === exp && styles.editOptionTextActive]}>{exp.charAt(0).toUpperCase() + exp.slice(1, 3)}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
                                        {user?.fitnessProfile?.experienceLevel || user?.workoutExperience || '--'}
                                    </Text>
                                )}
                            </View>

                            {/* Equipment & Health */}
                            <Text style={styles.modalSectionTitle}>Environment & Health</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Location</Text>
                                {isEditingProfile ? (
                                    <View style={styles.editOptionsContainer}>
                                        {[
                                            { value: 'bodyweight', label: 'Home' },
                                            { value: 'home', label: 'Equip' },
                                            { value: 'gym', label: 'Gym' },
                                        ].map(loc => (
                                            <TouchableOpacity
                                                key={loc.value}
                                                onPress={() => setEditEquipmentAccess(loc.value as any)}
                                                style={[styles.editOptionChip, editEquipmentAccess === loc.value && styles.editOptionChipActive]}
                                            >
                                                <Text style={[styles.editOptionText, editEquipmentAccess === loc.value && styles.editOptionTextActive]}>{loc.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
                                        {user?.fitnessProfile?.equipmentAccess || '--'}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Health Issues</Text>
                                {isEditingProfile ? (
                                    <View style={styles.tagContainer}>
                                        {COMMON_HEALTH_ISSUES.map((issue) => (
                                            <TouchableOpacity
                                                key={issue}
                                                style={[
                                                    styles.infoTag,
                                                    editHealthIssues.includes(issue) && { backgroundColor: colors.accentError + '33' }
                                                ]}
                                                onPress={() => toggleEditHealthIssue(issue)}
                                            >
                                                <Text style={[
                                                    styles.tagText,
                                                    editHealthIssues.includes(issue) && { color: colors.accentError }
                                                ]}>
                                                    {issue.replace('_', ' ')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={styles.tagContainer}>
                                        {user?.fitnessProfile?.healthIssues && user.fitnessProfile.healthIssues.length > 0 ? (
                                            user.fitnessProfile.healthIssues.map((issue, idx) => (
                                                <View key={idx} style={styles.infoTag}>
                                                    <Text style={styles.tagText}>{issue.replace('_', ' ')}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.infoValue}>None declared</Text>
                                        )}
                                    </View>
                                )}
                            </View>
                            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.infoLabel}>Equipment</Text>
                                {isEditingProfile ? (
                                    <View style={styles.tagContainer}>
                                        {EQUIPMENT_OPTIONS.map((eq) => (
                                            <TouchableOpacity
                                                key={eq.id}
                                                style={[
                                                    styles.infoTag,
                                                    editAvailableEquipment.includes(eq.id) && { backgroundColor: colors.accentCyan + '33' }
                                                ]}
                                                onPress={() => toggleEditEquipment(eq.id)}
                                            >
                                                <Text style={[
                                                    styles.tagText,
                                                    editAvailableEquipment.includes(eq.id) && { color: colors.accentCyan }
                                                ]}>
                                                    {eq.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={styles.tagContainer}>
                                        {user?.fitnessProfile?.availableEquipment && user.fitnessProfile.availableEquipment.length > 0 ? (
                                            user.fitnessProfile.availableEquipment.map((eq, idx) => (
                                                <View key={idx} style={[styles.infoTag, { backgroundColor: 'rgba(7, 185, 231, 0.1)' }]}>
                                                    <Text style={[styles.tagText, { color: colors.accentCyan }]}>{eq.replace('_', ' ')}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.infoValue}>Bodyweight only</Text>
                                        )}
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowUserInfoModal(false)}
                            style={{ marginTop: 20 }}
                        >
                            <LinearGradient
                                colors={gradients.primary}
                                style={styles.saveButton}
                            >
                                <Text style={styles.saveButtonText}>Back to Profile</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            )}

            {/* Metrics Modal */}
            {
                showMetricsModal && (
                    <BlurView intensity={50} tint={isDark ? "light" : "dark"} style={styles.modalOverlay}>
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>Update Body Metrics</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Current Weight (kg)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={currentWeight}
                                    onChangeText={setCurrentWeight}
                                    keyboardType="numeric"
                                    placeholder="e.g., 75"
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Goal Weight (kg) - Optional</Text>
                                <TextInput
                                    style={styles.input}
                                    value={goalWeight}
                                    onChangeText={setGoalWeight}
                                    keyboardType="numeric"
                                    placeholder="e.g., 70"
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowMetricsModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleUpdateMetrics}
                                    style={{ flex: 1 }}
                                >
                                    <LinearGradient
                                        colors={gradients.primary}
                                        style={styles.saveButton}
                                    >
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>
                )
            }

            {/* Change Password Modal */}
            {
                showChangePasswordModal && (
                    <BlurView intensity={50} tint={isDark ? "light" : "dark"} style={styles.modalOverlay}>
                        <View style={styles.modal}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Change Password</Text>
                                <TouchableOpacity
                                    style={styles.closeModalButton}
                                    onPress={() => setShowChangePasswordModal(false)}
                                >
                                    <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Current Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry
                                    placeholder="Enter current password"
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                    placeholder="Enter new password (min 6 chars)"
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Confirm New Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#666"
                                />
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleChangePassword}
                                    style={{ flex: 1 }}
                                >
                                    <LinearGradient
                                        colors={gradients.primary}
                                        style={styles.saveButton}
                                    >
                                        <Text style={styles.saveButtonText}>Update Password</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>
                )
            }

            {/* Success Modal */}
            {showSuccessModal && (
                <BlurView intensity={80} tint={isDark ? "light" : "dark"} style={styles.modalOverlay}>
                    <View style={styles.successModal}>
                        <View style={styles.successIconContainer}>
                            <Text style={styles.successIcon}>✨</Text>
                        </View>
                        <Text style={styles.successTitle}>Profile Updated!</Text>
                        <Text style={styles.successMessage}>
                            Your profile and workout plan have been updated successfully.
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowSuccessModal(false)}
                            style={{ width: '100%', marginTop: 24 }}
                        >
                            <LinearGradient
                                colors={gradients.primary}
                                style={styles.successButton}
                            >
                                <Text style={styles.successButtonText}>Awesome!</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            )}
        </LinearGradient >
    );
}

const createStyles = (colors: ThemeColorsType, shadows: ThemeShadowsType) => StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: colors.accentError,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 100,
    },
    backLink: {
        color: colors.primaryStart,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: Spacing.l,
        paddingBottom: Spacing.m,
    },
    backButtonGeneric: {
        marginRight: Spacing.m,
    },
    backButton: {
        color: colors.accentCyan,
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
    },
    // deleted sectionTitle

    // Avatar Card
    avatarCard: {
        borderRadius: Layout.borderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassSurface,
        ...shadows.card,
    },
    avatarCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
        ...shadows.glow,
        borderWidth: 4,
        borderColor: colors.primaryStart + '4D',
        shadowColor: colors.primaryStart, // Override shadow color
    },
    avatarEmoji: {
        fontSize: 80,
    },
    defaultAvatarContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: colors.glassBorder,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 80,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: colors.accentCyan,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.backgroundDark,
        ...shadows.small,
    },
    editIconText: {
        fontSize: 18,
    },
    userName: {
        fontSize: 24, // Main name size
        fontWeight: '800',
        color: colors.textPrimary,
        marginTop: Spacing.m,
        marginBottom: 4,
        textAlign: 'center',
    },
    levelName: {
        fontSize: 16, // Reduced slightly to be secondary to name
        fontWeight: '600',
        color: colors.accentCyan,
        marginBottom: Spacing.xs,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    levelBadge: {
        fontSize: 15,
        color: colors.accentCyan,
        marginTop: 6,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    streakContainer: {
        marginTop: Spacing.m,
        overflow: 'hidden',
        borderRadius: Layout.borderRadius.round,
        ...shadows.small,
    },
    streakGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    streakIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    streakText: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '800',
    },

    // Progress Card
    progressCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassSurface,
        ...shadows.card,
    },
    progressItem: {
        marginBottom: Spacing.m,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        alignItems: 'center',
    },
    progressLabel: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    progressValue: {
        color: colors.accentCyan,
        fontSize: 15,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 14,
        backgroundColor: colors.glassSurface,
        borderRadius: 7,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    progressFill: {
        height: '100%',
        borderRadius: 7,
    },

    // Stats Card
    statsCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statItem: {
        width: '47%',
        backgroundColor: colors.glassSurface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        ...shadows.small,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },

    // Metrics Card
    metricsCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
    },
    metricsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    editButton: {
        color: colors.primaryStart,
        fontSize: 14,
        fontWeight: '600',
    },
    metricsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricItem: {
        alignItems: 'center',
    },
    metricLabel: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    metricValue: {
        color: colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    unit: {
        fontSize: 14,
        color: colors.textTertiary,
        fontWeight: 'normal',
    },
    goalValue: {
        color: colors.accentSuccess,
    },
    metricArrow: {
        marginHorizontal: 16,
    },
    arrowText: {
        color: colors.glassBorder,
        fontSize: 24,
    },
    addMetricsButton: {
        padding: 16,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        borderRadius: 12,
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    addMetricsText: {
        color: colors.primaryStart,
        fontSize: 14,
    },

    // Achievements Card
    achievementsCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.s, // Reduced padding
        marginBottom: Spacing.l,
        overflow: 'hidden',
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // Reduced gap
    },
    achievementItem: {
        width: '22%', // Fit 4 per row
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        padding: 8, // Reduced padding
        alignItems: 'center',
    },
    achievementLocked: {
        opacity: 0.5,
    },
    achievementIcon: {
        fontSize: 24, // Reduced icon size
        marginBottom: 2,
    },
    achievementName: {
        color: colors.textPrimary,
        fontSize: 9, // Reduced font size
        textAlign: 'center',
    },
    achievementNameLocked: {
        color: colors.textTertiary,
    },

    // Roadmap Card
    roadmapCard: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.s, // Reduced padding
        marginBottom: Spacing.l,
        overflow: 'hidden',
    },
    roadmapItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8, // Reduced vertical padding
        borderBottomWidth: 1,
        borderBottomColor: colors.glassBorder,
        opacity: 0.5,
    },
    roadmapItemActive: {
        opacity: 0.8,
    },
    roadmapItemCurrent: {
        opacity: 1,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        borderRadius: 8,
        paddingHorizontal: 8,
        marginHorizontal: -8,
    },
    roadmapIcon: {
        fontSize: 24, // Increased back for readability
        marginRight: 10,
        marginTop: 2,
    },
    roadmapInfo: {
        flex: 1,
    },
    roadmapName: {
        color: colors.textSecondary,
        fontSize: 16, // Increased back
        fontWeight: '600',
    },
    roadmapNameActive: {
        color: colors.textPrimary,
    },
    roadmapReq: {
        color: colors.textTertiary,
        fontSize: 12, // Increased back
        marginTop: 2,
    },
    roadmapCheck: {
        color: colors.accentSuccess,
        fontSize: 18, // Increased back
        fontWeight: 'bold',
        marginLeft: 8,
    },

    // Sign Out Button
    signOutButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    signOutButtonText: {
        color: colors.textPrimary,
        fontSize: 16, // Increased back
        fontWeight: '600',
    },



    // Unlocked Exercises Styles
    unlockedExercisesContainer: {
        marginTop: 4, // Reduced margin
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 6,
        padding: 6, // Reduced padding
    },
    unlockedLabel: {
        color: colors.accentCyan,
        fontSize: 12, // Increased back
        fontWeight: 'bold',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    unlockedList: {
        flexDirection: 'column',
    },
    unlockedItem: {
        color: colors.textSecondary,
        fontSize: 12, // Increased back
        marginBottom: 1,
    },

    // Unit Selector Styles
    unitSelector: {
        flexDirection: 'row',
        backgroundColor: colors.glassSurface,
        borderRadius: 8,
        padding: 2,
        marginLeft: 12,
        marginRight: 'auto',
    },
    unitButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    unitButtonActive: {
        backgroundColor: colors.primaryStart,
    },
    unitText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    unitTextActive: {
        color: '#FFFFFF',
    },

    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        paddingBottom: 4,
        gap: 4,
    },
    showMoreText: {
        color: colors.primaryStart,
        fontSize: 12,
        fontWeight: '600',
    },

    // Modal
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: colors.backgroundLight,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...shadows.card,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 12,
        padding: 16,
        color: colors.textPrimary,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 16,
    },

    // Disclaimer
    disclaimerContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    disclaimerText: {
        color: colors.textTertiary,
        fontSize: 11,
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 16,
    },

    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        ...shadows.glow,
        fontWeight: 'bold',
    },

    // Menu Styles
    menuCard: {
        borderRadius: Layout.borderRadius.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    menuIcon: {
        marginRight: 16,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textSecondary,
        marginBottom: 8,
        marginTop: 16,
        marginLeft: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // User Info Styles
    userInfoCard: {
        borderRadius: Layout.borderRadius.l,
        marginBottom: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassSurface,
    },
    userInfoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    userInfoTextContainer: {
        flex: 1,
    },
    userInfoTitle: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    userInfoSubtitle: {
        color: colors.textTertiary,
        fontSize: 12,
        marginTop: 2,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.glassSurface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },

    // Modal Specific Styles
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    closeModalButton: {
        padding: 4,
    },
    modalSectionTitle: {
        color: colors.accentCyan,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 16,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        paddingBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    infoLabel: {
        color: colors.textSecondary,
        fontSize: 14,
        flex: 1,
    },
    infoValue: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1.5,
    },
    editInput: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        borderBottomWidth: 1,
        borderBottomColor: colors.primaryStart,
        paddingVertical: 2,
        minWidth: 60,
        textAlign: 'right',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        flex: 2,
        gap: 6,
    },
    infoTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '600',
    },
    summaryInfo: {
        color: colors.textTertiary,
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    editOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'flex-end',
        flex: 2,
    },
    editOptionChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    editOptionChipActive: {
        backgroundColor: colors.primaryStart,
        borderColor: colors.primaryStart,
    },
    editOptionText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '600',
    },
    editOptionTextActive: {
        color: colors.textPrimary,
    },
    // Success Modal Styles
    successModal: {
        backgroundColor: colors.backgroundLight,
        borderRadius: 24,
        padding: 32,
        width: '90%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        alignItems: 'center',
        ...shadows.card,
    },
    successIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primaryStart + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successIcon: {
        fontSize: 48,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    successButton: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        ...shadows.small,
    },
    successButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

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
    Linking,
    Share,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Modal, // Added Modal
    Switch // Added Switch
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { useBilling } from '../context/BillingContext';
import { useToast } from '../context/ToastContext';
import { RootState } from '../store'; // Added RootState import
import { uploadPhoto, signOut, updateProfile, changePassword } from '../store/slices/authSlice';
import { setAvatarScrollOffset } from '../store/slices/uiSlice';
import { regenerateUserPlan, fetchCustomPlans, deleteCustomPlan, duplicatePlan, switchActivePlan, switchToAIPlan } from '../store/slices/workoutPlanSlice';
import { toggleSetting } from '../store/slices/settingsSlice'; // Added toggleSetting import
import { UserProfile } from '../types';
import {
    avatarService,
    AvatarState,
    AVATAR_LEVELS,
    ACHIEVEMENTS
} from '../services/AvatarService';
import { feetToCm, metersToCm, cmToFeet, cmToMeters, formatHeight } from '../utils/unitConversion';
import { exercises } from '../models/exercises'; // Import exercises data
import { Spacing, Layout, Shadows, ThemeColorsType, ThemeShadowsType, Typography } from '../theme/Theme';
import { useTheme } from '../hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PremiumGate } from '../components/PremiumGate';
import CustomAlert from '../components/CustomAlert';
// Sub-components (extracted for maintainability)
import ProfileCard from '../components/avatar/ProfileCard';
import AppSettings from '../components/avatar/AppSettings';
import BodyMetrics from '../components/avatar/BodyMetrics';

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
    isTab?: boolean;
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export default function AvatarScreen({ navigation, isTab, onScroll }: AvatarScreenProps) {
    const dispatch = useAppDispatch();
    const { colors, gradients, shadows, isDark, toggleTheme } = useTheme();
    const { purchased } = useBilling();
    const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
    const { user, loading: authLoading } = useAppSelector((state: RootState) => state.auth); // Modified to use RootState
    const { notificationsEnabled } = useAppSelector((state: RootState) => state.settings); // Added settings state
    const { currentPlan, customPlans } = useAppSelector((state) => state.workoutPlan);
    const { avatarScrollOffset } = useAppSelector((state) => state.ui);
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [avatarState, setAvatarState] = useState<AvatarState | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
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
    const [successType, setSuccessType] = useState<'profile' | 'metrics'>('profile');

    // Change Password State
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showRoadmapModal, setShowRoadmapModal] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showSignOutAlert, setShowSignOutAlert] = useState(false);
    const [showDeletePlanAlert, setShowDeletePlanAlert] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<any>(null);
    const [showPermissionAlert, setShowPermissionAlert] = useState(false);

    useEffect(() => {
        loadAvatarState();
        if (user?.uid) {
            dispatch(fetchCustomPlans(user.uid));
        }
    }, []);

    // Restore scroll position when loading finishes
    useEffect(() => {
        if (!loading && avatarScrollOffset > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: avatarScrollOffset, animated: false });
            }, 50); // Reduced delay for snappier feel
        }
    }, [loading]);

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
                setShowPermissionAlert(true);
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
                showToast('Uploading photo...', 'info');
                await dispatch(uploadPhoto(uri)).unwrap();
                showToast('Profile photo updated!', 'success');
            }
        } catch (error: any) {
            showToast(error.message || 'Failed to update photo', 'error');
        }
    };

    const handleUpdateMetrics = async () => {
        const weight = parseFloat(currentWeight);
        const goal = parseFloat(goalWeight);

        if (isNaN(weight) || weight <= 0) {
            showToast('Please enter a valid weight', 'warning');
            return;
        }

        await avatarService.updateBodyMetrics({
            currentWeight: weight,
            goalWeight: isNaN(goal) ? undefined : goal,
        });

        setShowMetricsModal(false);
        loadAvatarState();
        setSuccessType('metrics');
        setShowSuccessModal(true);
    };

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: "Join me on FIZI! It's an AI-powered personal trainer that adapts to your progress. Download here: https://play.google.com/store/apps/details?id=com.maheshchalla.fizi&pcampaignid=web_share",
            });
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleSignOut = () => {
        setShowSignOutAlert(true);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'warning');
            return;
        }

        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'warning');
            return;
        }

        try {
            await dispatch(changePassword({ current: currentPassword, new: newPassword })).unwrap();
            showToast('Password changed successfully', 'success');
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
            showToast(message, 'error');
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
            setShowUserInfoModal(false);
            setSuccessType('profile');
            setShowSuccessModal(true);
        } catch (error: any) {
            showToast(error.message || 'Failed to update profile', 'error');
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

    // Notification Settings Handlers
    const handleToggleNotification = (value: boolean) => {
        dispatch(toggleSetting({ key: 'notificationsEnabled', value }));
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

    const ContentWrapper = isTab ? View : LinearGradient;
    const wrapperProps = isTab ? { style: styles.container } : { colors: gradients.background, style: styles.container };

    return (
        <ContentWrapper {...wrapperProps as any}>
            {!isTab && (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonGeneric}>
                        <Text style={styles.backButton}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Hero Journey</Text>
                </View>
            )}

            <ScrollView
                ref={scrollViewRef}
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={isTab ? { paddingTop: 60, paddingBottom: 120 } : undefined}
                onScroll={(e) => {
                    onScroll && onScroll(e);
                }}
                onMomentumScrollEnd={(e) => {
                    dispatch(setAvatarScrollOffset(e.nativeEvent.contentOffset.y));
                }}
                onScrollEndDrag={(e) => {
                    dispatch(setAvatarScrollOffset(e.nativeEvent.contentOffset.y));
                }}
                scrollEventThrottle={16}
                directionalLockEnabled={true}
            >
                {/* Avatar Display */}
                {/* Avatar Header Card - now in ProfileCard sub-component */}
                <ProfileCard
                    user={user}
                    avatarLevelName={avatarState.levelName}
                    avatarLevel={avatarState.level}
                    avatarCurrentStreak={avatarState.currentStreak}
                    authLoading={authLoading}
                    isPremium={purchased}
                    onPickImage={handlePickImage}
                />



                {/* User Info Section */}
                {/* Premium Subscription Card */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Subscription')}
                    activeOpacity={0.9}
                    style={{ marginBottom: 15 }}
                >
                    <LinearGradient
                        colors={gradients.gold}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.menuCard, { borderColor: '#EAB308', borderWidth: 1 }]}
                    >
                        <View style={styles.menuItem}>
                            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
                                <MaterialCommunityIcons name="crown" size={24} color="#000" />
                            </View>
                            <View style={styles.userInfoTextContainer}>
                                <Text style={[styles.userInfoTitle, { color: '#000', fontWeight: 'bold' }]}>
                                    {purchased ? 'Premium Member' : 'Go Premium'}
                                </Text>
                                <Text style={[styles.userInfoSubtitle, { color: 'rgba(0,0,0,0.7)' }]}>
                                    {purchased
                                        ? (user?.premiumExpiryDate ? `Valid until ${new Date(user.premiumExpiryDate).toLocaleDateString()}` : 'Manage Subscription')
                                        : 'Unlock AI Analysis & More'}
                                </Text>
                            </View>
                            <View style={{
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: 12,
                                padding: 6
                            }}>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#000" />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* User Info Section */}
                <TouchableOpacity
                    onPress={() => setShowUserInfoModal(true)}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={isDark ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] : ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']}
                        style={styles.menuCard}
                    >
                        <View style={styles.menuItem}>
                            <LinearGradient
                                colors={[colors.accentCyan + '20', colors.accentCyan + '05']}
                                style={styles.menuIconContainer}
                            >
                                <MaterialCommunityIcons name="account-details-outline" size={22} color={colors.accentCyan} />
                            </LinearGradient>
                            <View style={styles.userInfoTextContainer}>
                                <Text style={styles.userInfoTitle}>User Profile</Text>
                                <Text style={styles.userInfoSubtitle}>Personal details & settings</Text>
                            </View>
                            <View style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                borderRadius: 12,
                                padding: 6
                            }}>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Exercise Library */}
                {/* Exercise Library */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('ExerciseLibrary')}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={isDark ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] : ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']}
                        style={styles.menuCard}
                    >
                        <View style={styles.menuItem}>
                            <LinearGradient
                                colors={[colors.accentCyan + '20', colors.accentCyan + '05']}
                                style={styles.menuIconContainer}
                            >
                                <MaterialCommunityIcons name="dumbbell" size={22} color={colors.accentCyan} />
                            </LinearGradient>
                            <View style={styles.userInfoTextContainer}>
                                <Text style={styles.userInfoTitle}>Exercise Library</Text>
                                <Text style={styles.userInfoSubtitle}>Browse all 300+ exercises</Text>
                            </View>
                            <View style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                borderRadius: 12,
                                padding: 6
                            }}>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Custom Workout Plans */}
                <View style={styles.customPlansSection}>
                    {/* Active Plan Management Card */}
                    <LinearGradient
                        colors={currentPlan?.planType === 'custom' ? ['rgba(7, 185, 231, 0.15)', 'rgba(7, 185, 231, 0.05)'] : ['rgba(255, 113, 113, 0.15)', 'rgba(255, 113, 113, 0.05)']}
                        style={[styles.customPlanCard, { marginBottom: Spacing.l, flexDirection: 'column', borderWidth: 1, borderColor: currentPlan?.planType === 'custom' ? colors.accentCyan + '4D' : colors.accentPink + '4D' }]}
                    >
                        <View style={[styles.customPlansHeader, { marginBottom: Spacing.s, paddingHorizontal: 0 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.s }}>
                                <MaterialCommunityIcons
                                    name={currentPlan?.planType === 'custom' ? 'clipboard-edit' : 'robot'}
                                    size={24}
                                    color={currentPlan?.planType === 'custom' ? colors.accentCyan : colors.accentPink}
                                />
                                <View>
                                    <Text style={[styles.sectionTitle, { marginBottom: 2, marginLeft: 0 }]}>Current Strategy</Text>
                                    <Text style={{ color: colors.textPrimary, fontWeight: '800', fontSize: 18, letterSpacing: 0.5 }}>
                                        {currentPlan?.planType === 'custom' ? 'Custom Plan Active' : 'AI Plan Active'}
                                    </Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2, fontWeight: '500' }}>
                                        {currentPlan?.frequency} days/week • {currentPlan?.sessions.filter(s => !s.isRestDay).length} sessions
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.customPlanActions, { marginTop: Spacing.m }]}>
                            {currentPlan?.planType === 'custom' ? (
                                <TouchableOpacity
                                    style={[styles.actionButton, { flex: 1, backgroundColor: colors.accentPink + '20', borderRadius: Layout.borderRadius.m, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.accentPink + '4D' }]}
                                    onPress={async () => {
                                        if (user?.uid) {
                                            try {
                                                await dispatch(switchToAIPlan(user.uid)).unwrap();
                                            } catch (err) {
                                                navigation.navigate('Assessment');
                                            }
                                        }
                                    }}
                                >
                                    <MaterialCommunityIcons name="robot" size={20} color={colors.accentPink} />
                                    <Text style={{ color: colors.textPrimary, marginLeft: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Switch to AI Strategy</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={{ gap: Spacing.s, width: '100%' }}>
                                    <View style={{ paddingVertical: Spacing.s, paddingHorizontal: Spacing.xs, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Layout.borderRadius.s }}>
                                        <Text style={{ color: colors.textSecondary, fontStyle: 'italic', fontSize: 13, textAlign: 'center' }}>
                                            ✨ Your AI plan adapts to your progress automatically.
                                        </Text>
                                    </View>
                                    {customPlans.length > 0 ? (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: 'transparent', borderRadius: Layout.borderRadius.m, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.glassBorder }]}
                                            onPress={() => {
                                                if (user?.uid) {
                                                    const latestPlan = customPlans[0];
                                                    dispatch(switchActivePlan({
                                                        userId: user.uid,
                                                        planId: latestPlan.id,
                                                        planType: 'custom'
                                                    }));
                                                }
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name="swap-horizontal"
                                                size={20}
                                                color={colors.textSecondary}
                                            />
                                            <Text style={{ color: colors.textSecondary, marginLeft: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                Switch to Custom Plan
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <PremiumGate featureName="Custom Plans" navigation={navigation} variant="compact">
                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: 'transparent', borderRadius: Layout.borderRadius.m, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.glassBorder }]}
                                                onPress={() => navigation.navigate('CustomPlanBuilder')}
                                            >
                                                <MaterialCommunityIcons
                                                    name="plus-circle-outline"
                                                    size={20}
                                                    color={colors.textSecondary}
                                                />
                                                <Text style={{ color: colors.textSecondary, marginLeft: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    Create New From Scratch
                                                </Text>
                                            </TouchableOpacity>
                                        </PremiumGate>
                                    )}


                                </View>
                            )}
                        </View>
                    </LinearGradient>

                    <View style={[styles.customPlansHeader, { paddingHorizontal: 0 }]}>
                        <View>
                            <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>SAVED PLANS</Text>
                            <Text style={styles.customPlansSubtitle}>
                                {customPlans.length} custom {customPlans.length === 1 ? 'plan' : 'plans'}
                            </Text>
                        </View>
                        <View style={{ overflow: 'hidden', borderRadius: 20 }}>
                            <PremiumGate featureName="Custom Plans" navigation={navigation} variant="icon">
                                <TouchableOpacity
                                    style={styles.createPlanButton}
                                    onPress={() => navigation.navigate('CustomPlanBuilder')}
                                >
                                    <MaterialCommunityIcons name="plus" size={24} color="#000" />
                                </TouchableOpacity>
                            </PremiumGate>
                        </View>
                    </View>

                    {customPlans.length > 0 ? (
                        <View style={styles.customPlansList}>
                            {customPlans.map((plan, index) => (
                                <BlurView
                                    key={plan.id}
                                    intensity={20}
                                    tint={isDark ? "light" : "dark"}
                                    style={styles.customPlanCard}
                                >
                                    <View style={styles.customPlanInfo}>
                                        <Text style={styles.customPlanName} numberOfLines={1} ellipsizeMode="tail">{plan.name}</Text>
                                        <Text style={styles.customPlanMeta} numberOfLines={1} ellipsizeMode="tail">
                                            {plan.frequency} d/w • {plan.sessions.filter(s => !s.isRestDay).length} sess
                                        </Text>
                                        {currentPlan?.id === plan.id && (
                                            <View style={styles.activePlanBadge}>
                                                <Text style={styles.activePlanText}>Active</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={[styles.customPlanActions, { gap: 10 }]}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { padding: 4 }]}
                                            onPress={() => navigation.navigate('CustomPlanBuilder', { plan })}
                                        >
                                            <MaterialCommunityIcons name="pencil" size={18} color={colors.accentCyan} />
                                        </TouchableOpacity>

                                        {/* Activate Button - Only show if not active */}
                                        {currentPlan?.id !== plan.id && (
                                            <TouchableOpacity
                                                style={[styles.actionButton, { padding: 4 }]}
                                                onPress={() => {
                                                    if (user?.uid) {
                                                        dispatch(switchActivePlan({
                                                            userId: user.uid,
                                                            planId: plan.id,
                                                            planType: 'custom'
                                                        }));
                                                    }
                                                }}
                                            >
                                                <MaterialCommunityIcons name="play-circle-outline" size={18} color={colors.accentSuccess} />
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity
                                            style={[styles.actionButton, { padding: 4 }]}
                                            onPress={async () => {
                                                if (user?.uid) {
                                                    await dispatch(duplicatePlan({ sourcePlan: plan, userId: user.uid }));
                                                }
                                            }}
                                        >
                                            <MaterialCommunityIcons name="content-copy" size={18} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { padding: 4 }]}
                                            onPress={() => {
                                                setPlanToDelete(plan);
                                                setShowDeletePlanAlert(true);
                                            }}
                                        >
                                            <MaterialCommunityIcons name="delete" size={18} color={colors.accentPink} />
                                        </TouchableOpacity>
                                    </View>
                                </BlurView>
                            ))}
                        </View>
                    ) : (
                        <BlurView intensity={10} tint={isDark ? "light" : "dark"} style={styles.emptyCustomPlansCard}>
                            <TouchableOpacity
                                style={styles.emptyCustomPlansContent}
                                onPress={() => navigation.navigate('CustomPlanBuilder')}
                            >
                                <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={colors.textTertiary} />
                                <Text style={styles.emptyCustomPlansText}>No custom plans yet</Text>
                                <Text style={styles.emptyCustomPlansSubtext}>Create your first custom workout plan</Text>
                            </TouchableOpacity>
                        </BlurView>
                    )}
                </View>

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

                {/* Lifetime Stats */}
                {/* Lifetime Stats */}
                <BlurView intensity={10} tint={isDark ? "light" : "dark"} style={styles.statsCard}>
                    <Text style={styles.sectionTitle}>Lifetime Stats</Text>
                    <View style={styles.statsGrid}>
                        {[
                            { label: 'Workouts', value: avatarState.totalWorkouts, icon: 'dumbbell' },
                            { label: 'Total Reps', value: avatarState.totalReps, icon: 'repeat' },
                            { label: 'Time', value: `${avatarState.totalMinutes}m`, icon: 'clock-outline' },
                            { label: 'Best Streak', value: avatarState.longestStreak, icon: 'fire' },
                        ].map((stat, i) => (
                            <View key={i} style={styles.statItem}>
                                <View style={styles.statIconContainer}>
                                    <MaterialCommunityIcons name={stat.icon as any} size={20} color={colors.accentCyan} />
                                </View>
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

                    {
                        avatarState.bodyMetrics.startWeight ? (
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
                        )
                    }
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

                {/* Level Roadmap & Settings */}
                <Text style={styles.sectionTitle}>Progression</Text>
                <BlurView intensity={10} tint={isDark ? "light" : "dark"} style={styles.menuCard}>
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => setShowRoadmapModal(true)}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialCommunityIcons name="map-marker-path" size={22} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.menuItemText}>Level Map & Unlocks</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                </BlurView>

                {/* Settings — now in AppSettings sub-component */}
                <AppSettings
                    notificationsEnabled={notificationsEnabled}
                    onToggleNotification={handleToggleNotification}
                    onChangePassword={() => setShowChangePasswordModal(true)}
                    onShareApp={handleShareApp}
                    onSignOut={() => setShowSignOutAlert(true)}
                    navigation={navigation}
                />

                {/* Health Disclaimer */}
                <View style={styles.disclaimerContainer}>
                    <Text style={styles.disclaimerText}>
                        Disclaimer: This app provides general fitness guidance only. It is not a medical application. Consult a qualified professional before starting any workout program.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* User Info Modal */}
            {
                showUserInfoModal && (
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
                                onPress={() => {
                                    if (isEditingProfile) {
                                        handleSaveProfile();
                                    } else {
                                        setShowUserInfoModal(false);
                                    }
                                }}
                                style={{ marginTop: 20 }}
                            >
                                <LinearGradient
                                    colors={gradients.primary}
                                    style={styles.saveButton}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {isEditingProfile ? 'Save & Return to Profile' : 'Back to Profile'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                )
            }

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

            {/* Roadmap Modal */}
            {
                showRoadmapModal && (
                    <BlurView intensity={80} tint={isDark ? "light" : "dark"} style={styles.modalOverlay}>
                        <View style={[styles.modal, { maxHeight: '80%' }]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Level Roadmap</Text>
                                <TouchableOpacity
                                    style={styles.closeModalButton}
                                    onPress={() => setShowRoadmapModal(false)}
                                >
                                    <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {
                                    AVATAR_LEVELS.map((level) => {
                                        const levelExercises = exercises.filter(e => e.unlockLevel === level.level);
                                        return (
                                            <View
                                                key={level.level}
                                                style={[
                                                    styles.roadmapItem,
                                                    avatarState.level >= level.level && styles.roadmapItemActive,
                                                    avatarState.level === level.level && styles.roadmapItemCurrent
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
                                                                {levelExercises.map((ex: any) => (
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
                                    })
                                }
                            </ScrollView>
                        </View>
                    </BlurView>
                )
            }

            {/* Success Modal */}
            {
                showSuccessModal && (
                    <BlurView intensity={80} tint={isDark ? "light" : "dark"} style={styles.modalOverlay}>
                        <View style={styles.successModal}>
                            <View style={styles.successIconContainer}>
                                <Text style={styles.successIcon}>✨</Text>
                            </View>
                            <Text style={styles.successTitle}>
                                {successType === 'profile' ? 'Profile Updated!' : 'Metrics Updated!'}
                            </Text>
                            <Text style={styles.successMessage}>
                                {successType === 'profile'
                                    ? 'Your profile and workout plan have been updated successfully.'
                                    : 'Your body stats have been logged successfully. Keep up the good work!'}
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
                )
            }

            {/* Branded Alerts */}
            <CustomAlert
                visible={showSignOutAlert}
                title="Sign Out"
                message="Are you sure you want to sign out of your account?"
                type="warning"
                onDismiss={() => setShowSignOutAlert(false)}
                buttons={[
                    { text: 'Cancel', style: 'cancel', onPress: () => setShowSignOutAlert(false) },
                    {
                        text: 'Sign Out',
                        onPress: async () => {
                            try {
                                await dispatch(signOut()).unwrap();
                                showToast('Signed out successfully', 'success');
                            } catch (error: any) {
                                showToast(error.message || 'Failed to sign out', 'error');
                            }
                        }
                    }
                ]}
            />

            <CustomAlert
                visible={showDeletePlanAlert}
                title="Delete Plan"
                message={`Are you sure you want to delete "${planToDelete?.name}"? This action cannot be undone.`}
                type="warning"
                onDismiss={() => {
                    setShowDeletePlanAlert(false);
                    setPlanToDelete(null);
                }}
                buttons={[
                    {
                        text: 'Cancel', style: 'cancel', onPress: () => {
                            setShowDeletePlanAlert(false);
                            setPlanToDelete(null);
                        }
                    },
                    {
                        text: 'Delete',
                        onPress: () => {
                            if (planToDelete) {
                                dispatch(deleteCustomPlan(planToDelete.id));
                            }
                        }
                    }
                ]}
            />

            <CustomAlert
                visible={showPermissionAlert}
                title="Permission Required"
                message="Please allow access to your photos in settings to upload a profile picture."
                type="info"
                onDismiss={() => setShowPermissionAlert(false)}
                buttons={[
                    { text: 'Got it', onPress: () => setShowPermissionAlert(false) }
                ]}
            />
        </ContentWrapper >
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
        paddingHorizontal: Spacing.m,
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
        paddingHorizontal: Spacing.m,
    },
    // deleted sectionTitle

    // Avatar Card Styles
    avatarCardWrapper: {
        marginBottom: Spacing.m,
        borderRadius: Layout.borderRadius.xl,
        ...shadows.glow, // Outer glow
        shadowColor: colors.primaryStart,
        shadowOpacity: 0.25,
        shadowRadius: 16,
    },
    avatarCard: {
        marginBottom: Spacing.m,
        borderRadius: Layout.borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    avatarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    avatarContainer: {
        marginRight: 20,
    },
    avatarRing: {
        width: 74,
        height: 74,
        borderRadius: 37,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3, // Ring thickness
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 34,
        borderWidth: 2,
        borderColor: colors.backgroundDark, // Separate image from ring
    },
    defaultAvatarContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 34,
        backgroundColor: colors.glassSurface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.backgroundDark,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 34,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.accentCyan,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.backgroundDark,
        ...shadows.small,
    },
    editIconText: {
        fontSize: 14,
    },
    userInfoSection: {
        flex: 1,
        justifyContent: 'center',
    },
    userName: {
        fontSize: 22,
        fontWeight: '900', // Ultrabold
        color: colors.textPrimary,
        marginBottom: 2,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    userTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    levelBadgeContainer: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20, // Pill shape
        borderWidth: 1,
        borderColor: colors.accentCyan + '50',
    },
    levelBadgeText: {
        fontSize: 12,
        color: colors.accentCyan,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    streakBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20, // Pill shape
        borderWidth: 1,
        borderColor: 'rgba(255, 120, 100, 0.4)',
        gap: 6,
    },
    streakEmoji: {
        fontSize: 12,
    },
    streakBadgeText: {
        color: '#FF7864',
        fontSize: 13,
        fontWeight: '800',
    },

    // Progress Card
    progressCard: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.m,
        marginBottom: Spacing.m,
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
        padding: Spacing.m,
        marginBottom: Spacing.m,
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
    statIconContainer: {
        marginBottom: 8,
        padding: 8,
        backgroundColor: colors.accentCyan + '15',
        borderRadius: 20,
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
        padding: Spacing.m,
        marginBottom: Spacing.m,
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
        marginBottom: Spacing.m,
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
        marginBottom: Spacing.m,
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
        ...Typography.h3,
        color: colors.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        ...Typography.caption,
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        ...Typography.body,
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
        ...Typography.body,
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
        ...Typography.caption,
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
        ...Typography.body,
        color: 'white',
        fontSize: 16,
        ...shadows.glow,
        fontWeight: 'bold',
    },

    // Menu Styles
    menuCard: {
        borderRadius: Layout.borderRadius.l,
        marginBottom: Spacing.m,
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
        ...Typography.body,
        flex: 1,
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    sectionTitle: {
        ...Typography.overline,
        color: colors.textSecondary,
        marginBottom: 8,
        marginTop: 16,
    },

    // User Info Styles
    userInfoCard: {
        borderRadius: Layout.borderRadius.l,
        marginBottom: Spacing.m,
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
        ...Typography.body,
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    userInfoSubtitle: {
        ...Typography.caption,
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
        ...Typography.overline,
        color: colors.textSecondary,
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
        ...Typography.body,
        fontSize: 14,
        color: colors.textSecondary,
        flex: 1,
    },
    infoValue: {
        ...Typography.body,
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '600',
        textAlign: 'right',
        flex: 1.5,
    },
    editInput: {
        ...Typography.body,
        color: colors.textPrimary,
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

    // Custom Plans
    customPlansSection: {
        marginBottom: Spacing.l,
    },
    customPlansHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
        paddingHorizontal: 4,
    },
    customPlansSubtitle: {
        fontSize: 13,
        color: colors.textTertiary,
        marginTop: 2,
        marginLeft: 16,
        fontWeight: '500',
    },
    createPlanButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.accentCyan,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.glow,
    },
    customPlansList: {
        gap: Spacing.m,
    },
    customPlanCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    customPlanInfo: {
        flex: 1,
        marginRight: 16,
    },
    customPlanName: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    customPlanMeta: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
        marginBottom: 8,
    },
    activePlanBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(46, 204, 113, 0.2)', // Green tint
    },
    activePlanText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2ecc71', // Standard green
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    customPlanActions: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
    },
    emptyCustomPlansCard: {
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassSurface,
    },
    emptyCustomPlansContent: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    emptyCustomPlansText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: Spacing.m,
    },
    emptyCustomPlansSubtext: {
        fontSize: 12,
        color: colors.textTertiary,
        marginTop: Spacing.xs,
    },
});

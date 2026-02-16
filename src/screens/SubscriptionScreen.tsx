
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBilling } from '../context/BillingContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { BlurView } from 'expo-blur';
import { Spacing, Layout, ThemeColorsType, ThemeShadowsType } from '../theme/Theme';

const SubscriptionScreen = ({ navigation }: { navigation: any }) => {
    const { colors, gradients, shadows, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
    const [selectedPlanId, setSelectedPlanId] = useState<'fizi_premium_3month'>('fizi_premium_3month');

    const {
        products,
        purchased,
        loading,
        purchaseSubscription,
        restorePurchases,
        connected
    } = useBilling();

    useEffect(() => {
        if (purchased) {
            Alert.alert('Premium Active', 'You already have a premium subscription!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }
    }, [purchased]);

    // Helper to get formatted price
    const getPrice = (id: string, defaultPrice: string) => {
        const product = products.find(p => p.id === id);
        if (product?.subscriptionOffers?.[0]) {
            const offer = product.subscriptionOffers[0];
            if (Platform.OS === 'android') {
                return offer.pricingPhasesAndroid?.pricingPhaseList?.[0]?.formattedPrice || offer.displayPrice || defaultPrice;
            } else {
                return offer.displayPrice || defaultPrice;
            }
        }
        return defaultPrice;
    };

    const price3Month = getPrice('fizi_premium_3month', '₹299');

    const handleSubscribe = async () => {
        if (purchased) {
            Alert.alert('Active', 'You are already a premium member.');
            return;
        }
        await purchaseSubscription(selectedPlanId);
    };

    return (
        <LinearGradient colors={gradients.background} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <LinearGradient
                            colors={[colors.accentYellow, '#FFA500']}
                            style={styles.crownIconContainer}
                        >
                            <MaterialCommunityIcons name="crown" size={20} color="#000" />
                        </LinearGradient>
                        <Text style={styles.title}>FIZI <Text style={{ color: colors.accentYellow }}>Premium</Text></Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Compact Features Grid */}
                    <View style={styles.featuresGrid}>
                        <FeatureItem
                            icon="tune-vertical"
                            title="Custom Plans"
                            description="Tailored to your goals"
                            colors={colors}
                            styles={styles}
                        />
                        <FeatureItem
                            icon="camera-iris"
                            title="Live AI Form"
                            description="Real-time correction"
                            colors={colors}
                            styles={styles}
                        />
                        <FeatureItem
                            icon="food-apple"
                            title="Smart Diet"
                            description="Personalized macros"
                            colors={colors}
                            styles={styles}
                        />
                        <FeatureItem
                            icon="chart-timeline-variant"
                            title="Analytics"
                            description="Track detailed trends"
                            colors={colors}
                            styles={styles}
                        />
                    </View>

                    {/* Plan Selection */}
                    <View style={styles.plansContainer}>
                        {/* 3 Month Plan */}
                        <TouchableOpacity
                            activeOpacity={1}
                            style={[
                                styles.planCard,
                                styles.selectedPlanCard
                            ]}
                        >
                            <LinearGradient
                                colors={gradients.primary}
                                style={styles.planCardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View style={styles.checkBox}>
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={24}
                                        color="#FFF"
                                    />
                                </View>
                                <View style={styles.planInfo}>
                                    <Text style={[styles.planName, { color: '#FFF' }]}>Quarterly Plan</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={[styles.planCost, { textDecorationLine: 'line-through', marginRight: 8, opacity: 0.6, color: '#FFF' }]}>₹600</Text>
                                        <Text style={[styles.planCost, { color: '#FFF', fontWeight: 'bold' }]}>{price3Month} / 3mo</Text>
                                    </View>
                                </View>
                                <View style={styles.bestValueBadge}>
                                    <Text style={styles.bestValueText}>50% OFF</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={[styles.subscribeButton, loading && styles.disabledButton]}
                            onPress={handleSubscribe}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        Subscribe for {price3Month}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.disclaimer}>
                            Recurring billing. Cancel anytime.
                        </Text>

                        <TouchableOpacity onPress={restorePurchases} disabled={loading} style={styles.restoreLink}>
                            <Text style={styles.restoreText}>Restore Purchases</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const FeatureItem = ({ icon, title, description, colors, styles }: { icon: any, title: string, description: string, colors: any, styles: any }) => (
    <View style={styles.featureItemWrapper}>
        <BlurView intensity={10} tint="light" style={styles.featureItem}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryStart + '15' }]}>
                <MaterialCommunityIcons name={icon} size={22} color={colors.accentCyan} />
            </View>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>{description}</Text>
        </BlurView>
    </View>
);

const createStyles = (colors: ThemeColorsType, shadows: ThemeShadowsType) => StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingTop: Spacing.s,
        paddingBottom: Spacing.s,
    },
    closeButton: {
        padding: Spacing.xs,
        marginRight: Spacing.m,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 40,
    },
    crownIconContainer: {
        padding: 4,
        borderRadius: 20,
        marginRight: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingHorizontal: Spacing.m,
        paddingBottom: Spacing.xl,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: Spacing.m,
        gap: Spacing.s,
    },
    featureItemWrapper: {
        width: '48%',
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginBottom: Spacing.s,
    },
    featureItem: {
        padding: Spacing.m,
        alignItems: 'flex-start',
        minHeight: 110,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: 11,
        lineHeight: 14,
    },
    plansContainer: {
        marginTop: Spacing.m,
        gap: Spacing.m,
    },
    planCard: {
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 70,
    },
    selectedPlanCard: {
        borderColor: 'rgba(255,255,255,0.5)',
        ...shadows.glow,
    },
    planCardGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
    },
    checkBox: {
        marginRight: Spacing.m,
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textSecondary,
    },
    planCost: {
        fontSize: 14,
        color: colors.textTertiary,
    },
    bestValueBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: colors.accentYellow,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderBottomLeftRadius: 8,
        zIndex: 1,
    },
    bestValueText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 9,
    },
    actionContainer: {
        marginTop: Spacing.xl,
    },
    subscribeButton: {
        width: '100%',
        height: 55,
        borderRadius: Layout.borderRadius.round,
        marginBottom: Spacing.s,
        ...shadows.glow,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Layout.borderRadius.round,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    disabledButton: {
        opacity: 0.7,
    },
    disclaimer: {
        color: colors.textTertiary,
        fontSize: 12,
        textAlign: 'center',
        marginBottom: Spacing.m,
    },
    restoreLink: {
        alignSelf: 'center',
    },
    restoreText: {
        color: colors.textSecondary,
        fontSize: 14,
        textDecorationLine: 'underline',
    }
});

const styles = StyleSheet.create({}); // Fallback for linter/placeholder

export default SubscriptionScreen;

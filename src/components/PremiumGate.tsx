import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useBilling } from '../context/BillingContext';
import { useTheme } from '../hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Layout } from '../theme/Theme';

interface PremiumGateProps {
    children: ReactNode;
    featureName?: string;
    navigation: any;
    lockType?: 'overlay' | 'replacement'; // 'overlay' blurs content, 'replacement' completely hides it
}

export const PremiumGate = ({
    children,
    featureName = 'Premium Feature',
    navigation,
    lockType = 'replacement'
}: PremiumGateProps) => {
    const { purchased } = useBilling();
    const { colors, gradients, isDark } = useTheme();

    if (purchased) {
        return <>{children}</>;
    }

    if (lockType === 'overlay') {
        return (
            <View style={{ flex: 1, position: 'relative' }}>
                <View style={{ opacity: 0.1, pointerEvents: 'none' }}>
                    {children}
                </View>
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 10 }]}>
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                    <LockContent
                        featureName={featureName}
                        navigation={navigation}
                        colors={colors}
                        gradients={gradients}
                    />
                </View>
            </View>
        );
    }

    // Default 'replacement' mode
    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundDark }]}>
            <LockContent
                featureName={featureName}
                navigation={navigation}
                colors={colors}
                gradients={gradients}
            />
        </View>
    );
};

const LockContent = ({ featureName, navigation, colors, gradients }: any) => (
    <View style={styles.lockContent}>
        <LinearGradient
            colors={[colors.accentYellow + '40', colors.accentYellow + '10']}
            style={styles.iconContainer}
        >
            <MaterialCommunityIcons name="lock" size={32} color={colors.accentYellow} />
        </LinearGradient>

        <Text style={[styles.title, { color: colors.textPrimary }]}>{featureName}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Unlock this feature with FIZI Premium
        </Text>

        <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Subscription')}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
            >
                <Text style={styles.buttonText}>Unlock Now</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#000" />
            </LinearGradient>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    lockContent: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.l,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: Spacing.s,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        opacity: 0.8,
    },
    button: {
        width: 200,
        height: 48,
        borderRadius: Layout.borderRadius.round,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Layout.borderRadius.round,
        gap: 8,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

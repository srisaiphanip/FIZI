/**
 * AppSettings
 *
 * All settings sections extracted from AvatarScreen, preserving the
 * original order: Appearance → Notifications → Community →
 * Support & Legal → Account → Sign Out
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Linking,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, Layout } from '../../theme/Theme';

interface AppSettingsProps {
    notificationsEnabled: boolean;
    onToggleNotification: (value: boolean) => void;
    onChangePassword: () => void;
    onShareApp: () => void;
    onSignOut: () => void;
    navigation: any;
}

export default function AppSettings({
    notificationsEnabled,
    onToggleNotification,
    onChangePassword,
    onShareApp,
    onSignOut,
    navigation,
}: AppSettingsProps) {
    const { colors, isDark, toggleTheme } = useTheme();

    /* ── helpers ─────────────────────────────────────────────────── */

    const SectionTitle = ({ label }: { label: string }) => (
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{label}</Text>
    );

    const Card = ({ children }: { children: React.ReactNode }) => (
        <BlurView intensity={20} tint={isDark ? 'light' : 'dark'} style={styles.menuCard}>
            {children}
        </BlurView>
    );

    const Row = ({
        icon,
        label,
        onPress,
        right,
        danger,
        noBorder,
    }: {
        icon: string;
        label: string;
        onPress?: () => void;
        right?: React.ReactNode;
        danger?: boolean;
        noBorder?: boolean;
    }) => (
        <TouchableOpacity
            style={[styles.menuItem, noBorder && { borderBottomWidth: 0 }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={[
                styles.menuIconContainer,
                danger && { backgroundColor: 'rgba(255, 59, 48, 0.1)' }
            ]}>
                <MaterialCommunityIcons
                    name={icon as any}
                    size={22}
                    color={danger ? colors.accentError : colors.textPrimary}
                />
            </View>
            <Text style={[
                styles.menuItemText,
                { color: danger ? colors.accentError : colors.textPrimary }
            ]}>
                {label}
            </Text>
            {right ?? (onPress
                ? <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                : null
            )}
        </TouchableOpacity>
    );

    const Toggle = ({ value }: { value: boolean }) => (
        <View style={[
            styles.toggleTrack,
            { backgroundColor: value ? colors.primaryStart : '#ddd', alignItems: value ? 'flex-end' : 'flex-start' }
        ]}>
            <View style={styles.toggleThumb} />
        </View>
    );

    /* ── render ───────────────────────────────────────────────────── */

    return (
        <View>
            {/* 1 — Appearance */}
            <SectionTitle label="Appearance" />
            <Card>
                <Row
                    icon={isDark ? 'weather-night' : 'white-balance-sunny'}
                    label={isDark ? 'Dark Mode' : 'Light Mode'}
                    onPress={toggleTheme}
                    right={<Toggle value={isDark} />}
                    noBorder
                />
            </Card>

            {/* 2 — Preferences */}
            <SectionTitle label="Preferences" />
            <Card>
                <Row
                    icon="bell"
                    label="Notifications"
                    onPress={() => onToggleNotification(!notificationsEnabled)}
                    right={<Toggle value={notificationsEnabled} />}
                    noBorder
                />
            </Card>

            {/* 3 — Community */}
            <SectionTitle label="Community" />
            <Card>
                <Row icon="share-variant-outline" label="Refer a Friend" onPress={onShareApp} />
                <Row
                    icon="star-outline"
                    label="Rate Our App"
                    onPress={() => Linking.openURL(
                        Platform.OS === 'android'
                            ? 'https://play.google.com/store/apps/details?id=com.maheshchalla.fizi'
                            : 'https://apps.apple.com/app/idYOUR_APP_ID'
                    )}
                    noBorder
                />
            </Card>

            {/* 4 — Support & Legal */}
            <SectionTitle label="Support & Legal" />
            <Card>
                <Row icon="frequently-asked-questions" label="FAQ" onPress={() => navigation.navigate('FAQ')} />
                <Row
                    icon="shield-account-outline"
                    label="Privacy Policy"
                    onPress={() => Linking.openURL('https://github.com/fizifitnessgenie/Legal/blob/main/Privacy-Policy.md')}
                />
                <Row
                    icon="file-document-outline"
                    label="Terms of Service"
                    onPress={() => Linking.openURL('https://github.com/fizifitnessgenie/Legal/blob/main/Terms-of-Service.md')}
                />
                <Row icon="information-outline" label="About Us" onPress={() => navigation.navigate('AboutUs')} />
                <Row icon="camera-outline" label="Camera & Data Usage" onPress={() => navigation.navigate('DataUsage')} />
                <Row
                    icon="email-outline"
                    label="Contact Support"
                    onPress={() => Linking.openURL('mailto:fizi.fitnessgenie@gmail.com')}
                    noBorder
                />
            </Card>

            {/* 5 — Account */}
            <SectionTitle label="Account" />
            <Card>
                <Row icon="lock-reset" label="Change Password" onPress={onChangePassword} />
                <Row icon="logout" label="Sign Out" onPress={onSignOut} />
                <Row
                    icon="delete-outline"
                    label="Delete Account"
                    danger
                    onPress={() => Linking.openURL(
                        'mailto:fizi.fitnessgenie@gmail.com?subject=Delete Account Request&body=Please delete my account data associated with this email.'
                    )}
                    noBorder
                />
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    menuCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuItemText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    toggleTrack: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
        elevation: 2,
    },
});

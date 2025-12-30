import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAppSelector } from '../hooks/reduxHooks';
import { Colors, Gradients, Spacing, Shadows, Layout } from '../theme/Theme';

interface ProfileScreenProps {
    navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
    const { user } = useAppSelector((state) => state.auth);

    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert("Error", "Cannot open this link: " + url);
        }
    };

    return (
        <LinearGradient
            colors={Gradients.background}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile & Settings</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* User Info Card */}
                <BlurView intensity={20} tint="dark" style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{user?.displayName?.[0] || 'U'}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
                </BlurView>

                {/* Legal Section */}
                <Text style={styles.sectionTitle}>Legal</Text>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => openLink('https://github.com/MaheshChalla2701/FIZI/blob/main/PRIVACY_POLICY.md')}
                >
                    <BlurView intensity={10} tint="dark" style={styles.menuItemBlur}>
                        <MaterialCommunityIcons name="shield-lock-outline" size={24} color={Colors.accentCyan} />
                        <Text style={styles.menuItemText}>Privacy Policy</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textSecondary} />
                    </BlurView>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => openLink('https://github.com/MaheshChalla2701/FIZI/blob/main/TERMS_OF_SERVICE.md')}
                >
                    <BlurView intensity={10} tint="dark" style={styles.menuItemBlur}>
                        <MaterialCommunityIcons name="file-document-outline" size={24} color={Colors.accentCyan} />
                        <Text style={styles.menuItemText}>Terms of Service</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textSecondary} />
                    </BlurView>
                </TouchableOpacity>

                {/* App Info */}
                <View style={styles.footer}>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>

            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.m,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: Colors.glassSurface,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    userCard: {
        alignItems: 'center',
        padding: Spacing.xl,
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.accentCyan,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
        ...Shadows.glow,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.backgroundDark,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginLeft: Spacing.s,
        marginBottom: Spacing.s,
        textTransform: 'uppercase',
    },
    menuItem: {
        marginBottom: Spacing.m,
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
    },
    menuItemBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: Colors.textPrimary,
        marginLeft: Spacing.m,
    },
    footer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    versionText: {
        color: Colors.textTertiary,
        fontSize: 12,
    },
});

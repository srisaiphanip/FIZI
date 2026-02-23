/**
 * ProfileCard
 *
 * Displays the user's avatar photo/emoji, name, title, level badge,
 * and streak pill. Extracted from AvatarScreen.tsx.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, Layout } from '../../theme/Theme';

interface ProfileCardProps {
    user: any;
    avatarLevelName: string;
    avatarLevel: number;
    avatarCurrentStreak: number;
    authLoading: boolean;
    isPremium: boolean;
    onPickImage: () => void;
}

export default function ProfileCard({
    user,
    avatarLevelName,
    avatarLevel,
    avatarCurrentStreak,
    authLoading,
    isPremium,
    onPickImage,
}: ProfileCardProps) {
    const { colors, gradients, isDark } = useTheme();

    return (
        <BlurView intensity={25} tint={isDark ? 'light' : 'dark'} style={styles.avatarCard}>
            <LinearGradient
                colors={isDark
                    ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']
                    : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.avatarContent}>
                {/* Avatar with ring */}
                <TouchableOpacity style={styles.avatarContainer} onPress={onPickImage} activeOpacity={0.8}>
                    <LinearGradient
                        colors={isPremium ? ['#FFD700', '#FFA500'] : [colors.accentCyan, colors.primaryStart]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatarRing}
                    >
                        {isPremium && (
                            <View style={styles.crownBadge}>
                                <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
                            </View>
                        )}
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                        ) : (
                            <View style={[styles.avatarImage, styles.defaultAvatarContainer]}>
                                <MaterialCommunityIcons name="account" size={48} color="#FFF" />
                            </View>
                        )}
                        {authLoading && (
                            <View style={styles.uploadingOverlay}>
                                <ActivityIndicator color="#FFF" size="small" />
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Name + badges */}
                <View style={styles.userInfoSection}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                            {user?.displayName || 'Champion'}
                        </Text>
                        {isPremium && (
                            <MaterialCommunityIcons name="crown" size={20} color="#FFD700" />
                        )}
                    </View>
                    <Text style={[styles.userTitle, { color: colors.textSecondary }]}>{avatarLevelName}</Text>

                    <View style={styles.statsRow}>
                        <LinearGradient
                            colors={[colors.accentCyan + '30', colors.accentCyan + '10']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.badge, { borderColor: colors.accentCyan + '50', borderWidth: 1 }]}
                        >
                            <Text style={[styles.badgeText, { color: colors.accentCyan }]}>LEVEL {avatarLevel}</Text>
                        </LinearGradient>

                        <LinearGradient
                            colors={['rgba(255,120,100,0.2)', 'rgba(255,120,100,0.05)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.badge, styles.streakBadge]}
                        >
                            <Text style={styles.streakEmoji}>🔥</Text>
                            <Text style={styles.streakText}>{avatarCurrentStreak}</Text>
                        </LinearGradient>
                    </View>
                </View>
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
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
        padding: 3,
    },
    crownBadge: {
        position: 'absolute',
        top: -12,
        zIndex: 10,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 34,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.4)',
    },
    defaultAvatarContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 34,
    },
    userInfoSection: {
        flex: 1,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    userName: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
        flexShrink: 1,
    },
    userTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,120,100,0.4)',
        gap: 6,
    },
    streakEmoji: {
        fontSize: 12,
    },
    streakText: {
        color: '#FF7864',
        fontSize: 13,
        fontWeight: '800',
    },
});

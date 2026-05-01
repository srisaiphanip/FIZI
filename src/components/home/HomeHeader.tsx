import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Spacing, Layout, ThemeColorsType, ThemeShadowsType } from '../../theme/Theme';
import { useTheme } from '../../hooks/useTheme';

const NEON_GREEN = '#C4FF1A';

interface HomeHeaderProps {
    user: any;
    onAvatarPress: () => void;
}

const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const HomeHeader: React.FC<HomeHeaderProps> = ({ user, onAvatarPress }) => {
    const { colors, shadows } = useTheme();
    const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
    const initials = getInitials(user?.displayName);

    return (
        <View style={styles.header}>
            <View style={{ flex: 1, marginRight: Spacing.m }}>
                <Text style={styles.greeting}>Welcome back</Text>
                <Text style={styles.title} numberOfLines={1}>
                    {user?.displayName || 'Champion'} <Text style={styles.wave}>👋</Text>
                </Text>
            </View>
            <TouchableOpacity
                style={styles.avatarCircle}
                onPress={onAvatarPress}
                activeOpacity={0.8}
            >
                {user?.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                ) : (
                    <Text style={styles.avatarText}>{initials}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (colors: ThemeColorsType, shadows: ThemeShadowsType) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    greeting: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
        marginBottom: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: -0.3,
    },
    wave: {
        fontSize: 24,
    },
    avatarCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: NEON_GREEN + '26',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: NEON_GREEN + '66',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 52,
        height: 52,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '800',
        color: NEON_GREEN,
        letterSpacing: 0.5,
    },
});

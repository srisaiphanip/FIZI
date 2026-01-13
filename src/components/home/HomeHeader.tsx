import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, Shadows, Layout } from '../../theme/Theme';

interface HomeHeaderProps {
    user: any;
    onAvatarPress: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ user, onAvatarPress }) => {
    return (
        <View style={styles.header}>
            <View style={{ flex: 1, marginRight: Spacing.m }}>
                <Text style={styles.greeting}>Hello,</Text>
                <Text style={styles.title} numberOfLines={2}>{user?.displayName || 'Champion'}! 👋</Text>
            </View>
            <TouchableOpacity style={styles.avatarCircle} onPress={onAvatarPress}>
                {user?.photoURL ? (
                    <Image
                        source={{ uri: user.photoURL }}
                        style={{ width: 56, height: 56, borderRadius: 28 }}
                    />
                ) : (
                    <Text style={styles.avatarText}>{user?.displayName?.[0] || 'U'}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    greeting: {
        fontSize: 16,
        color: Colors.accentCyan,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: Layout.borderRadius.round,
        backgroundColor: Colors.glassSurface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.accentCyan,
        ...Shadows.glow,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
});

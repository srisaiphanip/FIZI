/**
 * TeamSection
 *
 * Renders a "TEAM" card inside AvatarScreen.
 * Users can view their friends and add new ones by searching via email.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Image,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { friendService, FriendProfile } from '../../services/FriendService';
import { useToast } from '../../context/ToastContext';
import { Spacing, Layout } from '../../theme/Theme';

interface TeamSectionProps {
    userId?: string;
}

export default function TeamSection({ userId }: TeamSectionProps) {
    const { colors, isDark, gradients } = useTheme();
    const { showToast } = useToast();

    const [friends, setFriends] = useState<FriendProfile[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(false);

    // Add Friend modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searching, setSearching] = useState(false);
    const [foundUser, setFoundUser] = useState<FriendProfile | null>(null);
    const [searchError, setSearchError] = useState('');
    const [adding, setAdding] = useState(false);

    // Friend profile view state
    const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);

    const loadFriends = useCallback(async () => {
        if (!userId) return;
        setLoadingFriends(true);
        const list = await friendService.getFriends(userId);
        setFriends(list);
        setLoadingFriends(false);
    }, [userId]);

    useEffect(() => {
        loadFriends();
    }, [loadFriends]);

    const handleSearch = async () => {
        if (!searchEmail.trim()) {
            setSearchError('Please enter an email address.');
            return;
        }
        setSearching(true);
        setFoundUser(null);
        setSearchError('');

        const result = await friendService.searchUserByEmail(searchEmail.trim());

        if (!result) {
            setSearchError('No FIZI account found with that email.');
        } else if (result.uid === userId) {
            setSearchError("That's your own account!");
        } else if (friends.some((f) => f.uid === result.uid)) {
            setSearchError('This person is already in your team.');
        } else {
            setFoundUser(result);
        }
        setSearching(false);
    };

    const handleAddFriend = async () => {
        if (!userId || !foundUser) return;
        setAdding(true);
        try {
            await friendService.addFriend(userId, foundUser);
            showToast(`${foundUser.displayName} added to your team! 🎉`, 'success');
            await loadFriends();
            closeModal();
        } catch {
            showToast('Failed to add friend. Please try again.', 'error');
        }
        setAdding(false);
    };

    const handleRemoveFriend = async (friend: FriendProfile) => {
        if (!userId) return;
        try {
            await friendService.removeFriend(userId, friend.uid);
            showToast(`${friend.displayName} removed from your team.`, 'info');
            setFriends((prev) => prev.filter((f) => f.uid !== friend.uid));
            setSelectedFriend(null);
        } catch {
            showToast('Failed to remove friend.', 'error');
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setSearchEmail('');
        setFoundUser(null);
        setSearchError('');
        setSearching(false);
    };

    const styles = createStyles(colors, isDark);

    return (
        <View style={styles.wrapper}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>TEAM</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[colors.primaryStart, colors.primaryEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.addButtonGradient}
                    >
                        <MaterialCommunityIcons name="account-plus-outline" size={16} color="#fff" />
                        <Text style={styles.addButtonText}>+ Add Friend</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Friends Card */}
            <BlurView
                intensity={15}
                tint={isDark ? 'light' : 'dark'}
                style={styles.card}
            >
                {loadingFriends ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="small" color={colors.primaryStart} />
                    </View>
                ) : friends.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="account-group-outline"
                            size={40}
                            color={colors.textTertiary}
                        />
                        <Text style={styles.emptyTitle}>No teammates yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Add friends to see their progress and stay motivated together!
                        </Text>
                    </View>
                ) : (
                    friends.map((friend, index) => (
                        <TouchableOpacity
                            key={friend.uid}
                            style={[
                                styles.friendRow,
                                index < friends.length - 1 && styles.friendRowBorder,
                            ]}
                            onPress={() => setSelectedFriend(friend)}
                            activeOpacity={0.75}
                        >
                            {friend.photoURL ? (
                                <Image source={{ uri: friend.photoURL }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <Text style={styles.avatarInitial}>
                                        {(friend.displayName || '?')[0].toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.friendInfo}>
                                <Text style={styles.friendName} numberOfLines={1}>
                                    {friend.displayName}
                                </Text>
                                <Text style={styles.friendMeta}>
                                    Lv.{friend.level ?? 1} · {friend.totalWorkouts ?? 0} workouts
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>
                    ))
                )}
            </BlurView>

            {/* ── Friend Profile Modal ──────────────────────────────────── */}
            <Modal
                visible={!!selectedFriend}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedFriend(null)}
            >
                <View style={styles.modalBackdrop}>
                    <BlurView
                        intensity={90}
                        tint={isDark ? 'dark' : 'light'}
                        style={styles.modalContainer}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Teammate Profile</Text>
                            <TouchableOpacity onPress={() => setSelectedFriend(null)} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close" size={22} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {selectedFriend && (
                            <>
                                {/* Hero */}
                                <View style={styles.profileHero}>
                                    {selectedFriend.photoURL ? (
                                        <Image
                                            source={{ uri: selectedFriend.photoURL }}
                                            style={styles.profileAvatar}
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={[colors.primaryStart + '50', colors.primaryEnd + '30']}
                                            style={styles.profileAvatar}
                                        >
                                            <Text style={styles.profileInitial}>
                                                {(selectedFriend.displayName || '?')[0].toUpperCase()}
                                            </Text>
                                        </LinearGradient>
                                    )}
                                    <Text style={styles.profileName}>{selectedFriend.displayName}</Text>
                                    <Text style={styles.profileEmail}>{selectedFriend.email}</Text>
                                </View>

                                {/* Stats */}
                                <View style={styles.statsRow}>
                                    <View style={styles.statBox}>
                                        <LinearGradient
                                            colors={[colors.primaryStart + '28', colors.primaryStart + '08']}
                                            style={styles.statBoxInner}
                                        >
                                            <MaterialCommunityIcons name="shield-star-outline" size={22} color={colors.primaryStart} />
                                            <Text style={[styles.statValue, { color: colors.primaryStart }]}>
                                                {selectedFriend.level ?? 1}
                                            </Text>
                                            <Text style={styles.statLabel}>Level</Text>
                                        </LinearGradient>
                                    </View>

                                    <View style={styles.statBox}>
                                        <LinearGradient
                                            colors={[colors.accentCyan + '28', colors.accentCyan + '08']}
                                            style={styles.statBoxInner}
                                        >
                                            <MaterialCommunityIcons name="dumbbell" size={22} color={colors.accentCyan} />
                                            <Text style={[styles.statValue, { color: colors.accentCyan }]}>
                                                {selectedFriend.totalWorkouts ?? 0}
                                            </Text>
                                            <Text style={styles.statLabel}>Workouts</Text>
                                        </LinearGradient>
                                    </View>

                                    <View style={styles.statBox}>
                                        <LinearGradient
                                            colors={[colors.accentSuccess + '28', colors.accentSuccess + '08']}
                                            style={styles.statBoxInner}
                                        >
                                            <MaterialCommunityIcons name="fire" size={22} color={colors.accentSuccess} />
                                            <Text style={[styles.statValue, { color: colors.accentSuccess }]}>
                                                FIZI
                                            </Text>
                                            <Text style={styles.statLabel}>Member</Text>
                                        </LinearGradient>
                                    </View>
                                </View>

                                {selectedFriend.addedAt && (
                                    <Text style={styles.addedOn}>
                                        Teammates since{' '}
                                        {new Date(selectedFriend.addedAt).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </Text>
                                )}

                                {/* Remove */}
                                <TouchableOpacity
                                    style={styles.removeFromTeamBtn}
                                    onPress={() => handleRemoveFriend(selectedFriend)}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons name="account-remove-outline" size={18} color={colors.accentError} />
                                    <Text style={[styles.removeFromTeamText, { color: colors.accentError }]}>
                                        Remove from Team
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </BlurView>
                </View>
            </Modal>

            {/* ── Add Friend Modal ──────────────────────────────────────── */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalBackdrop}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <BlurView
                        intensity={90}
                        tint={isDark ? 'dark' : 'light'}
                        style={styles.modalContainer}
                    >
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add a Teammate</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                <MaterialCommunityIcons
                                    name="close"
                                    size={22}
                                    color={colors.textPrimary}
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Enter your friend's FIZI account email to add them to your team.
                        </Text>

                        {/* Search Input */}
                        <View style={styles.inputRow}>
                            <MaterialCommunityIcons
                                name="email-outline"
                                size={20}
                                color={colors.textTertiary}
                                style={{ marginRight: 8 }}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="friend@email.com"
                                placeholderTextColor={colors.textTertiary}
                                value={searchEmail}
                                onChangeText={(t) => {
                                    setSearchEmail(t);
                                    setSearchError('');
                                    setFoundUser(null);
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="search"
                                onSubmitEditing={handleSearch}
                            />
                        </View>

                        {/* Search Error */}
                        {!!searchError && (
                            <View style={styles.errorBanner}>
                                <MaterialCommunityIcons
                                    name="alert-circle-outline"
                                    size={16}
                                    color={colors.accentError}
                                />
                                <Text style={[styles.errorText, { color: colors.accentError }]}>
                                    {searchError}
                                </Text>
                            </View>
                        )}

                        {/* Found User Preview */}
                        {foundUser && (
                            <View style={styles.foundUserCard}>
                                {foundUser.photoURL ? (
                                    <Image
                                        source={{ uri: foundUser.photoURL }}
                                        style={styles.foundAvatar}
                                    />
                                ) : (
                                    <View style={[styles.foundAvatar, styles.avatarPlaceholder]}>
                                        <Text style={[styles.avatarInitial, { fontSize: 20 }]}>
                                            {(foundUser.displayName || '?')[0].toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.foundUserName}>{foundUser.displayName}</Text>
                                    <Text style={styles.foundUserMeta}>
                                        {foundUser.email} · Lv.{foundUser.level ?? 1}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={22}
                                    color={colors.accentSuccess}
                                />
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View style={styles.modalActions}>
                            {!foundUser ? (
                                <TouchableOpacity
                                    style={styles.searchBtn}
                                    onPress={handleSearch}
                                    activeOpacity={0.8}
                                    disabled={searching}
                                >
                                    <LinearGradient
                                        colors={[colors.primaryStart, colors.primaryEnd]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.searchBtnGradient}
                                    >
                                        {searching ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>
                                                <MaterialCommunityIcons
                                                    name="magnify"
                                                    size={18}
                                                    color="#fff"
                                                />
                                                <Text style={styles.searchBtnText}>Search</Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.searchBtn}
                                    onPress={handleAddFriend}
                                    activeOpacity={0.8}
                                    disabled={adding}
                                >
                                    <LinearGradient
                                        colors={[colors.accentSuccess, '#2DD36F']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.searchBtnGradient}
                                    >
                                        {adding ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>
                                                <MaterialCommunityIcons
                                                    name="account-plus"
                                                    size={18}
                                                    color="#fff"
                                                />
                                                <Text style={styles.searchBtnText}>
                                                    Add to Team
                                                </Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </BlurView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const createStyles = (colors: any, isDark: boolean) =>
    StyleSheet.create({
        wrapper: {
            marginBottom: Spacing.m,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Spacing.s,
        },
        sectionTitle: {
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 0.8,
            color: colors.textTertiary,
            textTransform: 'uppercase',
        },
        addButton: {
            borderRadius: 20,
            overflow: 'hidden',
        },
        addButtonGradient: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 7,
            gap: 5,
        },
        addButtonText: {
            color: '#fff',
            fontWeight: '700',
            fontSize: 13,
        },
        card: {
            borderRadius: 16,
            overflow: 'hidden',
            minHeight: 10,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: 28,
            paddingHorizontal: 20,
            gap: 8,
        },
        emptyTitle: {
            color: colors.textSecondary,
            fontSize: 15,
            fontWeight: '600',
        },
        emptySubtitle: {
            color: colors.textTertiary,
            fontSize: 13,
            textAlign: 'center',
            lineHeight: 18,
        },
        friendRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            gap: 12,
        },
        friendRowBorder: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        },
        avatar: {
            width: 42,
            height: 42,
            borderRadius: 21,
        },
        avatarPlaceholder: {
            backgroundColor: colors.primaryStart + '30',
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarInitial: {
            color: colors.primaryStart,
            fontWeight: '800',
            fontSize: 16,
        },
        friendInfo: {
            flex: 1,
        },
        friendName: {
            color: colors.textPrimary,
            fontWeight: '600',
            fontSize: 15,
        },
        friendMeta: {
            color: colors.textTertiary,
            fontSize: 12,
            marginTop: 2,
        },
        removeButton: {
            padding: 4,
        },

        // Modal
        modalBackdrop: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContainer: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 40,
            overflow: 'hidden',
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        modalTitle: {
            color: colors.textPrimary,
            fontSize: 20,
            fontWeight: '800',
        },
        closeBtn: {
            padding: 4,
        },
        modalSubtitle: {
            color: colors.textSecondary,
            fontSize: 14,
            marginBottom: 20,
            lineHeight: 20,
        },
        inputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 4,
            marginBottom: 12,
        },
        input: {
            flex: 1,
            color: colors.textPrimary,
            fontSize: 15,
            paddingVertical: 12,
        },
        errorBanner: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginBottom: 12,
        },
        errorText: {
            fontSize: 13,
            fontWeight: '500',
        },
        foundUserCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.accentSuccess + '40',
        },
        foundAvatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
        },
        foundUserName: {
            color: colors.textPrimary,
            fontWeight: '700',
            fontSize: 15,
        },
        foundUserMeta: {
            color: colors.textTertiary,
            fontSize: 12,
            marginTop: 2,
        },
        modalActions: {
            marginTop: 4,
        },
        searchBtn: {
            borderRadius: 14,
            overflow: 'hidden',
        },
        searchBtnGradient: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 15,
            gap: 8,
        },
        searchBtnText: {
            color: '#fff',
            fontWeight: '700',
            fontSize: 16,
        },

        // ── Friend Profile Modal ─────────────────────────────────────
        profileHero: {
            alignItems: 'center',
            paddingVertical: 20,
            gap: 6,
        },
        profileAvatar: {
            width: 80,
            height: 80,
            borderRadius: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 4,
        },
        profileInitial: {
            color: '#fff',
            fontWeight: '900',
            fontSize: 32,
        },
        profileName: {
            color: colors.textPrimary,
            fontWeight: '800',
            fontSize: 22,
        },
        profileEmail: {
            color: colors.textTertiary,
            fontSize: 13,
            marginTop: 2,
        },
        statsRow: {
            flexDirection: 'row',
            gap: 10,
            marginBottom: 16,
        },
        statBox: {
            flex: 1,
            borderRadius: 14,
            overflow: 'hidden',
        },
        statBoxInner: {
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 8,
            gap: 4,
        },
        statValue: {
            fontWeight: '800',
            fontSize: 18,
        },
        statLabel: {
            color: colors.textTertiary,
            fontSize: 11,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
        },
        addedOn: {
            color: colors.textTertiary,
            fontSize: 13,
            textAlign: 'center',
            marginBottom: 20,
            fontStyle: 'italic',
        },
        removeFromTeamBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.accentError + '40',
            backgroundColor: colors.accentError + '10',
        },
        removeFromTeamText: {
            fontWeight: '700',
            fontSize: 15,
        },
    });

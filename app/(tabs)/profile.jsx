import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const mockUser = {
    name: 'John Doe',
    age: 20,
    year: 'Junior',
    branch: 'Computer Science',
    bio: 'Love coding, coffee, and cats! Looking for someone to explore the city with 🌟',
    interests: ['Programming', 'Coffee', 'Travel', 'Photography', 'Music', 'Gaming'],
    photos: [
        'https://via.placeholder.com/150x150/7B2CBF/FFFFFF?text=Photo1',
        'https://via.placeholder.com/150x150/9D4EDD/FFFFFF?text=Photo2',
        'https://via.placeholder.com/150x150/C77DFF/FFFFFF?text=Photo3',
    ],
    isVerified: true,
    college: 'Tech University',
};

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [user, setUser] = useState(mockUser);
    const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
    const [notifications, setNotifications] = useState(true);
    const [showOnline, setShowOnline] = useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => router.replace('/auth'),
                },
            ]
        );
    };

    const renderSettingItem = (icon, title, subtitle, onPress, rightComponent) => (
        <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.surface }]}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
                    {subtitle && (
                        <Text style={[styles.settingSubtitle, { color: colors.icon }]}>{subtitle}</Text>
                    )}
                </View>
            </View>
            {rightComponent || (
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
                <TouchableOpacity onPress={() => router.push('/profile-setup')}>
                    <Text style={[styles.editButton, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Card */}
            <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.profileHeader}>
                    <Image source={{ uri: user.photos[0] }} style={styles.profileImage} />
                    <View style={styles.profileInfo}>
                        <View style={styles.nameContainer}>
                            <Text style={[styles.profileName, { color: colors.text }]}>
                                {user.name}, {user.age}
                            </Text>
                            {user.isVerified && (
                                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                            )}
                        </View>
                        <Text style={[styles.profileDetails, { color: colors.icon }]}>
                            {user.year} • {user.branch}
                        </Text>
                        <Text style={[styles.profileCollege, { color: colors.icon }]}>
                            {user.college}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.profileBio, { color: colors.text }]}>{user.bio}</Text>

                <View style={styles.interests}>
                    {user.interests.map((interest, index) => (
                        <View key={index} style={[styles.interestTag, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.interestText, { color: colors.text }]}>{interest}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.photos}>
                    {user.photos.map((photo, index) => (
                        <Image key={index} source={{ uri: photo }} style={styles.photoThumbnail} />
                    ))}
                </View>
            </View>

            {/* Settings */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

                {renderSettingItem(
                    'moon',
                    'Dark Mode',
                    'Switch between light and dark theme',
                    () => setDarkMode(!darkMode),
                    <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={darkMode ? 'white' : colors.icon}
                    />
                )}

                {renderSettingItem(
                    'notifications',
                    'Push Notifications',
                    'Get notified about matches and messages',
                    () => setNotifications(!notifications),
                    <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={notifications ? 'white' : colors.icon}
                    />
                )}

                {renderSettingItem(
                    'eye',
                    'Show Online Status',
                    'Let others see when you\'re online',
                    () => setShowOnline(!showOnline),
                    <Switch
                        value={showOnline}
                        onValueChange={setShowOnline}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={showOnline ? 'white' : colors.icon}
                    />
                )}
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

                {renderSettingItem(
                    'person-circle',
                    'Edit Profile',
                    'Update your photos and information'
                )}

                {renderSettingItem(
                    'shield-checkmark',
                    'Privacy Settings',
                    'Control who can see your profile'
                )}

                {renderSettingItem(
                    'heart',
                    'Who Liked You',
                    'See who swiped right on you',
                    null,
                    <View style={[styles.premiumBadge, { backgroundColor: colors.warning }]}>
                        <Text style={styles.premiumText}>Premium</Text>
                    </View>
                )}

                {renderSettingItem(
                    'star',
                    'Boost Profile',
                    'Get more visibility for 30 minutes',
                    null,
                    <View style={[styles.premiumBadge, { backgroundColor: colors.warning }]}>
                        <Text style={styles.premiumText}>Premium</Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>

                {renderSettingItem(
                    'help-circle',
                    'Help & Support',
                    'Get help with your account'
                )}

                {renderSettingItem(
                    'document-text',
                    'Terms & Privacy',
                    'Read our terms and privacy policy'
                )}

                {renderSettingItem(
                    'flag',
                    'Report a Problem',
                    'Let us know about any issues'
                )}
            </View>

            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: colors.error }]}
                onPress={handleLogout}
            >
                <Ionicons name="log-out" size={20} color="white" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.icon }]}>
                    Campus Crush v1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    editButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    profileCard: {
        margin: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    profileHeader: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileDetails: {
        fontSize: 14,
        marginBottom: 2,
    },
    profileCollege: {
        fontSize: 14,
    },
    profileBio: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 15,
    },
    interests: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
    },
    interestTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    interestText: {
        fontSize: 12,
        fontWeight: '500',
    },
    photos: {
        flexDirection: 'row',
        gap: 10,
    },
    photoThumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 12,
        lineHeight: 16,
    },
    premiumBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    premiumText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        gap: 10,
        marginBottom: 30,
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    footerText: {
        fontSize: 12,
    },
});
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { logout } = useAuth();

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
                    onPress: async () => {
                        await logout();
                        router.replace('/auth');
                    },
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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Preferences Section */}
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

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>

                    {renderSettingItem(
                        'person-circle',
                        'Edit Profile',
                        'Update your photos and information',
                        () => router.push('/profile-setup')
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

                {/* Support Section */}
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

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.error }]}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out" size={20} color="white" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.icon }]}>
                        Campus Crush v1.0.0
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
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
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../services/api';



const tabs = ['All', 'Matches', 'Messages', 'Likes'];

export default function NotificationsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [notifications, setNotifications] = useState([]);
    const [selectedTab, setSelectedTab] = useState('All');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    // Only refresh notifications when tab is focused if there are no notifications
    useFocusEffect(
        React.useCallback(() => {
            if (notifications.length === 0) {
                loadNotifications();
            }
        }, [notifications.length])
    );

    const loadNotifications = async () => {
        try {
            console.log('📬 Loading notifications...');
            const response = await ApiService.getNotifications();
            console.log('📬 API Response:', response);
            if (response.success && response.data) {
                console.log('📬 Notifications received:', response.data.notifications?.length || 0);
                setNotifications(response.data.notifications || []);
            } else {
                console.log('⚠️ No notifications found');
                setNotifications([]);
            }
        } catch (error) {
            console.error('❌ Error loading notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await ApiService.markNotificationAsRead(notificationId);
            setNotifications(prev => prev.map(notif =>
                notif.id === notificationId ? { ...notif, isRead: true } : notif
            ));
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await ApiService.markAllNotificationsAsRead();
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        } catch (error) {
            console.error('❌ Error marking all notifications as read:', error);
        }
    };

    const clearAllNotifications = () => {
        console.log('🧹 Clearing all notifications from state');
        setNotifications([]);
    };

    const onRefresh = () => {
        setRefreshing(true);
        // Clear current notifications to force fresh load
        setNotifications([]);
        loadNotifications();
    };

    const filteredNotifications = selectedTab === 'All'
        ? notifications
        : notifications.filter(notif => {
            switch (selectedTab) {
                case 'Matches':
                    return notif.type === 'match';
                case 'Messages':
                    return notif.type === 'message';
                case 'Likes':
                    return notif.type === 'like';
                default:
                    return true;
            }
        });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                {
                    backgroundColor: item.isRead ? colors.background : colors.surface,
                    borderColor: colors.border,
                },
            ]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={styles.notificationContent}>
                <View style={styles.iconContainer}>
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.iconBackground, { backgroundColor: item.iconColor + '20' }]}>
                            <Ionicons name={item.icon} size={20} color={item.iconColor} />
                        </View>
                    )}
                    {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                </View>

                <View style={styles.textContent}>
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>
                        {item.title}
                    </Text>
                    <Text style={[styles.notificationMessage, { color: colors.icon }]} numberOfLines={2}>
                        {item.message}
                    </Text>
                    <Text style={[styles.timestamp, { color: colors.icon }]}>
                        {item.timestamp}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                You're all caught up! New notifications will appear here.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Activity</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {/* Debug button - remove after testing */}
                    <TouchableOpacity onPress={clearAllNotifications}>
                        <Text style={[styles.markAllRead, { color: colors.error }]}>
                            Clear
                        </Text>
                    </TouchableOpacity>
                    {unreadCount > 0 && (
                        <TouchableOpacity onPress={markAllAsRead}>
                            <Text style={[styles.markAllRead, { color: colors.primary }]}>
                                Mark all read
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.tabs}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={tabs}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                {
                                    backgroundColor: selectedTab === item ? colors.primary : colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                            onPress={() => setSelectedTab(item)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color: selectedTab === item ? 'white' : colors.text,
                                    },
                                ]}
                            >
                                {item}
                            </Text>
                            {item === 'All' && unreadCount > 0 && (
                                <View style={[styles.tabBadge, { backgroundColor: 'white' }]}>
                                    <Text style={[styles.tabBadgeText, { color: colors.primary }]}>
                                        {unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                />
            </View>

            {filteredNotifications.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={filteredNotifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderNotification}
                    contentContainerStyle={styles.notificationsList}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    markAllRead: {
        fontSize: 14,
        fontWeight: '600',
    },
    tabs: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    tabBadge: {
        marginLeft: 6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    notificationsList: {
        paddingHorizontal: 20,
    },
    notificationItem: {
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    notificationContent: {
        flexDirection: 'row',
        padding: 15,
    },
    iconContainer: {
        position: 'relative',
        marginRight: 15,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    iconBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'white',
    },
    textContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 6,
    },
    timestamp: {
        fontSize: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});
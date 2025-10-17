import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const mockNotifications = [
    {
        id: '1',
        type: 'match',
        title: 'New Match!',
        message: 'You and Sarah liked each other',
        avatar: 'https://via.placeholder.com/40x40/7B2CBF/FFFFFF?text=S',
        timestamp: '5m ago',
        isRead: false,
        icon: 'heart',
        iconColor: '#FF6B6B',
    },
    {
        id: '2',
        type: 'message',
        title: 'New Message',
        message: 'Emma sent you a message',
        avatar: 'https://via.placeholder.com/40x40/9D4EDD/FFFFFF?text=E',
        timestamp: '1h ago',
        isRead: false,
        icon: 'chatbubble',
        iconColor: '#4ECDC4',
    },
    {
        id: '3',
        type: 'like',
        title: 'Someone likes you!',
        message: 'You have a new admirer',
        avatar: null,
        timestamp: '2h ago',
        isRead: true,
        icon: 'heart-outline',
        iconColor: '#FF6B6B',
    },
    {
        id: '4',
        type: 'confession',
        title: 'Confession Update',
        message: 'Your confession got 50 upvotes!',
        avatar: null,
        timestamp: '4h ago',
        isRead: true,
        icon: 'trending-up',
        iconColor: '#45B7D1',
    },
    {
        id: '5',
        type: 'comment',
        title: 'New Comment',
        message: 'Someone commented on your confession',
        avatar: null,
        timestamp: '6h ago',
        isRead: true,
        icon: 'chatbubble-outline',
        iconColor: '#96CEB4',
    },
    {
        id: '6',
        type: 'match',
        title: 'New Match!',
        message: 'You and Alex liked each other',
        avatar: 'https://via.placeholder.com/40x40/C77DFF/FFFFFF?text=A',
        timestamp: '1d ago',
        isRead: true,
        icon: 'heart',
        iconColor: '#FF6B6B',
    },
];

const tabs = ['All', 'Matches', 'Messages', 'Likes'];

export default function NotificationsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [notifications, setNotifications] = useState(mockNotifications);
    const [selectedTab, setSelectedTab] = useState('All');

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

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(notif =>
            notif.id === id ? { ...notif, isRead: true } : notif
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    };

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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Activity</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text style={[styles.markAllRead, { color: colors.primary }]}>
                            Mark all read
                        </Text>
                    </TouchableOpacity>
                )}
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
        </View>
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
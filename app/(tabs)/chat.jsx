import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../services/api';



export default function ChatScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [chats, setChats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadMatches();
    }, []);

    // Refresh matches when tab is focused
    useFocusEffect(
        React.useCallback(() => {
            loadMatches();
        }, [])
    );

    const loadMatches = async () => {
        try {
            console.log('💬 Loading matches/chats...');
            const response = await ApiService.getMatches();
            if (response.success && response.data) {
                console.log('✅ Found matches:', response.data.matches?.length || 0);
                setChats(response.data.matches || []);
            } else {
                console.log('⚠️ No matches found');
                setChats([]);
            }
        } catch (error) {
            console.error('❌ Error loading matches:', error);
            setChats([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadMatches();
    };

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderChatItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.chatItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/chat/${item.id}`)}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {item.isOnline && <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />}
            </View>

            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={[styles.chatName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.timestamp, { color: colors.icon }]}>{item.timestamp}</Text>
                </View>

                <View style={styles.messageRow}>
                    <Text
                        style={[
                            styles.lastMessage,
                            { color: item.unreadCount > 0 ? colors.text : colors.icon },
                            item.unreadCount > 0 && styles.unreadMessage,
                        ]}
                        numberOfLines={1}
                    >
                        {item.isTyping ? 'typing...' : item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Matches Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                Start swiping to find your perfect match and begin chatting!
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="search" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.icon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search messages..."
                        placeholderTextColor={colors.icon}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {filteredChats.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item.id}
                    renderItem={renderChatItem}
                    contentContainerStyle={styles.chatsList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}

            <View style={styles.bottomTabs}>
                <TouchableOpacity style={styles.tabButton}>
                    <Text style={[styles.tabText, { color: colors.primary }]}>All</Text>
                    <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton}>
                    <Text style={[styles.tabText, { color: colors.icon }]}>Unread</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton}>
                    <Text style={[styles.tabText, { color: colors.icon }]}>Online</Text>
                </TouchableOpacity>
            </View>
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
    headerButton: {
        padding: 5,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    chatsList: {
        paddingHorizontal: 20,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 15,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: 'white',
    },
    chatContent: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 12,
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
    },
    unreadMessage: {
        fontWeight: '600',
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    unreadCount: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    bottomTabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        position: 'relative',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 30,
        height: 2,
        borderRadius: 1,
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
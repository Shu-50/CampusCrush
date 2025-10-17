import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

export default function ChatDetailScreen() {
    const { matchId } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [match, setMatch] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const flatListRef = useRef(null);

    useEffect(() => {
        loadMatch();
        loadMessages();
    }, [matchId]);

    const loadMatch = async () => {
        try {
            const response = await ApiService.getMatch(matchId);
            if (response.success) {
                setMatch(response.data.match);
            }
        } catch (error) {
            console.error('Error loading match:', error);
            Alert.alert('Error', 'Failed to load chat details');
        }
    };

    const loadMessages = async (pageNum = 1, append = false) => {
        try {
            const response = await ApiService.getChatMessages(matchId, pageNum);
            if (response.success) {
                const newMessages = response.data.messages;

                if (append) {
                    setMessages(prev => [...prev, ...newMessages]);
                } else {
                    setMessages(newMessages);
                }

                setHasMore(response.data.pagination.hasMore);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageText = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            const response = await ApiService.sendMessage(matchId, messageText);
            if (response.success) {
                setMessages(prev => [response.data.message, ...prev]);
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
            setNewMessage(messageText); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to send images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setSending(true);
            try {
                const response = await ApiService.sendMediaMessage(matchId, result.assets[0].uri, 'image');
                if (response.success) {
                    setMessages(prev => [response.data.message, ...prev]);
                    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                }
            } catch (error) {
                console.error('Error sending image:', error);
                Alert.alert('Error', 'Failed to send image');
            } finally {
                setSending(false);
            }
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.senderId._id === match?.otherUser?.id; // This needs to be fixed with proper user ID

        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessage : styles.otherMessage
            ]}>
                {!isMyMessage && (
                    <Image
                        source={{ uri: match?.otherUser?.photos?.[0]?.url || 'https://via.placeholder.com/40' }}
                        style={styles.avatar}
                    />
                )}

                <View style={[
                    styles.messageBubble,
                    {
                        backgroundColor: isMyMessage ? colors.primary : colors.surface,
                        borderColor: colors.border,
                    }
                ]}>
                    {item.type === 'image' && (
                        <Image
                            source={{ uri: item.media?.url }}
                            style={styles.messageImage}
                            resizeMode="cover"
                        />
                    )}

                    {item.type === 'text' && (
                        <Text style={[
                            styles.messageText,
                            { color: isMyMessage ? 'white' : colors.text }
                        ]}>
                            {item.content}
                        </Text>
                    )}

                    <View style={styles.messageFooter}>
                        <Text style={[
                            styles.messageTime,
                            { color: isMyMessage ? 'rgba(255,255,255,0.7)' : colors.icon }
                        ]}>
                            {formatTime(item.createdAt)}
                        </Text>

                        {isMyMessage && (
                            <Ionicons
                                name={item.isRead ? "checkmark-done" : "checkmark"}
                                size={14}
                                color={item.isRead ? colors.success : 'rgba(255,255,255,0.7)'}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const loadMoreMessages = () => {
        if (hasMore && !loading) {
            loadMessages(page + 1, true);
        }
    };

    if (loading && messages.length === 0) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <Text style={[styles.loadingText, { color: colors.text }]}>Loading chat...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Chat Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <Image
                    source={{ uri: match?.otherUser?.photos?.[0]?.url || 'https://via.placeholder.com/40' }}
                    style={styles.headerAvatar}
                />

                <View style={styles.headerInfo}>
                    <Text style={[styles.headerName, { color: colors.text }]}>
                        {match?.otherUser?.name || 'Loading...'}
                    </Text>
                    <Text style={[styles.headerStatus, { color: colors.icon }]}>
                        {match?.otherUser?.isOnline ? 'Online' : 'Last seen recently'}
                    </Text>
                </View>

                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="videocam" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={renderMessage}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                inverted
                onEndReached={loadMoreMessages}
                onEndReachedThreshold={0.1}
                showsVerticalScrollIndicator={false}
            />

            {/* Message Input */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.attachButton, { backgroundColor: colors.background }]}
                    onPress={pickImage}
                >
                    <Ionicons name="camera" size={24} color={colors.primary} />
                </TouchableOpacity>

                <TextInput
                    style={[
                        styles.messageInput,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            color: colors.text,
                        },
                    ]}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.icon}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    maxLength={1000}
                />

                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        {
                            backgroundColor: newMessage.trim() || sending ? colors.primary : colors.border,
                        },
                    ]}
                    onPress={sendMessage}
                    disabled={!newMessage.trim() || sending}
                >
                    <Ionicons
                        name={sending ? "hourglass" : "send"}
                        size={20}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 10,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    headerStatus: {
        fontSize: 12,
        marginTop: 2,
    },
    headerButton: {
        padding: 8,
    },
    messagesList: {
        flex: 1,
    },
    messagesContent: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 4,
        alignItems: 'flex-end',
    },
    myMessage: {
        justifyContent: 'flex-end',
    },
    otherMessage: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        borderWidth: 1,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 12,
        marginBottom: 4,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
        gap: 4,
    },
    messageTime: {
        fontSize: 11,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        gap: 10,
    },
    attachButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
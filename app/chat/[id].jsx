import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../../services/api';

const { width } = Dimensions.get('window');

export default function ChatDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const flatListRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [match, setMatch] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [refreshing, setRefreshing] = useState(false);



    useEffect(() => {
        loadChatData();
        loadMessages();

        // Set up auto-refresh for messages every 3 seconds
        const messageInterval = setInterval(() => {
            if (!sending) {
                loadMessages(true); // Silent refresh
            }
        }, 3000);

        return () => clearInterval(messageInterval);
    }, [id]);

    const loadChatData = async () => {
        try {
            console.log('💬 Loading chat data for match:', id);
            const response = await ApiService.getMatch(id);
            if (response.success && response.data) {
                setMatch(response.data.match);
            } else {
                console.log('No match data found');
            }
        } catch (error) {
            console.error('❌ Error loading chat data:', error);
        }
    };

    const loadMessages = async (silent = false) => {
        try {
            if (!silent) {
                console.log('📨 Loading messages for match:', id);
            }
            const response = await ApiService.getChatMessages(id);
            if (response.success && response.data) {
                const newMessages = response.data.messages || [];
                setMessages(newMessages);

                // Update match info if available
                if (response.data.match) {
                    setMatch(response.data.match);
                }
            } else {
                if (!silent) {
                    setMessages([]);
                }
            }
        } catch (error) {
            if (!silent) {
                console.error('❌ Error loading messages:', error);
                setMessages([]);
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
            setRefreshing(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistically add message to UI
        const tempMessage = {
            id: Date.now().toString(),
            content: messageContent,
            senderId: 'me',
            senderName: 'You',
            timestamp: new Date(),
            type: 'text',
            isRead: false,
            sending: true,
        };

        setMessages(prev => [...prev, tempMessage]);

        try {
            const response = await ApiService.sendMessage(id, messageContent);
            if (response.success) {
                // Replace temp message with real message
                setMessages(prev => prev.map(msg =>
                    msg.id === tempMessage.id
                        ? { ...response.data.message, sending: false }
                        : msg
                ));
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
            // Remove temp message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            Alert.alert('Error', 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString();
    };

    const renderMessage = ({ item, index }) => {
        const isMe = item.senderId === 'me';
        const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId !== item.senderId);
        const showTimestamp = index === messages.length - 1 ||
            new Date(messages[index + 1]?.timestamp) - new Date(item.timestamp) > 300000; // 5 minutes

        return (
            <View style={[
                styles.messageContainer,
                isMe ? styles.myMessageContainer : styles.theirMessageContainer
            ]}>
                {!isMe && showAvatar && (
                    <Image
                        source={{ uri: match?.avatar }}
                        style={styles.messageAvatar}
                    />
                )}
                {!isMe && !showAvatar && <View style={styles.avatarSpacer} />}

                <View style={[
                    styles.messageBubble,
                    isMe ? [styles.myMessage, { backgroundColor: colors.primary }] : [styles.theirMessage, { backgroundColor: colors.surface }]
                ]}>
                    <Text style={[
                        styles.messageText,
                        { color: isMe ? 'white' : colors.text }
                    ]}>
                        {item.content}
                    </Text>

                    {/* Message status indicators */}
                    {isMe && (
                        <View style={styles.messageStatus}>
                            {item.sending ? (
                                <Text style={styles.statusText}>Sending...</Text>
                            ) : item.isRead ? (
                                <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.7)" />
                            ) : (
                                <Ionicons name="checkmark" size={14} color="rgba(255,255,255,0.7)" />
                            )}
                        </View>
                    )}
                </View>

                {showTimestamp && (
                    <Text style={[styles.messageTimestamp, { color: colors.icon }]}>
                        {formatTimestamp(item.timestamp)}
                    </Text>
                )}
            </View>
        );
    };

    const renderHeader = () => (
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.headerInfo}>
                <Image source={{ uri: match?.avatar }} style={styles.headerAvatar} />
                <View>
                    <Text style={[styles.headerName, { color: colors.text }]}>{match?.name}</Text>
                    <Text style={[styles.headerStatus, { color: colors.icon }]}>
                        {match?.isOnline ? 'Online' : 'Last seen recently'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: colors.text }]}>Loading messages...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {renderHeader()}

            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                loadMessages();
                            }}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                />

                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.textInput, { color: colors.text }]}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.icon}
                            value={newMessage}
                            onChangeText={(text) => {
                                setNewMessage(text);
                                // Show typing indicator
                                if (text.length > 0 && !isTyping) {
                                    setIsTyping(true);
                                    setTimeout(() => setIsTyping(false), 2000);
                                }
                            }}
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, { backgroundColor: colors.primary }]}
                            onPress={sendMessage}
                            disabled={!newMessage.trim() || sending}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerName: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerStatus: {
        fontSize: 14,
        marginTop: 2,
    },
    headerButton: {
        padding: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    messageContainer: {
        marginBottom: 15,
    },
    myMessageContainer: {
        alignItems: 'flex-end',
    },
    theirMessageContainer: {
        alignItems: 'flex-start',
        flexDirection: 'row',
    },
    messageAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
        alignSelf: 'flex-end',
        marginBottom: 5,
    },
    avatarSpacer: {
        width: 38,
    },
    messageBubble: {
        maxWidth: width * 0.75,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        position: 'relative',
    },
    myMessage: {
        borderBottomRightRadius: 5,
    },
    theirMessage: {
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    sendingIndicator: {
        marginTop: 5,
    },
    sendingText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'italic',
    },
    messageStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    statusText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'italic',
    },
    messageTimestamp: {
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },
    inputContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 25,
        borderWidth: 1,
        paddingHorizontal: 15,
        paddingVertical: 10,
        minHeight: 50,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 10,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
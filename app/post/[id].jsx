import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const mockPost = {
    id: '1',
    content: 'I have a huge crush on someone in my CS class but I\'m too shy to talk to them 😭 What should I do? Any advice would be appreciated!',
    category: 'crush',
    upvotes: 24,
    reactions: { heart: 15, laugh: 2, fire: 7, sad: 0 },
    timeAgo: '2h',
    isAnonymous: true,
    comments: [
        {
            id: '1',
            content: 'Just go for it! The worst they can say is no, and you\'ll never know if you don\'t try.',
            author: 'Anonymous',
            timeAgo: '1h',
            upvotes: 8,
            replies: [
                {
                    id: '1',
                    content: 'This! I was in the same situation and it worked out great!',
                    author: 'Anonymous',
                    timeAgo: '45m',
                    upvotes: 3,
                }
            ]
        },
        {
            id: '2',
            content: 'Maybe start with small talk about the class? Ask about assignments or study groups.',
            author: 'Anonymous',
            timeAgo: '1h',
            upvotes: 12,
            replies: []
        },
        {
            id: '3',
            content: 'I feel you! CS classes can be intimidating. Maybe find common interests first?',
            author: 'Anonymous',
            timeAgo: '30m',
            upvotes: 5,
            replies: []
        }
    ]
};

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [post, setPost] = useState(mockPost);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    const handleReaction = (reactionType) => {
        setPost(prev => ({
            ...prev,
            reactions: {
                ...prev.reactions,
                [reactionType]: prev.reactions[reactionType] + 1
            }
        }));
    };

    const handleUpvote = () => {
        setPost(prev => ({ ...prev, upvotes: prev.upvotes + 1 }));
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const comment = {
            id: Date.now().toString(),
            content: newComment,
            author: 'Anonymous',
            timeAgo: 'now',
            upvotes: 0,
            replies: []
        };

        if (replyingTo) {
            setPost(prev => ({
                ...prev,
                comments: prev.comments.map(c =>
                    c.id === replyingTo
                        ? { ...c, replies: [...c.replies, comment] }
                        : c
                )
            }));
            setReplyingTo(null);
        } else {
            setPost(prev => ({
                ...prev,
                comments: [...prev.comments, comment]
            }));
        }

        setNewComment('');
    };

    const renderReply = (reply) => (
        <View key={reply.id} style={[styles.replyContainer, { borderLeftColor: colors.border }]}>
            <View style={styles.commentHeader}>
                <Text style={[styles.commentAuthor, { color: colors.text }]}>{reply.author}</Text>
                <Text style={[styles.commentTime, { color: colors.icon }]}>{reply.timeAgo}</Text>
            </View>
            <Text style={[styles.commentContent, { color: colors.text }]}>{reply.content}</Text>
            <View style={styles.commentActions}>
                <TouchableOpacity style={styles.commentAction}>
                    <Ionicons name="arrow-up" size={16} color={colors.icon} />
                    <Text style={[styles.commentActionText, { color: colors.icon }]}>{reply.upvotes}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderComment = (comment) => (
        <View key={comment.id} style={[styles.commentContainer, { borderColor: colors.border }]}>
            <View style={styles.commentHeader}>
                <Text style={[styles.commentAuthor, { color: colors.text }]}>{comment.author}</Text>
                <Text style={[styles.commentTime, { color: colors.icon }]}>{comment.timeAgo}</Text>
            </View>
            <Text style={[styles.commentContent, { color: colors.text }]}>{comment.content}</Text>
            <View style={styles.commentActions}>
                <TouchableOpacity style={styles.commentAction}>
                    <Ionicons name="arrow-up" size={16} color={colors.icon} />
                    <Text style={[styles.commentActionText, { color: colors.icon }]}>{comment.upvotes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.commentAction}
                    onPress={() => setReplyingTo(comment.id)}
                >
                    <Ionicons name="chatbubble-outline" size={16} color={colors.icon} />
                    <Text style={[styles.commentActionText, { color: colors.icon }]}>Reply</Text>
                </TouchableOpacity>
            </View>
            {comment.replies.map(renderReply)}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.content}>
                {/* Post Content */}
                <View style={[styles.postContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.postHeader}>
                        <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
                            <Text style={styles.categoryText}>{post.category}</Text>
                        </View>
                        <Text style={[styles.timeAgo, { color: colors.icon }]}>{post.timeAgo}</Text>
                    </View>

                    <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>

                    <View style={styles.postStats}>
                        <Text style={[styles.statsText, { color: colors.icon }]}>
                            {post.upvotes} upvotes • {post.comments.length} comments
                        </Text>
                    </View>

                    <View style={styles.postActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleUpvote}
                        >
                            <Ionicons name="arrow-up" size={24} color={colors.primary} />
                            <Text style={[styles.actionText, { color: colors.primary }]}>{post.upvotes}</Text>
                        </TouchableOpacity>

                        <View style={styles.reactions}>
                            <TouchableOpacity onPress={() => handleReaction('heart')}>
                                <Text style={styles.reactionButton}>❤️ {post.reactions.heart}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleReaction('laugh')}>
                                <Text style={styles.reactionButton}>😂 {post.reactions.laugh}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleReaction('fire')}>
                                <Text style={styles.reactionButton}>🔥 {post.reactions.fire}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleReaction('sad')}>
                                <Text style={styles.reactionButton}>😢 {post.reactions.sad}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="share-outline" size={24} color={colors.icon} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                    <Text style={[styles.commentsTitle, { color: colors.text }]}>
                        Comments ({post.comments.length})
                    </Text>
                    {post.comments.map(renderComment)}
                </View>
            </ScrollView>

            {/* Comment Input */}
            <View style={[styles.commentInputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                {replyingTo && (
                    <View style={[styles.replyingIndicator, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.replyingText, { color: colors.text }]}>
                            Replying to comment
                        </Text>
                        <TouchableOpacity onPress={() => setReplyingTo(null)}>
                            <Ionicons name="close" size={20} color={colors.icon} />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputRow}>
                    <TextInput
                        style={[
                            styles.commentInput,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.text,
                            },
                        ]}
                        placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                        placeholderTextColor={colors.icon}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: newComment.trim() ? colors.primary : colors.border },
                        ]}
                        onPress={handleAddComment}
                        disabled={!newComment.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={newComment.trim() ? 'white' : colors.icon}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    postContainer: {
        margin: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    categoryTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    categoryText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    timeAgo: {
        fontSize: 14,
    },
    postContent: {
        fontSize: 18,
        lineHeight: 26,
        marginBottom: 20,
    },
    postStats: {
        paddingVertical: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5E5',
        marginBottom: 15,
    },
    statsText: {
        fontSize: 14,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    reactions: {
        flexDirection: 'row',
        gap: 20,
    },
    reactionButton: {
        fontSize: 16,
    },
    commentsSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    commentsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    commentContainer: {
        padding: 15,
        borderBottomWidth: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '600',
    },
    commentTime: {
        fontSize: 12,
    },
    commentContent: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 10,
    },
    commentActions: {
        flexDirection: 'row',
        gap: 20,
    },
    commentAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    commentActionText: {
        fontSize: 14,
    },
    replyContainer: {
        marginLeft: 20,
        marginTop: 10,
        paddingLeft: 15,
        borderLeftWidth: 2,
    },
    commentInputContainer: {
        borderTopWidth: 1,
        padding: 15,
    },
    replyingIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    replyingText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    commentInput: {
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
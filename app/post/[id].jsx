import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../services/api';



export default function PostDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        loadPost();
    }, [id]);

    const loadPost = async () => {
        try {
            setLoading(true);
            console.log('📖 Loading confession post:', id);
            const response = await ApiService.getConfession(id);
            if (response.success) {
                setPost(response.data.confession);
                console.log('✅ Loaded confession successfully');
            } else {
                console.log('❌ Failed to load confession:', response.message);
                setPost(null);
            }
        } catch (error) {
            console.error('❌ Error loading confession:', error);
            setPost(null);
        } finally {
            setLoading(false);
        }
    };

    const handleReaction = async (reactionType) => {
        if (!post) return;

        try {
            console.log(`💖 Reacting to confession ${post.id} with ${reactionType}`);
            const response = await ApiService.reactToConfession(post.id, reactionType);

            if (response.success) {
                // Update the local state with the new reaction counts
                setPost(prev => ({
                    ...prev,
                    reactions: response.data.reactionCounts
                }));
                console.log('✅ Reaction updated successfully');
            }
        } catch (error) {
            console.error('❌ Error reacting to confession:', error);
            Alert.alert('Error', 'Failed to react to confession. Please try again.');
        }
    };



    const handleAddComment = async () => {
        if (!newComment.trim() || !post) return;

        try {
            if (replyingTo) {
                // Add reply to comment
                console.log(`💬 Adding reply to comment ${replyingTo}`);
                const response = await ApiService.addReplyToComment(post.id, replyingTo, newComment.trim());

                if (response.success) {
                    // Update the local state with the new reply
                    setPost(prev => ({
                        ...prev,
                        comments: prev.comments.map(c =>
                            c.id === replyingTo
                                ? { ...c, replies: [...c.replies, response.data.reply] }
                                : c
                        )
                    }));
                    setReplyingTo(null);
                    setNewComment('');
                    console.log('✅ Reply added successfully');
                }
            } else {
                // Add new comment
                console.log(`💬 Adding comment to confession ${post.id}`);
                const response = await ApiService.addCommentToConfession(post.id, newComment.trim());

                if (response.success) {
                    // Update the local state with the new comment
                    setPost(prev => ({
                        ...prev,
                        comments: [...prev.comments, response.data.comment]
                    }));
                    setNewComment('');
                    console.log('✅ Comment added successfully');
                }
            }
        } catch (error) {
            console.error('❌ Error adding comment/reply:', error);
            if (error.message === 'Server error') {
                Alert.alert(
                    'Authentication Required',
                    'Please log in to add comments.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'Failed to add comment. Please try again.');
            }
        }
    };

    const renderReply = (reply) => (
        <View key={reply.id} style={[styles.replyContainer, { borderLeftColor: colors.border }]}>
            <View style={styles.commentHeader}>
                <Text style={[styles.commentAuthor, { color: colors.text }]}>{reply.author}</Text>
                <Text style={[styles.commentTime, { color: colors.icon }]}>{reply.timeAgo}</Text>
            </View>
            <Text style={[styles.commentContent, { color: colors.text }]}>{reply.content}</Text>
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
                <TouchableOpacity
                    style={styles.commentAction}
                    onPress={() => setReplyingTo(comment.id)}
                >
                    <Ionicons name="chatbubble-outline" size={16} color={colors.icon} />
                    <Text style={[styles.commentActionText, { color: colors.icon }]}>Reply</Text>
                </TouchableOpacity>
            </View>
            {comment.replies && comment.replies.map(renderReply)}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Confession</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: colors.text }]}>Loading post...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!post) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Confession</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Post Not Found</Text>
                    <Text style={[styles.emptyText, { color: colors.icon }]}>
                        This post may have been removed or doesn't exist.
                    </Text>
                    <TouchableOpacity
                        style={[styles.goBackButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.goBackButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Confession</Text>
                    <View style={styles.headerSpacer} />
                </View>

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
                                {post.comments.length} comments
                            </Text>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    headerSpacer: {
        width: 34, // Same width as back button for centering
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    goBackButton: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    goBackButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
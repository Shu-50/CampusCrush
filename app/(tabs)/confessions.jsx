import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../services/api';



const categories = ['all', 'love', 'breakup', 'secret', 'funny', 'crush'];

export default function ConfessionsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [confessions, setConfessions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newConfession, setNewConfession] = useState('');
    const [newCategory, setNewCategory] = useState('secret');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadConfessions();
    }, [selectedCategory]);

    const loadConfessions = async () => {
        try {
            console.log('📖 Loading confessions for category:', selectedCategory);
            const response = await ApiService.getConfessions(selectedCategory);

            if (response.success) {
                setConfessions(response.data.confessions);
                console.log('✅ Loaded', response.data.confessions.length, 'confessions');
            } else {
                console.error('❌ Failed to load confessions:', response.message);
                setConfessions([]);
            }
        } catch (error) {
            console.error('❌ Error loading confessions:', error);
            setConfessions([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadConfessions();
    };

    const handleReaction = async (confessionId, reactionType) => {
        try {
            const response = await ApiService.reactToConfession(confessionId, reactionType);

            if (response.success) {
                setConfessions(prev => prev.map(confession =>
                    confession.id === confessionId
                        ? {
                            ...confession,
                            reactions: {
                                ...confession.reactions,
                                [reactionType]: response.data.reactionCounts[reactionType]
                            },
                            userReactions: {
                                ...confession.userReactions,
                                [reactionType]: response.data.userReacted
                            }
                        }
                        : confession
                ));
                console.log(`${response.data.userReacted ? '➕' : '➖'} Reacted ${reactionType} to confession`);
            }
        } catch (error) {
            console.error('❌ Error reacting to confession:', error);
            Alert.alert('Error', 'Failed to react to confession');
        }
    };



    const handleCreateConfession = async () => {
        if (!newConfession.trim()) {
            Alert.alert('Error', 'Please write your confession');
            return;
        }

        if (newConfession.length > 1000) {
            Alert.alert('Error', 'Confession is too long (max 1000 characters)');
            return;
        }

        setCreating(true);

        try {
            const response = await ApiService.createConfession(newConfession.trim(), newCategory);

            if (response.success) {
                setConfessions(prev => [response.data.confession, ...prev]);
                setNewConfession('');
                setShowCreateModal(false);
                Alert.alert('Success', 'Your confession has been posted anonymously!');
                console.log('✅ Confession created successfully');
            } else {
                Alert.alert('Error', response.message || 'Failed to create confession');
            }
        } catch (error) {
            console.error('❌ Error creating confession:', error);
            Alert.alert('Error', 'Failed to create confession. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const renderConfession = ({ item }) => (
        <View style={[styles.confessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.confessionHeader}>
                <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={[styles.timeAgo, { color: colors.icon }]}>{item.timeAgo}</Text>
            </View>

            <Text style={[styles.confessionContent, { color: colors.text }]}>{item.content}</Text>

            <View style={styles.confessionFooter}>
                <View style={styles.reactions}>
                    <TouchableOpacity onPress={() => handleReaction(item.id, 'heart')}>
                        <Text style={styles.reactionButton}>❤️ {item.reactions.heart}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReaction(item.id, 'laugh')}>
                        <Text style={styles.reactionButton}>😂 {item.reactions.laugh}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReaction(item.id, 'fire')}>
                        <Text style={styles.reactionButton}>🔥 {item.reactions.fire}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReaction(item.id, 'sad')}>
                        <Text style={styles.reactionButton}>😢 {item.reactions.sad}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={20} color={colors.icon} />
                    <Text style={[styles.actionText, { color: colors.icon }]}>{item.comments}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Campus Confessions</Text>
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.categories}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryButton,
                                {
                                    backgroundColor: selectedCategory === item ? colors.primary : colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text
                                style={[
                                    styles.categoryButtonText,
                                    {
                                        color: selectedCategory === item ? 'white' : colors.text,
                                    },
                                ]}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={confessions}
                keyExtractor={(item) => item.id}
                renderItem={renderConfession}
                contentContainerStyle={styles.confessionsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.icon }]}>Loading confessions...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>💭</Text>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No confessions yet</Text>
                            <Text style={[styles.emptyText, { color: colors.icon }]}>
                                Be the first to share your thoughts anonymously!
                            </Text>
                        </View>
                    )
                }
            />

            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                            <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>New Confession</Text>
                        <TouchableOpacity
                            onPress={handleCreateConfession}
                            disabled={creating}
                        >
                            <Text style={[styles.postButton, {
                                color: creating ? colors.icon : colors.primary
                            }]}>
                                {creating ? 'Posting...' : 'Post'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={[
                            styles.confessionInput,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.text,
                            },
                        ]}
                        placeholder="Share your confession anonymously..."
                        placeholderTextColor={colors.icon}
                        value={newConfession}
                        onChangeText={setNewConfession}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />

                    <View style={styles.categorySelector}>
                        <Text style={[styles.selectorLabel, { color: colors.text }]}>Category:</Text>
                        <View style={styles.categoryOptions}>
                            {categories.slice(1).map(category => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryOption,
                                        {
                                            backgroundColor: newCategory === category ? colors.primary : colors.surface,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    onPress={() => setNewCategory(category)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryOptionText,
                                            {
                                                color: newCategory === category ? 'white' : colors.text,
                                            },
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
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
    createButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categories: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
    },
    categoryButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    confessionsList: {
        paddingHorizontal: 20,
    },
    confessionCard: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
    },
    confessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    timeAgo: {
        fontSize: 12,
    },
    confessionContent: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 15,
    },
    confessionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    reactions: {
        flexDirection: 'row',
        gap: 15,
    },
    reactionButton: {
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cancelButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    postButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    confessionInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        height: 150,
        marginBottom: 20,
    },
    categorySelector: {
        marginBottom: 20,
    },
    selectorLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    categoryOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyEmoji: {
        fontSize: 60,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
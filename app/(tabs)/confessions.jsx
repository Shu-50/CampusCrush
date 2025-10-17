import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const mockConfessions = [
    {
        id: '1',
        content: 'I have a huge crush on someone in my CS class but I\'m too shy to talk to them 😭',
        category: 'crush',
        upvotes: 24,
        reactions: { heart: 15, laugh: 2, fire: 7, sad: 0 },
        comments: 8,
        timeAgo: '2h',
        isAnonymous: true,
    },
    {
        id: '2',
        content: 'Just broke up with my boyfriend of 2 years. College relationships are hard 💔',
        category: 'breakup',
        upvotes: 45,
        reactions: { heart: 20, laugh: 0, fire: 5, sad: 20 },
        comments: 15,
        timeAgo: '4h',
        isAnonymous: true,
    },
    {
        id: '3',
        content: 'I pretended to understand calculus for the entire semester. Finals are next week 😅',
        category: 'funny',
        upvotes: 89,
        reactions: { heart: 10, laugh: 65, fire: 14, sad: 0 },
        comments: 23,
        timeAgo: '6h',
        isAnonymous: true,
    },
];

const categories = ['all', 'love', 'breakup', 'secret', 'funny', 'crush'];

export default function ConfessionsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [confessions, setConfessions] = useState(mockConfessions);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newConfession, setNewConfession] = useState('');
    const [newCategory, setNewCategory] = useState('secret');

    const filteredConfessions = selectedCategory === 'all'
        ? confessions
        : confessions.filter(c => c.category === selectedCategory);

    const handleReaction = (confessionId, reactionType) => {
        setConfessions(prev => prev.map(confession =>
            confession.id === confessionId
                ? {
                    ...confession,
                    reactions: {
                        ...confession.reactions,
                        [reactionType]: confession.reactions[reactionType] + 1
                    }
                }
                : confession
        ));
    };

    const handleUpvote = (confessionId) => {
        setConfessions(prev => prev.map(confession =>
            confession.id === confessionId
                ? { ...confession, upvotes: confession.upvotes + 1 }
                : confession
        ));
    };

    const handleCreateConfession = () => {
        if (!newConfession.trim()) {
            Alert.alert('Error', 'Please write your confession');
            return;
        }

        const confession = {
            id: Date.now().toString(),
            content: newConfession,
            category: newCategory,
            upvotes: 0,
            reactions: { heart: 0, laugh: 0, fire: 0, sad: 0 },
            comments: 0,
            timeAgo: 'now',
            isAnonymous: true,
        };

        setConfessions(prev => [confession, ...prev]);
        setNewConfession('');
        setShowCreateModal(false);
        Alert.alert('Success', 'Your confession has been posted anonymously!');
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
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleUpvote(item.id)}
                >
                    <Ionicons name="arrow-up" size={20} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>{item.upvotes}</Text>
                </TouchableOpacity>

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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                data={filteredConfessions}
                keyExtractor={(item) => item.id}
                renderItem={renderConfession}
                contentContainerStyle={styles.confessionsList}
                showsVerticalScrollIndicator={false}
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
                        <TouchableOpacity onPress={handleCreateConfession}>
                            <Text style={[styles.postButton, { color: colors.primary }]}>Post</Text>
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
});
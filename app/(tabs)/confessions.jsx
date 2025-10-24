import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../services/api';



const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'crush', name: 'Crush', icon: 'heart' },
    { id: 'academic', name: 'Academic', icon: 'school' },
    { id: 'funny', name: 'Funny', icon: 'happy' },
    { id: 'support', name: 'Support', icon: 'people' },
    { id: 'general', name: 'General', icon: 'chatbubble' },
];

export default function ConfessionsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [confessions, setConfessions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const filteredConfessions = selectedCategory === 'all'
        ? confessions
        : confessions.filter(confession => confession.category === selectedCategory);

    useEffect(() => {
        loadConfessions();
    }, [selectedCategory]);

    // Refresh confessions when screen is focused (e.g., returning from create screen)
    useFocusEffect(
        React.useCallback(() => {
            loadConfessions();
        }, [selectedCategory])
    );

    const loadConfessions = async () => {
        try {
            setLoading(true);
            console.log('📖 Loading confessions from database...');
            const response = await ApiService.getConfessions(selectedCategory);
            if (response.success) {
                console.log(`✅ Loaded ${response.data.confessions.length} confessions`);
                setConfessions(response.data.confessions);
            } else {
                console.log('❌ Failed to load confessions:', response.message);
                if (response.message === 'No token provided' || response.message === 'Invalid token') {
                    Alert.alert(
                        'Authentication Required',
                        'Please log in to view confessions.',
                        [{ text: 'OK' }]
                    );
                }
                setConfessions([]);
            }
        } catch (error) {
            console.error('❌ Error loading confessions:', error);
            if (error.message === 'Server error') {
                Alert.alert(
                    'Authentication Required',
                    'Please log in to access confessions. Make sure you have completed the registration and login process.',
                    [{ text: 'OK' }]
                );
            }
            setConfessions([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadConfessions();
        setRefreshing(false);
    };



    const handleReaction = async (confessionId, reactionType) => {
        try {
            console.log(`💖 Reacting to confession ${confessionId} with ${reactionType}`);
            const response = await ApiService.reactToConfession(confessionId, reactionType);

            if (response.success) {
                // Update the local state with the new reaction counts
                setConfessions(prev => prev.map(confession =>
                    confession.id === confessionId
                        ? {
                            ...confession,
                            reactions: response.data.reactionCounts
                        }
                        : confession
                ));
                console.log('✅ Reaction updated successfully');
            }
        } catch (error) {
            console.error('❌ Error reacting to confession:', error);
            if (error.message === 'Server error') {
                Alert.alert(
                    'Authentication Required',
                    'Please log in to react to confessions.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'Failed to react to confession. Please try again.');
            }
        }
    };

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                {
                    backgroundColor: selectedCategory === item.id ? colors.primary : colors.surface,
                    borderColor: colors.border,
                },
            ]}
            onPress={() => setSelectedCategory(item.id)}
        >
            <Ionicons
                name={item.icon}
                size={16}
                color={selectedCategory === item.id ? 'white' : colors.text}
            />
            <Text
                style={[
                    styles.categoryText,
                    { color: selectedCategory === item.id ? 'white' : colors.text },
                ]}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderConfessionItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.confessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/post/${item.id}`)}
        >
            <View style={styles.confessionHeader}>
                <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
                    <Text style={styles.categoryTagText}>{item.category}</Text>
                </View>
                <Text style={[styles.timeAgo, { color: colors.icon }]}>{item.timeAgo}</Text>
            </View>

            <Text style={[styles.confessionContent, { color: colors.text }]} numberOfLines={3}>
                {item.content}
            </Text>

            <View style={styles.confessionStats}>
                <View style={styles.statsRow}>
                    <TouchableOpacity style={styles.statItem}>
                        <Ionicons name="chatbubble-outline" size={16} color={colors.icon} />
                        <Text style={[styles.statText, { color: colors.icon }]}>{item.commentCount}</Text>
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
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Campus Confessions</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/create-confession')}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
                style={styles.categoriesContainer}
            />

            {/* Confessions List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: colors.text }]}>Loading confessions...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredConfessions}
                    renderItem={renderConfessionItem}
                    keyExtractor={(item) => item.id}
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
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubble-outline" size={64} color={colors.icon} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Confessions</Text>
                            <Text style={[styles.emptyText, { color: colors.icon }]}>
                                {selectedCategory === 'all'
                                    ? 'No confessions have been posted yet. Be the first to share!'
                                    : `No confessions found in the ${selectedCategory} category.`
                                }
                            </Text>
                        </View>
                    }
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoriesContainer: {
        maxHeight: 50,
        marginBottom: 10,
    },
    categoriesList: {
        paddingHorizontal: 20,
        gap: 10,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    confessionsList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    confessionCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    confessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryTagText: {
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
        marginBottom: 12,
    },
    confessionStats: {
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        paddingTop: 12,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 14,
        fontWeight: '500',
    },
    reactions: {
        flexDirection: 'row',
        gap: 12,
    },
    reactionButton: {
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
    },
});
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    Animated,
    PanResponder,
    Alert,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../services/api';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.7;
const CARD_WIDTH = width * 0.9;

const mockProfiles = [
    {
        id: '1',
        name: 'Sarah',
        age: 20,
        year: 'Junior',
        branch: 'Computer Science',
        bio: 'Love coding, coffee, and cats! Looking for someone to explore the city with 🌟',
        interests: ['Programming', 'Coffee', 'Travel', 'Photography'],
        photos: ['https://via.placeholder.com/300x400/7B2CBF/FFFFFF?text=Sarah'],
        distance: '0.5 km away',
        isVerified: true,
    },
    {
        id: '2',
        name: 'Emma',
        age: 19,
        year: 'Sophomore',
        branch: 'Psychology',
        bio: 'Psychology major who loves reading and hiking. Always up for deep conversations! 📚',
        interests: ['Reading', 'Hiking', 'Music', 'Art'],
        photos: ['https://via.placeholder.com/300x400/9D4EDD/FFFFFF?text=Emma'],
        distance: '1.2 km away',
        isVerified: false,
    },
    {
        id: '3',
        name: 'Alex',
        age: 21,
        year: 'Senior',
        branch: 'Engineering',
        bio: 'Engineering student and part-time musician. Let\'s jam together! 🎸',
        interests: ['Music', 'Engineering', 'Sports', 'Gaming'],
        photos: ['https://via.placeholder.com/300x400/C77DFF/FFFFFF?text=Alex'],
        distance: '2.1 km away',
        isVerified: true,
    },
];

export default function SuggestionsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [superLikesLeft, setSuperLikesLeft] = useState(3);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            const response = await ApiService.getDiscoverUsers({ limit: 10 });
            if (response.success) {
                setProfiles(response.data.users);
            }
        } catch (error) {
            console.error('Error loading profiles:', error);
            // Fallback to mock data for development
            setProfiles(mockProfiles);
        } finally {
            setLoading(false);
        }
    };

    const position = useRef(new Animated.ValueXY()).current;
    const rotate = position.x.interpolate({
        inputRange: [-CARD_WIDTH / 2, 0, CARD_WIDTH / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp',
    });

    const likeOpacity = position.x.interpolate({
        inputRange: [10, CARD_WIDTH / 4],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const nopeOpacity = position.x.interpolate({
        inputRange: [-CARD_WIDTH / 4, -10],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
            position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
            if (gesture.dx > 120) {
                handleLike();
            } else if (gesture.dx < -120) {
                handlePass();
            } else {
                Animated.spring(position, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    const handleSwipe = async (action) => {
        if (currentIndex >= profiles.length) return;

        const currentProfile = profiles[currentIndex];

        try {
            const response = await ApiService.swipeUser(currentProfile._id || currentProfile.id, action);

            if (response.success && response.data.isMatch) {
                Alert.alert(
                    'It\'s a Match! 💕',
                    `You and ${currentProfile.name} liked each other!`,
                    [
                        { text: 'Keep Swiping', style: 'cancel' },
                        {
                            text: 'Send Message', onPress: () => {
                                // Navigate to chat
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error swiping:', error);
        }
    };

    const handleLike = () => {
        handleSwipe('like');
        Animated.timing(position, {
            toValue: { x: CARD_WIDTH + 100, y: 0 },
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            nextCard();
        });
    };

    const handlePass = () => {
        handleSwipe('pass');
        Animated.timing(position, {
            toValue: { x: -CARD_WIDTH - 100, y: 0 },
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            nextCard();
        });
    };

    const handleSuperLike = () => {
        if (superLikesLeft > 0) {
            setSuperLikesLeft(prev => prev - 1);
            handleSwipe('superlike');
            Animated.timing(position, {
                toValue: { x: 0, y: -CARD_HEIGHT - 100 },
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                nextCard();
            });
        }
    };

    const nextCard = () => {
        setCurrentIndex(prev => prev + 1);
        position.setValue({ x: 0, y: 0 });

        // Load more profiles when running low
        if (currentIndex >= profiles.length - 3) {
            loadProfiles();
        }
    };

    const renderCard = (profile, index) => {
        if (index < currentIndex) return null;
        if (index > currentIndex) {
            return (
                <View key={profile.id} style={[styles.card, { backgroundColor: colors.card }]}>
                    <Image source={{ uri: profile.photos[0] }} style={styles.cardImage} />
                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardName, { color: colors.text }]}>
                                {profile.name}, {profile.age}
                            </Text>
                            {profile.isVerified && (
                                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                            )}
                        </View>
                        <Text style={[styles.cardInfo, { color: colors.icon }]}>
                            {profile.year} • {profile.branch}
                        </Text>
                        <Text style={[styles.cardDistance, { color: colors.icon }]}>
                            {profile.distance}
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <Animated.View
                key={profile.id}
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        transform: [
                            { translateX: position.x },
                            { translateY: position.y },
                            { rotate },
                        ],
                    },
                ]}
                {...panResponder.panHandlers}
            >
                <Image source={{ uri: profile.photos[0] }} style={styles.cardImage} />

                <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
                    <Text style={styles.likeLabelText}>LIKE</Text>
                </Animated.View>

                <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
                    <Text style={styles.nopeLabelText}>NOPE</Text>
                </Animated.View>

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardName, { color: colors.text }]}>
                            {profile.name}, {profile.age}
                        </Text>
                        {profile.isVerified && (
                            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        )}
                    </View>
                    <Text style={[styles.cardInfo, { color: colors.icon }]}>
                        {profile.year} • {profile.branch}
                    </Text>
                    <Text style={[styles.cardDistance, { color: colors.icon }]}>
                        {profile.distance}
                    </Text>
                    <Text style={[styles.cardBio, { color: colors.text }]} numberOfLines={2}>
                        {profile.bio}
                    </Text>
                    <View style={styles.interests}>
                        {profile.interests.slice(0, 3).map((interest, idx) => (
                            <View key={idx} style={[styles.interestTag, { backgroundColor: colors.surface }]}>
                                <Text style={[styles.interestText, { color: colors.text }]}>{interest}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Animated.View>
        );
    };

    if (currentIndex >= profiles.length) {
        return (
            <View style={[styles.container, styles.emptyContainer, { backgroundColor: colors.background }]}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No More Profiles</Text>
                <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                    Check back later for new suggestions!
                </Text>
                <TouchableOpacity
                    style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                        setCurrentIndex(0);
                        setProfiles(mockProfiles);
                    }}
                >
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Discover</Text>
                <View style={styles.superLikesContainer}>
                    <Ionicons name="star" size={20} color={colors.warning} />
                    <Text style={[styles.superLikesText, { color: colors.text }]}>{superLikesLeft}</Text>
                </View>
            </View>

            <View style={styles.cardContainer}>
                {profiles.map((profile, index) => renderCard(profile, index)).reverse()}
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.passButton, { backgroundColor: colors.error }]}
                    onPress={handlePass}
                >
                    <Ionicons name="close" size={30} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        styles.superLikeButton,
                        { backgroundColor: colors.warning },
                        superLikesLeft === 0 && styles.disabledButton,
                    ]}
                    onPress={handleSuperLike}
                    disabled={superLikesLeft === 0}
                >
                    <Ionicons name="star" size={25} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.likeButton, { backgroundColor: colors.success }]}
                    onPress={handleLike}
                >
                    <Ionicons name="heart" size={30} color="white" />
                </TouchableOpacity>
            </View>
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
    superLikesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    superLikesText: {
        fontSize: 16,
        fontWeight: '600',
    },
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 20,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardImage: {
        width: '100%',
        height: '60%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    cardContent: {
        flex: 1,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    cardName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    cardInfo: {
        fontSize: 16,
        marginBottom: 5,
    },
    cardDistance: {
        fontSize: 14,
        marginBottom: 10,
    },
    cardBio: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 15,
    },
    interests: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    interestText: {
        fontSize: 12,
        fontWeight: '500',
    },
    likeLabel: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        transform: [{ rotate: '30deg' }],
        zIndex: 1,
    },
    likeLabelText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    nopeLabel: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(244, 67, 54, 0.9)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        transform: [{ rotate: '-30deg' }],
        zIndex: 1,
    },
    nopeLabelText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30,
        gap: 30,
    },
    actionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    passButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    superLikeButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    likeButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    disabledButton: {
        opacity: 0.5,
    },
    emptyContainer: {
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
        marginBottom: 30,
    },
    refreshButton: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    refreshButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
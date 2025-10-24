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
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../services/api';
import MatchModal from '../../components/MatchModal';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.7;
const CARD_WIDTH = width * 0.9;




export default function SuggestionsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [superLikesLeft, setSuperLikesLeft] = useState(3);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedPhotos, setLikedPhotos] = useState(new Set());
    const [photoLikeCounts, setPhotoLikeCounts] = useState({}); // Store like counts from database
    const activeScrollRef = useRef(null);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [matchedUser, setMatchedUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);


    useEffect(() => {
        loadProfiles();
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const response = await ApiService.getCurrentUser();
            if (response.success) {
                setCurrentUser(response.data.user);
            }
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    };

    const loadProfiles = async () => {
        try {
            console.log('🔍 Loading discover profiles...');
            const response = await ApiService.getDiscoverUsers({ limit: 10 });
            console.log('📡 Discover API response:', response);

            /* 
            Backend should return photos with like data:
            {
                success: true,
                data: {
                    users: [{
                        id: "user123",
                        name: "Sarah",
                        photos: [
                            {
                                url: "https://cloudinary.com/image1.jpg",
                                likeCount: 24,                    // Total likes for this photo
                                isLikedByCurrentUser: true        // Whether current user liked it
                            },
                            {
                                url: "https://cloudinary.com/image2.jpg", 
                                likeCount: 18,
                                isLikedByCurrentUser: false
                            }
                        ]
                    }]
                }
            }
            */

            if (response.success && response.data && response.data.users && response.data.users.length > 0) {
                console.log('👥 Found users:', response.data.users.length);
                // Ensure each profile has required properties
                const validProfiles = response.data.users.map(profile => ({
                    ...profile,
                    id: profile.id || profile._id,
                    photos: profile.photos || [],
                    interests: profile.interests || [],
                    distance: profile.distance || 'Distance unknown',
                    isVerified: profile.isVerified || false
                }));
                console.log('✅ Valid profiles processed:', validProfiles.length);
                console.log('📷 First profile Instagram data:', validProfiles[0]?.instagram);
                setProfiles(validProfiles);

                // Extract like counts from profile data
                extractLikeCountsFromProfiles(validProfiles);
            } else {
                console.log('⚠️ No real profiles found');
                setProfiles([]);
            }
        } catch (error) {
            console.error('❌ Error loading profiles:', error);
            setError(error.message);
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    };

    const extractLikeCountsFromProfiles = (profiles) => {
        const likeCounts = {};
        const userLikedPhotos = new Set();

        profiles.forEach(profile => {
            if (profile.photos) {
                profile.photos.forEach((photo, index) => {
                    const photoUrl = photo?.url || photo;
                    if (photoUrl) {
                        // Extract like count from photo data (backend should provide this)
                        const likeCount = photo?.likeCount || photo?.likes || 0;
                        likeCounts[photoUrl] = likeCount;

                        // Check if current user has liked this photo
                        const isLikedByUser = photo?.isLikedByCurrentUser || photo?.userLiked || false;
                        if (isLikedByUser) {
                            userLikedPhotos.add(photoUrl);
                        }
                    }
                });
            }
        });

        console.log('📊 Extracted like counts for', Object.keys(likeCounts).length, 'photos');
        console.log('❤️ User has liked', userLikedPhotos.size, 'photos');

        setPhotoLikeCounts(likeCounts);
        setLikedPhotos(userLikedPhotos);
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
        onStartShouldSetPanResponder: (evt, gestureState) => {
            // Only capture horizontal swipes, let vertical scrolling work
            return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            // Only capture horizontal swipes, let vertical scrolling work
            return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
        },
        onPanResponderGrant: () => {
            // Only set position for horizontal movement
            position.setOffset({
                x: position.x._value,
                y: position.y._value,
            });
        },
        onPanResponderMove: (_, gesture) => {
            // Only move horizontally for swiping, ignore vertical movement
            position.setValue({ x: gesture.dx, y: 0 });
        },
        onPanResponderRelease: (_, gesture) => {
            position.flattenOffset();

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
                setMatchedUser({
                    ...currentProfile,
                    matchId: response.data.matchId
                });
                setShowMatchModal(true);
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
        // Reset scroll position for next card
        if (activeScrollRef.current) {
            activeScrollRef.current.scrollTo({ y: 0, animated: false });
        }

        setCurrentIndex(prev => prev + 1);
        position.setValue({ x: 0, y: 0 });

        // Load more profiles when running low
        if (currentIndex >= profiles.length - 3) {
            loadProfiles();
        }
    };

    const handleMatchModalClose = () => {
        setShowMatchModal(false);
        setMatchedUser(null);
    };

    const handleSendMessage = () => {
        setShowMatchModal(false);
        if (matchedUser?.matchId) {
            router.push(`/chat/${matchedUser.matchId}`);
        }
        setMatchedUser(null);
    };

    const handlePhotoLike = async (profileId, photoIndex) => {
        const currentProfile = profiles.find(p => p.id === profileId);
        const photos = currentProfile?.photos || [];
        const photoUrl = photos[photoIndex]?.url || photos[photoIndex];

        if (!photoUrl) {
            console.error('❌ No photo URL found for like action');
            return;
        }

        const photoKey = photoUrl;

        try {
            const wasLikedBefore = likedPhotos.has(photoKey);
            const countBefore = photoLikeCounts[photoKey] || 0;

            console.log(`🔄 Frontend: Toggling like for photo of ${currentProfile?.name}`);
            console.log(`🔍 Frontend Debug: wasLikedBefore: ${wasLikedBefore}, countBefore: ${countBefore}`);

            // Make simple API call - backend handles all the toggle logic
            const response = await ApiService.likePhoto(photoUrl, true); // Parameter ignored by backend

            if (response.success) {
                console.log(`📡 Backend Response: isLiked: ${response.data.isLiked}, likeCount: ${response.data.likeCount}`);

                // Update UI based on backend response only
                setLikedPhotos(prev => {
                    const newSet = new Set(prev);
                    if (response.data.isLiked) {
                        newSet.add(photoKey);
                    } else {
                        newSet.delete(photoKey);
                    }
                    return newSet;
                });

                // Update count from backend
                setPhotoLikeCounts(prev => ({
                    ...prev,
                    [photoKey]: response.data.likeCount
                }));

                console.log(`✅ ${response.data.isLiked ? 'Liked' : 'Unliked'} photo: ${response.data.likeCount} total likes`);
            } else {
                console.error('❌ Failed to toggle like:', response.message);
            }
        } catch (error) {
            console.error('❌ Error toggling photo like:', error);
        }
    };





    const renderCard = (profile, index) => {
        if (index < currentIndex) return null;

        const isActive = index === currentIndex;
        const photos = profile.photos || [];

        // Ensure we have at least one photo (fallback)
        const mainPhoto = photos[0]?.url || photos[0] || 'https://via.placeholder.com/300x400/CCCCCC/FFFFFF?text=No+Photo';

        if (index > currentIndex) {
            return (
                <View key={profile.id} style={[styles.card, { backgroundColor: colors.card }]}>
                    <ScrollView
                        style={styles.fullScrollView}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={true}
                        bounces={true}
                        alwaysBounceVertical={true}
                        ref={(ref) => {
                            if (ref && !isActive) {
                                ref.scrollTo({ y: 0, animated: false });
                            }
                        }}
                    >
                        {/* Main Photo */}
                        <View style={[styles.photoContainer, styles.firstPhotoContainer]}>
                            <Image
                                source={{ uri: mainPhoto }}
                                style={styles.fullPhoto}
                                defaultSource={{ uri: 'https://via.placeholder.com/300x400/CCCCCC/FFFFFF?text=Loading...' }}
                                onError={(error) => {
                                    console.log('❌ Image load error:', error.nativeEvent.error);
                                }}
                                onLoad={() => {
                                    console.log('✅ Main photo loaded');
                                }}
                            />
                            {/* Like Button for main photo */}
                            <View style={styles.photoLikeContainer}>
                                <TouchableOpacity
                                    style={styles.photoLikeButton}
                                    onPress={() => handlePhotoLike(profile.id, 0)}
                                >
                                    <Ionicons
                                        name={likedPhotos.has(mainPhoto) ? "heart" : "heart-outline"}
                                        size={24}
                                        color={likedPhotos.has(mainPhoto) ? "#FF4458" : "white"}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.likeCount}>
                                    {photoLikeCounts[mainPhoto] || 0}
                                </Text>
                            </View>
                        </View>

                        {/* User Details */}
                        <View style={[styles.userDetailsSection, { backgroundColor: colors.card }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardName, { color: colors.text }]}>
                                    {profile.name || 'Unknown'}, {profile.age || '?'}
                                </Text>
                                {profile.isVerified && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                )}
                            </View>
                            <Text style={[styles.cardInfo, { color: colors.icon }]}>
                                {profile.year || 'Year not set'} • {profile.branch || 'Branch not set'}
                            </Text>
                            <Text style={[styles.cardDistance, { color: colors.icon }]}>
                                {profile.distance || 'Distance unknown'}
                            </Text>
                            <Text style={[styles.cardBio, { color: colors.text }]}>
                                {profile.bio || 'No bio available'}
                            </Text>
                            {profile.instagram && profile.instagram.username && profile.instagram.isPublic && (
                                <TouchableOpacity style={styles.instagramContainer}>
                                    <Ionicons name="logo-instagram" size={16} color="#E4405F" />
                                    <Text style={[styles.instagramText, { color: colors.text }]}>
                                        @{profile.instagram.username}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <View style={styles.interests}>
                                {(profile.interests || []).slice(0, 5).map((interest, idx) => (
                                    <View key={idx} style={[styles.interestTag, { backgroundColor: colors.surface }]}>
                                        <Text style={[styles.interestText, { color: colors.text }]}>{interest}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Additional Photos */}
                        {photos.slice(1).map((photo, photoIndex) => {
                            const photoUri = photo?.url || photo || `https://via.placeholder.com/300x400/CCCCCC/FFFFFF?text=Photo+${photoIndex + 2}`;
                            console.log('📸 Loading additional photo:', photoIndex + 2, photoUri);

                            return (
                                <View key={photoIndex + 1} style={styles.photoContainer}>
                                    <Image
                                        source={{ uri: photoUri }}
                                        style={styles.fullPhoto}
                                        defaultSource={{ uri: 'https://via.placeholder.com/300x400/CCCCCC/FFFFFF?text=Loading...' }}
                                        onError={(error) => {
                                            console.log(`❌ Photo ${photoIndex + 2} load error:`, error.nativeEvent.error);
                                        }}
                                        onLoad={() => {
                                            console.log(`✅ Photo ${photoIndex + 2} loaded`);
                                        }}
                                    />
                                    {/* Like Button for each photo */}
                                    <View style={styles.photoLikeContainer}>
                                        <TouchableOpacity
                                            style={styles.photoLikeButton}
                                            onPress={() => handlePhotoLike(profile.id, photoIndex + 1)}
                                        >
                                            <Ionicons
                                                name={likedPhotos.has(photoUri) ? "heart" : "heart-outline"}
                                                size={24}
                                                color={likedPhotos.has(photoUri) ? "#FF4458" : "white"}
                                            />
                                        </TouchableOpacity>
                                        <Text style={styles.likeCount}>
                                            {photoLikeCounts[photoUri] || 0}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}

                        {/* Bottom spacing for comfortable scrolling */}
                        <View style={styles.bottomSpacing} />
                    </ScrollView>
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
                <ScrollView
                    style={styles.fullScrollView}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={true}
                    bounces={true}
                    alwaysBounceVertical={true}
                    ref={(ref) => {
                        if (ref && isActive) {
                            activeScrollRef.current = ref;
                        }
                    }}
                >
                    {/* Main Photo */}
                    <View style={[styles.photoContainer, styles.firstPhotoContainer]}>
                        <Image
                            source={{ uri: mainPhoto }}
                            style={styles.fullPhoto}
                            defaultSource={{ uri: 'https://via.placeholder.com/300x400/CCCCCC/FFFFFF?text=Loading...' }}
                            onError={(error) => {
                                console.log('❌ Active card image load error:', error.nativeEvent.error);
                            }}
                            onLoad={() => {
                                console.log('✅ Active card main photo loaded');
                            }}
                        />
                        {/* Like Button for main photo */}
                        <View style={styles.photoLikeContainer}>
                            <TouchableOpacity
                                style={styles.photoLikeButton}
                                onPress={() => handlePhotoLike(profile.id, 0)}
                            >
                                <Ionicons
                                    name={likedPhotos.has(mainPhoto) ? "heart" : "heart-outline"}
                                    size={24}
                                    color={likedPhotos.has(mainPhoto) ? "#FF4458" : "white"}
                                />
                            </TouchableOpacity>
                            <Text style={styles.likeCount}>
                                {photoLikeCounts[mainPhoto] || 0}
                            </Text>
                        </View>
                    </View>

                    {/* User Details */}
                    <View style={[styles.userDetailsSection, { backgroundColor: colors.card }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardName, { color: colors.text }]}>
                                {profile.name || 'Unknown'}, {profile.age || '?'}
                            </Text>
                            {profile.isVerified && (
                                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                            )}
                        </View>
                        <Text style={[styles.cardInfo, { color: colors.icon }]}>
                            {profile.year || 'Year not set'} • {profile.branch || 'Branch not set'}
                        </Text>
                        <Text style={[styles.cardDistance, { color: colors.icon }]}>
                            {profile.distance || 'Distance unknown'}
                        </Text>
                        <Text style={[styles.cardBio, { color: colors.text }]}>
                            {profile.bio || 'No bio available'}
                        </Text>
                        {profile.instagram && profile.instagram.username && profile.instagram.isPublic && (
                            <TouchableOpacity style={styles.instagramContainer}>
                                <Ionicons name="logo-instagram" size={16} color="#E4405F" />
                                <Text style={[styles.instagramText, { color: colors.text }]}>
                                    @{profile.instagram.username}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <View style={styles.interests}>
                            {(profile.interests || []).slice(0, 5).map((interest, idx) => (
                                <View key={idx} style={[styles.interestTag, { backgroundColor: colors.surface }]}>
                                    <Text style={[styles.interestText, { color: colors.text }]}>{interest}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Additional Photos */}
                    {photos.slice(1).map((photo, photoIndex) => {
                        const photoUri = photo?.url || photo || `https://via.placeholder.com/300x400/CCCCCC/FFFFFF?text=Photo+${photoIndex + 2}`;

                        return (
                            <View key={photoIndex + 1} style={styles.photoContainer}>
                                <Image
                                    source={{ uri: photoUri }}
                                    style={styles.fullPhoto}
                                    defaultSource={{ uri: 'https://via.placeholder.com/300x400/CCCCCC/FFFFFF?text=Loading...' }}
                                    onError={(error) => {
                                        console.log(`❌ Active card photo ${photoIndex + 2} load error:`, error.nativeEvent.error);
                                    }}
                                    onLoad={() => {
                                        console.log(`✅ Active card photo ${photoIndex + 2} loaded`);
                                    }}
                                />
                                {/* Like Button for each photo */}
                                <View style={styles.photoLikeContainer}>
                                    <TouchableOpacity
                                        style={styles.photoLikeButton}
                                        onPress={() => handlePhotoLike(profile.id, photoIndex + 1)}
                                    >
                                        <Ionicons
                                            name={likedPhotos.has(photoUri) ? "heart" : "heart-outline"}
                                            size={24}
                                            color={likedPhotos.has(photoUri) ? "#FF4458" : "white"}
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.likeCount}>
                                        {photoLikeCounts[photoUri] || 0}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}

                    {/* Bottom spacing for comfortable scrolling */}
                    <View style={styles.bottomSpacing} />
                </ScrollView>

                <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
                    <Text style={styles.likeLabelText}>LIKE</Text>
                </Animated.View>

                <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
                    <Text style={styles.nopeLabelText}>NOPE</Text>
                </Animated.View>
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.emptyContainer, { backgroundColor: colors.background }]}>
                <Text style={styles.emptyEmoji}>⏳</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Loading Profiles...</Text>
                <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                    Finding amazing people for you!
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.emptyContainer, { backgroundColor: colors.background }]}>
                <Text style={styles.emptyEmoji}>⚠️</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Something went wrong</Text>
                <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                    {error}
                </Text>
                <TouchableOpacity
                    style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                        setError(null);
                        setLoading(true);
                        loadProfiles();
                    }}
                >
                    <Text style={styles.refreshButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                        setLoading(true);
                        loadProfiles();
                    }}
                >
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Discover</Text>
                <View style={styles.superLikesContainer}>
                    <Ionicons name="star" size={20} color={colors.warning} />
                    <Text style={[styles.superLikesText, { color: colors.text }]}>{superLikesLeft}</Text>
                </View>
            </View>

            <View style={styles.cardContainer}>
                {profiles && profiles.length > 0 ?
                    profiles.map((profile, index) => renderCard(profile, index)).reverse()
                    :
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No profiles available</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                            Loading profiles or none found in your area
                        </Text>
                    </View>
                }
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

            <MatchModal
                visible={showMatchModal}
                onClose={handleMatchModalClose}
                onSendMessage={handleSendMessage}
                matchedUser={matchedUser}
                currentUser={currentUser}
            />
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
        borderRadius: 24,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    fullScrollView: {
        flex: 1,
        borderRadius: 24,
    },
    photoContainer: {
        width: '100%',
        height: CARD_HEIGHT * 0.6, // Each photo takes 60% of card height
        position: 'relative',
        marginBottom: 12,
        paddingHorizontal: 8,
        paddingTop: 8,
    },
    firstPhotoContainer: {
        paddingTop: 0,
        marginBottom: 8,
    },
    bottomSpacing: {
        height: 40,
    },
    fullPhoto: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 16,
    },
    photoLikeContainer: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        alignItems: 'center',
    },
    photoLikeButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 4,
    },
    likeCount: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    userDetailsSection: {
        padding: 24,
        paddingTop: 16,
        paddingBottom: 24,
        minHeight: 150,
        marginHorizontal: 8,
        marginBottom: 12,
        borderRadius: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    instagramContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
        gap: 6,
    },
    instagramText: {
        fontSize: 14,
        fontWeight: '500',
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
    disabledButton: {
        opacity: 0.5,
    },


});
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
    Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

import { useFocusEffect } from '@react-navigation/native';
import ApiService from '../../services/api';

// Branch mapping for display
const branchMapping = {
    'CSE': 'CSE (Computer Science Engineering)',
    'IT': 'IT (Information Technology)',
    'SE': 'SE (Software Engineering)',
    'EE': 'EE (Electrical Engineering)',
    'ECE': 'ECE (Electronics & Communication)',
    'ENTC': 'ENTC (Electronics & Telecommunication)',
    'ME': 'ME (Mechanical Engineering)',
    'CE': 'CE (Civil Engineering)',
    'CHE': 'CHE (Chemical Engineering)',
    'BME': 'BME (Biomedical Engineering)',
    'AE': 'AE (Aerospace Engineering)',
    'AIDS': 'AIDS (AI & Data Science)',
    'ML': 'ML (Machine Learning)',
    'AI': 'AI (Artificial Intelligence)',
    'DS': 'DS (Data Science)',
    'CYBER': 'CYBER (Cyber Security)',
    'IOT': 'IOT (Internet of Things)',
    'ROBOTICS': 'ROBOTICS (Robotics Engineering)',
    'MBA': 'MBA (Master of Business Administration)',
    'BBA': 'BBA (Bachelor of Business Administration)',
    'MKTG': 'MKTG (Marketing)',
    'FIN': 'FIN (Finance)',
    'ACC': 'ACC (Accounting)',
    'ECON': 'ECON (Economics)',
    'BIO': 'BIO (Biology)',
    'CHEM': 'CHEM (Chemistry)',
    'PHY': 'PHY (Physics)',
    'MATH': 'MATH (Mathematics)',
    'STAT': 'STAT (Statistics)',
    'PSYCH': 'PSYCH (Psychology)'
};

// Year mapping for display
const yearMapping = {
    '1st': '1st Year',
    '2nd': '2nd Year',
    '3rd': '3rd Year',
    'Final': 'Final Year'
};





export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];


    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoModalVisible, setPhotoModalVisible] = useState(false);
    const [addPhotoModalVisible, setAddPhotoModalVisible] = useState(false);

    useEffect(() => {
        loadUserProfile();
    }, []);

    // Refresh profile when tab is focused
    useFocusEffect(
        React.useCallback(() => {
            loadUserProfile();
        }, [])
    );

    const loadUserProfile = async () => {
        try {
            const response = await ApiService.getCurrentUser();
            if (response.success) {
                setUser({
                    ...response.data.user,
                    photos: response.data.user.photos?.length > 0 ? response.data.user.photos.map(p => p.url || p) : [],
                    interests: response.data.user.interests || [],
                    isVerified: true,
                    year: response.data.user.year || null,
                    branch: response.data.user.branch || null,
                    gender: response.data.user.gender || null,
                    lookingFor: response.data.user.lookingFor || null,
                    preference: response.data.user.preference || null,
                    instagram: response.data.user.instagram || null
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPhoto = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Please allow access to your photo library to upload photos.');
                return;
            }

            // Show custom modal
            setAddPhotoModalVisible(true);
        } catch (error) {
            console.error('Error requesting permission:', error);
            Alert.alert('Error', 'Failed to access photo library');
        }
    };

    const handleCameraOption = () => {
        setAddPhotoModalVisible(false);
        openCamera();
    };

    const handleLibraryOption = () => {
        setAddPhotoModalVisible(false);
        openImagePicker();
    };

    const closeAddPhotoModal = () => {
        setAddPhotoModalVisible(false);
    };

    const openCamera = async () => {
        try {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

            if (cameraPermission.granted === false) {
                Alert.alert('Permission Required', 'Please allow camera access to take photos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadPhoto(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error opening camera:', error);
            Alert.alert('Error', 'Failed to open camera');
        }
    };

    const openImagePicker = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadPhoto(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error opening image picker:', error);
            Alert.alert('Error', 'Failed to open photo library');
        }
    };

    const uploadPhoto = async (imageUri) => {
        try {
            setLoading(true);
            const response = await ApiService.uploadPhoto(imageUri);

            if (response.success) {
                // Refresh profile to get updated photos
                await loadUserProfile();
                Alert.alert('Success', 'Photo uploaded successfully!');
            } else {
                Alert.alert('Error', response.message || 'Failed to upload photo');
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            Alert.alert('Error', 'Failed to upload photo. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoPress = (photo, index) => {
        setSelectedPhoto({ photo, index });
        setPhotoModalVisible(true);
    };

    const handleDeletePhoto = async () => {
        if (!selectedPhoto) return;

        Alert.alert(
            'Delete Photo',
            'Are you sure you want to delete this photo? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deletePhoto();
                    },
                },
            ]
        );
    };

    const deletePhoto = async () => {
        try {
            setLoading(true);
            setPhotoModalVisible(false);

            // Extract publicId from photo URL or use the photo object
            let publicId = null;
            const photo = selectedPhoto.photo;

            if (photo.publicId) {
                publicId = photo.publicId;
            } else if (typeof photo === 'string') {
                // If it's a URL, try to extract publicId from it
                // This is a fallback for mock data or URLs
                console.log('Photo is a URL, cannot delete from cloud:', photo);
                Alert.alert('Error', 'Cannot delete this photo. Please try refreshing your profile.');
                return;
            } else if (photo.url) {
                // Try to extract from URL structure if available
                const urlParts = photo.url.split('/');
                const filename = urlParts[urlParts.length - 1];
                publicId = filename.split('.')[0]; // Remove extension
            }

            if (!publicId) {
                Alert.alert('Error', 'Cannot identify photo for deletion.');
                return;
            }

            const response = await ApiService.deletePhoto(publicId);

            if (response.success) {
                // Refresh profile to get updated photos
                await loadUserProfile();
                Alert.alert('Success', 'Photo deleted successfully!');
            } else {
                Alert.alert('Error', response.message || 'Failed to delete photo');
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
            Alert.alert('Error', 'Failed to delete photo. Please try again.');
        } finally {
            setLoading(false);
            setSelectedPhoto(null);
        }
    };

    const closePhotoModal = () => {
        setPhotoModalVisible(false);
        setSelectedPhoto(null);
    };

    const handleEditMainPhoto = async () => {
        setPhotoModalVisible(false);
        // Use the same photo upload flow as adding new photos
        await handleAddPhoto();
    };

    const handleSetAsMain = async () => {
        if (!selectedPhoto || selectedPhoto.index === 0) return;

        try {
            setLoading(true);
            setPhotoModalVisible(false);

            const photo = selectedPhoto.photo;
            let publicId = null;

            if (photo.publicId) {
                publicId = photo.publicId;
            } else if (photo.url) {
                // Try to extract from URL structure if available
                const urlParts = photo.url.split('/');
                const filename = urlParts[urlParts.length - 1];
                publicId = filename.split('.')[0]; // Remove extension
            }

            if (!publicId) {
                Alert.alert('Error', 'Cannot identify photo for setting as main.');
                return;
            }

            const response = await ApiService.setMainPhoto(publicId);

            if (response.success) {
                // Refresh profile to get updated photos
                await loadUserProfile();
                Alert.alert('Success', 'Main photo updated successfully!');
            } else {
                Alert.alert('Error', response.message || 'Failed to set as main photo');
            }
        } catch (error) {
            console.error('Error setting main photo:', error);
            Alert.alert('Error', 'Failed to set as main photo. Please try again.');
        } finally {
            setLoading(false);
            setSelectedPhoto(null);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.push('/profile-setup')}
                        >
                            <Ionicons name="create-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.push('/settings')}
                        >
                            <Ionicons name="settings-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.push('/profile-setup')}
                        >
                            <Ionicons name="create-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.push('/settings')}
                        >
                            <Ionicons name="settings-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="person-circle-outline" size={80} color={colors.icon} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Profile Not Found</Text>
                    <Text style={[styles.emptyText, { color: colors.icon }]}>
                        Unable to load your profile. Please complete your profile setup.
                    </Text>
                    <TouchableOpacity
                        style={[styles.setupButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/profile-setup')}
                    >
                        <Text style={styles.setupButtonText}>Setup Profile</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.push('/profile-setup')}
                        >
                            <Ionicons name="create-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.push('/settings')}
                        >
                            <Ionicons name="settings-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Card */}
                <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.profileHeader}>
                        <TouchableOpacity onPress={() => user.photos?.[0] && handlePhotoPress(user.photos[0], 0)}>
                            <View style={styles.mainPhotoContainer}>
                                {user.photos?.[0] ? (
                                    <Image source={{ uri: user.photos[0].url || user.photos[0] }} style={styles.profileImage} />
                                ) : (
                                    <View style={[styles.profileImage, styles.placeholderImage, { backgroundColor: colors.surface }]}>
                                        <Ionicons name="person" size={60} color={colors.icon} />
                                    </View>
                                )}
                                <View style={[styles.mainPhotoBadge, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="star" size={12} color="white" />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.profileInfo}>
                            <View style={styles.nameContainer}>
                                <Text style={[styles.profileName, { color: colors.text }]}>
                                    {user.name}, {user.age}
                                </Text>
                                {user.isVerified && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                )}
                            </View>
                            <Text style={[styles.profileDetails, { color: colors.icon }]}>
                                {user.year ? (yearMapping[user.year] || user.year) : 'Year not set'} • {user.branch ? (branchMapping[user.branch] || user.branch) : 'Branch not set'}
                            </Text>
                            <Text style={[styles.profileCollege, { color: colors.icon }]}>
                                📍 {user.college}
                            </Text>
                        </View>
                    </View>

                    {/* Profile Details Section */}
                    <View style={styles.profileDetailsSection}>
                        {user.gender && (
                            <View style={styles.detailItem}>
                                <Ionicons name="person" size={16} color={colors.primary} />
                                <Text style={[styles.detailText, { color: colors.text }]}>
                                    {user.gender}
                                </Text>
                            </View>
                        )}
                        {user.lookingFor && (
                            <View style={styles.detailItem}>
                                <Ionicons name="heart" size={16} color={colors.primary} />
                                <Text style={[styles.detailText, { color: colors.text }]}>
                                    Looking for {user.lookingFor.toLowerCase()}
                                </Text>
                            </View>
                        )}
                        {user.preference && (
                            <View style={styles.detailItem}>
                                <Ionicons name="people" size={16} color={colors.primary} />
                                <Text style={[styles.detailText, { color: colors.text }]}>
                                    Interested in {user.preference.toLowerCase()}
                                </Text>
                            </View>
                        )}
                        {user.instagram && user.instagram.username && user.instagram.isPublic && (
                            <TouchableOpacity
                                style={styles.detailItem}
                                onPress={() => {
                                    console.log('Open Instagram:', user.instagram.username);
                                }}
                            >
                                <Ionicons name="logo-instagram" size={16} color="#E4405F" />
                                <Text style={[styles.detailText, { color: colors.text }]}>
                                    @{user.instagram.username}
                                </Text>
                            </TouchableOpacity>
                        )}

                    </View>

                    {user.bio && (
                        <Text style={[styles.profileBio, { color: colors.text }]}>{user.bio}</Text>
                    )}

                    {user.interests && user.interests.length > 0 && (
                        <View style={styles.interests}>
                            {user.interests.map((interest, index) => (
                                <View key={index} style={[styles.interestTag, { backgroundColor: colors.surface }]}>
                                    <Text style={[styles.interestText, { color: colors.text }]}>{interest}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Photos Grid - Always show if there are additional photos or if we want to show add button */}
                    {((user.photos && user.photos.length > 1) || (!user.photos || user.photos.length < 6)) && (
                        <View style={styles.photosGrid}>
                            {/* Existing Photos (excluding main photo) */}
                            {user.photos && user.photos.length > 1 && user.photos.slice(1).map((photo, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.photoContainer}
                                    onPress={() => handlePhotoPress(photo, index + 1)}
                                >
                                    <Image
                                        source={{ uri: photo.url || photo }}
                                        style={styles.photoThumbnail}
                                    />
                                </TouchableOpacity>
                            ))}

                            {/* Add Photo Button */}
                            {(!user.photos || user.photos.length < 6) && (
                                <TouchableOpacity
                                    style={[styles.photoContainer, styles.addPhotoContainer]}
                                    onPress={handleAddPhoto}
                                >
                                    <View style={[styles.addPhotoButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                        <Ionicons name="add" size={32} color={colors.icon} />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>



                {/* Bottom spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Photo Modal */}
            <Modal
                visible={photoModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closePhotoModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={[styles.modalHeader, { backgroundColor: colors.background }]}>
                            <TouchableOpacity onPress={closePhotoModal}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {selectedPhoto?.index === 0 ? 'Main Photo' : 'Photo'}
                            </Text>
                            <View style={styles.headerActions}>
                                {selectedPhoto?.index === 0 ? (
                                    // Main photo actions: Edit
                                    <TouchableOpacity
                                        style={styles.headerActionButton}
                                        onPress={handleEditMainPhoto}
                                    >
                                        <Ionicons name="create-outline" size={24} color={colors.primary} />
                                    </TouchableOpacity>
                                ) : (
                                    // Other photos actions: Set as main, Delete
                                    <>
                                        <TouchableOpacity
                                            style={styles.headerActionButton}
                                            onPress={handleSetAsMain}
                                        >
                                            <Ionicons name="star-outline" size={24} color={colors.warning} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.headerActionButton}
                                            onPress={handleDeletePhoto}
                                        >
                                            <Ionicons name="trash" size={24} color={colors.error} />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Photo */}
                        <View style={styles.modalImageContainer}>
                            {selectedPhoto && (
                                <Image
                                    source={{ uri: selectedPhoto.photo.url || selectedPhoto.photo }}
                                    style={styles.modalImage}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Photo Modal */}
            <Modal
                visible={addPhotoModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeAddPhotoModal}
            >
                <View style={styles.addPhotoModalOverlay}>
                    <View style={[styles.addPhotoModalContainer, { backgroundColor: colors.background }]}>
                        {/* Header */}
                        <View style={styles.addPhotoModalHeader}>
                            <View style={styles.addPhotoModalHandle} />
                            <Text style={[styles.addPhotoModalTitle, { color: colors.text }]}>Add Photo</Text>
                            <Text style={[styles.addPhotoModalSubtitle, { color: colors.icon }]}>
                                Choose how you want to add a photo
                            </Text>
                        </View>

                        {/* Options */}
                        <View style={styles.addPhotoOptions}>
                            <TouchableOpacity
                                style={[styles.addPhotoOption, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={handleCameraOption}
                            >
                                <View style={[styles.addPhotoOptionIcon, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="camera" size={28} color="white" />
                                </View>
                                <View style={styles.addPhotoOptionText}>
                                    <Text style={[styles.addPhotoOptionTitle, { color: colors.text }]}>Camera</Text>
                                    <Text style={[styles.addPhotoOptionSubtitle, { color: colors.icon }]}>
                                        Take a new photo
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.addPhotoOption, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={handleLibraryOption}
                            >
                                <View style={[styles.addPhotoOptionIcon, { backgroundColor: colors.secondary }]}>
                                    <Ionicons name="images" size={28} color="white" />
                                </View>
                                <View style={styles.addPhotoOptionText}>
                                    <Text style={[styles.addPhotoOptionTitle, { color: colors.text }]}>Photo Library</Text>
                                    <Text style={[styles.addPhotoOptionSubtitle, { color: colors.icon }]}>
                                        Choose from your photos
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>
                        </View>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={[styles.addPhotoCancelButton, { backgroundColor: colors.surface }]}
                            onPress={closeAddPhotoModal}
                        >
                            <Text style={[styles.addPhotoCancelText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
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
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerButton: {
        padding: 4,
    },

    profileCard: {
        margin: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    profileHeader: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    mainPhotoContainer: {
        position: 'relative',
        marginRight: 15,
    },
    profileImage: {
        width: 130,
        height: 130,
        borderRadius: 70,
    },
    placeholderImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainPhotoBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileDetails: {
        fontSize: 14,
        marginBottom: 2,
    },
    profileCollege: {
        fontSize: 14,
    },
    profileBio: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 15,
    },
    interests: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
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
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    photoContainer: {
        width: '31%', // 3 columns with gaps
    },
    photoThumbnail: {
        width: '100%',
        height: 100,
        borderRadius: 12,
    },
    addPhotoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPhotoButton: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-start',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingTop: 50, // Account for status bar
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerActionButton: {
        padding: 4,
    },
    modalImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 50, // Account for home indicator
    },
    modalImage: {
        width: '100%',
        height: '100%',
        maxHeight: Dimensions.get('window').height * 0.8,
    },
    // Add Photo Modal Styles
    addPhotoModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    addPhotoModalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        minHeight: 300,
    },
    addPhotoModalHeader: {
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    addPhotoModalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        marginBottom: 20,
    },
    addPhotoModalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    addPhotoModalSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    addPhotoOptions: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 30,
    },
    addPhotoOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    addPhotoOptionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    addPhotoOptionText: {
        flex: 1,
    },
    addPhotoOptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    addPhotoOptionSubtitle: {
        fontSize: 14,
    },
    addPhotoCancelButton: {
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    addPhotoCancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    profileDetailsSection: {
        marginVertical: 15,
        gap: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        fontWeight: '500',
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
        marginTop: 20,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    setupButton: {
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    setupButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
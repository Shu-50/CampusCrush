import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import SuccessModal from '../components/SuccessModal';
import AlertModal from '../components/AlertModal';

const interests = [
    'Music', 'Sports', 'Movies', 'Books', 'Travel', 'Food', 'Art', 'Gaming',
    'Photography', 'Dancing', 'Fitness', 'Technology', 'Fashion', 'Nature'
];

const years = [
    { label: '1st Year', value: '1st' },
    { label: '2nd Year', value: '2nd' },
    { label: '3rd Year', value: '3rd' },
    { label: 'Final Year', value: 'Final' }
];
const branches = [
    // Engineering
    { label: 'CSE (Computer Science Engineering)', value: 'CSE' },
    { label: 'IT (Information Technology)', value: 'IT' },
    { label: 'SE (Software Engineering)', value: 'SE' },
    { label: 'EE (Electrical Engineering)', value: 'EE' },
    { label: 'ECE (Electronics & Communication)', value: 'ECE' },
    { label: 'ENTC (Electronics & Telecommunication)', value: 'ENTC' },
    { label: 'ME (Mechanical Engineering)', value: 'ME' },
    { label: 'CE (Civil Engineering)', value: 'CE' },
    { label: 'CHE (Chemical Engineering)', value: 'CHE' },
    { label: 'BME (Biomedical Engineering)', value: 'BME' },
    { label: 'AE (Aerospace Engineering)', value: 'AE' },
    // AI/Tech
    { label: 'AIDS (AI & Data Science)', value: 'AIDS' },
    { label: 'ML (Machine Learning)', value: 'ML' },
    { label: 'AI (Artificial Intelligence)', value: 'AI' },
    { label: 'DS (Data Science)', value: 'DS' },
    { label: 'CYBER (Cyber Security)', value: 'CYBER' },
    { label: 'IOT (Internet of Things)', value: 'IOT' },
    { label: 'ROBOTICS (Robotics Engineering)', value: 'ROBOTICS' },
    // Business
    { label: 'MBA (Master of Business Administration)', value: 'MBA' },
    { label: 'BBA (Bachelor of Business Administration)', value: 'BBA' },
    { label: 'MKTG (Marketing)', value: 'MKTG' },
    { label: 'FIN (Finance)', value: 'FIN' },
    { label: 'ACC (Accounting)', value: 'ACC' },
    { label: 'ECON (Economics)', value: 'ECON' },
    // Sciences
    { label: 'BIO (Biology)', value: 'BIO' },
    { label: 'CHEM (Chemistry)', value: 'CHEM' },
    { label: 'PHY (Physics)', value: 'PHY' },
    { label: 'MATH (Mathematics)', value: 'MATH' },
    { label: 'STAT (Statistics)', value: 'STAT' },
    { label: 'PSYCH (Psychology)', value: 'PSYCH' },
    // Other
    { label: 'Other (Enter manually)', value: 'OTHER' }
];

export default function ProfileSetupScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { updateUser, user } = useAuth();

    const [profile, setProfile] = useState({
        name: '',
        bio: '',
        age: '',
        year: '',
        branch: '',
        customBranch: '',
        gender: '',
        preference: '',
        lookingFor: 'Not sure',
        selectedInterests: [],
        instagramUsername: '',
        instagramIsPublic: false,
        college: '',
    });
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerData, setPickerData] = useState({
        title: '',
        options: [],
        currentValue: '',
        onSelect: () => { }
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info',
        buttons: []
    });

    // Load existing profile data if available
    useEffect(() => {
        loadExistingProfile();
    }, []);

    const showCustomAlert = (title, message, buttons = [{ text: 'OK' }], type = 'info') => {
        setAlertConfig({ title, message, buttons, type });
        setShowAlertModal(true);
    };

    const loadExistingProfile = async () => {
        setLoadingProfile(true);
        try {
            console.log('🔄 Loading existing profile...');
            const response = await ApiService.getCurrentUser();
            console.log('📡 API Response:', response);

            if (response.success && response.data.user) {
                const userData = response.data.user;
                console.log('👤 User Data:', userData);

                // Check if branch is a predefined value or custom
                const predefinedBranch = branches.find(b => b.value === userData.branch);
                console.log('🏢 Branch check:', { userBranch: userData.branch, predefinedBranch });

                const profileData = {
                    name: userData.name || '',
                    bio: userData.bio || '',
                    age: userData.age ? userData.age.toString() : '',
                    year: userData.year || '',
                    branch: predefinedBranch ? userData.branch : 'OTHER',
                    customBranch: predefinedBranch ? '' : (userData.branch || ''),
                    gender: userData.gender || '',
                    preference: userData.preference || '',
                    lookingFor: userData.lookingFor || 'Not sure',
                    selectedInterests: userData.interests || [],
                    instagramUsername: userData.instagram?.username || '',
                    instagramIsPublic: userData.instagram?.isPublic || false,
                    college: userData.college || '',
                };

                console.log('📝 Setting profile data:', profileData);
                setProfile(prev => ({ ...prev, ...profileData }));

                if (userData.photos && userData.photos.length > 0) {
                    console.log('📸 Setting photos:', userData.photos);
                    setPhotos(userData.photos);
                } else {
                    console.log('📸 No photos found');
                }
            } else if (user) {
                console.log('🔄 Using auth context user as fallback:', user);
                const userData = user;

                // Check if branch is a predefined value or custom
                const predefinedBranch = branches.find(b => b.value === userData.branch);

                const profileData = {
                    name: userData.name || '',
                    bio: userData.bio || '',
                    age: userData.age ? userData.age.toString() : '',
                    year: userData.year || '',
                    branch: predefinedBranch ? userData.branch : 'OTHER',
                    customBranch: predefinedBranch ? '' : (userData.branch || ''),
                    gender: userData.gender || '',
                    preference: userData.preference || '',
                    lookingFor: userData.lookingFor || 'Not sure',
                    selectedInterests: userData.interests || [],
                    college: userData.college || '',
                };

                console.log('📝 Setting profile data from auth context:', profileData);
                setProfile(prev => ({ ...prev, ...profileData }));

                if (userData.photos && userData.photos.length > 0) {
                    console.log('📸 Setting photos from auth context:', userData.photos);
                    setPhotos(userData.photos);
                }
            } else {
                console.log('❌ No user data available from API or auth context');
            }
        } catch (error) {
            console.error('❌ Error loading profile:', error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleInterestToggle = (interest) => {
        setProfile(prev => ({
            ...prev,
            selectedInterests: prev.selectedInterests.includes(interest)
                ? prev.selectedInterests.filter(i => i !== interest)
                : [...prev.selectedInterests, interest]
        }));
    };

    const showPicker = (title, options, currentValue, onSelect) => {
        console.log('🔍 ShowPicker called:', { title, optionsCount: options.length, currentValue });
        setPickerData({
            title,
            options,
            currentValue,
            onSelect
        });
        setSearchQuery('');
        setPickerVisible(true);
    };

    const handlePickerSelect = (option) => {
        console.log('✅ Option selected:', option);
        pickerData.onSelect(option);
        setPickerVisible(false);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            showCustomAlert('Permission needed', 'Please grant camera roll permissions to upload photos.', [{ text: 'OK' }], 'warning');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setUploadingPhoto(true);
            try {
                const response = await ApiService.uploadPhoto(result.assets[0].uri);
                if (response.success) {
                    setPhotos(prev => [...prev, response.data.photo]);
                }
            } catch (error) {
                console.error('Error uploading photo:', error);
                const errorMessage = error.message || 'Failed to upload photo';
                showCustomAlert('Upload Error', errorMessage, [{ text: 'OK' }], 'error');
            } finally {
                setUploadingPhoto(false);
            }
        }
    };

    const removePhoto = async (publicId) => {
        try {
            console.log('🗑️ Deleting photo with publicId:', publicId);

            // Show confirmation dialog
            showCustomAlert(
                'Delete Photo',
                'Are you sure you want to delete this photo? This action cannot be undone.',
                [
                    { text: 'Cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                console.log('🔄 Calling API to delete photo...');
                                const response = await ApiService.deletePhoto(publicId);
                                console.log('✅ Delete response:', response);

                                if (response.success) {
                                    setPhotos(prev => prev.filter(photo => photo.publicId !== publicId));
                                    showCustomAlert('Success', 'Photo deleted successfully', [{ text: 'OK' }], 'info');
                                } else {
                                    showCustomAlert('Error', response.message || 'Failed to delete photo', [{ text: 'OK' }], 'error');
                                }
                            } catch (error) {
                                console.error('❌ Error deleting photo:', error);
                                showCustomAlert('Error', error.message || 'Failed to delete photo', [{ text: 'OK' }], 'error');
                            }
                        }
                    }
                ],
                'warning'
            );
        } catch (error) {
            console.error('❌ Error in removePhoto:', error);
            showCustomAlert('Error', 'Failed to delete photo', [{ text: 'OK' }], 'error');
        }
    };

    const setMainPhoto = async (publicId) => {
        try {
            await ApiService.setMainPhoto(publicId);
            setPhotos(prev => prev.map(photo => ({
                ...photo,
                isMain: photo.publicId === publicId
            })));
        } catch (error) {
            console.error('Error setting main photo:', error);
            showCustomAlert('Error', 'Failed to set main photo', [{ text: 'OK' }], 'error');
        }
    };

    const handleSave = async () => {
        if (!profile.name || !profile.bio || !profile.age || !profile.year || !profile.branch ||
            !profile.gender || !profile.preference || !profile.lookingFor) {
            showCustomAlert('Error', 'Please fill in all required fields', [{ text: 'OK' }], 'error');
            return;
        }

        if (profile.branch === 'OTHER' && !profile.customBranch.trim()) {
            showCustomAlert('Error', 'Please enter your branch name', [{ text: 'OK' }], 'error');
            return;
        }

        if (profile.selectedInterests.length < 3) {
            showCustomAlert('Error', 'Please select at least 3 interests', [{ text: 'OK' }], 'error');
            return;
        }

        if (photos.length === 0) {
            showCustomAlert('Error', 'Please upload at least one photo', [{ text: 'OK' }], 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await ApiService.updateProfile({
                name: profile.name,
                bio: profile.bio,
                age: parseInt(profile.age),
                year: profile.year,
                branch: profile.branch === 'OTHER' ? profile.customBranch : profile.branch,
                gender: profile.gender,
                preference: profile.preference,
                lookingFor: profile.lookingFor,
                interests: profile.selectedInterests,
                college: profile.college.trim(),
                instagram: {
                    username: profile.instagramUsername.trim(),
                    isPublic: profile.instagramIsPublic
                }
            });

            if (response.success) {
                updateUser(response.data.user);
                setShowSuccessModal(true);
            } else {
                showCustomAlert('Error', response.message || 'Failed to update profile', [{ text: 'OK' }], 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showCustomAlert('Error', 'Network error. Please try again.', [{ text: 'OK' }], 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loadingProfile) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.emoji}>⏳</Text>
                <Text style={[styles.title, { color: colors.text }]}>Loading Profile...</Text>
                <Text style={[styles.subtitle, { color: colors.icon }]}>
                    Getting your information ready
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 50 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {/* Navigation Header */}
                        <View style={styles.navHeader}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <View style={{ width: 24 }} />
                            <View style={{ width: 24 }} />
                        </View>

                        <View style={styles.header}>
                            <Text style={styles.emoji}>✨</Text>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {user ? 'Edit Your Profile' : 'Setup Your Profile'}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.icon }]}>
                                {user ? 'Update your information and photos' : 'Tell us about yourself to find better matches'}
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>Photos (Required)</Text>
                                <View style={styles.photosContainer}>
                                    {photos.map((photo, index) => (
                                        <View key={photo.publicId || index} style={styles.photoItem}>
                                            <Image source={{ uri: photo.url || photo }} style={styles.photoPreview} />

                                            {/* Delete Photo Button */}
                                            <TouchableOpacity
                                                style={[styles.removePhotoButton, { backgroundColor: colors.error }]}
                                                onPress={() => {
                                                    console.log('🖼️ Photo object:', photo);
                                                    console.log('🆔 PublicId:', photo.publicId);
                                                    if (photo.publicId) {
                                                        removePhoto(photo.publicId);
                                                    } else {
                                                        showCustomAlert('Error', 'Cannot delete photo: No publicId found', [{ text: 'OK' }], 'error');
                                                    }
                                                }}
                                            >
                                                <Ionicons name="close" size={16} color="white" />
                                            </TouchableOpacity>

                                            {/* Set as Main Button */}
                                            {!photo.isMain && (
                                                <TouchableOpacity
                                                    style={[styles.setMainButton, { backgroundColor: colors.primary }]}
                                                    onPress={() => setMainPhoto(photo.publicId)}
                                                >
                                                    <Ionicons name="star" size={12} color="white" />
                                                </TouchableOpacity>
                                            )}

                                            {/* Main Photo Badge */}
                                            {photo.isMain && (
                                                <View style={[styles.mainPhotoBadge, { backgroundColor: colors.primary }]}>
                                                    <Text style={styles.mainPhotoText}>Main</Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}

                                    {photos.length < 6 && (
                                        <TouchableOpacity
                                            style={[styles.addPhotoButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                            onPress={pickImage}
                                            disabled={uploadingPhoto}
                                        >
                                            <Ionicons
                                                name={uploadingPhoto ? "hourglass" : "camera"}
                                                size={32}
                                                color={colors.primary}
                                            />
                                            <Text style={[styles.addPhotoText, { color: colors.text }]}>
                                                {uploadingPhoto ? 'Uploading...' : 'Add Photo'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>Name</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            color: colors.text,
                                        },
                                    ]}
                                    placeholder="Enter your full name"
                                    placeholderTextColor={colors.icon}
                                    value={profile.name}
                                    onChangeText={(value) => setProfile(prev => ({ ...prev, name: value }))}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
                                <TextInput
                                    style={[
                                        styles.textArea,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            color: colors.text,
                                        },
                                    ]}
                                    placeholder="Tell us about yourself..."
                                    placeholderTextColor={colors.icon}
                                    value={profile.bio}
                                    onChangeText={(value) => setProfile(prev => ({ ...prev, bio: value }))}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>College Name</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            color: colors.text,
                                        },
                                    ]}
                                    placeholder="Enter your college name"
                                    placeholderTextColor={colors.icon}
                                    value={profile.college}
                                    onChangeText={(value) => setProfile(prev => ({ ...prev, college: value }))}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>Age</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: colors.border,
                                                color: colors.text,
                                            },
                                        ]}
                                        placeholder="18"
                                        placeholderTextColor={colors.icon}
                                        value={profile.age}
                                        onChangeText={(value) => setProfile(prev => ({ ...prev, age: value }))}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>Year</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: colors.border,
                                                justifyContent: 'center',
                                            },
                                        ]}
                                        onPress={() => showPicker(
                                            'Select Year',
                                            years.map(y => y.label),
                                            years.find(y => y.value === profile.year)?.label || '',
                                            (yearLabel) => {
                                                const yearObj = years.find(y => y.label === yearLabel);
                                                setProfile(prev => ({ ...prev, year: yearObj?.value || '' }));
                                            }
                                        )}
                                    >
                                        <Text style={[{ color: profile.year ? colors.text : colors.icon }]}>
                                            {years.find(y => y.value === profile.year)?.label || 'Select Year'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>Branch/Major</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            justifyContent: 'center',
                                        },
                                    ]}
                                    onPress={() => showPicker(
                                        'Select Branch',
                                        branches.map(b => b.label),
                                        branches.find(b => b.value === profile.branch)?.label || '',
                                        (branchLabel) => {
                                            const branchObj = branches.find(b => b.label === branchLabel);
                                            setProfile(prev => ({
                                                ...prev,
                                                branch: branchObj?.value || '',
                                                customBranch: branchObj?.value === 'OTHER' ? prev.customBranch : ''
                                            }));
                                        }
                                    )}
                                >
                                    <Text style={[{ color: profile.branch ? colors.text : colors.icon }]}>
                                        {branches.find(b => b.value === profile.branch)?.label || 'Select Branch'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {profile.branch === 'OTHER' && (
                                <View style={styles.inputContainer}>
                                    <Text style={[styles.label, { color: colors.text }]}>Enter Your Branch</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: colors.border,
                                                color: colors.text,
                                            },
                                        ]}
                                        placeholder="e.g., Biotechnology, Architecture, etc."
                                        placeholderTextColor={colors.icon}
                                        value={profile.customBranch}
                                        onChangeText={(value) => setProfile(prev => ({ ...prev, customBranch: value }))}
                                    />
                                </View>
                            )}

                            <View style={styles.row}>
                                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: colors.border,
                                                justifyContent: 'center',
                                            },
                                        ]}
                                        onPress={() => showPicker(
                                            'Select Gender',
                                            ['Male', 'Female', 'Non-binary', 'Other'],
                                            profile.gender,
                                            (gender) => setProfile(prev => ({ ...prev, gender }))
                                        )}
                                    >
                                        <Text style={[{ color: profile.gender ? colors.text : colors.icon }]}>
                                            {profile.gender || 'Select Gender'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>Preference</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: colors.border,
                                                justifyContent: 'center',
                                            },
                                        ]}
                                        onPress={() => showPicker(
                                            'Select Preference',
                                            ['Male', 'Female', 'Both'],
                                            profile.preference,
                                            (preference) => setProfile(prev => ({ ...prev, preference }))
                                        )}
                                    >
                                        <Text style={[{ color: profile.preference ? colors.text : colors.icon }]}>
                                            {profile.preference || 'Select Preference'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>Looking For</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            justifyContent: 'center',
                                        },
                                    ]}
                                    onPress={() => showPicker(
                                        'What are you looking for?',
                                        ['Relationship', 'Friendship', 'Casual', 'Not sure'],
                                        profile.lookingFor,
                                        (lookingFor) => setProfile(prev => ({ ...prev, lookingFor }))
                                    )}
                                >
                                    <Text style={[{ color: profile.lookingFor ? colors.text : colors.icon }]}>
                                        {profile.lookingFor || 'Select what you\'re looking for'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    Interests (Select at least 3)
                                </Text>
                                <View style={styles.interestsContainer}>
                                    {interests.map(interest => (
                                        <TouchableOpacity
                                            key={interest}
                                            style={[
                                                styles.interestTag,
                                                {
                                                    backgroundColor: profile.selectedInterests.includes(interest)
                                                        ? colors.primary
                                                        : colors.surface,
                                                    borderColor: colors.border,
                                                },
                                            ]}
                                            onPress={() => handleInterestToggle(interest)}
                                        >
                                            <Text
                                                style={[
                                                    styles.interestText,
                                                    {
                                                        color: profile.selectedInterests.includes(interest)
                                                            ? 'white'
                                                            : colors.text,
                                                    },
                                                ]}
                                            >
                                                {interest}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Instagram Section */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, { color: colors.text }]}>Instagram (Optional)</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                            color: colors.text,
                                        },
                                    ]}
                                    placeholder="Instagram username (without @)"
                                    placeholderTextColor={colors.icon}
                                    value={profile.instagramUsername}
                                    onChangeText={(value) => setProfile(prev => ({ ...prev, instagramUsername: value }))}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />

                                {profile.instagramUsername.trim() && (
                                    <View style={styles.instagramPrivacyContainer}>
                                        <View style={styles.privacyToggle}>
                                            <Text style={[styles.privacyLabel, { color: colors.text }]}>
                                                Show Instagram on profile
                                            </Text>
                                            <TouchableOpacity
                                                style={[
                                                    styles.toggleButton,
                                                    {
                                                        backgroundColor: profile.instagramIsPublic ? colors.primary : colors.border,
                                                    },
                                                ]}
                                                onPress={() => setProfile(prev => ({ ...prev, instagramIsPublic: !prev.instagramIsPublic }))}
                                            >
                                                <View
                                                    style={[
                                                        styles.toggleThumb,
                                                        {
                                                            backgroundColor: 'white',
                                                            transform: [{ translateX: profile.instagramIsPublic ? 20 : 2 }],
                                                        },
                                                    ]}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={[styles.privacyDescription, { color: colors.icon }]}>
                                            {profile.instagramIsPublic
                                                ? 'Your Instagram will be visible to other users'
                                                : 'Your Instagram will be private (only you can see it)'}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    { backgroundColor: colors.primary },
                                    loading && styles.disabledButton,
                                ]}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                <Text style={styles.saveButtonText}>
                                    {loading ? 'Saving...' : (user ? 'Update Profile' : 'Complete Setup')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Custom Modal Picker */}
                    <Modal
                        visible={pickerVisible}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setPickerVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <TouchableOpacity
                                style={styles.modalBackdrop}
                                activeOpacity={1}
                                onPress={() => setPickerVisible(false)}
                            />
                            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                                {/* Header */}
                                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                                        {pickerData.title}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setPickerVisible(false)}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={24} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                {/* Search for branches */}
                                {pickerData.title.includes('Branch') && (
                                    <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
                                        <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
                                        <TextInput
                                            style={[styles.searchInput, {
                                                backgroundColor: colors.surface,
                                                color: colors.text,
                                                borderColor: colors.border
                                            }]}
                                            placeholder="Search branches..."
                                            placeholderTextColor={colors.icon}
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                        />
                                    </View>
                                )}

                                {/* Debug Info */}
                                <Text style={[{ color: colors.text, padding: 10, fontSize: 12 }]}>
                                    Options: {pickerData.options.length} items
                                </Text>

                                {/* Options List */}
                                <FlatList
                                    data={pickerData.options.filter(option =>
                                        option.toLowerCase().includes(searchQuery.toLowerCase())
                                    )}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={styles.optionsList}
                                    showsVerticalScrollIndicator={true}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.optionItem,
                                                {
                                                    backgroundColor: item === pickerData.currentValue
                                                        ? colors.primary + '20'
                                                        : 'transparent',
                                                    borderBottomColor: colors.border
                                                }
                                            ]}
                                            onPress={() => handlePickerSelect(item)}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                {
                                                    color: item === pickerData.currentValue
                                                        ? colors.primary
                                                        : colors.text
                                                }
                                            ]}>
                                                {item}
                                            </Text>
                                            {item === pickerData.currentValue && (
                                                <Ionicons name="checkmark" size={20} color={colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </View>
                    </Modal>
                </ScrollView>

                {/* Success Modal */}
                <SuccessModal
                    visible={showSuccessModal}
                    onClose={() => {
                        setShowSuccessModal(false);
                        router.replace('/(tabs)');
                    }}
                    title="Success!"
                    message={user ? 'Profile updated successfully!' : 'Profile setup complete!'}
                    buttonText="Continue"
                />

                {/* Alert Modal */}
                <AlertModal
                    visible={showAlertModal}
                    onClose={() => setShowAlertModal(false)}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                    buttons={alertConfig.buttons}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    navHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    header: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    emoji: {
        fontSize: 50,
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    textArea: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
        height: 100,
        textAlignVertical: 'top',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    interestTag: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 5,
    },
    interestText: {
        fontSize: 14,
        fontWeight: '500',
    },
    saveButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    photosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    photoItem: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    photoPreview: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    removePhotoButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    setMainButton: {
        position: 'absolute',
        top: -8,
        left: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainPhotoBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    mainPhotoText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    addPhotoButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    instagramPrivacyContainer: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(123, 44, 191, 0.1)',
    },
    privacyToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    privacyLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    toggleButton: {
        width: 44,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        position: 'relative',
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        position: 'absolute',
    },
    privacyDescription: {
        fontSize: 12,
        lineHeight: 16,
    },
    addPhotoText: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    // Modal Picker Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: '50%',
        maxHeight: '80%',
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    optionsList: {
        maxHeight: 350,
        minHeight: 150,
        flex: 0,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    optionText: {
        fontSize: 16,
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
    },
});
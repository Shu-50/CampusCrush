import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const interests = [
    'Music', 'Sports', 'Movies', 'Books', 'Travel', 'Food', 'Art', 'Gaming',
    'Photography', 'Dancing', 'Fitness', 'Technology', 'Fashion', 'Nature'
];

const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const branches = [
    'Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts',
    'Science', 'Law', 'Education', 'Psychology', 'Other'
];

export default function ProfileSetupScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { updateUser } = useAuth();

    const [profile, setProfile] = useState({
        bio: '',
        age: '',
        year: '',
        branch: '',
        gender: '',
        preference: '',
        selectedInterests: [],
    });
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const handleInterestToggle = (interest) => {
        setProfile(prev => ({
            ...prev,
            selectedInterests: prev.selectedInterests.includes(interest)
                ? prev.selectedInterests.filter(i => i !== interest)
                : [...prev.selectedInterests, interest]
        }));
    };

    const showPicker = (title, options, currentValue, onSelect) => {
        Alert.alert(
            title,
            '',
            options.map(option => ({
                text: option,
                onPress: () => onSelect(option)
            })).concat([{ text: 'Cancel', style: 'cancel' }])
        );
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
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
                Alert.alert('Error', 'Failed to upload photo');
            } finally {
                setUploadingPhoto(false);
            }
        }
    };

    const removePhoto = async (publicId) => {
        try {
            await ApiService.deletePhoto(publicId);
            setPhotos(prev => prev.filter(photo => photo.publicId !== publicId));
        } catch (error) {
            console.error('Error deleting photo:', error);
            Alert.alert('Error', 'Failed to delete photo');
        }
    };

    const handleSave = async () => {
        if (!profile.bio || !profile.age || !profile.year || !profile.branch ||
            !profile.gender || !profile.preference) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (profile.selectedInterests.length < 3) {
            Alert.alert('Error', 'Please select at least 3 interests');
            return;
        }

        if (photos.length === 0) {
            Alert.alert('Error', 'Please upload at least one photo');
            return;
        }

        setLoading(true);

        try {
            const response = await ApiService.updateProfile({
                ...profile,
                age: parseInt(profile.age),
            });

            if (response.success) {
                updateUser(response.data.user);
                Alert.alert(
                    'Success',
                    'Profile setup complete!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/(tabs)'),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.emoji}>✨</Text>
                    <Text style={[styles.title, { color: colors.text }]}>Setup Your Profile</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        Tell us about yourself to find better matches
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.text }]}>Photos (Required)</Text>
                        <View style={styles.photosContainer}>
                            {photos.map((photo, index) => (
                                <View key={photo.publicId} style={styles.photoItem}>
                                    <Image source={{ uri: photo.url }} style={styles.photoPreview} />
                                    <TouchableOpacity
                                        style={[styles.removePhotoButton, { backgroundColor: colors.error }]}
                                        onPress={() => removePhoto(photo.publicId)}
                                    >
                                        <Ionicons name="close" size={16} color="white" />
                                    </TouchableOpacity>
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
                                    years,
                                    profile.year,
                                    (year) => setProfile(prev => ({ ...prev, year }))
                                )}
                            >
                                <Text style={[{ color: profile.year ? colors.text : colors.icon }]}>
                                    {profile.year || 'Select Year'}
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
                                branches,
                                profile.branch,
                                (branch) => setProfile(prev => ({ ...prev, branch }))
                            )}
                        >
                            <Text style={[{ color: profile.branch ? colors.text : colors.icon }]}>
                                {profile.branch || 'Select Branch'}
                            </Text>
                        </TouchableOpacity>
                    </View>

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
                                    ['Male', 'Female', 'Other'],
                                    profile.gender,
                                    (gender) => setProfile(prev => ({ ...prev, gender: gender.toLowerCase() }))
                                )}
                            >
                                <Text style={[{ color: profile.gender ? colors.text : colors.icon }]}>
                                    {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Select Gender'}
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
                                    (preference) => setProfile(prev => ({ ...prev, preference: preference.toLowerCase() }))
                                )}
                            >
                                <Text style={[{ color: profile.preference ? colors.text : colors.icon }]}>
                                    {profile.preference ? profile.preference.charAt(0).toUpperCase() + profile.preference.slice(1) : 'Select Preference'}
                                </Text>
                            </TouchableOpacity>
                        </View>
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
                            {loading ? 'Saving...' : 'Complete Setup'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
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
    header: {
        alignItems: 'center',
        marginTop: 20,
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
    addPhotoText: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
});
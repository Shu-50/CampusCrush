import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [selfiePhoto, setSelfiePhoto] = useState(null);
    const [collegeIdPhoto, setCollegeIdPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const captureSelfie = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera permissions to take selfie.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setSelfiePhoto(result.assets[0].uri);
        }
    };

    const uploadCollegeId = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant gallery permissions to upload college ID.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setCollegeIdPhoto(result.assets[0].uri);
        }
    };

    const handleSignup = async () => {
        const { name, email, password, confirmPassword } = formData;

        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!selfiePhoto) {
            Alert.alert('Error', 'Please capture your selfie');
            return;
        }

        if (!collegeIdPhoto) {
            Alert.alert('Error', 'Please upload your college ID');
            return;
        }

        if (!email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const result = await register({ name, email, password, selfiePhoto, collegeIdPhoto });
            if (result.success) {
                // Redirect to email verification screen
                router.replace({
                    pathname: '/auth/verify-email',
                    params: { email: email }
                });
            } else {
                Alert.alert('Registration Failed', result.message || 'Failed to create account');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <Text style={styles.emoji}>💕</Text>
                        <Text style={[styles.title, { color: colors.text }]}>Join Campus Crush</Text>
                        <Text style={[styles.subtitle, { color: colors.icon }]}>
                            Create your account to get started
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Selfie (Required)</Text>
                            <Text style={[styles.helperText, { color: colors.icon }]}>
                                Take a selfie using camera
                            </Text>
                            {selfiePhoto ? (
                                <View style={styles.photoContainer}>
                                    <Image source={{ uri: selfiePhoto }} style={styles.photoPreview} />
                                    <TouchableOpacity
                                        style={[styles.retakeButton, { backgroundColor: colors.primary }]}
                                        onPress={captureSelfie}
                                    >
                                        <Ionicons name="camera" size={20} color="white" />
                                        <Text style={styles.retakeButtonText}>Retake Selfie</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.captureButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={captureSelfie}
                                >
                                    <Ionicons name="camera" size={40} color={colors.primary} />
                                    <Text style={[styles.captureButtonText, { color: colors.text }]}>
                                        Capture Selfie
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
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
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                        color: colors.text,
                                    },
                                ]}
                                placeholder="your.email@example.com"
                                placeholderTextColor={colors.icon}
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>College ID (Required)</Text>
                            <Text style={[styles.helperText, { color: colors.icon }]}>
                                Upload a photo of your college ID
                            </Text>
                            {collegeIdPhoto ? (
                                <View style={styles.photoContainer}>
                                    <Image source={{ uri: collegeIdPhoto }} style={styles.photoPreview} />
                                    <TouchableOpacity
                                        style={[styles.retakeButton, { backgroundColor: colors.primary }]}
                                        onPress={uploadCollegeId}
                                    >
                                        <Ionicons name="images" size={20} color="white" />
                                        <Text style={styles.retakeButtonText}>Change Photo</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.captureButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={uploadCollegeId}
                                >
                                    <Ionicons name="images" size={40} color={colors.primary} />
                                    <Text style={[styles.captureButtonText, { color: colors.text }]}>
                                        Upload College ID
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                        color: colors.text,
                                    },
                                ]}
                                placeholder="Create a password"
                                placeholderTextColor={colors.icon}
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                        color: colors.text,
                                    },
                                ]}
                                placeholder="Confirm your password"
                                placeholderTextColor={colors.icon}
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.signupButton,
                                { backgroundColor: colors.primary },
                                loading && styles.disabledButton,
                            ]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            <Text style={styles.signupButtonText}>
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={[styles.loginText, { color: colors.icon }]}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <Text style={[styles.loginLink, { color: colors.primary }]}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 30,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        flex: 1,
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
    signupButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    signupButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: '600',
    },
    helperText: {
        fontSize: 12,
        marginBottom: 10,
        fontStyle: 'italic',
    },
    photoContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 10,
    },
    captureButton: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButtonText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 10,
        textAlign: 'center',
    },
    retakeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        gap: 8,
    },
    retakeButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});
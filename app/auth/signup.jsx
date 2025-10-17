import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
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
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSignup = async () => {
        const { name, email, password, confirmPassword } = formData;

        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!email.includes('@') || !email.includes('.edu')) {
            Alert.alert('Error', 'Please use your college email address');
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
            const result = await register({ name, email, password });
            if (result.success) {
                Alert.alert(
                    'Success',
                    'Account created! Please complete your profile.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.push('/profile-setup'),
                        },
                    ]
                );
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
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
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
                        <Text style={[styles.label, { color: colors.text }]}>College Email</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    color: colors.text,
                                },
                            ]}
                            placeholder="your.email@college.edu"
                            placeholderTextColor={colors.icon}
                            value={formData.email}
                            onChangeText={(value) => handleInputChange('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
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
});
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        if (!email.includes('@') || !email.includes('.edu')) {
            Alert.alert('Error', 'Please use your college email address');
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                'Success',
                'Password reset instructions have been sent to your email.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.emoji}>🔐</Text>
                    <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        Enter your college email address and we'll send you instructions to reset your password.
                    </Text>
                </View>

                <View style={styles.form}>
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
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.resetButton,
                            { backgroundColor: colors.primary },
                            loading && styles.disabledButton,
                        ]}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        <Text style={styles.resetButtonText}>
                            {loading ? 'Sending...' : 'Send Reset Instructions'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={[styles.backButtonText, { color: colors.primary }]}>
                            Back to Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 30,
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
    resetButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    resetButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import ApiService from '../../services/api';

export default function VerifyEmailScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { email } = useLocalSearchParams();

    const [loading, setLoading] = useState(false);

    const handleResendEmail = async () => {
        if (!email) {
            Alert.alert('Error', 'Email address not found');
            return;
        }

        setLoading(true);

        try {
            const response = await ApiService.resendVerificationEmail(email);
            if (response.success) {
                Alert.alert('Success', 'Verification email sent! Please check your inbox.');
            } else {
                Alert.alert('Error', response.message || 'Failed to send verification email');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="mail" size={60} color={colors.primary} />
                    </View>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    Verify Your Email
                </Text>

                <Text style={[styles.subtitle, { color: colors.icon }]}>
                    We've sent a verification email to:
                </Text>

                <Text style={[styles.email, { color: colors.primary }]}>
                    {email}
                </Text>

                <Text style={[styles.description, { color: colors.icon }]}>
                    Please check your inbox and click the verification link to activate your account.
                </Text>

                <View style={styles.tipsContainer}>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={[styles.tipText, { color: colors.text }]}>
                            Check your spam folder if you don't see it
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={[styles.tipText, { color: colors.text }]}>
                            The link will expire in 24 hours
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={[styles.tipText, { color: colors.text }]}>
                            You can still use the app while unverified
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.resendButton,
                        { backgroundColor: colors.primary },
                        loading && styles.disabledButton,
                    ]}
                    onPress={handleResendEmail}
                    disabled={loading}
                >
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text style={styles.resendButtonText}>
                        {loading ? 'Sending...' : 'Resend Verification Email'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => router.replace('/profile-setup')}
                >
                    <Text style={[styles.continueButtonText, { color: colors.primary }]}>
                        Continue to Profile Setup
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 30,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    email: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    tipsContainer: {
        width: '100%',
        marginBottom: 30,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingLeft: 10,
    },
    tipText: {
        fontSize: 14,
        marginLeft: 10,
        flex: 1,
    },
    resendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '100%',
        marginBottom: 15,
        gap: 8,
    },
    resendButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    continueButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
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

export default function LoginScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const result = await login({ email, password });
            if (result.success) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('Login Failed', result.message || 'Invalid credentials');
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
                        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: colors.icon }]}>
                            Sign in to your account
                        </Text>
                    </View>

                    <View style={styles.form}>
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
                                value={email}
                                onChangeText={setEmail}
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
                                placeholder="Enter your password"
                                placeholderTextColor={colors.icon}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => router.push('/auth/forgot-password')}
                        >
                            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                { backgroundColor: colors.primary },
                                loading && styles.disabledButton,
                            ]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.loginButtonText}>
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.signupContainer}>
                            <Text style={[styles.signupText, { color: colors.icon }]}>
                                Don't have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                                <Text style={[styles.signupLink, { color: colors.primary }]}>
                                    Sign Up
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
        marginTop: 60,
        marginBottom: 40,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 30,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: 14,
    },
    signupLink: {
        fontSize: 14,
        fontWeight: '600',
    },
});
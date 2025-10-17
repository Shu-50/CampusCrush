import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.header}
            >
                <Text style={styles.logo}>💕</Text>
                <Text style={styles.title}>Campus Crush</Text>
                <Text style={styles.subtitle}>Connect with your campus community</Text>
            </LinearGradient>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/auth/login')}
                >
                    <Text style={styles.primaryButtonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.secondaryButton,
                        { borderColor: colors.primary, backgroundColor: colors.background },
                    ]}
                    onPress={() => router.push('/auth/signup')}
                >
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                        Sign Up
                    </Text>
                </TouchableOpacity>

                <Text style={[styles.termsText, { color: colors.icon }]}>
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    buttonContainer: {
        flex: 0.4,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    primaryButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 30,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    termsText: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});
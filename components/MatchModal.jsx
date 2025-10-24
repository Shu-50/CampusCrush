import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    Dimensions,
    Animated,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function MatchModal({ visible, onClose, onSendMessage, matchedUser, currentUser }) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    if (!matchedUser) return null;

    // Get main photos for both users
    const matchedUserPhoto = matchedUser.photos?.[0]?.url || matchedUser.photos?.[0] || 'https://via.placeholder.com/120x120/CCCCCC/FFFFFF?text=User';
    const currentUserPhoto = currentUser?.photos?.[0]?.url || currentUser?.photos?.[0] || 'https://via.placeholder.com/120x120/CCCCCC/FFFFFF?text=You';

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.matchEmoji}>💕</Text>
                        <Text style={[styles.title, { color: colors.text }]}>
                            It's a Match!
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.icon }]}>
                            You and {matchedUser.name} liked each other
                        </Text>
                    </View>

                    {/* Profile Images */}
                    <View style={styles.profilesContainer}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{ uri: matchedUserPhoto }}
                                style={[styles.profileImage, styles.leftImage]}
                                defaultSource={{ uri: 'https://via.placeholder.com/120x120/CCCCCC/FFFFFF?text=User' }}
                            />
                            <Text style={[styles.userName, { color: colors.text }]}>
                                {matchedUser.name}
                            </Text>
                        </View>

                        <View style={styles.heartContainer}>
                            <View style={[styles.heartBackground, { backgroundColor: colors.primary }]}>
                                <Ionicons name="heart" size={30} color="white" />
                            </View>
                        </View>

                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{ uri: currentUserPhoto }}
                                style={[styles.profileImage, styles.rightImage]}
                                defaultSource={{ uri: 'https://via.placeholder.com/120x120/CCCCCC/FFFFFF?text=You' }}
                            />
                            <Text style={[styles.userName, { color: colors.text }]}>
                                You
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton, { backgroundColor: colors.surface }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, styles.secondaryButtonText, { color: colors.text }]}>
                                Keep Swiping
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
                            onPress={onSendMessage}
                        >
                            <Ionicons name="chatbubble" size={18} color="white" style={styles.buttonIcon} />
                            <Text style={[styles.buttonText, styles.primaryButtonText]}>
                                Send Message
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: width * 0.9,
        maxWidth: 400,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    matchEmoji: {
        fontSize: 60,
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    profilesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        width: '100%',
    },
    profileImageContainer: {
        flex: 1,
        alignItems: 'center',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'white',
    },
    leftImage: {
        marginRight: -10,
        zIndex: 1,
    },
    rightImage: {
        marginLeft: -10,
        zIndex: 1,
    },
    heartContainer: {
        zIndex: 2,
        marginHorizontal: 10,
    },
    heartBackground: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonsContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        minHeight: 56,
    },
    primaryButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    secondaryButton: {
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButtonText: {
        color: 'white',
    },
    secondaryButtonText: {
        // Color set dynamically
    },
});
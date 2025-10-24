import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LogoutModal({ visible, onClose, onConfirm }) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
                        <Ionicons name="log-out-outline" size={32} color={colors.error} />
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Logout
                        </Text>
                        <Text style={[styles.message, { color: colors.icon }]}>
                            Are you sure you want to logout? You'll need to sign in again to access your account.
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { backgroundColor: colors.surface }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.logoutButton, { backgroundColor: colors.error }]}
                            onPress={onConfirm}
                        >
                            <Ionicons name="log-out" size={18} color="white" style={styles.buttonIcon} />
                            <Text style={[styles.buttonText, styles.logoutButtonText]}>
                                Logout
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: width * 0.85,
        maxWidth: 380,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    content: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    buttonsContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        minHeight: 50,
    },
    cancelButton: {
        borderWidth: 1.5,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    logoutButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonIcon: {
        marginRight: 6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButtonText: {
        color: 'white',
    },
});
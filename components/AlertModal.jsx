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

export default function AlertModal({
    visible,
    onClose,
    title,
    message,
    type = 'info', // 'info', 'warning', 'error'
    buttons = [{ text: 'OK', onPress: null }]
}) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const getIconAndColor = () => {
        switch (type) {
            case 'error':
                return { icon: 'close-circle', color: colors.error };
            case 'warning':
                return { icon: 'warning', color: colors.warning };
            default:
                return { icon: 'information-circle', color: colors.primary };
        }
    };

    const { icon, color } = getIconAndColor();

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
                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon} size={40} color={color} />
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {title}
                        </Text>
                        <Text style={[styles.message, { color: colors.icon }]}>
                            {message}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonsContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    buttons.length === 1 ? styles.singleButton : styles.multiButton,
                                    button.style === 'destructive'
                                        ? { backgroundColor: colors.error }
                                        : index === buttons.length - 1
                                            ? { backgroundColor: color }
                                            : { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border }
                                ]}
                                onPress={() => {
                                    if (button.onPress) {
                                        button.onPress();
                                    } else {
                                        onClose();
                                    }
                                }}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    (button.style === 'destructive' || index === buttons.length - 1) && buttons.length > 1
                                        ? { color: 'white' }
                                        : buttons.length === 1
                                            ? { color: 'white' }
                                            : { color: colors.text }
                                ]}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
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
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
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
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    singleButton: {
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    multiButton: {
        flex: 1,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../services/api';

const categories = [
    { id: 'crush', name: 'Crush', icon: 'heart', description: 'Share your crush stories' },
    { id: 'academic', name: 'Academic', icon: 'school', description: 'Studies, exams, college life' },
    { id: 'funny', name: 'Funny', icon: 'happy', description: 'Funny moments and jokes' },
    { id: 'support', name: 'Support', icon: 'people', description: 'Need advice or support' },
    { id: 'general', name: 'General', icon: 'chatbubble', description: 'Anything else' },
];

export default function CreateConfessionScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.5));

    const handleSubmit = async () => {
        if (!content.trim()) {
            Alert.alert('Error', 'Please write your confession before submitting.');
            return;
        }

        if (content.length < 3) {
            Alert.alert('Error', 'Your confession is too short. Please write at least 3 characters.');
            return;
        }

        if (content.length > 1000) {
            Alert.alert('Error', 'Your confession is too long. Please keep it under 1000 characters.');
            return;
        }

        try {
            setIsSubmitting(true);
            console.log('📝 Creating confession...');

            const response = await ApiService.createConfession(content.trim(), selectedCategory);

            if (response.success) {
                // Show success modal with animation
                setShowSuccessModal(true);
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        tension: 50,
                        friction: 7,
                        useNativeDriver: true,
                    }),
                ]).start();

                // Auto close after 2 seconds
                setTimeout(() => {
                    handleCloseSuccessModal();
                }, 2000);
            } else {
                Alert.alert('Error', response.message || 'Failed to post confession. Please try again.');
            }
        } catch (error) {
            console.error('❌ Error creating confession:', error);
            if (error.message === 'Server error') {
                Alert.alert(
                    'Authentication Required',
                    'Please log in to post confessions.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'Failed to post confession. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccessModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.5,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowSuccessModal(false);
            // Reset form
            setContent('');
            setSelectedCategory('general');
            // Navigate back
            router.back();
        });
    };

    const renderCategoryItem = (category) => (
        <TouchableOpacity
            key={category.id}
            style={[
                styles.categoryItem,
                {
                    backgroundColor: selectedCategory === category.id ? colors.primary : colors.surface,
                    borderColor: selectedCategory === category.id ? colors.primary : colors.border,
                },
            ]}
            onPress={() => setSelectedCategory(category.id)}
        >
            <View style={styles.categoryHeader}>
                <Ionicons
                    name={category.icon}
                    size={20}
                    color={selectedCategory === category.id ? 'white' : colors.text}
                />
                <Text
                    style={[
                        styles.categoryName,
                        { color: selectedCategory === category.id ? 'white' : colors.text },
                    ]}
                >
                    {category.name}
                </Text>
            </View>
            <Text
                style={[
                    styles.categoryDescription,
                    { color: selectedCategory === category.id ? 'rgba(255,255,255,0.8)' : colors.icon },
                ]}
            >
                {category.description}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>New Confession</Text>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: content.trim().length >= 3 && !isSubmitting ? colors.primary : colors.border,
                                opacity: isSubmitting ? 0.7 : 1,
                            },
                        ]}
                        onPress={handleSubmit}
                        disabled={content.trim().length < 3 || isSubmitting}
                    >
                        <Text
                            style={[
                                styles.submitButtonText,
                                { color: content.trim().length >= 3 && !isSubmitting ? 'white' : colors.icon },
                            ]}
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Anonymous Notice */}
                    <View style={[styles.noticeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.noticeHeader}>
                            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                            <Text style={[styles.noticeTitle, { color: colors.text }]}>Anonymous Posting</Text>
                        </View>
                        <Text style={[styles.noticeText, { color: colors.icon }]}>
                            Your confession will be posted anonymously. No one will know it's from you.
                        </Text>
                    </View>

                    {/* Content Input */}
                    <View style={[styles.inputCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>What's on your mind?</Text>
                        <TextInput
                            style={[
                                styles.contentInput,
                                {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                    color: colors.text,
                                },
                            ]}
                            placeholder="Share your thoughts anonymously..."
                            placeholderTextColor={colors.icon}
                            value={content}
                            onChangeText={setContent}
                            multiline
                            maxLength={1000}
                            textAlignVertical="top"
                        />
                        <View style={styles.characterCount}>
                            <Text style={[
                                styles.characterCountText,
                                {
                                    color: content.length < 3 ? colors.error :
                                        content.length > 900 ? colors.warning : colors.icon
                                }
                            ]}>
                                {content.length}/1000 characters
                                {content.length < 3 && content.length > 0 && ' (min 3)'}
                            </Text>
                        </View>
                    </View>

                    {/* Category Selection */}
                    <View style={[styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.categoryLabel, { color: colors.text }]}>Choose a Category</Text>
                        <View style={styles.categoriesGrid}>
                            {categories.map(renderCategoryItem)}
                        </View>
                    </View>

                    {/* Guidelines */}
                    <View style={[styles.guidelinesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.guidelinesTitle, { color: colors.text }]}>Community Guidelines</Text>
                        <View style={styles.guidelinesList}>
                            <Text style={[styles.guidelineItem, { color: colors.icon }]}>
                                • Be respectful and kind to others
                            </Text>
                            <Text style={[styles.guidelineItem, { color: colors.icon }]}>
                                • No hate speech or harassment
                            </Text>
                            <Text style={[styles.guidelineItem, { color: colors.icon }]}>
                                • Keep it appropriate for college community
                            </Text>
                            <Text style={[styles.guidelineItem, { color: colors.icon }]}>
                                • No personal information sharing
                            </Text>
                        </View>
                    </View>

                    {/* Bottom spacing */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="none"
                onRequestClose={handleCloseSuccessModal}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.successModal,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}
                    >
                        <View style={[styles.successIcon, { backgroundColor: colors.primary }]}>
                            <Ionicons name="checkmark" size={40} color="white" />
                        </View>

                        <Text style={[styles.successTitle, { color: colors.text }]}>
                            Confession Posted!
                        </Text>

                        <Text style={[styles.successMessage, { color: colors.icon }]}>
                            Your anonymous confession has been shared with your college community.
                        </Text>

                        <View style={styles.successDetails}>
                            <View style={styles.successDetailItem}>
                                <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                                <Text style={[styles.successDetailText, { color: colors.icon }]}>
                                    Posted anonymously
                                </Text>
                            </View>
                            <View style={styles.successDetailItem}>
                                <Ionicons name="people" size={16} color={colors.primary} />
                                <Text style={[styles.successDetailText, { color: colors.icon }]}>
                                    Visible to your college
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.successButton, { backgroundColor: colors.primary }]}
                            onPress={handleCloseSuccessModal}
                        >
                            <Text style={styles.successButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        marginLeft: 10,
    },
    submitButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    noticeCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    noticeTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    noticeText: {
        fontSize: 14,
        lineHeight: 20,
    },
    inputCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    contentInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 120,
        maxHeight: 200,
    },
    characterCount: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    characterCountText: {
        fontSize: 12,
    },
    categoryCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    categoryLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    categoriesGrid: {
        gap: 12,
    },
    categoryItem: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    categoryDescription: {
        fontSize: 14,
        lineHeight: 18,
    },
    guidelinesCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    guidelinesTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    guidelinesList: {
        gap: 6,
    },
    guidelineItem: {
        fontSize: 14,
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    successModal: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    successDetails: {
        width: '100%',
        marginBottom: 25,
        gap: 8,
    },
    successDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    successDetailText: {
        fontSize: 14,
        fontWeight: '500',
    },
    successButton: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 120,
    },
    successButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
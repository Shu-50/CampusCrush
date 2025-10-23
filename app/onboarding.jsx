import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const onboardingData = [
    {
        id: '1',
        title: 'Share Anonymous Confessions',
        subtitle: 'Express yourself freely with anonymous posts and confessions',
        icon: '🤫',
    },
    {
        id: '2',
        title: 'Find Your Perfect Match',
        subtitle: 'Swipe through profiles and connect with fellow students',
        icon: '💝',
    },
    {
        id: '3',
        title: 'Chat & Connect',
        subtitle: 'Start meaningful conversations with your matches',
        icon: '💬',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const renderOnboardingItem = ({ item }) => (
        <View style={[styles.slide, { width }]}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>{item.subtitle}</Text>
        </View>
    );

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex });
        } else {
            router.replace('/auth');
        }
    };

    const handleSkip = () => {
        router.replace('/auth');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
            </TouchableOpacity>

            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={renderOnboardingItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
            />

            <View style={styles.bottomContainer}>
                <View style={styles.pagination}>
                    {onboardingData.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor:
                                        index === currentIndex ? colors.primary : colors.border,
                                },
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: colors.primary }]}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
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
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        padding: 10,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    icon: {
        fontSize: 100,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    bottomContainer: {
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    nextButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
    },
    nextButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
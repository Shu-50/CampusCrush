import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.7;
const CARD_WIDTH = width * 0.9;

export default function SwipeCard({ profile }) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Image source={{ uri: profile.photos[0] }} style={styles.cardImage} />

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardName, { color: colors.text }]}>
                        {profile.name}, {profile.age}
                    </Text>
                    {profile.isVerified && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                </View>
                <Text style={[styles.cardInfo, { color: colors.icon }]}>
                    {profile.year} • {profile.branch}
                </Text>
                <Text style={[styles.cardDistance, { color: colors.icon }]}>
                    {profile.distance}
                </Text>
                <Text style={[styles.cardBio, { color: colors.text }]} numberOfLines={2}>
                    {profile.bio}
                </Text>
                <View style={styles.interests}>
                    {profile.interests.slice(0, 3).map((interest, idx) => (
                        <View key={idx} style={[styles.interestTag, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.interestText, { color: colors.text }]}>{interest}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardImage: {
        width: '100%',
        height: '60%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    cardContent: {
        flex: 1,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    cardName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    cardInfo: {
        fontSize: 16,
        marginBottom: 5,
    },
    cardDistance: {
        fontSize: 14,
        marginBottom: 10,
    },
    cardBio: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 15,
    },
    interests: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    interestText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
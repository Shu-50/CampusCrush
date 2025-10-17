import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import ApiService from '../services/api';

export default function DebugConnection() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState('');

    const testConnection = async () => {
        setTesting(true);
        setResult('Testing connection...');

        try {
            const result = await ApiService.testConnection();
            if (result.success) {
                setResult('✅ Connection successful!');
                Alert.alert('Success', 'Backend connection is working!');
            } else {
                setResult(`❌ Failed: ${result.error}`);
                Alert.alert('Connection Failed', result.error);
            }
        } catch (error) {
            setResult(`❌ Error: ${error.message}`);
            Alert.alert('Error', error.message);
        } finally {
            setTesting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Debug Connection</Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={testConnection}
                disabled={testing}
            >
                <Text style={styles.buttonText}>
                    {testing ? 'Testing...' : 'Test API Connection'}
                </Text>
            </TouchableOpacity>

            {result ? (
                <Text style={[styles.result, { color: colors.text }]}>{result}</Text>
            ) : null}

            <Text style={[styles.info, { color: colors.icon }]}>
                API: {ApiService.baseURL}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        margin: 15,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    button: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    result: {
        fontSize: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    info: {
        fontSize: 10,
        textAlign: 'center',
    },
});
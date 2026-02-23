import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
    const { status } = useAuth();

    if (status === 'loading' || status === 'idle') {
        return (
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <ActivityIndicator/>
            </View>
        );
    }

    if (status === 'signed-in') {
        return <Redirect href="/(tabs)"/>;
    }

    return <Redirect href="/(auth)/login"/>;
}

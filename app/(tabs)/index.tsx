import React from 'react';
import { Redirect } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HelloWave } from '@/components/hello-wave';
import { useAuth } from '@/providers/AuthProvider';
import { hasRole } from '@/lib/authz';

export default function HomeScreen() {
    const { signOut, user } = useAuth();
    const isMember = hasRole('Member');
    if (isMember) return <Redirect href="/profile"/>;
    return (
        <ThemedView className="flex-1">
            <View style={styles.container}>
                <ThemedText type="title" className="mb-2">
                    Welcome{user ? `, ${user.name ?? user.email}` : ''}! <HelloWave/>
                </ThemedText>
                <ThemedText type="subtitle" className="mb-1">
                    Welcome to our Pentecostal church community
                </ThemedText>
                <ThemedText leading="relaxed" className="mb-6">
                    We’re glad you’re here—may you feel encouraged as we worship, pray, and grow together in Christ.
                </ThemedText>

                <Pressable
                    onPress={signOut}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor: '#ef4444',
                        borderRadius: 8,
                        paddingVertical: 10,
                        alignItems: 'center',
                        width: 120,
                    })}
                >
                    <ThemedText style={{
                        color: 'white',
                        fontWeight: '600'
                    }}>Sign out</ThemedText>
                </Pressable>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});

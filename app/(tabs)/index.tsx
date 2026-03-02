import React from 'react';
import { Redirect } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HelloWave } from '@/components/hello-wave';
import { useAuth } from '@/providers/AuthProvider';
import { hasRole } from '@/lib/authz';

export default function HomeScreen() {
    const {
        signOut,
        user
    } = useAuth();
    const { t } = useTranslation();
    const isMember = hasRole('Member');
    if (isMember) return <Redirect href="/profile"/>;
    return (
        <ThemedView className="flex-1">
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.container}>
                    <ThemedText type="title" className="mb-2">
                        {t('home.welcome', { name: user?.name ?? user?.email ?? '' })} <HelloWave/>
                    </ThemedText>
                    <ThemedText type="subtitle" className="mb-1">
                        {t('home.welcomeMessage')}
                    </ThemedText>
                    <ThemedText leading="relaxed" className="mb-6">
                        {t('home.encouragement')}
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
                        }}>{t('home.signOut')}</ThemedText>
                    </Pressable>
                </View>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
    },
});

import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/providers/AuthProvider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Constants from 'expo-constants';

export default function LoginScreen() {
    const router = useRouter();
    const {
        signIn,
        status
    } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const scheme = useColorScheme() ?? 'light';
    const inputStyles = useMemo(() => ({
        container: {
            borderWidth: 1,
            borderColor: scheme === 'dark' ? '#2A2A2A' : '#ccc',
            borderRadius: 8,
            padding: 12,
            color: Colors[scheme].text,
            backgroundColor: scheme === 'dark' ? '#1F2937' : '#fff',
        } as const,
        placeholderColor: scheme === 'dark' ? '#9CA3AF' : '#6B7280',
        selectionColor: Colors[scheme].tint,
    }), [scheme]);


    async function onSubmit() {
        if (!email || !password) {
            Alert.alert('Missing fields', 'Please enter email and password.');
            return;
        }
        setSubmitting(true);
        try {
            await signIn(email.trim(), password);
            router.replace('/(tabs)');
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Login failed. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    }

    const envVars = {
        EXPO_PUBLIC_GRAPHQL_URL: process.env.EXPO_PUBLIC_GRAPHQL_URL,
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
        EXPO_PUBLIC_AUTH_API_URL: process.env.EXPO_PUBLIC_AUTH_API_URL,
        EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV,
    };

    return (
        <ThemedView className="flex-1">
            <Stack.Screen options={{ title: 'Sign in' }}/>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={{ marginTop: 60 }}>
                        <ThemedText type="title" style={{ marginBottom: 24 }}>Welcome back</ThemedText>

                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            textContentType="username"
                            autoCorrect={false}
                            placeholderTextColor={inputStyles.placeholderColor}
                            selectionColor={inputStyles.selectionColor}
                            style={inputStyles.container as any}
                        />

                        <View style={{ height: 12 }} />

                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            secureTextEntry
                            textContentType="password"
                            placeholderTextColor={inputStyles.placeholderColor}
                            selectionColor={inputStyles.selectionColor}
                            style={inputStyles.container as any}
                        />

                        <View style={{ height: 16 }} />

                        <TouchableOpacity
                            onPress={onSubmit}
                            disabled={submitting || status === 'loading'}
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: '#1e90ff',
                                borderRadius: 8,
                                paddingVertical: 16,
                                paddingHorizontal: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 50,
                            }}
                        >
                            <Text style={{
                                color: '#ffffff',
                                fontWeight: '700',
                                fontSize: 17,
                                textAlign: 'center'
                            }}>
                                {submitting ? 'Signing in…' : 'Sign in'}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ height: 16 }} />

                        <Pressable
                            onPress={() => router.push('/(auth)/register')}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.7 : 1,
                                alignItems: 'center',
                                paddingVertical: 8
                            })}
                        >
                            <ThemedText color="muted">Don't have an account? Create one</ThemedText>
                        </Pressable>

                        {/* Environment Debug Info */}
                        <View style={{
                            marginTop: 24,
                            padding: 12,
                            backgroundColor: scheme === 'dark' ? '#1F2937' : '#F3F4F6',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: scheme === 'dark' ? '#374151' : '#D1D5DB',
                        }}>
                            <ThemedText style={{ fontWeight: '600', marginBottom: 8, fontSize: 12 }}>
                                Environment Variables
                            </ThemedText>
                            {Object.entries(envVars).map(([key, value]) => (
                                <View key={key} style={{ marginBottom: 6 }}>
                                    <ThemedText style={{ fontSize: 10, fontWeight: '600', color: '#6B7280' }}>
                                        {key}
                                    </ThemedText>
                                    <ThemedText style={{ fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                                        {value || '(not set)'}
                                    </ThemedText>
                                </View>
                            ))}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </ThemedView>
    );
}

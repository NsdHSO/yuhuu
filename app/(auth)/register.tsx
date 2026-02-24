import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { authApi } from '@/lib/api';
import { setTokensFromLogin } from '@/lib/tokenManager';

export default function RegisterScreen() {
    const router = useRouter();
    const scheme = useColorScheme() ?? 'light';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [accept, setAccept] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
        if (!email || !password) return Alert.alert('Missing fields', 'Email and password are required.');
        if (password !== confirm) return Alert.alert('Password mismatch', 'Passwords do not match.');
        if (!accept) return Alert.alert('Terms', 'You must accept the terms.');

        setSubmitting(true);
        try {
            const body: any = {
                email: email.trim(),
                password,
                username: email.trim(),
                first_name: firstName || undefined,
                last_name: lastName || undefined,
                terms: true,
            };
            const { data } = await authApi.post<any>('/auth/register', body);
            const at = data?.accessToken ?? data?.access_token ?? data?.token ?? data?.message?.access_token;
            const rt = data?.refreshToken ?? data?.refresh_token ?? data?.message?.refresh_token;

            if (at) await setTokensFromLogin(at, rt);
            Alert.alert('Success', 'Account created.');
            router.replace('/(tabs)');
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'Registration failed. Please try again.';
            Alert.alert('Error', typeof msg === 'string' ? msg : 'Registration failed.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ThemedView className="flex-1">
            <Stack.Screen options={{ title: 'Create account' }}/>


            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={{ marginTop: 20 }}>
                        <ThemedText type="title" style={{ marginBottom: 24 }}>Create your account</ThemedText>

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
                            textContentType="newPassword"
                            placeholderTextColor={inputStyles.placeholderColor}
                            selectionColor={inputStyles.selectionColor}
                            style={inputStyles.container as any}
                        />

                        <View style={{ height: 12 }} />

                        <TextInput
                            value={confirm}
                            onChangeText={setConfirm}
                            placeholder="Confirm password"
                            secureTextEntry
                            textContentType="newPassword"
                            placeholderTextColor={inputStyles.placeholderColor}
                            selectionColor={inputStyles.selectionColor}
                            style={inputStyles.container as any}
                        />

                        <View style={{ height: 12 }} />

                        <TextInput
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="First name (optional)"
                            placeholderTextColor={inputStyles.placeholderColor}
                            selectionColor={inputStyles.selectionColor}
                            style={inputStyles.container as any}
                        />

                        <View style={{ height: 12 }} />

                        <TextInput
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Last name (optional)"
                            placeholderTextColor={inputStyles.placeholderColor}
                            selectionColor={inputStyles.selectionColor}
                            style={inputStyles.container as any}
                        />

                        <View style={{ height: 16 }} />

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <Switch value={accept} onValueChange={setAccept}/>
                            <ThemedText>I accept the terms</ThemedText>
                        </View>

                        <View style={{ height: 16 }} />

                        <TouchableOpacity
                            onPress={onSubmit}
                            disabled={submitting}
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
                                {submitting ? 'Creating…' : 'Create account'}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ height: 16 }} />

                        <Pressable
                            onPress={() => router.replace('/(auth)/login')}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.7 : 1,
                                alignItems: 'center',
                                paddingVertical: 8
                            })}
                        >
                            <ThemedText color="muted">Already have an account? Sign in</ThemedText>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </ThemedView>
    );
}

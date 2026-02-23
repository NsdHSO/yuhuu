import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Switch, TextInput, View } from 'react-native';
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
            <KeyboardAvoidingView behavior={Platform.select({
                ios: 'padding',
                android: undefined
            })} style={{ flex: 1 }}>
                <View style={{
                    flex: 1,
                    padding: 16,
                    gap: 12
                }}>
                    <ThemedText type="title" className="mb-2">Create your account</ThemedText>

                    <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none"
                               keyboardType="email-address" textContentType="username" autoCorrect={false}
                               placeholderTextColor={inputStyles.placeholderColor}
                               selectionColor={inputStyles.selectionColor} style={inputStyles.container as any}/>

                    <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry
                               textContentType="newPassword" placeholderTextColor={inputStyles.placeholderColor}
                               selectionColor={inputStyles.selectionColor} style={inputStyles.container as any}/>

                    <TextInput value={confirm} onChangeText={setConfirm} placeholder="Confirm password" secureTextEntry
                               textContentType="newPassword" placeholderTextColor={inputStyles.placeholderColor}
                               selectionColor={inputStyles.selectionColor} style={inputStyles.container as any}/>

                    <TextInput value={firstName} onChangeText={setFirstName} placeholder="First name (optional)"
                               placeholderTextColor={inputStyles.placeholderColor}
                               selectionColor={inputStyles.selectionColor} style={inputStyles.container as any}/>

                    <TextInput value={lastName} onChangeText={setLastName} placeholder="Last name (optional)"
                               placeholderTextColor={inputStyles.placeholderColor}
                               selectionColor={inputStyles.selectionColor} style={inputStyles.container as any}/>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 4
                    }}>
                        <Switch value={accept} onValueChange={setAccept}/>
                        <ThemedText>I accept the terms</ThemedText>
                    </View>

                    <Pressable onPress={onSubmit} disabled={submitting} style={({ pressed }) => ({
                        opacity: pressed || submitting ? 0.7 : 1,
                        backgroundColor: '#16a34a',
                        borderRadius: 8,
                        paddingVertical: 12,
                        alignItems: 'center',
                        marginTop: 8
                    })}>
                        <ThemedText style={{
                            color: 'white',
                            fontWeight: '600'
                        }}>{submitting ? 'Creating…' : 'Create account'}</ThemedText>
                    </Pressable>

                    <Pressable onPress={() => router.replace('/(auth)/login')} style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        alignItems: 'center',
                        marginTop: 8
                    })}>
                        <ThemedText color="muted">Already have an account? Sign in</ThemedText>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

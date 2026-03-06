import React, {useMemo, useState} from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Stack, useRouter} from 'expo-router';
import {useTranslation} from 'react-i18next';
import {ThemedText, ThemedView, useColorScheme, Colors} from '@yuhuu/components';
import {authApi, setTokensFromLogin} from '@yuhuu/auth';

export default function RegisterScreen() {
    const {t} = useTranslation();
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
        if (!email || !password) return Alert.alert(t('common.missingFields'), t('auth.register.missingFields'));
        if (password !== confirm) return Alert.alert(t('auth.register.passwordMismatchTitle'), t('auth.register.passwordMismatch'));
        if (!accept) return Alert.alert(t('auth.register.termsTitle'), t('auth.register.termsRequired'));

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
            const {data} = await authApi.post<any>('/auth/register', body);
            const at = data?.accessToken ?? data?.access_token ?? data?.token ?? data?.message?.access_token;
            const rt = data?.refreshToken ?? data?.refresh_token ?? data?.message?.refresh_token;

            if (at) await setTokensFromLogin(at, rt);
            Alert.alert(t('common.success'), t('auth.register.success'));
            router.replace('/(auth)/login');
        } catch (e: any) {
            const msg = e?.response?.data?.message || t('auth.register.error');
            Alert.alert(t('common.error'), typeof msg === 'string' ? msg : t('auth.register.errorGeneric'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ThemedView className="flex-1">
            <Stack.Screen options={{title: t('auth.register.title')}}/>

            <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
                <ScrollView
                    style={{flex: 1}}
                    contentContainerStyle={{
                        padding: 16,
                        paddingBottom: 40
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View>
                            <ThemedText type="title"
                                        style={{marginBottom: 24}}>{t('auth.register.createAccount')}</ThemedText>

                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder={t('auth.register.emailPlaceholder')}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                textContentType="username"
                                autoComplete="username-new"
                                importantForAutofill="yes"
                                autoCorrect={false}
                                placeholderTextColor={inputStyles.placeholderColor}
                                selectionColor={inputStyles.selectionColor}
                                style={inputStyles.container as any}
                            />

                            <View style={{height: 12}}/>

                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder={t('auth.register.passwordPlaceholder')}
                                secureTextEntry
                                textContentType="newPassword"
                                autoComplete="password-new"
                                importantForAutofill="yes"
                                placeholderTextColor={inputStyles.placeholderColor}
                                selectionColor={inputStyles.selectionColor}
                                style={inputStyles.container as any}
                            />

                            <View style={{height: 12}}/>

                            <TextInput
                                value={confirm}
                                onChangeText={setConfirm}
                                placeholder={t('auth.register.confirmPassword')}
                                secureTextEntry
                                textContentType="newPassword"
                                autoComplete="password-new"
                                importantForAutofill="yes"
                                placeholderTextColor={inputStyles.placeholderColor}
                                selectionColor={inputStyles.selectionColor}
                                style={inputStyles.container as any}
                            />

                            <View style={{height: 12}}/>

                            <TextInput
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder={t('auth.register.firstNamePlaceholder')}
                                placeholderTextColor={inputStyles.placeholderColor}
                                selectionColor={inputStyles.selectionColor}
                                style={inputStyles.container as any}
                            />

                            <View style={{height: 12}}/>

                            <TextInput
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder={t('auth.register.lastNamePlaceholder')}
                                placeholderTextColor={inputStyles.placeholderColor}
                                selectionColor={inputStyles.selectionColor}
                                style={inputStyles.container as any}
                            />

                            <View style={{height: 16}}/>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                            }}>
                                <Switch value={accept} onValueChange={setAccept}/>
                                <ThemedText>{t('auth.register.acceptTerms')}</ThemedText>
                            </View>

                            <View style={{height: 16}}/>

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
                                    {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
                                </Text>
                            </TouchableOpacity>

                            <View style={{height: 16}}/>

                            <Pressable
                                onPress={() => router.replace('/(auth)/login')}
                                style={({pressed}) => ({
                                    opacity: pressed ? 0.7 : 1,
                                    alignItems: 'center',
                                    paddingVertical: 8
                                })}
                            >
                                <ThemedText lightColor="#6B7280"
                                            darkColor="#9CA3AF">{t('auth.register.hasAccount')}</ThemedText>
                            </Pressable>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/providers/AuthProvider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { getBiometricPreference, isBiometricAvailable } from '@/lib/biometricAuth';
import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const {
        signIn,
        signInWithBiometrics,
        status
    } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [available, enabled] = await Promise.all([
                    isBiometricAvailable(),
                    getBiometricPreference(),
                ]);
                setBiometricAvailable(available && enabled);
            } catch {
                setBiometricAvailable(false);
            }
        })();
    }, []);
    const scheme = useColorScheme() ?? 'light';

    const scrollViewRef = useRef<ScrollView>(null);
    const emailInputRef = useRef<View>(null);
    const passwordInputRef = useRef<View>(null);

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

    const scrollToInput = (inputRef: React.RefObject<View | null>) => {
        if (inputRef.current && scrollViewRef.current) {
            inputRef.current.measureLayout(
                scrollViewRef.current as any,
                (x, y, width, height) => {
                    const inputCenterY = y + height / 2;
                    const screenCenterY = SCREEN_HEIGHT / 2;
                    const scrollToY = inputCenterY - screenCenterY + 100;

                    scrollViewRef.current?.scrollTo({
                        y: Math.max(0, scrollToY),
                        animated: true
                    });
                },
                () => {
                }
            );
        }
    };

    async function handleBiometricLogin() {
        setSubmitting(true);
        try {
            await signInWithBiometrics();
            router.replace('/(tabs)');
        } catch (e: any) {
            const msg = e?.message || t('auth.login.biometricError');
            Alert.alert(t('common.error'), msg);
        } finally {
            setSubmitting(false);
        }
    }

    async function onSubmit() {
        if (!email || !password) {
            Alert.alert(t('common.missingFields'), t('auth.login.missingFields'));
            return;
        }
        setSubmitting(true);
        try {
            await signIn(email.trim(), password);
            router.replace('/(tabs)');
        } catch (e: any) {
            const msg = e?.response?.data?.message || t('auth.login.error');
            Alert.alert(t('common.error'), msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ThemedView className="flex-1">
            <Stack.Screen options={{ title: t('auth.login.title') }}/>
            <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: 40
                }}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={{ marginTop: 60 }}>
                        <ThemedText type="title" style={{ marginBottom: 24 }}>{t('auth.login.welcome')}</ThemedText>

                        <View ref={emailInputRef}>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder={t('auth.login.emailPlaceholder')}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                textContentType="username"
                                autoComplete="username"
                                importantForAutofill="yes"
                                autoCorrect={false}
                                placeholderTextColor={inputStyles.placeholderColor}
                                selectionColor={inputStyles.selectionColor}
                                style={inputStyles.container as any}
                                onFocus={() => scrollToInput(emailInputRef)}
                            />
                        </View>

                        <View style={{ height: 12 }}/>

                        <View ref={passwordInputRef}>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder={t('auth.login.passwordPlaceholder')}
                                secureTextEntry
                                textContentType="password"
                                autoComplete="password"
                                importantForAutofill="yes"
                                placeholderTextColor={inputStyles.placeholderColor}
                                selectionColor={inputStyles.selectionColor}
                                style={inputStyles.container as any}
                                onFocus={() => scrollToInput(passwordInputRef)}
                            />
                        </View>

                        <View style={{ height: 16 }}/>

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
                                {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
                            </Text>
                        </TouchableOpacity>

                        {biometricAvailable && (
                            <>
                                <View
                                    testID="biometric-divider"
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginTop: 16,
                                    }}
                                >
                                    <View style={{
                                        flex: 1,
                                        height: 1,
                                        backgroundColor: scheme === 'dark' ? '#2A2A2A' : '#E5E7EB'
                                    }}/>
                                    <ThemedText
                                        lightColor="#6B7280"
                                        darkColor="#9CA3AF"
                                        style={{
                                            marginHorizontal: 12,
                                            fontSize: 13
                                        }}
                                    >
                                        {t('auth.login.biometricDivider')}
                                    </ThemedText>
                                    <View style={{
                                        flex: 1,
                                        height: 1,
                                        backgroundColor: scheme === 'dark' ? '#2A2A2A' : '#E5E7EB'
                                    }}/>
                                </View>
                                <TouchableOpacity
                                    testID="biometric-login-button"
                                    onPress={handleBiometricLogin}
                                    disabled={submitting || status === 'loading'}
                                    activeOpacity={0.7}
                                    accessibilityLabel={
                                        Platform.OS === 'ios'
                                            ? t('auth.login.biometricAccessibilityLabel')
                                            : t('auth.login.biometricAccessibilityLabelAndroid')
                                    }
                                    accessibilityHint={t('auth.login.biometricAccessibilityHint')}
                                    style={{
                                        marginTop: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: 12,
                                    }}
                                >
                                    <Ionicons
                                        name="finger-print"
                                        size={36}
                                        color={scheme === 'dark' ? '#60A5FA' : '#1e90ff'}
                                    />
                                    <Text style={{
                                        color: scheme === 'dark' ? '#60A5FA' : '#1e90ff',
                                        fontSize: 14,
                                        marginTop: 4,
                                    }}>
                                        {Platform.OS === 'ios'
                                            ? t('auth.login.biometricButton')
                                            : t('auth.login.biometricButtonAndroid')}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <View style={{ height: 16 }}/>

                        <Pressable
                            onPress={() => router.push('/(auth)/register')}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.7 : 1,
                                alignItems: 'center',
                                paddingVertical: 8
                            })}
                        >
                            <ThemedText lightColor="#6B7280" darkColor="#9CA3AF">{t('auth.login.noAccount')}</ThemedText>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </ThemedView>
    );
}

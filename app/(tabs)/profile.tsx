import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    TextInput,
    View
} from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMyProfileQuery, useSaveMyProfileMutation } from '@/features/profile/api';
import { useBootstrapGate } from '@/features/bootstrap/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import {
    authenticateWithBiometrics,
    clearBiometricData,
    getBiometricPreference,
    isBiometricAvailable,
    saveBiometricEmail,
    saveBiometricPreference,
} from '@/lib/biometricAuth';
import { useAuth } from '@/providers/AuthProvider';
import LanguagePicker from '@/components/molecules/language-picker';

export default function ProfileScreen() {
    const { t } = useTranslation();
    // Ensure bootstrap runs; return value not needed here
    useBootstrapGate();
    // Do not issue GET /me/profile; rely on bootstrap seeding the cache.
    const {
        data: profile,
        isLoading,
        error
    } = useMyProfileQuery({ enabled: false });
    const saveMutation = useSaveMyProfileMutation();
    const [firstName, setfirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const { user } = useAuth();
    const scheme = useColorScheme() ?? 'light';

    React.useEffect(() => {
        if (profile) {
            setfirstName(profile.middle_name ?? '');
            setLastName(profile.last_name ?? '');
            setPhone(profile.phone ?? '');
        }
    }, [profile]);

    React.useEffect(() => {
        (async () => {
            try {
                const available = await isBiometricAvailable();
                setBiometricAvailable(available);
                if (available) {
                    const enabled = await getBiometricPreference();
                    setBiometricEnabled(enabled);
                }
            } catch {
                setBiometricAvailable(false);
            }
        })();
    }, []);

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

    function onSave() {
        const payload = {
            middle_name: firstName || null,
            last_name: lastName || null,
            phone: phone || null
        } as any;
        saveMutation.mutate(
            {
                ...payload,
                mode: profile ? 'update' : 'create'
            },
            {
                onSuccess: () => Alert.alert(t('common.success'), t('profile.saveSuccess')),
                onError: (e: any) => {
                    const msg = e?.response?.data?.message || t('profile.saveError');
                    Alert.alert(t('common.error'), msg);
                },
            }
        );
    }

    async function handleBiometricToggle(value: boolean) {
        if (value) {
            try {
                const authenticated = await authenticateWithBiometrics(t('profile.biometricEnableTitle'));
                if (!authenticated) {
                    Alert.alert(t('common.error'), t('profile.biometricAuthFailed'));
                    return;
                }
                await saveBiometricPreference(true);
                if (user?.email) {
                    await saveBiometricEmail(user.email);
                }
                setBiometricEnabled(true);
                Alert.alert(t('common.success'), t('profile.biometricEnableSuccess'));
            } catch (error) {
                Alert.alert(t('common.error'), t('profile.biometricEnableError'));
                setBiometricEnabled(false);
            }
        } else {
            Alert.alert(
                t('profile.biometricDisableTitle'),
                t('profile.biometricDisableMessage'),
                [
                    {
                        text: t('common.cancel'),
                        style: 'cancel'
                    },
                    {
                        text: t('common.disable'),
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await saveBiometricPreference(false);
                                await clearBiometricData();
                                setBiometricEnabled(false);
                            } catch (error) {
                                Alert.alert(t('common.error'), t('profile.biometricDisableError'));
                            }
                        },
                    },
                ]
            );
        }
    }

    if (isLoading) {
        return (
            <ThemedView className="flex-1 items-center justify-center">
                <ActivityIndicator/>
            </ThemedView>
        );
    }

    if (error && (error as any)?.response?.status !== 404) {
        return (
            <ThemedView className="flex-1 items-center justify-center">
                <ThemedText>{t('profile.loadError')}</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView className="flex-1">
            <Stack.Screen options={{ title: t('profile.title') }}/>
            <KeyboardAvoidingView behavior={Platform.select({
                ios: 'padding',
                android: undefined
            })} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {!profile && (
                        <View style={{ marginBottom: 12 }}>
                            <ThemedText type="subtitle" className="mb-2">{t('profile.createProfile')}</ThemedText>
                            <ThemedText lightColor="#6B7280" darkColor="#9CA3AF">{t('profile.noProfile')}</ThemedText>
                        </View>
                    )}

                    <View style={{ gap: 12 }}>
                        <TextInput
                            value={firstName}
                            onChangeText={setfirstName}
                            placeholder={t('profile.firstNamePlaceholder')}
                            placeholderTextColor={inputStyles.placeholderColor}
                            selectionColor={inputStyles.selectionColor}
                            style={inputStyles.container as any}
                        />
                        <TextInput
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder={t('profile.lastNamePlaceholder')}
                            placeholderTextColor={inputStyles.placeholderColor}
                            selectionColor={inputStyles.selectionColor}
                            style={inputStyles.container as any}
                        />
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            placeholder={t('profile.phonePlaceholder')}
                            keyboardType="phone-pad"
                            placeholderTextColor={inputStyles.placeholderColor}
                            selectionColor={inputStyles.selectionColor}
                            style={inputStyles.container as any}
                        />

                        {biometricAvailable && (
                            <View
                                testID="biometric-section"
                                style={{
                                    borderTopWidth: 1,
                                    borderTopColor: scheme === 'dark' ? '#2A2A2A' : '#E5E7EB',
                                    paddingTop: 16,
                                    marginTop: 4,
                                }}
                            >
                                <ThemedText type="subtitle" style={{
                                    fontSize: 18,
                                    marginBottom: 8
                                }}>{t('profile.security')}</ThemedText>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingVertical: 8,
                                }}>
                                    <View style={{
                                        flex: 1,
                                        marginRight: 12
                                    }}>
                                        <ThemedText testID="biometric-label">
                                            {Platform.OS === 'ios' ? t('profile.biometricLabel') : t('profile.biometricLabelAndroid')}
                                        </ThemedText>
                                        <ThemedText
                                            testID="biometric-description"
                                            lightColor="#6B7280"
                                            darkColor="#9CA3AF"
                                            style={{
                                                fontSize: 13,
                                                marginTop: 2
                                            }}
                                        >
                                            {Platform.OS === 'ios'
                                                ? t('profile.biometricDescription')
                                                : t('profile.biometricDescriptionAndroid')}
                                        </ThemedText>
                                    </View>
                                    <Switch
                                        testID="biometric-toggle"
                                        value={biometricEnabled}
                                        onValueChange={handleBiometricToggle}
                                        trackColor={{
                                            false: '#767577',
                                            true: '#1e90ff'
                                        }}
                                        thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
                                        accessibilityLabel={
                                            Platform.OS === 'ios'
                                                ? t('profile.biometricAccessibilityLabel')
                                                : t('profile.biometricAccessibilityLabelAndroid')
                                        }
                                        accessibilityHint={t('profile.biometricAccessibilityHint')}
                                    />
                                </View>
                            </View>
                        )}

                        <LanguagePicker />

                        <Pressable
                            onPress={onSave}
                            disabled={saveMutation.isPending}
                            style={({ pressed }) => ({
                                opacity: pressed || saveMutation.isPending ? 0.7 : 1,
                                backgroundColor: '#1e90ff',
                                borderRadius: 8,
                                paddingVertical: 12,
                                alignItems: 'center',
                                marginTop: 8,
                            })}
                        >
                            <ThemedText style={{
                                color: 'white',
                                fontWeight: '600'
                            }}>
                                {saveMutation.isPending ? t('profile.saving') : t('profile.save')}
                            </ThemedText>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

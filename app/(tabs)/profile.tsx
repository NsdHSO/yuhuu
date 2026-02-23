import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMyProfileQuery, useSaveMyProfileMutation } from '@/features/profile/api';
import { useBootstrapGate } from '@/features/bootstrap/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
  const ready = useBootstrapGate();
  // Do not issue GET /me/profile; rely on bootstrap seeding the cache.
  const { data: profile, isLoading, error } = useMyProfileQuery({ enabled: false });
  const saveMutation = useSaveMyProfileMutation();
  const [firstName, setfirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const scheme = useColorScheme() ?? 'light';

  React.useEffect(() => {
    if (profile) {
      setfirstName(profile.middle_name ?? '');
      setLastName(profile.last_name ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

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
    const payload = { middle_name: firstName || null, last_name: lastName || null, phone: phone || null } as any;
    saveMutation.mutate(
      { ...payload, mode: profile ? 'update' : 'create' },
      {
        onSuccess: () => Alert.alert('Success', 'Profile saved.'),
        onError: (e: any) => {
          const msg = e?.response?.data?.message || 'Failed to save profile.';
          Alert.alert('Error', msg);
        },
      }
    );
  }

  if (isLoading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (error && (error as any)?.response?.status !== 404) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ThemedText>Failed to load profile.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <Stack.Screen options={{ title: 'Profile' }} />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {!profile && (
            <View style={{ marginBottom: 12 }}>
              <ThemedText type="subtitle" className="mb-2">Create your profile</ThemedText>
              <ThemedText color="muted">We didn't find a profile. Fill in the fields below and save to create one.</ThemedText>
            </View>
          )}

          <View style={{ gap: 12 }}>
            <TextInput
              value={firstName}
              onChangeText={setfirstName}
              placeholder="First name"
              placeholderTextColor={inputStyles.placeholderColor}
              selectionColor={inputStyles.selectionColor}
              style={inputStyles.container as any}
            />
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={inputStyles.placeholderColor}
              selectionColor={inputStyles.selectionColor}
              style={inputStyles.container as any}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              keyboardType="phone-pad"
              placeholderTextColor={inputStyles.placeholderColor}
              selectionColor={inputStyles.selectionColor}
              style={inputStyles.container as any}
            />

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
              <ThemedText style={{ color: 'white', fontWeight: '600' }}>
                {saveMutation.isPending ? 'Saving…' : 'Save'}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

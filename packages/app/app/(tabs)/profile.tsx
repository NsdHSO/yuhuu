import { ChurchInformationAccordion } from "@/components/profile/church-information-accordion";
import { PersonalInfoAccordion } from "@/components/profile/personal-info-accordion";
import { ProfileHeader } from "@/components/profile/profile-header";
import { SettingsAccordion } from "@/components/profile/settings-accordion";
import { useBootstrapGate } from "@/features/bootstrap/api";
import {
    useMyProfileQuery,
    useSaveMyProfileMutation,
} from "@/features/profile/api";
import { useAuth } from "@/providers/AuthProvider";
import {
    authenticateWithBiometrics,
    clearBiometricData,
    getBiometricPreference,
    isBiometricAvailable,
    saveBiometricEmail,
    saveBiometricPreference,
} from "@yuhuu/auth";
import {
    GlassBackground,
    TabScreenWrapper,
    ThemedText,
    ThemedView,
} from "@yuhuu/components";
import { Stack } from "expo-router";
import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, View } from "react-native";

export default function ProfileScreen() {
  const { t } = useTranslation();
  useBootstrapGate();
  const {
    data: profile,
    isLoading,
    error,
  } = useMyProfileQuery({ enabled: false });
  const saveMutation = useSaveMyProfileMutation();
  const [firstName, setfirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (profile) {
      setfirstName(profile.middle_name ?? "");
      setLastName(profile.last_name ?? "");
      setPhone(profile.phone ?? "");
      setGender(profile.gender as 'male' | 'female' | null || null);
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

  const handleGenderChange = useCallback((value: 'male' | 'female') => {
    setGender(value);
  }, []);

  function onSave() {
    const payload = {
      middle_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
      gender: gender || null,
    } as any;
    saveMutation.mutate(
      {
        ...payload,
        mode: profile ? "update" : "create",
      },
      {
        onSuccess: () =>
          Alert.alert(t("common.success"), t("profile.saveSuccess")),
        onError: (e: any) => {
          const msg = e?.response?.data?.message || t("profile.saveError");
          Alert.alert(t("common.error"), msg);
        },
      },
    );
  }

  async function handleBiometricToggle(value: boolean) {
    if (value) {
      try {
        const authenticated = await authenticateWithBiometrics(
          t("profile.biometricEnableTitle"),
        );
        if (!authenticated) {
          Alert.alert(t("common.error"), t("profile.biometricAuthFailed"));
          return;
        }
        await saveBiometricPreference(true);
        if (user?.email) {
          await saveBiometricEmail(user.email);
        }
        setBiometricEnabled(true);
        Alert.alert(t("common.success"), t("profile.biometricEnableSuccess"));
      } catch (_error) {
        Alert.alert(t("common.error"), t("profile.biometricEnableError"));
        setBiometricEnabled(false);
      }
    } else {
      Alert.alert(
        t("profile.biometricDisableTitle"),
        t("profile.biometricDisableMessage"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("common.disable"),
            style: "destructive",
            onPress: async () => {
              try {
                await saveBiometricPreference(false);
                await clearBiometricData();
                setBiometricEnabled(false);
              } catch (_error2) {
                Alert.alert(
                  t("common.error"),
                  t("profile.biometricDisableError"),
                );
              }
            },
          },
        ],
      );
    }
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
        <ThemedText>{t("profile.loadError")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <GlassBackground>
      <Stack.Screen options={{ title: t("profile.title") }} />
      <TabScreenWrapper
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <ProfileHeader
          firstName={firstName}
          lastName={lastName}
          email={user?.email ?? ""}
          testID="profile-header"
        />

        {!profile && (
          <View style={{ marginBottom: 12 }}>
            <ThemedText type="subtitle" className="mb-2">
              {t("profile.createProfile")}
            </ThemedText>
            <ThemedText lightColor="#6B7280" darkColor="#9CA3AF">
              {t("profile.noProfile")}
            </ThemedText>
          </View>
        )}

        <PersonalInfoAccordion
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          gender={gender}
          onFirstNameChange={setfirstName}
          onLastNameChange={setLastName}
          onPhoneChange={setPhone}
          onGenderChange={handleGenderChange}
          onSave={onSave}
          isSaving={saveMutation.isPending}
          testID="personal-info"
        />

        <ChurchInformationAccordion />

        <SettingsAccordion
          biometricAvailable={biometricAvailable}
          biometricEnabled={biometricEnabled}
          onBiometricToggle={handleBiometricToggle}
          testID="settings"
        />
      </TabScreenWrapper>
    </GlassBackground>
  );
}

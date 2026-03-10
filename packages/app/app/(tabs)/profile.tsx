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
    GlowVariantProvider,
    TabScreenWrapper,
    ThemedText,
    ThemedView,
} from "@yuhuu/components";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    View,
} from "react-native";

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
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (profile) {
      setfirstName(profile.middle_name ?? "");
      setLastName(profile.last_name ?? "");
      setPhone(profile.phone ?? "");
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

  function onSave() {
    const payload = {
      middle_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
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
    <GlowVariantProvider initialVariant="vibrant">
      <GlassBackground>
        <Stack.Screen options={{ title: t("profile.title") }} />
        <TabScreenWrapper contentContainerStyle={{ padding: 16 }}>
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

          <View style={{ gap: 4 }}>
            <PersonalInfoAccordion
              firstName={firstName}
              lastName={lastName}
              phone={phone}
              onFirstNameChange={setfirstName}
              onLastNameChange={setLastName}
              onPhoneChange={setPhone}
              testID="personal-info"
            />

            <Pressable
              onPress={onSave}
              disabled={saveMutation.isPending}
              style={({ pressed }) => ({
                opacity: pressed || saveMutation.isPending ? 0.7 : 1,
                backgroundColor: "#1e90ff",
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center",
                marginTop: 8,
                marginBottom: 12,
              })}
            >
              <ThemedText
                style={{
                  color: "white",
                  fontWeight: "600",
                }}
              >
                {saveMutation.isPending ? t("profile.saving") : t("profile.save")}
              </ThemedText>
            </Pressable>

            <ChurchInformationAccordion />

            <SettingsAccordion
              biometricAvailable={biometricAvailable}
              biometricEnabled={biometricEnabled}
              onBiometricToggle={handleBiometricToggle}
              testID="settings"
            />
          </View>
        </TabScreenWrapper>
      </GlassBackground>
    </GlowVariantProvider>
  );
}

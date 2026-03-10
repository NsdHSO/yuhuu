import { Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

import { useAuth } from "@/providers/AuthProvider";
import { hasRole } from "@yuhuu/auth";
import {
    GlassBackground,
    HelloWave,
    TabScreenWrapper,
    ThemedText
} from "@yuhuu/components";

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  const isMember = hasRole("Member");
  if (isMember) return <Redirect href="/profile" />;
  return (
    <GlassBackground>
      <TabScreenWrapper contentContainerStyle={styles.container}>
        <ThemedText type="title" className="mb-2">
          {t("home.welcome", { name: user?.name ?? user?.email ?? "" })}{" "}
          <HelloWave />
        </ThemedText>
        <ThemedText type="subtitle" className="mb-1">
          {t("home.welcomeMessage")}
        </ThemedText>
        <ThemedText leading="relaxed" className="mb-6">
          {t("home.encouragement")}
        </ThemedText>

        <Pressable
          onPress={signOut}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            backgroundColor: "#ef4444",
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: "center",
            width: 120,
          })}
        >
          <ThemedText
            style={{
              color: "white",
              fontWeight: "600",
            }}
          >
            {t("home.signOut")}
          </ThemedText>
        </Pressable>
      </TabScreenWrapper>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

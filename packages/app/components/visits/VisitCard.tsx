import { GlassContentCard, ThemedText, useGlassColors } from "@yuhuu/components";
import type { VisitAssignment } from "@yuhuu/types";
import { Linking, Platform, Pressable, View } from "react-native";

type Props = {
  visit: VisitAssignment;
  familyName: string;
  address: string;
  remainingMs: number;
  canComplete: boolean;
  onComplete: () => void;
};

export function VisitCard({
  familyName,
  address,
  remainingMs,
  canComplete,
  onComplete,
}: Props) {
  const colors = useGlassColors();

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const handleNavigate = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <GlassContentCard testID="visit-card">
      <ThemedText style={{ fontSize: 18, fontWeight: "600" }}>
        {familyName}
      </ThemedText>
      <ThemedText style={{ fontSize: 14, marginTop: 4, opacity: 0.8 }}>
        {address}
      </ThemedText>

      {remainingMs > 0 && (
        <ThemedText style={{ fontSize: 16, marginTop: 8, color: colors.activeColor }}>
          Time remaining: {formatTime(remainingMs)}
        </ThemedText>
      )}

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={handleNavigate}
          style={{
            flex: 1,
            borderRadius: 8,
            padding: 12,
            alignItems: "center",
            backgroundColor: colors.activeColor + "20",
          }}
        >
          <ThemedText style={{ fontWeight: "600", color: colors.activeColor }}>
            Navigate
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={onComplete}
          disabled={!canComplete}
          style={{
            flex: 1,
            borderRadius: 8,
            padding: 12,
            alignItems: "center",
            backgroundColor: canComplete ? colors.activeColor : "#ccc",
          }}
        >
          <ThemedText style={{ fontWeight: "600", color: "#fff" }}>
            Mark Complete
          </ThemedText>
        </Pressable>
      </View>
    </GlassContentCard>
  );
}

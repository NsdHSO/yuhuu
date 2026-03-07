// import { BlurView } from "expo-blur"; // TEMPORARILY DISABLED - expo-blur broken
import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useColorScheme } from "../hooks/use-color-scheme";

const { width } = Dimensions.get("window");

type TabLiquidBlobProps = {
  currentTabIndex: number;
  tabCount: number;
};

export function TabLiquidBlob({
  currentTabIndex,
  tabCount,
}: TabLiquidBlobProps) {
  const scheme = useColorScheme() ?? "light";

  // Shared value for pill position
  const translateX = useSharedValue(0);

  // Calculate dimensions - compact pill that wraps icon + label
  const tabWidth = width / tabCount;
  const pillWidth = tabWidth * 0.75; // Narrower pill (75% of tab)
  const pillHeight = 38; // Compact height

  useEffect(() => {
    // Calculate center position for current tab
    const targetX = currentTabIndex * tabWidth + (tabWidth - pillWidth) / 2;

    // Smooth spring animation to new position
    translateX.value = withSpring(targetX, {
      damping: 25,
      stiffness: 180,
      mass: 0.4,
    });
  }, [currentTabIndex, tabWidth, pillWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.pillContainer,
        {
          width: pillWidth,
          height: pillHeight,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor:
              scheme === "dark"
                ? "rgba(100, 120, 140, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
            borderWidth: 1,
            borderColor:
              scheme === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    position: "absolute",
    bottom: 8,
    left: 0,
    zIndex: 9999,
    elevation: 10,
  },
  pill: {
    flex: 1,
    borderRadius: 19, // Capsule shape (half of 38px height)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
});

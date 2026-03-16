import { Dimensions, StyleSheet, View } from "react-native";
import { useColorScheme } from "../../hooks/use-color-scheme";
import { useGlowVariant } from "../../hooks/useGlowVariant";
import { glowColors } from "../../constants/glowColors";
import type { GlowVariant } from "../../constants/glowColors";

type GlassBackgroundProps = {
  variant?: GlowVariant;
  children?: React.ReactNode;
};

export function GlassBackground({
  variant,
  children,
}: GlassBackgroundProps) {
  const { glowVariant } = useGlowVariant();
  const resolvedVariant = variant ?? glowVariant;
  const scheme = useColorScheme() ?? "light";
  const { width, height } = Dimensions.get("window");

  // Neutral background colors (like GlassView frosted variant)
  const backgroundColor = scheme === 'dark'
    ? 'rgba(40, 40, 50, 0.60)'  // Dark frosted glass
    : 'rgba(200, 210, 230, 0.85)'; // Light frosted glass

  const colors = glowColors[resolvedVariant][scheme];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Wave-like gradient layers - multiple overlapping circles for water effect */}

      {/* Top wave - large circles */}
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.01)', // iOS needs this for shadows
            width: width * 1.8,
            height: height * 0.7,
            top: -height * 0.2,
            left: -width * 0.4,
            borderRadius: width * 1.2,
            opacity: 0.4, // Increased for visibility
            borderWidth: 1, // Thicker border
            borderColor: colors[0],
            shadowColor: colors[0],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1, // Maximum shadow
            shadowRadius: 15,
            elevation: 10,
          },
        ]}
      />
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.01)', // iOS needs barely-visible bg for shadows
            width: width * 1.2,
            height: height * 0.5,
            top: -height * 0.05,
            right: -width * 0.2,
            borderRadius: width * 0.9,
            opacity: 0.4,
            borderWidth: 1,
            borderColor: colors[0],
            shadowColor: colors[0],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 6,
          },
        ]}
      />

      {/* Middle wave - overlapping for depth */}
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.01)', // iOS needs barely-visible bg for shadows
            width: width * 1.6,
            height: height * 0.8,
            top: height * 0.15,
            right: -width * 0.5,
            borderRadius: width * 1.0,
            opacity: 0.4,
            borderWidth: 1,
            borderColor: colors[0],
            shadowColor: colors[0],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 6,
          },
        ]}
      />
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.01)', // iOS needs barely-visible bg for shadows
            width: width * 1.4,
            height: height * 0.6,
            top: height * 0.25,
            left: -width * 0.3,
            borderRadius: width * 0.85,
            opacity: 0.4,
            borderWidth: 1,
            borderColor: colors[0],
            shadowColor: colors[0],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 6,
          },
        ]}
      />

      {/* Bottom wave - flowing layers */}
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.01)', // iOS needs barely-visible bg for shadows
            width: width * 1.5,
            height: height * 0.55,
            bottom: -height * 0.15,
            left: width * 0.2,
            borderRadius: width * 0.8,
            opacity: 0.3,
            borderWidth: 1,
            borderColor: colors[0],
            shadowColor: colors[0],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 6,
          },
        ]}
      />
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.01)', // iOS needs barely-visible bg for shadows
            width: width * 1.3,
            height: height * 0.5,
            bottom: -height * 0.1,
            right: width * 0.1,
            borderRadius: width * 0.75,
            opacity: 0.4,
            borderWidth: 1,
            borderColor: colors[0],
            shadowColor: colors[0],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 6,
          },
        ]}
      />

      {/* Small accent waves for ripple effect */}
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.01)', // iOS needs barely-visible bg for shadows
            width: width * 0.8,
            height: height * 0.35,
            top: height * 0.4,
            left: width * 0.6,
            borderRadius: width * 0.5,
            opacity: 0.35,
            borderWidth: 1,
            borderColor: colors[0],
            shadowColor: colors[0],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 6,
          },
        ]}
      />
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.01)', // iOS needs barely-visible bg for shadows
            width: width * 0.7,
            height: height * 0.3,
            top: height * 0.1,
            left: width * 0.1,
            borderRadius: width * 0.45,
            opacity: 0.35,
            borderWidth: 1,
            borderColor: colors[0],
            shadowColor: colors[0],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 6,
          },
        ]}
      />

      {/* Content layer on top */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  gradientLayer: {
    position: "absolute",
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

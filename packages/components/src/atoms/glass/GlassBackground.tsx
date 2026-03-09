import { Dimensions, StyleSheet, View } from "react-native";
import { useColorScheme } from "../../hooks/use-color-scheme";

type GlassBackgroundProps = {
  variant?: "subtle" | "vibrant" | "warm" | "cool";
  children?: React.ReactNode;
};

export function GlassBackground({
  variant = "subtle",
  children,
}: GlassBackgroundProps) {
  const scheme = useColorScheme() ?? "light";
  const { width, height } = Dimensions.get("window");

  // Soft glowing circles - smooth blurred shadows create ethereal wave effect
  const glowColors = {
    subtle: {
      light: ["#94A3B8"], // Soft slate - visible but subtle on white
      dark: ["#60A5FA"],  // Sky blue glow - visible in dark with elegance
    },
    vibrant: {
      light: ["#A78BFA"], // Soft purple - elegant and visible
      dark: ["#A78BFA"],  // Purple glow - maintains vibrancy in dark
    },
    warm: {
      light: ["#FB923C"], // Soft orange - warm but not overwhelming
      dark: ["#F59E0B"],  // Orange glow - cozy radiance
    },
    cool: {
      light: ["#60A5FA"], // Soft blue - gentle and fresh
      dark: ["#60A5FA"],  // Sky blue glow - serene consistency
    },
  };

  // Background colors that respect dark/light mode
  const backgroundColors = {
    light: "#FFFFFF", // Pure white for light mode
    dark: "#0F172A",  // Deep navy for dark mode
  };

  const colors = glowColors[variant][scheme];
  const backgroundColor = backgroundColors[scheme];

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

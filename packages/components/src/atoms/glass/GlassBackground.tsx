import { View, StyleSheet, Dimensions } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';

type GlassBackgroundProps = {
  variant?: 'subtle' | 'vibrant' | 'warm' | 'cool';
  children?: React.ReactNode;
};

export function GlassBackground({ variant = 'subtle', children }: GlassBackgroundProps) {
  const scheme = useColorScheme() ?? 'light';
  const { width, height } = Dimensions.get('window');

  // Create gradient effect using multiple positioned views
  const gradients = {
    subtle: {
      light: ['#E0F2FE', '#DBEAFE', '#E0F2FE'],
      dark: ['#0F172A', '#1E293B', '#0F172A'],
    },
    vibrant: {
      light: ['#D97706', '#E11D48', '#6B21A8', '#1D4ED8'],
      dark: ['#0D1B3E', '#2D1448', '#5A0D2F', '#5A0F0F'],
    },
    warm: {
      light: ['#FBBF24', '#FB923C', '#F87171'],
      dark: ['#92400E', '#991B1B', '#7C2D12'],
    },
    cool: {
      light: ['#60A5FA', '#A78BFA', '#C084FC'],
      dark: ['#1E40AF', '#5B21B6', '#7C3AED'],
    },
  };

  const colors = gradients[variant][scheme];

  return (
    <View style={styles.container}>
      {/* Wave-like gradient layers - multiple overlapping circles for water effect */}

      {/* Top wave - large circles */}
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[0],
            width: width * 1.8,
            height: height * 0.7,
            top: -height * 0.2,
            left: -width * 0.4,
            borderRadius: width * 1.2,
            opacity: 0.5,
          },
        ]}
      />
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[3],
            width: width * 1.2,
            height: height * 0.5,
            top: -height * 0.05,
            right: -width * 0.2,
            borderRadius: width * 0.9,
            opacity: 0.6,
          },
        ]}
      />

      {/* Middle wave - overlapping for depth */}
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[1],
            width: width * 1.6,
            height: height * 0.8,
            top: height * 0.15,
            right: -width * 0.5,
            borderRadius: width * 1.0,
            opacity: 0.55,
          },
        ]}
      />
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[2],
            width: width * 1.4,
            height: height * 0.6,
            top: height * 0.25,
            left: -width * 0.3,
            borderRadius: width * 0.85,
            opacity: 0.6,
          },
        ]}
      />

      {/* Bottom wave - flowing layers */}
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[0],
            width: width * 1.5,
            height: height * 0.55,
            bottom: -height * 0.15,
            left: width * 0.2,
            borderRadius: width * 0.8,
            opacity: 0.5,
          },
        ]}
      />
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[3],
            width: width * 1.3,
            height: height * 0.5,
            bottom: -height * 0.1,
            right: width * 0.1,
            borderRadius: width * 0.75,
            opacity: 0.6,
          },
        ]}
      />

      {/* Small accent waves for ripple effect */}
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[1],
            width: width * 0.8,
            height: height * 0.35,
            top: height * 0.4,
            left: width * 0.6,
            borderRadius: width * 0.5,
            opacity: 0.45,
          },
        ]}
      />
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[2],
            width: width * 0.7,
            height: height * 0.3,
            top: height * 0.1,
            left: width * 0.1,
            borderRadius: width * 0.45,
            opacity: 0.4,
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
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  gradientLayer: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

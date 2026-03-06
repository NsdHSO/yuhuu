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
      dark: ['#1E40AF', '#7C3AED', '#DB2777', '#DC2626'],
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
      {/* Gradient layers with blur-friendly colors */}
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[0],
            width: width * 1.5,
            height: height * 0.6,
            top: -height * 0.1,
            left: -width * 0.2,
            borderRadius: width * 0.8,
          },
        ]}
      />
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[1],
            width: width * 1.3,
            height: height * 0.7,
            top: height * 0.2,
            right: -width * 0.3,
            borderRadius: width * 0.7,
          },
        ]}
      />
      <View
        style={[
          styles.gradientLayer,
          {
            backgroundColor: colors[2],
            width: width * 1.4,
            height: height * 0.5,
            bottom: -height * 0.1,
            left: width * 0.1,
            borderRadius: width * 0.6,
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
    opacity: 0.6,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

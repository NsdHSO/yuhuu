import React from 'react';
import {View, ViewStyle, StyleSheet} from 'react-native';
import {useGlassColors} from '../../hooks/useGlassColors';

type GlassContentCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  borderRadius?: number;
  padding?: number;
  testID?: string;
};

/**
 * Generic Glass Card Component
 * Uses useGlassColors hook to provide frosted glass + glow pattern
 * Replaces repetitive StyleSheet.create({glassCard, container}) boilerplate
 *
 * @example
 * <GlassContentCard>
 *   <Text style={{fontSize: 18, fontWeight: '600'}}>Title</Text>
 *   <Text style={{fontSize: 14, marginTop: 4}}>Content</Text>
 * </GlassContentCard>
 */
export function GlassContentCard({
  children,
  style,
  contentStyle,
  borderRadius = 12,
  padding = 16,
  testID,
}: GlassContentCardProps) {
  const colors = useGlassColors();

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View
        style={[
          styles.glassCard,
          {
            borderRadius,
            backgroundColor: colors.glassBackground,
          },
        ]}
      >
        {/* Glow tint overlay */}
        <View
          style={[StyleSheet.absoluteFill, colors.glowOverlay(borderRadius)]}
          pointerEvents="none"
        />

        {/* Content */}
        <View style={[{padding}, contentStyle]}>{children}</View>

        {/* Glow border */}
        <View
          style={[StyleSheet.absoluteFill, colors.glowBorder(borderRadius)]}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    overflow: 'visible',
  },
  glassCard: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

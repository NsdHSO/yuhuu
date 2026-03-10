import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import type { GlassViewProps } from '../../types/glass';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useElectricBorder } from '../../hooks/useElectricBorder';
import { useGlowVariant } from '../../hooks/useGlowVariant';
import { getGlowColor } from '../../constants/glowColors';

type GlassCardProps = GlassViewProps & {
  enableElectric?: boolean;
  enableWaves?: boolean;
};

export function GlassCard({
  variant = 'tinted',
  borderRadius = 12,
  enableElectric = false,
  enableWaves = false,
  style,
  children,
  ...props
}: GlassCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const { glowVariant } = useGlowVariant();

  // Get electric color from shared glow colors
  const electricColor = getGlowColor(glowVariant, scheme);

  // Electric border animation - using shared hook
  const electricStyle = useElectricBorder(enableElectric);

  // Wave animations
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);

  useEffect(() => {
    if (enableWaves) {
      // Multiple wave layers with different speeds - more dramatic
      wave1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      wave2.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      wave3.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [enableWaves]);

  const wave1Style = useAnimatedStyle(() => {
    if (!enableWaves) return {};

    const scale = 1 + (wave1.value * 0.08); // Scale from 1.0 to 1.08
    const opacity = 0.4 + (wave1.value * 0.4); // Opacity from 0.4 to 0.8
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const wave2Style = useAnimatedStyle(() => {
    if (!enableWaves) return {};

    const scale = 1 + (wave2.value * 0.06); // Scale from 1.0 to 1.06
    const opacity = 0.3 + (wave2.value * 0.4); // Opacity from 0.3 to 0.7
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const wave3Style = useAnimatedStyle(() => {
    if (!enableWaves) return {};

    const scale = 1 + (wave3.value * 0.10); // Scale from 1.0 to 1.10
    const opacity = 0.35 + (wave3.value * 0.45); // Opacity from 0.35 to 0.8
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  if (!enableElectric && !enableWaves) {
    // Simple glass card without effects
    return (
      <GlassView variant={variant} borderRadius={borderRadius} style={style} {...props}>
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[{ borderRadius, overflow: 'visible' }, style]}>
      <GlassView variant={variant} borderRadius={borderRadius} {...props}>
        {/* Wave effect layers - inside glass content */}
        {enableWaves && (
          <>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius,
                  backgroundColor: `${electricColor}${scheme === 'dark' ? '59' : '40'}`, // 35% / 25% opacity
                },
                wave1Style,
              ]}
              pointerEvents="none"
            />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius,
                  backgroundColor: `${electricColor}${scheme === 'dark' ? '4D' : '38'}`, // 30% / 22% opacity
                },
                wave2Style,
              ]}
              pointerEvents="none"
            />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius,
                  backgroundColor: `${electricColor}${scheme === 'dark' ? '52' : '3B'}`, // 32% / 23% opacity
                },
                wave3Style,
              ]}
              pointerEvents="none"
            />
          </>
        )}

        {/* Content */}
        <View style={{ zIndex: 5 }}>{children}</View>
      </GlassView>

      {/* Electric border - traveling snake effect */}
      {enableElectric && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { pointerEvents: 'none' },
          ]}
        >
          {/* Traveling electric segment */}
          <Animated.View
            style={[
              electricStyle,
              {
                position: 'absolute',
                backgroundColor: electricColor,
                shadowColor: electricColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 12,
                elevation: 25,
                borderRadius: 1.5,
              },
            ]}
            pointerEvents="none"
          />
          {/* Subtle static border to show the path */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius,
                borderWidth: 1,
                borderColor: `${electricColor}${scheme === 'dark' ? '33' : '26'}`, // 20% / 15% opacity
              },
            ]}
            pointerEvents="none"
          />
        </Animated.View>
      )}
    </View>
  );
}

// import { BlurView } from 'expo-blur'; // TEMPORARILY DISABLED - expo-blur broken
import { Platform, StyleSheet, View, AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { GLASS_VARIANTS, GLASS_COLORS, GLASS_SHADOWS } from '../../constants/glass';
import type { GlassViewProps } from '../../types/glass';
import { supportsNativeBlur, shouldRasterize } from '../../utils/glass-platform';
import { adjustIntensityForMotion } from '../../utils/glass-accessibility';

export function GlassView({
  variant = 'frosted',
  intensity,
  borderRadius = 16,
  enableShadow = true,
  shadowLevel = 'subtle',
  enableBorder = true,
  style,
  children,
  ...props
}: GlassViewProps) {
  const scheme = useColorScheme() ?? 'light';
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {
      setReduceMotion(false);
    });
  }, []);

  // Calculate optimal blur intensity
  const baseIntensity = intensity ?? GLASS_VARIANTS[variant].intensity;
  const finalIntensity = adjustIntensityForMotion(baseIntensity, reduceMotion);

  // Web fallback using CSS
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          {
            backgroundColor: GLASS_COLORS[scheme][variant],
            borderRadius,
            // @ts-ignore - backdropFilter is web-only CSS property
            backdropFilter: `blur(${finalIntensity}px)`,
            // @ts-ignore - WebkitBackdropFilter is web-only
            WebkitBackdropFilter: `blur(${finalIntensity}px)`,
          } as any,
          enableShadow && GLASS_SHADOWS[shadowLevel],
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  // Native iOS/Android - TEMPORARY: using View instead of BlurView
  return (
    <View
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          backgroundColor: GLASS_COLORS[scheme][variant],
          borderWidth: enableBorder ? 1 : 0,
          borderColor: scheme === 'dark' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.1)',
        },
        enableShadow && GLASS_SHADOWS[shadowLevel],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

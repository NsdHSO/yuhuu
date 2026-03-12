import React, {useEffect} from 'react';
import {View, StyleSheet, Platform, ViewStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {BlurView} from 'expo-blur';
import type {BottomSheetBackgroundProps} from '@gorhom/bottom-sheet';
import {GLASS_COLORS} from '../../constants/glass';
import type {GlassVariant} from '../../types/glass';

type GlassBottomSheetBackgroundProps = BottomSheetBackgroundProps & {
  variant: GlassVariant;
  enableWaves: boolean;
  activeColor: string;
  colorScheme: 'light' | 'dark';
  testID?: string;
};

export const GlassBottomSheetBackground: React.FC<GlassBottomSheetBackgroundProps> = ({
  style,
  animatedIndex,
  variant,
  enableWaves,
  activeColor,
  colorScheme,
  testID,
}) => {
  const scheme = colorScheme;

  // Wave animations
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);
  const shine = useSharedValue(0);

  // Subtle shine animation - like water droplets on clean glass
  useEffect(() => {
    shine.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 3000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 3000, easing: Easing.inOut(Easing.ease)})
      ),
      -1,
      true
    );
  }, [shine]);

  useEffect(() => {
    if (enableWaves) {
      wave1.value = withRepeat(
        withSequence(
          withTiming(1, {duration: 2000, easing: Easing.inOut(Easing.sin)}),
          withTiming(0, {duration: 2000, easing: Easing.inOut(Easing.sin)})
        ),
        -1,
        true
      );
      wave2.value = withRepeat(
        withSequence(
          withTiming(1, {duration: 2500, easing: Easing.inOut(Easing.sin)}),
          withTiming(0, {duration: 2500, easing: Easing.inOut(Easing.sin)})
        ),
        -1,
        true
      );
      wave3.value = withRepeat(
        withSequence(
          withTiming(1, {duration: 3000, easing: Easing.inOut(Easing.sin)}),
          withTiming(0, {duration: 3000, easing: Easing.inOut(Easing.sin)})
        ),
        -1,
        true
      );
    }
  }, [enableWaves, wave1, wave2, wave3]);

  const wave1Style = useAnimatedStyle(() => {
    if (!enableWaves) return {};
    const scale = 1 + wave1.value * 0.08;
    const opacity = 0.4 + wave1.value * 0.4;
    return {transform: [{scale}], opacity};
  });

  const wave2Style = useAnimatedStyle(() => {
    if (!enableWaves) return {};
    const scale = 1 + wave2.value * 0.06;
    const opacity = 0.3 + wave2.value * 0.4;
    return {transform: [{scale}], opacity};
  });

  const wave3Style = useAnimatedStyle(() => {
    if (!enableWaves) return {};
    const scale = 1 + wave3.value * 0.1;
    const opacity = 0.35 + wave3.value * 0.45;
    return {transform: [{scale}], opacity};
  });

  // Shine animation style - subtle light reflection
  const shineStyle = useAnimatedStyle(() => {
    const opacity = 0.15 + (shine.value * 0.25); // 15% to 40% opacity
    return {opacity};
  });

  // Override any opacity from library's style prop to keep background fully visible
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  const containerStyle = Platform.OS === 'web'
    ? {
        backgroundColor: GLASS_COLORS[scheme][variant],
        // @ts-ignore - Web-only CSS property
        backdropFilter: 'blur(20px)',
        // @ts-ignore - Web-only CSS property
        WebkitBackdropFilter: 'blur(20px)',
      }
    : {backgroundColor: GLASS_COLORS[scheme][variant]};

  if (Platform.OS === 'web') {
    return (
      <Animated.View
        style={[style, styles.glassContainer, containerStyle, containerAnimatedStyle]}
        testID={testID}
        pointerEvents="none"
      >
        {/* Subtle glow tint overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: `${activeColor}${scheme === 'dark' ? '0D' : '0A'}`,
            },
          ]}
          pointerEvents="none"
        />

        {/* Water-like shine effect - subtle light reflection */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                scheme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.3)',
            },
            shineStyle,
          ]}
          pointerEvents="none"
        />

        {/* Wave animations */}
        {enableWaves && (
          <>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {backgroundColor: `${activeColor}${scheme === 'dark' ? '59' : '40'}`},
                wave1Style,
              ]}
              pointerEvents="none"
            />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {backgroundColor: `${activeColor}${scheme === 'dark' ? '4D' : '38'}`},
                wave2Style,
              ]}
              pointerEvents="none"
            />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {backgroundColor: `${activeColor}${scheme === 'dark' ? '52' : '3B'}`},
                wave3Style,
              ]}
              pointerEvents="none"
            />
          </>
        )}

        {/* Border - matches GlassAccordion */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1.5,
              borderColor: `${activeColor}${scheme === 'dark' ? '66' : '59'}`,
              borderBottomWidth: 0,
            },
          ]}
          pointerEvents="none"
        />
      </Animated.View>
    );
  }

  // Native implementation with BlurView
  return (
    <Animated.View
      style={[style, styles.glassContainer, containerAnimatedStyle]}
      testID={testID}
      pointerEvents="none"
    >
      {/* Native blur effect */}
      <BlurView
        intensity={60}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* Base color overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {backgroundColor: GLASS_COLORS[scheme][variant]},
        ]}
        pointerEvents="none"
      />

      {/* Subtle glow tint overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: `${activeColor}${scheme === 'dark' ? '0D' : '0A'}`,
          },
        ]}
        pointerEvents="none"
      />

      {/* Water-like shine effect - subtle light reflection */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              scheme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.3)',
          },
          shineStyle,
        ]}
        pointerEvents="none"
      />

      {/* Wave animations */}
      {enableWaves && (
        <>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: `${activeColor}${scheme === 'dark' ? '59' : '40'}`},
              wave1Style,
            ]}
            pointerEvents="none"
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: `${activeColor}${scheme === 'dark' ? '4D' : '38'}`},
              wave2Style,
            ]}
            pointerEvents="none"
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: `${activeColor}${scheme === 'dark' ? '52' : '3B'}`},
              wave3Style,
            ]}
            pointerEvents="none"
          />
        </>
      )}

      {/* Border - matches GlassAccordion */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1.5,
            borderColor: `${activeColor}${scheme === 'dark' ? '66' : '59'}`,
            borderBottomWidth: 0,
          },
        ]}
        pointerEvents="none"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
});

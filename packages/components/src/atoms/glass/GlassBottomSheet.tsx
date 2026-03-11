import React, {forwardRef, useEffect, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  useDerivedValue,
} from 'react-native-reanimated';
import {useColorScheme} from '../../hooks/use-color-scheme';
import {useGlowVariant} from '../../hooks/useGlowVariant';
import {getGlowColor} from '../../constants/glowColors';
import {GLASS_COLORS} from '../../constants/glass';
import type {GlassVariant} from '../../types/glass';

export type GlassBottomSheetProps = {
  children?: React.ReactNode;
  variant?: GlassVariant;
  enableWaves?: boolean;
  snapPoints?: (string | number)[];
  enableBackdropDismiss?: boolean;
  testID?: string;
};

export const GlassBottomSheet = forwardRef<BottomSheetModal, GlassBottomSheetProps>(
  (
    {
      children,
      variant = 'frosted',
      enableWaves = true,
      snapPoints = ['60%'],
      enableBackdropDismiss = true,
      testID,
    },
    ref
  ) => {
    const {glowVariant} = useGlowVariant();
    const scheme = useColorScheme() ?? 'light';
    const activeColor = useMemo(
      () => {
        const color = getGlowColor(glowVariant, scheme);
        console.log('[GlassBottomSheet] Glow variant changed:', glowVariant, 'color:', color);
        return color;
      },
      [glowVariant, scheme]
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDismissOnClose={true}
        backdropComponent={(props) => (
          <GlassBackdrop
            {...props}
            enableDismiss={enableBackdropDismiss}
            testID={testID ? `${testID}-backdrop` : undefined}
          />
        )}
        backgroundComponent={(props) => (
          <GlassBackground
            {...props}
            variant={variant}
            enableWaves={enableWaves}
            activeColor={activeColor}
            colorScheme={scheme}
            testID={testID ? `${testID}-background` : undefined}
          />
        )}
        handleComponent={GlassHandle}
        enablePanDownToClose={true}
        enableOverDrag={false}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

GlassBottomSheet.displayName = 'GlassBottomSheet';

const GlassBackdrop: React.FC<BottomSheetBackdropProps & {enableDismiss: boolean; testID?: string}> = ({
  animatedIndex,
  style,
  testID,
}) => {
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, 0.4],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <Animated.View
      testID={testID}
      style={[
        StyleSheet.absoluteFill,
        {backgroundColor: 'rgba(0, 0, 0, 1)'},
        backdropStyle,
        style,
      ]}
      pointerEvents="auto"
    />
  );
};

const GlassBackground: React.FC<{
  variant: GlassVariant;
  enableWaves: boolean;
  activeColor: string;
  colorScheme: 'light' | 'dark';
  testID?: string;
}> = ({
  variant,
  enableWaves,
  activeColor,
  colorScheme,
  testID,
}) => {
  const scheme = colorScheme;

  console.log('[GlassBackground] Rendering with activeColor:', activeColor);

  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);

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

  return (
    <Animated.View
      testID={testID}
      style={[
        StyleSheet.absoluteFill,
        {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: GLASS_COLORS[scheme][variant],
          overflow: 'hidden',
        },
      ]}
    >
      {/* Subtle glow tint overlay - matches GlassAccordion */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: `${activeColor}${scheme === 'dark' ? '0D' : '0A'}`, // 5%/4% opacity - matches accordion
          },
        ]}
        pointerEvents="none"
      />

      {enableWaves && (
        <>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: `${activeColor}${scheme === 'dark' ? '59' : '40'}`}, // 35%/25% opacity - matches accordion wave1
              wave1Style,
            ]}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: `${activeColor}${scheme === 'dark' ? '4D' : '38'}`}, // 30%/22% opacity - matches accordion wave2
              wave2Style,
            ]}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: `${activeColor}${scheme === 'dark' ? '52' : '3B'}`}, // 32%/23% opacity - matches accordion wave3
              wave3Style,
            ]}
          />
        </>
      )}
    </Animated.View>
  );
};

const GlassHandle: React.FC = () => {
  const scheme = useColorScheme() ?? 'light';

  return (
    <View style={styles.handleContainer}>
      <View
        style={[
          styles.handle,
          {
            backgroundColor:
              scheme === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(255, 255, 255, 0.3)',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});

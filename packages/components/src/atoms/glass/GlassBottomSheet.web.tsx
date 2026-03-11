import React, {forwardRef, useImperativeHandle, useState, useCallback, useEffect} from 'react';
import {Modal, View, Pressable, StyleSheet, Animated as RNAnimated} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
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

// Web version uses Modal instead of BottomSheetModal
export const GlassBottomSheet = forwardRef<any, GlassBottomSheetProps>(
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
    const [visible, setVisible] = useState(false);
    const slideAnim = useState(() => new RNAnimated.Value(0))[0];

    // Expose present/dismiss methods to match native BottomSheetModal API
    useImperativeHandle(ref, () => ({
      present: () => {
        setVisible(true);
        RNAnimated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      },
      dismiss: () => {
        RNAnimated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      },
    }));

    const handleBackdropPress = useCallback(() => {
      if (enableBackdropDismiss) {
        RNAnimated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }
    }, [enableBackdropDismiss, slideAnim]);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleBackdropPress}
      >
        <Pressable
          style={styles.backdrop}
          onPress={handleBackdropPress}
          testID={testID ? `${testID}-backdrop` : undefined}
        >
          <RNAnimated.View
            style={[
              styles.bottomSheet,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <GlassBackground
              variant={variant}
              enableWaves={enableWaves}
              testID={testID ? `${testID}-background` : undefined}
            >
              <GlassHandle />
              {children}
            </GlassBackground>
          </RNAnimated.View>
        </Pressable>
      </Modal>
    );
  }
);

GlassBottomSheet.displayName = 'GlassBottomSheet';

const GlassBackground: React.FC<{
  variant: GlassVariant;
  enableWaves: boolean;
  testID?: string;
  children: React.ReactNode;
}> = ({variant, enableWaves, testID, children}) => {
  const scheme = useColorScheme() ?? 'light';
  const {glowVariant} = useGlowVariant();
  const activeColor = getGlowColor(glowVariant, scheme);

  // Wave animations
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
    <View
      style={[
        styles.glassContainer,
        {
          backgroundColor: scheme === 'dark'
            ? `${activeColor}1A` // 10% opacity for dark mode
            : `${activeColor}14`, // 8% opacity for light mode
        },
      ]}
      testID={testID}
    >
      {/* Glass frosted layer */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {backgroundColor: GLASS_COLORS[scheme][variant]},
        ]}
        pointerEvents="none"
      />

      {/* Glow tint overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {backgroundColor: `${activeColor}${scheme === 'dark' ? '14' : '0F'}`},
        ]}
        pointerEvents="none"
      />

      {/* Wave animations */}
      {enableWaves && (
        <>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: `${activeColor}35`},
              wave1Style,
            ]}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: `${activeColor}28`},
              wave2Style,
            ]}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: `${activeColor}2D`},
              wave3Style,
            ]}
          />
        </>
      )}

      {/* Content */}
      {children}
    </View>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    maxHeight: '80%',
  },
  glassContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
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

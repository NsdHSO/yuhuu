import React, {forwardRef, useImperativeHandle, useState, useCallback, useMemo} from 'react';
import {Modal, View, Pressable, StyleSheet, Animated as RNAnimated} from 'react-native';
import {useColorScheme} from '../../hooks/use-color-scheme';
import {useGlowVariant} from '../../hooks/useGlowVariant';
import {getGlowColor} from '../../constants/glowColors';
import {GlassBottomSheetBackground} from './GlassBottomSheetBackground';
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
      enableWaves = false,
      snapPoints = ['60%'],
      enableBackdropDismiss = true,
      testID,
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const slideAnim = useState(() => new RNAnimated.Value(0))[0];
    const {glowVariant} = useGlowVariant();
    const scheme = useColorScheme() ?? 'light';
    const activeColor = useMemo(
      () => getGlowColor(glowVariant, scheme),
      [glowVariant, scheme]
    );

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
            <GlassBottomSheetBackground
              variant={variant}
              enableWaves={enableWaves}
              activeColor={activeColor}
              colorScheme={scheme}
              testID={testID ? `${testID}-background` : undefined}
            >
              <GlassHandle />
              {children}
            </GlassBottomSheetBackground>
          </RNAnimated.View>
        </Pressable>
      </Modal>
    );
  }
);

GlassBottomSheet.displayName = 'GlassBottomSheet';

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
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Reduced from 0.4 to 0.2 for lighter backdrop
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

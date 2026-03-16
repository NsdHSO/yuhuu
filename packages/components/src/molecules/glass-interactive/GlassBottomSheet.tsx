import React, {forwardRef, useMemo, useCallback} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Animated, {
  useAnimatedStyle,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
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

export const GlassBottomSheet = forwardRef<BottomSheetModal, GlassBottomSheetProps>(
  (
    {
      children,
      variant = 'frosted',
      enableWaves = false,
      snapPoints = ['90%'],
      enableBackdropDismiss = true,
      testID,
    },
    ref
  ) => {
    const {glowVariant} = useGlowVariant();
    const scheme = useColorScheme() ?? 'light';
    const activeColor = useMemo(
      () => getGlowColor(glowVariant, scheme),
      [glowVariant, scheme]
    );

    // Android New Architecture fix: Add onChange callback to handle view state synchronization
    const handleSheetChange = useCallback((index: number) => {
      // This callback helps synchronize view state in Fabric renderer
      // Prevents "Unable to find view for viewState" error on Android
      if (Platform.OS === 'android') {
        // Empty callback is sufficient to trigger proper view registration
      }
    }, []);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDismissOnClose={true}
        onChange={handleSheetChange}
        backdropComponent={(props) => (
          <GlassBackdrop
            {...props}
            enableDismiss={enableBackdropDismiss}
            testID={testID ? `${testID}-backdrop` : undefined}
          />
        )}
        backgroundComponent={(props) => (
          <GlassBottomSheetBackground
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
        waitFor={Platform.OS === 'android' ? undefined : undefined}
      >
        <BottomSheetView
          key={`content-${glowVariant}-${scheme}`}
          style={styles.contentContainer}
        >
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
  contentContainer: {
    flex: 1,
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

import React, {forwardRef, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Animated, {
  useAnimatedStyle,
  interpolate,
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

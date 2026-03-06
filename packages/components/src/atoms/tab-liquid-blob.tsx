import { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '../hooks/use-color-scheme';

const { width } = Dimensions.get('window');

type TabLiquidBlobProps = {
  currentTabIndex: number;
  tabCount: number;
};

export function TabLiquidBlob({ currentTabIndex, tabCount }: TabLiquidBlobProps) {
  const scheme = useColorScheme() ?? 'light';

  // Shared values for animation
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  // Calculate tab width
  const tabWidth = width / tabCount;
  const blobSize = tabWidth * 0.7; // Smaller, contained within tab

  useEffect(() => {
    // Calculate position for current tab (centered in tab)
    const targetX = currentTabIndex * tabWidth + (tabWidth - blobSize) / 2;

    // Wave animation: magnify briefly, then settle
    scale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 150 }), // Quick magnify
      withSpring(1, { damping: 15, stiffness: 100 }) // Settle back
    );

    translateX.value = withSpring(targetX, {
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    });
  }, [currentTabIndex, tabWidth, blobSize]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.blobContainer,
        {
          width: blobSize,
          height: blobSize,
          bottom: 5,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <BlurView
        intensity={120}
        tint={scheme === 'dark' ? 'light' : 'dark'}
        style={[
          styles.blob,
          {
            backgroundColor: scheme === 'dark'
              ? 'rgba(100, 200, 255, 0.4)'
              : 'rgba(59, 130, 246, 0.35)',
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  blobContainer: {
    position: 'absolute',
    zIndex: 1000,
    borderRadius: 1000,
  },
  blob: {
    flex: 1,
    borderRadius: 1000,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
});

import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export function useElectricBorder(isActive: boolean = true) {
  const electricProgress = useSharedValue(0);
  const electricOpacity = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      // Animate progress from 0 to 4 (4 edges: top, right, bottom, left)
      electricProgress.value = withRepeat(
        withTiming(4, { duration: 4500, easing: Easing.linear }),
        -1,
        false
      );

      // Pulsing opacity for glow effect
      electricOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.7, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      // Stop animations
      electricProgress.value = 0;
      electricOpacity.value = 0;
    }
  }, [isActive]);

  const electricStyle = useAnimatedStyle(() => {
    'worklet';
    if (!isActive) return { opacity: 0, top: 0, left: 0, width: 0, height: 0 };

    const progress = electricProgress.value % 4; // 0-4 for 4 edges
    const segmentLength = 30; // Percentage of edge
    const thickness = 3;

    if (progress < 1) {
      // Top edge: moving left to right
      const edgeProgress = progress;
      return {
        opacity: electricOpacity.value,
        top: 0,
        left: `${edgeProgress * (100 - segmentLength)}%`,
        width: `${segmentLength}%`,
        height: thickness,
      };
    } else if (progress < 2) {
      // Right edge: moving top to bottom
      const edgeProgress = progress - 1;
      return {
        opacity: electricOpacity.value,
        top: `${edgeProgress * (100 - segmentLength)}%`,
        left: `${100 - (thickness * 0.1)}%`, // Position exactly at right edge
        width: thickness,
        height: `${segmentLength}%`,
      };
    } else if (progress < 3) {
      // Bottom edge: moving right to left
      const edgeProgress = progress - 2;
      return {
        opacity: electricOpacity.value,
        top: `${100 - (thickness * 0.1)}%`, // Position exactly at bottom edge
        left: `${(1 - edgeProgress) * (100 - segmentLength)}%`,
        width: `${segmentLength}%`,
        height: thickness,
      };
    } else {
      // Left edge: moving bottom to top
      const edgeProgress = progress - 3;
      return {
        opacity: electricOpacity.value,
        top: `${(1 - edgeProgress) * (100 - segmentLength)}%`,
        left: 0,
        width: thickness,
        height: `${segmentLength}%`,
      };
    }
  });

  return electricStyle;
}

import { useEffect } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function useElectricBorder(isActive: boolean = true) {
  const electricProgress = useSharedValue(0);
  const electricOpacity = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      // Animate progress from 0 to 8 (4 edges + 4 corners for smooth rounding) - runs once
      electricProgress.value = withRepeat(
        withTiming(8, { duration: 5000, easing: Easing.linear }),
        0,
        false
      );

      // Pulsing opacity for glow effect - runs once
      electricOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.7, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        0,
        true
      );
    } else {
      // Reset animations
      electricProgress.value = 0;
      electricOpacity.value = 0;
    }
  }, [isActive]);

  const electricStyle = useAnimatedStyle(() => {
    'worklet';
    if (!isActive) return { opacity: 0, top: 0, left: 0, width: 0, height: 0 };

    const progress = electricProgress.value % 8; // 0-8 for smooth corner transitions
    const segmentLength = 30; // Percentage of edge
    const thickness = 1;
    const cornerTransition = 0.15; // Fast corner transition (almost instant)

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
    } else if (progress < 1 + cornerTransition) {
      // Top-right corner transition (invisible, just repositioning)
      return {
        opacity: 0, // Hide during corner transition
        top: 0,
        left: `100%`,
        width: 0,
        height: 0,
      };
    } else if (progress < 2 + cornerTransition) {
      // Right edge: moving top to bottom
      const edgeProgress = progress - (1 + cornerTransition);
      return {
        opacity: electricOpacity.value,
        top: `${edgeProgress * (100 - segmentLength)}%`,
        left: `${100 - (thickness * 0.1)}%`,
        width: thickness,
        height: `${segmentLength}%`,
      };
    } else if (progress < 3) {
      // Bottom-right corner transition (invisible)
      return {
        opacity: 0,
        top: `100%`,
        left: `100%`,
        width: 0,
        height: 0,
      };
    } else if (progress < 4) {
      // Bottom edge: moving right to left
      const edgeProgress = progress - 3;
      return {
        opacity: electricOpacity.value,
        top: `${100 - (thickness * 0.1)}%`,
        left: `${(1 - edgeProgress) * (100 - segmentLength)}%`,
        width: `${segmentLength}%`,
        height: thickness,
      };
    } else if (progress < 4.5) {
      // Bottom-left corner transition (invisible)
      return {
        opacity: 0,
        top: `100%`,
        left: 0,
        width: 0,
        height: 0,
      };
    } else if (progress < 6) {
      // Left edge: moving bottom to top
      const edgeProgress = progress - 4.5;
      return {
        opacity: electricOpacity.value,
        top: `${(1 - edgeProgress) * (100 - segmentLength)}%`,
        left: 0,
        width: thickness,
        height: `${segmentLength}%`,
      };
    } else {
      // Top-left corner transition (invisible)
      return {
        opacity: 0,
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      };
    }
  });

  return electricStyle;
}

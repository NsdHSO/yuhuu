import { Platform } from 'react-native';

/**
 * Check if the current platform supports native blur effects
 * @returns true if platform supports native blur
 */
export const supportsNativeBlur = (): boolean => {
  if (Platform.OS === 'android') {
    // Android 12 (API level 31) and above support native blur
    return Platform.Version >= 31;
  }
  // iOS always supports native blur
  return Platform.OS === 'ios';
};

/**
 * Get optimal blur intensity based on platform capabilities
 * @param requested - The requested blur intensity
 * @returns The optimal blur intensity for the current platform
 */
export const getOptimalBlurIntensity = (requested: number): number => {
  if (!supportsNativeBlur()) {
    // Fallback to lower intensity for platforms without native blur
    return Math.min(requested, 10);
  }
  return requested;
};

/**
 * Check if the platform should use performance rasterization
 * @returns true if rasterization should be enabled
 */
export const shouldRasterize = (): boolean => {
  // Enable rasterization on iOS for better performance on static elements
  return Platform.OS === 'ios';
};

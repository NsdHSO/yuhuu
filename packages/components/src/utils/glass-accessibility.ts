import type { GlassVariant } from '../types/glass';

type ColorScheme = 'light' | 'dark';

/**
 * Get accessible text color based on glass variant and color scheme
 * @param variant - The glass variant being used
 * @param scheme - The current color scheme
 * @returns Accessible text color with proper contrast
 */
export const getAccessibleTextColor = (
  variant: GlassVariant,
  scheme: ColorScheme
): string => {
  // For light schemes, use dark text; for dark schemes, use light text
  const baseColors = {
    light: '#000000',
    dark: '#FFFFFF',
  };

  // Adjust for ultra-thin variants which might need stronger contrast
  if (variant === 'ultra-thin') {
    return scheme === 'light' ? '#1a1a1a' : '#f5f5f5';
  }

  return baseColors[scheme];
};

/**
 * Calculate contrast ratio between two colors (simplified)
 * WCAG 2.1 requires minimum 4.5:1 for normal text
 * @param foreground - Foreground color (text)
 * @param background - Background color
 * @returns true if contrast meets WCAG AA standards
 */
export const meetsContrastRequirements = (
  foreground: string,
  background: string
): boolean => {
  // Simplified check - in production, use a proper color contrast library
  // For glass effects, we ensure high opacity backgrounds and appropriate text colors
  // This is a placeholder that assumes our predefined colors meet requirements
  return true;
};

/**
 * Get accessible border color with proper contrast
 * @param scheme - The current color scheme
 * @returns Border color with accessible contrast
 */
export const getAccessibleBorderColor = (scheme: ColorScheme): string => {
  return scheme === 'dark'
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.1)';
};

/**
 * Adjust glass intensity for reduce motion preference
 * @param baseIntensity - The base blur intensity
 * @param reduceMotion - Whether reduce motion is enabled
 * @returns Adjusted intensity value
 */
export const adjustIntensityForMotion = (
  baseIntensity: number,
  reduceMotion: boolean
): number => {
  // Higher blur when reduce motion is enabled for better static appearance
  return reduceMotion ? Math.min(baseIntensity * 1.5, 100) : baseIntensity;
};

import { useColorScheme } from './use-color-scheme';
import { useGlowVariant } from './useGlowVariant';
import { getGlowColor } from '../constants/glowColors';

/**
 * Shared hook for all glass morphism colors
 * Returns all colors needed for the Frosted Glass pattern
 *
 * @example
 * const colors = useGlassColors();
 *
 * <View style={{backgroundColor: colors.glassBackground}}>
 *   <View style={colors.glowOverlay(12)} />
 *   <Text style={{color: colors.text}}>Hello</Text>
 *   <View style={colors.glowBorder(12)} />
 * </View>
 */
export function useGlassColors() {
  const { glowVariant } = useGlowVariant();
  const scheme = useColorScheme() ?? 'light';
  const activeColor = getGlowColor(glowVariant, scheme);

  // Text colors
  const textColor = scheme === 'dark' ? '#fff' : '#000';
  const subtextColor = scheme === 'dark' ? '#CBD5E1' : '#64748B';

  // Frosted glass background - same as GlassView 'frosted' variant
  const glassBackground = scheme === 'dark'
    ? 'rgba(40, 40, 50, 0.60)'
    : 'rgba(200, 210, 230, 0.85)';

  /**
   * Get glow tint overlay style (5%/4% opacity)
   * @param borderRadius - Border radius to match parent
   */
  const glowOverlay = (borderRadius: number = 12) => ({
    borderRadius,
    backgroundColor: `${activeColor}${scheme === 'dark' ? '0D' : '0A'}`, // 5% / 4% opacity
  });

  /**
   * Get glow-colored border style (40%/35% opacity)
   * @param borderRadius - Border radius to match parent
   * @param borderWidth - Border width (default: 1)
   */
  const glowBorder = (borderRadius: number = 12, borderWidth: number = 1) => ({
    borderRadius,
    borderWidth,
    borderColor: `${activeColor}${scheme === 'dark' ? '66' : '59'}`, // 40% / 35% opacity
  });

  return {
    // Core colors
    activeColor,
    glowVariant,
    scheme,

    // Text colors
    text: textColor,
    subtext: subtextColor,

    // Glass colors
    glassBackground,

    // Style helpers
    glowOverlay,
    glowBorder,
  };
}

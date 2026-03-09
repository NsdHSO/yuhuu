/**
 * Shared glow color palette for glass morphism effects
 * Used across GlassBackground, GlassAccordion, and other glass components
 */

export type GlowVariant = 'subtle' | 'vibrant' | 'warm' | 'cool';
export type ColorScheme = 'light' | 'dark';

export const glowColors: Record<GlowVariant, Record<ColorScheme, string[]>> = {
  subtle: {
    light: ['#94A3B8'], // Soft slate - visible but subtle on white
    dark: ['#60A5FA'],  // Sky blue glow - visible in dark with elegance
  },
  vibrant: {
    light: ['#A78BFA'], // Soft purple - elegant and visible
    dark: ['#A78BFA'],  // Purple glow - maintains vibrancy in dark
  },
  warm: {
    light: ['#FB923C'], // Soft orange - warm but not overwhelming
    dark: ['#F59E0B'],  // Orange glow - cozy radiance
  },
  cool: {
    light: ['#60A5FA'], // Soft blue - gentle and fresh
    dark: ['#60A5FA'],  // Sky blue glow - serene consistency
  },
};

/**
 * Get glow color for a specific variant and color scheme
 */
export function getGlowColor(variant: GlowVariant, scheme: ColorScheme, index: number = 0): string {
  const colors = glowColors[variant][scheme];
  return colors[index] || colors[0];
}

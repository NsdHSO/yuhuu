import type { GlassVariant } from '../types/glass';

export const GLASS_VARIANTS: Record<GlassVariant, { tint: string; intensity: number; opacity: number }> = {
  frosted: { tint: 'light', intensity: 100, opacity: 0.12 },
  tinted: { tint: 'default', intensity: 90, opacity: 0.15 },
  vibrant: { tint: 'prominent', intensity: 100, opacity: 0.18 },
  'ultra-thin': { tint: 'regular', intensity: 60, opacity: 0.08 },
  prominent: { tint: 'prominent', intensity: 100, opacity: 0.25 },
};

export const GLASS_COLORS: Record<'light' | 'dark', Record<GlassVariant, string>> = {
  light: {
    frosted: 'rgba(255, 255, 255, 0.12)',
    tinted: 'rgba(248, 248, 248, 0.15)',
    vibrant: 'rgba(255, 255, 255, 0.18)',
    'ultra-thin': 'rgba(250, 250, 250, 0.08)',
    prominent: 'rgba(255, 255, 255, 0.35)',
  },
  dark: {
    frosted: 'rgba(40, 40, 50, 0.60)',
    tinted: 'rgba(35, 35, 45, 0.55)',
    vibrant: 'rgba(45, 45, 55, 0.65)',
    'ultra-thin': 'rgba(30, 30, 40, 0.50)',
    prominent: 'rgba(50, 50, 60, 0.70)',
  },
};

export const GLASS_SHADOWS = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8
  },
};

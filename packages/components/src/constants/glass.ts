import type { GlassVariant } from '../types/glass';

export const GLASS_VARIANTS: Record<GlassVariant, { tint: string; intensity: number; opacity: number }> = {
  frosted: { tint: 'light', intensity: 80, opacity: 0.12 },
  tinted: { tint: 'default', intensity: 70, opacity: 0.15 },
  vibrant: { tint: 'prominent', intensity: 90, opacity: 0.18 },
  'ultra-thin': { tint: 'regular', intensity: 30, opacity: 0.08 },
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
    frosted: 'rgba(40, 40, 45, 0.40)',
    tinted: 'rgba(45, 45, 50, 0.35)',
    vibrant: 'rgba(35, 35, 40, 0.38)',
    'ultra-thin': 'rgba(50, 50, 55, 0.25)',
    prominent: 'rgba(30, 30, 35, 0.50)',
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

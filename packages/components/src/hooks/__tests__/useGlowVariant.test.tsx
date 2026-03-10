import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { GlowVariantProvider, useGlowVariant } from '../useGlowVariant';
import type { GlowVariant } from '../../constants/glowColors';

describe('useGlowVariant', () => {
  const wrapper = ({ children, initialVariant }: { children: React.ReactNode; initialVariant?: GlowVariant }) => (
    <GlowVariantProvider initialVariant={initialVariant}>{children}</GlowVariantProvider>
  );

  describe('default behavior', () => {
    it('should return cool as the default glow variant', () => {
      const { result } = renderHook(() => useGlowVariant(), {
        wrapper: ({ children }) => wrapper({ children }),
      });

      expect(result.current.glowVariant).toBe('cool');
    });

    it('should return a setGlowVariant function', () => {
      const { result } = renderHook(() => useGlowVariant(), {
        wrapper: ({ children }) => wrapper({ children }),
      });

      expect(typeof result.current.setGlowVariant).toBe('function');
    });
  });

  describe('initial variant', () => {
    it('should use the provided initial variant', () => {
      const { result } = renderHook(() => useGlowVariant(), {
        wrapper: ({ children }) => wrapper({ children, initialVariant: 'warm' }),
      });

      expect(result.current.glowVariant).toBe('warm');
    });

    it('should accept all valid glow variants as initial', () => {
      const variants: GlowVariant[] = ['subtle', 'vibrant', 'warm', 'cool'];

      variants.forEach((variant) => {
        const { result } = renderHook(() => useGlowVariant(), {
          wrapper: ({ children }) => wrapper({ children, initialVariant: variant }),
        });

        expect(result.current.glowVariant).toBe(variant);
      });
    });
  });

  describe('setGlowVariant', () => {
    it('should update the glow variant', () => {
      const { result } = renderHook(() => useGlowVariant(), {
        wrapper: ({ children }) => wrapper({ children }),
      });

      act(() => {
        result.current.setGlowVariant('vibrant');
      });

      expect(result.current.glowVariant).toBe('vibrant');
    });

    it('should update to all valid variants', () => {
      const { result } = renderHook(() => useGlowVariant(), {
        wrapper: ({ children }) => wrapper({ children }),
      });

      const variants: GlowVariant[] = ['subtle', 'vibrant', 'warm', 'cool'];

      variants.forEach((variant) => {
        act(() => {
          result.current.setGlowVariant(variant);
        });

        expect(result.current.glowVariant).toBe(variant);
      });
    });
  });

  describe('without provider', () => {
    it('should return default values when used without provider', () => {
      const { result } = renderHook(() => useGlowVariant());

      expect(result.current.glowVariant).toBe('cool');
      expect(typeof result.current.setGlowVariant).toBe('function');
    });
  });

  describe('shared state', () => {
    it('should share state between consumers of the same provider', () => {
      const sharedWrapper = ({ children }: { children: React.ReactNode }) => (
        <GlowVariantProvider>{children}</GlowVariantProvider>
      );

      const { result: result1 } = renderHook(() => useGlowVariant(), {
        wrapper: sharedWrapper,
      });

      act(() => {
        result1.current.setGlowVariant('warm');
      });

      expect(result1.current.glowVariant).toBe('warm');
    });
  });
});

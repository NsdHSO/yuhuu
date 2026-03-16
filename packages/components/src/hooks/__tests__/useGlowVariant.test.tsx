import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { GlowVariantProvider, useGlowVariant } from '../useGlowVariant';
import type { GlowVariant } from '../../constants/glowColors';

// Mock the storage module
jest.mock('@yuhuu/storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

describe('useGlowVariant', () => {
  const wrapper = ({ children, initialVariant }: { children: React.ReactNode; initialVariant?: GlowVariant }) => (
    <GlowVariantProvider initialVariant={initialVariant}>{children}</GlowVariantProvider>
  );

  describe('default behavior', () => {
    it('should return cool as the default glow variant', async () => {
      const { result } = renderHook(() => useGlowVariant(), {
        wrapper: ({ children }) => wrapper({ children }),
      });

      await waitFor(() => {
        expect(result.current.glowVariant).toBe('cool');
      });
    });

    it('should return a setGlowVariant function', async () => {
      const { result } = renderHook(() => useGlowVariant(), {
        wrapper: ({ children }) => wrapper({ children }),
      });

      await waitFor(() => {
        expect(typeof result.current.setGlowVariant).toBe('function');
      });
    });
  });

  describe('initial variant', () => {
    it('should use the provided initial variant', async () => {
      const { result } = renderHook(() => useGlowVariant(), {
        wrapper: ({ children }) => wrapper({ children, initialVariant: 'warm' }),
      });

      await waitFor(() => {
        expect(result.current.glowVariant).toBe('warm');
      });
    });

    it('should accept all valid glow variants as initial', async () => {
      const variants: GlowVariant[] = ['subtle', 'vibrant', 'warm', 'cool'];

      for (const variant of variants) {
        const { result } = renderHook(() => useGlowVariant(), {
          wrapper: ({ children }) => wrapper({ children, initialVariant: variant }),
        });

        await waitFor(() => {
          expect(result.current.glowVariant).toBe(variant);
        });
      }
    });
  });

  describe('setGlowVariant', () => {
    it('should update the glow variant', async () => {
      const { result } = renderHook(() => useGlowVariant(), {
        wrapper: ({ children }) => wrapper({ children }),
      });

      await waitFor(() => {
        expect(result.current.glowVariant).toBe('cool');
      });

      act(() => {
        result.current.setGlowVariant('vibrant');
      });

      expect(result.current.glowVariant).toBe('vibrant');
    });

    it('should update to all valid variants', async () => {
      const { result } = renderHook(() => useGlowVariant(), {
        wrapper: ({ children }) => wrapper({ children }),
      });

      await waitFor(() => {
        expect(result.current.glowVariant).toBe('cool');
      });

      const variants: GlowVariant[] = ['subtle', 'vibrant', 'warm', 'cool'];

      for (const variant of variants) {
        act(() => {
          result.current.setGlowVariant(variant);
        });

        expect(result.current.glowVariant).toBe(variant);
      }
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
    it('should share state between consumers of the same provider', async () => {
      const sharedWrapper = ({ children }: { children: React.ReactNode }) => (
        <GlowVariantProvider>{children}</GlowVariantProvider>
      );

      const { result: result1 } = renderHook(() => useGlowVariant(), {
        wrapper: sharedWrapper,
      });

      await waitFor(() => {
        expect(result1.current.glowVariant).toBe('cool');
      });

      act(() => {
        result1.current.setGlowVariant('warm');
      });

      expect(result1.current.glowVariant).toBe('warm');
    });
  });
});

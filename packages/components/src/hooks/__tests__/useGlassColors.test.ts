import { renderHook } from '@testing-library/react-native';
import { useGlassColors } from '../useGlassColors';

// Mock dependencies
jest.mock('../use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

jest.mock('../useGlowVariant', () => ({
  useGlowVariant: jest.fn(() => ({ glowVariant: 'vibrant' })),
}));

jest.mock('../../constants/glowColors', () => ({
  getGlowColor: jest.fn(() => '#A78BFA'),
}));

describe('useGlassColors', () => {
  it('should return all glass colors and helpers', () => {
    const { result } = renderHook(() => useGlassColors());

    expect(result.current).toHaveProperty('activeColor');
    expect(result.current).toHaveProperty('glowVariant');
    expect(result.current).toHaveProperty('scheme');
    expect(result.current).toHaveProperty('text');
    expect(result.current).toHaveProperty('subtext');
    expect(result.current).toHaveProperty('glassBackground');
    expect(result.current).toHaveProperty('glowOverlay');
    expect(result.current).toHaveProperty('glowBorder');
  });

  it('should return correct light mode colors', () => {
    const { result } = renderHook(() => useGlassColors());

    expect(result.current.scheme).toBe('light');
    expect(result.current.text).toBe('#000');
    expect(result.current.subtext).toBe('#64748B');
    expect(result.current.glassBackground).toBe('rgba(200, 210, 230, 0.85)');
  });

  it('should return glowOverlay helper function', () => {
    const { result } = renderHook(() => useGlassColors());
    const overlay = result.current.glowOverlay(16);

    expect(overlay).toHaveProperty('borderRadius', 16);
    expect(overlay).toHaveProperty('backgroundColor');
    expect(overlay.backgroundColor).toContain('#A78BFA');
    expect(overlay.backgroundColor).toContain('0A'); // Light mode opacity
  });

  it('should return glowBorder helper function', () => {
    const { result } = renderHook(() => useGlassColors());
    const border = result.current.glowBorder(16, 2);

    expect(border).toHaveProperty('borderRadius', 16);
    expect(border).toHaveProperty('borderWidth', 2);
    expect(border).toHaveProperty('borderColor');
    expect(border.borderColor).toContain('#A78BFA');
    expect(border.borderColor).toContain('59'); // Light mode opacity
  });

  it('should use default border radius and width', () => {
    const { result } = renderHook(() => useGlassColors());
    const overlay = result.current.glowOverlay();
    const border = result.current.glowBorder();

    expect(overlay.borderRadius).toBe(12);
    expect(border.borderRadius).toBe(12);
    expect(border.borderWidth).toBe(1);
  });
});

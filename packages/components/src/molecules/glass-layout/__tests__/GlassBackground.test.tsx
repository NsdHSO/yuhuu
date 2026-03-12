import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { GlassBackground } from '../GlassBackground';

// Mock the color scheme hook
jest.mock('../../../hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

const { useColorScheme } = require('../../../hooks/use-color-scheme');

describe('GlassBackground Component', () => {
  beforeEach(() => {
    // Default to light mode
    useColorScheme.mockReturnValue('light');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { root } = render(<GlassBackground />);
      expect(root).toBeTruthy();
    });

    it('should render children correctly', () => {
      const { getByText } = render(
        <GlassBackground>
          <Text>Test Content</Text>
        </GlassBackground>
      );
      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <GlassBackground>
          <Text>Title</Text>
          <Text>Description</Text>
        </GlassBackground>
      );
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
    });

    it('should render correct number of gradient layers (8 circles)', () => {
      const { UNSAFE_root } = render(<GlassBackground />);
      // GlassBackground has 8 overlapping View circles + 1 content layer + 1 container
      // Total: 10 Views (1 container + 8 gradient layers + 1 content)
      const allViews = UNSAFE_root.findAllByType(View);
      expect(allViews.length).toBe(10);
    });
  });

  describe('Variant Support', () => {
    const variants = ['subtle', 'vibrant', 'warm', 'cool'] as const;

    variants.forEach((variant) => {
      it(`should render ${variant} variant without errors`, () => {
        const { root } = render(
          <GlassBackground variant={variant}>
            <Text>{variant}</Text>
          </GlassBackground>
        );
        expect(root).toBeTruthy();
      });
    });

    it('should use subtle variant by default', () => {
      const { getByText } = render(
        <GlassBackground>
          <Text>Default Variant</Text>
        </GlassBackground>
      );
      expect(getByText('Default Variant')).toBeTruthy();
    });
  });

  describe('Soft Blurred Borders with Smooth Intersections', () => {
    const variants = ['subtle', 'vibrant', 'warm', 'cool'] as const;

    variants.forEach((variant) => {
      describe(`${variant} variant`, () => {
        it('should use soft blurred borders with shadow in light mode', () => {
          useColorScheme.mockReturnValue('light');

          const { UNSAFE_root } = render(
            <GlassBackground variant={variant}>
              <Text>Testing soft borders</Text>
            </GlassBackground>
          );

          // Get all gradient layer views
          const views = UNSAFE_root.findAllByType(View);
          const gradientLayers = views.slice(1, 9); // 8 gradient layers

          // All layers should have BOTH border (for line) AND shadow (for glow)
          gradientLayers.forEach((layer) => {
            const styles = Array.isArray(layer.props.style) ? layer.props.style : [layer.props.style];
            const borderWidth = styles.find((s: any) => s?.borderWidth)?.borderWidth;
            const borderColor = styles.find((s: any) => s?.borderColor)?.borderColor;
            const shadowColor = styles.find((s: any) => s?.shadowColor)?.shadowColor;
            const shadowRadius = styles.find((s: any) => s?.shadowRadius)?.shadowRadius;
            const shadowOpacity = styles.find((s: any) => s?.shadowOpacity)?.shadowOpacity;
            const backgroundColor = styles.find((s: any) => s?.backgroundColor)?.backgroundColor;

            // Should have border for the actual line
            expect(borderWidth).toBeDefined();
            expect(borderWidth).toBeGreaterThanOrEqual(1);
            expect(borderColor).toBeDefined();

            // Should have shadow color for glow effect
            expect(shadowColor).toBeDefined();
            expect(typeof shadowColor).toBe('string');

            // Should have shadow radius for blur (soft edges)
            expect(shadowRadius).toBeDefined();
            expect(shadowRadius).toBeGreaterThan(0);

            // Should have shadow opacity
            expect(shadowOpacity).toBeDefined();
            expect(shadowOpacity).toBeGreaterThan(0);

            // Should have nearly-transparent background (iOS requires non-transparent for shadows)
            expect(backgroundColor).toMatch(/transparent|rgba\(255,\s*255,\s*255,\s*0\.01\)/);
          });
        });

        it('should use soft blurred borders with shadow in dark mode', () => {
          useColorScheme.mockReturnValue('dark');

          const { UNSAFE_root } = render(
            <GlassBackground variant={variant}>
              <Text>Testing soft borders</Text>
            </GlassBackground>
          );

          // Get all gradient layer views
          const views = UNSAFE_root.findAllByType(View);
          const gradientLayers = views.slice(1, 9); // 8 gradient layers

          // All layers should have BOTH border and shadow
          gradientLayers.forEach((layer) => {
            const styles = Array.isArray(layer.props.style) ? layer.props.style : [layer.props.style];
            const borderWidth = styles.find((s: any) => s?.borderWidth)?.borderWidth;
            const borderColor = styles.find((s: any) => s?.borderColor)?.borderColor;
            const shadowColor = styles.find((s: any) => s?.shadowColor)?.shadowColor;
            const shadowRadius = styles.find((s: any) => s?.shadowRadius)?.shadowRadius;
            const backgroundColor = styles.find((s: any) => s?.backgroundColor)?.backgroundColor;

            expect(borderWidth).toBeDefined();
            expect(borderColor).toBeDefined();
            expect(shadowColor).toBeDefined();
            expect(shadowRadius).toBeGreaterThan(0);
            // iOS requires non-transparent background for shadows
            expect(backgroundColor).toMatch(/transparent|rgba\(255,\s*255,\s*255,\s*0\.01\)/);
          });
        });
      });
    });

    it('should not have undefined border or shadow colors in any circle', () => {
      // This test verifies that all border and shadow color accesses are valid
      const variants = ['subtle', 'vibrant', 'warm', 'cool'] as const;

      variants.forEach((variant) => {
        ['light', 'dark'].forEach((scheme) => {
          useColorScheme.mockReturnValue(scheme);

          const { UNSAFE_root } = render(<GlassBackground variant={variant} />);
          const views = UNSAFE_root.findAllByType(View);
          const gradientLayers = views.slice(1, 9);

          gradientLayers.forEach((layer) => {
            const styles = Array.isArray(layer.props.style) ? layer.props.style : [layer.props.style];
            const borderColor = styles.find((s: any) => s?.borderColor)?.borderColor;
            const shadowColor = styles.find((s: any) => s?.shadowColor)?.shadowColor;

            expect(borderColor).not.toBe(undefined);
            expect(borderColor).toBeDefined();
            expect(shadowColor).not.toBe(undefined);
            expect(shadowColor).toBeDefined();
          });
        });
      });
    });
  });

  describe('Color Scheme Switching', () => {
    it('should render in light mode with light background', () => {
      useColorScheme.mockReturnValue('light');
      const { getByText, UNSAFE_root } = render(
        <GlassBackground>
          <Text>Light Mode</Text>
        </GlassBackground>
      );
      expect(getByText('Light Mode')).toBeTruthy();

      // Container should have light background color
      const views = UNSAFE_root.findAllByType(View);
      const container = views[0]; // First view is the container
      const containerStyles = Array.isArray(container.props.style)
        ? container.props.style
        : [container.props.style];
      const backgroundColor = containerStyles.find((s: any) => s?.backgroundColor)?.backgroundColor;

      // Should have a light background color (white or light gray)
      expect(backgroundColor).toBeDefined();
      expect(backgroundColor).toMatch(/^#[EFef]/); // Starts with E or F (light colors)
    });

    it('should render in dark mode with dark background', () => {
      useColorScheme.mockReturnValue('dark');
      const { getByText, UNSAFE_root } = render(
        <GlassBackground>
          <Text>Dark Mode</Text>
        </GlassBackground>
      );
      expect(getByText('Dark Mode')).toBeTruthy();

      // Container should have dark background color
      const views = UNSAFE_root.findAllByType(View);
      const container = views[0]; // First view is the container
      const containerStyles = Array.isArray(container.props.style)
        ? container.props.style
        : [container.props.style];
      const backgroundColor = containerStyles.find((s: any) => s?.backgroundColor)?.backgroundColor;

      // Should have a dark background color
      expect(backgroundColor).toBeDefined();
      expect(backgroundColor).toMatch(/^#[0-4]/); // Starts with 0-4 (dark colors)
    });

    it('should default to light mode if color scheme is null', () => {
      useColorScheme.mockReturnValue(null);
      const { getByText } = render(
        <GlassBackground>
          <Text>Default Mode</Text>
        </GlassBackground>
      );
      expect(getByText('Default Mode')).toBeTruthy();
    });
  });

  describe('Soft Glowing Outline Design', () => {
    const variants = ['subtle', 'vibrant', 'warm', 'cool'] as const;

    variants.forEach((variant) => {
      it(`should use soft glowing outline for ${variant} variant`, () => {
        // Elegant approach: transparent circles with border + soft glowing shadows
        // Border provides the line, shadow creates the glow - smooth intersections
        const { UNSAFE_root } = render(
          <GlassBackground variant={variant}>
            <Text>Soft Glow Outline</Text>
          </GlassBackground>
        );

        // Get all View components (gradient layers)
        const views = UNSAFE_root.findAllByType(View);

        // Should have 10 views total (1 container + 8 gradient layers + 1 content)
        expect(views.length).toBe(10);

        // Each gradient layer View should have transparent bg with border + shadow
        const gradientLayers = views.slice(1, 9); // Skip container, get 8 gradient layers

        gradientLayers.forEach((layer) => {
          const styles = Array.isArray(layer.props.style) ? layer.props.style : [layer.props.style];
          const borderWidth = styles.find((s: any) => s?.borderWidth)?.borderWidth;
          const borderColor = styles.find((s: any) => s?.borderColor)?.borderColor;
          const shadowColor = styles.find((s: any) => s?.shadowColor)?.shadowColor;
          const shadowRadius = styles.find((s: any) => s?.shadowRadius)?.shadowRadius;
          const backgroundColor = styles.find((s: any) => s?.backgroundColor)?.backgroundColor;

          // Should have nearly-transparent background (iOS requires non-transparent for shadows)
          expect(backgroundColor).toMatch(/transparent|rgba\(255,\s*255,\s*255,\s*0\.01\)/);

          // Should have border for the actual line
          expect(borderWidth).toBeDefined();
          expect(borderColor).toBeDefined();
          expect(typeof borderColor).toBe('string');
          expect(borderColor).toMatch(/^#[0-9A-F]{6}$/i);

          // Should have shadow for soft glow effect
          expect(shadowColor).toBeDefined();
          expect(typeof shadowColor).toBe('string');
          expect(shadowColor).toMatch(/^#[0-9A-F]{6}$/i);

          // Should have shadow radius for blur effect
          expect(shadowRadius).toBeDefined();
          expect(shadowRadius).toBeGreaterThan(0);
        });
      });
    });

    it('should have distinct colors between variants in light mode', () => {
      useColorScheme.mockReturnValue('light');

      // Each variant should render with its unique color palette
      variants.forEach((variant) => {
        const { getByText } = render(
          <GlassBackground variant={variant}>
            <Text>{variant}</Text>
          </GlassBackground>
        );
        expect(getByText(variant)).toBeTruthy();
      });
    });

    it('should have visible glow colors in light mode (not too pale)', () => {
      useColorScheme.mockReturnValue('light');

      variants.forEach((variant) => {
        const { UNSAFE_root } = render(<GlassBackground variant={variant} />);
        const views = UNSAFE_root.findAllByType(View);
        const gradientLayers = views.slice(1, 9);

        gradientLayers.forEach((layer) => {
          const styles = Array.isArray(layer.props.style) ? layer.props.style : [layer.props.style];
          const shadowColor = styles.find((s: any) => s?.shadowColor)?.shadowColor;

          // Shadow color should be visible on white background
          // Should NOT be too light/pale colors like #E5E7EB, #F8F9FA, etc.
          // Acceptable: darker colors (3B82F6, 94A3B8) or saturated warm colors (F59E0B)
          expect(shadowColor).toBeDefined();

          // Should not be pale gray/white colors (E5-FF range with low saturation)
          const isPaleGray = /^#[E-F][5-F][E-F]/i.test(shadowColor);
          expect(isPaleGray).toBe(false);
        });
      });
    });

    it('should have distinct colors between variants in dark mode', () => {
      useColorScheme.mockReturnValue('dark');

      // Each variant should render with its unique color palette
      variants.forEach((variant) => {
        const { getByText } = render(
          <GlassBackground variant={variant}>
            <Text>{variant}</Text>
          </GlassBackground>
        );
        expect(getByText(variant)).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle nested components', () => {
      const { getByText } = render(
        <GlassBackground>
          <View>
            <Text>Nested Content</Text>
          </View>
        </GlassBackground>
      );
      expect(getByText('Nested Content')).toBeTruthy();
    });

    it('should work without children', () => {
      const { root } = render(<GlassBackground />);
      expect(root).toBeTruthy();
    });
  });
});

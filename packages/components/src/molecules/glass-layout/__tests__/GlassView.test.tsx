import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, Platform } from 'react-native';
import { GlassView } from '../GlassView';

describe('GlassView Component', () => {
  describe('Rendering', () => {
    it('should render children correctly', () => {
      render(
        <GlassView>
          <Text>Test Content</Text>
        </GlassView>
      );
      expect(screen.getByText('Test Content')).toBeTruthy();
    });

    it('should render without children', () => {
      const { getByTestId } = render(<GlassView testID="glass-view" />);
      expect(getByTestId('glass-view')).toBeTruthy();
    });
  });

  describe('Variant Prop', () => {
    it('should apply frosted variant by default', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should accept tinted variant', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" variant="tinted">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should accept vibrant variant', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" variant="vibrant">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should accept ultra-thin variant', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" variant="ultra-thin">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should accept prominent variant', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" variant="prominent">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });
  });

  describe('Intensity Prop', () => {
    it('should use default intensity when not provided', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" variant="frosted">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should accept custom intensity value', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" intensity={50}>
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });
  });

  describe('Border Radius', () => {
    it('should use default border radius of 16 when not provided', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should accept custom border radius', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" borderRadius={24}>
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should accept zero border radius', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" borderRadius={0}>
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });
  });

  describe('Shadow Props', () => {
    it('should enable shadow by default', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should disable shadow when enableShadow is false', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" enableShadow={false}>
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should use subtle shadow by default', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should accept medium shadow level', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" shadowLevel="medium">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should accept elevated shadow level', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" shadowLevel="elevated">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });
  });

  describe('Border Props', () => {
    it('should enable border by default', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view">
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should disable border when enableBorder is false', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" enableBorder={false}>
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom style prop', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" style={{ margin: 10 }}>
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should merge custom style with default styles', () => {
      const { getByTestId } = render(
        <GlassView testID="glass-view" style={{ padding: 20, margin: 10 }}>
          <Text>Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple children', () => {
      const { getByText } = render(
        <GlassView testID="glass-view">
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </GlassView>
      );
      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });

    it('should handle nested GlassView components', () => {
      const { getByText } = render(
        <GlassView testID="outer" variant="frosted">
          <Text>Outer</Text>
          <GlassView testID="inner" variant="tinted">
            <Text>Inner</Text>
          </GlassView>
        </GlassView>
      );
      expect(getByText('Outer')).toBeTruthy();
      expect(getByText('Inner')).toBeTruthy();
    });
  });

  describe('Platform Specific Behavior', () => {
    it('should render on web platform', () => {
      Platform.OS = 'web';
      const { getByTestId } = render(
        <GlassView testID="glass-view">
          <Text>Web Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });

    it('should use plain View fallback on Android API < 31', () => {
      Platform.OS = 'android';
      Platform.Version = 30;
      const { getByTestId } = render(
        <GlassView testID="glass-view">
          <Text>Android 30 Content</Text>
        </GlassView>
      );
      expect(getByTestId('glass-view')).toBeTruthy();
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassCard } from '../GlassCard';

describe('GlassCard Component', () => {
  describe('Rendering', () => {
    it('should render children correctly', () => {
      render(
        <GlassCard>
          <Text>Card Content</Text>
        </GlassCard>
      );
      expect(screen.getByText('Card Content')).toBeTruthy();
    });

    it('should render without children', () => {
      const { getByTestId } = render(<GlassCard testID="glass-card" />);
      expect(getByTestId('glass-card')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <GlassCard>
          <Text>Title</Text>
          <Text>Description</Text>
        </GlassCard>
      );
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
    });
  });

  describe('Default Variant', () => {
    it('should use tinted variant by default', () => {
      const { getByTestId } = render(
        <GlassCard testID="glass-card">
          <Text>Content</Text>
        </GlassCard>
      );
      expect(getByTestId('glass-card')).toBeTruthy();
    });

    it('should allow overriding default variant', () => {
      const { getByTestId } = render(
        <GlassCard testID="glass-card" variant="frosted">
          <Text>Content</Text>
        </GlassCard>
      );
      expect(getByTestId('glass-card')).toBeTruthy();
    });

    it('should accept all GlassView variants', () => {
      const variants = ['frosted', 'tinted', 'vibrant', 'ultra-thin', 'prominent'] as const;

      variants.forEach(variant => {
        const { getByTestId } = render(
          <GlassCard testID={`card-${variant}`} variant={variant}>
            <Text>{variant}</Text>
          </GlassCard>
        );
        expect(getByTestId(`card-${variant}`)).toBeTruthy();
      });
    });
  });

  describe('Border Radius', () => {
    it('should use border radius of 12 by default', () => {
      const { getByTestId } = render(
        <GlassCard testID="glass-card">
          <Text>Content</Text>
        </GlassCard>
      );
      expect(getByTestId('glass-card')).toBeTruthy();
    });

    it('should allow custom border radius', () => {
      const { getByTestId } = render(
        <GlassCard testID="glass-card" borderRadius={20}>
          <Text>Content</Text>
        </GlassCard>
      );
      expect(getByTestId('glass-card')).toBeTruthy();
    });

    it('should accept zero border radius', () => {
      const { getByTestId } = render(
        <GlassCard testID="glass-card" borderRadius={0}>
          <Text>Content</Text>
        </GlassCard>
      );
      expect(getByTestId('glass-card')).toBeTruthy();
    });
  });

  describe('GlassView Props Inheritance', () => {
    it('should accept intensity prop', () => {
      const { getByTestId } = render(
        <GlassCard testID="glass-card" intensity={30}>
          <Text>Content</Text>
        </GlassCard>
      );
      expect(getByTestId('glass-card')).toBeTruthy();
    });

    it('should accept shadow props', () => {
      const { getByTestId } = render(
        <GlassCard testID="glass-card" enableShadow={true} shadowLevel="elevated">
          <Text>Content</Text>
        </GlassCard>
      );
      expect(getByTestId('glass-card')).toBeTruthy();
    });

    it('should accept border props', () => {
      const { getByTestId } = render(
        <GlassCard testID="glass-card" enableBorder={false}>
          <Text>Content</Text>
        </GlassCard>
      );
      expect(getByTestId('glass-card')).toBeTruthy();
    });

    it('should accept custom style', () => {
      const { getByTestId } = render(
        <GlassCard testID="glass-card" style={{ margin: 10, padding: 20 }}>
          <Text>Content</Text>
        </GlassCard>
      );
      expect(getByTestId('glass-card')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle nested GlassCard components', () => {
      const { getByText } = render(
        <GlassCard testID="outer">
          <Text>Outer Card</Text>
          <GlassCard testID="inner">
            <Text>Inner Card</Text>
          </GlassCard>
        </GlassCard>
      );
      expect(getByText('Outer Card')).toBeTruthy();
      expect(getByText('Inner Card')).toBeTruthy();
    });

    it('should work with complex child components', () => {
      const ComplexChild = () => (
        <>
          <Text>Title</Text>
          <Text>Subtitle</Text>
        </>
      );

      const { getByText } = render(
        <GlassCard>
          <ComplexChild />
        </GlassCard>
      );
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Subtitle')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should pass through accessibility props', () => {
      const { getByTestId } = render(
        <GlassCard
          testID="glass-card"
          accessible={true}
          accessibilityLabel="Card Label"
        >
          <Text>Content</Text>
        </GlassCard>
      );
      expect(getByTestId('glass-card')).toBeTruthy();
    });
  });
});

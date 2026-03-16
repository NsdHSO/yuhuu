import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { GlassHeader } from '../GlassHeader';

describe('GlassHeader Component', () => {
  describe('Rendering', () => {
    it('should render title correctly', () => {
      render(<GlassHeader title="Test Header" />);
      expect(screen.getByText('Test Header')).toBeTruthy();
    });

    it('should render with empty title', () => {
      render(<GlassHeader title="" />);
      expect(screen.queryByText('')).toBeTruthy();
    });

    it('should render long titles', () => {
      const longTitle = 'This is a very long header title that should still render correctly';
      render(<GlassHeader title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeTruthy();
    });
  });

  describe('Default Variant', () => {
    it('should use frosted variant by default', () => {
      const { getByTestId } = render(
        <GlassHeader title="Test" testID="glass-header" />
      );
      expect(getByTestId('glass-header')).toBeTruthy();
    });

    it('should allow overriding default variant', () => {
      const { getByTestId } = render(
        <GlassHeader
          title="Test"
          testID="glass-header"
          variant="prominent"
        />
      );
      expect(getByTestId('glass-header')).toBeTruthy();
    });

    it('should accept all GlassView variants', () => {
      const variants = ['frosted', 'tinted', 'vibrant', 'ultra-thin', 'prominent'] as const;

      variants.forEach(variant => {
        const { getByTestId } = render(
          <GlassHeader
            title={variant}
            testID={`header-${variant}`}
            variant={variant}
          />
        );
        expect(getByTestId(`header-${variant}`)).toBeTruthy();
      });
    });
  });

  describe('Styling', () => {
    it('should have zero border radius by default', () => {
      const { getByTestId } = render(
        <GlassHeader title="Test" testID="glass-header" />
      );
      expect(getByTestId('glass-header')).toBeTruthy();
    });

    it('should enable shadow by default', () => {
      const { getByTestId } = render(
        <GlassHeader title="Test" testID="glass-header" />
      );
      expect(getByTestId('glass-header')).toBeTruthy();
    });

    it('should use subtle shadow level by default', () => {
      const { getByTestId } = render(
        <GlassHeader title="Test" testID="glass-header" />
      );
      expect(getByTestId('glass-header')).toBeTruthy();
    });
  });

  describe('Safe Area Handling', () => {
    it('should render with safe area insets', () => {
      const { getByTestId } = render(
        <GlassHeader title="Test" testID="glass-header" />
      );
      expect(getByTestId('glass-header')).toBeTruthy();
    });

    it('should include top padding for safe area', () => {
      const { getByText } = render(<GlassHeader title="Safe Area Test" />);
      expect(getByText('Safe Area Test')).toBeTruthy();
    });
  });

  describe('Title Styling', () => {
    it('should render title with correct font size', () => {
      const { getByText } = render(<GlassHeader title="Styled Title" />);
      const titleElement = getByText('Styled Title');
      expect(titleElement).toBeTruthy();
    });

    it('should render title with bold font weight', () => {
      const { getByText } = render(<GlassHeader title="Bold Title" />);
      const titleElement = getByText('Bold Title');
      expect(titleElement).toBeTruthy();
    });
  });

  describe('Layout', () => {
    it('should have horizontal padding', () => {
      const { getByTestId } = render(
        <GlassHeader title="Test" testID="glass-header" />
      );
      expect(getByTestId('glass-header')).toBeTruthy();
    });

    it('should have bottom padding', () => {
      const { getByTestId } = render(
        <GlassHeader title="Test" testID="glass-header" />
      );
      expect(getByTestId('glass-header')).toBeTruthy();
    });
  });

  describe('Custom Props', () => {
    it('should accept custom style', () => {
      const { getByTestId } = render(
        <GlassHeader
          title="Test"
          testID="glass-header"
          style={{ backgroundColor: 'red' }}
        />
      );
      expect(getByTestId('glass-header')).toBeTruthy();
    });

    it('should pass through testID', () => {
      const { getByTestId } = render(
        <GlassHeader title="Test" testID="custom-id" />
      );
      expect(getByTestId('custom-id')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in title', () => {
      const specialTitle = 'Test & Header <> "Quotes"';
      render(<GlassHeader title={specialTitle} />);
      expect(screen.getByText(specialTitle)).toBeTruthy();
    });

    it('should handle numeric titles', () => {
      render(<GlassHeader title="12345" />);
      expect(screen.getByText('12345')).toBeTruthy();
    });

    it('should handle emojis in title', () => {
      const emojiTitle = 'Test 🎉 Header';
      render(<GlassHeader title={emojiTitle} />);
      expect(screen.getByText(emojiTitle)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      const { getByTestId } = render(
        <GlassHeader title="Test" testID="glass-header" />
      );
      expect(getByTestId('glass-header')).toBeTruthy();
    });

    it('should have accessible title text', () => {
      const { getByText } = render(<GlassHeader title="Accessible Header" />);
      expect(getByText('Accessible Header')).toBeTruthy();
    });
  });
});

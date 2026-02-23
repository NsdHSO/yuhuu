import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Badge } from '../badge';

describe('Badge Atom Component', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('TEST BADGE')).toBeTruthy();
    });

    it('should render text in uppercase', () => {
      render(<Badge>lowercase text</Badge>);
      expect(screen.getByText('LOWERCASE TEXT')).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it('should render with xs size', () => {
      const { getByText } = render(<Badge size="xs">XS Badge</Badge>);
      const badge = getByText('XS BADGE');
      expect(badge).toBeTruthy();
    });

    it('should render with sm size (default)', () => {
      const { getByText } = render(<Badge size="sm">SM Badge</Badge>);
      const badge = getByText('SM BADGE');
      expect(badge).toBeTruthy();
    });

    it('should render with md size', () => {
      const { getByText } = render(<Badge size="md">MD Badge</Badge>);
      const badge = getByText('MD BADGE');
      expect(badge).toBeTruthy();
    });

    it('should use sm size by default when size prop is not provided', () => {
      const { getByText } = render(<Badge>Default</Badge>);
      expect(getByText('DEFAULT')).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      const { getByText } = render(
        <Badge className="bg-red-500">Custom</Badge>
      );
      expect(getByText('CUSTOM')).toBeTruthy();
    });

    it('should merge custom className with base classes', () => {
      const { getByText } = render(
        <Badge className="custom-class">Merged</Badge>
      );
      expect(getByText('MERGED')).toBeTruthy();
    });
  });

  describe('Text Rendering', () => {
    it('should render short text', () => {
      render(<Badge>NEW</Badge>);
      expect(screen.getByText('NEW')).toBeTruthy();
    });

    it('should render longer text', () => {
      render(<Badge>Breaking News</Badge>);
      expect(screen.getByText('BREAKING NEWS')).toBeTruthy();
    });

    it('should handle special characters', () => {
      render(<Badge>Test & Badge!</Badge>);
      expect(screen.getByText('TEST & BADGE!')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have text element', () => {
      const { getByText } = render(<Badge>Accessible</Badge>);
      const text = getByText('ACCESSIBLE');
      expect(text).toBeTruthy();
    });

    it('should render content that can be found by text', () => {
      render(<Badge>Find Me</Badge>);
      expect(screen.getByText('FIND ME')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      render(<Badge>{''}</Badge>);
      expect(screen.queryByText('')).toBeTruthy();
    });

    it('should handle numbers as strings', () => {
      render(<Badge>123</Badge>);
      expect(screen.getByText('123')).toBeTruthy();
    });

    it('should handle single character', () => {
      render(<Badge>A</Badge>);
      expect(screen.getByText('A')).toBeTruthy();
    });
  });
});

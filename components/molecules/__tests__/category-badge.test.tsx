import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CategoryBadge } from '../category-badge';

describe('CategoryBadge Molecule Component', () => {
  describe('Rendering', () => {
    it('should render category text', () => {
      render(<CategoryBadge category="INCIDENT" />);
      expect(screen.getByText('INCIDENT')).toBeTruthy();
    });

    it('should render category text in uppercase', () => {
      render(<CategoryBadge category="sport" />);
      expect(screen.getByText('SPORT')).toBeTruthy();
    });
  });

  describe('Category Color Mapping', () => {
    it('should handle "marius tucă show" category', () => {
      const { getByText } = render(<CategoryBadge category="marius tucă show" />);
      expect(getByText('MARIUS TUCĂ SHOW')).toBeTruthy();
    });

    it('should handle "finanțe" category', () => {
      const { getByText } = render(<CategoryBadge category="finanțe" />);
      expect(getByText('FINANȚE')).toBeTruthy();
    });

    it('should handle "știri politice" category', () => {
      const { getByText } = render(<CategoryBadge category="știri politice" />);
      expect(getByText('ȘTIRI POLITICE')).toBeTruthy();
    });

    it('should handle "sport" category', () => {
      const { getByText } = render(<CategoryBadge category="sport" />);
      expect(getByText('SPORT')).toBeTruthy();
    });

    it('should handle "știri externe" category', () => {
      const { getByText } = render(<CategoryBadge category="știri externe" />);
      expect(getByText('ȘTIRI EXTERNE')).toBeTruthy();
    });

    it('should handle "social" category', () => {
      const { getByText } = render(<CategoryBadge category="social" />);
      expect(getByText('SOCIAL')).toBeTruthy();
    });

    it('should handle "actualitate" category', () => {
      const { getByText } = render(<CategoryBadge category="actualitate" />);
      expect(getByText('ACTUALITATE')).toBeTruthy();
    });

    it('should handle "culturǎ" category', () => {
      const { getByText } = render(<CategoryBadge category="culturǎ" />);
      expect(getByText('CULTURǍ')).toBeTruthy();
    });
  });

  describe('Case Insensitivity', () => {
    it('should handle uppercase category names', () => {
      const { getByText } = render(<CategoryBadge category="SPORT" />);
      expect(getByText('SPORT')).toBeTruthy();
    });

    it('should handle lowercase category names', () => {
      const { getByText } = render(<CategoryBadge category="sport" />);
      expect(getByText('SPORT')).toBeTruthy();
    });

    it('should handle mixed case category names', () => {
      const { getByText } = render(<CategoryBadge category="SpOrT" />);
      expect(getByText('SPORT')).toBeTruthy();
    });
  });

  describe('Default Category Fallback', () => {
    it('should use default color for unknown category', () => {
      const { getByText } = render(<CategoryBadge category="unknown" />);
      expect(getByText('UNKNOWN')).toBeTruthy();
    });

    it('should use default color for empty category', () => {
      const { getByText } = render(<CategoryBadge category="" />);
      expect(getByText('')).toBeTruthy();
    });

    it('should use default color for special characters', () => {
      const { getByText } = render(<CategoryBadge category="test@123" />);
      expect(getByText('TEST@123')).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it('should render with xs size (default)', () => {
      const { getByText } = render(<CategoryBadge category="sport" size="xs" />);
      expect(getByText('SPORT')).toBeTruthy();
    });

    it('should render with sm size', () => {
      const { getByText } = render(<CategoryBadge category="sport" size="sm" />);
      expect(getByText('SPORT')).toBeTruthy();
    });

    it('should render with md size', () => {
      const { getByText } = render(<CategoryBadge category="sport" size="md" />);
      expect(getByText('SPORT')).toBeTruthy();
    });

    it('should use xs size by default', () => {
      const { getByText } = render(<CategoryBadge category="sport" />);
      expect(getByText('SPORT')).toBeTruthy();
    });
  });

  describe('Integration with Badge', () => {
    it('should pass category text to Badge component', () => {
      const { getByText } = render(<CategoryBadge category="incident" />);
      const badgeText = getByText('INCIDENT');
      expect(badgeText).toBeTruthy();
    });

    it('should pass size prop to Badge component', () => {
      const { getByText } = render(<CategoryBadge category="sport" size="md" />);
      const badgeText = getByText('SPORT');
      expect(badgeText).toBeTruthy();
    });
  });

  describe('Special Characters and Romanian Diacritics', () => {
    it('should handle Romanian diacritics in category names', () => {
      const { getByText } = render(<CategoryBadge category="culturǎ" />);
      expect(getByText('CULTURǍ')).toBeTruthy();
    });

    it('should handle category with ă character', () => {
      const { getByText } = render(<CategoryBadge category="finanțe" />);
      expect(getByText('FINANȚE')).toBeTruthy();
    });

    it('should handle category with ș character', () => {
      const { getByText } = render(<CategoryBadge category="știri politice" />);
      expect(getByText('ȘTIRI POLITICE')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long category names', () => {
      const longCategory = 'very long category name that should still work';
      const { getByText } = render(<CategoryBadge category={longCategory} />);
      expect(getByText(longCategory.toUpperCase())).toBeTruthy();
    });

    it('should handle single character category', () => {
      const { getByText } = render(<CategoryBadge category="A" />);
      expect(getByText('A')).toBeTruthy();
    });

    it('should handle category with numbers', () => {
      const { getByText } = render(<CategoryBadge category="tech2024" />);
      expect(getByText('TECH2024')).toBeTruthy();
    });
  });
});

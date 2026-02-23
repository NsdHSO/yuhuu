import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThemedText } from '../themed-text';

describe('ThemedText Component', () => {
  describe('Basic Rendering', () => {
    it('should render children text', () => {
      render(<ThemedText>Test Text</ThemedText>);
      expect(screen.getByText('Test Text')).toBeTruthy();
    });

    it('should render empty text', () => {
      render(<ThemedText>{''}</ThemedText>);
      expect(screen.queryByText('')).toBeTruthy();
    });

    it('should render long text', () => {
      const longText = 'Lorem ipsum dolor sit amet'.repeat(10);
      render(<ThemedText>{longText}</ThemedText>);
      expect(screen.getByText(longText)).toBeTruthy();
    });
  });

  describe('Semantic Type Variants', () => {
    it('should render default type', () => {
      render(<ThemedText type="default">Default Text</ThemedText>);
      expect(screen.getByText('Default Text')).toBeTruthy();
    });

    it('should render title type', () => {
      render(<ThemedText type="title">Title Text</ThemedText>);
      expect(screen.getByText('Title Text')).toBeTruthy();
    });

    it('should render subtitle type', () => {
      render(<ThemedText type="subtitle">Subtitle Text</ThemedText>);
      expect(screen.getByText('Subtitle Text')).toBeTruthy();
    });

    it('should render caption type', () => {
      render(<ThemedText type="caption">Caption Text</ThemedText>);
      expect(screen.getByText('Caption Text')).toBeTruthy();
    });

    it('should render link type', () => {
      render(<ThemedText type="link">Link Text</ThemedText>);
      expect(screen.getByText('Link Text')).toBeTruthy();
    });
  });

  describe('Size Props', () => {
    const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'] as const;

    sizes.forEach(size => {
      it(`should render ${size} size`, () => {
        render(<ThemedText size={size}>{size} text</ThemedText>);
        expect(screen.getByText(`${size} text`)).toBeTruthy();
      });
    });
  });

  describe('Weight Props', () => {
    const weights = ['thin', 'normal', 'medium', 'semibold', 'bold', 'extrabold'] as const;

    weights.forEach(weight => {
      it(`should render ${weight} weight`, () => {
        render(<ThemedText weight={weight}>{weight} text</ThemedText>);
        expect(screen.getByText(`${weight} text`)).toBeTruthy();
      });
    });
  });

  describe('Leading (Line Height) Props', () => {
    const leadings = ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose', 'extra-loose'] as const;

    leadings.forEach(leading => {
      it(`should render ${leading} leading`, () => {
        render(<ThemedText leading={leading}>{leading} text</ThemedText>);
        expect(screen.getByText(`${leading} text`)).toBeTruthy();
      });
    });
  });

  describe('Tracking (Letter Spacing) Props', () => {
    const trackings = ['tightest', 'tighter', 'tight', 'normal', 'wide', 'wider', 'widest', 'ultra-wide'] as const;

    trackings.forEach(tracking => {
      it(`should render ${tracking} tracking`, () => {
        render(<ThemedText tracking={tracking}>{tracking} text</ThemedText>);
        expect(screen.getByText(`${tracking} text`)).toBeTruthy();
      });
    });
  });

  describe('Font Family Props', () => {
    it('should render sans font', () => {
      render(<ThemedText font="sans">Sans text</ThemedText>);
      expect(screen.getByText('Sans text')).toBeTruthy();
    });

    it('should render serif font', () => {
      render(<ThemedText font="serif">Serif text</ThemedText>);
      expect(screen.getByText('Serif text')).toBeTruthy();
    });

    it('should render mono font', () => {
      render(<ThemedText font="mono">Mono text</ThemedText>);
      expect(screen.getByText('Mono text')).toBeTruthy();
    });
  });

  describe('Text Alignment Props', () => {
    it('should render left aligned text', () => {
      render(<ThemedText align="left">Left aligned</ThemedText>);
      expect(screen.getByText('Left aligned')).toBeTruthy();
    });

    it('should render center aligned text', () => {
      render(<ThemedText align="center">Center aligned</ThemedText>);
      expect(screen.getByText('Center aligned')).toBeTruthy();
    });

    it('should render right aligned text', () => {
      render(<ThemedText align="right">Right aligned</ThemedText>);
      expect(screen.getByText('Right aligned')).toBeTruthy();
    });

    it('should render justified text', () => {
      render(<ThemedText align="justify">Justified text</ThemedText>);
      expect(screen.getByText('Justified text')).toBeTruthy();
    });
  });

  describe('Utility Props', () => {
    it('should render italic text', () => {
      render(<ThemedText italic>Italic text</ThemedText>);
      expect(screen.getByText('Italic text')).toBeTruthy();
    });

    it('should render underlined text', () => {
      render(<ThemedText underline>Underlined text</ThemedText>);
      expect(screen.getByText('Underlined text')).toBeTruthy();
    });

    it('should render uppercase text', () => {
      render(<ThemedText uppercase>uppercase text</ThemedText>);
      expect(screen.getByText('uppercase text')).toBeTruthy();
    });

    it('should render lowercase text', () => {
      render(<ThemedText lowercase>LOWERCASE TEXT</ThemedText>);
      expect(screen.getByText('LOWERCASE TEXT')).toBeTruthy();
    });

    it('should render capitalized text', () => {
      render(<ThemedText capitalize>capitalized text</ThemedText>);
      expect(screen.getByText('capitalized text')).toBeTruthy();
    });
  });

  describe('Combined Props', () => {
    it('should combine multiple props', () => {
      render(
        <ThemedText size="lg" weight="bold" align="center" italic>
          Combined text
        </ThemedText>
      );
      expect(screen.getByText('Combined text')).toBeTruthy();
    });

    it('should override type defaults with individual props', () => {
      render(
        <ThemedText type="title" size="sm" weight="normal">
          Overridden title
        </ThemedText>
      );
      expect(screen.getByText('Overridden title')).toBeTruthy();
    });

    it('should apply custom className', () => {
      render(
        <ThemedText className="custom-class">
          Custom class text
        </ThemedText>
      );
      expect(screen.getByText('Custom class text')).toBeTruthy();
    });

    it('should combine className with other props', () => {
      render(
        <ThemedText size="lg" className="custom-class">
          Combined with className
        </ThemedText>
      );
      expect(screen.getByText('Combined with className')).toBeTruthy();
    });
  });

  describe('Color Props', () => {
    it('should accept lightColor prop', () => {
      render(<ThemedText lightColor="#ff0000">Light color text</ThemedText>);
      expect(screen.getByText('Light color text')).toBeTruthy();
    });

    it('should accept darkColor prop', () => {
      render(<ThemedText darkColor="#00ff00">Dark color text</ThemedText>);
      expect(screen.getByText('Dark color text')).toBeTruthy();
    });

    it('should accept both light and dark colors', () => {
      render(
        <ThemedText lightColor="#ff0000" darkColor="#00ff00">
          Themed color text
        </ThemedText>
      );
      expect(screen.getByText('Themed color text')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle numeric children', () => {
      render(<ThemedText>{123}</ThemedText>);
      expect(screen.getByText('123')).toBeTruthy();
    });

    it('should handle special characters', () => {
      render(<ThemedText>Test & Special ! @#$ Characters</ThemedText>);
      expect(screen.getByText('Test & Special ! @#$ Characters')).toBeTruthy();
    });

    it('should handle Romanian characters', () => {
      render(<ThemedText>Text cu caractere speciale: ă, â, î, ș, ț</ThemedText>);
      expect(screen.getByText('Text cu caractere speciale: ă, â, î, ș, ț')).toBeTruthy();
    });

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      render(<ThemedText>{multilineText}</ThemedText>);
      expect(screen.getByText(multilineText)).toBeTruthy();
    });
  });

  describe('Additional TextProps', () => {
    it('should pass through additional Text props', () => {
      render(
        <ThemedText numberOfLines={2} ellipsizeMode="tail">
          Long text that should be truncated
        </ThemedText>
      );
      expect(screen.getByText('Long text that should be truncated')).toBeTruthy();
    });

    it('should accept testID prop', () => {
      render(<ThemedText testID="test-text">Test ID Text</ThemedText>);
      expect(screen.getByTestId('test-text')).toBeTruthy();
    });
  });
});

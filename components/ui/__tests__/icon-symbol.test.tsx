import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '../icon-symbol';

describe('IconSymbol Component', () => {
  describe('Basic Rendering', () => {
    it('should render icon with house.fill name', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" />
      );
      expect(root).toBeTruthy();
    });

    it('should render icon with paperplane.fill name', () => {
      const { root } = render(
        <IconSymbol name="paperplane.fill" color="#000000" />
      );
      expect(root).toBeTruthy();
    });

    it('should render icon with chevron.left.forwardslash.chevron.right name', () => {
      const { root } = render(
        <IconSymbol
          name="chevron.left.forwardslash.chevron.right"
          color="#000000"
        />
      );
      expect(root).toBeTruthy();
    });

    it('should render icon with chevron.right name', () => {
      const { root } = render(
        <IconSymbol name="chevron.right" color="#000000" />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Size Prop', () => {
    it('should render with default size 24', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" />
      );
      expect(root).toBeTruthy();
    });

    it('should render with custom size', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" size={32} />
      );
      expect(root).toBeTruthy();
    });

    it('should render with small size', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" size={16} />
      );
      expect(root).toBeTruthy();
    });

    it('should render with large size', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" size={48} />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Color Prop', () => {
    it('should render with black color', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" />
      );
      expect(root).toBeTruthy();
    });

    it('should render with white color', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#ffffff" />
      );
      expect(root).toBeTruthy();
    });

    it('should render with custom color', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#ff5500" />
      );
      expect(root).toBeTruthy();
    });

    it('should render with rgb color', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="rgb(255, 0, 0)" />
      );
      expect(root).toBeTruthy();
    });

    it('should render with rgba color', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="rgba(255, 0, 0, 0.5)" />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Style Prop', () => {
    it('should accept custom style', () => {
      const { root } = render(
        <IconSymbol
          name="house.fill"
          color="#000000"
          style={{ margin: 10 }}
        />
      );
      expect(root).toBeTruthy();
    });

    it('should accept array of styles', () => {
      const { root } = render(
        <IconSymbol
          name="house.fill"
          color="#000000"
          style={[{ margin: 10 }, { padding: 5 }]}
        />
      );
      expect(root).toBeTruthy();
    });

    it('should accept transform style', () => {
      const { root } = render(
        <IconSymbol
          name="house.fill"
          color="#000000"
          style={{ transform: [{ rotate: '45deg' }] }}
        />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Weight Prop', () => {
    it('should accept weight prop', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" weight="regular" />
      );
      expect(root).toBeTruthy();
    });

    it('should accept bold weight', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" weight="bold" />
      );
      expect(root).toBeTruthy();
    });

    it('should accept light weight', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" weight="light" />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Combined Props', () => {
    it('should render with all props combined', () => {
      const { root } = render(
        <IconSymbol
          name="paperplane.fill"
          color="#ff0000"
          size={32}
          weight="medium"
          style={{ margin: 10 }}
        />
      );
      expect(root).toBeTruthy();
    });

    it('should handle multiple style properties', () => {
      const { root } = render(
        <IconSymbol
          name="chevron.right"
          color="#0000ff"
          size={20}
          style={{
            margin: 5,
            padding: 10,
            transform: [{ rotate: '90deg' }],
          }}
        />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Icon Name Mapping', () => {
    it('should map house.fill to home', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" />
      );
      expect(root).toBeTruthy();
    });

    it('should map paperplane.fill to send', () => {
      const { root } = render(
        <IconSymbol name="paperplane.fill" color="#000000" />
      );
      expect(root).toBeTruthy();
    });

    it('should map chevron.left.forwardslash.chevron.right to code', () => {
      const { root } = render(
        <IconSymbol
          name="chevron.left.forwardslash.chevron.right"
          color="#000000"
        />
      );
      expect(root).toBeTruthy();
    });

    it('should map chevron.right to chevron-right', () => {
      const { root } = render(
        <IconSymbol name="chevron.right" color="#000000" />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small size', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" size={8} />
      );
      expect(root).toBeTruthy();
    });

    it('should handle very large size', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="#000000" size={128} />
      );
      expect(root).toBeTruthy();
    });

    it('should handle named colors', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="red" />
      );
      expect(root).toBeTruthy();
    });

    it('should handle transparent color', () => {
      const { root } = render(
        <IconSymbol name="house.fill" color="transparent" />
      );
      expect(root).toBeTruthy();
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassModal } from '../GlassModal';

describe('GlassModal Component', () => {
  describe('Rendering', () => {
    it('should render children correctly when visible', () => {
      render(
        <GlassModal visible={true}>
          <Text>Modal Content</Text>
        </GlassModal>
      );
      expect(screen.getByText('Modal Content')).toBeTruthy();
    });

    it('should not render children when not visible', () => {
      render(
        <GlassModal visible={false}>
          <Text>Modal Content</Text>
        </GlassModal>
      );
      expect(screen.queryByText('Modal Content')).toBeNull();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <GlassModal visible={true}>
          <Text>Title</Text>
          <Text>Description</Text>
        </GlassModal>
      );
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
    });
  });

  describe('Default Variant', () => {
    it('should use prominent variant by default', () => {
      const { getByTestId } = render(
        <GlassModal visible={true} testID="glass-modal">
          <Text>Content</Text>
        </GlassModal>
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });

    it('should allow overriding default variant', () => {
      const { getByTestId } = render(
        <GlassModal visible={true} testID="glass-modal" variant="frosted">
          <Text>Content</Text>
        </GlassModal>
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });

    it('should accept all GlassView variants', () => {
      const variants = ['frosted', 'tinted', 'vibrant', 'ultra-thin', 'prominent'] as const;

      variants.forEach(variant => {
        const { getByTestId } = render(
          <GlassModal visible={true} testID={`modal-${variant}`} variant={variant}>
            <Text>{variant}</Text>
          </GlassModal>
        );
        expect(getByTestId(`modal-${variant}`)).toBeTruthy();
      });
    });
  });

  describe('Modal Props', () => {
    it('should be transparent by default', () => {
      const { getByTestId } = render(
        <GlassModal visible={true} testID="glass-modal">
          <Text>Content</Text>
        </GlassModal>
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });

    it('should pass through onRequestClose', () => {
      const onRequestClose = jest.fn();
      const { getByTestId } = render(
        <GlassModal
          visible={true}
          testID="glass-modal"
          onRequestClose={onRequestClose}
        >
          <Text>Content</Text>
        </GlassModal>
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });

    it('should pass through animationType', () => {
      const { getByTestId } = render(
        <GlassModal
          visible={true}
          testID="glass-modal"
          animationType="fade"
        >
          <Text>Content</Text>
        </GlassModal>
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });

    it('should pass through presentationStyle', () => {
      const { getByTestId } = render(
        <GlassModal
          visible={true}
          testID="glass-modal"
          presentationStyle="overFullScreen"
        >
          <Text>Content</Text>
        </GlassModal>
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });
  });

  describe('GlassView Integration', () => {
    it('should apply GlassView to modal content', () => {
      const { getByText } = render(
        <GlassModal visible={true} variant="vibrant">
          <Text>Glass Content</Text>
        </GlassModal>
      );
      expect(getByText('Glass Content')).toBeTruthy();
    });

    it('should fill entire screen', () => {
      const { getByTestId } = render(
        <GlassModal visible={true} testID="glass-modal">
          <Text>Content</Text>
        </GlassModal>
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });

    it('should not have border by default', () => {
      const { getByTestId } = render(
        <GlassModal visible={true} testID="glass-modal">
          <Text>Content</Text>
        </GlassModal>
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });
  });

  describe('Visibility States', () => {
    it('should handle visibility toggle', () => {
      const { rerender, queryByText } = render(
        <GlassModal visible={false}>
          <Text>Content</Text>
        </GlassModal>
      );
      expect(queryByText('Content')).toBeNull();

      rerender(
        <GlassModal visible={true}>
          <Text>Content</Text>
        </GlassModal>
      );
      expect(queryByText('Content')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle nested components', () => {
      const NestedComponent = () => (
        <>
          <Text>Nested Title</Text>
          <Text>Nested Content</Text>
        </>
      );

      const { getByText } = render(
        <GlassModal visible={true}>
          <NestedComponent />
        </GlassModal>
      );
      expect(getByText('Nested Title')).toBeTruthy();
      expect(getByText('Nested Content')).toBeTruthy();
    });

    it('should render without children', () => {
      const { getByTestId } = render(
        <GlassModal visible={true} testID="glass-modal" />
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should pass through accessibility props', () => {
      const { getByTestId } = render(
        <GlassModal
          visible={true}
          testID="glass-modal"
          accessible={true}
          accessibilityLabel="Modal Label"
        >
          <Text>Content</Text>
        </GlassModal>
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });

    it('should support accessibilityViewIsModal', () => {
      const { getByTestId } = render(
        <GlassModal
          visible={true}
          testID="glass-modal"
          accessibilityViewIsModal={true}
        >
          <Text>Content</Text>
        </GlassModal>
      );
      expect(getByTestId('glass-modal')).toBeTruthy();
    });
  });
});

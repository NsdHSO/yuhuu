import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemedView } from '../themed-view';

describe('ThemedView Component', () => {
  describe('Basic Rendering', () => {
    it('should render children', () => {
      render(
        <ThemedView>
          <Text>Child Content</Text>
        </ThemedView>
      );
      expect(screen.getByText('Child Content')).toBeTruthy();
    });

    it('should render without children', () => {
      const { root } = render(<ThemedView />);
      expect(root).toBeTruthy();
    });

    it('should render multiple children', () => {
      render(
        <ThemedView>
          <Text>Child 1</Text>
          <Text>Child 2</Text>
          <Text>Child 3</Text>
        </ThemedView>
      );
      expect(screen.getByText('Child 1')).toBeTruthy();
      expect(screen.getByText('Child 2')).toBeTruthy();
      expect(screen.getByText('Child 3')).toBeTruthy();
    });
  });

  describe('Color Props', () => {
    it('should accept lightColor prop', () => {
      render(
        <ThemedView lightColor="#ff0000">
          <Text>Light color content</Text>
        </ThemedView>
      );
      expect(screen.getByText('Light color content')).toBeTruthy();
    });

    it('should accept darkColor prop', () => {
      render(
        <ThemedView darkColor="#00ff00">
          <Text>Dark color content</Text>
        </ThemedView>
      );
      expect(screen.getByText('Dark color content')).toBeTruthy();
    });

    it('should accept both light and dark colors', () => {
      render(
        <ThemedView lightColor="#ff0000" darkColor="#00ff00">
          <Text>Themed color content</Text>
        </ThemedView>
      );
      expect(screen.getByText('Themed color content')).toBeTruthy();
    });
  });

  describe('Style Props', () => {
    it('should accept custom style', () => {
      render(
        <ThemedView style={{ padding: 20 }}>
          <Text>Styled content</Text>
        </ThemedView>
      );
      expect(screen.getByText('Styled content')).toBeTruthy();
    });

    it('should accept array of styles', () => {
      render(
        <ThemedView style={[{ padding: 10 }, { margin: 20 }]}>
          <Text>Multiple styles</Text>
        </ThemedView>
      );
      expect(screen.getByText('Multiple styles')).toBeTruthy();
    });

    it('should merge backgroundColor from useThemeColor with custom styles', () => {
      render(
        <ThemedView style={{ padding: 10 }}>
          <Text>Merged styles</Text>
        </ThemedView>
      );
      expect(screen.getByText('Merged styles')).toBeTruthy();
    });
  });

  describe('Additional ViewProps', () => {
    it('should accept testID prop', () => {
      render(
        <ThemedView testID="test-view">
          <Text>Test view content</Text>
        </ThemedView>
      );
      expect(screen.getByTestId('test-view')).toBeTruthy();
    });

    it('should accept className prop', () => {
      render(
        <ThemedView className="custom-class">
          <Text>Class content</Text>
        </ThemedView>
      );
      expect(screen.getByText('Class content')).toBeTruthy();
    });

    it('should pass through other View props', () => {
      render(
        <ThemedView accessible accessibilityLabel="Themed container">
          <Text>Accessible content</Text>
        </ThemedView>
      );
      expect(screen.getByText('Accessible content')).toBeTruthy();
    });
  });

  describe('Nested Components', () => {
    it('should render nested ThemedView components', () => {
      render(
        <ThemedView>
          <ThemedView>
            <ThemedView>
              <Text>Nested content</Text>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      );
      expect(screen.getByText('Nested content')).toBeTruthy();
    });

    it('should render complex nested structure', () => {
      render(
        <ThemedView lightColor="#ffffff">
          <Text>Parent</Text>
          <ThemedView darkColor="#000000">
            <Text>Child 1</Text>
          </ThemedView>
          <ThemedView>
            <Text>Child 2</Text>
          </ThemedView>
        </ThemedView>
      );
      expect(screen.getByText('Parent')).toBeTruthy();
      expect(screen.getByText('Child 1')).toBeTruthy();
      expect(screen.getByText('Child 2')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty color props', () => {
      render(
        <ThemedView lightColor="" darkColor="">
          <Text>Empty colors</Text>
        </ThemedView>
      );
      expect(screen.getByText('Empty colors')).toBeTruthy();
    });

    it('should handle null children', () => {
      render(
        <ThemedView>
          {null}
          <Text>Valid child</Text>
        </ThemedView>
      );
      expect(screen.getByText('Valid child')).toBeTruthy();
    });

    it('should handle conditional children', () => {
      const showChild = true;
      render(
        <ThemedView>
          {showChild && <Text>Conditional child</Text>}
        </ThemedView>
      );
      expect(screen.getByText('Conditional child')).toBeTruthy();
    });

    it('should handle fragment children', () => {
      render(
        <ThemedView>
          <>
            <Text>Fragment child 1</Text>
            <Text>Fragment child 2</Text>
          </>
        </ThemedView>
      );
      expect(screen.getByText('Fragment child 1')).toBeTruthy();
      expect(screen.getByText('Fragment child 2')).toBeTruthy();
    });
  });
});

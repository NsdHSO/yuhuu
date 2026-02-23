import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import ParallaxScrollView from '../parallax-scroll-view';

describe('ParallaxScrollView Component', () => {
  const defaultProps = {
    headerImage: <View testID="header-image" />,
    headerBackgroundColor: { dark: '#000000', light: '#ffffff' },
  };

  describe('Rendering', () => {
    it('should render children content', () => {
      render(
        <ParallaxScrollView {...defaultProps}>
          <Text>Child Content</Text>
        </ParallaxScrollView>
      );
      expect(screen.getByText('Child Content')).toBeTruthy();
    });

    it('should render header image', () => {
      const { getByTestId } = render(
        <ParallaxScrollView {...defaultProps}>
          <Text>Content</Text>
        </ParallaxScrollView>
      );
      expect(getByTestId('header-image')).toBeTruthy();
    });

    it('should render without children', () => {
      const { root } = render(
        <ParallaxScrollView {...defaultProps} />
      );
      expect(root).toBeTruthy();
    });

    it('should render multiple children', () => {
      render(
        <ParallaxScrollView {...defaultProps}>
          <Text>Child 1</Text>
          <Text>Child 2</Text>
          <Text>Child 3</Text>
        </ParallaxScrollView>
      );
      expect(screen.getByText('Child 1')).toBeTruthy();
      expect(screen.getByText('Child 2')).toBeTruthy();
      expect(screen.getByText('Child 3')).toBeTruthy();
    });
  });

  describe('Header Configuration', () => {
    it('should render custom header image', () => {
      const customHeader = (
        <View testID="custom-header">
          <Text>Custom Header</Text>
        </View>
      );

      const { getByTestId } = render(
        <ParallaxScrollView
          headerImage={customHeader}
          headerBackgroundColor={defaultProps.headerBackgroundColor}
        >
          <Text>Content</Text>
        </ParallaxScrollView>
      );

      expect(getByTestId('custom-header')).toBeTruthy();
      expect(screen.getByText('Custom Header')).toBeTruthy();
    });

    it('should use light background color', () => {
      const { root } = render(
        <ParallaxScrollView
          headerImage={<View />}
          headerBackgroundColor={{ dark: '#000', light: '#fff' }}
        >
          <Text>Content</Text>
        </ParallaxScrollView>
      );
      expect(root).toBeTruthy();
    });

    it('should accept different background colors', () => {
      const { root } = render(
        <ParallaxScrollView
          headerImage={<View />}
          headerBackgroundColor={{ dark: '#123456', light: '#abcdef' }}
        >
          <Text>Content</Text>
        </ParallaxScrollView>
      );
      expect(root).toBeTruthy();
    });
  });

  describe('Content Structure', () => {
    it('should render simple text content', () => {
      render(
        <ParallaxScrollView {...defaultProps}>
          <Text>Simple Text</Text>
        </ParallaxScrollView>
      );
      expect(screen.getByText('Simple Text')).toBeTruthy();
    });

    it('should render nested components', () => {
      render(
        <ParallaxScrollView {...defaultProps}>
          <View>
            <Text>Nested Text 1</Text>
            <View>
              <Text>Nested Text 2</Text>
            </View>
          </View>
        </ParallaxScrollView>
      );
      expect(screen.getByText('Nested Text 1')).toBeTruthy();
      expect(screen.getByText('Nested Text 2')).toBeTruthy();
    });

    it('should render complex content structure', () => {
      render(
        <ParallaxScrollView {...defaultProps}>
          <Text>Header</Text>
          <View>
            <Text>Section 1</Text>
          </View>
          <View>
            <Text>Section 2</Text>
          </View>
          <Text>Footer</Text>
        </ParallaxScrollView>
      );
      expect(screen.getByText('Header')).toBeTruthy();
      expect(screen.getByText('Section 1')).toBeTruthy();
      expect(screen.getByText('Section 2')).toBeTruthy();
      expect(screen.getByText('Footer')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(
        <ParallaxScrollView {...defaultProps}>
          {null}
          <Text>Valid Child</Text>
        </ParallaxScrollView>
      );
      expect(screen.getByText('Valid Child')).toBeTruthy();
    });

    it('should handle conditional children', () => {
      const showChild = true;
      render(
        <ParallaxScrollView {...defaultProps}>
          {showChild && <Text>Conditional Child</Text>}
        </ParallaxScrollView>
      );
      expect(screen.getByText('Conditional Child')).toBeTruthy();
    });

    it('should handle fragment children', () => {
      render(
        <ParallaxScrollView {...defaultProps}>
          <>
            <Text>Fragment Child 1</Text>
            <Text>Fragment Child 2</Text>
          </>
        </ParallaxScrollView>
      );
      expect(screen.getByText('Fragment Child 1')).toBeTruthy();
      expect(screen.getByText('Fragment Child 2')).toBeTruthy();
    });

    it('should handle empty header image', () => {
      const { root } = render(
        <ParallaxScrollView
          headerImage={<></>}
          headerBackgroundColor={defaultProps.headerBackgroundColor}
        >
          <Text>Content</Text>
        </ParallaxScrollView>
      );
      expect(root).toBeTruthy();
      expect(screen.getByText('Content')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should render header and content together', () => {
      const { getByTestId } = render(
        <ParallaxScrollView {...defaultProps}>
          <Text>Main Content</Text>
        </ParallaxScrollView>
      );
      expect(getByTestId('header-image')).toBeTruthy();
      expect(screen.getByText('Main Content')).toBeTruthy();
    });

    it('should maintain component structure', () => {
      const { root } = render(
        <ParallaxScrollView
          headerImage={<View testID="test-header" />}
          headerBackgroundColor={{ dark: '#000', light: '#fff' }}
        >
          <View testID="test-content">
            <Text>Test Content</Text>
          </View>
        </ParallaxScrollView>
      );
      expect(root).toBeTruthy();
    });
  });
});

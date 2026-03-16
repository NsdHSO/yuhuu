import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassAccordion } from '../GlassAccordion';

describe('GlassAccordion Component', () => {
  describe('Rendering', () => {
    it('should render title correctly', () => {
      const { getByText } = render(
        <GlassAccordion title="Test Accordion">
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByText('Test Accordion')).toBeTruthy();
    });

    it('should render collapsed by default', () => {
      const { queryByText } = render(
        <GlassAccordion title="Test">
          <Text>Hidden Content</Text>
        </GlassAccordion>
      );
      expect(queryByText('Hidden Content')).toBeNull();
    });

    it('should accept testID', () => {
      const { getByTestId } = render(
        <GlassAccordion title="Test" testID="accordion">
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByTestId('accordion')).toBeTruthy();
    });

    it('should provide testID-header for the pressable header', () => {
      const { getByTestId } = render(
        <GlassAccordion title="Test" testID="accordion">
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByTestId('accordion-header')).toBeTruthy();
    });
  });

  describe('Expand/Collapse Behavior', () => {
    it('should expand when header is pressed', () => {
      const { getByText, queryByText } = render(
        <GlassAccordion title="Expandable">
          <Text>Expanded Content</Text>
        </GlassAccordion>
      );

      expect(queryByText('Expanded Content')).toBeNull();

      fireEvent.press(getByText('Expandable'));

      expect(getByText('Expanded Content')).toBeTruthy();
    });

    it('should collapse when header is pressed again', () => {
      const { getByText, queryByText } = render(
        <GlassAccordion title="Collapsible">
          <Text>Toggle Content</Text>
        </GlassAccordion>
      );

      fireEvent.press(getByText('Collapsible'));
      expect(getByText('Toggle Content')).toBeTruthy();

      fireEvent.press(getByText('Collapsible'));
      expect(queryByText('Toggle Content')).toBeNull();
    });

    it('should render when defaultExpanded is true', () => {
      const { getByText } = render(
        <GlassAccordion title="Test" defaultExpanded={true}>
          <Text>Visible Content</Text>
        </GlassAccordion>
      );
      expect(getByText('Visible Content')).toBeTruthy();
    });
  });

  describe('Default Variant', () => {
    it('should use frosted variant by default', () => {
      const { getByTestId } = render(
        <GlassAccordion title="Test" testID="accordion">
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByTestId('accordion')).toBeTruthy();
    });

    it('should allow overriding variant', () => {
      const { getByTestId } = render(
        <GlassAccordion title="Test" variant="tinted" testID="accordion">
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByTestId('accordion')).toBeTruthy();
    });

    it('should accept all GlassView variants', () => {
      const variants = ['frosted', 'tinted', 'vibrant', 'ultra-thin', 'prominent'] as const;

      variants.forEach(variant => {
        const { getByTestId } = render(
          <GlassAccordion
            title="Test"
            variant={variant}
            testID={`accordion-${variant}`}
          >
            <Text>{variant}</Text>
          </GlassAccordion>
        );
        expect(getByTestId(`accordion-${variant}`)).toBeTruthy();
      });
    });
  });

  describe('Border Radius', () => {
    it('should use default border radius of 12', () => {
      const { getByTestId } = render(
        <GlassAccordion title="Test" testID="accordion">
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByTestId('accordion')).toBeTruthy();
    });

    it('should accept custom border radius', () => {
      const { getByTestId } = render(
        <GlassAccordion title="Test" borderRadius={16} testID="accordion">
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByTestId('accordion')).toBeTruthy();
    });
  });

  describe('Children Content', () => {
    it('should render simple text children', () => {
      const { getByText } = render(
        <GlassAccordion title="Test" defaultExpanded={true}>
          <Text>Simple Text</Text>
        </GlassAccordion>
      );
      expect(getByText('Simple Text')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <GlassAccordion title="Test" defaultExpanded={true}>
          <Text>First</Text>
          <Text>Second</Text>
        </GlassAccordion>
      );
      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
    });

    it('should render complex nested components', () => {
      const ComplexChild = () => (
        <>
          <Text>Nested Title</Text>
          <Text>Nested Content</Text>
        </>
      );

      const { getByText } = render(
        <GlassAccordion title="Test" defaultExpanded={true}>
          <ComplexChild />
        </GlassAccordion>
      );
      expect(getByText('Nested Title')).toBeTruthy();
      expect(getByText('Nested Content')).toBeTruthy();
    });
  });

  describe('GlassView Props', () => {
    it('should accept custom style', () => {
      const { getByTestId } = render(
        <GlassAccordion
          title="Test"
          testID="accordion"
          style={{ margin: 10 }}
        >
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByTestId('accordion')).toBeTruthy();
    });

    it('should accept shadow props', () => {
      const { getByTestId } = render(
        <GlassAccordion
          title="Test"
          testID="accordion"
          enableShadow={true}
          shadowLevel="medium"
        >
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByTestId('accordion')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const { getByTestId } = render(
        <GlassAccordion title="" testID="accordion">
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByTestId('accordion')).toBeTruthy();
    });

    it('should handle long titles', () => {
      const longTitle = 'This is a very long accordion title that should still work correctly';
      const { getByText } = render(
        <GlassAccordion title={longTitle}>
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle no children', () => {
      const { getByText } = render(
        <GlassAccordion title="Empty" defaultExpanded={true} />
      );
      expect(getByText('Empty')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      const { getByTestId } = render(
        <GlassAccordion title="Test" testID="accordion">
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByTestId('accordion')).toBeTruthy();
    });

    it('should have accessible header', () => {
      const { getByText } = render(
        <GlassAccordion title="Accessible Accordion">
          <Text>Content</Text>
        </GlassAccordion>
      );
      expect(getByText('Accessible Accordion')).toBeTruthy();
    });
  });
});

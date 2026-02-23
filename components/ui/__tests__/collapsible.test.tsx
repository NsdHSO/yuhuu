import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Collapsible } from '../collapsible';

describe('Collapsible Component', () => {
  describe('Basic Rendering', () => {
    it('should render title', () => {
      render(
        <Collapsible title="Test Title">
          <Text>Content</Text>
        </Collapsible>
      );
      expect(screen.getByText('Test Title')).toBeTruthy();
    });

    it('should not show content by default', () => {
      const { queryByText } = render(
        <Collapsible title="Title">
          <Text>Hidden Content</Text>
        </Collapsible>
      );
      expect(queryByText('Hidden Content')).toBeNull();
    });

    it('should render without children', () => {
      render(<Collapsible title="Empty Title" />);
      expect(screen.getByText('Empty Title')).toBeTruthy();
    });
  });

  describe('Toggle Functionality', () => {
    it('should show content when title is pressed', () => {
      render(
        <Collapsible title="Toggle Title">
          <Text>Toggle Content</Text>
        </Collapsible>
      );

      const title = screen.getByText('Toggle Title');
      fireEvent.press(title);

      expect(screen.getByText('Toggle Content')).toBeTruthy();
    });

    it('should hide content when pressed again', () => {
      const { queryByText } = render(
        <Collapsible title="Toggle Title">
          <Text>Toggle Content</Text>
        </Collapsible>
      );

      const title = screen.getByText('Toggle Title');

      // Open
      fireEvent.press(title);
      expect(screen.getByText('Toggle Content')).toBeTruthy();

      // Close
      fireEvent.press(title);
      expect(queryByText('Toggle Content')).toBeNull();
    });

    it('should toggle multiple times', () => {
      const { queryByText } = render(
        <Collapsible title="Multi Toggle">
          <Text>Multi Content</Text>
        </Collapsible>
      );

      const title = screen.getByText('Multi Toggle');

      // Open
      fireEvent.press(title);
      expect(screen.getByText('Multi Content')).toBeTruthy();

      // Close
      fireEvent.press(title);
      expect(queryByText('Multi Content')).toBeNull();

      // Open again
      fireEvent.press(title);
      expect(screen.getByText('Multi Content')).toBeTruthy();
    });
  });

  describe('Title Variations', () => {
    it('should handle long titles', () => {
      const longTitle = 'This is a very long title that should still work properly';
      render(
        <Collapsible title={longTitle}>
          <Text>Content</Text>
        </Collapsible>
      );
      expect(screen.getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      render(
        <Collapsible title="Title with: special & chars!">
          <Text>Content</Text>
        </Collapsible>
      );
      expect(screen.getByText('Title with: special & chars!')).toBeTruthy();
    });

    it('should handle Romanian characters in title', () => {
      render(
        <Collapsible title="Titlu cu caractere speciale: ă, â, î, ș, ț">
          <Text>Content</Text>
        </Collapsible>
      );
      expect(screen.getByText('Titlu cu caractere speciale: ă, â, î, ș, ț')).toBeTruthy();
    });

    it('should handle empty title', () => {
      render(
        <Collapsible title="">
          <Text>Content</Text>
        </Collapsible>
      );
      expect(screen.getByText('')).toBeTruthy();
    });
  });

  describe('Content Variations', () => {
    it('should render simple text content', () => {
      render(
        <Collapsible title="Title">
          <Text>Simple Text</Text>
        </Collapsible>
      );

      fireEvent.press(screen.getByText('Title'));
      expect(screen.getByText('Simple Text')).toBeTruthy();
    });

    it('should render multiple children', () => {
      render(
        <Collapsible title="Title">
          <Text>Child 1</Text>
          <Text>Child 2</Text>
          <Text>Child 3</Text>
        </Collapsible>
      );

      fireEvent.press(screen.getByText('Title'));
      expect(screen.getByText('Child 1')).toBeTruthy();
      expect(screen.getByText('Child 2')).toBeTruthy();
      expect(screen.getByText('Child 3')).toBeTruthy();
    });

    it('should render complex nested content', () => {
      render(
        <Collapsible title="Title">
          <Collapsible title="Nested">
            <Text>Nested Content</Text>
          </Collapsible>
        </Collapsible>
      );

      fireEvent.press(screen.getByText('Title'));
      expect(screen.getByText('Nested')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('should have touchable title area', () => {
      const { getByText } = render(
        <Collapsible title="Touchable">
          <Text>Content</Text>
        </Collapsible>
      );

      const touchable = getByText('Touchable');
      expect(touchable).toBeTruthy();
    });

    it('should maintain state across re-renders', () => {
      const { rerender } = render(
        <Collapsible title="Title">
          <Text>Content</Text>
        </Collapsible>
      );

      fireEvent.press(screen.getByText('Title'));
      expect(screen.getByText('Content')).toBeTruthy();

      rerender(
        <Collapsible title="Title">
          <Text>Content</Text>
        </Collapsible>
      );

      expect(screen.getByText('Content')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      render(
        <Collapsible title="Title">
          {null}
        </Collapsible>
      );

      fireEvent.press(screen.getByText('Title'));
      // Should not crash
      expect(screen.getByText('Title')).toBeTruthy();
    });

    it('should handle conditional children', () => {
      const showChild = true;
      render(
        <Collapsible title="Title">
          {showChild && <Text>Conditional</Text>}
        </Collapsible>
      );

      fireEvent.press(screen.getByText('Title'));
      expect(screen.getByText('Conditional')).toBeTruthy();
    });

    it('should handle fragment children', () => {
      render(
        <Collapsible title="Title">
          <>
            <Text>Fragment 1</Text>
            <Text>Fragment 2</Text>
          </>
        </Collapsible>
      );

      fireEvent.press(screen.getByText('Title'));
      expect(screen.getByText('Fragment 1')).toBeTruthy();
      expect(screen.getByText('Fragment 2')).toBeTruthy();
    });
  });
});

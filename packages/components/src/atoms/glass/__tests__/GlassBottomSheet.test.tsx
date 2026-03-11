import React, {useRef} from 'react';
import {render, screen} from '@testing-library/react-native';
import {Text, View} from 'react-native';
import {GlassBottomSheet} from '../GlassBottomSheet';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    BottomSheetModal: React.forwardRef(
      (
        {
          children,
          snapPoints,
          backdropComponent,
          backgroundComponent,
          handleComponent,
          enablePanDownToClose,
          enableOverDrag,
          keyboardBehavior,
          android_keyboardInputMode,
        }: any,
        ref: any
      ) => {
        React.useImperativeHandle(ref, () => ({
          present: jest.fn(),
          dismiss: jest.fn(),
        }));

        const BackdropComponent = backdropComponent;
        const BackgroundComponent = backgroundComponent;
        const HandleComponent = handleComponent;

        return React.createElement(
          RN.View,
          {'data-testid': 'glass-bottom-sheet-root'},
          BackdropComponent &&
            React.createElement(BackdropComponent, {
              animatedIndex: {value: 0},
              style: {},
            }),
          BackgroundComponent &&
            React.createElement(BackgroundComponent, {}),
          HandleComponent && React.createElement(HandleComponent, {}),
          children
        );
      }
    ),
    BottomSheetBackdrop: () => null,
  };
});

// Mock useGlowVariant
jest.mock('../../../hooks/useGlowVariant', () => ({
  useGlowVariant: () => ({
    glowVariant: 'vibrant',
    setGlowVariant: jest.fn(),
  }),
}));

// Mock getGlowColor
jest.mock('../../../constants/glowColors', () => ({
  getGlowColor: jest.fn(() => '#A78BFA'),
}));

describe('GlassBottomSheet Component', () => {
  describe('Rendering', () => {
    it('should render children correctly', () => {
      render(
        <GlassBottomSheet>
          <Text>Bottom Sheet Content</Text>
        </GlassBottomSheet>
      );
      expect(screen.getByText('Bottom Sheet Content')).toBeTruthy();
    });

    it('should render without children', () => {
      const component = render(
        <GlassBottomSheet testID="glass-bottom-sheet" />
      );
      expect(component).toBeTruthy();
    });

    it('should render multiple children', () => {
      const {getByText} = render(
        <GlassBottomSheet>
          <Text>Title</Text>
          <Text>Description</Text>
        </GlassBottomSheet>
      );
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
    });

    it('should render custom backdrop component', () => {
      const {getByTestId} = render(
        <GlassBottomSheet testID="glass-bottom-sheet">
          <Text>Content</Text>
        </GlassBottomSheet>
      );
      expect(getByTestId('glass-bottom-sheet-backdrop')).toBeTruthy();
    });

    it('should render custom background component', () => {
      const {getByTestId} = render(
        <GlassBottomSheet testID="glass-bottom-sheet">
          <Text>Content</Text>
        </GlassBottomSheet>
      );
      expect(getByTestId('glass-bottom-sheet-background')).toBeTruthy();
    });
  });

  describe('Props', () => {
    it('should use frosted variant by default', () => {
      const {getByText} = render(
        <GlassBottomSheet testID="glass-bottom-sheet">
          <Text>Content</Text>
        </GlassBottomSheet>
      );
      expect(getByText('Content')).toBeTruthy();
    });

    it('should accept custom variant', () => {
      const {getByText} = render(
        <GlassBottomSheet testID="glass-bottom-sheet" variant="tinted">
          <Text>Content</Text>
        </GlassBottomSheet>
      );
      expect(getByText('Content')).toBeTruthy();
    });

    it('should enable waves by default', () => {
      const {getByText} = render(
        <GlassBottomSheet testID="glass-bottom-sheet">
          <Text>Content</Text>
        </GlassBottomSheet>
      );
      expect(getByText('Content')).toBeTruthy();
    });

    it('should allow disabling waves', () => {
      const {getByText} = render(
        <GlassBottomSheet testID="glass-bottom-sheet" enableWaves={false}>
          <Text>Content</Text>
        </GlassBottomSheet>
      );
      expect(getByText('Content')).toBeTruthy();
    });

    it('should use 60% snap point by default', () => {
      const {getByText} = render(
        <GlassBottomSheet testID="glass-bottom-sheet">
          <Text>Content</Text>
        </GlassBottomSheet>
      );
      expect(getByText('Content')).toBeTruthy();
    });

    it('should accept custom snap points', () => {
      const {getByText} = render(
        <GlassBottomSheet testID="glass-bottom-sheet" snapPoints={['50%', '90%']}>
          <Text>Content</Text>
        </GlassBottomSheet>
      );
      expect(getByText('Content')).toBeTruthy();
    });

    it('should enable backdrop dismiss by default', () => {
      const {getByText} = render(
        <GlassBottomSheet testID="glass-bottom-sheet">
          <Text>Content</Text>
        </GlassBottomSheet>
      );
      expect(getByText('Content')).toBeTruthy();
    });

    it('should allow disabling backdrop dismiss', () => {
      const {getByText} = render(
        <GlassBottomSheet testID="glass-bottom-sheet" enableBackdropDismiss={false}>
          <Text>Content</Text>
        </GlassBottomSheet>
      );
      expect(getByText('Content')).toBeTruthy();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to BottomSheetModal', () => {
      const TestComponent = () => {
        const ref = useRef<BottomSheetModal>(null);
        return (
          <GlassBottomSheet ref={ref} testID="glass-bottom-sheet">
            <Text>Content</Text>
          </GlassBottomSheet>
        );
      };

      render(<TestComponent />);
      expect(screen.getByText('Content')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle nested components', () => {
      const ComplexChild = () => (
        <>
          <Text>Title</Text>
          <Text>Subtitle</Text>
        </>
      );

      const {getByText} = render(
        <GlassBottomSheet>
          <ComplexChild />
        </GlassBottomSheet>
      );
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Subtitle')).toBeTruthy();
    });
  });
});

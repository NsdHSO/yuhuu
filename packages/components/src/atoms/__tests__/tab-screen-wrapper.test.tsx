import React from 'react';
import { render } from '@testing-library/react-native';
import { TabScreenWrapper } from '../tab-screen-wrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

describe('TabScreenWrapper', () => {
  const mockUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
    typeof useSafeAreaInsets
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cross-Platform Padding Calculation', () => {
    it('calculates correct padding for iOS notched device (insets.bottom = 34)', () => {
      mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 34, left: 0, right: 0 });

      const { getByTestId } = render(
        <TabScreenWrapper testID="wrapper">
          <></>
        </TabScreenWrapper>
      );

      const scrollView = getByTestId('wrapper-scroll');
      // Expected: 34 (safe area) + 65 (tab bar) + 40 (breathing room) = 139
      expect(scrollView.props.contentContainerStyle).toEqual(
        expect.objectContaining({ paddingBottom: 139 })
      );
    });

    it('calculates correct padding for iOS non-notched device (insets.bottom = 0)', () => {
      mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });

      const { getByTestId } = render(
        <TabScreenWrapper testID="wrapper">
          <></>
        </TabScreenWrapper>
      );

      const scrollView = getByTestId('wrapper-scroll');
      // Expected: 0 + 65 + 40 = 105
      expect(scrollView.props.contentContainerStyle).toEqual(
        expect.objectContaining({ paddingBottom: 105 })
      );
    });

    it('calculates correct padding for Android with gesture navigation (insets.bottom = 20)', () => {
      mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 20, left: 0, right: 0 });

      const { getByTestId } = render(
        <TabScreenWrapper testID="wrapper">
          <></>
        </TabScreenWrapper>
      );

      const scrollView = getByTestId('wrapper-scroll');
      // Expected: 20 + 65 + 40 = 125
      expect(scrollView.props.contentContainerStyle).toEqual(
        expect.objectContaining({ paddingBottom: 125 })
      );
    });

    it('calculates correct padding for Web (insets.bottom = 0)', () => {
      mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });

      const { getByTestId } = render(
        <TabScreenWrapper testID="wrapper">
          <></>
        </TabScreenWrapper>
      );

      const scrollView = getByTestId('wrapper-scroll');
      // Expected: 0 + 65 + 40 = 105
      expect(scrollView.props.contentContainerStyle).toEqual(
        expect.objectContaining({ paddingBottom: 105 })
      );
    });
  });

  describe('KeyboardAvoidingView Platform Behavior', () => {
    beforeEach(() => {
      mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
    });

    it('uses padding behavior on iOS', () => {
      const Platform = require('react-native/Libraries/Utilities/Platform');
      Object.defineProperty(Platform, 'OS', {
        get: () => 'ios',
        configurable: true,
      });

      const { UNSAFE_getByType } = render(
        <TabScreenWrapper>
          <></>
        </TabScreenWrapper>
      );

      const KeyboardAvoidingView = require('react-native').KeyboardAvoidingView;
      const keyboardView = UNSAFE_getByType(KeyboardAvoidingView);
      expect(keyboardView.props.behavior).toBe('padding');
    });

    it('uses undefined behavior on Android', () => {
      const Platform = require('react-native/Libraries/Utilities/Platform');
      Object.defineProperty(Platform, 'OS', {
        get: () => 'android',
        configurable: true,
      });

      const { UNSAFE_getByType } = render(
        <TabScreenWrapper>
          <></>
        </TabScreenWrapper>
      );

      const KeyboardAvoidingView = require('react-native').KeyboardAvoidingView;
      const keyboardView = UNSAFE_getByType(KeyboardAvoidingView);
      expect(keyboardView.props.behavior).toBeUndefined();
    });

    it('uses undefined behavior on Web', () => {
      const Platform = require('react-native/Libraries/Utilities/Platform');
      Object.defineProperty(Platform, 'OS', {
        get: () => 'web',
        configurable: true,
      });

      const { UNSAFE_getByType } = render(
        <TabScreenWrapper>
          <></>
        </TabScreenWrapper>
      );

      const KeyboardAvoidingView = require('react-native').KeyboardAvoidingView;
      const keyboardView = UNSAFE_getByType(KeyboardAvoidingView);
      expect(keyboardView.props.behavior).toBeUndefined();
    });
  });

  describe('Props Handling', () => {
    beforeEach(() => {
      mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
    });

    it('applies scrollEnabled prop to ScrollView', () => {
      const { getByTestId } = render(
        <TabScreenWrapper testID="wrapper" scrollEnabled={false}>
          <></>
        </TabScreenWrapper>
      );

      const scrollView = getByTestId('wrapper-scroll');
      expect(scrollView.props.scrollEnabled).toBe(false);
    });

    it('defaults scrollEnabled to true when not provided', () => {
      const { getByTestId } = render(
        <TabScreenWrapper testID="wrapper">
          <></>
        </TabScreenWrapper>
      );

      const scrollView = getByTestId('wrapper-scroll');
      expect(scrollView.props.scrollEnabled).toBe(true);
    });

    it('merges contentContainerStyle with bottom padding', () => {
      const customStyle = { padding: 16, backgroundColor: 'red' };

      const { getByTestId } = render(
        <TabScreenWrapper testID="wrapper" contentContainerStyle={customStyle}>
          <></>
        </TabScreenWrapper>
      );

      const scrollView = getByTestId('wrapper-scroll');
      expect(scrollView.props.contentContainerStyle).toEqual(
        expect.objectContaining({
          padding: 16,
          backgroundColor: 'red',
          paddingBottom: 105, // 0 + 65 + 40
        })
      );
    });

    it('applies testID correctly', () => {
      const { getByTestId } = render(
        <TabScreenWrapper testID="custom-wrapper">
          <></>
        </TabScreenWrapper>
      );

      expect(getByTestId('custom-wrapper')).toBeTruthy();
      expect(getByTestId('custom-wrapper-scroll')).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    beforeEach(() => {
      mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
    });

    it('renders SafeAreaView with correct edges', () => {
      const { UNSAFE_getByType } = render(
        <TabScreenWrapper>
          <></>
        </TabScreenWrapper>
      );

      const SafeAreaView = require('react-native-safe-area-context').SafeAreaView;
      const safeArea = UNSAFE_getByType(SafeAreaView);
      expect(safeArea.props.edges).toEqual(['top', 'left', 'right']);
    });

    it('renders children inside ScrollView', () => {
      const { getByText } = render(
        <TabScreenWrapper>
          <>{/* Test content */}</>
        </TabScreenWrapper>
      );

      // Component structure should exist
      expect(() => getByText('Test content')).not.toThrow();
    });
  });

  describe('Snapshots', () => {
    beforeEach(() => {
      mockUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
    });

    it('matches snapshot with default props', () => {
      const { toJSON } = render(
        <TabScreenWrapper>
          <></>
        </TabScreenWrapper>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with custom contentContainerStyle', () => {
      const { toJSON } = render(
        <TabScreenWrapper contentContainerStyle={{ padding: 20 }}>
          <></>
        </TabScreenWrapper>
      );

      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with scrollEnabled=false', () => {
      const { toJSON } = render(
        <TabScreenWrapper scrollEnabled={false}>
          <></>
        </TabScreenWrapper>
      );

      expect(toJSON()).toMatchSnapshot();
    });
  });
});

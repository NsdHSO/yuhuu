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
});

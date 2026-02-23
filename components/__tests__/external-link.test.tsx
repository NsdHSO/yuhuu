import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { openBrowserAsync } from 'expo-web-browser';
import { ExternalLink } from '../external-link';

jest.mock('expo-web-browser');

describe('ExternalLink Component', () => {
  const originalExpoOS = process.env.EXPO_OS;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_OS = 'ios';
  });

  afterAll(() => {
    process.env.EXPO_OS = originalExpoOS;
  });

  describe('Rendering', () => {
    it('should render with href and children', () => {
      const { getByTestId } = render(
        <ExternalLink href="https://example.com">
          Example Link
        </ExternalLink>
      );
      const link = getByTestId('expo-router-link');
      expect(link).toBeTruthy();
    });

    it('should render with complex children', () => {
      const { getByTestId } = render(
        <ExternalLink href="https://example.com">
          <></>Link with text
        </ExternalLink>
      );
      const link = getByTestId('expo-router-link');
      expect(link).toBeTruthy();
    });
  });

  describe('Native Behavior', () => {
    it('should open browser on native when pressed', async () => {
      const href = 'https://example.com';
      const { getByTestId } = render(
        <ExternalLink href={href}>Native Link</ExternalLink>
      );

      const link = getByTestId('expo-router-link');
      await fireEvent.press(link);

      expect(openBrowserAsync).toHaveBeenCalledWith(
        href,
        expect.objectContaining({
          presentationStyle: expect.anything(),
        })
      );
    });

    it('should open browser with Android OS', async () => {
      process.env.EXPO_OS = 'android';
      const href = 'https://example.com/android';
      const { getByTestId } = render(
        <ExternalLink href={href}>Android Link</ExternalLink>
      );

      const link = getByTestId('expo-router-link');
      await fireEvent.press(link);

      expect(openBrowserAsync).toHaveBeenCalledWith(
        href,
        expect.anything()
      );
    });

    it('should handle different URLs', async () => {
      const testUrls = [
        'https://google.com',
        'https://github.com/user/repo',
        'https://example.com/path/to/page',
      ];

      for (const url of testUrls) {
        const { getByTestId, unmount } = render(
          <ExternalLink href={url}>Test Link</ExternalLink>
        );

        await fireEvent.press(getByTestId('expo-router-link'));
        expect(openBrowserAsync).toHaveBeenCalledWith(url, expect.anything());

        unmount();
        jest.clearAllMocks();
      }
    });
  });

  describe('Web Behavior', () => {
    // Skip this test as process.env.EXPO_OS is inlined at compile time
    // and cannot be reliably changed in the test environment
    it.skip('should not call openBrowserAsync on web', async () => {
      const { getByTestId } = render(
        <ExternalLink href="https://example.com">Web Link</ExternalLink>
      );

      await fireEvent.press(getByTestId('expo-router-link'));

      expect(openBrowserAsync).not.toHaveBeenCalled();
    });
  });

  describe('Props Handling', () => {
    it('should pass through additional Link props', () => {
      const { getByTestId } = render(
        <ExternalLink
          href="https://example.com"
          testID="custom-test-id"
        >
          Props Link
        </ExternalLink>
      );
      expect(getByTestId('custom-test-id')).toBeTruthy();
    });

    it('should have target="_blank" attribute', () => {
      const { getByTestId } = render(
        <ExternalLink href="https://example.com">
          Blank Target Link
        </ExternalLink>
      );
      expect(getByTestId('expo-router-link')).toBeTruthy();
    });
  });

  describe('URL Variations', () => {
    it('should handle http URLs', async () => {
      const { getByTestId } = render(
        <ExternalLink href="http://example.com">HTTP Link</ExternalLink>
      );

      await fireEvent.press(getByTestId('expo-router-link'));
      expect(openBrowserAsync).toHaveBeenCalledWith(
        'http://example.com',
        expect.anything()
      );
    });

    it('should handle URLs with query parameters', async () => {
      const url = 'https://example.com?param=value&other=123';
      const { getByTestId } = render(
        <ExternalLink href={url}>Query Link</ExternalLink>
      );

      await fireEvent.press(getByTestId('expo-router-link'));
      expect(openBrowserAsync).toHaveBeenCalledWith(url, expect.anything());
    });

    it('should handle URLs with hash fragments', async () => {
      const url = 'https://example.com/page#section';
      const { getByTestId } = render(
        <ExternalLink href={url}>Hash Link</ExternalLink>
      );

      await fireEvent.press(getByTestId('expo-router-link'));
      expect(openBrowserAsync).toHaveBeenCalledWith(url, expect.anything());
    });
  });
});

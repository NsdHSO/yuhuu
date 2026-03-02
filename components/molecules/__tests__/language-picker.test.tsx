import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Mock the useLanguage hook
jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: jest.fn(() => ({
    language: 'en',
    changeLanguage: jest.fn(),
  })),
}));

// Mock @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const Picker = (props: any) =>
    React.createElement('View', { testID: props.testID, ...props }, props.children);
  Picker.Item = (props: any) =>
    React.createElement('View', props);
  return { Picker };
});

describe('LanguagePicker', () => {
  beforeAll(async () => {
    if (!i18n.isInitialized) {
      await i18n.use(initReactI18next).init({
        lng: 'en',
        fallbackLng: 'en',
        resources: {
          en: {
            translation: {
              profile: { language: 'Language' },
              language: {
                english: 'English',
                romanian: 'Română',
                select: 'Select Language',
              },
            },
          },
          ro: {
            translation: {
              profile: { language: 'Limbă' },
              language: {
                english: 'English',
                romanian: 'Română',
                select: 'Selectează limba',
              },
            },
          },
        },
        interpolation: {
          escapeValue: false,
        },
      });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render language picker with current language', () => {
    const { useLanguage } = require('@/hooks/useLanguage');
    useLanguage.mockReturnValue({
      language: 'en',
      changeLanguage: jest.fn(),
    });

    const LanguagePicker = require('../language-picker').default;

    const { getByText } = render(
      <I18nextProvider i18n={i18n}>
        <LanguagePicker />
      </I18nextProvider>
    );

    expect(getByText('Language')).toBeTruthy();
  });

  it('should call changeLanguage when selection changes', async () => {
    const mockChangeLanguage = jest.fn();
    const { useLanguage } = require('@/hooks/useLanguage');
    useLanguage.mockReturnValue({
      language: 'en',
      changeLanguage: mockChangeLanguage,
    });

    const LanguagePicker = require('../language-picker').default;

    const { getByTestId } = render(
      <I18nextProvider i18n={i18n}>
        <LanguagePicker />
      </I18nextProvider>
    );

    const picker = getByTestId('language-picker');
    fireEvent(picker, 'onValueChange', 'ro');

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('ro');
    });
  });
});

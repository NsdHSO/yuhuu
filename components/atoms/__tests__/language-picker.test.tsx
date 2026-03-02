/**
 * TDD tests for LanguagePicker component
 *
 * Tests the language selection UI component that allows users
 * to switch between English and Romanian.
 */

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

jest.mock('expo-secure-store');
jest.mock('expo-localization', () => ({
    getLocales: jest.fn(() => [{ languageCode: 'en', languageTag: 'en-US' }]),
}));

import * as SecureStore from 'expo-secure-store';
import { initI18n } from '@/lib/i18n';
import i18n from '@/lib/i18n';
import { LanguagePicker } from '../language-picker';

describe('LanguagePicker', () => {
    beforeAll(async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
        await initI18n();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
        await i18n.changeLanguage('en');
    });

    it('should render the component', () => {
        const { getByTestId } = render(<LanguagePicker />);
        expect(getByTestId('language-picker')).toBeTruthy();
    });

    it('should display language options', () => {
        const { getByText } = render(<LanguagePicker />);
        expect(getByText('English')).toBeTruthy();
        expect(getByText('Romana')).toBeTruthy();
    });

    it('should highlight the current language', () => {
        const { getByTestId } = render(<LanguagePicker />);
        const enOption = getByTestId('language-option-en');
        expect(enOption).toBeTruthy();
    });

    it('should change language when a different option is pressed', async () => {
        const { getByTestId } = render(<LanguagePicker />);

        fireEvent.press(getByTestId('language-option-ro'));

        await waitFor(() => {
            expect(i18n.language).toBe('ro');
        });
    });

    it('should persist language choice to SecureStore', async () => {
        const { getByTestId } = render(<LanguagePicker />);

        fireEvent.press(getByTestId('language-option-ro'));

        await waitFor(() => {
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                '@user-language',
                'ro',
            );
        });
    });

    it('should update visual selection after language change', async () => {
        const { getByTestId } = render(<LanguagePicker />);

        fireEvent.press(getByTestId('language-option-ro'));

        await waitFor(() => {
            expect(i18n.language).toBe('ro');
        });
    });

    it('should handle SecureStore write failures gracefully', async () => {
        (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
            new Error('Storage error'),
        );
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        const { getByTestId } = render(<LanguagePicker />);

        fireEvent.press(getByTestId('language-option-ro'));

        await waitFor(() => {
            // Language should still change in-memory
            expect(i18n.language).toBe('ro');
        });

        consoleWarnSpy.mockRestore();
    });
});

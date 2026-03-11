import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {I18nextProvider, initReactI18next} from 'react-i18next';
import i18n from 'i18next';

// Mock the useLanguage hook
jest.mock('@/hooks/useLanguage', () => ({
    useLanguage: jest.fn(() => ({
        language: 'en',
        changeLanguage: jest.fn(),
    })),
}));

// Mock the useGlowVariant hook
jest.mock('../../hooks/useGlowVariant', () => ({
    useGlowVariant: jest.fn(() => ({
        glowVariant: 'cool',
        setGlowVariant: jest.fn(),
    })),
}));

describe('LanguagePicker', () => {
    beforeAll(async () => {
        if (!i18n.isInitialized) {
            await i18n.use(initReactI18next).init({
                lng: 'en',
                fallbackLng: 'en',
                resources: {
                    en: {
                        translation: {
                            profile: {language: 'Language'},
                            language: {
                                english: 'English',
                                romanian: 'Română',
                                select: 'Select Language',
                            },
                        },
                    },
                    ro: {
                        translation: {
                            profile: {language: 'Limbă'},
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
        const {useLanguage} = require('@/hooks/useLanguage');
        useLanguage.mockReturnValue({
            language: 'en',
            changeLanguage: jest.fn(),
        });

        const { LanguagePicker } = require('../language-picker');

        const {getByText} = render(
            <I18nextProvider i18n={i18n}>
                <LanguagePicker/>
            </I18nextProvider>
        );

        expect(getByText('Language')).toBeTruthy();
    });

    it('should call changeLanguage when language button is pressed', async () => {
        const mockChangeLanguage = jest.fn();
        const {useLanguage} = require('@/hooks/useLanguage');
        useLanguage.mockReturnValue({
            language: 'en',
            changeLanguage: mockChangeLanguage,
        });

        const { LanguagePicker } = require('../language-picker');

        const {getByTestId} = render(
            <I18nextProvider i18n={i18n}>
                <LanguagePicker/>
            </I18nextProvider>
        );

        const roButton = getByTestId('language-button-ro');
        fireEvent.press(roButton);

        await waitFor(() => {
            expect(mockChangeLanguage).toHaveBeenCalledWith('ro');
        });
    });
});

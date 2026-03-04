import React from 'react';
import {act, render, screen} from '@testing-library/react-native';
import i18n from '@yuhuu/i18n';
import {EmptyState} from '../empty-state';

jest.mock('expo-localization');
jest.mock('expo-secure-store');

describe('EmptyState i18n integration', () => {
    beforeEach(async () => {
        const {initI18n} = require('@yuhuu/i18n');
        await initI18n();
    });

    afterEach(async () => {
        await act(async () => {
            await i18n.changeLanguage('en');
        });
    });

    it('should use the translation key supper.emptyState', () => {
        render(<EmptyState/>);
        // Verify the rendered text matches the English translation value
        expect(screen.getByText('Select a date to view dinner details')).toBeTruthy();
    });

    it('should not contain hardcoded English strings when language is Romanian', async () => {
        await act(async () => {
            await i18n.changeLanguage('ro');
        });
        const {queryByText} = render(<EmptyState/>);
        expect(queryByText('Select a date to view dinner details')).toBeNull();
    });

    it('should render Romanian translation when language is ro', async () => {
        await act(async () => {
            await i18n.changeLanguage('ro');
        });
        render(<EmptyState/>);
        expect(
            screen.getByText('Selectează o dată pentru a vedea detaliile cinei')
        ).toBeTruthy();
    });

    it('should switch from English to Romanian dynamically', async () => {
        const {queryByText, rerender} = render(<EmptyState/>);
        expect(queryByText('Select a date to view dinner details')).toBeTruthy();

        await act(async () => {
            await i18n.changeLanguage('ro');
        });
        rerender(<EmptyState/>);

        expect(queryByText('Select a date to view dinner details')).toBeNull();
        expect(
            queryByText('Selectează o dată pentru a vedea detaliile cinei')
        ).toBeTruthy();
    });

    it('should switch from Romanian back to English', async () => {
        await act(async () => {
            await i18n.changeLanguage('ro');
        });
        const {queryByText, rerender} = render(<EmptyState/>);
        expect(
            queryByText('Selectează o dată pentru a vedea detaliile cinei')
        ).toBeTruthy();

        await act(async () => {
            await i18n.changeLanguage('en');
        });
        rerender(<EmptyState/>);

        expect(queryByText('Select a date to view dinner details')).toBeTruthy();
    });

    it('should fall back to English for unsupported language', async () => {
        await act(async () => {
            await i18n.changeLanguage('fr');
        });
        render(<EmptyState/>);
        // Fallback language is English
        expect(screen.getByText('Select a date to view dinner details')).toBeTruthy();
    });
});

import React from 'react';
import {render, screen} from '@testing-library/react-native';
import i18n from '@/lib/i18n';
import {ErrorState} from '../error-state';

jest.mock('expo-localization');
jest.mock('expo-secure-store');

describe('ErrorState i18n integration', () => {
    beforeEach(async () => {
        const {initI18n} = require('@/lib/i18n');
        await initI18n();
    });

    afterEach(async () => {
        await i18n.changeLanguage('en');
    });

    it('should use the translation key supper.noDinnerFound with date interpolation', () => {
        render(<ErrorState selectedDate="2026-03-02"/>);
        expect(screen.getByText('No dinner found for 2026-03-02')).toBeTruthy();
    });

    it('should interpolate different date values correctly', () => {
        render(<ErrorState selectedDate="2025-12-25"/>);
        expect(screen.getByText('No dinner found for 2025-12-25')).toBeTruthy();
    });

    it('should handle empty date string in interpolation', () => {
        render(<ErrorState selectedDate=""/>);
        expect(screen.getByText('No dinner found for ')).toBeTruthy();
    });

    it('should not contain hardcoded English strings when language is Romanian', async () => {
        await i18n.changeLanguage('ro');
        const {queryByText} = render(<ErrorState selectedDate="2026-03-02"/>);
        expect(queryByText(/No dinner found for/)).toBeNull();
    });

    it('should render Romanian translation with date interpolation', async () => {
        await i18n.changeLanguage('ro');
        render(<ErrorState selectedDate="2026-03-02"/>);
        expect(
            screen.getByText('Nicio cină găsită pentru 2026-03-02')
        ).toBeTruthy();
    });

    it('should switch from English to Romanian dynamically', async () => {
        const {queryByText, rerender} = render(
            <ErrorState selectedDate="2026-03-02"/>
        );
        expect(queryByText('No dinner found for 2026-03-02')).toBeTruthy();

        await i18n.changeLanguage('ro');
        rerender(<ErrorState selectedDate="2026-03-02"/>);

        expect(queryByText('No dinner found for 2026-03-02')).toBeNull();
        expect(
            queryByText('Nicio cină găsită pentru 2026-03-02')
        ).toBeTruthy();
    });

    it('should switch from Romanian back to English', async () => {
        await i18n.changeLanguage('ro');
        const {queryByText, rerender} = render(
            <ErrorState selectedDate="2026-03-02"/>
        );
        expect(
            queryByText('Nicio cină găsită pentru 2026-03-02')
        ).toBeTruthy();

        await i18n.changeLanguage('en');
        rerender(<ErrorState selectedDate="2026-03-02"/>);

        expect(queryByText('No dinner found for 2026-03-02')).toBeTruthy();
    });

    it('should preserve date interpolation across language switches', async () => {
        const date = '2026-06-15';

        const {queryByText, rerender} = render(
            <ErrorState selectedDate={date}/>
        );
        expect(queryByText(`No dinner found for ${date}`)).toBeTruthy();

        await i18n.changeLanguage('ro');
        rerender(<ErrorState selectedDate={date}/>);
        expect(queryByText(`Nicio cină găsită pentru ${date}`)).toBeTruthy();

        await i18n.changeLanguage('en');
        rerender(<ErrorState selectedDate={date}/>);
        expect(queryByText(`No dinner found for ${date}`)).toBeTruthy();
    });

    it('should fall back to English for unsupported language', async () => {
        await i18n.changeLanguage('fr');
        render(<ErrorState selectedDate="2026-03-02"/>);
        expect(screen.getByText('No dinner found for 2026-03-02')).toBeTruthy();
    });
});

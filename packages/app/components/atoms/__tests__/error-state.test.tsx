import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {ErrorState} from '../error-state';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: any) => {
            if (key === 'supper.noDinnerFound' && opts?.date !== undefined) {
                return `No dinner found for ${opts.date}`;
            }
            return key;
        },
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

describe('ErrorState Component', () => {
    it('should render with the selected date', () => {
        render(<ErrorState selectedDate="2026-03-02"/>);
        expect(screen.getByText('No dinner found for 2026-03-02')).toBeTruthy();
    });

    it('should display different dates correctly', () => {
        render(<ErrorState selectedDate="2025-12-25"/>);
        expect(screen.getByText('No dinner found for 2025-12-25')).toBeTruthy();
    });

    it('should handle empty date string', () => {
        render(<ErrorState selectedDate=""/>);
        expect(screen.getByText('No dinner found for ')).toBeTruthy();
    });
});

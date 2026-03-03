import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {EmptyState} from '../empty-state';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'supper.emptyState': 'Select a date to view dinner details',
            };
            return translations[key] ?? key;
        },
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

describe('EmptyState Component', () => {
    it('should render the prompt text', () => {
        render(<EmptyState/>);
        expect(screen.getByText('Select a date to view dinner details')).toBeTruthy();
    });
});

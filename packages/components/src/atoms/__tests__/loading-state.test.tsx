import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {LoadingState} from '../loading-state';

const mockT = jest.fn((key: string) => {
    const translations: Record<string, string> = {
        'common.loading': 'Loading...',
    };
    return translations[key] ?? key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

describe('LoadingState Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the loading text using translation key', () => {
        render(<LoadingState/>);
        expect(mockT).toHaveBeenCalledWith('common.loading');
        expect(screen.getByText('Loading...')).toBeTruthy();
    });

    it('should render an ActivityIndicator', () => {
        const {UNSAFE_getByType} = render(<LoadingState/>);
        const {ActivityIndicator} = require('react-native');
        expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
});

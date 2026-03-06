import React from 'react';
import {render} from '@testing-library/react-native';
import {UserSearch} from '../user-search';

const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

describe('UserSearch - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("admin.searchPlaceholder") for search input placeholder', () => {
        render(<UserSearch onSearch={jest.fn()}/>);
        expect(mockT).toHaveBeenCalledWith('admin.searchPlaceholder');
    });

    it('should use t("common.search") for search button text', () => {
        render(<UserSearch onSearch={jest.fn()}/>);
        expect(mockT).toHaveBeenCalledWith('common.search');
    });

    it('should not contain hardcoded English strings', () => {
        mockT.mockImplementation((key: string) => `__${key}__`);
        const {queryByText} = render(<UserSearch onSearch={jest.fn()}/>);
        expect(queryByText('Search by username')).toBeNull();
        expect(queryByText('Search')).toBeNull();
    });
});

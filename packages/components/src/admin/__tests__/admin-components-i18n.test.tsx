import React from 'react';
import {render} from '@testing-library/react-native';
import {UserSearch} from '../user-search';
import {DinnerIdSearch} from '../dinner-id-search';

/**
 * TDD tests for admin component i18n migration.
 *
 * UserSearch:
 *   "Search by username" -> admin.searchPlaceholder
 *   "Search"             -> common.search
 *
 * DinnerIdSearch:
 *   "Enter dinner ID"    -> admin.dinnerIdPlaceholder
 */

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

describe('DinnerIdSearch - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("admin.dinnerIdPlaceholder") for dinner ID input placeholder', () => {
        render(<DinnerIdSearch onDinnerIdChange={jest.fn()}/>);
        expect(mockT).toHaveBeenCalledWith('admin.dinnerIdPlaceholder');
    });

    it('should not contain hardcoded "Enter dinner ID"', () => {
        mockT.mockImplementation((key: string) => `__${key}__`);
        const {queryByText} = render(<DinnerIdSearch onDinnerIdChange={jest.fn()}/>);
        expect(queryByText('Enter dinner ID')).toBeNull();
    });
});

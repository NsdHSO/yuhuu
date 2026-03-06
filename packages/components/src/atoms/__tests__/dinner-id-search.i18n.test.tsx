import React from 'react';
import {render} from '@testing-library/react-native';
import {DinnerIdSearch} from '../dinner-id-search';

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

import React from 'react';
import {render} from '@testing-library/react-native';
import {EmptyState} from '../empty-state';
import {ErrorState} from '../error-state';

/**
 * TDD tests for atom components i18n migration.
 *
 * EmptyState: supper.emptyState -> "Select a date to view dinner details"
 * ErrorState: supper.noDinnerFound -> "No dinner found for {{date}}"
 */

// --- Mock react-i18next ---
const mockT = jest.fn((key: string, opts?: any) => {
    if (opts?.date) return `${key}:${opts.date}`;
    return key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

describe('EmptyState - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("supper.emptyState") instead of hardcoded string', () => {
        render(<EmptyState/>);
        expect(mockT).toHaveBeenCalledWith('supper.emptyState');
    });

    it('should not contain hardcoded "Select a date to view dinner details"', () => {
        mockT.mockImplementation((key: string) => `__${key}__`);
        const {queryByText} = render(<EmptyState/>);
        expect(queryByText('Select a date to view dinner details')).toBeNull();
    });
});

describe('ErrorState - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("supper.noDinnerFound") with date interpolation', () => {
        render(<ErrorState selectedDate="2026-03-02"/>);
        expect(mockT).toHaveBeenCalledWith('supper.noDinnerFound', {date: '2026-03-02'});
    });

    it('should not contain hardcoded "No dinner found for" text', () => {
        mockT.mockImplementation((key: string) => `__${key}__`);
        const {queryByText} = render(<ErrorState selectedDate="2026-03-02"/>);
        expect(queryByText(/No dinner found for/)).toBeNull();
    });
});

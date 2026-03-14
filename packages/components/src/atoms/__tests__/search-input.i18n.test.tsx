import React from 'react';
import {act, render, screen} from '@testing-library/react-native';
import i18n from '@yuhuu/i18n';
import {SearchInput} from '../search-input';

// Unmock react-i18next for i18n integration tests
jest.unmock('react-i18next');

jest.mock('expo-localization');
jest.mock('expo-secure-store');

describe('SearchInput i18n integration', () => {
    beforeEach(async () => {
        const {initI18n} = require('@yuhuu/i18n');
        await initI18n();
    });

    afterEach(async () => {
        await act(async () => {
            await i18n.changeLanguage('en');
        });
    });

    it('should use the translation key for placeholder in English', () => {
        const {getByPlaceholderText} = render(
            <SearchInput
                type="text"
                onValueChange={jest.fn()}
                placeholder={i18n.t('common.search')}
            />
        );
        // Verify the rendered text matches the English translation value
        expect(getByPlaceholderText('Search')).toBeTruthy();
    });

    it('should not contain hardcoded English placeholder when language is Romanian', async () => {
        await act(async () => {
            await i18n.changeLanguage('ro');
        });
        const {queryByPlaceholderText} = render(
            <SearchInput
                type="text"
                onValueChange={jest.fn()}
                placeholder={i18n.t('common.search')}
            />
        );
        expect(queryByPlaceholderText('Search')).toBeNull();
    });

    it('should render Romanian translation for placeholder when language is ro', async () => {
        await act(async () => {
            await i18n.changeLanguage('ro');
        });
        render(
            <SearchInput
                type="text"
                onValueChange={jest.fn()}
                placeholder={i18n.t('common.search')}
            />
        );
        expect(screen.getByPlaceholderText('Caută')).toBeTruthy();
    });

    it('should switch from English to Romanian placeholder dynamically', async () => {
        const {queryByPlaceholderText, rerender} = render(
            <SearchInput
                type="text"
                onValueChange={jest.fn()}
                placeholder={i18n.t('common.search')}
            />
        );
        expect(queryByPlaceholderText('Search')).toBeTruthy();

        await act(async () => {
            await i18n.changeLanguage('ro');
        });
        rerender(
            <SearchInput
                type="text"
                onValueChange={jest.fn()}
                placeholder={i18n.t('common.search')}
            />
        );

        expect(queryByPlaceholderText('Search')).toBeNull();
        expect(queryByPlaceholderText('Caută')).toBeTruthy();
    });

    it('should switch from Romanian back to English placeholder', async () => {
        await act(async () => {
            await i18n.changeLanguage('ro');
        });
        const {queryByPlaceholderText, rerender} = render(
            <SearchInput
                type="text"
                onValueChange={jest.fn()}
                placeholder={i18n.t('common.search')}
            />
        );
        expect(queryByPlaceholderText('Caută')).toBeTruthy();

        await act(async () => {
            await i18n.changeLanguage('en');
        });
        rerender(
            <SearchInput
                type="text"
                onValueChange={jest.fn()}
                placeholder={i18n.t('common.search')}
            />
        );

        expect(queryByPlaceholderText('Search')).toBeTruthy();
    });

    it('should fall back to English for unsupported language', async () => {
        await act(async () => {
            await i18n.changeLanguage('fr');
        });
        render(
            <SearchInput
                type="text"
                onValueChange={jest.fn()}
                placeholder={i18n.t('common.search')}
            />
        );
        // Fallback language is English
        expect(screen.getByPlaceholderText('Search')).toBeTruthy();
    });

    it('should support admin.dinnerIdPlaceholder translation key', () => {
        const {getByPlaceholderText} = render(
            <SearchInput
                type="numeric"
                onValueChange={jest.fn()}
                placeholder={i18n.t('admin.dinnerIdPlaceholder')}
            />
        );
        expect(getByPlaceholderText('Enter dinner ID')).toBeTruthy();
    });

    it('should support admin.searchPlaceholder translation key', () => {
        const {getByPlaceholderText} = render(
            <SearchInput
                type="text"
                onValueChange={jest.fn()}
                placeholder={i18n.t('admin.searchPlaceholder')}
            />
        );
        expect(getByPlaceholderText('Search by username')).toBeTruthy();
    });

    it('should handle custom placeholder text without translation', () => {
        const {getByPlaceholderText} = render(
            <SearchInput
                type="text"
                onValueChange={jest.fn()}
                placeholder="Custom placeholder"
            />
        );
        expect(getByPlaceholderText('Custom placeholder')).toBeTruthy();
    });
});

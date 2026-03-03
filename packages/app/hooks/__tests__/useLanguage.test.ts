/**
 * TDD tests for hooks/useLanguage.ts - Language switching hook
 *
 * Tests the useLanguage hook which wraps lib/i18n locale management
 * with SecureStore persistence and React state updates.
 */

jest.mock('expo-secure-store');
jest.mock('expo-localization', () => ({
    getLocales: jest.fn(() => [{languageCode: 'en', languageTag: 'en-US'}]),
}));

import {act, renderHook, waitFor} from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import i18n, {initI18n} from '@yuhuu/i18n';

const LANGUAGE_KEY = 'user-language';

describe('useLanguage Hook', () => {
    beforeAll(async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
        await initI18n();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
        await i18n.changeLanguage('en');
    });

    it('should return current language', () => {
        const {useLanguage} = require('../useLanguage');
        const {result} = renderHook(() => useLanguage());

        expect(result.current.language).toBe('en');
    });

    it('should change language and persist to secure store', async () => {
        const {useLanguage} = require('../useLanguage');

        const {result} = renderHook(() => useLanguage());

        await act(async () => {
            await result.current.changeLanguage('ro');
        });

        await waitFor(() => {
            expect(result.current.language).toBe('ro');
        });

        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(LANGUAGE_KEY, 'ro');
    });

    it('should handle secure store write failures gracefully', async () => {
        const {useLanguage} = require('../useLanguage');
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Storage error'));

        const {result} = renderHook(() => useLanguage());

        await act(async () => {
            await result.current.changeLanguage('ro');
        });

        // Language should still change in memory even if persistence fails
        await waitFor(() => {
            expect(result.current.language).toBe('ro');
        });

        expect(consoleWarnSpy).toHaveBeenCalled();
        consoleWarnSpy.mockRestore();
    });

    it('should re-render components when language changes', async () => {
        const {useLanguage} = require('../useLanguage');

        const {result, rerender} = renderHook(() => useLanguage());

        expect(result.current.language).toBe('en');

        await act(async () => {
            await result.current.changeLanguage('ro');
        });

        rerender();

        await waitFor(() => {
            expect(result.current.language).toBe('ro');
        });
    });
});

/**
 * TDD tests for hooks/use-translation.ts
 *
 * Tests the useTranslation wrapper hook that provides:
 * - Translation function (t) via react-i18next
 * - Language switching with SecureStore persistence
 * - Current language and supported locales
 */

jest.mock('expo-localization', () => ({
    getLocales: jest.fn(() => [{ languageCode: 'en', languageTag: 'en-US' }]),
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
}));

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from '../use-translation';
import { initI18n } from '@/lib/i18n';
import i18n from 'i18next';

const mockSetItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
const mockGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;

describe('useTranslation', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        mockGetItemAsync.mockResolvedValue(null);
        await initI18n();
    });

    it('should return t function from react-i18next', () => {
        const { result } = renderHook(() => useTranslation());
        expect(typeof result.current.t).toBe('function');
    });

    it('should return current language', () => {
        const { result } = renderHook(() => useTranslation());
        expect(result.current.language).toBe('en');
    });

    it('should return changeLanguage function', () => {
        const { result } = renderHook(() => useTranslation());
        expect(typeof result.current.changeLanguage).toBe('function');
    });

    it('should return supported locales', () => {
        const { result } = renderHook(() => useTranslation());
        expect(result.current.supportedLocales).toEqual(['en', 'ro']);
    });

    it('should translate keys', () => {
        const { result } = renderHook(() => useTranslation());
        expect(result.current.t('auth.login.title')).toBe('Sign in');
    });

    it('should translate common keys', () => {
        const { result } = renderHook(() => useTranslation());
        expect(result.current.t('common.error')).toBe('Error');
    });

    it('should change language to Romanian', async () => {
        const { result } = renderHook(() => useTranslation());

        await act(async () => {
            await result.current.changeLanguage('ro');
        });

        expect(result.current.language).toBe('ro');
        expect(result.current.t('auth.login.title')).toBe('Autentificare');
    });

    it('should persist language choice to SecureStore', async () => {
        const { result } = renderHook(() => useTranslation());

        await act(async () => {
            await result.current.changeLanguage('ro');
        });

        expect(mockSetItemAsync).toHaveBeenCalledWith('@user-language', 'ro');
    });

    it('should switch back to English from Romanian', async () => {
        const { result } = renderHook(() => useTranslation());

        await act(async () => {
            await result.current.changeLanguage('ro');
        });
        expect(result.current.t('common.error')).toBe('Eroare');

        await act(async () => {
            await result.current.changeLanguage('en');
        });

        expect(result.current.language).toBe('en');
        expect(result.current.t('common.error')).toBe('Error');
    });

    it('should handle SecureStore write failure gracefully', async () => {
        mockSetItemAsync.mockRejectedValueOnce(new Error('SecureStore write error'));

        const { result } = renderHook(() => useTranslation());

        await act(async () => {
            await result.current.changeLanguage('ro');
        });

        // Language should still change even if persistence fails
        expect(result.current.language).toBe('ro');
    });
});

import { useCallback } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

const LANGUAGE_KEY = '@user-language';
const SUPPORTED_LOCALES = ['en', 'ro'] as const;

export function useTranslation() {
    const { t, i18n } = useI18nextTranslation();

    const changeLanguage = useCallback(async (lang: string) => {
        await i18n.changeLanguage(lang);
        try {
            await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
        } catch {
            // Persist failure is non-critical; language still changes in-memory
        }
    }, [i18n]);

    return {
        t,
        language: i18n.language,
        changeLanguage,
        supportedLocales: [...SUPPORTED_LOCALES],
    };
}

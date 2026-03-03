import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as Localization from 'expo-localization';
import {getItem, setItem} from '@yuhuu/storage';

import en from '../locales/en.json';
import ro from '../locales/ro.json';

import {SUPPORTED_LOCALE_CODES, type SupportedLanguage, type SupportedLocale} from './types';

// Create a dedicated instance so tests can get a fresh one via jest.resetModules()
const i18n: ReturnType<typeof i18next.createInstance> = i18next.createInstance();

const LANGUAGE_KEY = 'user-language';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
    {code: 'en', label: 'English'},
    {code: 'ro', label: 'Romana'},
];

function isSupportedLocale(code: string): code is SupportedLocale {
    return SUPPORTED_LOCALE_CODES.includes(code as SupportedLocale);
}

function detectLanguage(savedLanguage: string | null): SupportedLocale {
    if (savedLanguage && isSupportedLocale(savedLanguage)) {
        return savedLanguage;
    }

    const locales = Localization.getLocales();
    const deviceLanguage = locales[0]?.languageCode;
    if (deviceLanguage && isSupportedLocale(deviceLanguage)) {
        return deviceLanguage;
    }

    return 'en';
}

const resources = {
    en: {translation: en},
    ro: {translation: ro},
};

export async function initI18n(): Promise<void> {
    const savedLanguage = await getItem(LANGUAGE_KEY);
    const lng = detectLanguage(savedLanguage);

    if (i18n.isInitialized) {
        await i18n.changeLanguage(lng);
        return;
    }

    await i18n.use(initReactI18next).init({
        resources,
        lng,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        compatibilityJSON: 'v4',
    });
}

export function getCurrentLanguage(): SupportedLocale {
    const lang = i18n.language;
    return isSupportedLocale(lang) ? lang : 'en';
}

export async function changeLanguage(code: string): Promise<void> {
    if (!isSupportedLocale(code)) {
        return;
    }
    await i18n.changeLanguage(code);
    await setItem(LANGUAGE_KEY, code);
}

export default i18n;

export const SUPPORTED_LOCALE_CODES = ['en', 'ro'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALE_CODES)[number];

export interface SupportedLanguage {
    code: SupportedLocale;
    label: string;
}

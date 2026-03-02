import { useState, useEffect } from 'react';
import * as storage from '@/lib/storage';
import i18n from '@/lib/i18n';

const LANGUAGE_KEY = '@user-language';

type Language = 'en' | 'ro';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(i18n.language as Language);

  useEffect(() => {
    const onLanguageChanged = (lng: string) => {
      setLanguage(lng as Language);
    };

    i18n.on('languageChanged', onLanguageChanged);

    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  const changeLanguage = async (lng: Language) => {
    await i18n.changeLanguage(lng);
    setLanguage(lng);
    await storage.setItem(LANGUAGE_KEY, lng);
  };

  return {
    language,
    changeLanguage,
  };
}

import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import i18n, {
  initI18n,
  getCurrentLanguage,
  changeLanguage,
  SUPPORTED_LANGUAGES,
} from '../i18n';

jest.mock('expo-localization');
jest.mock('expo-secure-store');

describe('i18n Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initI18n', () => {
    it('should initialize with English as default fallback', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();

      expect(i18n.language).toBe('en');
    });

    it('should detect Romanian device locale and set Romanian', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'ro', regionCode: 'RO' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();

      expect(i18n.language).toBe('ro');
    });

    it('should use saved language preference from secure store', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('ro');

      await initI18n();

      expect(i18n.language).toBe('ro');
    });

    it('should fallback to English for unsupported locales', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'fr', regionCode: 'FR' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();

      expect(i18n.language).toBe('en');
    });

    it('should handle empty device locale array gracefully', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();

      expect(i18n.language).toBe('en');
    });

    it('should handle Moldova locale (ro-MD) as Romanian', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'ro', regionCode: 'MD' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();

      expect(i18n.language).toBe('ro');
    });

    it('should handle secure store read failures gracefully', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage unavailable')
      );

      await initI18n();

      expect(i18n.language).toBe('en');
    });

    it('should ignore invalid saved language preference', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('invalid');

      await initI18n();

      expect(i18n.language).toBe('en');
    });

    it('should load translation resources for both languages', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();

      expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
      expect(i18n.hasResourceBundle('ro', 'translation')).toBe(true);
    });

    it('should translate keys correctly in English', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();

      expect(i18n.t('common.loading')).toBe('Loading...');
    });

    it('should translate keys in Romanian when set to ro', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'ro' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();

      expect(i18n.t('common.loading')).toBe('Se încarcă...');
    });

    it('should not escape values (React handles escaping)', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();

      expect(i18n.options.interpolation?.escapeValue).toBe(false);
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current language code', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();

      expect(getCurrentLanguage()).toBe('en');
    });

    it('should default to en for unsupported language codes', async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await initI18n();
      i18n.language = 'xx' as any;

      expect(getCurrentLanguage()).toBe('en');
    });
  });

  describe('changeLanguage', () => {
    beforeEach(async () => {
      (Localization.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en' },
      ]);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      await initI18n();
      jest.clearAllMocks();
    });

    it('should change language and persist to secure store', async () => {
      await changeLanguage('ro');

      expect(i18n.language).toBe('ro');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        '@user-language',
        'ro'
      );
    });

    it('should not change language for unsupported locale codes', async () => {
      await changeLanguage('fr');

      expect(i18n.language).toBe('en');
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should handle secure store write failures gracefully', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await changeLanguage('ro');

      expect(i18n.language).toBe('ro');
    });
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('should contain English and Romanian', () => {
      expect(SUPPORTED_LANGUAGES).toEqual([
        { code: 'en', label: 'English' },
        { code: 'ro', label: 'Romana' },
      ]);
    });
  });
});

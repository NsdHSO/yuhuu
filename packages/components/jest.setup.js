// Jest setup for components package
// Increase timeout for async cleanup operations
jest.setTimeout(10000);

// Mock @gorhom/bottom-sheet globally
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const RN = require('react-native');
  return {
    BottomSheetModal: React.forwardRef(
      ({children, testID}: any, ref: any) => {
        const [isVisible, setIsVisible] = React.useState(false);

        React.useImperativeHandle(ref, () => ({
          present: () => setIsVisible(true),
          dismiss: () => setIsVisible(false),
        }));

        if (!isVisible) return null;

        return React.createElement(
          RN.View,
          {testID},
          children
        );
      }
    ),
    BottomSheetView: ({children, style}: any) =>
      React.createElement(RN.View, {style}, children),
    BottomSheetModalProvider: ({children}: any) => children,
  };
});

// Mock react-i18next globally for non-i18n tests only
// i18n tests will override this mock
jest.mock('react-i18next', () => {
  const actual = jest.requireActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, opts?: Record<string, unknown>) => {
        // Support common translation patterns for gender picker
        const translations: Record<string, string> = {
          'genderPicker.placeholder': 'Select Gender',
          'genderPicker.male': 'Male',
          'genderPicker.female': 'Female',
          'genderPicker.modalTitle': 'Select Your Gender',
        };

        const translated = translations[key] || key;

        if (opts) {
          return Object.entries(opts).reduce(
            (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
            translated,
          );
        }
        return translated;
      },
      i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
  };
});

// Mock expo-symbols
jest.mock('expo-symbols', () => ({
  SymbolView: 'SymbolView',
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock color scheme hook
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

// Suppress console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

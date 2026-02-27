// Jest setup for React Native Testing Library
// Note: @testing-library/react-native v12.4+ includes matchers by default

// Mock Expo globals
global.__ExpoImportMetaRegistry = {
    get: () => null,
    set: () => {
    }
};

global.structuredClone = (val) => JSON.parse(JSON.stringify(val));

// Mock expo-image
jest.mock('expo-image', () => ({
    Image: 'Image'
}));

// Mock expo-router (implementation in __mocks__/expo-router.js)
jest.mock('expo-router');

// Mock expo-constants
jest.mock('expo-constants', () => ({
    default: {
        expoConfig: {
            extra: {
                EXPO_PUBLIC_GRAPHQL_URL: 'http://test-url.com/graphql'
            }
        }
    }
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock expo-symbols
jest.mock('expo-symbols', () => ({
    SymbolView: 'SymbolView'
}));

// Mock hooks
jest.mock('@/hooks/use-theme-color', () => ({
    useThemeColor: jest.fn((colors) => colors?.light || '#000000')
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: jest.fn(() => 'light')
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
    openBrowserAsync: jest.fn(),
    WebBrowserPresentationStyle: {
        AUTOMATIC: 0
    }
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Light: 'light'
    }
}));

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
    hasHardwareAsync: jest.fn(),
    isEnrolledAsync: jest.fn(),
    supportedAuthenticationTypesAsync: jest.fn(),
    authenticateAsync: jest.fn(),
    AuthenticationType: {
        FINGERPRINT: 1,
        FACIAL_RECOGNITION: 2,
    },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {
    };
    return {
        ...Reanimated,
        useAnimatedRef: jest.fn(() => ({current: null})),
        useScrollOffset: jest.fn(() => ({value: 0})),
        useAnimatedStyle: jest.fn((callback) => callback())
    };
});

// Mock @react-navigation/elements
// Keep this mock free of any out-of-scope imports (like react-native)
// to comply with Jest's mock factory restrictions.
jest.mock('@react-navigation/elements', () => {
    const React = require('react');
    return {
        PlatformPressable: (props) => {
            const {children, ...otherProps} = props;
            return React.createElement('View', otherProps, children);
        }
    };
});

// Mock Linking module will be done per-test as needed

// Mock lib/http/url for tokenManager tests
jest.mock('@/lib/http/url', () => ({
    AUTH_BASE: 'http://localhost:4100/v1',
    APP_BASE: 'http://localhost:2003/v1',
    normalizeBase: jest.fn((url) => url)
}));

// Mock lib/http/envelope for tokenManager tests
jest.mock('@/lib/http/envelope', () => ({
    applyEnvelopeUnwrapper: jest.fn(),
    isEnvelope: jest.fn(),
    unwrap: jest.fn(async (p) => (await p).data)
}));

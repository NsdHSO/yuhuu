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
        FACIAL_RECOGNITION: 2
    }
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    const React = require('react');
    const {View, Text, Image, ScrollView} = require('react-native');

    const Reanimated = {
        default: {
            call: () => {},
            createAnimatedComponent: (Component) => Component,
            addWhitelistedUIProps: jest.fn(),
            addWhitelistedNativeProps: jest.fn(),
        },
        // Create animated component
        createAnimatedComponent: (Component) => Component,
        addWhitelistedUIProps: jest.fn(),
        addWhitelistedNativeProps: jest.fn(),
        // Animated components
        View,
        Text,
        Image,
        ScrollView,
        // Hooks
        useAnimatedRef: jest.fn(() => ({current: null})),
        useScrollOffset: jest.fn(() => ({value: 0})),
        useAnimatedStyle: jest.fn((callback) => callback()),
        useSharedValue: jest.fn((initialValue) => ({value: initialValue})),
        useDerivedValue: jest.fn((callback) => ({value: callback()})),
        useAnimatedScrollHandler: jest.fn(() => () => {}),
        useAnimatedGestureHandler: jest.fn(() => () => {}),
        useAnimatedReaction: jest.fn(() => {}),
        // Animation functions
        withTiming: jest.fn((value) => value),
        withSpring: jest.fn((value) => value),
        withRepeat: jest.fn((value) => value),
        withSequence: jest.fn((...values) => values[0]),
        withDelay: jest.fn((_, value) => value),
        withDecay: jest.fn((value) => value),
        cancelAnimation: jest.fn(),
        // Easing
        Easing: {
            linear: (x) => x,
            ease: (x) => x,
            quad: (x) => x,
            cubic: (x) => x,
            poly: (n) => (x) => x,
            sin: (x) => x,
            circle: (x) => x,
            exp: (x) => x,
            elastic: (bounciness = 1) => (x) => x,
            back: (s = 1.70158) => (x) => x,
            bounce: (x) => x,
            bezier: (x1, y1, x2, y2) => (x) => x,
            in: (easing) => (x) => x,
            out: (easing) => (x) => x,
            inOut: (easing) => (x) => x,
        },
        // Utilities
        interpolate: jest.fn((value, inputRange, outputRange) => outputRange[0]),
        Extrapolate: {
            EXTEND: 'extend',
            CLAMP: 'clamp',
            IDENTITY: 'identity',
        },
        runOnJS: jest.fn((fn) => fn),
        runOnUI: jest.fn((fn) => fn),
    };

    return Reanimated;
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

// Mock expo-location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({status: 'granted'})),
    requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({status: 'granted'})),
    getCurrentPositionAsync: jest.fn(() => Promise.resolve({
        coords: {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10,
            altitude: 0,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0,
        },
        timestamp: Date.now(),
    })),
    watchPositionAsync: jest.fn(() => Promise.resolve({
        remove: jest.fn(),
    })),
    Accuracy: {
        Lowest: 1,
        Low: 2,
        Balanced: 3,
        High: 4,
        Highest: 5,
        BestForNavigation: 6,
    },
    PermissionStatus: {
        GRANTED: 'granted',
        DENIED: 'denied',
        UNDETERMINED: 'undetermined',
    },
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
    default: {
        getItem: jest.fn(() => Promise.resolve(null)),
        setItem: jest.fn(() => Promise.resolve()),
        removeItem: jest.fn(() => Promise.resolve()),
        clear: jest.fn(() => Promise.resolve()),
        getAllKeys: jest.fn(() => Promise.resolve([])),
        multiGet: jest.fn(() => Promise.resolve([])),
        multiSet: jest.fn(() => Promise.resolve()),
        multiRemove: jest.fn(() => Promise.resolve()),
    },
}));

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

// Mock @yuhuu/components with minimal overrides for global tests
jest.mock('@yuhuu/components', () => {
    const React = require('react');
    const {Text, TouchableOpacity} = require('react-native');

    // Try to load actual components
    let actual = {};
    try {
        actual = jest.requireActual('@yuhuu/components');
    } catch (error) {
        // Ignore - some tests have their own mocks
    }

    // Mock useGlassColors hook
    const useGlassColors = () => ({
        activeColor: '#A78BFA',
        glowVariant: 'vibrant',
        scheme: 'light',
        text: '#000',
        subtext: '#64748B',
        glassBackground: 'rgba(200, 210, 230, 0.85)',
        glowOverlay: (borderRadius = 12) => ({
            borderRadius,
            backgroundColor: '#A78BFA0A',
        }),
        glowBorder: (borderRadius = 12, borderWidth = 1) => ({
            borderRadius,
            borderWidth,
            borderColor: '#A78BFA59',
        }),
    });

    // Mock SubmitButton to use native version
    const SubmitButton = ({onPress, disabled, style, textStyle, children, activeOpacity = 0.7}) => {
        return React.createElement(
            TouchableOpacity,
            {onPress, disabled, activeOpacity, style, testID: 'submit-button'},
            React.createElement(Text, {style: textStyle}, children)
        );
    };

    return {
        ...actual,
        useGlassColors,
        SubmitButton,
    };
});

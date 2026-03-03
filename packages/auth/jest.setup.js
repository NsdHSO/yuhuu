// Mock react-native Platform
jest.mock('react-native', () => ({
    Platform: {OS: 'web', select: jest.fn((obj) => obj.web)},
}));

// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
    NativeModulesProxy: {},
}));

// Mock expo-router
jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
        push: jest.fn(),
        back: jest.fn(),
    },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
}));

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
    hasHardwareAsync: jest.fn(),
    isEnrolledAsync: jest.fn(),
    authenticateAsync: jest.fn(),
}));

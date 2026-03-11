module.exports = {
    preset: 'jest-expo',
    testEnvironment: 'node',
    transformIgnorePatterns: [
        'node_modules/(?!(.pnpm|react-native(-[^/]*)?|@react-native(-[^/]*)?|expo(-[^/]*)?|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|@shopify/flash-list|nativewind|i18next|react-i18next|jwt-decode)/)',
    ],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],
    moduleNameMapper: {
        '^@/components/(.*)$': '<rootDir>/src/$1',
        '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
        '^@/lib/i18n$': '<rootDir>/src/lib/i18n.ts',
        '^@yuhuu/i18n$': '<rootDir>/../i18n/src/index.ts',
        '^@yuhuu/auth$': '<rootDir>/../auth/src/index.ts',
        '^@yuhuu/types$': '<rootDir>/../types/src/index.ts',
        '^@yuhuu/storage$': '<rootDir>/../storage/src/index.ts',
        '\\.svg$': '<rootDir>/__mocks__/svgMock.js'
    }
};

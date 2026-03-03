module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'node',
    transformIgnorePatterns: [
        'node_modules/(?!(.pnpm|react-native(-[^/]*)?|@react-native(-[^/]*)?|expo(-[^/]*)?|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|@shopify/flash-list|nativewind|i18next|react-i18next|jwt-decode)/)',
    ],
    maxWorkers: 1,
    testMatch: [
        '<rootDir>/components/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/app/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/hooks/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/locales/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/**/*.{spec,test}.{js,jsx,ts,tsx}'
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/.expo/',
        '/android/',
        '/ios/'
    ],
    collectCoverageFrom: [
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/__tests__/**'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@yuhuu/auth$': '<rootDir>/../auth/src/index.ts',
        '^@yuhuu/components$': '<rootDir>/../components/src/index.ts',
        '^@yuhuu/i18n$': '<rootDir>/../i18n/src/index.ts',
        '^@yuhuu/http$': '<rootDir>/../http/src/index.ts',
        '^@yuhuu/storage$': '<rootDir>/../storage/src/index.ts',
        '\\.css$': '<rootDir>/__mocks__/styleMock.js'
    }
};

module.exports = {
    preset: 'jest-expo',
    testEnvironment: 'node',
    transformIgnorePatterns: [],
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
        '^@yuhuu/i18n$': '<rootDir>/../i18n/src/index.ts',
        '^@yuhuu/auth$': '<rootDir>/../auth/src/index.ts',
        '^@yuhuu/types$': '<rootDir>/../types/src/index.ts',
        '^@yuhuu/storage$': '<rootDir>/../storage/src/index.ts'
    }
};

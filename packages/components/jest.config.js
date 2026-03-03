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
        '^@/lib/i18n$': '<rootDir>/../i18n/src/index.ts',
        '^@/lib/authz$': '<rootDir>/../auth/src/authz/authz.ts'
    }
};

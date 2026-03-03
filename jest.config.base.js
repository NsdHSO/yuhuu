/**
 * Shared Jest configuration for @yuhuu workspace packages.
 *
 * Each package extends this via:
 *   const base = require('../../jest.config.base');
 *   module.exports = { ...base, /* overrides *\/ };
 */
module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(jwt-decode)/)',
    ],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
        '<rootDir>/__tests__/**/*.{ts,tsx}',
        '<rootDir>/**/*.{spec,test}.{ts,tsx}',
    ],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    maxWorkers: 1,
};

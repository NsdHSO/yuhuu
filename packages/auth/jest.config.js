const base = require('../../jest.config.base');

module.exports = {
    ...base,
    displayName: '@yuhuu/auth',
    setupFiles: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@yuhuu/storage$': '<rootDir>/../storage/src/index.ts',
        '^@yuhuu/http$': '<rootDir>/../http/src/index.ts',
    },
};

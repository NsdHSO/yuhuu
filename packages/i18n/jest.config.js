const base = require('../../jest.config.base');

module.exports = {
    ...base,
    displayName: '@yuhuu/i18n',
    moduleNameMapper: {
        '^@yuhuu/storage$': '<rootDir>/../storage/src/index.ts',
    },
};

const eslintConfig = require('@yuhuu/eslint-config');

module.exports = [
    ...eslintConfig,
    {
        files: [
            '**/__tests__/**/*.{ts,tsx,js,jsx}',
            '**/*.test.{ts,tsx,js,jsx}',
            '**/*.spec.{ts,tsx,js,jsx}',
            '**/jest.setup.{ts,js}',
            '**/__mocks__/**/*.{ts,tsx,js,jsx}',
        ],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
];

const {defineConfig} = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
    ...expoConfig,
    {
        ignores: ["dist/*", "node_modules/*"],
    },
    {
        files: ["**/__tests__/**/*.{ts,tsx,js,jsx}", "**/*.test.{ts,tsx,js,jsx}", "**/*.spec.{ts,tsx,js,jsx}", "**/jest.setup.{ts,js}", "**/__mocks__/**/*.{ts,tsx,js,jsx}"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
]);

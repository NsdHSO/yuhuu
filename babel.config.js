// babel.config.js
module.exports = function (api) {
    api.cache(true);
    // Use multiple checks to detect Jest environment (robust for both local and CI)
    const isTest = process.env.JEST_WORKER_ID !== undefined ||
                   process.env.NODE_ENV === 'test' ||
                   process.env.npm_lifecycle_event === 'test';

    return {
        presets: [
            ['babel-preset-expo', {jsxImportSource: 'nativewind'}],
            // Disable NativeWind's Babel preset during Jest runs to avoid
            // `_ReactNativeCSSInterop` being injected into jest.mock factories.
            // Jest forbids out-of-scope captures in mock factories.
            !isTest && 'nativewind/babel'
        ].filter(Boolean)
    };
};

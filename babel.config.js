// babel.config.js
module.exports = function (api) {
  api.cache(true);
  // Use JEST_WORKER_ID to detect Jest environment (more reliable in CI)
  const isTest = process.env.JEST_WORKER_ID !== undefined;

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      // Disable NativeWind's Babel preset during Jest runs to avoid
      // `_ReactNativeCSSInterop` being injected into jest.mock factories.
      // Jest forbids out-of-scope captures in mock factories.
      !isTest && 'nativewind/babel',
    ].filter(Boolean),
  };
};

// metro.config.js
const path = require('path');
const {getDefaultConfig} = require('expo/metro-config');
const {withNativeWind} = require('nativewind/metro');

// Find the monorepo root (parent of packages)
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Configure for monorepo
config.watchFolders = [monorepoRoot];

// Configure path aliases for Metro bundler
config.resolver = {
    ...config.resolver,

    // Alias @ to the app package root
    extraNodeModules: {
        '@': projectRoot,
    },

    // Include packages from workspace
    nodeModulesPaths: [
        path.resolve(projectRoot, 'node_modules'),
        path.resolve(monorepoRoot, 'node_modules'),
    ],
};

module.exports = withNativeWind(config, {input: './app/global.css'});

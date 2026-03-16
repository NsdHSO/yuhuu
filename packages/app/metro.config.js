// metro.config.js
const path = require('path');
const {getDefaultConfig} = require('expo/metro-config');
const {withNativeWind} = require('nativewind/metro');

// Find the monorepo root (parent of packages)
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const componentsPackage = path.resolve(projectRoot, '../components');

const config = getDefaultConfig(projectRoot);

// Configure for monorepo
config.watchFolders = [monorepoRoot, componentsPackage];

// Configure SVG transformer
config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    // Enable asset plugins for SVG from workspace packages
    unstable_allowRequireContext: true,
};

// Configure path aliases for Metro bundler
config.resolver = {
    ...config.resolver,

    // Add SVG support
    assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],

    // Alias @ to the app package root
    extraNodeModules: {
        '@': projectRoot,
    },

    // Include packages from workspace
    nodeModulesPaths: [
        path.resolve(projectRoot, 'node_modules'),
        path.resolve(monorepoRoot, 'node_modules'),
    ],

    // Resolve assets from workspace packages
    resolveRequest: (context, moduleName, platform) => {
        // Force @yuhuu/* packages to use source (react-native field) instead of dist
        if (moduleName.startsWith('@yuhuu/')) {
            const packageName = moduleName.split('/')[1];
            const packagePath = path.resolve(monorepoRoot, 'packages', packageName);
            const packageJson = require(path.join(packagePath, 'package.json'));

            // Use react-native field if available
            if (packageJson['react-native']) {
                return {
                    filePath: path.resolve(packagePath, packageJson['react-native']),
                    type: 'sourceFile',
                };
            }
        }

        // Let Metro resolve SVG files from @yuhuu/* packages
        if (moduleName.endsWith('.svg') && context.originModulePath.includes('@yuhuu')) {
            return context.resolveRequest(context, moduleName, platform);
        }
        return context.resolveRequest(context, moduleName, platform);
    },
};

module.exports = withNativeWind(config, {input: './app/global.css'});

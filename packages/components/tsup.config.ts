import {defineConfig} from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    splitting: false,
    treeshake: true,
    external: [
        'react',
        'react-native',
        'react-native-reanimated',
        /^expo-/,
        /^@expo\//,
        /^react-native\//,
        /^@react-native\//,
    ],
    platform: 'neutral',
    target: 'es2020',
});

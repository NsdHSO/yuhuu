import {defineConfig} from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    tsconfig: 'tsconfig.build.json',
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: [
        'i18next',
        'react-i18next',
        'expo-localization',
        'react',
        '@yuhuu/storage',
    ],
});

import '@/lib/polyfills';
import React from 'react';
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {I18nextProvider} from 'react-i18next';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/use-color-scheme';
import {AuthProvider} from '@/providers/AuthProvider';
import {QueryProvider} from '@/providers/QueryProvider';
import{initI18n,i18n} from '@yuhuu/i18n';
import './global.css';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [i18nReady, setI18nReady] = React.useState(false);

    React.useEffect(() => {
        initI18n().then(() => setI18nReady(true));
    }, []);

    if (!i18nReady) {
        return null;
    }

    return (
        <I18nextProvider i18n={i18n}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <QueryProvider>
                    <AuthProvider>
                        <Stack>
                            <Stack.Screen name="index" options={{headerShown: false}}/>
                            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                            {/* (auth) group will be discovered automatically; do not register a non-existent index */}
                            <Stack.Screen name="modal" options={{
                                presentation: 'modal',
                                title: i18n.t('modal.title')
                            }}/>
                        </Stack>
                        <StatusBar style="auto"/>
                    </AuthProvider>
                </QueryProvider>
            </ThemeProvider>
        </I18nextProvider>
    );
}

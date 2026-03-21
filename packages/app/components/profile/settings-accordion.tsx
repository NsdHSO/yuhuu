import React from 'react';
import {Platform, Pressable, Switch, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
    GlassAccordion,
    LanguagePicker,
    ThemedText,
    useColorScheme,
    Colors,
    getGlowColor,
    useGlowVariant,
} from '@yuhuu/components';
import type {GlowVariant} from '@yuhuu/components';

const GLOW_VARIANTS: {key: GlowVariant; label: string; color: string}[] = [
    {key: 'subtle', label: 'Subtle', color: '#94A3B8'},
    {key: 'vibrant', label: 'Vibrant', color: '#A78BFA'},
    {key: 'warm', label: 'Warm', color: '#FB923C'},
    {key: 'cool', label: 'Cool', color: '#60A5FA'},
];

type SettingsAccordionProps = {
    biometricAvailable: boolean;
    biometricEnabled: boolean;
    onBiometricToggle: (value: boolean) => void;
    testID?: string;
};

export function SettingsAccordion({
    biometricAvailable,
    biometricEnabled,
    onBiometricToggle,
    testID,
}: SettingsAccordionProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant, setGlowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    return (
        <GlassAccordion
            title={t('profile.settings')}
            variant="frosted"
            defaultExpanded={false}
            enableElectric={true}
            enableWaves={false}
            testID={testID}
        >
            <View style={{gap: 16}}>
                <LanguagePicker />

                {biometricAvailable && (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: 8,
                        }}
                    >
                        <View style={{flex: 1, marginRight: 12}}>
                            <ThemedText>
                                {Platform.OS === 'ios'
                                    ? t('profile.biometricLabel')
                                    : t('profile.biometricLabelAndroid')}
                            </ThemedText>
                            <ThemedText
                                lightColor="#6B7280"
                                darkColor="#9CA3AF"
                                style={{fontSize: 13, marginTop: 2}}
                            >
                                {Platform.OS === 'ios'
                                    ? t('profile.biometricDescription')
                                    : t('profile.biometricDescriptionAndroid')}
                            </ThemedText>
                        </View>
                        <Switch
                            testID={testID ? `${testID}-biometric-toggle` : undefined}
                            value={biometricEnabled}
                            onValueChange={onBiometricToggle}
                            trackColor={{false: '#767577', true: activeColor}}
                            thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                )}

                <View>
                    <ThemedText style={{fontSize: 16, fontWeight: '600', marginBottom: 8}}>
                        {t('profile.glowTheme')}
                    </ThemedText>
                    <View style={{flexDirection: 'row', gap: 8}}>
                        {GLOW_VARIANTS.map(({key, color}) => (
                            <Pressable
                                key={key}
                                testID={testID ? `${testID}-glow-${key}` : undefined}
                                onPress={() => setGlowVariant(key)}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: color,
                                    borderWidth: glowVariant === key ? 3 : 1,
                                    borderColor: glowVariant === key
                                        ? Colors[scheme].text
                                        : (scheme === 'dark' ? '#374151' : '#D1D5DB'),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            />
                        ))}
                    </View>
                </View>
            </View>
        </GlassAccordion>
    );
}

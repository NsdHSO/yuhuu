import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useLanguage} from '../hooks/useLanguage';
import {ThemedText} from '../themed-text';
import {useColorScheme} from '../hooks/use-color-scheme';
import {Colors} from '../constants/theme';
import {useGlowVariant} from '../hooks/useGlowVariant';
import {getGlowColor} from '../constants/glowColors';

type Language = 'en' | 'ro';

const LANGUAGES = [
    {value: 'en' as Language, label: 'English', flag: '🇺🇸'},
    {value: 'ro' as Language, label: 'Română', flag: '🇷🇴'},
];

export function LanguagePicker() {
    const {t} = useTranslation();
    const {language, changeLanguage} = useLanguage();
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    const handleLanguageChange = async (value: Language) => {
        if (value !== language) {
            await changeLanguage(value);
        }
    };

    return (
        <View
            style={{
                borderTopWidth: 1,
                borderTopColor: scheme === 'dark' ? '#2A2A2A' : '#E5E7EB',
                paddingTop: 16,
                marginTop: 8,
            }}
        >
            <ThemedText
                type="subtitle"
                style={{
                    fontSize: 18,
                    marginBottom: 8,
                }}
            >
                {t('profile.language')}
            </ThemedText>

            <View
                style={{
                    flexDirection: 'row',
                    gap: 12,
                }}
            >
                {LANGUAGES.map((lang) => (
                    <Pressable
                        key={lang.value}
                        testID={`language-button-${lang.value}`}
                        onPress={() => handleLanguageChange(lang.value)}
                        style={({pressed}) => ({
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            paddingHorizontal: 18,
                            paddingVertical: 12,
                            borderRadius: 24,
                            borderWidth: 2.5,
                            borderColor: language === lang.value
                                ? activeColor
                                : (scheme === 'dark' ? '#6B7280' : '#9CA3AF'),
                            backgroundColor: language === lang.value
                                ? `${activeColor}${scheme === 'dark' ? '4D' : '33'}`
                                : (scheme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.9)'),
                            shadowColor: language === lang.value ? activeColor : '#000',
                            shadowOffset: {width: 0, height: 3},
                            shadowOpacity: language === lang.value ? 0.4 : 0.15,
                            shadowRadius: language === lang.value ? 6 : 3,
                            elevation: language === lang.value ? 6 : 3,
                            transform: [{scale: pressed ? 0.92 : 1}],
                            opacity: pressed ? 0.7 : 1,
                        })}
                    >
                        <ThemedText style={{fontSize: 20}}>{lang.flag}</ThemedText>
                        <ThemedText
                            style={{
                                fontWeight: language === lang.value ? '700' : '600',
                                letterSpacing: 0.3,
                                color: language === lang.value
                                    ? (scheme === 'dark' ? '#FFFFFF' : activeColor)
                                    : Colors[scheme].text,
                            }}
                        >
                            {lang.label}
                        </ThemedText>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

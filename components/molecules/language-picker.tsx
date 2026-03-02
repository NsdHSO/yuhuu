import React from 'react';
import { View, Platform, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type Language = 'en' | 'ro';

const LANGUAGES = [
  { value: 'en' as Language, label: 'English', flag: '🇺🇸' },
  { value: 'ro' as Language, label: 'Română', flag: '🇷🇴' },
];

export default function LanguagePicker() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const scheme = useColorScheme() ?? 'light';

  const handleLanguageChange = async (value: Language) => {
    if (value !== language) {
      await changeLanguage(value);
    }
  };

  // Use custom buttons for web, native Picker for mobile
  const isWeb = Platform.OS === 'web';

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

      {isWeb ? (
        // Custom button-based selector for web
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
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: language === lang.value ? '#1e90ff' : (scheme === 'dark' ? '#2A2A2A' : '#ccc'),
                backgroundColor: language === lang.value
                  ? (scheme === 'dark' ? '#1e3a5f' : '#e3f2fd')
                  : (scheme === 'dark' ? '#1F2937' : '#fff'),
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <ThemedText style={{ fontSize: 20 }}>{lang.flag}</ThemedText>
              <ThemedText
                style={{
                  fontWeight: language === lang.value ? '600' : '400',
                  color: language === lang.value ? '#1e90ff' : Colors[scheme].text,
                }}
              >
                {lang.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      ) : (
        // Native Picker for mobile
        <View
          style={{
            borderWidth: 1,
            borderColor: scheme === 'dark' ? '#2A2A2A' : '#ccc',
            borderRadius: 8,
            backgroundColor: scheme === 'dark' ? '#1F2937' : '#fff',
            overflow: 'hidden',
          }}
        >
          <Picker
            testID="language-picker"
            selectedValue={language}
            onValueChange={handleLanguageChange}
            style={{
              color: Colors[scheme].text,
            }}
            dropdownIconColor={Colors[scheme].text}
          >
            <Picker.Item
              label={t('language.english')}
              value="en"
              color={Platform.OS === 'ios' ? Colors[scheme].text : undefined}
            />
            <Picker.Item
              label={t('language.romanian')}
              value="ro"
              color={Platform.OS === 'ios' ? Colors[scheme].text : undefined}
            />
          </Picker>
        </View>
      )}
    </View>
  );
}

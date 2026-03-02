import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useLanguage } from '@/hooks/useLanguage';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

export function LanguagePicker() {
    const { language, changeLanguage } = useLanguage();

    return (
        <View testID="language-picker" style={styles.container}>
            {SUPPORTED_LANGUAGES.map((lang) => {
                const isActive = language === lang.code;
                return (
                    <Pressable
                        key={lang.code}
                        testID={`language-option-${lang.code}`}
                        style={[
                            styles.option,
                            isActive && styles.activeOption,
                        ]}
                        onPress={() => changeLanguage(lang.code)}
                    >
                        <ThemedText
                            style={[
                                styles.label,
                                isActive && styles.activeLabel,
                            ]}
                        >
                            {lang.label}
                        </ThemedText>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
    },
    option: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    activeOption: {
        borderColor: '#007AFF',
        backgroundColor: '#007AFF10',
    },
    label: {
        fontSize: 14,
    },
    activeLabel: {
        fontWeight: '600',
        color: '#007AFF',
    },
});

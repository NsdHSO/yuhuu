import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useState} from 'react';
import {useColorScheme} from '../hooks/use-color-scheme';
import {Colors} from '../constants/theme';
import {useTranslation} from 'react-i18next';
import {GlassInput} from '../atoms/glass/GlassInput';

/**
 * UserSearch component - Search for users by username
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles user search input and submission
 * - Open/Closed: Can be extended with filters without modification
 * - Dependency Inversion: Parent decides what to do with search results
 */

type UserSearchProps = {
    onSearch: (username: string) => void;
    testID?: string;
};

export function UserSearch({
                               onSearch,
                               testID
                           }: UserSearchProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme();
    const [username, setUsername] = useState('');

    const handleSearch = () => {
        if (username.trim()) {
            onSearch(username.trim());
        }
    };

    const handleChangeText = (text: string) => {
        setUsername(text);
        // Trigger search on text change if not empty
        if (text.trim().length > 0) {
            onSearch(text.trim());
        }
    };

    return (
        <View testID={testID} style={styles.container}>
            <GlassInput
                testID="search-input"
                placeholder={t('admin.searchPlaceholder')}
                value={username}
                onChangeText={handleChangeText}
                autoCapitalize="none"
                autoCorrect={false}
                variant="tinted"
                style={{height: 48, fontSize: 16}}
            />

            <Pressable
                testID="search-button"
                style={[
                    styles.button,
                    {
                        backgroundColor: scheme === 'dark' ? '#3B82F6' : '#2563EB',
                    },
                ]}
                onPress={handleSearch}
            >
                <Text style={styles.buttonText}>{t('common.search')}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    input: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 12,
    },
    button: {
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

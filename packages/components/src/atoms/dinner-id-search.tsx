import {StyleSheet, View} from 'react-native';
import {useState} from 'react';
import {useColorScheme} from '../hooks/use-color-scheme';
import {Colors} from '../constants/theme';
import {useTranslation} from 'react-i18next';
import {GlassInput} from '../molecules/glass-content/GlassInput';

/**
 * DinnerIdSearch component - Search for dinner by ID
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles dinner ID input
 * - Dependency Inversion: Parent decides what to do with dinner ID
 */

type DinnerIdSearchProps = {
    onDinnerIdChange: (dinnerId: number | null) => void;
    testID?: string;
};

export function DinnerIdSearch({
                                   onDinnerIdChange,
                                   testID
                               }: DinnerIdSearchProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme();
    const [dinnerId, setDinnerId] = useState('');

    const handleChangeText = (text: string) => {
        setDinnerId(text);

        // Parse and validate dinner ID
        if (text.trim() === '') {
            onDinnerIdChange(null);
            return;
        }

        const parsedId = parseInt(text.trim(), 10);
        if (!isNaN(parsedId) && parsedId > 0) {
            onDinnerIdChange(parsedId);
        }
    };

    return (
        <View testID={testID} style={styles.container}>
            <GlassInput
                testID="dinner-id-input"
                placeholder={t('admin.dinnerIdPlaceholder')}
                value={dinnerId}
                onChangeText={handleChangeText}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
                variant="tinted"
                style={{height: 48, fontSize: 16}}
            />
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
    },
});

import {StyleSheet, TextInput} from 'react-native';
import {useState} from 'react';
import {useColorScheme} from '../hooks/use-color-scheme';
import {Colors} from '../constants/theme';
import {GlassView} from './glass';

type SearchInputProps = {
    type: 'text' | 'numeric';
    onValueChange: (value: string | number | null) => void;
    placeholder: string;
    testID?: string;
    editable?: boolean;
};

export function SearchInput({
                                type,
                                onValueChange,
                                placeholder,
                                testID,
                                editable,
                            }: SearchInputProps) {
    const scheme = useColorScheme();
    const [value, setValue] = useState('');

    const handleChangeText = (text: string) => {
        setValue(text);

        if (text.trim() === '') {
            onValueChange(null);
            return;
        }

        if (type === 'numeric') {
            const parsed = parseInt(text.trim(), 10);
            if (!isNaN(parsed) && parsed > 0) {
                onValueChange(parsed);
            }
        } else {
            onValueChange(text.trim());
        }
    };

    return (
        <GlassView
            variant="ultra-thin"
            borderRadius={8}
            enableShadow={false}
            testID={testID}
            style={styles.container}
        >
            <TextInput
                testID="search-input-field"
                style={[
                    styles.input,
                    {
                        backgroundColor: 'transparent',
                        color: Colors[scheme ?? 'light'].text,
                        borderColor: Colors[scheme ?? 'light'].icon,
                    },
                ]}
                placeholder={placeholder}
                placeholderTextColor={Colors[scheme ?? 'light'].icon}
                value={value}
                onChangeText={handleChangeText}
                keyboardType={type === 'numeric' ? 'numeric' : 'default'}
                autoCapitalize="none"
                autoCorrect={false}
                editable={editable}
            />
        </GlassView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    input: {
        height: 48,
        borderRadius: 8,
        borderWidth: 0,
        paddingHorizontal: 16,
        fontSize: 16,
    },
});

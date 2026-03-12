import React, {useMemo, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {useColorScheme} from '../hooks/use-color-scheme';
import {Colors} from '../constants/theme';
import {useTranslation} from 'react-i18next';
import {GlassInput} from './glass-content/GlassInput';

/**
 * Props for the ParticipantForm component
 */
export type ParticipantFormProps = {
    /** Callback when form is submitted with valid data */
    onSubmit: (username: string, notes: string) => void;
    /** Whether the form is currently submitting */
    isSubmitting: boolean;
};

/**
 * Form component for adding participants to a dinner
 * Single Responsibility Principle: Only handles participant input form
 *
 * Features:
 * - Theme-aware input styling
 * - Form validation
 * - Disabled state during submission
 * - Clears form after successful submission
 */
export function ParticipantForm({
                                    onSubmit,
                                    isSubmitting
                                }: ParticipantFormProps) {
    const {t} = useTranslation();
    const [username, setUsername] = useState('');
    const [notes, setNotes] = useState('');
    const scheme = useColorScheme() ?? 'light';

    const inputStyles = useMemo(
        () => ({
            container: {
                borderWidth: 1,
                borderColor: scheme === 'dark' ? '#2A2A2A' : '#ccc',
                borderRadius: 8,
                padding: 12,
                color: Colors[scheme].text,
                backgroundColor: scheme === 'dark' ? '#1F2937' : '#fff',
            } as const,
            placeholderColor: scheme === 'dark' ? '#9CA3AF' : '#6B7280',
        }),
        [scheme]
    );

    const handleSubmit = () => {
        // Validate inputs - only username is required
        if (!username.trim()) {
            Alert.alert(t('common.required'), t('common.usernameRequired'));
            return;
        }

        // Submit and clear form (notes can be empty)
        onSubmit(username.trim(), notes.trim());
        setUsername('');
        setNotes('');
    };

    return (
        <View style={styles.container}>
            <GlassInput
                value={username}
                onChangeText={setUsername}
                placeholder={t('common.usernamePlaceholder')}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                variant="tinted"
            />

            <GlassInput
                value={notes}
                onChangeText={setNotes}
                placeholder={t('common.notesPlaceholder')}
                multiline
                numberOfLines={4}
                style={styles.multilineInput}
                editable={!isSubmitting}
                variant="tinted"
            />

            <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={({pressed}) => [
                    styles.button,
                    {
                        backgroundColor: isSubmitting
                            ? scheme === 'dark'
                                ? '#374151'
                                : '#D1D5DB'
                            : scheme === 'dark'
                                ? '#3B82F6' // Bright blue for dark mode
                                : '#2563EB', // Darker blue for light mode
                    },
                    pressed && styles.buttonPressed,
                ]}
            >
                <Text style={styles.buttonText}>{isSubmitting ? t('common.adding') : t('common.addParticipant')}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        marginTop: 16,
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

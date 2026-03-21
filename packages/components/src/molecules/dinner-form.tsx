import React, {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {useColorScheme} from '../hooks/use-color-scheme';
import {useTranslation} from 'react-i18next';
import {GlassInput} from './glass-content/GlassInput';
import {useGlowVariant} from '../hooks/useGlowVariant';
import {getGlowColor} from '../constants/glowColors';

export type CreateDinnerInput = {
    dinner_date: string;
    meal_type: string;
    description?: string;
    location?: string;
    max_participants?: number;
};

/**
 * Props for the DinnerForm component
 */
export type DinnerFormProps = {
    /** Callback when form is submitted with valid data */
    onSubmit: (data: CreateDinnerInput) => void;
    /** Callback when cancel button is pressed */
    onCancel: () => void;
    /** Whether the form is currently submitting */
    isSubmitting: boolean;
};

/**
 * Form component for creating dinners
 * Single Responsibility Principle: Only handles dinner input form
 *
 * Features:
 * - Theme-aware input styling
 * - Form validation (required: dinner_date, meal_type)
 * - Disabled state during submission
 * - Glow variant integration for dynamic button colors
 * - Only includes optional fields if provided
 */
export function DinnerForm({onSubmit, onCancel, isSubmitting}: DinnerFormProps) {
    const {t} = useTranslation();
    const [dinnerDate, setDinnerDate] = useState('');
    const [mealType, setMealType] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    const handleSubmit = () => {
        // Validate required fields
        if (!dinnerDate.trim()) {
            Alert.alert(t('common.error'), t('supper.dinnerDateRequired'));
            return;
        }

        if (!mealType.trim()) {
            Alert.alert(t('common.error'), t('supper.mealTypeRequired'));
            return;
        }

        // Build input object (only include optional fields if provided)
        const input: CreateDinnerInput = {
            dinner_date: dinnerDate.trim(),
            meal_type: mealType.trim(),
        };

        if (description.trim()) {
            input.description = description.trim();
        }

        if (location.trim()) {
            input.location = location.trim();
        }

        if (maxParticipants.trim()) {
            const parsed = parseInt(maxParticipants.trim(), 10);
            if (!isNaN(parsed)) {
                input.max_participants = parsed;
            }
        }

        // Submit and clear form
        onSubmit(input);
        setDinnerDate('');
        setMealType('');
        setDescription('');
        setLocation('');
        setMaxParticipants('');
    };

    return (
        <View style={styles.container}>
            <GlassInput
                value={dinnerDate}
                onChangeText={setDinnerDate}
                placeholder={t('supper.dinnerDatePlaceholder')}
                editable={!isSubmitting}
                autoCapitalize="none"
                autoCorrect={false}
                variant="tinted"
            />

            <GlassInput
                value={mealType}
                onChangeText={setMealType}
                placeholder={t('supper.mealTypePlaceholder')}
                editable={!isSubmitting}
                variant="tinted"
            />

            <GlassInput
                value={description}
                onChangeText={setDescription}
                placeholder={t('supper.descriptionPlaceholder')}
                multiline
                numberOfLines={3}
                style={styles.multilineInput}
                editable={!isSubmitting}
                variant="tinted"
            />

            <GlassInput
                value={location}
                onChangeText={setLocation}
                placeholder={t('supper.locationPlaceholder')}
                editable={!isSubmitting}
                variant="tinted"
            />

            <GlassInput
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                placeholder={t('supper.maxParticipantsPlaceholder')}
                editable={!isSubmitting}
                keyboardType="number-pad"
                variant="tinted"
            />

            <View style={styles.buttonRow}>
                <Pressable
                    onPress={onCancel}
                    disabled={isSubmitting}
                    style={({pressed}) => [
                        styles.button,
                        styles.cancelButton,
                        {
                            backgroundColor:
                                scheme === 'dark' ? '#374151' : '#D1D5DB',
                        },
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <Text style={[styles.buttonText, {color: scheme === 'dark' ? '#D1D5DB' : '#374151'}]}>
                        {t('common.cancel')}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    style={({pressed}) => [
                        styles.button,
                        styles.submitButton,
                        {
                            backgroundColor: isSubmitting
                                ? scheme === 'dark'
                                    ? '#374151'
                                    : '#D1D5DB'
                                : activeColor,
                        },
                        pressed && styles.buttonPressed,
                    ]}
                >
                    <Text style={styles.buttonText}>
                        {isSubmitting ? t('common.creating') : t('supper.createDinner')}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        marginTop: 16,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {},
    submitButton: {},
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

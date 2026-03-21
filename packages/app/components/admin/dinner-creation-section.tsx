import React, {useState} from 'react';
import {View, Text, Pressable, Alert, useColorScheme} from 'react-native';
import {useGlowVariant, getGlowColor, DinnerForm} from '@yuhuu/components';
import type {CreateDinnerInput} from '@yuhuu/types';
import {useCreateDinnerMutation} from '../../features/dinners/hooks';
import {useTranslation} from 'react-i18next';

interface DinnerCreationSectionProps {
    testID?: string;
}

/**
 * Admin section for creating dinners
 * Single Responsibility: Handles dinner creation UI and state
 *
 * Features:
 * - Toggle form visibility
 * - Create dinner mutation integration
 * - Success/error alerts
 * - Glow variant theming
 */
export function DinnerCreationSection({testID}: DinnerCreationSectionProps) {
    const {glowVariant} = useGlowVariant();
    const scheme = useColorScheme() ?? 'light';
    const activeColor = getGlowColor(glowVariant, scheme);
    const {t} = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const createDinner = useCreateDinnerMutation();

    const handleSubmit = (data: CreateDinnerInput) => {
        createDinner.mutate(data, {
            onSuccess: () => {
                Alert.alert(t('common.success'), t('supper.dinnerCreated'));
                setShowForm(false);
            },
            onError: () => {
                Alert.alert(t('common.error'), t('supper.createError'));
            },
        });
    };

    const handleCancel = () => {
        setShowForm(false);
    };

    return (
        <View testID={testID} style={{padding: 16}}>
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: scheme === 'dark' ? '#fff' : '#000',
                    marginBottom: 12,
                }}
            >
                {t('supper.createDinner')}
            </Text>

            {!showForm && (
                <Pressable
                    onPress={() => setShowForm(true)}
                    style={{
                        backgroundColor: activeColor,
                        borderRadius: 8,
                        padding: 12,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{color: '#fff', fontWeight: '600'}}>
                        {t('supper.addDinner')}
                    </Text>
                </Pressable>
            )}

            {showForm && (
                <DinnerForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={createDinner.isPending}
                />
            )}
        </View>
    );
}

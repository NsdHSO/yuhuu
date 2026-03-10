import React from 'react';
import {Pressable, View} from 'react-native';
import {ThemedText, useColorScheme, getGlowColor, useGlowVariant} from '@yuhuu/components';

interface AccordionFormActionsProps {
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    cancelLabel: string;
    submitLabel: string;
    testIDPrefix?: string;
}

export function AccordionFormActions({
    onCancel,
    onSubmit,
    isSubmitting,
    cancelLabel,
    submitLabel,
    testIDPrefix = 'form-action',
}: AccordionFormActionsProps) {
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    return (
        <View style={{flexDirection: 'row', gap: 12, marginTop: 8}}>
            <Pressable
                testID={`${testIDPrefix}-cancel`}
                onPress={onCancel}
                style={{flex: 1, padding: 12, borderRadius: 8, alignItems: 'center'}}
            >
                <ThemedText>{cancelLabel}</ThemedText>
            </Pressable>
            <Pressable
                testID={`${testIDPrefix}-submit`}
                onPress={onSubmit}
                disabled={isSubmitting}
                style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: isSubmitting
                        ? scheme === 'dark'
                            ? '#374151'
                            : '#D1D5DB'
                        : activeColor,
                    opacity: isSubmitting ? 0.7 : 1,
                }}
            >
                <ThemedText style={{color: '#fff', fontWeight: '600'}}>
                    {submitLabel}
                </ThemedText>
            </Pressable>
        </View>
    );
}

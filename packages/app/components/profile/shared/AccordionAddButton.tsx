import React from 'react';
import {Pressable} from 'react-native';
import {ThemedText, useColorScheme, getGlowColor, useGlowVariant} from '@yuhuu/components';

interface AccordionAddButtonProps {
    onPress: () => void;
    label: string;
}

export function AccordionAddButton({onPress, label}: AccordionAddButtonProps) {
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    return (
        <Pressable
            onPress={onPress}
            style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: scheme === 'dark' ? '#374151' : '#D1D5DB',
                borderStyle: 'dashed',
                alignItems: 'center',
            }}
        >
            <ThemedText style={{color: activeColor, fontWeight: '600'}}>
                {label}
            </ThemedText>
        </Pressable>
    );
}

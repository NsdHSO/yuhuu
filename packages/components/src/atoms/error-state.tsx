import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemedText} from '@/components/themed-text';
import {useTranslation} from 'react-i18next';

/**
 * Props for ErrorState component
 */
export type ErrorStateProps = {
    /** Selected date that has no dinner */
    selectedDate: string;
};

/**
 * Error state component when dinner is not found
 * Single Responsibility: Only displays error UI
 */
export function ErrorState({selectedDate}: ErrorStateProps) {
    const {t} = useTranslation();
    return (
        <View style={styles.container}>
            <ThemedText style={styles.text}>{t('supper.noDinnerFound', {date: selectedDate})}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 12,
    },
    text: {
        opacity: 0.7,
        textAlign: 'center',
    },
});

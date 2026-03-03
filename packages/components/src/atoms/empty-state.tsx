import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemedText} from '@/components/themed-text';
import {useTranslation} from 'react-i18next';

/**
 * Empty state component when no date is selected
 * Single Responsibility: Only displays prompt UI
 */
export function EmptyState() {
    const {t} = useTranslation();
    return (
        <View style={styles.container}>
            <ThemedText style={styles.text}>{t('supper.emptyState')}</ThemedText>
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
        opacity: 0.5,
        textAlign: 'center',
        fontSize: 16,
    },
});

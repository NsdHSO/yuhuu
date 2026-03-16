import React from 'react';
import {StyleSheet} from 'react-native';
import {ThemedText} from '../themed-text';
import {GlassCard} from './glass-interactive';
import type {Dinner} from '@yuhuu/types';
import {useTranslation} from 'react-i18next';

/**
 * Props for DinnerDetailsCard component
 */
export type DinnerDetailsCardProps = {
    /** Dinner data to display */
    dinner: Dinner;
    /** Optional testID for testing */
    testID?: string;
};

/**
 * Card component for displaying dinner details
 * SOLID Principles:
 * - Single Responsibility: Only displays dinner information
 * - Open/Closed: Open for styling extensions, closed for data modification
 */
export function DinnerDetailsCard({dinner, testID}: DinnerDetailsCardProps) {
    const {t} = useTranslation();
    return (
        <GlassCard
            variant="tinted"
            borderRadius={12}
            enableElectric={true}
            enableWaves={true}
            style={styles.card}
            testID={testID}
        >
            <ThemedText style={styles.label}>{t('supper.dateLabel')}</ThemedText>
            <ThemedText style={styles.value}>{dinner.dinnerDate}</ThemedText>

            <ThemedText style={styles.label}>{t('supper.mealTypeLabel')}</ThemedText>
            <ThemedText style={styles.value}>{dinner.mealType}</ThemedText>

            {dinner.location && (
                <>
                    <ThemedText style={styles.label}>{t('supper.locationLabel')}</ThemedText>
                    <ThemedText style={styles.value}>{dinner.location}</ThemedText>
                </>
            )}

            {dinner.description && (
                <>
                    <ThemedText style={styles.label}>{t('supper.descriptionLabel')}</ThemedText>
                    <ThemedText style={styles.value}>{dinner.description}</ThemedText>
                </>
            )}

            {dinner.maxParticipants && (
                <>
                    <ThemedText style={styles.label}>{t('supper.maxParticipantsLabel')}</ThemedText>
                    <ThemedText style={styles.value}>{dinner.maxParticipants}</ThemedText>
                </>
            )}
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: 8,
        marginBottom: 24,
        padding: 16,
    },
    label: {
        fontWeight: '600',
        marginTop: 8,
    },
    value: {
        opacity: 0.8,
    },
});

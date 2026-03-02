import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { DatePicker } from '@/components/atoms/date-picker';
import { DinnerSelector } from '@/components/atoms/dinner-selector';
import { LoadingState } from '@/components/atoms/loading-state';
import { ErrorState } from '@/components/atoms/error-state';
import { EmptyState } from '@/components/atoms/empty-state';
import { ParticipantForm } from '@/components/molecules/participant-form';
import { DinnerDetailsCard } from '@/components/molecules/dinner-details-card';
import { useAddParticipantMutation, useDinnersByDateQuery } from '@/features/dinners/hooks';

/**
 * Main Supper screen for managing church dinner participants
 * SOLID Principles Applied:
 * - Single Responsibility: Only orchestrates UI components and data flow
 * - Open/Closed: Open for extension (new UI components), closed for modification
 * - Dependency Inversion: Depends on hooks abstraction, not API directly
 *
 * Features:
 * 1. Select a dinner date from calendar
 * 2. Fetch dinners for that date via API (handles multiple dinners per date)
 * 3. Select specific dinner if multiple exist
 * 4. Add participants to the selected dinner with username and notes
 */
export default function SupperScreen() {
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedDinnerId, setSelectedDinnerId] = useState<number | null>(null);

    // Query dinners by date (returns array)
    const {
        data: dinners,
        isLoading,
        error
    } = useDinnersByDateQuery(selectedDate);

    // Find the selected dinner from the array
    const selectedDinner = dinners?.find((d) => d.id === selectedDinnerId);

    // Mutation for adding participants
    const addParticipantMutation = useAddParticipantMutation(selectedDinnerId ?? 0);

    /**
     * Reset dinner selection when date changes
     * Single Responsibility: Only handles date change side effect
     */
    React.useEffect(() => {
        setSelectedDinnerId(null);
    }, [selectedDate]);

    /**
     * Auto-select dinner if only one exists for the date
     * Single Responsibility: Only handles auto-selection logic
     */
    React.useEffect(() => {
        if (dinners && dinners.length === 1 && selectedDinnerId === null) {
            setSelectedDinnerId(dinners[0].id);
        }
    }, [dinners, selectedDinnerId]);

    /**
     * Handles form submission for adding a participant
     * Single Responsibility: Only handles participant submission
     */
    const handleSubmit = (username: string, notes: string) => {
        if (!selectedDinner) {
            Alert.alert(t('common.error'), t('supper.noDinnerSelected'));
            return;
        }

        addParticipantMutation.mutate(
            {
                username,
                notes
            },
            {
                onSuccess: () => {
                    Alert.alert(t('common.success'), t('supper.participantAdded'));
                },
                onError: (e: any) => {
                    const msg = e?.response?.data?.message || t('supper.addError');
                    Alert.alert(t('common.error'), msg);
                },
            }
        );
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Calendar for date selection */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                        {t('supper.selectDate')}
                    </ThemedText>
                    <DatePicker selectedDate={selectedDate} onDateSelect={setSelectedDate}/>
                </View>

                {/* Loading state */}
                {isLoading && <LoadingState/>}

                {/* Error state - no dinners found or API error */}
                {error && selectedDate && <ErrorState selectedDate={selectedDate}/>}

                {/* Dinner selector - only show if multiple dinners exist */}
                {dinners && dinners.length > 1 && (
                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            {t('supper.selectDinner')}
                        </ThemedText>
                        <DinnerSelector
                            dinners={dinners}
                            selectedDinnerId={selectedDinnerId}
                            onSelectDinner={setSelectedDinnerId}
                        />
                    </View>
                )}

                {/* Dinner details and participant form - show when dinner is selected */}
                {selectedDinner && (
                    <View style={styles.section}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            {t('supper.dinnerDetails')}
                        </ThemedText>
                        <DinnerDetailsCard dinner={selectedDinner}/>

                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            {t('supper.addParticipant')}
                        </ThemedText>
                        <ParticipantForm
                            onSubmit={handleSubmit}
                            isSubmitting={addParticipantMutation.isPending}
                        />
                    </View>
                )}

                {/* Prompt to select a date */}
                {!selectedDate && !isLoading && <EmptyState/>}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        marginBottom: 16,
    },
});

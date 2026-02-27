import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { Dinner } from '@/features/dinners/types';

/**
 * Props for DinnerDetailsCard component
 */
export type DinnerDetailsCardProps = {
	/** Dinner data to display */
	dinner: Dinner;
};

/**
 * Card component for displaying dinner details
 * SOLID Principles:
 * - Single Responsibility: Only displays dinner information
 * - Open/Closed: Open for styling extensions, closed for data modification
 */
export function DinnerDetailsCard({ dinner }: DinnerDetailsCardProps) {
	return (
		<View style={styles.card}>
			<ThemedText style={styles.label}>Date:</ThemedText>
			<ThemedText style={styles.value}>{dinner.dinnerDate}</ThemedText>

			<ThemedText style={styles.label}>Meal Type:</ThemedText>
			<ThemedText style={styles.value}>{dinner.mealType}</ThemedText>

			{dinner.location && (
				<>
					<ThemedText style={styles.label}>Location:</ThemedText>
					<ThemedText style={styles.value}>{dinner.location}</ThemedText>
				</>
			)}

			{dinner.description && (
				<>
					<ThemedText style={styles.label}>Description:</ThemedText>
					<ThemedText style={styles.value}>{dinner.description}</ThemedText>
				</>
			)}

			{dinner.maxParticipants && (
				<>
					<ThemedText style={styles.label}>Max Participants:</ThemedText>
					<ThemedText style={styles.value}>{dinner.maxParticipants}</ThemedText>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		gap: 8,
		marginBottom: 24,
	},
	label: {
		fontWeight: '600',
		marginTop: 8,
	},
	value: {
		opacity: 0.8,
	},
});

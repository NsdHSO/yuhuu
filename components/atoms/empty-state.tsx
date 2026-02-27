import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

/**
 * Empty state component when no date is selected
 * Single Responsibility: Only displays prompt UI
 */
export function EmptyState() {
	return (
		<View style={styles.container}>
			<ThemedText style={styles.text}>Select a date to view dinner details</ThemedText>
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

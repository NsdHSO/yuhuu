import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

/**
 * Loading state component for dinner queries
 * Single Responsibility: Only displays loading UI
 */
export function LoadingState() {
	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" />
			<ThemedText style={styles.text}>Loading dinner details...</ThemedText>
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
	},
});

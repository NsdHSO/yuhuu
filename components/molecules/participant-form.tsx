import React, { useState, useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * Props for the ParticipantForm component
 */
export type ParticipantFormProps = {
	/** Callback when form is submitted with valid data */
	onSubmit: (username: string, notes: string) => void;
	/** Whether the form is currently submitting */
	isSubmitting: boolean;
};

/**
 * Form component for adding participants to a dinner
 * Single Responsibility Principle: Only handles participant input form
 *
 * Features:
 * - Theme-aware input styling
 * - Form validation
 * - Disabled state during submission
 * - Clears form after successful submission
 */
export function ParticipantForm({ onSubmit, isSubmitting }: ParticipantFormProps) {
	const [username, setUsername] = useState('');
	const [notes, setNotes] = useState('');
	const scheme = useColorScheme() ?? 'light';

	const inputStyles = useMemo(
		() => ({
			container: {
				borderWidth: 1,
				borderColor: scheme === 'dark' ? '#2A2A2A' : '#ccc',
				borderRadius: 8,
				padding: 12,
				color: Colors[scheme].text,
				backgroundColor: scheme === 'dark' ? '#1F2937' : '#fff',
			} as const,
			placeholderColor: scheme === 'dark' ? '#9CA3AF' : '#6B7280',
		}),
		[scheme]
	);

	const handleSubmit = () => {
		// Validate inputs - only username is required
		if (!username.trim()) {
			Alert.alert('Required', 'Please enter a username.');
			return;
		}

		// Submit and clear form (notes can be empty)
		onSubmit(username.trim(), notes.trim());
		setUsername('');
		setNotes('');
	};

	return (
		<View style={styles.container}>
			<TextInput
				value={username}
				onChangeText={setUsername}
				placeholder="Username"
				style={inputStyles.container}
				placeholderTextColor={inputStyles.placeholderColor}
				editable={!isSubmitting}
				autoCapitalize="none"
				autoCorrect={false}
			/>

			<TextInput
				value={notes}
				onChangeText={setNotes}
				placeholder="Notes (optional)"
				multiline
				numberOfLines={4}
				style={[inputStyles.container, styles.multilineInput]}
				placeholderTextColor={inputStyles.placeholderColor}
				editable={!isSubmitting}
			/>

			<Pressable
				onPress={handleSubmit}
				disabled={isSubmitting}
				style={({ pressed }) => [
					styles.button,
					{
						backgroundColor: isSubmitting
							? scheme === 'dark'
								? '#374151'
								: '#D1D5DB'
							: scheme === 'dark'
								? '#3B82F6' // Bright blue for dark mode
								: '#2563EB', // Darker blue for light mode
					},
					pressed && styles.buttonPressed,
				]}
			>
				<Text style={styles.buttonText}>{isSubmitting ? 'Adding…' : 'Add Participant'}</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 16,
		marginTop: 16,
	},
	multilineInput: {
		minHeight: 100,
		textAlignVertical: 'top',
	},
	button: {
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonPressed: {
		opacity: 0.8,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
});

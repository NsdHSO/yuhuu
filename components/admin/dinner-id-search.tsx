import { View, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * DinnerIdSearch component - Search for dinner by ID
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles dinner ID input
 * - Dependency Inversion: Parent decides what to do with dinner ID
 */

type DinnerIdSearchProps = {
	onDinnerIdChange: (dinnerId: number | null) => void;
	testID?: string;
};

export function DinnerIdSearch({ onDinnerIdChange, testID }: DinnerIdSearchProps) {
	const scheme = useColorScheme();
	const [dinnerId, setDinnerId] = useState('');

	const handleChangeText = (text: string) => {
		setDinnerId(text);

		// Parse and validate dinner ID
		if (text.trim() === '') {
			onDinnerIdChange(null);
			return;
		}

		const parsedId = parseInt(text.trim(), 10);
		if (!isNaN(parsedId) && parsedId > 0) {
			onDinnerIdChange(parsedId);
		}
	};

	return (
		<View testID={testID} style={styles.container}>
			<TextInput
				testID="dinner-id-input"
				style={[
					styles.input,
					{
						backgroundColor: scheme === 'dark' ? '#1F2937' : '#F3F4F6',
						color: Colors[scheme ?? 'light'].text,
						borderColor: Colors[scheme ?? 'light'].icon,
					},
				]}
				placeholder="Enter dinner ID"
				placeholderTextColor={Colors[scheme ?? 'light'].icon}
				value={dinnerId}
				onChangeText={handleChangeText}
				keyboardType="numeric"
				autoCapitalize="none"
				autoCorrect={false}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
	input: {
		height: 48,
		borderRadius: 8,
		borderWidth: 1,
		paddingHorizontal: 16,
		fontSize: 16,
	},
});

import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * UserSearch component - Search for users by username
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles user search input and submission
 * - Open/Closed: Can be extended with filters without modification
 * - Dependency Inversion: Parent decides what to do with search results
 */

type UserSearchProps = {
	onSearch: (username: string) => void;
	testID?: string;
};

export function UserSearch({ onSearch, testID }: UserSearchProps) {
	const scheme = useColorScheme();
	const [username, setUsername] = useState('');

	const handleSearch = () => {
		if (username.trim()) {
			onSearch(username.trim());
		}
	};

	const handleChangeText = (text: string) => {
		setUsername(text);
		// Trigger search on text change if not empty
		if (text.trim().length > 0) {
			onSearch(text.trim());
		}
	};

	return (
		<View testID={testID} style={styles.container}>
			<TextInput
				testID="search-input"
				style={[
					styles.input,
					{
						backgroundColor: scheme === 'dark' ? '#1F2937' : '#F3F4F6',
						color: Colors[scheme ?? 'light'].text,
						borderColor: Colors[scheme ?? 'light'].icon,
					},
				]}
				placeholder="Search by username"
				placeholderTextColor={Colors[scheme ?? 'light'].icon}
				value={username}
				onChangeText={handleChangeText}
				autoCapitalize="none"
				autoCorrect={false}
			/>

			<Pressable
				testID="search-button"
				style={[
					styles.button,
					{
						backgroundColor: scheme === 'dark' ? '#3B82F6' : '#2563EB',
					},
				]}
				onPress={handleSearch}
			>
				<Text style={styles.buttonText}>Search</Text>
			</Pressable>
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
		marginBottom: 12,
	},
	button: {
		height: 48,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
	},
});

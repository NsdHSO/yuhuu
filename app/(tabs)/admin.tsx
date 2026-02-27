import { StyleSheet, View, Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * Admin screen - Only accessible to users with Admin role
 *
 * SOLID Principles:
 * - Single Responsibility: This screen displays admin-specific content
 * - Open/Closed: Can be extended with admin features without modifying core logic
 */
export default function AdminScreen() {
	const scheme = useColorScheme();

	return (
		<View style={[styles.container, { backgroundColor: Colors[scheme ?? 'light'].background }]}>
			<Text style={[styles.title, { color: Colors[scheme ?? 'light'].text }]}>
				Admin Panel
			</Text>
			<Text style={[styles.subtitle, { color: Colors[scheme ?? 'light'].icon }]}>
				Administrative features coming soon...
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
	},
});

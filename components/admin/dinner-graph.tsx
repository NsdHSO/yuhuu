import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * DinnerGraph component - Displays dinner participation statistics
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles displaying dinner graph visualization
 * - Open/Closed: Can be extended with different graph types without modification
 */

type DinnerStats = {
	totalDinners: number;
	totalParticipants: number;
	averageAttendance: number;
};

type DinnerGraphProps = {
	data?: DinnerStats;
	testID?: string;
};

export function DinnerGraph({ data, testID }: DinnerGraphProps) {
	const scheme = useColorScheme();

	if (!data) {
		return (
			<View testID={testID} style={styles.container}>
				<Text style={[styles.emptyText, { color: Colors[scheme ?? 'light'].icon }]}>
					No dinner statistics available
				</Text>
			</View>
		);
	}

	return (
		<View testID={testID} style={styles.container}>
			<View style={[styles.card, { backgroundColor: scheme === 'dark' ? '#1F2937' : '#F3F4F6' }]}>
				<View style={styles.statRow}>
					<Text style={[styles.statLabel, { color: Colors[scheme ?? 'light'].icon }]}>
						Total Dinners
					</Text>
					<Text style={[styles.statValue, { color: Colors[scheme ?? 'light'].text }]}>
						{data.totalDinners}
					</Text>
				</View>

				<View style={styles.statRow}>
					<Text style={[styles.statLabel, { color: Colors[scheme ?? 'light'].icon }]}>
						Total Participants
					</Text>
					<Text style={[styles.statValue, { color: Colors[scheme ?? 'light'].text }]}>
						{data.totalParticipants}
					</Text>
				</View>

				<View style={styles.statRow}>
					<Text style={[styles.statLabel, { color: Colors[scheme ?? 'light'].icon }]}>
						Average Attendance
					</Text>
					<Text style={[styles.statValue, { color: Colors[scheme ?? 'light'].text }]}>
						{data.averageAttendance}
					</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
	card: {
		borderRadius: 8,
		padding: 16,
	},
	statRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	statLabel: {
		fontSize: 14,
	},
	statValue: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	emptyText: {
		fontSize: 14,
		fontStyle: 'italic',
	},
});

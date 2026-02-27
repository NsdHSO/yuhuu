import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * DinnerAttendance component - Displays user's dinner attendance history
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles displaying attendance records
 * - Open/Closed: Can be extended with filters/sorting without modification
 */

type AttendanceRecord = {
	dinnerDate: string;
	attended: boolean;
	location: string;
	mealType?: string;
};

type DinnerAttendanceProps = {
	username: string;
	data?: AttendanceRecord[];
	testID?: string;
};

export function DinnerAttendance({ username, data, testID }: DinnerAttendanceProps) {
	const scheme = useColorScheme();

	if (!data || data.length === 0) {
		return (
			<View testID={testID}>
				<Text style={[styles.emptyText, { color: Colors[scheme ?? 'light'].icon }]}>
					No attendance records found for this user
				</Text>
			</View>
		);
	}

	return (
		<View testID={testID} style={styles.container}>
			<Text testID="attendance-username" style={[styles.username, { color: Colors[scheme ?? 'light'].text }]}>
				Attendance for: {username}
			</Text>

			{data.map((record, index) => (
				<View
					key={index}
					testID={`attendance-item-${index}`}
					style={[
						styles.attendanceCard,
						{
							backgroundColor: scheme === 'dark' ? '#1F2937' : '#F3F4F6',
							borderLeftColor: record.attended ? '#10B981' : '#EF4444',
						},
					]}
				>
					<View style={styles.cardRow}>
						<Text style={[styles.label, { color: Colors[scheme ?? 'light'].icon }]}>Date:</Text>
						<Text testID={`attendance-date-${index}`} style={[styles.value, { color: Colors[scheme ?? 'light'].text }]}>
							{record.dinnerDate}
						</Text>
					</View>

					<View style={styles.cardRow}>
						<Text style={[styles.label, { color: Colors[scheme ?? 'light'].icon }]}>Status:</Text>
						<Text
							testID={`attendance-status-${index}`}
							style={[
								styles.value,
								styles.statusText,
								{
									color: record.attended ? '#10B981' : '#EF4444',
								},
							]}
						>
							{record.attended ? 'Attended' : 'Not Attended'}
						</Text>
					</View>

					<View style={styles.cardRow}>
						<Text style={[styles.label, { color: Colors[scheme ?? 'light'].icon }]}>Location:</Text>
						<Text testID={`attendance-location-${index}`} style={[styles.value, { color: Colors[scheme ?? 'light'].text }]}>
							{record.location}
						</Text>
					</View>

					{record.mealType && (
						<View style={styles.cardRow}>
							<Text style={[styles.label, { color: Colors[scheme ?? 'light'].icon }]}>Meal Type:</Text>
							<Text style={[styles.value, { color: Colors[scheme ?? 'light'].text }]}>
								{record.mealType}
							</Text>
						</View>
					)}
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
	username: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	attendanceCard: {
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		borderLeftWidth: 4,
	},
	cardRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	label: {
		fontSize: 14,
	},
	value: {
		fontSize: 14,
		fontWeight: '600',
	},
	statusText: {
		fontWeight: 'bold',
	},
	emptyText: {
		fontSize: 14,
		fontStyle: 'italic',
	},
});

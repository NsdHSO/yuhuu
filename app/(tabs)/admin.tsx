import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useDinnerStatsQuery, useUserAttendanceQuery } from '@/features/admin/hooks';
import { DinnerGraph } from '@/components/admin/dinner-graph';
import { UserSearch } from '@/components/admin/user-search';
import { DinnerAttendance } from '@/components/admin/dinner-attendance';
import { Accordion } from '@/components/admin/accordion';

/**
 * Admin screen - Only accessible to users with Admin role
 *
 * SOLID Principles:
 * - Single Responsibility: This screen orchestrates admin features
 * - Open/Closed: Can be extended with new admin sections without modifying existing logic
 * - Dependency Inversion: Depends on hooks abstraction, not implementation
 */
export default function AdminScreen() {
	const scheme = useColorScheme();
	const [searchedUsername, setSearchedUsername] = useState<string>('');

	// Fetch dinner stats for the graph
	const {
		data: dinnerStats,
		isLoading: isLoadingStats,
		error: statsError,
	} = useDinnerStatsQuery();

	// Fetch user attendance based on search
	const {
		data: userAttendance,
		isLoading: isLoadingAttendance,
		error: attendanceError,
	} = useUserAttendanceQuery(searchedUsername);

	const handleSearch = (username: string) => {
		setSearchedUsername(username);
	};

	return (
		<ScrollView
			testID="admin-container"
			style={[styles.container, { backgroundColor: Colors[scheme ?? 'light'].background }]}
		>
			{/* Dinner Graph Section - Expandable */}
			<View testID="dinner-graph-section" style={styles.section}>
				<Accordion title="Dinner Participation Graph" initialExpanded={true} testID="dinner-graph-accordion">
					{isLoadingStats ? (
						<View testID="dinner-graph-loading" style={styles.loadingContainer}>
							<ActivityIndicator size="large" color={Colors[scheme ?? 'light'].tint} />
						</View>
					) : statsError ? (
						<Text style={[styles.errorText, { color: '#EF4444' }]}>
							Failed to load dinner statistics
						</Text>
					) : (
						<DinnerGraph testID="dinner-graph" data={dinnerStats} />
					)}
				</Accordion>
			</View>

			{/* User Search Section - Expandable */}
			<View testID="user-search-section" style={styles.section}>
				<Accordion title="Search User Attendance" initialExpanded={true} testID="user-search-accordion">
					<UserSearch testID="user-search" onSearch={handleSearch} />

					{/* Attendance Results */}
					{searchedUsername && (
						<View style={styles.attendanceContainer}>
							{isLoadingAttendance ? (
								<View testID="attendance-loading" style={styles.loadingContainer}>
									<ActivityIndicator size="large" color={Colors[scheme ?? 'light'].tint} />
								</View>
							) : attendanceError ? (
								<Text style={[styles.errorText, { color: '#EF4444' }]}>
									User not found or failed to load attendance
								</Text>
							) : userAttendance && userAttendance.length === 0 ? (
								<Text style={[styles.emptyText, { color: Colors[scheme ?? 'light'].icon }]}>
									No attendance records found for this user
								</Text>
							) : (
								<DinnerAttendance testID="dinner-attendance" username={searchedUsername} data={userAttendance} />
							)}
						</View>
					)}
				</Accordion>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	section: {
		marginBottom: 16,
	},
	loadingContainer: {
		padding: 20,
		alignItems: 'center',
	},
	errorText: {
		fontSize: 14,
		marginVertical: 8,
	},
	emptyText: {
		fontSize: 14,
		marginVertical: 8,
		fontStyle: 'italic',
	},
	attendanceContainer: {
		marginTop: 16,
	},
});

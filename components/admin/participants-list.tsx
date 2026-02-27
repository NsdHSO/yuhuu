import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Participant } from '@/features/dinners/types';

/**
 * ParticipantsList component - Displays list of participants for a dinner
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles displaying participant list
 * - Open/Closed: Can be extended with sorting/filtering without modification
 */

type ParticipantsListProps = {
	participants: Participant[];
	testID?: string;
};

export function ParticipantsList({ participants, testID }: ParticipantsListProps) {
	const scheme = useColorScheme();

	if (participants.length === 0) {
		return (
			<View testID={testID}>
				<Text style={[styles.emptyText, { color: Colors[scheme ?? 'light'].icon }]}>
					No participants found for this dinner
				</Text>
			</View>
		);
	}

	return (
		<View testID={testID} style={styles.container}>
			{participants.map((participant, index) => (
				<View
					key={participant.id}
					testID={`participant-item-${index}`}
					style={[
						styles.participantCard,
						{
							backgroundColor: scheme === 'dark' ? '#1F2937' : '#F3F4F6',
						},
					]}
				>
					<View style={styles.cardRow}>
						<Text style={[styles.label, { color: Colors[scheme ?? 'light'].icon }]}>
							Username:
						</Text>
						<Text style={[styles.value, { color: Colors[scheme ?? 'light'].text }]}>
							{participant.username}
						</Text>
					</View>

					{participant.notes && (
						<View style={styles.cardRow}>
							<Text style={[styles.label, { color: Colors[scheme ?? 'light'].icon }]}>
								Notes:
							</Text>
							<Text style={[styles.value, { color: Colors[scheme ?? 'light'].text }]}>
								{participant.notes}
							</Text>
						</View>
					)}

					<View style={styles.cardRow}>
						<Text style={[styles.label, { color: Colors[scheme ?? 'light'].icon }]}>
							Added:
						</Text>
						<Text style={[styles.value, styles.dateText, { color: Colors[scheme ?? 'light'].icon }]}>
							{new Date(participant.createdAt).toLocaleDateString()}
						</Text>
					</View>
				</View>
			))}

			<Text style={[styles.countText, { color: Colors[scheme ?? 'light'].icon }]}>
				Total: {participants.length} participant{participants.length !== 1 ? 's' : ''}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
	participantCard: {
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
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
		flex: 1,
		textAlign: 'right',
	},
	dateText: {
		fontSize: 12,
	},
	countText: {
		fontSize: 14,
		fontWeight: 'bold',
		marginTop: 8,
		textAlign: 'center',
	},
	emptyText: {
		fontSize: 14,
		fontStyle: 'italic',
		textAlign: 'center',
		marginVertical: 16,
	},
});

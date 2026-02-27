import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { Dinner } from '@/features/dinners/types';

/**
 * Props for DinnerSelector component
 */
export type DinnerSelectorProps = {
	/** Array of available dinners */
	dinners: Dinner[];
	/** Currently selected dinner ID, or null */
	selectedDinnerId: number | null;
	/** Callback when dinner selection changes */
	onSelectDinner: (dinnerId: number) => void;
};

/**
 * Dropdown component for selecting a dinner from a list
 * SOLID Principles:
 * - Single Responsibility: Only handles dinner selection UI
 * - Open/Closed: Open for styling extensions, closed for behavior modification
 * - Dependency Inversion: Depends on Dinner type abstraction
 *
 * Features:
 * - Auto-selects if only one dinner available
 * - Shows dropdown if multiple dinners
 * - Theme-aware styling
 * - Displays meal type and location for clarity
 */
export function DinnerSelector({
	dinners,
	selectedDinnerId,
	onSelectDinner,
}: DinnerSelectorProps) {
	const scheme = useColorScheme() ?? 'light';

	// Auto-select if only one dinner and nothing selected yet
	React.useEffect(() => {
		if (dinners.length === 1 && selectedDinnerId === null) {
			onSelectDinner(dinners[0].id);
		}
	}, [dinners, selectedDinnerId, onSelectDinner]);

	// If only one dinner, no need to show dropdown
	if (dinners.length === 1) {
		return null;
	}

	const pickerStyle = useMemo(
		() => ({
			backgroundColor: scheme === 'dark' ? '#1F2937' : '#fff',
			color: Colors[scheme].text,
		}),
		[scheme]
	);

	return (
		<Picker
			selectedValue={selectedDinnerId}
			onValueChange={(value) => {
				if (value !== null && value !== undefined) {
					// Convert to number to ensure type consistency
					const dinnerId = typeof value === 'string' ? parseInt(value, 10) : value;
					onSelectDinner(dinnerId);
				}
			}}
			style={[styles.picker, pickerStyle]}
		>
			<Picker.Item label="Select a dinner..." value={null} />
			{dinners.map((dinner) => (
				<Picker.Item
					key={dinner.id}
					label={`${dinner.mealType} - ${dinner.location || dinner.description || 'Dinner'}`}
					value={dinner.id}
				/>
			))}
		</Picker>
	);
}

const styles = StyleSheet.create({
	picker: {
		marginVertical: 12,
		borderWidth: 1,
		borderRadius: 8,
	},
});

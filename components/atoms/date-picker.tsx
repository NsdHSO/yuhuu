import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

/**
 * Props for the DatePicker component
 */
export type DatePickerProps = {
	/** Currently selected date in YYYY-MM-DD format, or null if no date selected */
	selectedDate: string | null;
	/** Callback when a date is selected */
	onDateSelect: (date: string) => void;
};

/**
 * Calendar component for selecting dinner dates
 * SOLID Principles:
 * - Single Responsibility: Only handles date selection UI
 * - Open/Closed: Open for theme extensions, closed for behavior modification
 *
 * Features:
 * - Fancy blue water theme in both dark/light modes
 * - Ocean-inspired color palette with gradients
 * - Highlights selected date with aqua/cyan colors
 * - Calls onDateSelect when user taps a date
 */
export function DatePicker({ selectedDate, onDateSelect }: DatePickerProps) {
	const scheme = useColorScheme() ?? 'light';

	// Fancy blue water theme colors - ocean inspired!
	// Both modes use DARK RICH BLUE (no ugly light blue!)
	const primaryColor = scheme === 'dark' ? '#06B6D4' : '#1E3A8A'; // Cyan / Rich navy blue
	const bgColor = scheme === 'dark' ? '#0F172A' : '#1E293B'; // Deep ocean / Dark slate blue
	const textColor = scheme === 'dark' ? '#E0F2FE' : '#F1F5F9'; // Light blue / Light gray
	const disabledColor = scheme === 'dark' ? '#334155' : '#475569'; // Slate / Medium slate
	const todayColor = scheme === 'dark' ? '#22D3EE' : '#06B6D4'; // Bright cyan for both

	// Mark the selected date
	const markedDates = selectedDate
		? { [selectedDate]: { selected: true, selectedColor: primaryColor } }
		: {};

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor: bgColor,
					borderRadius: 12,
					padding: 8,
					overflow: 'hidden',
				},
			]}
		>
			<Calendar
				onDayPress={(day) => onDateSelect(day.dateString)}
				markedDates={markedDates}
				theme={{
					backgroundColor: bgColor,
					calendarBackground: bgColor,
					textSectionTitleColor: textColor,
					selectedDayBackgroundColor: primaryColor,
					selectedDayTextColor: '#FFFFFF',
					todayTextColor: todayColor,
					dayTextColor: textColor,
					textDisabledColor: disabledColor,
					monthTextColor: textColor,
					arrowColor: primaryColor,
					dotColor: primaryColor,
					selectedDotColor: '#FFFFFF',
				}}
				style={{
					backgroundColor: bgColor,
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
});

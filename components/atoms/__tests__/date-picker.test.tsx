import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DatePicker } from '@/components/atoms/date-picker';
import * as useColorSchemeModule from '@/hooks/use-color-scheme';

// Mock react-native-calendars
jest.mock('react-native-calendars', () => {
	const { View } = jest.requireActual('react-native');
	return {
		Calendar: ({ onDayPress, markedDates }: any) => (
			<View
				testID="calendar"
				onPress={() =>
					onDayPress({ dateString: '2026-02-28', day: 28, month: 2, year: 2026 })
				}
				markedDates={markedDates}
			/>
		),
	};
});

// Mock useColorScheme hook
jest.mock('@/hooks/use-color-scheme', () => ({
	useColorScheme: jest.fn(() => 'light'),
}));

describe('DatePicker', () => {
	const mockOnDateSelect = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render calendar component', () => {
		const { getByTestId } = render(
			<DatePicker selectedDate={null} onDateSelect={mockOnDateSelect} />
		);

		expect(getByTestId('calendar')).toBeTruthy();
	});

	it('should call onDateSelect when a date is pressed', () => {
		const { getByTestId } = render(
			<DatePicker selectedDate={null} onDateSelect={mockOnDateSelect} />
		);

		const calendar = getByTestId('calendar');
		fireEvent.press(calendar);

		expect(mockOnDateSelect).toHaveBeenCalledWith('2026-02-28');
	});

	it('should mark the selected date', () => {
		const { getByTestId } = render(
			<DatePicker selectedDate="2026-02-28" onDateSelect={mockOnDateSelect} />
		);

		const calendar = getByTestId('calendar');
		expect(calendar.props.markedDates).toEqual({
			'2026-02-28': {
				selected: true,
				selectedColor: expect.any(String),
			},
		});
	});

	it('should have no marked dates when selectedDate is null', () => {
		const { getByTestId } = render(
			<DatePicker selectedDate={null} onDateSelect={mockOnDateSelect} />
		);

		const calendar = getByTestId('calendar');
		expect(calendar.props.markedDates).toEqual({});
	});

	it('should update marked dates when selectedDate changes', () => {
		const { getByTestId, rerender } = render(
			<DatePicker selectedDate="2026-02-28" onDateSelect={mockOnDateSelect} />
		);

		let calendar = getByTestId('calendar');
		expect(calendar.props.markedDates).toEqual({
			'2026-02-28': {
				selected: true,
				selectedColor: expect.any(String),
			},
		});

		// Change selected date
		rerender(<DatePicker selectedDate="2026-03-05" onDateSelect={mockOnDateSelect} />);

		calendar = getByTestId('calendar');
		expect(calendar.props.markedDates).toEqual({
			'2026-03-05': {
				selected: true,
				selectedColor: expect.any(String),
			},
		});
	});

	it('should use light theme colors by default', () => {
		jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('light');

		const { getByTestId } = render(
			<DatePicker selectedDate="2026-02-28" onDateSelect={mockOnDateSelect} />
		);

		const calendar = getByTestId('calendar');
		expect(calendar.props.markedDates['2026-02-28'].selectedColor).toBe('#1E3A8A');
	});

	it('should use dark theme colors when scheme is dark', () => {
		jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('dark');

		const { getByTestId } = render(
			<DatePicker selectedDate="2026-02-28" onDateSelect={mockOnDateSelect} />
		);

		const calendar = getByTestId('calendar');
		expect(calendar.props.markedDates['2026-02-28'].selectedColor).toBe('#06B6D4');
	});

	it('should use bright blue color in dark mode for visibility', () => {
		jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('dark');

		const { getByTestId } = render(
			<DatePicker selectedDate="2026-02-28" onDateSelect={mockOnDateSelect} />
		);

		const calendar = getByTestId('calendar');
		// Dark mode should use bright aqua blue (#06B6D4) for fancy water theme
		expect(calendar.props.markedDates['2026-02-28'].selectedColor).toBe('#06B6D4');
	});

	it('should use fancy dark blue color in light mode (not ugly light blue)', () => {
		jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('light');

		const { getByTestId } = render(
			<DatePicker selectedDate="2026-02-28" onDateSelect={mockOnDateSelect} />
		);

		const calendar = getByTestId('calendar');
		// Light mode should use dark ocean blue (#1E3A8A) - rich and beautiful, not ugly light blue!
		expect(calendar.props.markedDates['2026-02-28'].selectedColor).toBe('#1E3A8A');
	});

	it('should use rich dark blue theme in light mode like dark mode', () => {
		jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('light');

		const { getByTestId } = render(
			<DatePicker selectedDate="2026-02-28" onDateSelect={mockOnDateSelect} />
		);

		const calendar = getByTestId('calendar');
		// Should use dark blue similar to dark mode aesthetic
		expect(calendar.props.markedDates['2026-02-28'].selectedColor).toMatch(/#1[0-9A-F]{5}/i);
	});

	it('should handle null scheme gracefully', () => {
		jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue(null);

		const { getByTestId } = render(
			<DatePicker selectedDate={null} onDateSelect={mockOnDateSelect} />
		);

		// Should default to 'light' when scheme is null
		expect(getByTestId('calendar')).toBeTruthy();
	});
});

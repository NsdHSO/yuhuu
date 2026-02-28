import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DinnerSelector } from '@/components/atoms/dinner-selector';
import type { Dinner } from '@/features/dinners/types';
import * as useColorSchemeModule from '@/hooks/use-color-scheme';

// Mock useColorScheme hook
jest.mock('@/hooks/use-color-scheme', () => ({
	useColorScheme: jest.fn(() => 'light'),
}));

// Mock Picker
jest.mock('@react-native-picker/picker', () => {
	const MockPickerItem = ({ label, value }: any) => {
		const { Text } = jest.requireActual('react-native');
		return <Text testID={`picker-item-${value}`}>{label}</Text>;
	};

	const MockPicker = ({ children, onValueChange, selectedValue }: any) => {
		const { View, Text, Pressable } = jest.requireActual('react-native');
		return (
			<View testID="picker">
				<Text testID="picker-value">{selectedValue}</Text>
				<Pressable
					testID="picker-select-1"
					onPress={() => onValueChange(1)}
				>
					<Text>Select Dinner 1</Text>
				</Pressable>
				<Pressable
					testID="picker-select-2"
					onPress={() => onValueChange(2)}
				>
					<Text>Select Dinner 2</Text>
				</Pressable>
				{children}
			</View>
		);
	};

	// Attach Item as a property of Picker
	MockPicker.Item = MockPickerItem;

	return {
		Picker: MockPicker,
	};
});

describe('DinnerSelector', () => {
	const mockOnSelectDinner = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Auto-selection', () => {
		it('should auto-select when only one dinner is available', () => {
			const dinners: Dinner[] = [
				{
					id: 1,
					dinnerDate: '2026-02-28',
					mealType: 'Dinner',
					location: 'Church Hall',
					description: 'Fellowship dinner',
					maxParticipants: 50,
					uuid: 'uuid-1',
					createdAt: '2026-02-25T10:00:00Z',
					updatedAt: '2026-02-25T10:00:00Z',
				},
			];

			render(
				<DinnerSelector
					dinners={dinners}
					selectedDinnerId={null}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			// Should auto-select the only dinner
			expect(mockOnSelectDinner).toHaveBeenCalledWith(1);
		});

		it('should not render dropdown when only one dinner', () => {
			const dinners: Dinner[] = [
				{
					id: 1,
					dinnerDate: '2026-02-28',
					mealType: 'Dinner',
					location: 'Church Hall',
					description: 'Fellowship dinner',
					maxParticipants: 50,
					uuid: 'uuid-1',
					createdAt: '2026-02-25T10:00:00Z',
					updatedAt: '2026-02-25T10:00:00Z',
				},
			];

			const { queryByTestId } = render(
				<DinnerSelector
					dinners={dinners}
					selectedDinnerId={null}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			// Dropdown should not be rendered
			expect(queryByTestId('picker')).toBeNull();
		});

		it('should not auto-select if dinner already selected', () => {
			const dinners: Dinner[] = [
				{
					id: 1,
					dinnerDate: '2026-02-28',
					mealType: 'Dinner',
					location: 'Church Hall',
					description: 'Fellowship dinner',
					maxParticipants: 50,
					uuid: 'uuid-1',
					createdAt: '2026-02-25T10:00:00Z',
					updatedAt: '2026-02-25T10:00:00Z',
				},
			];

			render(
				<DinnerSelector
					dinners={dinners}
					selectedDinnerId={1}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			// Should NOT call onSelectDinner because already selected
			expect(mockOnSelectDinner).not.toHaveBeenCalled();
		});
	});

	describe('Multiple dinners dropdown', () => {
		const multipleDinners: Dinner[] = [
			{
				id: 1,
				dinnerDate: '2026-02-28',
				mealType: 'Dinner',
				location: 'Church Hall',
				description: 'Fellowship dinner',
				maxParticipants: 50,
				uuid: 'uuid-1',
				createdAt: '2026-02-25T10:00:00Z',
				updatedAt: '2026-02-25T10:00:00Z',
			},
			{
				id: 2,
				dinnerDate: '2026-02-28',
				mealType: 'Dinner',
				location: 'Community Center',
				description: 'Youth dinner',
				maxParticipants: 30,
				uuid: 'uuid-2',
				createdAt: '2026-02-25T11:00:00Z',
				updatedAt: '2026-02-25T11:00:00Z',
			},
		];

		it('should render dropdown when multiple dinners available', () => {
			const { getByTestId } = render(
				<DinnerSelector
					dinners={multipleDinners}
					selectedDinnerId={null}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			expect(getByTestId('picker')).toBeTruthy();
		});

		it('should call onSelectDinner when user selects a dinner', () => {
			const { getByTestId } = render(
				<DinnerSelector
					dinners={multipleDinners}
					selectedDinnerId={null}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			const selectButton = getByTestId('picker-select-2');
			fireEvent.press(selectButton);

			expect(mockOnSelectDinner).toHaveBeenCalledWith(2);
		});

		it('should display selected dinner ID', () => {
			const { getByTestId } = render(
				<DinnerSelector
					dinners={multipleDinners}
					selectedDinnerId={2}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			const pickerValue = getByTestId('picker-value');
			expect(pickerValue.props.children).toBe(2);
		});

		it('should not call onSelectDinner with null value', () => {
			const { getByTestId } = render(
				<DinnerSelector
					dinners={multipleDinners}
					selectedDinnerId={null}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			const picker = getByTestId('picker');
			// Simulate null value change
			picker.props.onValueChange?.(null);

			expect(mockOnSelectDinner).not.toHaveBeenCalled();
		});
	});

	describe('Empty dinners array', () => {
		it('should not render anything when dinners array is empty', () => {
			const { queryByTestId } = render(
				<DinnerSelector
					dinners={[]}
					selectedDinnerId={null}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			expect(queryByTestId('picker')).toBeNull();
		});

		it('should not call onSelectDinner when dinners array is empty', () => {
			render(
				<DinnerSelector
					dinners={[]}
					selectedDinnerId={null}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			expect(mockOnSelectDinner).not.toHaveBeenCalled();
		});
	});

	describe('Theme support', () => {
		it('should use light theme by default', () => {
			jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('light');

			const multipleDinners: Dinner[] = [
				{
					id: 1,
					dinnerDate: '2026-02-28',
					mealType: 'Dinner',
					location: 'Church Hall',
					description: 'Fellowship dinner',
					maxParticipants: 50,
					uuid: 'uuid-1',
					createdAt: '2026-02-25T10:00:00Z',
					updatedAt: '2026-02-25T10:00:00Z',
				},
				{
					id: 2,
					dinnerDate: '2026-02-28',
					mealType: 'Dinner',
					location: 'Community Center',
					description: 'Youth dinner',
					maxParticipants: 30,
					uuid: 'uuid-2',
					createdAt: '2026-02-25T11:00:00Z',
					updatedAt: '2026-02-25T11:00:00Z',
				},
			];

			const { getByTestId } = render(
				<DinnerSelector
					dinners={multipleDinners}
					selectedDinnerId={null}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			const picker = getByTestId('picker');
			expect(picker).toBeTruthy();
		});

		it('should use dark theme when specified', () => {
			jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('dark');

			const multipleDinners: Dinner[] = [
				{
					id: 1,
					dinnerDate: '2026-02-28',
					mealType: 'Dinner',
					location: 'Church Hall',
					description: 'Fellowship dinner',
					maxParticipants: 50,
					uuid: 'uuid-1',
					createdAt: '2026-02-25T10:00:00Z',
					updatedAt: '2026-02-25T10:00:00Z',
				},
				{
					id: 2,
					dinnerDate: '2026-02-28',
					mealType: 'Dinner',
					location: 'Community Center',
					description: 'Youth dinner',
					maxParticipants: 30,
					uuid: 'uuid-2',
					createdAt: '2026-02-25T11:00:00Z',
					updatedAt: '2026-02-25T11:00:00Z',
				},
			];

			const { getByTestId } = render(
				<DinnerSelector
					dinners={multipleDinners}
					selectedDinnerId={null}
					onSelectDinner={mockOnSelectDinner}
				/>
			);

			const picker = getByTestId('picker');
			expect(picker).toBeTruthy();
		});
	});
});

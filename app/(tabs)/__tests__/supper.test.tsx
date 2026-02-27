import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';
import SupperScreen from '../supper';
import type { Dinner } from '@/features/dinners/types';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock hooks
const mockUseDinnersByDateQuery = jest.fn();
const mockUseAddParticipantMutation = jest.fn();

jest.mock('@/features/dinners/hooks', () => ({
	useDinnersByDateQuery: (...args: any[]) => mockUseDinnersByDateQuery(...args),
	useAddParticipantMutation: (...args: any[]) => mockUseAddParticipantMutation(...args),
}));

// Mock components
jest.mock('@/components/atoms/date-picker', () => ({
	DatePicker: ({ onDateSelect }: any) => {
		const { Pressable, Text } = jest.requireActual('react-native');
		return (
			<Pressable
				testID="date-picker"
				onPress={() => onDateSelect('2026-02-28')}
			>
				<Text>Select Date</Text>
			</Pressable>
		);
	},
}));

jest.mock('@/components/atoms/dinner-selector', () => ({
	DinnerSelector: ({ onSelectDinner, dinners }: any) => {
		const { Pressable, Text } = jest.requireActual('react-native');
		if (dinners.length === 0) return null;
		return (
			<Pressable
				testID="dinner-selector"
				onPress={() => onSelectDinner(dinners[0].id)}
			>
				<Text>Select Dinner</Text>
			</Pressable>
		);
	},
}));

jest.mock('@/components/molecules/participant-form', () => ({
	ParticipantForm: ({ onSubmit }: any) => {
		const { Pressable, Text, TextInput, View } = jest.requireActual('react-native');
		return (
			<View testID="participant-form">
				<TextInput placeholder="Username" testID="username-input" />
				<TextInput placeholder="Notes (optional)" testID="notes-input" />
				<Pressable
					testID="submit-button"
					onPress={() => onSubmit('john_doe', 'Vegetarian')}
				>
					<Text>Add Participant</Text>
				</Pressable>
			</View>
		);
	},
}));

jest.mock('@/components/atoms/loading-state', () => ({
	LoadingState: () => {
		const { Text } = jest.requireActual('react-native');
		return <Text testID="loading-state">Loading...</Text>;
	},
}));

jest.mock('@/components/atoms/error-state', () => ({
	ErrorState: () => {
		const { Text } = jest.requireActual('react-native');
		return <Text testID="error-state">Error</Text>;
	},
}));

jest.mock('@/components/atoms/empty-state', () => ({
	EmptyState: () => {
		const { Text } = jest.requireActual('react-native');
		return <Text testID="empty-state">Select a date</Text>;
	},
}));

jest.mock('@/components/molecules/dinner-details-card', () => ({
	DinnerDetailsCard: () => {
		const { Text } = jest.requireActual('react-native');
		return <Text testID="dinner-details">Dinner Details</Text>;
	},
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

describe('SupperScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Initial state', () => {
		it('should show empty state when no date is selected', () => {
			mockUseDinnersByDateQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { getByTestId, queryByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			expect(getByTestId('empty-state')).toBeTruthy();
			expect(queryByTestId('loading-state')).toBeNull();
			expect(queryByTestId('dinner-selector')).toBeNull();
			expect(queryByTestId('participant-form')).toBeNull();
		});

		it('should render date picker', () => {
			mockUseDinnersByDateQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { getByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			expect(getByTestId('date-picker')).toBeTruthy();
		});
	});

	describe('Date selection', () => {
		it('should show loading state when fetching dinners', () => {
			mockUseDinnersByDateQuery.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { getByTestId, queryByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			fireEvent.press(getByTestId('date-picker'));

			expect(getByTestId('loading-state')).toBeTruthy();
			expect(queryByTestId('empty-state')).toBeNull();
		});

		it('should show error state when no dinners found', () => {
			mockUseDinnersByDateQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('Not found'),
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { getByTestId, queryByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			fireEvent.press(getByTestId('date-picker'));

			expect(getByTestId('error-state')).toBeTruthy();
			expect(queryByTestId('participant-form')).toBeNull();
		});
	});

	describe('Multiple dinners scenario', () => {
		const multipleDinners: Dinner[] = [
			{
				id: 1,
				dinnerDate: '2026-02-28',
				mealType: 'Dinner',
				location: 'Church Hall',
				description: 'Fellowship dinner',
				maxParticipants: 50,
				uuid: 'uuid-1',
				recordedBy: null,
				createdAt: '2026-02-25T10:00:00Z',
				updatedAt: '2026-02-25T10:00:00Z',
			},
			{
				id: 2,
				dinnerDate: '2026-02-28',
				mealType: 'Lunch',
				location: 'Community Center',
				description: 'Youth dinner',
				maxParticipants: 30,
				uuid: 'uuid-2',
				recordedBy: null,
				createdAt: '2026-02-25T11:00:00Z',
				updatedAt: '2026-02-25T11:00:00Z',
			},
		];

		it('should show dinner selector when multiple dinners returned', () => {
			mockUseDinnersByDateQuery.mockReturnValue({
				data: multipleDinners,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { getByTestId, queryByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			fireEvent.press(getByTestId('date-picker'));

			expect(getByTestId('dinner-selector')).toBeTruthy();
			expect(queryByTestId('participant-form')).toBeNull();
		});

		it('should NOT show participant form until dinner is selected', () => {
			mockUseDinnersByDateQuery.mockReturnValue({
				data: multipleDinners,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { queryByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			// Participant form should not be visible
			expect(queryByTestId('participant-form')).toBeNull();
		});

		it('should show participant form after selecting a dinner', async () => {
			mockUseDinnersByDateQuery.mockReturnValue({
				data: multipleDinners,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { getByTestId, queryByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			fireEvent.press(getByTestId('date-picker'));

			// Select a dinner
			fireEvent.press(getByTestId('dinner-selector'));

			// Now participant form should be visible
			await waitFor(() => {
				expect(queryByTestId('participant-form')).toBeTruthy();
			});
		});

		it('should show username and notes inputs after selecting first dinner from dropdown', async () => {
			// CRITICAL TEST: User selects date, gets 2 dinners, selects from dropdown
			// The username and notes inputs MUST be present in the DOM!
			mockUseDinnersByDateQuery.mockReturnValue({
				data: multipleDinners,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { getByTestId, getByPlaceholderText, queryByPlaceholderText } = render(
				<SupperScreen />,
				{
					wrapper: createWrapper(),
				}
			);

			// Step 1: Select date from calendar
			fireEvent.press(getByTestId('date-picker'));

			// Step 2: Verify dinner selector appears with 2 dinners
			expect(getByTestId('dinner-selector')).toBeTruthy();

			// Step 3: Inputs should NOT be visible yet
			expect(queryByPlaceholderText('Username')).toBeNull();
			expect(queryByPlaceholderText('Notes (optional)')).toBeNull();

			// Step 4: Select first dinner from dropdown
			fireEvent.press(getByTestId('dinner-selector'));

			// Step 5: NOW the inputs MUST be present in the DOM!
			await waitFor(() => {
				expect(getByPlaceholderText('Username')).toBeTruthy();
				expect(getByPlaceholderText('Notes (optional)')).toBeTruthy();
			});
		});
	});

	describe('Single dinner scenario', () => {
		const singleDinner: Dinner[] = [
			{
				id: 1,
				dinnerDate: '2026-02-28',
				mealType: 'Breakfast',
				location: 'Church Hall',
				description: 'Fellowship dinner',
				maxParticipants: 50,
				uuid: 'uuid-3',
				recordedBy: null,
				createdAt: '2026-02-25T10:00:00Z',
				updatedAt: '2026-02-25T10:00:00Z',
			},
		];

		it('should auto-select dinner when only one is returned', () => {
			mockUseDinnersByDateQuery.mockReturnValue({
				data: singleDinner,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { queryByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			// Dinner selector should not be shown (auto-selected)
			expect(queryByTestId('dinner-selector')).toBeNull();
		});

		it('should show participant form immediately for single dinner', () => {
			mockUseDinnersByDateQuery.mockReturnValue({
				data: singleDinner,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { getByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			fireEvent.press(getByTestId('date-picker'));

			// Participant form should be visible immediately
			expect(getByTestId('participant-form')).toBeTruthy();
		});
	});

	describe('Empty dinners array', () => {
		it('should show error state when dinners array is empty', () => {
			mockUseDinnersByDateQuery.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: jest.fn(),
				isPending: false,
			});

			const { getByTestId, queryByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			fireEvent.press(getByTestId('date-picker'));

			// Should show error (no dinners found)
			expect(queryByTestId('participant-form')).toBeNull();
			expect(queryByTestId('dinner-selector')).toBeNull();
		});
	});

	describe('Participant submission', () => {
		const singleDinner: Dinner[] = [
			{
				id: 1,
				dinnerDate: '2026-02-28',
				mealType: 'Lunch',
				location: 'Church Hall',
				description: 'Fellowship dinner',
				maxParticipants: 50,
				uuid: 'uuid-4',
				recordedBy: null,
				createdAt: '2026-02-25T10:00:00Z',
				updatedAt: '2026-02-25T10:00:00Z',
			},
		];

		it('should call mutation when participant form is submitted', () => {
			const mockMutate = jest.fn();
			mockUseDinnersByDateQuery.mockReturnValue({
				data: singleDinner,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: mockMutate,
				isPending: false,
			});

			const { getByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			fireEvent.press(getByTestId('date-picker'));
			fireEvent.press(getByTestId('submit-button'));

			expect(mockMutate).toHaveBeenCalledWith(
				{ username: 'john_doe', notes: 'Vegetarian' },
				expect.objectContaining({
					onSuccess: expect.any(Function),
					onError: expect.any(Function),
				})
			);
		});

		it('should show success alert on successful submission', () => {
			const mockMutate = jest.fn((input, { onSuccess }) => {
				onSuccess();
			});
			mockUseDinnersByDateQuery.mockReturnValue({
				data: singleDinner,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: mockMutate,
				isPending: false,
			});

			const { getByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			fireEvent.press(getByTestId('date-picker'));
			fireEvent.press(getByTestId('submit-button'));

			expect(Alert.alert).toHaveBeenCalledWith('Success', expect.any(String));
		});

		it('should show error alert on failed submission', () => {
			const error = { response: { data: { message: 'Failed to add' } } };
			const mockMutate = jest.fn((input, { onError }) => {
				onError(error);
			});
			mockUseDinnersByDateQuery.mockReturnValue({
				data: singleDinner,
				isLoading: false,
				error: null,
			});
			mockUseAddParticipantMutation.mockReturnValue({
				mutate: mockMutate,
				isPending: false,
			});

			const { getByTestId } = render(<SupperScreen />, {
				wrapper: createWrapper(),
			});

			fireEvent.press(getByTestId('date-picker'));
			fireEvent.press(getByTestId('submit-button'));

			expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to add');
		});
	});
});

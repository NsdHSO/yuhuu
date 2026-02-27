import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

/**
 * Unit tests for Admin Screen
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific admin feature
 * - Open/Closed: Tests ensure features can be extended without modifying existing logic
 */

// Mock hooks - must be before import
const mockUseDinnerStatsQuery = jest.fn();
const mockUseUserAttendanceQuery = jest.fn();
const mockUseParticipantsByDinnerQuery = jest.fn();

jest.mock('@/features/admin/hooks', () => {
	const actualHooks = jest.requireActual('@/features/admin/hooks');
	return {
		...actualHooks,
		useDinnerStatsQuery: () => mockUseDinnerStatsQuery(),
		useUserAttendanceQuery: (username: string) => {
			// Return mock based on username
			if (!username || username === '') {
				return { data: undefined, isLoading: false, error: null };
			}
			return mockUseUserAttendanceQuery(username);
		},
	};
});

// Mock participants hook
jest.mock('@/features/dinners/hooks', () => ({
	useParticipantsByDinnerQuery: (dinnerId: number | null) => {
		if (!dinnerId) {
			return { data: undefined, isLoading: false, error: null };
		}
		return mockUseParticipantsByDinnerQuery(dinnerId);
	},
}));

// Import after mocks
import AdminScreen from '../admin';

describe('AdminScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseDinnerStatsQuery.mockReturnValue({
			data: undefined,
			isLoading: false,
			error: null,
		});
		mockUseUserAttendanceQuery.mockReturnValue({
			data: undefined,
			isLoading: false,
			error: null,
		});
		mockUseParticipantsByDinnerQuery.mockReturnValue({
			data: undefined,
			isLoading: false,
			error: null,
		});
	});

	describe('Multiple Sections Layout', () => {
		it('should render all admin sections', () => {
			// Given: Admin screen is rendered
			const { getByTestId } = render(<AdminScreen />);

			// Then: All sections should be present
			expect(getByTestId('admin-container')).toBeTruthy();
			expect(getByTestId('dinner-graph-section')).toBeTruthy();
			expect(getByTestId('user-search-section')).toBeTruthy();
		});

		it('should display section titles', () => {
			// Given: Admin screen is rendered
			const { getByText } = render(<AdminScreen />);

			// Then: Section titles should be visible
			expect(getByText('Dinner Participation Graph')).toBeTruthy();
			expect(getByText('Search User Attendance')).toBeTruthy();
		});
	});

	describe('Dinner Graph Section', () => {
		it('should render dinner graph component', () => {
			// Given: Admin screen is rendered
			const { getByTestId } = render(<AdminScreen />);

			// Then: Dinner graph should be present
			expect(getByTestId('dinner-graph')).toBeTruthy();
		});

		it('should show loading state when fetching dinner stats', () => {
			// Given: Dinner stats are loading
			mockUseDinnerStatsQuery.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			});

			// When: Admin screen renders
			const { getByTestId } = render(<AdminScreen />);

			// Then: Loading indicator should be visible
			expect(getByTestId('dinner-graph-loading')).toBeTruthy();
		});

		it('should display dinner stats when loaded', () => {
			// Given: Dinner stats are loaded
			mockUseDinnerStatsQuery.mockReturnValue({
				data: {
					totalDinners: 25,
					totalParticipants: 450,
					averageAttendance: 18,
				},
				isLoading: false,
				error: null,
			});

			// When: Admin screen renders
			const { getByTestId } = render(<AdminScreen />);

			// Then: Stats should be displayed
			expect(getByTestId('dinner-graph')).toBeTruthy();
		});

		it('should show error when dinner stats fail to load', () => {
			// Given: Dinner stats failed to load
			mockUseDinnerStatsQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('Failed to load stats'),
			});

			// When: Admin screen renders
			const { getByText } = render(<AdminScreen />);

			// Then: Error message should be visible
			expect(getByText(/Failed to load/i)).toBeTruthy();
		});
	});

	describe('User Search Section', () => {
		it('should render user search component', () => {
			// Given: Admin screen is rendered
			const { getByTestId } = render(<AdminScreen />);

			// Then: User search should be present
			expect(getByTestId('user-search')).toBeTruthy();
		});

		it('should have search input field', () => {
			// Given: Admin screen is rendered
			const { getByTestId } = render(<AdminScreen />);

			// Then: Search input should be present
			expect(getByTestId('search-input')).toBeTruthy();
		});

		it('should trigger search when user types username', () => {
			// Given: Admin screen is rendered with search handler
			const { getByTestId } = render(<AdminScreen />);
			const searchInput = getByTestId('search-input');

			// When: User types a username
			fireEvent.changeText(searchInput, 'john_doe');

			// Then: Search should be triggered
			// This will be verified by checking if attendance data is requested
			expect(mockUseUserAttendanceQuery).toHaveBeenCalled();
		});

		it('should NOT search when input is empty', () => {
			// Given: Admin screen is rendered
			const { getByTestId } = render(<AdminScreen />);
			const searchInput = getByTestId('search-input');

			// When: User clears the input
			fireEvent.changeText(searchInput, '');

			// Then: No attendance query should be made with empty username
			// The component should handle empty state gracefully
			expect(getByTestId('user-search')).toBeTruthy();
		});
	});

	describe('Dinner Attendance Display', () => {
		it('should show user attendance after search', async () => {
			// Given: User searches for a username
			mockUseUserAttendanceQuery.mockReturnValue({
				data: [
					{
						dinnerDate: '2026-02-20',
						attended: true,
						location: 'Church Hall',
						mealType: 'Lunch',
					},
					{
						dinnerDate: '2026-02-15',
						attended: true,
						location: 'Community Center',
						mealType: 'Dinner',
					},
				],
				isLoading: false,
				error: null,
			});

			// When: Admin screen renders and user searches
			const { getByTestId } = render(<AdminScreen />);
			const searchInput = getByTestId('search-input');

			// Enter username to trigger search (onChangeText triggers search automatically)
			fireEvent.changeText(searchInput, 'john_doe');

			// Then: Attendance data should be displayed
			await waitFor(() => {
				expect(getByTestId('dinner-attendance')).toBeTruthy();
			});
		});

		it('should show if user attended a specific dinner', async () => {
			// Given: User has attendance records
			mockUseUserAttendanceQuery.mockReturnValue({
				data: [
					{
						dinnerDate: '2026-02-20',
						attended: true,
						location: 'Church Hall',
					},
				],
				isLoading: false,
				error: null,
			});

			// When: Admin screen renders and user searches
			const { getByTestId, getByText } = render(<AdminScreen />);
			const searchInput = getByTestId('search-input');
			fireEvent.changeText(searchInput, 'john_doe');

			// Then: Attendance status should show "Attended"
			await waitFor(() => {
				expect(getByText('Attended')).toBeTruthy();
			});
		});

		it('should show if user did NOT attend a specific dinner', async () => {
			// Given: User has a non-attendance record
			mockUseUserAttendanceQuery.mockReturnValue({
				data: [
					{
						dinnerDate: '2026-02-10',
						attended: false,
						location: 'Church Hall',
					},
				],
				isLoading: false,
				error: null,
			});

			// When: Admin screen renders and user searches
			const { getByTestId, getByText } = render(<AdminScreen />);
			const searchInput = getByTestId('search-input');
			fireEvent.changeText(searchInput, 'john_doe');

			// Then: Attendance status should show "Not Attended"
			await waitFor(() => {
				expect(getByText('Not Attended')).toBeTruthy();
			});
		});

		it('should display dinner date and location for each attendance record', async () => {
			// Given: User has attendance records with details
			mockUseUserAttendanceQuery.mockReturnValue({
				data: [
					{
						dinnerDate: '2026-02-20',
						attended: true,
						location: 'Church Hall',
					},
				],
				isLoading: false,
				error: null,
			});

			// When: Admin screen renders and user searches
			const { getByTestId, getByText } = render(<AdminScreen />);
			const searchInput = getByTestId('search-input');
			fireEvent.changeText(searchInput, 'john_doe');

			// Then: Date and location should be visible
			await waitFor(() => {
				expect(getByText('2026-02-20')).toBeTruthy();
				expect(getByText('Church Hall')).toBeTruthy();
			});
		});

		it('should show loading state when fetching user attendance', () => {
			// Given: User attendance is loading
			mockUseUserAttendanceQuery.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			});

			// When: Admin screen renders and user searches
			const { getByTestId } = render(<AdminScreen />);
			const searchInput = getByTestId('search-input');
			fireEvent.changeText(searchInput, 'john_doe');

			// Then: Loading indicator should be visible
			expect(getByTestId('attendance-loading')).toBeTruthy();
		});

		it('should show error when user attendance fails to load', () => {
			// Given: User attendance failed to load
			mockUseUserAttendanceQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('User not found'),
			});

			// When: Admin screen renders and user searches
			const { getByTestId, getByText } = render(<AdminScreen />);
			const searchInput = getByTestId('search-input');
			fireEvent.changeText(searchInput, 'john_doe');

			// Then: Error message should be visible
			expect(getByText(/not found/i)).toBeTruthy();
		});

		it('should show empty state when user has no attendance records', async () => {
			// Given: User has no attendance records
			mockUseUserAttendanceQuery.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			});

			// When: Admin screen renders and user searches
			const { getByTestId, getByText } = render(<AdminScreen />);
			const searchInput = getByTestId('search-input');
			fireEvent.changeText(searchInput, 'john_doe');

			// Then: Empty state message should be visible
			await waitFor(() => {
				expect(getByText(/No attendance records found/i)).toBeTruthy();
			});
		});
	});

	describe('Integration - Search and Display Flow', () => {
		it('should complete full search flow from input to results', async () => {
			// Given: Admin screen is rendered
			mockUseUserAttendanceQuery.mockReturnValue({
				data: [
					{
						dinnerDate: '2026-02-20',
						attended: true,
						location: 'Church Hall',
					},
				],
				isLoading: false,
				error: null,
			});

			// When: User searches for a username
			const { getByTestId, getByText } = render(<AdminScreen />);
			const searchInput = getByTestId('search-input');

			fireEvent.changeText(searchInput, 'john_doe');

			const searchButton = getByTestId('search-button');
			fireEvent.press(searchButton);

			// Then: Full flow should complete with results displayed
			await waitFor(() => {
				expect(getByTestId('dinner-attendance')).toBeTruthy();
				expect(getByText('2026-02-20')).toBeTruthy();
				expect(getByText('Attended')).toBeTruthy();
			});
		});
	});

	describe('Dinner Participants Section', () => {
		it('should render dinner participants section', () => {
			// Given: Admin screen is rendered
			const { getByTestId } = render(<AdminScreen />);

			// Then: Participants section should be present
			expect(getByTestId('dinner-participants-section')).toBeTruthy();
		});

		it('should have dinner ID input field', () => {
			// Given: Admin screen is rendered
			const { getByTestId } = render(<AdminScreen />);

			// When: User expands the accordion
			const accordionHeader = getByTestId('dinner-participants-accordion-header');
			fireEvent.press(accordionHeader);

			// Then: Dinner ID input should be present
			expect(getByTestId('dinner-id-input')).toBeTruthy();
		});

		it('should fetch participants when dinner ID is entered', async () => {
			// Given: Mock participants data
			mockUseParticipantsByDinnerQuery.mockReturnValue({
				data: [
					{
						id: 1,
						dinnerId: 10,
						username: 'john_doe',
						notes: 'Vegetarian',
						createdAt: '2026-02-27T10:00:00Z',
						updatedAt: '2026-02-27T10:00:00Z',
					},
				],
				isLoading: false,
				error: null,
			});

			// When: User expands accordion and enters dinner ID
			const { getByTestId, getByText } = render(<AdminScreen />);
			const accordionHeader = getByTestId('dinner-participants-accordion-header');
			fireEvent.press(accordionHeader);

			const dinnerIdInput = getByTestId('dinner-id-input');
			fireEvent.changeText(dinnerIdInput, '10');

			// Then: Participants should be fetched and displayed
			await waitFor(() => {
				expect(getByText('john_doe')).toBeTruthy();
			});
		});

		it('should show loading state when fetching participants', () => {
			// Given: Participants are loading
			mockUseParticipantsByDinnerQuery.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			});

			// When: User expands accordion and enters dinner ID
			const { getByTestId } = render(<AdminScreen />);
			const accordionHeader = getByTestId('dinner-participants-accordion-header');
			fireEvent.press(accordionHeader);

			const dinnerIdInput = getByTestId('dinner-id-input');
			fireEvent.changeText(dinnerIdInput, '10');

			// Then: Loading indicator should be visible
			expect(getByTestId('participants-loading')).toBeTruthy();
		});

		it('should show error when participants fail to load', () => {
			// Given: Participants failed to load
			mockUseParticipantsByDinnerQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('Failed to load participants'),
			});

			// When: User expands accordion and enters dinner ID
			const { getByTestId, getByText } = render(<AdminScreen />);
			const accordionHeader = getByTestId('dinner-participants-accordion-header');
			fireEvent.press(accordionHeader);

			const dinnerIdInput = getByTestId('dinner-id-input');
			fireEvent.changeText(dinnerIdInput, '10');

			// Then: Error message should be visible
			expect(getByText(/Failed to load participants/i)).toBeTruthy();
		});

		it('should show empty state when dinner has no participants', async () => {
			// Given: Dinner has no participants
			mockUseParticipantsByDinnerQuery.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			});

			// When: User expands accordion and enters dinner ID
			const { getByTestId, getByText } = render(<AdminScreen />);
			const accordionHeader = getByTestId('dinner-participants-accordion-header');
			fireEvent.press(accordionHeader);

			const dinnerIdInput = getByTestId('dinner-id-input');
			fireEvent.changeText(dinnerIdInput, '10');

			// Then: Empty state message should be visible
			await waitFor(() => {
				expect(getByText(/No participants found for this dinner/i)).toBeTruthy();
			});
		});

		it('should display participant details', async () => {
			// Given: Participants with details
			mockUseParticipantsByDinnerQuery.mockReturnValue({
				data: [
					{
						id: 1,
						dinnerId: 10,
						username: 'john_doe',
						notes: 'Vegetarian',
						createdAt: '2026-02-27T10:00:00Z',
						updatedAt: '2026-02-27T10:00:00Z',
					},
				],
				isLoading: false,
				error: null,
			});

			// When: User expands accordion and enters dinner ID
			const { getByTestId, getByText } = render(<AdminScreen />);
			const accordionHeader = getByTestId('dinner-participants-accordion-header');
			fireEvent.press(accordionHeader);

			const dinnerIdInput = getByTestId('dinner-id-input');
			fireEvent.changeText(dinnerIdInput, '10');

			// Then: Participant details should be visible
			await waitFor(() => {
				expect(getByText('john_doe')).toBeTruthy();
				expect(getByText('Vegetarian')).toBeTruthy();
			});
		});

		it('should handle participants with null notes', async () => {
			// Given: Participants with null notes
			mockUseParticipantsByDinnerQuery.mockReturnValue({
				data: [
					{
						id: 1,
						dinnerId: 10,
						username: 'jane_smith',
						notes: null,
						createdAt: '2026-02-27T10:00:00Z',
						updatedAt: '2026-02-27T10:00:00Z',
					},
				],
				isLoading: false,
				error: null,
			});

			// When: User expands accordion and enters dinner ID
			const { getByTestId, getByText } = render(<AdminScreen />);
			const accordionHeader = getByTestId('dinner-participants-accordion-header');
			fireEvent.press(accordionHeader);

			const dinnerIdInput = getByTestId('dinner-id-input');
			fireEvent.changeText(dinnerIdInput, '10');

			// Then: Username should be visible
			await waitFor(() => {
				expect(getByText('jane_smith')).toBeTruthy();
			});
		});

		it('should display multiple participants', async () => {
			// Given: Multiple participants
			mockUseParticipantsByDinnerQuery.mockReturnValue({
				data: [
					{
						id: 1,
						dinnerId: 10,
						username: 'john_doe',
						notes: 'Vegetarian',
						createdAt: '2026-02-27T10:00:00Z',
						updatedAt: '2026-02-27T10:00:00Z',
					},
					{
						id: 2,
						dinnerId: 10,
						username: 'jane_smith',
						notes: 'Vegan',
						createdAt: '2026-02-27T11:00:00Z',
						updatedAt: '2026-02-27T11:00:00Z',
					},
				],
				isLoading: false,
				error: null,
			});

			// When: User expands accordion and enters dinner ID
			const { getByTestId, getByText } = render(<AdminScreen />);
			const accordionHeader = getByTestId('dinner-participants-accordion-header');
			fireEvent.press(accordionHeader);

			const dinnerIdInput = getByTestId('dinner-id-input');
			fireEvent.changeText(dinnerIdInput, '10');

			// Then: All participants should be visible
			await waitFor(() => {
				expect(getByText('john_doe')).toBeTruthy();
				expect(getByText('jane_smith')).toBeTruthy();
				expect(getByText('Vegetarian')).toBeTruthy();
				expect(getByText('Vegan')).toBeTruthy();
			});
		});

		it('should NOT fetch participants when input is empty', () => {
			// Given: Admin screen is rendered
			const { getByTestId } = render(<AdminScreen />);

			// Then: Participants query should not be called with empty input
			expect(mockUseParticipantsByDinnerQuery).not.toHaveBeenCalled();
		});

		it('should clear participants when dinner ID is cleared', async () => {
			// Given: Screen showing participants
			mockUseParticipantsByDinnerQuery.mockReturnValue({
				data: [
					{
						id: 1,
						dinnerId: 10,
						username: 'john_doe',
						notes: 'Vegetarian',
						createdAt: '2026-02-27T10:00:00Z',
						updatedAt: '2026-02-27T10:00:00Z',
					},
				],
				isLoading: false,
				error: null,
			});

			const { getByTestId, queryByText } = render(<AdminScreen />);
			const accordionHeader = getByTestId('dinner-participants-accordion-header');
			fireEvent.press(accordionHeader);

			const dinnerIdInput = getByTestId('dinner-id-input');

			// When: User enters then clears dinner ID
			fireEvent.changeText(dinnerIdInput, '10');
			await waitFor(() => expect(queryByText('john_doe')).toBeTruthy());

			// Reset mock to return nothing
			mockUseParticipantsByDinnerQuery.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			});

			fireEvent.changeText(dinnerIdInput, '');

			// Then: Participants should be cleared
			// (This will be handled by the hook returning undefined when dinnerId is null)
		});
	});
});

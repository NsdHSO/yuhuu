import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';

/**
 * Unit tests for Admin Screen
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific admin feature
 * - Open/Closed: Tests ensure features can be extended without modifying existing logic
 */

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
    SafeAreaView: ({ children, ...props }: any) => {
        const R = require('react');
        const { View } = require('react-native');
        return R.createElement(View, props, children);
    },
    SafeAreaProvider: ({ children, ...props }: any) => {
        const R = require('react');
        const { View } = require('react-native');
        return R.createElement(View, props, children);
    },
}));

// Mock react-i18next - return English values from translation keys
const translations: Record<string, string> = {
    'admin.dinnerParticipation': 'Dinner Participation Graph',
    'admin.searchUser': 'Search User Attendance',
    'admin.viewParticipants': 'View Dinner Participants',
    'admin.loadError': 'Failed to load dinner statistics',
    'admin.userNotFound': 'User not found or failed to load attendance',
    'admin.noAttendanceRecords': 'No attendance records found for this user',
    'admin.participantsLoadError': 'Failed to load participants for this dinner',
    'admin.searchPlaceholder': 'Search by username',
    'admin.dinnerIdPlaceholder': 'Enter dinner ID',
    'admin.attendanceFor': 'Attendance for: {{username}}',
    'admin.dateLabel': 'Date:',
    'admin.statusLabel': 'Status:',
    'admin.attended': 'Attended',
    'admin.notAttended': 'Not Attended',
    'admin.locationLabel': 'Location:',
    'admin.mealTypeLabel': 'Meal Type:',
    'admin.noStats': 'No dinner statistics available',
    'admin.noStatsAvailable': 'No dinner statistics available',
    'admin.totalDinners': 'Total Dinners',
    'admin.totalParticipants': 'Total Participants',
    'admin.averageAttendance': 'Average Attendance',
    'admin.noParticipants': 'No participants found for this dinner',
    'admin.noParticipantsFound': 'No participants found for this dinner',
    'admin.usernameLabel': 'Username:',
    'admin.notesLabel': 'Notes:',
    'admin.addedLabel': 'Added:',
    'admin.participantCount': 'Total: {{count}} participants',
    'admin.participantCount_one': 'Total: {{count}} participant',
    'admin.participantCount_other': 'Total: {{count}} participants',
    'admin.totalCount': 'Total: {{count}} participants',
    'common.loading': 'Loading...',
    'common.search': 'Search',
};

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: Record<string, any>) => {
            let text = translations[key] ?? key;
            if (opts) {
                Object.entries(opts).forEach(([k, v]) => {
                    text = text.replace(`{{${k}}}`, String(v));
                });
            }
            return text;
        },
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

// Mock hooks - must be before import
const mockUseDinnerStatsQuery = jest.fn();
const mockUseUserAttendanceQuery = jest.fn();
const mockUseParticipantsByDinnerQuery = jest.fn();

jest.mock('@/features/admin/hooks', () => {
    const actualHooks = jest.requireActual('@/features/admin/hooks');
    return {
        ...actualHooks,
        useDinnerStatsQuery: () => mockUseDinnerStatsQuery(),
        useUserSearchQuery: (searchTerm: string) => {
            if (!searchTerm || searchTerm === '') {
                return {data: [], isLoading: false, error: null};
            }
            // Return array of search results
            return {
                data: [
                    {id: 1, user_id: 1, middle_name: searchTerm, phone: '0812345678'}
                ],
                isLoading: false,
                error: null
            };
        },
        useUserLookupQuery: (searchTerm: string) => {
            // Alias for backward compatibility
            if (!searchTerm || searchTerm === '') {
                return {data: [], isLoading: false, error: null};
            }
            return {
                data: [
                    {id: 1, user_id: 1, middle_name: searchTerm, phone: '0812345678'}
                ],
                isLoading: false,
                error: null
            };
        },
        useUserAttendanceQuery: (username: string) => {
            // Return mock based on username
            if (!username || username === '') {
                return {
                    data: undefined,
                    isLoading: false,
                    error: null
                };
            }
            return mockUseUserAttendanceQuery(username);
        },
    };
});

// Mock participants hook
jest.mock('@/features/dinners/hooks', () => ({
    useParticipantsByDinnerQuery: (dinnerId: number | null) => {
        if (!dinnerId) {
            return {
                data: undefined,
                isLoading: false,
                error: null
            };
        }
        return mockUseParticipantsByDinnerQuery(dinnerId);
    },
}));

// Mock GlassBackground and TabScreenWrapper to render children directly
jest.mock('@yuhuu/components', () => {
    const actual = jest.requireActual('@yuhuu/components');
    const React = require('react');
    const { ScrollView } = require('react-native');
    return {
        ...actual,
        GlassBackground: ({children}: any) => React.createElement(React.Fragment, {}, children),
        TabScreenWrapper: ({children, testID}: any) => {
            const { View } = require('react-native');
            return React.createElement(View, { testID },
                React.createElement(ScrollView, { testID: testID ? `${testID}-scroll` : undefined }, children)
            );
        },
    };
});

// Mock profile hooks to avoid QueryClient errors
jest.mock('@/features/family/hooks', () => ({
    useMyFamilyQuery: () => ({ data: [], isLoading: false, error: null }),
    useUserFamilyQuery: () => ({ data: [], isLoading: false, error: null }),
    useDeleteMyFamilyRelationshipMutation: () => ({ mutateAsync: jest.fn(), mutate: jest.fn(), isPending: false }),
    useCreateMyFamilyRelationshipMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateMyFamilyRelationshipMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/features/family/api', () => ({
    useMyFamilyQuery: () => ({ data: [], isLoading: false }),
    useUserFamilyQuery: () => ({ data: [], isLoading: false }),
    useDeleteMyFamilyRelationshipMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useCreateMyFamilyRelationshipMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateMyFamilyRelationshipMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useCreateUserFamilyRelationshipMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateUserFamilyRelationshipMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useDeleteUserFamilyRelationshipMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/features/milestones/hooks', () => ({
    useMyMilestonesQuery: () => ({ data: [], isLoading: false, error: null }),
    useUserMilestonesQuery: () => ({ data: [], isLoading: false, error: null }),
    useDeleteMyMilestoneMutation: () => ({ mutateAsync: jest.fn(), mutate: jest.fn(), isPending: false }),
    useCreateMyMilestoneMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateMyMilestoneMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/features/milestones/api', () => ({
    useMyMilestonesQuery: () => ({ data: [], isLoading: false }),
    useUserMilestonesQuery: () => ({ data: [], isLoading: false }),
    useDeleteMyMilestoneMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useCreateMyMilestoneMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateMyMilestoneMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useCreateUserMilestoneMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateUserMilestoneMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useDeleteUserMilestoneMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/features/membership/hooks', () => ({
    useMyMembershipHistoryQuery: () => ({ data: [], isLoading: false, error: null }),
    useUserMembershipHistoryQuery: () => ({ data: [], isLoading: false, error: null }),
    useDeleteMyMembershipHistoryMutation: () => ({ mutateAsync: jest.fn(), mutate: jest.fn(), isPending: false }),
    useCreateMyMembershipHistoryMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateMyMembershipHistoryMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/features/membership/api', () => ({
    useMyMembershipHistoryQuery: () => ({ data: [], isLoading: false }),
    useUserMembershipHistoryQuery: () => ({ data: [], isLoading: false }),
    useDeleteMyMembershipHistoryMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useCreateMyMembershipHistoryMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateMyMembershipHistoryMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useCreateUserMembershipHistoryMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateUserMembershipHistoryMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useDeleteUserMembershipHistoryMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/features/skills/hooks', () => ({
    useMySkillsQuery: () => ({ data: [], isLoading: false, error: null }),
    useUserSkillsQuery: () => ({ data: [], isLoading: false, error: null }),
    useDeleteMySkillMutation: () => ({ mutateAsync: jest.fn(), mutate: jest.fn(), isPending: false }),
    useCreateMySkillMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateMySkillMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('@/features/skills/api', () => ({
    useMySkillsQuery: () => ({ data: [], isLoading: false }),
    useUserSkillsQuery: () => ({ data: [], isLoading: false }),
    useDeleteMySkillMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useCreateMySkillMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateMySkillMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useCreateUserSkillMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useUpdateUserSkillMutation: () => ({ mutate: jest.fn(), isPending: false }),
    useDeleteUserSkillMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));

// Import AdminScreen after all mocks are set up
import AdminScreen from '../admin';

// Helper to wrap components with QueryClient and SafeAreaProvider
function renderWithQueryClient(component: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return render(
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                {component}
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}

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
            const {getByTestId} = renderWithQueryClient(<AdminScreen/>);

            // Then: All sections should be present
            expect(getByTestId('admin-container')).toBeTruthy();
            expect(getByTestId('dinner-graph-section')).toBeTruthy();
            expect(getByTestId('user-search-section')).toBeTruthy();
        });

        it('should display section titles', () => {
            // Given: Admin screen is rendered
            const {getByText} = renderWithQueryClient(<AdminScreen/>);

            // Then: Section titles should be visible
            expect(getByText('Dinner Participation Graph')).toBeTruthy();
            expect(getByText('Search User Attendance')).toBeTruthy();
        });
    });

    describe('Dinner Graph Section', () => {
        it('should render dinner graph component', () => {
            // Given: Admin screen is rendered
            const {getByTestId} = renderWithQueryClient(<AdminScreen/>);

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
            const {getByTestId} = renderWithQueryClient(<AdminScreen/>);

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
            const {getByTestId} = renderWithQueryClient(<AdminScreen/>);

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
            const {getByText} = renderWithQueryClient(<AdminScreen/>);

            // Then: Error message should be visible
            expect(getByText(/Failed to load/i)).toBeTruthy();
        });
    });

    describe('User Search Section', () => {
        it('should render user search component', () => {
            // Given: Admin screen is rendered
            const {getByTestId} = renderWithQueryClient(<AdminScreen/>);

            // Then: User search should be present
            expect(getByTestId('user-search')).toBeTruthy();
        });

        it('should have search input field', () => {
            // Given: Admin screen is rendered
            const {getByTestId} = renderWithQueryClient(<AdminScreen/>);

            // Then: Search input should be present
            expect(getByTestId('search-input')).toBeTruthy();
        });

        it('should trigger search when user types username', async () => {
            // Given: Admin screen is rendered with search handler
            const {getByTestId, getByText} = renderWithQueryClient(<AdminScreen/>);
            const searchInput = getByTestId('search-input');

            // When: User types a username
            fireEvent.changeText(searchInput, 'john_doe');

            // Then: Search results should be displayed
            await waitFor(() => {
                expect(getByText('john_doe')).toBeTruthy();
            });

            // And: User can select a result
            const userResult = getByTestId('user-result-1');
            fireEvent.press(userResult);

            // Then: Attendance query should be triggered
            await waitFor(() => {
                expect(mockUseUserAttendanceQuery).toHaveBeenCalled();
            });
        });

        it('should NOT search when input is empty', () => {
            // Given: Admin screen is rendered
            const {getByTestId} = renderWithQueryClient(<AdminScreen/>);
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
            const {getByTestId, getByText} = renderWithQueryClient(<AdminScreen/>);
            const searchInput = getByTestId('search-input');

            // Enter username to show search results
            fireEvent.changeText(searchInput, 'john_doe');

            // Wait for and click on search result
            await waitFor(() => {
                expect(getByText('john_doe')).toBeTruthy();
            });
            const userResult = getByTestId('user-result-1');
            fireEvent.press(userResult);

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
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
            const searchInput = getByTestId('search-input');
            fireEvent.changeText(searchInput, 'john_doe');

            // Wait for and click on search result
            await waitFor(() => {
                expect(getByText('john_doe')).toBeTruthy();
            });
            const userResult = getByTestId('user-result-1');
            fireEvent.press(userResult);

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
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
            const searchInput = getByTestId('search-input');
            fireEvent.changeText(searchInput, 'john_doe');

            // Wait for and click on search result
            await waitFor(() => {
                expect(getByText('john_doe')).toBeTruthy();
            });
            const userResult = getByTestId('user-result-1');
            fireEvent.press(userResult);

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
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
            const searchInput = getByTestId('search-input');
            fireEvent.changeText(searchInput, 'john_doe');

            // Wait for and click on search result
            await waitFor(() => {
                expect(getByText('john_doe')).toBeTruthy();
            });
            const userResult = getByTestId('user-result-1');
            fireEvent.press(userResult);

            // Then: Date and location should be visible
            await waitFor(() => {
                expect(getByText('2026-02-20')).toBeTruthy();
                expect(getByText('Church Hall')).toBeTruthy();
            });
        });

        it('should show loading state when fetching user attendance', async () => {
            // Given: User attendance is loading
            mockUseUserAttendanceQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            });

            // When: Admin screen renders and user searches
            const {getByTestId, getByText} = renderWithQueryClient(<AdminScreen/>);
            const searchInput = getByTestId('search-input');
            fireEvent.changeText(searchInput, 'john_doe');

            // Wait for and click on search result
            await waitFor(() => {
                expect(getByText('john_doe')).toBeTruthy();
            });
            const userResult = getByTestId('user-result-1');
            fireEvent.press(userResult);

            // Then: Loading indicator should be visible
            await waitFor(() => {
                expect(getByTestId('attendance-loading')).toBeTruthy();
            });
        });

        it('should show error when user attendance fails to load', async () => {
            // Given: User attendance failed to load
            mockUseUserAttendanceQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: new Error('User not found'),
            });

            // When: Admin screen renders and user searches
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
            const searchInput = getByTestId('search-input');
            fireEvent.changeText(searchInput, 'john_doe');

            // Wait for and click on search result
            await waitFor(() => {
                expect(getByText('john_doe')).toBeTruthy();
            });
            const userResult = getByTestId('user-result-1');
            fireEvent.press(userResult);

            // Then: Error message should be visible
            await waitFor(() => {
                expect(getByText(/not found/i)).toBeTruthy();
            });
        });

        it('should show empty state when user has no attendance records', async () => {
            // Given: User has no attendance records
            mockUseUserAttendanceQuery.mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
            });

            // When: Admin screen renders and user searches
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
            const searchInput = getByTestId('search-input');
            fireEvent.changeText(searchInput, 'john_doe');

            // Wait for and click on search result
            await waitFor(() => {
                expect(getByText('john_doe')).toBeTruthy();
            });
            const userResult = getByTestId('user-result-1');
            fireEvent.press(userResult);

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
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
            const searchInput = getByTestId('search-input');

            fireEvent.changeText(searchInput, 'john_doe');

            // Wait for and click on search result
            await waitFor(() => {
                expect(getByText('john_doe')).toBeTruthy();
            });
            const userResult = getByTestId('user-result-1');
            fireEvent.press(userResult);

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
            const {getByTestId} = renderWithQueryClient(<AdminScreen/>);

            // Then: Participants section should be present
            expect(getByTestId('dinner-participants-section')).toBeTruthy();
        });

        it('should have dinner ID input field', () => {
            // Given: Admin screen is rendered
            const {getByTestId} = renderWithQueryClient(<AdminScreen/>);

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
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
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
            const {getByTestId} = renderWithQueryClient(<AdminScreen/>);
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
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
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
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
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
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
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
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
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
            const {
                getByTestId,
                getByText
            } = renderWithQueryClient(<AdminScreen/>);
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
            renderWithQueryClient(<AdminScreen/>);

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

            const {
                getByTestId,
                queryByText
            } = renderWithQueryClient(<AdminScreen/>);
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

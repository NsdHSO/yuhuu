import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

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

/**
 * TDD tests for Admin Screen i18n Migration
 *
 * Verifies that all hardcoded strings in admin.tsx are replaced
 * with translation keys via useTranslation().
 *
 * Translation key structure expected (from locales/en.json):
 * admin.dinnerParticipation     -> "Dinner Participation Graph"
 * admin.searchUser              -> "Search User Attendance"
 * admin.viewParticipants        -> "View Dinner Participants"
 * admin.loadError               -> "Failed to load dinner statistics"
 * admin.userNotFound            -> "User not found or failed to load attendance"
 * admin.noAttendanceRecords     -> "No attendance records found for this user"
 * admin.participantsLoadError   -> "Failed to load participants for this dinner"
 */

// --- Mock react-i18next ---
const mockT = jest.fn((key: string) => key);
const mockUseTranslation = jest.fn(() => ({
    t: mockT,
    i18n: {language: 'en', changeLanguage: jest.fn()},
}));

jest.mock('react-i18next', () => ({
    useTranslation: (...args: any[]) => mockUseTranslation(...args),
}));

// --- Mock admin hooks ---
const mockUseDinnerStatsQuery = jest.fn();
const mockUseUserAttendanceQuery = jest.fn();

jest.mock('@/features/admin/hooks', () => ({
    useDinnerStatsQuery: () => mockUseDinnerStatsQuery(),
    useUserAttendanceQuery: (username: string) => mockUseUserAttendanceQuery(username),
}));

// --- Mock dinner hooks ---
const mockUseParticipantsByDinnerQuery = jest.fn();

jest.mock('@/features/dinners/hooks', () => ({
    useParticipantsByDinnerQuery: (dinnerId: number | null) => mockUseParticipantsByDinnerQuery(dinnerId),
}));

// --- Mock shared components ---
jest.mock('@yuhuu/components', () => ({
    ...jest.requireActual('@yuhuu/components'),
    DinnerGraph: () => null,
    DinnerAttendance: () => null,
    GlassAccordion: ({title, children}: any) => {
        const React = require('react');
        const {View, Text} = require('react-native');
        return React.createElement(View, null,
            React.createElement(Text, null, title),
            children
        );
    },
    DinnerIdSearch: ({onDinnerIdChange}: any) => {
        const React = require('react');
        const {Pressable} = require('react-native');
        return React.createElement(Pressable, {
            testID: 'dinner-id-trigger',
            onPress: () => onDinnerIdChange(1),
        });
    },
    ParticipantsList: () => null,
    TabScreenWrapper: ({children, testID}: any) => {
        const React = require('react');
        const {ScrollView} = require('react-native');
        return React.createElement(ScrollView, {testID: testID ? `${testID}-scroll` : undefined}, children);
    },
}));

// --- Mock app-specific admin components ---
jest.mock('@/components/admin/user-search', () => ({
    UserSearch: ({onSearch}: any) => {
        const React = require('react');
        const {Pressable} = require('react-native');
        return React.createElement(Pressable, {
            testID: 'user-search-trigger',
            onPress: () => onSearch({id: 1, username: 'testuser'}),
        });
    },
}));

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

describe('AdminScreen - i18n Migration', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Re-initialize mock return values after clearing
        mockUseTranslation.mockReturnValue({
            t: mockT,
            i18n: {language: 'en', changeLanguage: jest.fn()},
        });
        mockT.mockImplementation((key: string) => key);

        mockUseDinnerStatsQuery.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
        });
        mockUseUserAttendanceQuery.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
        });
        mockUseParticipantsByDinnerQuery.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
        });
    });

    describe('useTranslation hook integration', () => {
        it('should call useTranslation to get the t function', () => {
            const AdminScreen = require('../admin').default;
            render(
                <SafeAreaProvider>
                    <AdminScreen/>
                </SafeAreaProvider>
            );

            expect(mockUseTranslation).toHaveBeenCalled();
        });
    });

    describe('Accordion title strings', () => {
        it('should use t() for "Dinner Participation Graph" accordion title', () => {
            const AdminScreen = require('../admin').default;
            render(
                <SafeAreaProvider>
                    <AdminScreen/>
                </SafeAreaProvider>
            );

            expect(mockT).toHaveBeenCalledWith('admin.dinnerParticipation');
        });

        it('should use t() for "Search User Attendance" accordion title', () => {
            const AdminScreen = require('../admin').default;
            render(
                <SafeAreaProvider>
                    <AdminScreen/>
                </SafeAreaProvider>
            );

            expect(mockT).toHaveBeenCalledWith('admin.searchUser');
        });

        it('should use t() for "View Dinner Participants" accordion title', () => {
            const AdminScreen = require('../admin').default;
            render(
                <SafeAreaProvider>
                    <AdminScreen/>
                </SafeAreaProvider>
            );

            expect(mockT).toHaveBeenCalledWith('admin.viewParticipants');
        });
    });

    describe('Error state strings', () => {
        it('should use t() for dinner stats load error', () => {
            mockUseDinnerStatsQuery.mockReturnValue({
                data: null,
                isLoading: false,
                error: new Error('Failed'),
            });

            const AdminScreen = require('../admin').default;
            render(
                <SafeAreaProvider>
                    <AdminScreen/>
                </SafeAreaProvider>
            );

            expect(mockT).toHaveBeenCalledWith('admin.loadError');
        });

        it('should use t() for user attendance error', () => {
            mockUseUserAttendanceQuery.mockReturnValue({
                data: null,
                isLoading: false,
                error: new Error('Not found'),
            });

            const AdminScreen = require('../admin').default;
            const {getByTestId} = render(
                <SafeAreaProvider>
                    <AdminScreen/>
                </SafeAreaProvider>
            );

            // Trigger a search to set searchedUsername state, which shows the error branch
            fireEvent.press(getByTestId('user-search-trigger'));

            expect(mockT).toHaveBeenCalledWith('admin.userNotFound');
        });

        it('should use t() for participants load error', () => {
            mockUseParticipantsByDinnerQuery.mockReturnValue({
                data: null,
                isLoading: false,
                error: new Error('Failed'),
            });

            const AdminScreen = require('../admin').default;
            const {getByTestId} = render(
                <SafeAreaProvider>
                    <AdminScreen/>
                </SafeAreaProvider>
            );

            // Trigger dinner ID selection to set selectedDinnerId state, which shows the error branch
            fireEvent.press(getByTestId('dinner-id-trigger'));

            expect(mockT).toHaveBeenCalledWith('admin.participantsLoadError');
        });
    });

    describe('Empty state strings', () => {
        it('should use t() for no attendance records message', () => {
            mockUseUserAttendanceQuery.mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
            });

            const AdminScreen = require('../admin').default;
            const {getByTestId} = render(
                <SafeAreaProvider>
                    <AdminScreen/>
                </SafeAreaProvider>
            );

            // Trigger a search to set searchedUsername state, which shows the empty state branch
            fireEvent.press(getByTestId('user-search-trigger'));

            expect(mockT).toHaveBeenCalledWith('admin.noAttendanceRecords');
        });
    });

    describe('No hardcoded user-facing strings remain', () => {
        it('should not contain any of the original hardcoded English strings in rendered output', () => {
            // Configure mockT to return prefixed keys so hardcoded strings would be detectable
            mockT.mockImplementation((key: string) => `__${key}__`);

            // Set up error states to render all possible strings
            mockUseDinnerStatsQuery.mockReturnValue({
                data: null,
                isLoading: false,
                error: new Error('Failed'),
            });

            const AdminScreen = require('../admin').default;
            const {queryByText} = render(
                <SafeAreaProvider>
                    <AdminScreen/>
                </SafeAreaProvider>
            );

            const hardcodedStrings = [
                'Dinner Participation Graph',
                'Search User Attendance',
                'View Dinner Participants',
                'Failed to load dinner statistics',
                'User not found or failed to load attendance',
                'No attendance records found for this user',
                'Failed to load participants for this dinner',
            ];

            for (const str of hardcodedStrings) {
                expect(queryByText(str)).toBeNull();
            }
        });
    });
});

/**
 * Profile Features Integration Tests
 *
 * Tests the complete flow of profile features:
 * 1. Bootstrap → Profile creation flow
 * 2. All 409 conflict scenarios
 * 3. Cross-feature interactions
 */

import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {useMyProfileQuery, useSaveMyProfileMutation} from '../profile/hooks';
import {useCreateMyMilestoneMutation} from '../milestones/hooks';
import {useCreateMySkillMutation} from '../skills/hooks';
import {useCreateMyMembershipHistoryMutation} from '../membership/hooks';
import {bootstrapAndSeed} from '../bootstrap/api';
import type {ProfileRepository} from '../profile/repository';
import type {MilestonesRepository} from '../milestones/repository';
import type {SkillsRepository} from '../skills/repository';
import type {MembershipRepository} from '../membership/repository';

// Mock bootstrap service
jest.mock('../bootstrap/api', () => ({
    bootstrapAndSeed: jest.fn(),
    defaultBootstrapRepository: {},
}));

describe('Profile Features Integration', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;

    const mockProfileRepo: ProfileRepository = {
        getMyProfile: jest.fn(),
        createMyProfile: jest.fn(),
        updateMyProfile: jest.fn(),
    };

    const mockMilestonesRepo: MilestonesRepository = {
        listMyMilestones: jest.fn(),
        getMyMilestone: jest.fn(),
        createMyMilestone: jest.fn(),
        updateMyMilestone: jest.fn(),
        deleteMyMilestone: jest.fn(),
    };

    const mockSkillsRepo: SkillsRepository = {
        listMySkills: jest.fn(),
        getMySkill: jest.fn(),
        createMySkill: jest.fn(),
        updateMySkill: jest.fn(),
        deleteMySkill: jest.fn(),
    };

    const mockMembershipRepo: MembershipRepository = {
        listMyMembershipHistory: jest.fn(),
        getMyMembershipHistory: jest.fn(),
        createMyMembershipHistory: jest.fn(),
        updateMyMembershipHistory: jest.fn(),
        deleteMyMembershipHistory: jest.fn(),
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {retry: false},
                mutations: {retry: false},
            },
        });
        wrapper = ({children}) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
        jest.clearAllMocks();
    });

    afterEach(() => {
        queryClient.clear();
    });

    describe('Bootstrap → Profile Creation Flow', () => {
        it('should create profile and trigger bootstrap reseed', async () => {
            const profileInput = {
                middle_name: 'John',
                phone: '555-1234',
                education_level: 'Bachelor' as const,
            };

            const mockCreatedProfile = {
                id: 1,
                user_id: 10,
                ...profileInput,
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            const mockBootstrapData = {
                user: {id: 10, auth_user_id: 'uuid', created_at: '2024-01-01', updated_at: '2024-01-01'},
                profile: mockCreatedProfile,
                roles: [],
                created: {linked: false, profile: true},
            };

            (mockProfileRepo.createMyProfile as jest.Mock).mockResolvedValue(mockCreatedProfile);
            (bootstrapAndSeed as jest.Mock).mockResolvedValue(mockBootstrapData);

            const {result: mutationResult} = renderHook(
                () => useSaveMyProfileMutation(mockProfileRepo),
                {wrapper}
            );

            mutationResult.current.mutate({mode: 'create', ...profileInput});

            await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

            // Verify profile was created
            expect(mockProfileRepo.createMyProfile).toHaveBeenCalledWith(profileInput);

            // Verify bootstrap was called to reseed cache
            expect(bootstrapAndSeed).toHaveBeenCalledWith(queryClient, expect.anything());

            // Verify profile query now reads from seeded cache
            const {result: queryResult} = renderHook(() => useMyProfileQuery(), {wrapper});

            // Cache should be seeded by bootstrap
            expect(queryResult.current.isLoading).toBe(false);
        });

        it('should update profile and trigger bootstrap reseed', async () => {
            const profileUpdate = {
                phone: '555-9999',
                occupation: 'Senior Engineer',
            };

            const mockUpdatedProfile = {
                id: 1,
                user_id: 10,
                middle_name: 'John',
                phone: '555-9999',
                occupation: 'Senior Engineer',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            const mockBootstrapData = {
                user: {id: 10, auth_user_id: 'uuid', created_at: '2024-01-01', updated_at: '2024-01-01'},
                profile: mockUpdatedProfile,
                roles: [],
                created: {linked: false, profile: false},
            };

            (mockProfileRepo.updateMyProfile as jest.Mock).mockResolvedValue(mockUpdatedProfile);
            (bootstrapAndSeed as jest.Mock).mockResolvedValue(mockBootstrapData);

            const {result} = renderHook(() => useSaveMyProfileMutation(mockProfileRepo), {wrapper});

            result.current.mutate({mode: 'update', ...profileUpdate});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockProfileRepo.updateMyProfile).toHaveBeenCalledWith(profileUpdate);
            expect(bootstrapAndSeed).toHaveBeenCalledWith(queryClient, expect.anything());
        });
    });

    describe('409 Conflict Scenarios', () => {
        it('should handle duplicate milestone type conflict', async () => {
            const milestoneInput = {
                milestone_type: 'baptism' as const,
                milestone_date: '2020-06-15',
            };

            const conflictError = {
                response: {
                    status: 409,
                    data: {message: 'Duplicate milestone type "baptism"'},
                },
            };

            (mockMilestonesRepo.createMyMilestone as jest.Mock).mockRejectedValue(conflictError);

            const {result} = renderHook(
                () => useCreateMyMilestoneMutation(mockMilestonesRepo),
                {wrapper}
            );

            result.current.mutate(milestoneInput);

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(conflictError);
            expect((result.current.error as any)?.response?.status).toBe(409);
        });

        it('should handle duplicate skill name conflict', async () => {
            const skillInput = {
                skill_name: 'Piano',
                skill_category: 'Music' as const,
            };

            const conflictError = {
                response: {
                    status: 409,
                    data: {message: 'Duplicate skill "Piano"'},
                },
            };

            (mockSkillsRepo.createMySkill as jest.Mock).mockRejectedValue(conflictError);

            const {result} = renderHook(() => useCreateMySkillMutation(mockSkillsRepo), {wrapper});

            result.current.mutate(skillInput);

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(conflictError);
            expect((result.current.error as any)?.response?.status).toBe(409);
        });

        it('should handle multiple active memberships conflict', async () => {
            const membershipInput = {
                church_name: 'Second Baptist Church',
                start_date: '2024-01-01',
                end_date: null, // Attempting to create another active membership
            };

            const conflictError = {
                response: {
                    status: 409,
                    data: {message: 'Active membership already exists'},
                },
            };

            (mockMembershipRepo.createMyMembershipHistory as jest.Mock).mockRejectedValue(conflictError);

            const {result} = renderHook(
                () => useCreateMyMembershipHistoryMutation(mockMembershipRepo),
                {wrapper}
            );

            result.current.mutate(membershipInput);

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(conflictError);
            expect((result.current.error as any)?.response?.status).toBe(409);
        });
    });

    describe('Cross-Feature Interactions', () => {
        it('should independently manage different feature caches', async () => {
            // Seed profile cache
            const mockProfile = {
                id: 1,
                user_id: 10,
                middle_name: 'John',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };
            queryClient.setQueryData(['me', 'profile'], mockProfile);

            // Profile query should read from cache
            const profileQuery = renderHook(() => useMyProfileQuery(), {wrapper});
            expect(profileQuery.result.current.data).toEqual(mockProfile);

            // Creating a milestone should NOT affect profile cache
            const milestoneInput = {milestone_type: 'conversion' as const};
            const mockCreatedMilestone = {
                id: 1,
                user_id: 10,
                milestone_type: 'conversion' as const,
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            (mockMilestonesRepo.createMyMilestone as jest.Mock).mockResolvedValue(mockCreatedMilestone);

            const milestoneMutation = renderHook(
                () => useCreateMyMilestoneMutation(mockMilestonesRepo),
                {wrapper}
            );

            milestoneMutation.result.current.mutate(milestoneInput);

            await waitFor(() => expect(milestoneMutation.result.current.isSuccess).toBe(true));

            // Profile cache should remain unchanged
            expect(queryClient.getQueryData(['me', 'profile'])).toEqual(mockProfile);

            // Bootstrap should NOT have been called for milestone mutation
            expect(bootstrapAndSeed).not.toHaveBeenCalled();
        });

        it('should maintain independent query states for each feature', () => {
            // Each feature should have its own query key namespace
            const profileData = {id: 1, user_id: 10};
            const familyData = [{id: 1, user_id: 10, relationship_type: 'spouse' as const}];
            const milestonesData = [{id: 1, user_id: 10, milestone_type: 'baptism' as const}];
            const skillsData = [{id: 1, user_id: 10, skill_name: 'Piano', is_willing_to_serve: true}];

            queryClient.setQueryData(['me', 'profile'], profileData);
            queryClient.setQueryData(['me', 'family'], familyData);
            queryClient.setQueryData(['me', 'milestones'], milestonesData);
            queryClient.setQueryData(['me', 'skills'], skillsData);

            // All queries should maintain their own state
            expect(queryClient.getQueryData(['me', 'profile'])).toEqual(profileData);
            expect(queryClient.getQueryData(['me', 'family'])).toEqual(familyData);
            expect(queryClient.getQueryData(['me', 'milestones'])).toEqual(milestonesData);
            expect(queryClient.getQueryData(['me', 'skills'])).toEqual(skillsData);
        });
    });
});

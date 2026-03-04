/**
 * Profile Hooks Tests
 *
 * Test Coverage:
 * - useMyProfileQuery: reads from seeded cache, never fetches
 * - useSaveMyProfileMutation: create/update modes, bootstrapAndSeed on success
 */

import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {useMyProfileQuery, useSaveMyProfileMutation} from '../hooks';
import type {ProfileRepository} from '../repository';
import type {ProfileInput, ProfileResponse} from '../types';
import {bootstrapAndSeed} from '../../bootstrap/api';

// Mock bootstrap service
jest.mock('../../bootstrap/api', () => ({
    bootstrapAndSeed: jest.fn(),
    defaultBootstrapRepository: {},
}));

describe('Profile Hooks', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;

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

    describe('useMyProfileQuery', () => {
        it('should return null when cache is not seeded', () => {
            const {result} = renderHook(() => useMyProfileQuery(), {wrapper});

            expect(result.current.data).toBeUndefined();
            expect(result.current.isLoading).toBe(false);
        });

        it('should return profile when cache is seeded', () => {
            const mockProfile: ProfileResponse = {
                id: 1,
                user_id: 10,
                middle_name: 'John',
                phone: '555-1234',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };

            // Seed the cache (simulating bootstrap)
            queryClient.setQueryData(['me', 'profile'], mockProfile);

            const {result} = renderHook(() => useMyProfileQuery(), {wrapper});

            expect(result.current.data).toEqual(mockProfile);
            expect(result.current.isSuccess).toBe(true);
        });

        it('should return null when user has no profile', () => {
            // Seed cache with null (simulating bootstrap for user without profile)
            queryClient.setQueryData(['me', 'profile'], null);

            const {result} = renderHook(() => useMyProfileQuery(), {wrapper});

            expect(result.current.data).toBeNull();
            expect(result.current.isSuccess).toBe(true);
        });

        it('should never trigger queryFn (bootstrap-only)', () => {
            const {result} = renderHook(() => useMyProfileQuery(), {wrapper});

            // Verify query is disabled and won't fetch
            expect(result.current.fetchStatus).toBe('idle');
            expect(result.current.isLoading).toBe(false);
        });

        it('should have infinite stale time', () => {
            const mockProfile: ProfileResponse = {
                id: 1,
                user_id: 10,
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };

            queryClient.setQueryData(['me', 'profile'], mockProfile);

            const {result} = renderHook(() => useMyProfileQuery(), {wrapper});

            // Data should never be considered stale
            expect(result.current.isStale).toBe(false);
        });
    });

    describe('useSaveMyProfileMutation', () => {
        const mockRepo: ProfileRepository = {
            getMyProfile: jest.fn(),
            createMyProfile: jest.fn(),
            updateMyProfile: jest.fn(),
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should create profile when mode is "create"', async () => {
            const input: ProfileInput = {
                middle_name: 'Jane',
                phone: '555-5678',
            };

            const mockCreatedProfile: ProfileResponse = {
                id: 2,
                user_id: 20,
                ...input,
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            (mockRepo.createMyProfile as jest.Mock).mockResolvedValue(mockCreatedProfile);
            (bootstrapAndSeed as jest.Mock).mockResolvedValue({
                user: {id: 20},
                profile: mockCreatedProfile,
            });

            const {result} = renderHook(() => useSaveMyProfileMutation(mockRepo), {wrapper});

            result.current.mutate({mode: 'create', ...input});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.createMyProfile).toHaveBeenCalledWith(input);
            expect(mockRepo.updateMyProfile).not.toHaveBeenCalled();
            expect(bootstrapAndSeed).toHaveBeenCalledWith(queryClient, expect.anything());
        });

        it('should update profile when mode is "update"', async () => {
            const input: ProfileInput = {
                phone: '555-9999',
            };

            const mockUpdatedProfile: ProfileResponse = {
                id: 1,
                user_id: 10,
                phone: '555-9999',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            (mockRepo.updateMyProfile as jest.Mock).mockResolvedValue(mockUpdatedProfile);
            (bootstrapAndSeed as jest.Mock).mockResolvedValue({
                user: {id: 10},
                profile: mockUpdatedProfile,
            });

            const {result} = renderHook(() => useSaveMyProfileMutation(mockRepo), {wrapper});

            result.current.mutate({mode: 'update', ...input});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.updateMyProfile).toHaveBeenCalledWith(input);
            expect(mockRepo.createMyProfile).not.toHaveBeenCalled();
            expect(bootstrapAndSeed).toHaveBeenCalledWith(queryClient, expect.anything());
        });

        it('should default to update when mode is omitted', async () => {
            const input: ProfileInput = {occupation: 'Engineer'};

            const mockUpdatedProfile: ProfileResponse = {
                id: 1,
                user_id: 10,
                occupation: 'Engineer',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            (mockRepo.updateMyProfile as jest.Mock).mockResolvedValue(mockUpdatedProfile);
            (bootstrapAndSeed as jest.Mock).mockResolvedValue({
                user: {id: 10},
                profile: mockUpdatedProfile,
            });

            const {result} = renderHook(() => useSaveMyProfileMutation(mockRepo), {wrapper});

            result.current.mutate(input);

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.updateMyProfile).toHaveBeenCalledWith(input);
        });

        it('should handle mutation errors', async () => {
            const input: ProfileInput = {phone: '555-1111'};
            const error = new Error('Profile already exists');

            (mockRepo.createMyProfile as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useSaveMyProfileMutation(mockRepo), {wrapper});

            result.current.mutate({mode: 'create', ...input});

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
            expect(bootstrapAndSeed).not.toHaveBeenCalled();
        });

        it('should not call bootstrapAndSeed if mutation fails', async () => {
            const input: ProfileInput = {phone: 'invalid'};

            (mockRepo.updateMyProfile as jest.Mock).mockRejectedValue(new Error('Validation error'));

            const {result} = renderHook(() => useSaveMyProfileMutation(mockRepo), {wrapper});

            result.current.mutate({mode: 'update', ...input});

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(bootstrapAndSeed).not.toHaveBeenCalled();
        });
    });
});

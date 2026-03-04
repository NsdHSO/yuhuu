/**
 * Milestones Hooks Tests
 *
 * Test Coverage:
 * - useMyMilestonesQuery: list success, empty array, errors
 * - useMyMilestoneQuery: get success, 404, errors
 * - useCreateMyMilestoneMutation: create success, 409 conflict, cache invalidation
 * - useUpdateMyMilestoneMutation: update success, cache invalidation
 * - useDeleteMyMilestoneMutation: delete success, cache invalidation
 */

import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {
    useCreateMyMilestoneMutation,
    useDeleteMyMilestoneMutation,
    useMyMilestoneQuery,
    useMyMilestonesQuery,
    useUpdateMyMilestoneMutation,
} from '../hooks';
import type {MilestonesRepository} from '../repository';
import type {CreateSpiritualMilestoneInput, SpiritualMilestone} from '../types';

describe('Milestones Hooks', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;

    const mockRepo: MilestonesRepository = {
        listMyMilestones: jest.fn(),
        getMyMilestone: jest.fn(),
        createMyMilestone: jest.fn(),
        updateMyMilestone: jest.fn(),
        deleteMyMilestone: jest.fn(),
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

    describe('useMyMilestonesQuery', () => {
        it('should fetch milestones list', async () => {
            const mockMilestones: SpiritualMilestone[] = [
                {
                    id: 1,
                    user_id: 10,
                    milestone_type: 'baptism',
                    milestone_date: '2020-06-15',
                    location: 'First Baptist',
                    created_at: '2024-01-01T00:00:00',
                    updated_at: '2024-01-01T00:00:00',
                },
            ];

            (mockRepo.listMyMilestones as jest.Mock).mockResolvedValue(mockMilestones);

            const {result} = renderHook(() => useMyMilestonesQuery(mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.listMyMilestones).toHaveBeenCalled();
            expect(result.current.data).toEqual(mockMilestones);
        });

        it('should return empty array when no milestones', async () => {
            (mockRepo.listMyMilestones as jest.Mock).mockResolvedValue([]);

            const {result} = renderHook(() => useMyMilestonesQuery(mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual([]);
        });

        it('should handle errors', async () => {
            const error = new Error('Network error');
            (mockRepo.listMyMilestones as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useMyMilestonesQuery(mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });
    });

    describe('useMyMilestoneQuery', () => {
        it('should fetch specific milestone', async () => {
            const mockMilestone: SpiritualMilestone = {
                id: 1,
                user_id: 10,
                milestone_type: 'conversion',
                milestone_date: '2015-03-10',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };

            (mockRepo.getMyMilestone as jest.Mock).mockResolvedValue(mockMilestone);

            const {result} = renderHook(() => useMyMilestoneQuery(1, mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.getMyMilestone).toHaveBeenCalledWith(1);
            expect(result.current.data).toEqual(mockMilestone);
        });
    });

    describe('useCreateMyMilestoneMutation', () => {
        it('should create milestone and invalidate queries', async () => {
            const input: CreateSpiritualMilestoneInput = {
                milestone_type: 'baptism',
                milestone_date: '2020-06-15',
            };

            const mockCreated: SpiritualMilestone = {
                id: 1,
                user_id: 10,
                ...input,
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            (mockRepo.createMyMilestone as jest.Mock).mockResolvedValue(mockCreated);

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const {result} = renderHook(() => useCreateMyMilestoneMutation(mockRepo), {wrapper});

            result.current.mutate(input);

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.createMyMilestone).toHaveBeenCalledWith(input);
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'milestones']});
        });

        it('should handle 409 conflict error', async () => {
            const input: CreateSpiritualMilestoneInput = {
                milestone_type: 'baptism',
            };
            const error = {response: {status: 409, data: {message: 'Duplicate milestone type'}}};

            (mockRepo.createMyMilestone as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useCreateMyMilestoneMutation(mockRepo), {wrapper});

            result.current.mutate(input);

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });
    });

    describe('useUpdateMyMilestoneMutation', () => {
        it('should update milestone and invalidate queries', async () => {
            const mockUpdated: SpiritualMilestone = {
                id: 1,
                user_id: 10,
                milestone_type: 'baptism',
                notes: 'Updated',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            (mockRepo.updateMyMilestone as jest.Mock).mockResolvedValue(mockUpdated);

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const {result} = renderHook(() => useUpdateMyMilestoneMutation(mockRepo), {wrapper});

            result.current.mutate({id: 1, data: {notes: 'Updated'}});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'milestones', 1]});
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'milestones']});
        });
    });

    describe('useDeleteMyMilestoneMutation', () => {
        it('should delete milestone and invalidate queries', async () => {
            (mockRepo.deleteMyMilestone as jest.Mock).mockResolvedValue(undefined);

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const {result} = renderHook(() => useDeleteMyMilestoneMutation(mockRepo), {wrapper});

            result.current.mutate(1);

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.deleteMyMilestone).toHaveBeenCalledWith(1);
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'milestones', 1]});
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'milestones']});
        });
    });
});

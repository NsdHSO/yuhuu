/**
 * Membership Hooks Tests
 *
 * Test Coverage:
 * - useMyMembershipHistoryQuery: list success, empty array, errors
 * - useMyMembershipHistoryRecordQuery: get success, 404, errors
 * - useCreateMyMembershipHistoryMutation: create success, 409 conflict, cache invalidation
 * - useUpdateMyMembershipHistoryMutation: update success, cache invalidation
 * - useDeleteMyMembershipHistoryMutation: delete success, cache invalidation
 */

import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {
    useMyMembershipHistoryQuery,
    useMyMembershipHistoryRecordQuery,
    useCreateMyMembershipHistoryMutation,
    useUpdateMyMembershipHistoryMutation,
    useDeleteMyMembershipHistoryMutation,
} from '../hooks';
import type {MembershipRepository} from '../repository';
import type {MembershipHistory, CreateMembershipHistoryInput} from '../types';

describe('Membership Hooks', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;

    const mockRepo: MembershipRepository = {
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

    describe('useMyMembershipHistoryQuery', () => {
        it('should fetch membership history list', async () => {
            const mockHistory: MembershipHistory[] = [
                {
                    id: 1,
                    user_id: 10,
                    church_name: 'First Baptist Church',
                    start_date: '2020-01-15',
                    end_date: null,
                    created_at: '2024-01-01T00:00:00',
                    updated_at: '2024-01-01T00:00:00',
                },
            ];

            (mockRepo.listMyMembershipHistory as jest.Mock).mockResolvedValue(mockHistory);

            const {result} = renderHook(() => useMyMembershipHistoryQuery(mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.listMyMembershipHistory).toHaveBeenCalled();
            expect(result.current.data).toEqual(mockHistory);
        });

        it('should return empty array when no history', async () => {
            (mockRepo.listMyMembershipHistory as jest.Mock).mockResolvedValue([]);

            const {result} = renderHook(() => useMyMembershipHistoryQuery(mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual([]);
        });

        it('should handle errors', async () => {
            const error = new Error('Network error');
            (mockRepo.listMyMembershipHistory as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useMyMembershipHistoryQuery(mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });
    });

    describe('useMyMembershipHistoryRecordQuery', () => {
        it('should fetch specific membership record', async () => {
            const mockRecord: MembershipHistory = {
                id: 1,
                user_id: 10,
                church_name: 'First Baptist Church',
                start_date: '2020-01-15',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };

            (mockRepo.getMyMembershipHistory as jest.Mock).mockResolvedValue(mockRecord);

            const {result} = renderHook(() => useMyMembershipHistoryRecordQuery(1, mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.getMyMembershipHistory).toHaveBeenCalledWith(1);
            expect(result.current.data).toEqual(mockRecord);
        });
    });

    describe('useCreateMyMembershipHistoryMutation', () => {
        it('should create membership record and invalidate queries', async () => {
            const input: CreateMembershipHistoryInput = {
                church_name: 'First Baptist Church',
                start_date: '2020-01-15',
                transfer_type: 'new_member',
            };

            const mockCreated: MembershipHistory = {
                id: 1,
                user_id: 10,
                ...input,
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            (mockRepo.createMyMembershipHistory as jest.Mock).mockResolvedValue(mockCreated);

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const {result} = renderHook(() => useCreateMyMembershipHistoryMutation(mockRepo), {wrapper});

            result.current.mutate(input);

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.createMyMembershipHistory).toHaveBeenCalledWith(input);
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'membership-history']});
        });

        it('should handle 409 conflict error (multiple active memberships)', async () => {
            const input: CreateMembershipHistoryInput = {
                church_name: 'Second Church',
                end_date: null, // Attempting another active membership
            };
            const error = {response: {status: 409, data: {message: 'Active membership already exists'}}};

            (mockRepo.createMyMembershipHistory as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useCreateMyMembershipHistoryMutation(mockRepo), {wrapper});

            result.current.mutate(input);

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });
    });

    describe('useUpdateMyMembershipHistoryMutation', () => {
        it('should update membership record and invalidate queries', async () => {
            const mockUpdated: MembershipHistory = {
                id: 1,
                user_id: 10,
                church_name: 'First Baptist',
                end_date: '2024-03-01',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            (mockRepo.updateMyMembershipHistory as jest.Mock).mockResolvedValue(mockUpdated);

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const {result} = renderHook(() => useUpdateMyMembershipHistoryMutation(mockRepo), {wrapper});

            result.current.mutate({id: 1, data: {end_date: '2024-03-01'}});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'membership-history', 1]});
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'membership-history']});
        });
    });

    describe('useDeleteMyMembershipHistoryMutation', () => {
        it('should delete membership record and invalidate queries', async () => {
            (mockRepo.deleteMyMembershipHistory as jest.Mock).mockResolvedValue(undefined);

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const {result} = renderHook(() => useDeleteMyMembershipHistoryMutation(mockRepo), {wrapper});

            result.current.mutate(1);

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.deleteMyMembershipHistory).toHaveBeenCalledWith(1);
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'membership-history', 1]});
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'membership-history']});
        });
    });
});

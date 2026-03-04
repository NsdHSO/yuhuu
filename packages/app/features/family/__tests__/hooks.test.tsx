/**
 * Family Hooks Tests
 *
 * Test Coverage:
 * - useMyFamilyQuery: list success, empty array, errors
 * - useMyFamilyRelationshipQuery: get success, 404, errors
 * - useCreateMyFamilyRelationshipMutation: create success, cache invalidation, errors
 * - useUpdateMyFamilyRelationshipMutation: update success, cache invalidation, errors
 * - useDeleteMyFamilyRelationshipMutation: delete success, cache invalidation, errors
 */

import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {
    useCreateMyFamilyRelationshipMutation,
    useDeleteMyFamilyRelationshipMutation,
    useMyFamilyQuery,
    useMyFamilyRelationshipQuery,
    useUpdateMyFamilyRelationshipMutation,
} from '../hooks';
import type {FamilyRepository} from '../repository';
import type {CreateFamilyRelationshipInput, FamilyRelationship, UpdateFamilyRelationshipInput} from '../types';

describe('Family Hooks', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;

    const mockRepo: FamilyRepository = {
        listMyFamily: jest.fn(),
        getMyFamilyRelationship: jest.fn(),
        createMyFamilyRelationship: jest.fn(),
        updateMyFamilyRelationship: jest.fn(),
        deleteMyFamilyRelationship: jest.fn(),
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

    describe('useMyFamilyQuery', () => {
        it('should fetch family relationships list', async () => {
            const mockFamily: FamilyRelationship[] = [
                {
                    id: 1,
                    user_id: 10,
                    related_user_id: 20,
                    relationship_type: 'spouse',
                    created_at: '2024-01-01T00:00:00',
                    updated_at: '2024-01-01T00:00:00',
                },
            ];

            (mockRepo.listMyFamily as jest.Mock).mockResolvedValue(mockFamily);

            const {result} = renderHook(() => useMyFamilyQuery(mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.listMyFamily).toHaveBeenCalled();
            expect(result.current.data).toEqual(mockFamily);
        });

        it('should return empty array when no family relationships', async () => {
            (mockRepo.listMyFamily as jest.Mock).mockResolvedValue([]);

            const {result} = renderHook(() => useMyFamilyQuery(mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual([]);
        });

        it('should handle errors', async () => {
            const error = new Error('Network error');
            (mockRepo.listMyFamily as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useMyFamilyQuery(mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });
    });

    describe('useMyFamilyRelationshipQuery', () => {
        it('should fetch specific family relationship', async () => {
            const mockRelationship: FamilyRelationship = {
                id: 1,
                user_id: 10,
                related_user_id: 20,
                relationship_type: 'spouse',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };

            (mockRepo.getMyFamilyRelationship as jest.Mock).mockResolvedValue(mockRelationship);

            const {result} = renderHook(() => useMyFamilyRelationshipQuery(1, mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.getMyFamilyRelationship).toHaveBeenCalledWith(1);
            expect(result.current.data).toEqual(mockRelationship);
        });

        it('should return null when relationship not found (404)', async () => {
            (mockRepo.getMyFamilyRelationship as jest.Mock).mockResolvedValue(null);

            const {result} = renderHook(() => useMyFamilyRelationshipQuery(999, mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toBeNull();
        });

        it('should handle errors', async () => {
            const error = new Error('Server error');
            (mockRepo.getMyFamilyRelationship as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useMyFamilyRelationshipQuery(1, mockRepo), {wrapper});

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });
    });

    describe('useCreateMyFamilyRelationshipMutation', () => {
        it('should create family relationship and invalidate queries', async () => {
            const input: CreateFamilyRelationshipInput = {
                related_user_id: 20,
                relationship_type: 'spouse',
            };

            const mockCreated: FamilyRelationship = {
                id: 1,
                user_id: 10,
                related_user_id: 20,
                relationship_type: 'spouse',
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            (mockRepo.createMyFamilyRelationship as jest.Mock).mockResolvedValue(mockCreated);

            // Spy on invalidateQueries
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const {result} = renderHook(() => useCreateMyFamilyRelationshipMutation(mockRepo), {wrapper});

            result.current.mutate(input);

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.createMyFamilyRelationship).toHaveBeenCalledWith(input);
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'family']});
        });

        it('should handle creation errors', async () => {
            const input: CreateFamilyRelationshipInput = {
                relationship_type: 'spouse',
            };
            const error = new Error('Validation error');

            (mockRepo.createMyFamilyRelationship as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useCreateMyFamilyRelationshipMutation(mockRepo), {wrapper});

            result.current.mutate(input);

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });
    });

    describe('useUpdateMyFamilyRelationshipMutation', () => {
        it('should update family relationship and invalidate queries', async () => {
            const input: UpdateFamilyRelationshipInput = {
                related_person_phone: '555-9999',
            };

            const mockUpdated: FamilyRelationship = {
                id: 1,
                user_id: 10,
                related_person_name: 'John Doe',
                related_person_phone: '555-9999',
                relationship_type: 'child',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            (mockRepo.updateMyFamilyRelationship as jest.Mock).mockResolvedValue(mockUpdated);

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const {result} = renderHook(() => useUpdateMyFamilyRelationshipMutation(mockRepo), {wrapper});

            result.current.mutate({id: 1, data: input});

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.updateMyFamilyRelationship).toHaveBeenCalledWith(1, input);
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'family', 1]});
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'family']});
        });

        it('should handle update errors (404)', async () => {
            const input: UpdateFamilyRelationshipInput = {relationship_type: 'sibling'};
            const error = {response: {status: 404, data: {message: 'Not found'}}};

            (mockRepo.updateMyFamilyRelationship as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useUpdateMyFamilyRelationshipMutation(mockRepo), {wrapper});

            result.current.mutate({id: 999, data: input});

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });
    });

    describe('useDeleteMyFamilyRelationshipMutation', () => {
        it('should delete family relationship and invalidate queries', async () => {
            (mockRepo.deleteMyFamilyRelationship as jest.Mock).mockResolvedValue(undefined);

            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const {result} = renderHook(() => useDeleteMyFamilyRelationshipMutation(mockRepo), {wrapper});

            result.current.mutate(1);

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(mockRepo.deleteMyFamilyRelationship).toHaveBeenCalledWith(1);
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'family', 1]});
            expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'family']});
        });

        it('should handle deletion errors (404)', async () => {
            const error = {response: {status: 404, data: {message: 'Not found'}}};

            (mockRepo.deleteMyFamilyRelationship as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useDeleteMyFamilyRelationshipMutation(mockRepo), {wrapper});

            result.current.mutate(999);

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });

        it('should handle server errors', async () => {
            const error = new Error('Server error');

            (mockRepo.deleteMyFamilyRelationship as jest.Mock).mockRejectedValue(error);

            const {result} = renderHook(() => useDeleteMyFamilyRelationshipMutation(mockRepo), {wrapper});

            result.current.mutate(1);

            await waitFor(() => expect(result.current.isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });
    });
});

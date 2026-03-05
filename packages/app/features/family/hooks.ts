/**
 * Family Relationships Feature - React Query Hooks
 *
 * INDEPENDENT FEATURE PATTERN:
 * - Family relationships have their own dedicated endpoints
 * - After mutations, we ONLY invalidate family queries (not bootstrap)
 * - Core profile is unchanged by family operations
 *
 * SOLID Principles:
 * - Dependency Inversion: Accepts injected repository for testing
 * - Interface Segregation: Clean hook interfaces for each operation
 * - Single Responsibility: Hooks handle only React Query integration
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {FamilyRepository} from './repository';
import {defaultFamilyRepository} from './repository';
import type {CreateFamilyRelationshipInput, FamilyRelationship, UpdateFamilyRelationshipInput,} from './types';

/**
 * Query hook for listing all family relationships of the authenticated user.
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query result with array of FamilyRelationship
 */
export function useMyFamilyQuery(repo: FamilyRepository = defaultFamilyRepository) {
    return useQuery<FamilyRelationship[]>({
        queryKey: ['me', 'family'],
        queryFn: () => repo.listMyFamily(),
        staleTime: 5 * 60_000, // 5 minutes
    });
}

/**
 * Query hook for listing all family relationships of a specific user (admin use).
 *
 * @param userId - The user ID to fetch family relationships for
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query result with array of FamilyRelationship
 */
export function useUserFamilyQuery(
    userId: number,
    repo: FamilyRepository = defaultFamilyRepository
) {
    return useQuery<FamilyRelationship[]>({
        queryKey: ['users', userId, 'family'],
        queryFn: () => repo.listUserFamily(userId),
        staleTime: 5 * 60_000, // 5 minutes
    });
}

/**
 * Query hook for fetching a specific family relationship by ID.
 *
 * @param id - The family relationship ID
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query result with FamilyRelationship or null
 */
export function useMyFamilyRelationshipQuery(
    id: number,
    repo: FamilyRepository = defaultFamilyRepository
) {
    return useQuery<FamilyRelationship | null>({
        queryKey: ['me', 'family', id],
        queryFn: () => repo.getMyFamilyRelationship(id),
        staleTime: 5 * 60_000,
    });
}

/**
 * Mutation hook for creating a new family relationship.
 *
 * After successful creation, invalidates the family list query to refresh the list.
 *
 * Usage:
 * ```tsx
 * const createMutation = useCreateMyFamilyRelationshipMutation();
 * createMutation.mutate({
 *   related_user_id: 20,
 *   relationship_type: 'spouse'
 * });
 * ```
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useCreateMyFamilyRelationshipMutation(
    repo: FamilyRepository = defaultFamilyRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateFamilyRelationshipInput) => repo.createMyFamilyRelationship(data),
        onSuccess: () => {
            // Invalidate family list to refresh
            qc.invalidateQueries({queryKey: ['me', 'family']});
        },
    });
}

/**
 * Mutation hook for updating an existing family relationship.
 *
 * After successful update, invalidates both the specific relationship and family list queries.
 *
 * Usage:
 * ```tsx
 * const updateMutation = useUpdateMyFamilyRelationshipMutation();
 * updateMutation.mutate({
 *   id: 1,
 *   data: { related_person_phone: '555-9999' }
 * });
 * ```
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useUpdateMyFamilyRelationshipMutation(
    repo: FamilyRepository = defaultFamilyRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({id, data}: { id: number; data: UpdateFamilyRelationshipInput }) =>
            repo.updateMyFamilyRelationship(id, data),
        onSuccess: (_, variables) => {
            // Invalidate specific relationship and family list
            qc.invalidateQueries({queryKey: ['me', 'family', variables.id]});
            qc.invalidateQueries({queryKey: ['me', 'family']});
        },
    });
}

/**
 * Mutation hook for deleting a family relationship.
 *
 * After successful deletion, invalidates both the specific relationship and family list queries.
 *
 * Usage:
 * ```tsx
 * const deleteMutation = useDeleteMyFamilyRelationshipMutation();
 * deleteMutation.mutate(1); // Delete relationship with ID 1
 * ```
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useDeleteMyFamilyRelationshipMutation(
    repo: FamilyRepository = defaultFamilyRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => repo.deleteMyFamilyRelationship(id),
        onSuccess: (_, id) => {
            // Invalidate specific relationship and family list
            qc.invalidateQueries({queryKey: ['me', 'family', id]});
            qc.invalidateQueries({queryKey: ['me', 'family']});
        },
    });
}

/**
 * Mutation hook for creating a new family relationship for a specific user (admin use).
 *
 * After successful creation, invalidates the user's family list query to refresh the list.
 *
 * Usage:
 * ```tsx
 * const createMutation = useCreateUserFamilyRelationshipMutation(userId);
 * createMutation.mutate({
 *   related_person_name: 'Jane Doe',
 *   relationship_type: 'spouse'
 * });
 * ```
 *
 * @param userId - The user ID to create family relationship for
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useCreateUserFamilyRelationshipMutation(
    userId: number,
    repo: FamilyRepository = defaultFamilyRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateFamilyRelationshipInput) => repo.createUserFamilyRelationship(userId, data),
        onSuccess: () => {
            // Invalidate user's family list to refresh
            qc.invalidateQueries({queryKey: ['users', userId, 'family']});
        },
    });
}

/**
 * Mutation hook for updating an existing family relationship for a specific user (admin use).
 *
 * After successful update, invalidates both the specific relationship and user's family list queries.
 *
 * Usage:
 * ```tsx
 * const updateMutation = useUpdateUserFamilyRelationshipMutation(userId);
 * updateMutation.mutate({
 *   id: 1,
 *   data: { related_person_phone: '555-9999' }
 * });
 * ```
 *
 * @param userId - The user ID
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useUpdateUserFamilyRelationshipMutation(
    userId: number,
    repo: FamilyRepository = defaultFamilyRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({id, data}: { id: number; data: UpdateFamilyRelationshipInput }) =>
            repo.updateUserFamilyRelationship(userId, id, data),
        onSuccess: (_, variables) => {
            // Invalidate specific relationship and user's family list
            qc.invalidateQueries({queryKey: ['users', userId, 'family', variables.id]});
            qc.invalidateQueries({queryKey: ['users', userId, 'family']});
        },
    });
}

/**
 * Mutation hook for deleting a family relationship for a specific user (admin use).
 *
 * After successful deletion, invalidates both the specific relationship and user's family list queries.
 *
 * Usage:
 * ```tsx
 * const deleteMutation = useDeleteUserFamilyRelationshipMutation(userId);
 * deleteMutation.mutate(1); // Delete relationship with ID 1
 * ```
 *
 * @param userId - The user ID
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useDeleteUserFamilyRelationshipMutation(
    userId: number,
    repo: FamilyRepository = defaultFamilyRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => repo.deleteUserFamilyRelationship(userId, id),
        onSuccess: (_, id) => {
            // Invalidate specific relationship and user's family list
            qc.invalidateQueries({queryKey: ['users', userId, 'family', id]});
            qc.invalidateQueries({queryKey: ['users', userId, 'family']});
        },
    });
}

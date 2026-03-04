/**
 * Membership History Feature - React Query Hooks
 *
 * INDEPENDENT FEATURE PATTERN:
 * - Membership history has its own dedicated endpoints
 * - After mutations, we ONLY invalidate membership queries (not bootstrap)
 * - Core profile is unchanged by membership operations
 *
 * SOLID Principles:
 * - Dependency Inversion: Accepts injected repository for testing
 * - Interface Segregation: Clean hook interfaces for each operation
 * - Single Responsibility: Hooks handle only React Query integration
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {MembershipRepository} from './repository';
import {defaultMembershipRepository} from './repository';
import type {
    MembershipHistory,
    CreateMembershipHistoryInput,
    UpdateMembershipHistoryInput,
} from './types';

/**
 * Query hook for listing all membership history records of the authenticated user.
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query result with array of MembershipHistory
 */
export function useMyMembershipHistoryQuery(repo: MembershipRepository = defaultMembershipRepository) {
    return useQuery<MembershipHistory[]>({
        queryKey: ['me', 'membership-history'],
        queryFn: () => repo.listMyMembershipHistory(),
        staleTime: 5 * 60_000, // 5 minutes
    });
}

/**
 * Query hook for fetching a specific membership history record by ID.
 *
 * @param id - The membership history ID
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query result with MembershipHistory or null
 */
export function useMyMembershipHistoryRecordQuery(
    id: number,
    repo: MembershipRepository = defaultMembershipRepository
) {
    return useQuery<MembershipHistory | null>({
        queryKey: ['me', 'membership-history', id],
        queryFn: () => repo.getMyMembershipHistory(id),
        staleTime: 5 * 60_000,
    });
}

/**
 * Mutation hook for creating a new membership history record.
 *
 * After successful creation, invalidates the membership history list query to refresh the list.
 *
 * Business Rule: Only ONE active membership (end_date = null) allowed (409 Conflict if violated).
 *
 * Usage:
 * ```tsx
 * const createMutation = useCreateMyMembershipHistoryMutation();
 * createMutation.mutate({
 *   church_name: 'First Baptist Church',
 *   start_date: '2020-01-15',
 *   transfer_type: 'new_member'
 * });
 * ```
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useCreateMyMembershipHistoryMutation(
    repo: MembershipRepository = defaultMembershipRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMembershipHistoryInput) => repo.createMyMembershipHistory(data),
        onSuccess: () => {
            // Invalidate membership history list to refresh
            qc.invalidateQueries({queryKey: ['me', 'membership-history']});
        },
    });
}

/**
 * Mutation hook for updating an existing membership history record.
 *
 * After successful update, invalidates both the specific record and membership history list queries.
 *
 * Usage:
 * ```tsx
 * const updateMutation = useUpdateMyMembershipHistoryMutation();
 * updateMutation.mutate({
 *   id: 1,
 *   data: { end_date: '2024-03-01', notes: 'Transferred out' }
 * });
 * ```
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useUpdateMyMembershipHistoryMutation(
    repo: MembershipRepository = defaultMembershipRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({id, data}: { id: number; data: UpdateMembershipHistoryInput }) =>
            repo.updateMyMembershipHistory(id, data),
        onSuccess: (_, variables) => {
            // Invalidate specific record and membership history list
            qc.invalidateQueries({queryKey: ['me', 'membership-history', variables.id]});
            qc.invalidateQueries({queryKey: ['me', 'membership-history']});
        },
    });
}

/**
 * Mutation hook for deleting a membership history record.
 *
 * After successful deletion, invalidates both the specific record and membership history list queries.
 *
 * Usage:
 * ```tsx
 * const deleteMutation = useDeleteMyMembershipHistoryMutation();
 * deleteMutation.mutate(1); // Delete record with ID 1
 * ```
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useDeleteMyMembershipHistoryMutation(
    repo: MembershipRepository = defaultMembershipRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => repo.deleteMyMembershipHistory(id),
        onSuccess: (_, id) => {
            // Invalidate specific record and membership history list
            qc.invalidateQueries({queryKey: ['me', 'membership-history', id]});
            qc.invalidateQueries({queryKey: ['me', 'membership-history']});
        },
    });
}

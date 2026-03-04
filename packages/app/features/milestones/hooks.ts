/**
 * Spiritual Milestones Feature - React Query Hooks
 *
 * INDEPENDENT FEATURE PATTERN:
 * - Milestones have their own dedicated endpoints
 * - After mutations, we ONLY invalidate milestone queries (not bootstrap)
 * - Core profile is unchanged by milestone operations
 *
 * SOLID Principles:
 * - Dependency Inversion: Accepts injected repository for testing
 * - Interface Segregation: Clean hook interfaces for each operation
 * - Single Responsibility: Hooks handle only React Query integration
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {MilestonesRepository} from './repository';
import {defaultMilestonesRepository} from './repository';
import type {CreateSpiritualMilestoneInput, SpiritualMilestone, UpdateSpiritualMilestoneInput,} from './types';

/**
 * Query hook for listing all spiritual milestones of the authenticated user.
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query result with array of SpiritualMilestone
 */
export function useMyMilestonesQuery(repo: MilestonesRepository = defaultMilestonesRepository) {
    return useQuery<SpiritualMilestone[]>({
        queryKey: ['me', 'milestones'],
        queryFn: () => repo.listMyMilestones(),
        staleTime: 5 * 60_000, // 5 minutes
    });
}

/**
 * Query hook for fetching a specific spiritual milestone by ID.
 *
 * @param id - The milestone ID
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query result with SpiritualMilestone or null
 */
export function useMyMilestoneQuery(
    id: number,
    repo: MilestonesRepository = defaultMilestonesRepository
) {
    return useQuery<SpiritualMilestone | null>({
        queryKey: ['me', 'milestones', id],
        queryFn: () => repo.getMyMilestone(id),
        staleTime: 5 * 60_000,
    });
}

/**
 * Mutation hook for creating a new spiritual milestone.
 *
 * After successful creation, invalidates the milestones list query to refresh the list.
 *
 * Business Rule: Each user can only have ONE milestone per type (409 Conflict if duplicate).
 *
 * Usage:
 * ```tsx
 * const createMutation = useCreateMyMilestoneMutation();
 * createMutation.mutate({
 *   milestone_type: 'baptism',
 *   milestone_date: '2020-06-15',
 *   location: 'First Baptist Church'
 * });
 * ```
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useCreateMyMilestoneMutation(
    repo: MilestonesRepository = defaultMilestonesRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSpiritualMilestoneInput) => repo.createMyMilestone(data),
        onSuccess: () => {
            // Invalidate milestones list to refresh
            qc.invalidateQueries({queryKey: ['me', 'milestones']});
        },
    });
}

/**
 * Mutation hook for updating an existing spiritual milestone.
 *
 * After successful update, invalidates both the specific milestone and milestones list queries.
 *
 * Note: milestone_type cannot be changed in updates.
 *
 * Usage:
 * ```tsx
 * const updateMutation = useUpdateMyMilestoneMutation();
 * updateMutation.mutate({
 *   id: 1,
 *   data: { notes: 'Updated notes', location: 'New Location' }
 * });
 * ```
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useUpdateMyMilestoneMutation(
    repo: MilestonesRepository = defaultMilestonesRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({id, data}: { id: number; data: UpdateSpiritualMilestoneInput }) =>
            repo.updateMyMilestone(id, data),
        onSuccess: (_, variables) => {
            // Invalidate specific milestone and milestones list
            qc.invalidateQueries({queryKey: ['me', 'milestones', variables.id]});
            qc.invalidateQueries({queryKey: ['me', 'milestones']});
        },
    });
}

/**
 * Mutation hook for deleting a spiritual milestone.
 *
 * After successful deletion, invalidates both the specific milestone and milestones list queries.
 *
 * Usage:
 * ```tsx
 * const deleteMutation = useDeleteMyMilestoneMutation();
 * deleteMutation.mutate(1); // Delete milestone with ID 1
 * ```
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useDeleteMyMilestoneMutation(
    repo: MilestonesRepository = defaultMilestonesRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => repo.deleteMyMilestone(id),
        onSuccess: (_, id) => {
            // Invalidate specific milestone and milestones list
            qc.invalidateQueries({queryKey: ['me', 'milestones', id]});
            qc.invalidateQueries({queryKey: ['me', 'milestones']});
        },
    });
}

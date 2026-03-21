import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {CreateDinnerInput, Dinner, Participant, ParticipantInput} from './types';
import type {DinnersRepository} from './repository';
import {defaultDinnersRepository} from './repository';

/**
 * Query key factory for dinner queries
 * Centralized query key management for consistent caching
 */
export const dinnerKeys = {
    all: ['dinners'] as const,
    byDate: (date: string) => [...dinnerKeys.all, 'by-date', date] as const,
};

/**
 * React Query hook for fetching dinners by date
 * Dependency Inversion Principle: Depends on DinnersRepository interface, not concrete implementation
 * Single Responsibility Principle: Only handles React Query integration for dinner fetching
 *
 * @param dinnerDate - Date in YYYY-MM-DD format, or null to disable query
 * @param repo - Repository instance (injectable for testing)
 * @returns React Query result with array of dinner data
 */
export function useDinnersByDateQuery(
    dinnerDate: string | null,
    repo: DinnersRepository = defaultDinnersRepository
) {
    return useQuery<Dinner[]>({
        queryKey: dinnerDate ? dinnerKeys.byDate(dinnerDate) : ['dinners', 'by-date', null],
        queryFn: () => repo.getByDate(dinnerDate!),
        enabled: Boolean(dinnerDate),
    });
}

/**
 * React Query hook for fetching participants by dinner ID
 * Dependency Inversion Principle: Depends on DinnersRepository interface, not concrete implementation
 * Single Responsibility Principle: Only handles React Query integration for participant fetching
 *
 * @param dinnerId - ID of the dinner, or null/undefined to disable query
 * @param repo - Repository instance (injectable for testing)
 * @returns React Query result with array of participant data
 */
export function useParticipantsByDinnerQuery(
    dinnerId: number | null | undefined,
    repo: DinnersRepository = defaultDinnersRepository
) {
    return useQuery<Participant[]>({
        queryKey: ['participants', 'by-dinner', dinnerId],
        queryFn: () => repo.getParticipantsByDinner(dinnerId!),
        enabled: Boolean(dinnerId),
    });
}

/**
 * React Query mutation hook for adding a participant to a dinner
 * Dependency Inversion Principle: Depends on DinnersRepository interface, not concrete implementation
 * Single Responsibility Principle: Only handles React Query integration for participant creation
 *
 * PERFORMANCE OPTIMIZATION:
 * We do NOT invalidate dinner queries when adding a participant because:
 * - Adding a participant doesn't change dinner data (date, location, description, etc.)
 * - We're not displaying participant lists in the dinners view
 * - Unnecessary refetch wastes API calls and bandwidth
 *
 * @param dinnerId - ID of the dinner to add participant to
 * @param repo - Repository instance (injectable for testing)
 * @returns React Query mutation result
 */
export function useAddParticipantMutation(
    dinnerId: number,
    repo: DinnersRepository = defaultDinnersRepository
) {
    return useMutation<Participant, Error, ParticipantInput>({
        mutationFn: (input) => repo.addParticipant(dinnerId, input),
        // No onSuccess handler needed - no queries to invalidate!
    });
}

/**
 * React Query mutation hook for creating a dinner
 * Dependency Inversion Principle: Depends on DinnersRepository interface, not concrete implementation
 * Single Responsibility Principle: Only handles React Query integration for dinner creation
 *
 * Cache Invalidation Strategy:
 * Invalidates ALL dinner queries because:
 * - New dinner affects getByDate results for that date
 * - We don't know which dates are currently cached
 * - Broad invalidation ensures consistency across all cached dates
 *
 * @param repo - Repository instance (injectable for testing)
 * @returns React Query mutation result
 */
export function useCreateDinnerMutation(
    repo: DinnersRepository = defaultDinnersRepository
) {
    const queryClient = useQueryClient();

    return useMutation<Dinner, Error, CreateDinnerInput>({
        mutationFn: (input) => repo.createDinner(input),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: dinnerKeys.all});
        },
    });
}

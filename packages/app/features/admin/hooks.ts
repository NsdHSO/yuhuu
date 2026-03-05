/**
 * Admin feature hooks
 * SOLID Principles:
 * - Single Responsibility: Each hook handles one specific admin data concern
 * - Dependency Inversion: Hooks depend on repository abstractions
 */

import { useQuery } from '@tanstack/react-query';
import { defaultAdminRepository, type AdminRepository } from './repository';

export function useDinnerStatsQuery() {
    // TODO: Implement dinner stats query
    return {
        data: undefined,
        isLoading: false,
        error: null,
    };
}

/**
 * Hook to search for users by name
 * @param searchTerm The name to search for
 * @param repo Optional repository for dependency injection (testing)
 */
export function useUserSearchQuery(
    searchTerm: string,
    repo: AdminRepository = defaultAdminRepository
) {
    const trimmedTerm = searchTerm.trim();

    return useQuery({
        queryKey: ['admin', 'users', 'search', trimmedTerm],
        queryFn: () => repo.searchUsers(trimmedTerm),
        enabled: trimmedTerm.length >= 2, // Only enable when 2+ chars
        staleTime: 5 * 60_000, // 5 minutes
    });
}

// Alias for backward compatibility
export const useUserLookupQuery = useUserSearchQuery;

export function useUserAttendanceQuery(username: string) {
    // TODO: Implement user attendance query
    return {
        data: undefined as { dinnerDate: string; attended: boolean; location: string; mealType?: string }[] | undefined,
        isLoading: false,
        error: null as Error | null,
    };
}

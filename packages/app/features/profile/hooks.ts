/**
 * Profile Feature - React Query Hooks
 *
 * BOOTSTRAP-ONLY PATTERN:
 * - useMyProfileQuery reads from cache seeded by bootstrap
 * - useSaveMyProfileMutation re-bootstraps after mutations to sync user + profile
 * - NEVER fetches profile independently - relies on bootstrap as single source of truth
 *
 * SOLID Principles:
 * - Dependency Inversion: Accepts injected repository for testing
 * - Interface Segregation: Clean hook interfaces
 * - Single Responsibility: Hooks handle only React Query integration
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {ProfileRepository} from './repository';
import {defaultProfileRepository} from './repository';
import type {ProfileInput, ProfileResponse} from './types';
import {bootstrapAndSeed, defaultBootstrapRepository} from '../bootstrap/api';

/**
 * Query hook for authenticated user's profile.
 *
 * BOOTSTRAP-ONLY: This hook reads from cache seeded by bootstrap.
 * It does NOT fetch independently. The queryFn throws to ensure it's never called.
 *
 * Cache is seeded by:
 * 1. Initial app load (useBootstrapGate calls seedFromBootstrap)
 * 2. Profile mutations (useSaveMyProfileMutation calls bootstrapAndSeed)
 *
 * @returns ProfileResponse or null if user has no profile
 */
export function useMyProfileQuery() {
    return useQuery<ProfileResponse | null>({
        queryKey: ['me', 'profile'],
        queryFn: () => {
            throw new Error('Profile must be seeded by bootstrap - do not fetch independently');
        },
        // Disable all automatic fetching - rely entirely on bootstrap seeding
        enabled: false,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

/**
 * Mutation hook for creating or updating the authenticated user's profile.
 *
 * BOOTSTRAP-ONLY: After successful mutation, re-bootstraps to get fresh user + profile data.
 * This ensures the cache stays in sync with the server.
 *
 * Usage:
 * ```tsx
 * const saveMutation = useSaveMyProfileMutation();
 * saveMutation.mutate({
 *   mode: 'create', // or 'update'
 *   phone: '555-1234',
 *   education_level: 'Bachelor'
 * });
 * ```
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation with onSuccess bootstrapAndSeed
 */
export function useSaveMyProfileMutation(
    repo: ProfileRepository = defaultProfileRepository
) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: ProfileInput & { mode?: 'create' | 'update' }) => {
            const {mode, ...data} = payload;
            console.log(payload)
            if (mode === 'create') {
                return await repo.createMyProfile(data);
            }
            return await repo.updateMyProfile(data);
        },
        onSuccess: async () => {
            // BOOTSTRAP-ONLY: Re-bootstrap to get fresh user + profile data
            // This replaces both ['me'] and ['me', 'profile'] cache entries
            await bootstrapAndSeed(qc, defaultBootstrapRepository);
        },
    });
}

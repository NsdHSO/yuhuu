/**
 * User Skills Feature - React Query Hooks
 *
 * INDEPENDENT FEATURE PATTERN:
 * - Skills have their own dedicated endpoints
 * - After mutations, we ONLY invalidate skill queries (not bootstrap)
 * - Core profile is unchanged by skill operations
 *
 * SOLID Principles:
 * - Dependency Inversion: Accepts injected repository for testing
 * - Interface Segregation: Clean hook interfaces for each operation
 * - Single Responsibility: Hooks handle only React Query integration
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {SkillsRepository} from './repository';
import {defaultSkillsRepository} from './repository';
import type {CreateUserSkillInput, UpdateUserSkillInput, UserSkill} from './types';

/**
 * Query hook for listing all skills of the authenticated user.
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query result with array of UserSkill
 */
export function useMySkillsQuery(repo: SkillsRepository = defaultSkillsRepository) {
    return useQuery<UserSkill[]>({
        queryKey: ['me', 'skills'],
        queryFn: () => repo.listMySkills(),
        staleTime: 5 * 60_000, // 5 minutes
    });
}

/**
 * Query hook for fetching a specific skill by ID.
 *
 * @param id - The skill ID
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query result with UserSkill or null
 */
export function useMySkillQuery(id: number, repo: SkillsRepository = defaultSkillsRepository) {
    return useQuery<UserSkill | null>({
        queryKey: ['me', 'skills', id],
        queryFn: () => repo.getMySkill(id),
        staleTime: 5 * 60_000,
    });
}

/**
 * Mutation hook for creating a new skill.
 *
 * Business Rule: Each user can only have ONE skill per skill_name (409 Conflict if duplicate).
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useCreateMySkillMutation(repo: SkillsRepository = defaultSkillsRepository) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserSkillInput) => repo.createMySkill(data),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ['me', 'skills']});
        },
    });
}

/**
 * Mutation hook for updating an existing skill.
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useUpdateMySkillMutation(repo: SkillsRepository = defaultSkillsRepository) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({id, data}: { id: number; data: UpdateUserSkillInput }) =>
            repo.updateMySkill(id, data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({queryKey: ['me', 'skills', variables.id]});
            qc.invalidateQueries({queryKey: ['me', 'skills']});
        },
    });
}

/**
 * Mutation hook for deleting a skill.
 *
 * @param repo - Injectable repository (defaults to HTTP implementation)
 * @returns React Query mutation
 */
export function useDeleteMySkillMutation(repo: SkillsRepository = defaultSkillsRepository) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => repo.deleteMySkill(id),
        onSuccess: (_, id) => {
            qc.invalidateQueries({queryKey: ['me', 'skills', id]});
            qc.invalidateQueries({queryKey: ['me', 'skills']});
        },
    });
}

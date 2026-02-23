import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defaultRolesRepository, ListParams, RolesRepository } from './repository';
import { Role, RoleInput, RolesList } from './types';

export function useRolesQuery(params?: ListParams, repo: RolesRepository = defaultRolesRepository) {
    const {
        page = 1,
        limit = 20,
        search
    } = params ?? {};
    return useQuery<RolesList>({
        queryKey: [
            'roles', {
                page,
                limit,
                search
            }
        ],
        queryFn: () => repo.list({
            page,
            limit,
            search
        }),
    });
}

export function useRoleQuery(id: number, repo: RolesRepository = defaultRolesRepository) {
    return useQuery<Role>({
        queryKey: ['roles', id],
        queryFn: () => repo.get(id),
        enabled: Number.isFinite(id) && id > 0,
    });
}

export function useCreateRoleMutation(repo: RolesRepository = defaultRolesRepository) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: RoleInput) => repo.create(body),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['roles'] });
        },
    });
}

export function useUpdateRoleMutation(id: number, repo: RolesRepository = defaultRolesRepository) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<RoleInput>) => repo.update(id, body),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['roles'] }),
                qc.invalidateQueries({ queryKey: ['roles', id] }),
            ]);
        },
    });
}

export function useDeleteRoleMutation(id: number, repo: RolesRepository = defaultRolesRepository) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => repo.delete(id),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['roles'] }),
                qc.invalidateQueries({ queryKey: ['roles', id] }),
            ]);
        },
    });
}

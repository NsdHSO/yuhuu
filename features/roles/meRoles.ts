import { useQuery } from '@tanstack/react-query';
import { appApi, unwrap } from '@/lib/api';

export type MyRole = {
    id: number;
    user_id: number;
    role_id: number;
    role_name: string;
    assigned_date?: string | null;
    assigned_by?: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export function useMyRolesQuery(opts?: { enabled?: boolean }) {
    return useQuery<MyRole[]>({
        queryKey: ['me', 'roles'],
        queryFn: () => unwrap<MyRole[]>(appApi.get('/me/roles')),
        enabled: opts?.enabled ?? true,
        // Avoid duplicate fetches on StrictMode remount and page focus
        staleTime: 5 * 60_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

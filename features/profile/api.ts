import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appApi } from '@/lib/api';

export type UserResponse = { id: number; auth_user_id: string; created_at: string; updated_at: string };
export type ProfileResponse = {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  // Other dynamic columns are allowed; use index signature to keep flexibility
  [key: string]: any;
};

export type ProfileInput = Partial<Omit<ProfileResponse, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      // Prefer /me/profile; fall back to /me if profile missing
      try {
        const { data } = await appApi.get<UserResponse>('/me/profile');
        return data as any;
      } catch {
        const { data } = await appApi.get<UserResponse>('/me');
        return data;
      }
    },
  });
}

export function useMyProfileQuery(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['me', 'profile'],
    queryFn: async () => {
      try {
        const { data } = await appApi.get<ProfileResponse>('/me/profile');
        return data as ProfileResponse | null;
      } catch (e: any) {
        if (e?.response?.status === 404) return null;
        throw e;
      }
    },
    enabled: opts?.enabled ?? true,
    // When bootstrap seeds the cache, treat it as fresh and avoid refetch churn
    staleTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useSaveMyProfileMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProfileInput & { mode?: 'create' | 'update' }) => {
      const { mode, ...body } = payload;
      if (mode === 'create') {
        const { data } = await appApi.post<ProfileResponse>(`/me/profile`, body);
        return data;
      }
      const { data } = await appApi.put<ProfileResponse>(`/me/profile`, body);
      return data;
    },
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: ['me', 'profile'] })]);
    },
  });
}

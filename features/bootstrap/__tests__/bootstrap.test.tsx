import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bootstrapAndSeed, seedFromBootstrap } from '../api';
import type { BootstrapResponse } from '../types';

// Mock appApi + unwrap so we can observe network calls
jest.mock('@/lib/api', () => {
  const appApi = {
    post: jest.fn(),
    get: jest.fn(),
  } as any;
  const unwrap = async <T,>(p: Promise<{ data: T }>): Promise<T> => (await p).data;
  return { appApi, unwrap };
});

import { appApi } from '@/lib/api';
import { useMyProfileQuery } from '@/features/profile/api';
import { useMyRolesQuery } from '@/features/roles/meRoles';

function TestHooks() {
  // Invoke hooks to simulate real screens mounting
  useMyProfileQuery();
  useMyRolesQuery();
  return null;
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 60_000, // consider fresh for 1m
        retry: false,
      },
    },
  });
}

describe('bootstrapAndSeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('seeds me, profile, and roles from /bootstrap and prevents immediate refetches', async () => {
    const sample: BootstrapResponse = {
      user: {
        id: 3,
        auth_user_id: '0c680631-c3e3-4161-bf44-fb3d7229650a',
        created_at: '2026-02-23T09:52:07.549790',
        updated_at: '2026-02-23T09:52:07.549790',
      },
      profile: {
        id: 2,
        user_id: 3,
        created_at: '2026-02-23T09:52:07.549790',
        updated_at: '2026-02-23T09:52:07.549790',
      },
      roles: [
        {
          id: 1,
          user_id: 3,
          role_id: 2,
          role_name: 'Member',
          is_active: true,
          created_at: '2026-02-23T09:52:07.549790',
          updated_at: '2026-02-23T09:52:07.549790',
        },
      ],
      created: { linked: false, profile: false },
    } as any;

    (appApi.post as jest.Mock).mockResolvedValue({ data: sample });

    const client = createClient();

    // Run bootstrap and seed cache
    const res = await bootstrapAndSeed(client);
    expect(res).toEqual(sample);

    // Validate cache has been populated
    expect(client.getQueryData(['me'])).toEqual(sample.user);
    expect(client.getQueryData(['me', 'profile'])).toEqual(sample.profile);
    expect(client.getQueryData(['me', 'roles'])).toEqual(sample.roles);

    // Mount components that use the hooks; they should NOT trigger GETs immediately
    render(
      <QueryClientProvider client={client}>
        <TestHooks />
      </QueryClientProvider>
    );

    // Allow any microtasks scheduled by React Query to run
    await Promise.resolve();

    // Ensure no GETs were issued for /me/profile or /me/roles
    const getCalls = (appApi.get as jest.Mock).mock.calls.map((args) => args?.[0]);
    expect(getCalls).not.toContain('/me/profile');
    expect(getCalls).not.toContain('/me/roles');
  });

  it('still avoids profile refetch when profile is null', async () => {
    const sample: BootstrapResponse = {
      user: {
        id: 7,
        auth_user_id: 'abc',
        created_at: '2026-02-23T09:52:07.549790',
        updated_at: '2026-02-23T09:52:07.549790',
      },
      profile: null,
    } as any;

    (appApi.post as jest.Mock).mockResolvedValue({ data: sample });

    const client = createClient();
    await bootstrapAndSeed(client);

    render(
      <QueryClientProvider client={client}>
        <TestHooks />
      </QueryClientProvider>
    );

    await Promise.resolve();

    const getCalls = (appApi.get as jest.Mock).mock.calls.map((args) => args?.[0]);
    // Profile hook treats 404 as null; with cached null we still should not call
    expect(getCalls).not.toContain('/me/profile');
  });
});

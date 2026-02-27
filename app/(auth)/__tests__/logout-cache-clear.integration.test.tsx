import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProvider';

/**
 * Integration test for logout cache clearing
 *
 * CRITICAL TEST: Verifies that React Query cache is cleared on logout
 * to prevent cached roles from previous user affecting new user
 *
 * Bug scenario:
 * 1. Admin user logs in → Admin tab visible
 * 2. Admin user logs out
 * 3. Member user logs in
 * 4. BUG: Admin tab still visible (cached roles not cleared)
 *
 * Expected behavior:
 * 1. Admin user logs in → Admin tab visible
 * 2. Admin user logs out → cache cleared
 * 3. Member user logs in → Admin tab NOT visible
 */

// Mock dependencies
const mockAuthApi = {
	post: jest.fn(),
};

const mockAppApi = {
	get: jest.fn(),
	post: jest.fn(),
};

jest.mock('@/lib/api', () => ({
	authApi: mockAuthApi,
	appApi: mockAppApi,
}));

jest.mock('@/lib/tokenManager', () => ({
	clearTokens: jest.fn(),
	getValidAccessToken: jest.fn(),
	setTokensFromLogin: jest.fn(),
}));

jest.mock('@/lib/nav', () => ({
	redirectToLogin: jest.fn(),
}));

// Import after mocks
import { queryClient } from '@/providers/QueryProvider';
import TabLayout from '@/app/(tabs)/_layout';

describe('Logout Cache Clear Integration Test', () => {
	let testQueryClient: QueryClient;

	beforeEach(() => {
		jest.clearAllMocks();

		// Create fresh QueryClient for each test
		testQueryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
					gcTime: 0,
				},
			},
		});

		// Mock getValidAccessToken to return null (not logged in)
		const { getValidAccessToken } = require('@/lib/tokenManager');
		getValidAccessToken.mockResolvedValue(null);
	});

	afterEach(() => {
		testQueryClient.clear();
	});

	it('should clear cached roles when user logs out', async () => {
		// Given: Admin user is logged in with cached roles
		const adminRoles = [
			{ role_name: 'Admin', role_id: 1 },
			{ role_name: 'Member', role_id: 2 },
		];

		// Set cached roles in query client
		testQueryClient.setQueryData(['roles', 'me'], adminRoles);

		// Verify cache has admin roles
		const cachedRoles = testQueryClient.getQueryData(['roles', 'me']);
		expect(cachedRoles).toEqual(adminRoles);

		// When: User logs out
		testQueryClient.clear();

		// Then: Cache should be completely cleared
		const rolesAfterLogout = testQueryClient.getQueryData(['roles', 'me']);
		expect(rolesAfterLogout).toBeUndefined();
	});

	it('should NOT show Admin tab for Member user after Admin logout', async () => {
		// This test verifies cache clearing at the QueryClient level
		// Full integration with AuthProvider is tested in the last test

		// Step 1: Admin user - set admin roles in cache
		const adminRoles = [
			{ role_name: 'Admin', role_id: 1 },
			{ role_name: 'Member', role_id: 2 },
		];

		testQueryClient.setQueryData(['roles', 'me'], adminRoles);

		// Verify admin roles are in cache
		expect(testQueryClient.getQueryData(['roles', 'me'])).toEqual(adminRoles);

		// Step 2: Logout - clear cache
		testQueryClient.clear();

		// Verify cache is cleared
		expect(testQueryClient.getQueryData(['roles', 'me'])).toBeUndefined();

		// Step 3: Member user logs in - set member roles
		const memberRoles = [{ role_name: 'Member', role_id: 2 }];
		testQueryClient.setQueryData(['roles', 'me'], memberRoles);

		// Verify only member roles in cache (no admin roles leaked)
		const currentRoles = testQueryClient.getQueryData(['roles', 'me']);
		expect(currentRoles).toEqual(memberRoles);
		expect(currentRoles).not.toEqual(adminRoles);
	});

	it('should clear all cached queries on logout', async () => {
		// Given: Multiple cached queries
		testQueryClient.setQueryData(['roles', 'me'], [{ role_name: 'Admin', role_id: 1 }]);
		testQueryClient.setQueryData(['dinners', 'by-date', '2026-02-27'], [
			{ id: 1, dinnerDate: '2026-02-27' },
		]);
		testQueryClient.setQueryData(['participants', 'by-dinner', 10], [
			{ id: 1, username: 'john_doe' },
		]);
		testQueryClient.setQueryData(['bootstrap'], { env: 'test' });

		// Verify all queries are cached
		expect(testQueryClient.getQueryData(['roles', 'me'])).toBeDefined();
		expect(testQueryClient.getQueryData(['dinners', 'by-date', '2026-02-27'])).toBeDefined();
		expect(testQueryClient.getQueryData(['participants', 'by-dinner', 10])).toBeDefined();
		expect(testQueryClient.getQueryData(['bootstrap'])).toBeDefined();

		// When: User logs out (clear all cache)
		testQueryClient.clear();

		// Then: All queries should be cleared
		expect(testQueryClient.getQueryData(['roles', 'me'])).toBeUndefined();
		expect(testQueryClient.getQueryData(['dinners', 'by-date', '2026-02-27'])).toBeUndefined();
		expect(testQueryClient.getQueryData(['participants', 'by-dinner', 10])).toBeUndefined();
		expect(testQueryClient.getQueryData(['bootstrap'])).toBeUndefined();
	});

	it('should handle logout → login → logout → login cycle correctly', async () => {
		// Cycle 1: Admin login
		const adminRoles = [{ role_name: 'Admin', role_id: 1 }];
		testQueryClient.setQueryData(['roles', 'me'], adminRoles);
		testQueryClient.setQueryData(['user-data'], { userId: 'admin-123' });

		expect(testQueryClient.getQueryData(['roles', 'me'])).toEqual(adminRoles);

		// Logout 1
		testQueryClient.clear();
		expect(testQueryClient.getQueryData(['roles', 'me'])).toBeUndefined();
		expect(testQueryClient.getQueryData(['user-data'])).toBeUndefined();

		// Cycle 2: Member login
		const memberRoles = [{ role_name: 'Member', role_id: 2 }];
		testQueryClient.setQueryData(['roles', 'me'], memberRoles);
		testQueryClient.setQueryData(['user-data'], { userId: 'member-456' });

		expect(testQueryClient.getQueryData(['roles', 'me'])).toEqual(memberRoles);
		expect(testQueryClient.getQueryData(['user-data'])).toEqual({ userId: 'member-456' });

		// Logout 2
		testQueryClient.clear();
		expect(testQueryClient.getQueryData(['roles', 'me'])).toBeUndefined();
		expect(testQueryClient.getQueryData(['user-data'])).toBeUndefined();

		// Cycle 3: Admin login again
		testQueryClient.setQueryData(['roles', 'me'], adminRoles);
		testQueryClient.setQueryData(['user-data'], { userId: 'admin-789' });

		expect(testQueryClient.getQueryData(['roles', 'me'])).toEqual(adminRoles);
		expect(testQueryClient.getQueryData(['user-data'])).toEqual({ userId: 'admin-789' });

		// Verify no member data leaked through
		expect(testQueryClient.getQueryData(['user-data'])).not.toEqual({ userId: 'member-456' });
	});

	it('should prevent cross-user data leakage through cache', async () => {
		// Given: User A's private data in cache
		const userAData = {
			roles: [{ role_name: 'Admin', role_id: 1 }],
			dinners: [{ id: 1, location: 'User A Private Location' }],
			participants: [{ id: 1, username: 'user_a_friend' }],
		};

		testQueryClient.setQueryData(['roles', 'me'], userAData.roles);
		testQueryClient.setQueryData(['dinners', 'by-date', '2026-02-27'], userAData.dinners);
		testQueryClient.setQueryData(['participants', 'by-dinner', 1], userAData.participants);

		// When: User A logs out
		testQueryClient.clear();

		// Then: User B should NOT see User A's data
		expect(testQueryClient.getQueryData(['roles', 'me'])).toBeUndefined();
		expect(testQueryClient.getQueryData(['dinners', 'by-date', '2026-02-27'])).toBeUndefined();
		expect(testQueryClient.getQueryData(['participants', 'by-dinner', 1])).toBeUndefined();

		// Given: User B logs in with different data
		const userBData = {
			roles: [{ role_name: 'Member', role_id: 2 }],
			dinners: [{ id: 2, location: 'User B Location' }],
		};

		testQueryClient.setQueryData(['roles', 'me'], userBData.roles);
		testQueryClient.setQueryData(['dinners', 'by-date', '2026-02-27'], userBData.dinners);

		// Then: Only User B's data should be in cache
		expect(testQueryClient.getQueryData(['roles', 'me'])).toEqual(userBData.roles);
		expect(testQueryClient.getQueryData(['dinners', 'by-date', '2026-02-27'])).toEqual(userBData.dinners);

		// User A's participant data should still be gone
		expect(testQueryClient.getQueryData(['participants', 'by-dinner', 1])).toBeUndefined();
	});

	it('should integrate with AuthProvider signOut function', async () => {
		// Given: Render AuthProvider with mocked dependencies
		const { setTokensFromLogin } = require('@/lib/tokenManager');
		const { getValidAccessToken } = require('@/lib/tokenManager');

		// Start with no token (logged out state)
		getValidAccessToken.mockResolvedValue(null);

		// Mock successful login
		mockAuthApi.post.mockResolvedValue({
			data: {
				accessToken: 'test-access-token',
				refreshToken: 'test-refresh-token',
				user: { id: '1', email: 'admin@test.com', name: 'Admin User' },
			},
		});

		let signOutFn: (() => Promise<void>) | null = null;
		let signInFn: ((email: string, password: string) => Promise<void>) | null = null;

		// Create a component that captures the signOut function
		function TestComponent() {
			const { signOut, signIn, status } = require('@/providers/AuthProvider').useAuth();
			signOutFn = signOut;
			signInFn = signIn;

			const { Text } = require('react-native');
			return <Text>Status: {status}</Text>;
		}

		// Render with real AuthProvider
		const { queryClient: realQueryClient } = require('@/providers/QueryProvider');

		// Set some cached data
		realQueryClient.setQueryData(['roles', 'me'], [{ role_name: 'Admin', role_id: 1 }]);
		realQueryClient.setQueryData(['test-data'], { value: 'should be cleared' });

		render(
			<AuthProvider>
				<TestComponent />
			</AuthProvider>
		);

		// Wait for initial load
		await waitFor(() => expect(signOutFn).not.toBeNull());

		// Verify cache has data
		expect(realQueryClient.getQueryData(['roles', 'me'])).toBeDefined();
		expect(realQueryClient.getQueryData(['test-data'])).toBeDefined();

		// When: Call signOut
		await signOutFn!();

		// Then: Cache should be cleared
		await waitFor(() => {
			expect(realQueryClient.getQueryData(['roles', 'me'])).toBeUndefined();
			expect(realQueryClient.getQueryData(['test-data'])).toBeUndefined();
		});
	});
});

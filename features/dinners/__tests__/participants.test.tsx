import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { DinnersRepository } from '../repository';
import type { Participant } from '../types';

/**
 * Unit tests for Participants API
 * Testing: GET /v1/dinners/{dinner_id}/participants
 *
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific behavior
 * - Dependency Inversion: Tests depend on repository abstraction
 */

// Import hook after we create it
let useParticipantsByDinnerQuery: any;

describe('dinners/participants', () => {
	beforeAll(() => {
		// Import after mocks are set up
		const hooks = require('../hooks');
		useParticipantsByDinnerQuery = hooks.useParticipantsByDinnerQuery;
	});

	let queryClient: QueryClient;

	const createWrapper = () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
					gcTime: 0,
				},
			},
		});

		return ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});
	});

	afterEach(() => {
		queryClient.clear();
	});

	describe('useParticipantsByDinnerQuery', () => {
		it('should fetch participants for a specific dinner', async () => {
			// Given: Dinner with participants
			const mockParticipants: Participant[] = [
				{
					id: 1,
					dinnerId: 10,
					username: 'john_doe',
					notes: 'Vegetarian',
					createdAt: '2026-02-27T10:00:00Z',
					updatedAt: '2026-02-27T10:00:00Z',
				},
				{
					id: 2,
					dinnerId: 10,
					username: 'jane_smith',
					notes: 'No allergies',
					createdAt: '2026-02-27T11:00:00Z',
					updatedAt: '2026-02-27T11:00:00Z',
				},
			];

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
				getParticipantsByDinner: jest.fn().mockResolvedValue(mockParticipants),
			};

			// When: Hook fetches participants for dinner ID 10
			const { result } = renderHook(() => useParticipantsByDinnerQuery(10, mockRepo), {
				wrapper: createWrapper(),
			});

			// Then: Should return all participants
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockParticipants);
			expect(result.current.data).toHaveLength(2);
			expect(mockRepo.getParticipantsByDinner).toHaveBeenCalledWith(10);
		});

		it('should return empty array when dinner has no participants', async () => {
			// Given: Dinner with no participants
			const mockParticipants: Participant[] = [];

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
				getParticipantsByDinner: jest.fn().mockResolvedValue(mockParticipants),
			};

			// When: Hook fetches participants
			const { result } = renderHook(() => useParticipantsByDinnerQuery(5, mockRepo), {
				wrapper: createWrapper(),
			});

			// Then: Should return empty array
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual([]);
			expect(result.current.data).toHaveLength(0);
		});

		it('should be disabled when dinner ID is null', async () => {
			// Given: No dinner ID provided
			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
				getParticipantsByDinner: jest.fn(),
			};

			// When: Hook is called with null
			const { result } = renderHook(() => useParticipantsByDinnerQuery(null, mockRepo), {
				wrapper: createWrapper(),
			});

			// Then: Query should be disabled
			await waitFor(() => expect(result.current.isFetching).toBe(false));

			expect(result.current.data).toBeUndefined();
			expect(mockRepo.getParticipantsByDinner).not.toHaveBeenCalled();
		});

		it('should be disabled when dinner ID is undefined', async () => {
			// Given: Undefined dinner ID
			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
				getParticipantsByDinner: jest.fn(),
			};

			// When: Hook is called with undefined
			const { result } = renderHook(() => useParticipantsByDinnerQuery(undefined, mockRepo), {
				wrapper: createWrapper(),
			});

			// Then: Query should be disabled
			await waitFor(() => expect(result.current.isFetching).toBe(false));

			expect(result.current.data).toBeUndefined();
			expect(mockRepo.getParticipantsByDinner).not.toHaveBeenCalled();
		});

		it('should handle errors from repository', async () => {
			// Given: Repository throws error
			const error = new Error('Failed to fetch participants');
			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
				getParticipantsByDinner: jest.fn().mockRejectedValue(error),
			};

			// When: Hook fetches participants
			const { result } = renderHook(() => useParticipantsByDinnerQuery(10, mockRepo), {
				wrapper: createWrapper(),
			});

			// Then: Should return error
			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(result.current.error).toEqual(error);
			expect(mockRepo.getParticipantsByDinner).toHaveBeenCalledWith(10);
		});

		it('should cache participants by dinner ID', async () => {
			// Given: Two different dinners
			const mockParticipants1: Participant[] = [
				{
					id: 1,
					dinnerId: 10,
					username: 'john_doe',
					notes: 'Vegetarian',
					createdAt: '2026-02-27T10:00:00Z',
					updatedAt: '2026-02-27T10:00:00Z',
				},
			];

			const mockParticipants2: Participant[] = [
				{
					id: 2,
					dinnerId: 20,
					username: 'jane_smith',
					notes: 'Vegan',
					createdAt: '2026-02-27T11:00:00Z',
					updatedAt: '2026-02-27T11:00:00Z',
				},
			];

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
				getParticipantsByDinner: jest
					.fn()
					.mockImplementation((dinnerId) =>
						dinnerId === 10 ? mockParticipants1 : mockParticipants2
					),
			};

			const wrapper = createWrapper();

			// When: Fetch participants for first dinner
			const { result: result1 } = renderHook(() => useParticipantsByDinnerQuery(10, mockRepo), {
				wrapper,
			});
			await waitFor(() => expect(result1.current.isSuccess).toBe(true));

			// When: Fetch participants for second dinner
			const { result: result2 } = renderHook(() => useParticipantsByDinnerQuery(20, mockRepo), {
				wrapper,
			});
			await waitFor(() => expect(result2.current.isSuccess).toBe(true));

			// Then: Both queries should have correct cached data
			expect(result1.current.data).toEqual(mockParticipants1);
			expect(result2.current.data).toEqual(mockParticipants2);
			expect(mockRepo.getParticipantsByDinner).toHaveBeenCalledTimes(2);
		});

		it('should track loading state correctly', async () => {
			// Given: Slow repository
			let resolvePromise: (value: Participant[]) => void;
			const promise = new Promise<Participant[]>((resolve) => {
				resolvePromise = resolve;
			});

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
				getParticipantsByDinner: jest.fn().mockReturnValue(promise),
			};

			// When: Hook starts fetching
			const { result } = renderHook(() => useParticipantsByDinnerQuery(10, mockRepo), {
				wrapper: createWrapper(),
			});

			// Then: Should show loading state
			expect(result.current.isLoading).toBe(true);

			// When: Promise resolves
			const mockParticipants: Participant[] = [
				{
					id: 1,
					dinnerId: 10,
					username: 'test_user',
					notes: '',
					createdAt: '2026-02-27T10:00:00Z',
					updatedAt: '2026-02-27T10:00:00Z',
				},
			];
			resolvePromise!(mockParticipants);

			// Then: Should complete loading
			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toEqual(mockParticipants);
		});

		it('should use correct dinner ID in repository call', async () => {
			// Given: Specific dinner ID
			const dinnerId = 42;
			const mockParticipants: Participant[] = [
				{
					id: 100,
					dinnerId: 42,
					username: 'alice',
					notes: 'Gluten-free',
					createdAt: '2026-02-27T12:00:00Z',
					updatedAt: '2026-02-27T12:00:00Z',
				},
			];

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
				getParticipantsByDinner: jest.fn().mockResolvedValue(mockParticipants),
			};

			// When: Hook fetches participants
			const { result } = renderHook(() => useParticipantsByDinnerQuery(dinnerId, mockRepo), {
				wrapper: createWrapper(),
			});

			// Then: Repository should be called with correct ID
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockRepo.getParticipantsByDinner).toHaveBeenCalledWith(42);
		});

		it('should handle participants with empty notes', async () => {
			// Given: Participants with empty notes
			const mockParticipants: Participant[] = [
				{
					id: 1,
					dinnerId: 10,
					username: 'user1',
					notes: '',
					createdAt: '2026-02-27T10:00:00Z',
					updatedAt: '2026-02-27T10:00:00Z',
				},
				{
					id: 2,
					dinnerId: 10,
					username: 'user2',
					notes: 'Has preferences',
					createdAt: '2026-02-27T11:00:00Z',
					updatedAt: '2026-02-27T11:00:00Z',
				},
			];

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
				getParticipantsByDinner: jest.fn().mockResolvedValue(mockParticipants),
			};

			// When: Hook fetches participants
			const { result } = renderHook(() => useParticipantsByDinnerQuery(10, mockRepo), {
				wrapper: createWrapper(),
			});

			// Then: Should handle both empty and non-empty notes
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data?.[0].notes).toBe('');
			expect(result.current.data?.[1].notes).toBe('Has preferences');
		});

		it('should refetch when dinner ID changes', async () => {
			// Given: Repository with different participants for different dinners
			const mockParticipants1: Participant[] = [
				{
					id: 1,
					dinnerId: 10,
					username: 'dinner10_user',
					notes: '',
					createdAt: '2026-02-27T10:00:00Z',
					updatedAt: '2026-02-27T10:00:00Z',
				},
			];

			const mockParticipants2: Participant[] = [
				{
					id: 2,
					dinnerId: 20,
					username: 'dinner20_user',
					notes: '',
					createdAt: '2026-02-27T11:00:00Z',
					updatedAt: '2026-02-27T11:00:00Z',
				},
			];

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
				getParticipantsByDinner: jest
					.fn()
					.mockImplementation((dinnerId) =>
						dinnerId === 10 ? mockParticipants1 : mockParticipants2
					),
			};

			// When: Hook fetches for dinner 10
			const { result, rerender } = renderHook(
				({ dinnerId }: { dinnerId: number }) => useParticipantsByDinnerQuery(dinnerId, mockRepo),
				{
					wrapper: createWrapper(),
					initialProps: { dinnerId: 10 as number },
				}
			);

			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			expect(result.current.data).toEqual(mockParticipants1);

			// When: Dinner ID changes to 20
			rerender({ dinnerId: 20 });

			// Then: Should fetch new participants
			await waitFor(() => {
				expect(result.current.data).toEqual(mockParticipants2);
			});

			expect(mockRepo.getParticipantsByDinner).toHaveBeenCalledWith(10);
			expect(mockRepo.getParticipantsByDinner).toHaveBeenCalledWith(20);
		});
	});
});

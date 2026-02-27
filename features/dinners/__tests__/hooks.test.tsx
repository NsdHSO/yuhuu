import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDinnersByDateQuery, useAddParticipantMutation } from '../hooks';
import type { DinnersRepository } from '../repository';
import type { Dinner, Participant, ParticipantInput } from '../types';

describe('dinners/hooks', () => {
	let queryClient: QueryClient;

	// Create a wrapper component for React Query
	const createWrapper = () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
					gcTime: 0,
				},
				mutations: {
					retry: false,
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
				mutations: { retry: false },
			},
		});
	});

	afterEach(() => {
		queryClient.clear();
	});

	describe('useDinnersByDateQuery', () => {
		it('should fetch multiple dinners when date is provided', async () => {
			const mockDinners: Dinner[] = [
				{
					id: 1,
					dinnerDate: '2026-02-28',
					location: 'Church Hall',
					description: 'Fellowship dinner',
					maxParticipants: 50,
					createdAt: '2026-02-25T10:00:00Z',
					updatedAt: '2026-02-25T10:00:00Z',
				},
				{
					id: 2,
					dinnerDate: '2026-02-28',
					location: 'Community Center',
					description: 'Youth dinner',
					maxParticipants: 30,
					createdAt: '2026-02-25T11:00:00Z',
					updatedAt: '2026-02-25T11:00:00Z',
				},
			];

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn().mockResolvedValue(mockDinners),
				addParticipant: jest.fn(),
			};

			const { result } = renderHook(() => useDinnersByDateQuery('2026-02-28', mockRepo), {
				wrapper: createWrapper(),
			});

			// Initially loading
			expect(result.current.isLoading).toBe(true);

			// Wait for query to resolve
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockDinners);
			expect(result.current.data).toHaveLength(2);
			expect(mockRepo.getByDate).toHaveBeenCalledWith('2026-02-28');
		});

		it('should fetch single dinner as array', async () => {
			const mockDinners: Dinner[] = [
				{
					id: 1,
					dinnerDate: '2026-02-28',
					location: 'Church Hall',
					description: 'Fellowship dinner',
					maxParticipants: 50,
					createdAt: '2026-02-25T10:00:00Z',
					updatedAt: '2026-02-25T10:00:00Z',
				},
			];

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn().mockResolvedValue(mockDinners),
				addParticipant: jest.fn(),
			};

			const { result } = renderHook(() => useDinnersByDateQuery('2026-02-28', mockRepo), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toHaveLength(1);
			expect(result.current.data?.[0].id).toBe(1);
		});

		it('should return empty array when no dinners found', async () => {
			const mockDinners: Dinner[] = [];

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn().mockResolvedValue(mockDinners),
				addParticipant: jest.fn(),
			};

			const { result } = renderHook(() => useDinnersByDateQuery('2026-03-15', mockRepo), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual([]);
			expect(result.current.data).toHaveLength(0);
		});

		it('should be disabled when date is null', async () => {
			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
			};

			const { result } = renderHook(() => useDinnersByDateQuery(null, mockRepo), {
				wrapper: createWrapper(),
			});

			// Should not be loading and should not call repository
			await waitFor(() => expect(result.current.isFetching).toBe(false));

			expect(result.current.data).toBeUndefined();
			expect(mockRepo.getByDate).not.toHaveBeenCalled();
		});

		it('should be disabled when date is empty string', async () => {
			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn(),
			};

			const { result } = renderHook(() => useDinnersByDateQuery('', mockRepo), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isFetching).toBe(false));

			expect(result.current.data).toBeUndefined();
			expect(mockRepo.getByDate).not.toHaveBeenCalled();
		});

		it('should handle errors from repository', async () => {
			const error = new Error('Dinners not found');
			const mockRepo: DinnersRepository = {
				getByDate: jest.fn().mockRejectedValue(error),
				addParticipant: jest.fn(),
			};

			const { result } = renderHook(() => useDinnersByDateQuery('2026-03-01', mockRepo), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(result.current.error).toEqual(error);
			expect(mockRepo.getByDate).toHaveBeenCalledWith('2026-03-01');
		});

		it('should cache queries by date', async () => {
			const mockDinners1: Dinner[] = [
				{
					id: 1,
					dinnerDate: '2026-02-28',
					location: 'Hall A',
					description: null,
					maxParticipants: null,
					createdAt: '2026-02-25T10:00:00Z',
					updatedAt: '2026-02-25T10:00:00Z',
				},
			];

			const mockDinners2: Dinner[] = [
				{
					id: 2,
					dinnerDate: '2026-03-05',
					location: 'Hall B',
					description: null,
					maxParticipants: null,
					createdAt: '2026-02-25T10:00:00Z',
					updatedAt: '2026-02-25T10:00:00Z',
				},
			];

			const mockRepo: DinnersRepository = {
				getByDate: jest
					.fn()
					.mockImplementation((date) =>
						date === '2026-02-28' ? mockDinners1 : mockDinners2
					),
				addParticipant: jest.fn(),
			};

			const wrapper = createWrapper();

			// Fetch first date
			const { result: result1 } = renderHook(
				() => useDinnersByDateQuery('2026-02-28', mockRepo),
				{ wrapper }
			);
			await waitFor(() => expect(result1.current.isSuccess).toBe(true));

			// Fetch second date
			const { result: result2 } = renderHook(
				() => useDinnersByDateQuery('2026-03-05', mockRepo),
				{ wrapper }
			);
			await waitFor(() => expect(result2.current.isSuccess).toBe(true));

			expect(result1.current.data).toEqual(mockDinners1);
			expect(result2.current.data).toEqual(mockDinners2);
			expect(mockRepo.getByDate).toHaveBeenCalledTimes(2);
		});
	});

	describe('useAddParticipantMutation', () => {
		it('should add participant successfully', async () => {
			const mockParticipant: Participant = {
				id: 10,
				dinnerId: 5,
				username: 'john_doe',
				notes: 'Vegetarian',
				createdAt: '2026-02-25T14:00:00Z',
				updatedAt: '2026-02-25T14:00:00Z',
			};

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn().mockResolvedValue(mockParticipant),
			};

			const { result } = renderHook(() => useAddParticipantMutation(5, mockRepo), {
				wrapper: createWrapper(),
			});

			const input: ParticipantInput = {
				username: 'john_doe',
				notes: 'Vegetarian',
			};

			result.current.mutate(input);

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockParticipant);
			expect(mockRepo.addParticipant).toHaveBeenCalledWith(5, input);
		});

		it('should handle errors from repository', async () => {
			const error = new Error('Failed to add participant');
			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn().mockRejectedValue(error),
			};

			const { result } = renderHook(() => useAddParticipantMutation(5, mockRepo), {
				wrapper: createWrapper(),
			});

			const input: ParticipantInput = {
				username: 'test_user',
				notes: 'Test',
			};

			result.current.mutate(input);

			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(result.current.error).toEqual(error);
		});

		it('should NOT invalidate dinner queries after adding participant (optimization)', async () => {
			// PERFORMANCE: Adding a participant doesn't change dinner data
			// No need to refetch dinners and waste API calls!
			const mockParticipant: Participant = {
				id: 20,
				dinnerId: 8,
				username: 'jane_smith',
				notes: 'No allergies',
				createdAt: '2026-02-26T09:00:00Z',
				updatedAt: '2026-02-26T09:00:00Z',
			};

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn().mockResolvedValue(mockParticipant),
			};

			const qc = new QueryClient({
				defaultOptions: {
					queries: { retry: false },
					mutations: { retry: false },
				},
			});

			// Set up a spy on invalidateQueries
			const invalidateSpy = jest.spyOn(qc, 'invalidateQueries');

			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={qc}>{children}</QueryClientProvider>
			);

			const { result } = renderHook(() => useAddParticipantMutation(8, mockRepo), {
				wrapper,
			});

			const input: ParticipantInput = {
				username: 'jane_smith',
				notes: 'No allergies',
			};

			result.current.mutate(input);

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			// Verify invalidateQueries was NOT called - no need to refetch dinners!
			expect(invalidateSpy).not.toHaveBeenCalled();
		});

		it('should add participant without triggering dinner API calls', async () => {
			// CRITICAL TEST: Verify adding participant ONLY calls addParticipant API
			// Should NOT call getByDate (dinners query)
			const mockDinners: Dinner[] = [
				{
					id: 8,
					dinnerDate: '2026-02-28',
					mealType: 'Lunch',
					location: 'Church Hall',
					description: 'Fellowship lunch',
					maxParticipants: 50,
					uuid: 'uuid-1',
					recordedBy: null,
					createdAt: '2026-02-25T10:00:00Z',
					updatedAt: '2026-02-25T10:00:00Z',
				},
			];

			const mockParticipant: Participant = {
				id: 100,
				dinnerId: 8,
				username: 'john_doe',
				notes: 'Vegetarian meal',
				createdAt: '2026-02-26T10:00:00Z',
				updatedAt: '2026-02-26T10:00:00Z',
			};

			const getByDateSpy = jest.fn().mockResolvedValue(mockDinners);
			const addParticipantSpy = jest.fn().mockResolvedValue(mockParticipant);

			const mockRepo: DinnersRepository = {
				getByDate: getByDateSpy,
				addParticipant: addParticipantSpy,
			};

			const qc = new QueryClient({
				defaultOptions: {
					queries: { retry: false },
					mutations: { retry: false },
				},
			});

			const wrapper = ({ children }: { children: React.ReactNode }) => (
				<QueryClientProvider client={qc}>{children}</QueryClientProvider>
			);

			// First, fetch dinners (to populate cache)
			const { result: dinnerResult } = renderHook(
				() => useDinnersByDateQuery('2026-02-28', mockRepo),
				{ wrapper }
			);
			await waitFor(() => expect(dinnerResult.current.isSuccess).toBe(true));

			// Reset spy to verify no additional calls
			getByDateSpy.mockClear();

			// Now add participant
			const { result: mutationResult } = renderHook(
				() => useAddParticipantMutation(8, mockRepo),
				{ wrapper }
			);

			const input: ParticipantInput = {
				username: 'john_doe',
				notes: 'Vegetarian meal',
			};

			mutationResult.current.mutate(input);

			await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

			// VERIFY: Only addParticipant was called, NOT getByDate!
			expect(addParticipantSpy).toHaveBeenCalledTimes(1);
			expect(addParticipantSpy).toHaveBeenCalledWith(8, input);

			// CRITICAL: getByDate should NOT be called after adding participant!
			expect(getByDateSpy).not.toHaveBeenCalled();
		});

		it('should track pending state during mutation', async () => {
			const mockParticipant: Participant = {
				id: 30,
				dinnerId: 10,
				username: 'bob_wilson',
				notes: 'Gluten-free',
				createdAt: '2026-02-27T11:00:00Z',
				updatedAt: '2026-02-27T11:00:00Z',
			};

			let resolvePromise: (value: Participant) => void;
			const promise = new Promise<Participant>((resolve) => {
				resolvePromise = resolve;
			});

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn().mockReturnValue(promise),
			};

			const { result } = renderHook(() => useAddParticipantMutation(10, mockRepo), {
				wrapper: createWrapper(),
			});

			const input: ParticipantInput = {
				username: 'bob_wilson',
				notes: 'Gluten-free',
			};

			// Start mutation
			result.current.mutate(input);

			// Should be pending
			await waitFor(() => expect(result.current.isPending).toBe(true));

			// Resolve mutation
			resolvePromise!(mockParticipant);

			// Should complete
			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			expect(result.current.isPending).toBe(false);
		});

		it('should use correct dinner ID in repository call', async () => {
			const mockParticipant: Participant = {
				id: 100,
				dinnerId: 42,
				username: 'alice',
				notes: 'Vegan',
				createdAt: '2026-02-28T12:00:00Z',
				updatedAt: '2026-02-28T12:00:00Z',
			};

			const mockRepo: DinnersRepository = {
				getByDate: jest.fn(),
				addParticipant: jest.fn().mockResolvedValue(mockParticipant),
			};

			const { result } = renderHook(() => useAddParticipantMutation(42, mockRepo), {
				wrapper: createWrapper(),
			});

			const input: ParticipantInput = {
				username: 'alice',
				notes: 'Vegan',
			};

			result.current.mutate(input);

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockRepo.addParticipant).toHaveBeenCalledWith(42, input);
		});
	});
});

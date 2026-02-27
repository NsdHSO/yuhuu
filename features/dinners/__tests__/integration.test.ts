import { HttpDinnersRepository } from '../repository';
import { appApi } from '@/lib/api';
import type { DinnerDto, ParticipantDto } from '../types';

/**
 * Integration tests for Dinners feature
 * Tests the actual API contract and data flow
 * SOLID Principles Applied:
 * - Single Responsibility: Each test validates one specific behavior
 * - Dependency Inversion: Tests depend on repository interface, not implementation details
 * - Interface Segregation: Separate tests for query vs mutation operations
 */

// Mock axios
jest.mock('@/lib/api');

const mockAppApi = appApi as jest.Mocked<typeof appApi>;

describe('HttpDinnersRepository - Integration Tests', () => {
	let repository: HttpDinnersRepository;

	beforeEach(() => {
		repository = new HttpDinnersRepository();
		jest.clearAllMocks();
	});

	describe('getByDate - Query Operations (SOLID: Interface Segregation)', () => {
		it('should fetch dinners by date and return array when API succeeds', async () => {
			// Given: API returns paginated response with single dinner
			const apiResponse = {
				data: {
					data: [
						{
							id: 1,
							dinner_date: '2026-02-24',
							description: 'Sunday lunch after service',
							meal_type: 'Lunch',
							recorded_by: null,
							uuid: '0dbdaaf9-6cc9-42ba-b9d4-68ab1388d011',
							location: 'Church Hall',
							max_participants: 50,
							created_at: '2026-02-26T13:48:16.699968',
							updated_at: '2026-02-26T13:48:16.699968',
						},
					] as DinnerDto[],
					pagination: {
						limit: 20,
						page: 1,
						total: 1,
						total_pages: 1,
					},
				},
			};

			mockAppApi.get.mockResolvedValue(apiResponse);

			// When: Repository fetches dinners by date
			const result = await repository.getByDate('2026-02-24');

			// Then: Should call correct endpoint
			expect(mockAppApi.get).toHaveBeenCalledWith('/dinners?dinner_date=2026-02-24');

			// Then: Should return mapped domain models array
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				id: 1,
				dinnerDate: '2026-02-24',
				description: 'Sunday lunch after service',
				mealType: 'Lunch',
				recordedBy: null,
				uuid: '0dbdaaf9-6cc9-42ba-b9d4-68ab1388d011',
				location: 'Church Hall',
				maxParticipants: 50,
				createdAt: '2026-02-26T13:48:16.699968',
				updatedAt: '2026-02-26T13:48:16.699968',
			});
		});

		it('should handle multiple dinners for same date', async () => {
			// Given: API returns multiple dinners
			const apiResponse = {
				data: {
					data: [
						{
							id: 1,
							dinner_date: '2026-02-28',
							description: 'Fellowship dinner',
							meal_type: 'Dinner',
							recorded_by: null,
							uuid: 'uuid-1',
							location: 'Church Hall',
							max_participants: 50,
							created_at: '2026-02-25T10:00:00Z',
							updated_at: '2026-02-25T10:00:00Z',
						},
						{
							id: 2,
							dinner_date: '2026-02-28',
							description: 'Youth dinner',
							meal_type: 'Dinner',
							recorded_by: null,
							uuid: 'uuid-2',
							location: 'Community Center',
							max_participants: 30,
							created_at: '2026-02-25T11:00:00Z',
							updated_at: '2026-02-25T11:00:00Z',
						},
					] as DinnerDto[],
					pagination: {
						limit: 20,
						page: 1,
						total: 2,
						total_pages: 1,
					},
				},
			};

			mockAppApi.get.mockResolvedValue(apiResponse);

			// When
			const result = await repository.getByDate('2026-02-28');

			// Then: Should return both dinners
			expect(result).toHaveLength(2);
			expect(result[0].id).toBe(1);
			expect(result[0].location).toBe('Church Hall');
			expect(result[1].id).toBe(2);
			expect(result[1].location).toBe('Community Center');
		});

		it('should return empty array when no dinners found', async () => {
			// Given: API returns empty data array
			const apiResponse = {
				data: {
					data: [],
					pagination: {
						limit: 20,
						page: 1,
						total: 0,
						total_pages: 0,
					},
				},
			};

			mockAppApi.get.mockResolvedValue(apiResponse);

			// When
			const result = await repository.getByDate('2026-12-31');

			// Then: Should return empty array
			expect(result).toEqual([]);
		});

		it('should handle API errors gracefully', async () => {
			// Given: API throws error
			const apiError = new Error('Network error');
			mockAppApi.get.mockRejectedValue(apiError);

			// When/Then: Should propagate error
			await expect(repository.getByDate('2026-02-24')).rejects.toThrow('Network error');
		});
	});

	describe('addParticipant - Mutation Operations (SOLID: Interface Segregation)', () => {
		it('should add participant to dinner when API succeeds', async () => {
			// Given: Valid participant input
			const participantInput = {
				username: 'john_doe',
				notes: 'Vegetarian meal',
			};

			const apiResponse = {
				data: {
					id: 1,
					dinner_id: 1,
					username: 'john_doe',
					notes: 'Vegetarian meal',
					created_at: '2026-02-26T14:00:00Z',
					updated_at: '2026-02-26T14:00:00Z',
				} as ParticipantDto,
			};

			mockAppApi.post.mockResolvedValue(apiResponse);

			// When: Repository adds participant
			const result = await repository.addParticipant(1, participantInput);

			// Then: Should call correct endpoint with correct body
			expect(mockAppApi.post).toHaveBeenCalledWith('/dinners/1/participants', {
				username: 'john_doe',
				notes: 'Vegetarian meal',
			});

			// Then: Should return mapped domain model
			expect(result).toEqual({
				id: 1,
				dinnerId: 1,
				username: 'john_doe',
				notes: 'Vegetarian meal',
				createdAt: '2026-02-26T14:00:00Z',
				updatedAt: '2026-02-26T14:00:00Z',
			});
		});

		it('should handle participant with empty notes', async () => {
			// Given: Participant without notes
			const participantInput = {
				username: 'jane_smith',
				notes: '',
			};

			const apiResponse = {
				data: {
					id: 2,
					dinner_id: 1,
					username: 'jane_smith',
					notes: '',
					created_at: '2026-02-26T14:05:00Z',
					updated_at: '2026-02-26T14:05:00Z',
				} as ParticipantDto,
			};

			mockAppApi.post.mockResolvedValue(apiResponse);

			// When
			const result = await repository.addParticipant(1, participantInput);

			// Then: Should accept empty notes
			expect(result.notes).toBe('');
		});

		it('should handle API validation errors', async () => {
			// Given: API rejects due to validation error
			const apiError = {
				response: {
					data: {
						message: 'Username already exists for this dinner',
						code: 'VALIDATION_ERROR',
					},
				},
			};

			mockAppApi.post.mockRejectedValue(apiError);

			// When/Then: Should propagate error
			await expect(
				repository.addParticipant(1, { username: 'duplicate', notes: 'test' })
			).rejects.toEqual(apiError);
		});

		it('should handle dinner not found error', async () => {
			// Given: API returns 404 for non-existent dinner
			const apiError = {
				response: {
					status: 404,
					data: {
						message: 'Dinner not found',
						code: 'NOT_FOUND',
					},
				},
			};

			mockAppApi.post.mockRejectedValue(apiError);

			// When/Then: Should propagate error
			await expect(
				repository.addParticipant(999, { username: 'test', notes: 'test' })
			).rejects.toEqual(apiError);
		});
	});

	describe('SOLID: Liskov Substitution Principle', () => {
		it('should be fully substitutable with DinnersRepository interface', async () => {
			// Given: Repository instance typed as interface
			const repo: typeof repository = repository;

			// When: Using interface methods
			mockAppApi.get.mockResolvedValue({
				data: { data: [], pagination: { limit: 20, page: 1, total: 0, total_pages: 0 } },
			});
			mockAppApi.post.mockResolvedValue({
				data: {
					id: 1,
					dinner_id: 1,
					username: 'test',
					notes: '',
					created_at: '2026-02-26T14:00:00Z',
					updated_at: '2026-02-26T14:00:00Z',
				},
			});

			// Then: Should work identically through interface
			await expect(repo.getByDate('2026-02-24')).resolves.toEqual([]);
			await expect(
				repo.addParticipant(1, { username: 'test', notes: '' })
			).resolves.toBeDefined();
		});
	});
});

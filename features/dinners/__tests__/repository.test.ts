import { HttpDinnersRepository } from '../repository';
import { appApi } from '@/lib/api';
import { unwrap } from '@/lib/http/envelope';
import type { DinnerDto, ParticipantDto, PaginatedResponse } from '../types';

/**
 * Unit tests for HttpDinnersRepository
 * SOLID Principles Applied:
 * - Single Responsibility: Each test validates one specific behavior
 * - Dependency Inversion: Tests use mocked dependencies
 */

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('@/lib/http/envelope');

describe('dinners/repository', () => {
	let repository: HttpDinnersRepository;
	const mockUnwrap = unwrap as jest.MockedFunction<typeof unwrap>;

	beforeEach(() => {
		jest.clearAllMocks();
		repository = new HttpDinnersRepository();
	});

	describe('getByDate', () => {
		it('should fetch dinners array by date and return domain models', async () => {
			const dinnerDate = '2026-02-28';
			const mockResponse: PaginatedResponse<DinnerDto> = {
				data: [
					{
						id: 1,
						dinner_date: dinnerDate,
						meal_type: 'Dinner',
						location: 'Church Hall',
						description: 'Fellowship dinner',
						max_participants: 50,
						uuid: 'uuid-1',
						recorded_by: null,
						created_at: '2026-02-25T10:00:00Z',
						updated_at: '2026-02-25T10:00:00Z',
					},
					{
						id: 2,
						dinner_date: dinnerDate,
						meal_type: 'Lunch',
						location: 'Community Center',
						description: 'Youth dinner',
						max_participants: 30,
						uuid: 'uuid-2',
						recorded_by: null,
						created_at: '2026-02-25T11:00:00Z',
						updated_at: '2026-02-25T11:00:00Z',
					},
				],
				pagination: {
					limit: 20,
					page: 1,
					total: 2,
					total_pages: 1,
				},
			};

			mockUnwrap.mockResolvedValue(mockResponse);

			const result = await repository.getByDate(dinnerDate);

			// Verify API call
			expect(appApi.get).toHaveBeenCalledWith(`/dinners?dinner_date=${dinnerDate}`);
			expect(mockUnwrap).toHaveBeenCalled();

			// Verify transformation to domain model array
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				id: 1,
				dinnerDate: dinnerDate,
				mealType: 'Dinner',
				location: 'Church Hall',
				description: 'Fellowship dinner',
				maxParticipants: 50,
				uuid: 'uuid-1',
				recordedBy: null,
				createdAt: '2026-02-25T10:00:00Z',
				updatedAt: '2026-02-25T10:00:00Z',
			});
			expect(result[1]).toEqual({
				id: 2,
				dinnerDate: dinnerDate,
				mealType: 'Lunch',
				location: 'Community Center',
				description: 'Youth dinner',
				maxParticipants: 30,
				uuid: 'uuid-2',
				recordedBy: null,
				createdAt: '2026-02-25T11:00:00Z',
				updatedAt: '2026-02-25T11:00:00Z',
			});
		});

		it('should return single dinner as array', async () => {
			const dinnerDate = '2026-02-28';
			const mockResponse: PaginatedResponse<DinnerDto> = {
				data: [
					{
						id: 1,
						dinner_date: dinnerDate,
						meal_type: 'Breakfast',
						location: 'Church Hall',
						description: 'Fellowship dinner',
						max_participants: 50,
						uuid: 'uuid-3',
						recorded_by: null,
						created_at: '2026-02-25T10:00:00Z',
						updated_at: '2026-02-25T10:00:00Z',
					},
				],
				pagination: {
					limit: 20,
					page: 1,
					total: 1,
					total_pages: 1,
				},
			};

			mockUnwrap.mockResolvedValue(mockResponse);

			const result = await repository.getByDate(dinnerDate);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(1);
		});

		it('should return empty array when no dinners found', async () => {
			const dinnerDate = '2026-03-15';
			const mockResponse: PaginatedResponse<DinnerDto> = {
				data: [],
				pagination: {
					limit: 20,
					page: 1,
					total: 0,
					total_pages: 0,
				},
			};

			mockUnwrap.mockResolvedValue(mockResponse);

			const result = await repository.getByDate(dinnerDate);

			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});

		it('should handle dinners with null optional fields', async () => {
			const dinnerDate = '2026-03-01';
			const mockResponse: PaginatedResponse<DinnerDto> = {
				data: [
					{
						id: 2,
						dinner_date: dinnerDate,
						meal_type: 'Lunch',
						location: null,
						description: null,
						max_participants: null,
						uuid: 'uuid-4',
						recorded_by: null,
						created_at: '2026-02-25T10:00:00Z',
						updated_at: '2026-02-25T10:00:00Z',
					},
				],
				pagination: {
					limit: 20,
					page: 1,
					total: 1,
					total_pages: 1,
				},
			};

			mockUnwrap.mockResolvedValue(mockResponse);

			const result = await repository.getByDate(dinnerDate);

			expect(result[0].location).toBeNull();
			expect(result[0].description).toBeNull();
			expect(result[0].maxParticipants).toBeNull();
		});

		it('should propagate API errors', async () => {
			const dinnerDate = '2026-03-05';
			const apiError = new Error('Network error');

			mockUnwrap.mockRejectedValue(apiError);

			await expect(repository.getByDate(dinnerDate)).rejects.toThrow('Network error');
		});

		it('should handle 404 not found errors', async () => {
			const dinnerDate = '2026-03-10';
			const notFoundError = new Error('Dinner not found');

			mockUnwrap.mockRejectedValue(notFoundError);

			await expect(repository.getByDate(dinnerDate)).rejects.toThrow('Dinner not found');
		});

		it('should URL-encode date parameter', async () => {
			const dinnerDate = '2026-02-28';
			const mockResponse: PaginatedResponse<DinnerDto> = {
				data: [
					{
						id: 3,
						dinner_date: dinnerDate,
						meal_type: 'Dinner',
						location: 'Hall',
						description: 'Test',
						max_participants: 10,
						uuid: 'uuid-5',
						recorded_by: null,
						created_at: '2026-02-25T10:00:00Z',
						updated_at: '2026-02-25T10:00:00Z',
					},
				],
				pagination: {
					limit: 20,
					page: 1,
					total: 1,
					total_pages: 1,
				},
			};

			mockUnwrap.mockResolvedValue(mockResponse);

			await repository.getByDate(dinnerDate);

			// Verify the date is properly included in query string
			expect(appApi.get).toHaveBeenCalledWith(
				expect.stringContaining(`dinner_date=${dinnerDate}`)
			);
		});
	});

	describe('addParticipant', () => {
		it('should add participant and return domain model', async () => {
			const dinnerId = 5;
			const input = {
				username: 'john_doe',
				notes: 'Vegetarian',
			};
			const mockDto: ParticipantDto = {
				id: 10,
				dinner_id: dinnerId,
				username: input.username,
				notes: input.notes,
				created_at: '2026-02-25T14:00:00Z',
				updated_at: '2026-02-25T14:00:00Z',
			};

			mockUnwrap.mockResolvedValue(mockDto);

			const result = await repository.addParticipant(dinnerId, input);

			// Verify API call
			expect(appApi.post).toHaveBeenCalledWith(
				`/dinners/${dinnerId}/participants`,
				input
			);
			expect(mockUnwrap).toHaveBeenCalled();

			// Verify transformation to domain model
			expect(result).toEqual({
				id: 10,
				dinnerId: dinnerId,
				username: 'john_doe',
				notes: 'Vegetarian',
				createdAt: '2026-02-25T14:00:00Z',
				updatedAt: '2026-02-25T14:00:00Z',
			});
		});

		it('should handle empty notes', async () => {
			const dinnerId = 8;
			const input = {
				username: 'jane_smith',
				notes: '',
			};
			const mockDto: ParticipantDto = {
				id: 20,
				dinner_id: dinnerId,
				username: input.username,
				notes: input.notes,
				created_at: '2026-02-26T09:00:00Z',
				updated_at: '2026-02-26T09:00:00Z',
			};

			mockUnwrap.mockResolvedValue(mockDto);

			const result = await repository.addParticipant(dinnerId, input);

			expect(result.notes).toBe('');
		});

		it('should propagate API errors', async () => {
			const dinnerId = 10;
			const input = {
				username: 'test_user',
				notes: 'Test',
			};
			const apiError = new Error('Failed to create participant');

			mockUnwrap.mockRejectedValue(apiError);

			await expect(repository.addParticipant(dinnerId, input)).rejects.toThrow(
				'Failed to create participant'
			);
		});

		it('should handle validation errors', async () => {
			const dinnerId = 12;
			const input = {
				username: '',
				notes: 'Invalid username',
			};
			const validationError = new Error('Username is required');

			mockUnwrap.mockRejectedValue(validationError);

			await expect(repository.addParticipant(dinnerId, input)).rejects.toThrow(
				'Username is required'
			);
		});

		it('should handle dinner not found errors', async () => {
			const dinnerId = 999;
			const input = {
				username: 'test_user',
				notes: 'Test',
			};
			const notFoundError = new Error('Dinner not found');

			mockUnwrap.mockRejectedValue(notFoundError);

			await expect(repository.addParticipant(dinnerId, input)).rejects.toThrow(
				'Dinner not found'
			);
		});

		it('should use correct endpoint path with dinner ID', async () => {
			const dinnerId = 42;
			const input = {
				username: 'alice',
				notes: 'No allergies',
			};
			const mockDto: ParticipantDto = {
				id: 100,
				dinner_id: dinnerId,
				username: input.username,
				notes: input.notes,
				created_at: '2026-02-27T11:00:00Z',
				updated_at: '2026-02-27T11:00:00Z',
			};

			mockUnwrap.mockResolvedValue(mockDto);

			await repository.addParticipant(dinnerId, input);

			// Verify the dinner ID is properly included in path
			expect(appApi.post).toHaveBeenCalledWith(
				`/dinners/${dinnerId}/participants`,
				expect.any(Object)
			);
		});
	});

	describe('Interface compliance', () => {
		it('should implement DinnersQueryRepository', () => {
			expect(repository.getByDate).toBeDefined();
			expect(typeof repository.getByDate).toBe('function');
		});

		it('should implement DinnersMutationRepository', () => {
			expect(repository.addParticipant).toBeDefined();
			expect(typeof repository.addParticipant).toBe('function');
		});

		it('should implement full DinnersRepository interface', () => {
			expect(repository.getByDate).toBeDefined();
			expect(repository.addParticipant).toBeDefined();
		});
	});
});

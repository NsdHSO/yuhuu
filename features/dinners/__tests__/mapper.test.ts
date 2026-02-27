import { toDinner, toParticipant, toParticipantDtoInput } from '../mapper';
import type { DinnerDto, ParticipantDto, ParticipantInput } from '../types';

describe('dinners/mapper', () => {
	describe('toDinner', () => {
		it('should convert DinnerDto to Dinner domain model', () => {
			const dto: DinnerDto = {
				id: 1,
				dinner_date: '2026-02-28',
				location: 'Church Hall',
				description: 'Fellowship dinner',
				max_participants: 50,
				created_at: '2026-02-25T10:00:00Z',
				updated_at: '2026-02-25T10:00:00Z',
			};

			const result = toDinner(dto);

			expect(result).toEqual({
				id: 1,
				dinnerDate: '2026-02-28',
				location: 'Church Hall',
				description: 'Fellowship dinner',
				maxParticipants: 50,
				createdAt: '2026-02-25T10:00:00Z',
				updatedAt: '2026-02-25T10:00:00Z',
			});
		});

		it('should handle null optional fields', () => {
			const dto: DinnerDto = {
				id: 2,
				dinner_date: '2026-03-01',
				location: null,
				description: null,
				max_participants: null,
				created_at: '2026-02-25T10:00:00Z',
				updated_at: '2026-02-25T10:00:00Z',
			};

			const result = toDinner(dto);

			expect(result).toEqual({
				id: 2,
				dinnerDate: '2026-03-01',
				location: null,
				description: null,
				maxParticipants: null,
				createdAt: '2026-02-25T10:00:00Z',
				updatedAt: '2026-02-25T10:00:00Z',
			});
		});

		it('should handle undefined optional fields', () => {
			const dto: DinnerDto = {
				id: 3,
				dinner_date: '2026-03-05',
				location: undefined,
				description: undefined,
				max_participants: undefined,
				created_at: '2026-02-25T10:00:00Z',
				updated_at: '2026-02-25T10:00:00Z',
			};

			const result = toDinner(dto);

			expect(result).toEqual({
				id: 3,
				dinnerDate: '2026-03-05',
				location: undefined,
				description: undefined,
				maxParticipants: undefined,
				createdAt: '2026-02-25T10:00:00Z',
				updatedAt: '2026-02-25T10:00:00Z',
			});
		});

		it('should correctly convert snake_case to camelCase', () => {
			const dto: DinnerDto = {
				id: 4,
				dinner_date: '2026-03-10',
				location: 'Main Hall',
				description: 'Easter dinner',
				max_participants: 100,
				created_at: '2026-02-25T12:00:00Z',
				updated_at: '2026-02-26T08:00:00Z',
			};

			const result = toDinner(dto);

			// Ensure all snake_case fields are converted
			expect(result.dinnerDate).toBe(dto.dinner_date);
			expect(result.maxParticipants).toBe(dto.max_participants);
			expect(result.createdAt).toBe(dto.created_at);
			expect(result.updatedAt).toBe(dto.updated_at);
		});
	});

	describe('toParticipant', () => {
		it('should convert ParticipantDto to Participant domain model', () => {
			const dto: ParticipantDto = {
				id: 10,
				dinner_id: 5,
				username: 'john_doe',
				notes: 'Vegetarian',
				created_at: '2026-02-25T14:00:00Z',
				updated_at: '2026-02-25T14:00:00Z',
			};

			const result = toParticipant(dto);

			expect(result).toEqual({
				id: 10,
				dinnerId: 5,
				username: 'john_doe',
				notes: 'Vegetarian',
				createdAt: '2026-02-25T14:00:00Z',
				updatedAt: '2026-02-25T14:00:00Z',
			});
		});

		it('should correctly convert snake_case to camelCase', () => {
			const dto: ParticipantDto = {
				id: 20,
				dinner_id: 15,
				username: 'jane_smith',
				notes: 'No allergies',
				created_at: '2026-02-26T09:00:00Z',
				updated_at: '2026-02-26T10:00:00Z',
			};

			const result = toParticipant(dto);

			// Ensure all snake_case fields are converted
			expect(result.dinnerId).toBe(dto.dinner_id);
			expect(result.createdAt).toBe(dto.created_at);
			expect(result.updatedAt).toBe(dto.updated_at);
		});

		it('should handle empty notes', () => {
			const dto: ParticipantDto = {
				id: 30,
				dinner_id: 25,
				username: 'bob_wilson',
				notes: '',
				created_at: '2026-02-27T11:00:00Z',
				updated_at: '2026-02-27T11:00:00Z',
			};

			const result = toParticipant(dto);

			expect(result.notes).toBe('');
		});
	});

	describe('toParticipantDtoInput', () => {
		it('should pass through ParticipantInput unchanged', () => {
			const input: ParticipantInput = {
				username: 'test_user',
				notes: 'Test notes',
			};

			const result = toParticipantDtoInput(input);

			expect(result).toEqual({
				username: 'test_user',
				notes: 'Test notes',
			});
		});

		it('should handle empty strings', () => {
			const input: ParticipantInput = {
				username: '',
				notes: '',
			};

			const result = toParticipantDtoInput(input);

			expect(result).toEqual({
				username: '',
				notes: '',
			});
		});

		it('should handle whitespace', () => {
			const input: ParticipantInput = {
				username: '  spaced  ',
				notes: '  lots of   spaces  ',
			};

			const result = toParticipantDtoInput(input);

			// Mapper doesn't trim - that's the caller's responsibility
			expect(result.username).toBe('  spaced  ');
			expect(result.notes).toBe('  lots of   spaces  ');
		});
	});
});

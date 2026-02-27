import type { Dinner, DinnerDto, Participant, ParticipantDto, ParticipantInput } from './types';

/**
 * SOLID Principles:
 * - Single Responsibility: Each mapper has one job - transform between layers
 * - Open/Closed: Open for extension (new fields) without modifying behavior
 * - Dependency Inversion: Mappers depend on abstractions (types), not concrete implementations
 */

/**
 * Converts a DinnerDto from the API layer to a Dinner domain model
 * SRP: Single responsibility - pure data transformation
 */
export function toDinner(dto: DinnerDto): Dinner {
	return {
		id: dto.id,
		dinnerDate: dto.dinner_date,
		mealType: dto.meal_type,
		description: dto.description,
		location: dto.location,
		maxParticipants: dto.max_participants,
		recordedBy: dto.recorded_by,
		uuid: dto.uuid,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at,
	};
}

/**
 * Converts a ParticipantDto from the API layer to a Participant domain model
 * SRP: Single responsibility - pure data transformation
 */
export function toParticipant(dto: ParticipantDto): Participant {
	return {
		id: dto.id,
		dinnerId: dto.dinner_id,
		username: dto.username,
		notes: dto.notes,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at,
	};
}

/**
 * Converts a ParticipantInput to the format expected by the API
 * SRP: Single responsibility - pure data transformation
 */
export function toParticipantDtoInput(input: ParticipantInput) {
	return {
		username: input.username,
		notes: input.notes,
	};
}

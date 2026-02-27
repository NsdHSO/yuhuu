/**
 * SOLID Principles:
 * - Single Responsibility: Each type represents one specific domain concept
 * - Open/Closed: Types are open for extension (new fields) without breaking existing code
 */

// DTO Types (API layer)
export type DinnerDto = {
	id: number;
	dinner_date: string; // YYYY-MM-DD
	meal_type: string; // e.g., "Lunch", "Dinner", "Breakfast"
	description?: string | null;
	location?: string | null;
	max_participants?: number | null;
	recorded_by?: string | null;
	uuid: string;
	created_at: string;
	updated_at: string;
};

export type ParticipantDto = {
	id: number;
	dinner_id: number;
	username: string;
	notes: string;
	created_at: string;
	updated_at: string;
};

/**
 * Paginated API response wrapper
 * Single Responsibility: Represents pagination metadata
 */
export type PaginatedResponse<T> = {
	data: T[];
	pagination: {
		limit: number;
		page: number;
		total: number;
		total_pages: number;
	};
};

/**
 * Participants by dinner response
 * This endpoint returns dinner details + participants array
 */
export type ParticipantsByDinnerResponse = {
	dinner: DinnerDto;
	participants: ParticipantDto[];
};

// Domain Types (App layer)
export type Dinner = {
	id: number;
	dinnerDate: string;
	mealType: string;
	description?: string | null;
	location?: string | null;
	maxParticipants?: number | null;
	recordedBy?: string | null;
	uuid: string;
	createdAt: string;
	updatedAt: string;
};

export type Participant = {
	id: number;
	dinnerId: number;
	username: string;
	notes: string;
	createdAt: string;
	updatedAt: string;
};

/**
 * Input type for creating a participant
 * Interface Segregation: Separates input from full model
 */
export type ParticipantInput = {
	username: string;
	notes: string;
};

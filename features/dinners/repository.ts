import { appApi } from '@/lib/api';
import { unwrap } from '@/lib/http/envelope';
import type {
	Dinner,
	DinnerDto,
	Participant,
	ParticipantDto,
	ParticipantInput,
	PaginatedResponse,
	ParticipantsByDinnerResponse,
} from './types';
import { toDinner, toParticipant, toParticipantDtoInput } from './mapper';

/**
 * SOLID Principles Applied:
 * - Single Responsibility: Repository only handles data access, not business logic
 * - Open/Closed: Open for extension (new methods), closed for modification
 * - Liskov Substitution: Implementations can be substituted without breaking contracts
 * - Interface Segregation: Separate read and write operations
 * - Dependency Inversion: Depend on abstractions (interfaces), not concrete implementations
 */

/**
 * Interface Segregation Principle: Separate read operations
 * Query repository interface for read-only operations
 */
export interface DinnersQueryRepository {
	getByDate(dinnerDate: string): Promise<Dinner[]>;
	getParticipantsByDinner(dinnerId: number): Promise<Participant[]>;
}

/**
 * Interface Segregation Principle: Separate write operations
 * Mutation repository interface for write operations
 */
export interface DinnersMutationRepository {
	addParticipant(dinnerId: number, input: ParticipantInput): Promise<Participant>;
}

/**
 * Dependency Inversion Principle: Depend on abstractions
 * Combined interface for full repository capabilities
 */
export interface DinnersRepository extends DinnersQueryRepository, DinnersMutationRepository {}

/**
 * Concrete HTTP implementation of the DinnersRepository
 * Open/Closed Principle: Open for extension (new implementations) without modifying existing code
 * Liskov Substitution Principle: Fully substitutable with interface
 */
export class HttpDinnersRepository implements DinnersRepository {
	/**
	 * Fetches all dinners for a specific date
	 * Single Responsibility: Only handles API communication and data transformation
	 *
	 * @param dinnerDate - Date in YYYY-MM-DD format
	 * @returns Array of Dinner domain models (can be empty, single, or multiple)
	 */
	async getByDate(dinnerDate: string): Promise<Dinner[]> {
		const response = await unwrap<PaginatedResponse<DinnerDto>>(
			appApi.get(`/dinners?dinner_date=${dinnerDate}`)
		);
		return response.data.map(toDinner);
	}

	/**
	 * Fetches all participants for a specific dinner
	 * Single Responsibility: Only handles API communication and data transformation
	 *
	 * @param dinnerId - ID of the dinner
	 * @returns Array of Participant domain models
	 */
	async getParticipantsByDinner(dinnerId: number): Promise<Participant[]> {
		const response = await unwrap<ParticipantsByDinnerResponse>(
			appApi.get(`/dinners/${dinnerId}/participants`)
		);
		return response.participants.map(toParticipant);
	}

	/**
	 * Adds a participant to a dinner
	 * Single Responsibility: Only handles API communication and data transformation
	 *
	 * @param dinnerId - ID of the dinner
	 * @param input - Participant data (username, notes)
	 * @returns Created participant domain model
	 */
	async addParticipant(dinnerId: number, input: ParticipantInput): Promise<Participant> {
		const dto = await unwrap<ParticipantDto>(
			appApi.post(`/dinners/${dinnerId}/participants`, toParticipantDtoInput(input))
		);
		return toParticipant(dto);
	}
}

/**
 * Default repository instance for dependency injection
 * Dependency Inversion Principle: Consumers depend on DinnersRepository interface
 */
export const defaultDinnersRepository: DinnersRepository = new HttpDinnersRepository();

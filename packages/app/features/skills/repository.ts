/**
 * User Skills Feature - Repository Layer
 *
 * SOLID Principles:
 * - Dependency Inversion: Components depend on SkillsRepository interface, not concrete implementation
 * - Single Responsibility: Repository handles only data access, no business logic
 * - Interface Segregation: Clean interface with only necessary methods
 */

import {appApi, unwrap} from '@yuhuu/auth';
import type {CreateUserSkillInput, UpdateUserSkillInput, UserSkill} from './types';

/**
 * Repository interface for user skills operations.
 * Enables dependency injection and testing with mock implementations.
 */
export interface SkillsRepository {
    /**
     * List all skills for the authenticated user.
     * @returns Array of UserSkill records
     * @throws Error on network or server errors
     */
    listMySkills(): Promise<UserSkill[]>;

    /**
     * Get a specific skill by ID.
     * @param id - The skill ID
     * @returns UserSkill or null if not found
     * @throws Error on network or server errors (except 404)
     */
    getMySkill(id: number): Promise<UserSkill | null>;

    /**
     * Create a new skill for the authenticated user.
     * @param data - Skill data to create
     * @returns Created UserSkill
     * @throws Error on network, validation, or conflict (409) errors
     */
    createMySkill(data: CreateUserSkillInput): Promise<UserSkill>;

    /**
     * Update an existing skill (partial update).
     * @param id - The skill ID
     * @param data - Skill data to update
     * @returns Updated UserSkill
     * @throws Error on network, validation, or not found (404) errors
     */
    updateMySkill(id: number, data: UpdateUserSkillInput): Promise<UserSkill>;

    /**
     * Delete a skill.
     * @param id - The skill ID
     * @returns void
     * @throws Error on network or not found (404) errors
     */
    deleteMySkill(id: number): Promise<void>;
}

/**
 * HTTP implementation of SkillsRepository using the app API client.
 *
 * Uses the unwrap() helper to extract data from the envelope response format:
 * { data: T, code: number, message: string }
 */
export class HttpSkillsRepository implements SkillsRepository {
    async listMySkills(): Promise<UserSkill[]> {
        return await unwrap<UserSkill[]>(appApi.get('/profiles/me/skills'));
    }

    async getMySkill(id: number): Promise<UserSkill | null> {
        try {
            return await unwrap<UserSkill>(appApi.get(`/profiles/me/skills/${id}`));
        } catch (e: any) {
            // Return null for 404, re-throw other errors
            if (e?.response?.status === 404) return null;
            throw e;
        }
    }

    async createMySkill(data: CreateUserSkillInput): Promise<UserSkill> {
        return await unwrap<UserSkill>(appApi.post('/profiles/me/skills', data));
    }

    async updateMySkill(id: number, data: UpdateUserSkillInput): Promise<UserSkill> {
        return await unwrap<UserSkill>(appApi.put(`/profiles/me/skills/${id}`, data));
    }

    async deleteMySkill(id: number): Promise<void> {
        await unwrap<void>(appApi.delete(`/profiles/me/skills/${id}`));
    }
}

/**
 * Default repository instance for production use.
 * Tests should inject mock implementations instead.
 */
export const defaultSkillsRepository: SkillsRepository = new HttpSkillsRepository();

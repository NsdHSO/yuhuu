/**
 * Spiritual Milestones Feature - Repository Layer
 *
 * SOLID Principles:
 * - Dependency Inversion: Components depend on MilestonesRepository interface, not concrete implementation
 * - Single Responsibility: Repository handles only data access, no business logic
 * - Interface Segregation: Clean interface with only necessary methods
 */

import {appApi, unwrap} from '@yuhuu/auth';
import type {CreateSpiritualMilestoneInput, SpiritualMilestone, UpdateSpiritualMilestoneInput,} from './types';

/**
 * Repository interface for spiritual milestone operations.
 * Enables dependency injection and testing with mock implementations.
 */
export interface MilestonesRepository {
    /**
     * List all spiritual milestones for the authenticated user.
     * @returns Array of SpiritualMilestone records
     * @throws Error on network or server errors
     */
    listMyMilestones(): Promise<SpiritualMilestone[]>;

    /**
     * List all spiritual milestones for a specific user by ID.
     * @param userId - The user ID
     * @returns Array of SpiritualMilestone records
     * @throws Error on network or server errors
     */
    listUserMilestones(userId: number): Promise<SpiritualMilestone[]>;

    /**
     * Get a specific spiritual milestone by ID.
     * @param id - The milestone ID
     * @returns SpiritualMilestone or null if not found
     * @throws Error on network or server errors (except 404)
     */
    getMyMilestone(id: number): Promise<SpiritualMilestone | null>;

    /**
     * Create a new spiritual milestone for the authenticated user.
     * @param data - Milestone data to create
     * @returns Created SpiritualMilestone
     * @throws Error on network, validation, or conflict (409) errors
     */
    createMyMilestone(data: CreateSpiritualMilestoneInput): Promise<SpiritualMilestone>;

    /**
     * Update an existing spiritual milestone (partial update).
     * @param id - The milestone ID
     * @param data - Milestone data to update (milestone_type cannot be changed)
     * @returns Updated SpiritualMilestone
     * @throws Error on network, validation, or not found (404) errors
     */
    updateMyMilestone(id: number, data: UpdateSpiritualMilestoneInput): Promise<SpiritualMilestone>;

    /**
     * Delete a spiritual milestone.
     * @param id - The milestone ID
     * @returns void
     * @throws Error on network or not found (404) errors
     */
    deleteMyMilestone(id: number): Promise<void>;
}

/**
 * HTTP implementation of MilestonesRepository using the app API client.
 *
 * Uses the unwrap() helper to extract data from the envelope response format:
 * { data: T, code: number, message: string }
 */
export class HttpMilestonesRepository implements MilestonesRepository {
    async listMyMilestones(): Promise<SpiritualMilestone[]> {
        return await unwrap<SpiritualMilestone[]>(appApi.get('/profiles/me/milestones'));
    }

    async listUserMilestones(userId: number): Promise<SpiritualMilestone[]> {
        return await unwrap<SpiritualMilestone[]>(appApi.get(`/users/${userId}/milestones`));
    }

    async getMyMilestone(id: number): Promise<SpiritualMilestone | null> {
        try {
            return await unwrap<SpiritualMilestone>(appApi.get(`/profiles/me/milestones/${id}`));
        } catch (e: any) {
            // Return null for 404, re-throw other errors
            if (e?.response?.status === 404) return null;
            throw e;
        }
    }

    async createMyMilestone(data: CreateSpiritualMilestoneInput): Promise<SpiritualMilestone> {
        return await unwrap<SpiritualMilestone>(appApi.post('/profiles/me/milestones', data));
    }

    async updateMyMilestone(id: number, data: UpdateSpiritualMilestoneInput): Promise<SpiritualMilestone> {
        return await unwrap<SpiritualMilestone>(appApi.put(`/profiles/me/milestones/${id}`, data));
    }

    async deleteMyMilestone(id: number): Promise<void> {
        await unwrap<void>(appApi.delete(`/profiles/me/milestones/${id}`));
    }
}

/**
 * Default repository instance for production use.
 * Tests should inject mock implementations instead.
 */
export const defaultMilestonesRepository: MilestonesRepository = new HttpMilestonesRepository();

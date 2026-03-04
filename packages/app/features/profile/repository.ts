/**
 * Profile Feature - Repository Layer
 *
 * SOLID Principles:
 * - Dependency Inversion: Components depend on ProfileRepository interface, not concrete implementation
 * - Single Responsibility: Repository handles only data access, no business logic
 * - Interface Segregation: Clean interface with only necessary methods
 */

import {appApi, unwrap} from '@yuhuu/auth';
import type {ProfileInput, ProfileResponse} from './types';

/**
 * Repository interface for profile operations.
 * Enables dependency injection and testing with mock implementations.
 */
export interface ProfileRepository {
    /**
     * Get the authenticated user's profile.
     * @returns ProfileResponse or null if profile doesn't exist
     * @throws Error on network or server errors (except 404)
     */
    getMyProfile(): Promise<ProfileResponse | null>;

    /**
     * Create a new profile for the authenticated user.
     * @param data Profile data to create
     * @returns Created ProfileResponse
     * @throws Error on network, validation, or conflict (409) errors
     */
    createMyProfile(data: ProfileInput): Promise<ProfileResponse>;

    /**
     * Update the authenticated user's profile (partial update).
     * @param data Profile data to update
     * @returns Updated ProfileResponse
     * @throws Error on network, validation, or not found (404) errors
     */
    updateMyProfile(data: ProfileInput): Promise<ProfileResponse>;
}

/**
 * HTTP implementation of ProfileRepository using the app API client.
 *
 * Uses the unwrap() helper to extract data from the envelope response format:
 * { data: T, code: number, message: string }
 */
export class HttpProfileRepository implements ProfileRepository {
    async getMyProfile(): Promise<ProfileResponse | null> {
        try {
            return await unwrap<ProfileResponse>(appApi.get('/me/profile'));
        } catch (e: any) {
            // Return null for 404, re-throw other errors
            if (e?.response?.status === 404) return null;
            throw e;
        }
    }

    async createMyProfile(data: ProfileInput): Promise<ProfileResponse> {
        return await unwrap<ProfileResponse>(appApi.post('/me/profile', data));
    }

    async updateMyProfile(data: ProfileInput): Promise<ProfileResponse> {
        return await unwrap<ProfileResponse>(appApi.put('/me/profile', data));
    }
}

/**
 * Default repository instance for production use.
 * Tests should inject mock implementations instead.
 */
export const defaultProfileRepository: ProfileRepository = new HttpProfileRepository();

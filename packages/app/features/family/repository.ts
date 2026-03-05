/**
 * Family Relationships Feature - Repository Layer
 *
 * SOLID Principles:
 * - Dependency Inversion: Components depend on FamilyRepository interface, not concrete implementation
 * - Single Responsibility: Repository handles only data access, no business logic
 * - Interface Segregation: Clean interface with only necessary methods
 */

import {appApi, unwrap} from '@yuhuu/auth';
import type {CreateFamilyRelationshipInput, FamilyRelationship, UpdateFamilyRelationshipInput,} from './types';

/**
 * Repository interface for family relationship operations.
 * Enables dependency injection and testing with mock implementations.
 */
export interface FamilyRepository {
    /**
     * List all family relationships for the authenticated user.
     * @returns Array of FamilyRelationship records
     * @throws Error on network or server errors
     */
    listMyFamily(): Promise<FamilyRelationship[]>;

    /**
     * List all family relationships for a specific user (admin use).
     * @param userId - The user ID to fetch family for
     * @returns Array of FamilyRelationship records
     * @throws Error on network or server errors
     */
    listUserFamily(userId: number): Promise<FamilyRelationship[]>;

    /**
     * Get a specific family relationship by ID.
     * @param id - The family relationship ID
     * @returns FamilyRelationship or null if not found
     * @throws Error on network or server errors (except 404)
     */
    getMyFamilyRelationship(id: number): Promise<FamilyRelationship | null>;

    /**
     * Create a new family relationship for the authenticated user.
     * @param data - Family relationship data to create
     * @returns Created FamilyRelationship
     * @throws Error on network, validation errors
     */
    createMyFamilyRelationship(data: CreateFamilyRelationshipInput): Promise<FamilyRelationship>;

    /**
     * Update an existing family relationship (partial update).
     * @param id - The family relationship ID
     * @param data - Family relationship data to update
     * @returns Updated FamilyRelationship
     * @throws Error on network, validation, or not found (404) errors
     */
    updateMyFamilyRelationship(id: number, data: UpdateFamilyRelationshipInput): Promise<FamilyRelationship>;

    /**
     * Delete a family relationship.
     * @param id - The family relationship ID
     * @returns void
     * @throws Error on network or not found (404) errors
     */
    deleteMyFamilyRelationship(id: number): Promise<void>;

    /**
     * Create a new family relationship for a specific user (admin use).
     * @param userId - The user ID to create family relationship for
     * @param data - Family relationship data to create
     * @returns Created FamilyRelationship
     * @throws Error on network, validation errors
     */
    createUserFamilyRelationship(userId: number, data: CreateFamilyRelationshipInput): Promise<FamilyRelationship>;

    /**
     * Update an existing family relationship for a specific user (admin use).
     * @param userId - The user ID
     * @param id - The family relationship ID
     * @param data - Family relationship data to update
     * @returns Updated FamilyRelationship
     * @throws Error on network, validation, or not found (404) errors
     */
    updateUserFamilyRelationship(userId: number, id: number, data: UpdateFamilyRelationshipInput): Promise<FamilyRelationship>;

    /**
     * Delete a family relationship for a specific user (admin use).
     * @param userId - The user ID
     * @param id - The family relationship ID
     * @returns void
     * @throws Error on network or not found (404) errors
     */
    deleteUserFamilyRelationship(userId: number, id: number): Promise<void>;
}

/**
 * HTTP implementation of FamilyRepository using the app API client.
 *
 * Uses the unwrap() helper to extract data from the envelope response format:
 * { data: T, code: number, message: string }
 */
export class HttpFamilyRepository implements FamilyRepository {
    async listMyFamily(): Promise<FamilyRelationship[]> {
        return await unwrap<FamilyRelationship[]>(appApi.get('/profiles/me/family'));
    }

    async listUserFamily(userId: number): Promise<FamilyRelationship[]> {
        return await unwrap<FamilyRelationship[]>(appApi.get(`/admin/users/${userId}/family`));
    }

    async getMyFamilyRelationship(id: number): Promise<FamilyRelationship | null> {
        try {
            return await unwrap<FamilyRelationship>(appApi.get(`/profiles/me/family/${id}`));
        } catch (e: any) {
            // Return null for 404, re-throw other errors
            if (e?.response?.status === 404) return null;
            throw e;
        }
    }

    async createMyFamilyRelationship(data: CreateFamilyRelationshipInput): Promise<FamilyRelationship> {
        return await unwrap<FamilyRelationship>(appApi.post('/profiles/me/family', data));
    }

    async updateMyFamilyRelationship(id: number, data: UpdateFamilyRelationshipInput): Promise<FamilyRelationship> {
        return await unwrap<FamilyRelationship>(appApi.put(`/profiles/me/family/${id}`, data));
    }

    async deleteMyFamilyRelationship(id: number): Promise<void> {
        await unwrap<void>(appApi.delete(`/profiles/me/family/${id}`));
    }

    async createUserFamilyRelationship(userId: number, data: CreateFamilyRelationshipInput): Promise<FamilyRelationship> {
        return await unwrap<FamilyRelationship>(appApi.post(`/admin/users/${userId}/family`, data));
    }

    async updateUserFamilyRelationship(userId: number, id: number, data: UpdateFamilyRelationshipInput): Promise<FamilyRelationship> {
        return await unwrap<FamilyRelationship>(appApi.put(`/admin/users/${userId}/family/${id}`, data));
    }

    async deleteUserFamilyRelationship(userId: number, id: number): Promise<void> {
        await unwrap<void>(appApi.delete(`/admin/users/${userId}/family/${id}`));
    }
}

/**
 * Default repository instance for production use.
 * Tests should inject mock implementations instead.
 */
export const defaultFamilyRepository: FamilyRepository = new HttpFamilyRepository();

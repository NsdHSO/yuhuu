/**
 * Membership History Feature - Repository Layer
 *
 * SOLID Principles:
 * - Dependency Inversion: Components depend on MembershipRepository interface, not concrete implementation
 * - Single Responsibility: Repository handles only data access, no business logic
 * - Interface Segregation: Clean interface with only necessary methods
 */

import {appApi, unwrap} from '@yuhuu/auth';
import type {
    MembershipHistory,
    CreateMembershipHistoryInput,
    UpdateMembershipHistoryInput,
} from './types';

/**
 * Repository interface for membership history operations.
 * Enables dependency injection and testing with mock implementations.
 */
export interface MembershipRepository {
    /**
     * List all membership history records for the authenticated user.
     * @returns Array of MembershipHistory records
     * @throws Error on network or server errors
     */
    listMyMembershipHistory(): Promise<MembershipHistory[]>;

    /**
     * Get a specific membership history record by ID.
     * @param id - The membership history ID
     * @returns MembershipHistory or null if not found
     * @throws Error on network or server errors (except 404)
     */
    getMyMembershipHistory(id: number): Promise<MembershipHistory | null>;

    /**
     * Create a new membership history record for the authenticated user.
     * @param data - Membership history data to create
     * @returns Created MembershipHistory
     * @throws Error on network, validation, or conflict (409) errors
     */
    createMyMembershipHistory(data: CreateMembershipHistoryInput): Promise<MembershipHistory>;

    /**
     * Update an existing membership history record (partial update).
     * @param id - The membership history ID
     * @param data - Membership history data to update
     * @returns Updated MembershipHistory
     * @throws Error on network, validation, or not found (404) errors
     */
    updateMyMembershipHistory(id: number, data: UpdateMembershipHistoryInput): Promise<MembershipHistory>;

    /**
     * Delete a membership history record.
     * @param id - The membership history ID
     * @returns void
     * @throws Error on network or not found (404) errors
     */
    deleteMyMembershipHistory(id: number): Promise<void>;
}

/**
 * HTTP implementation of MembershipRepository using the app API client.
 *
 * Uses the unwrap() helper to extract data from the envelope response format:
 * { data: T, code: number, message: string }
 */
export class HttpMembershipRepository implements MembershipRepository {
    async listMyMembershipHistory(): Promise<MembershipHistory[]> {
        return await unwrap<MembershipHistory[]>(appApi.get('/profiles/me/membership-history'));
    }

    async getMyMembershipHistory(id: number): Promise<MembershipHistory | null> {
        try {
            return await unwrap<MembershipHistory>(appApi.get(`/profiles/me/membership-history/${id}`));
        } catch (e: any) {
            // Return null for 404, re-throw other errors
            if (e?.response?.status === 404) return null;
            throw e;
        }
    }

    async createMyMembershipHistory(data: CreateMembershipHistoryInput): Promise<MembershipHistory> {
        return await unwrap<MembershipHistory>(appApi.post('/profiles/me/membership-history', data));
    }

    async updateMyMembershipHistory(id: number, data: UpdateMembershipHistoryInput): Promise<MembershipHistory> {
        return await unwrap<MembershipHistory>(appApi.put(`/profiles/me/membership-history/${id}`, data));
    }

    async deleteMyMembershipHistory(id: number): Promise<void> {
        await unwrap<void>(appApi.delete(`/profiles/me/membership-history/${id}`));
    }
}

/**
 * Default repository instance for production use.
 * Tests should inject mock implementations instead.
 */
export const defaultMembershipRepository: MembershipRepository = new HttpMembershipRepository();

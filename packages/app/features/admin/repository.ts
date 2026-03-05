/**
 * Admin Feature - Repository Layer
 *
 * SOLID Principles:
 * - Dependency Inversion: Components depend on AdminRepository interface, not concrete implementation
 * - Single Responsibility: Repository handles only data access, no business logic
 */

import {appApi, unwrap} from '@yuhuu/auth';

export interface UserSearchResult {
    id: number;
    user_id: number; // References users.id
    middle_name?: string;
    phone?: string;
    profile_picture_url?: string;
}

/**
 * Repository interface for admin operations.
 */
export interface AdminRepository {
    /**
     * Search for users by name
     * @param searchTerm The name to search for
     * @returns Array of matching users (can be empty)
     */
    searchUsers(searchTerm: string): Promise<UserSearchResult[]>;
}

/**
 * HTTP implementation of AdminRepository using the app API client.
 */
export class HttpAdminRepository implements AdminRepository {
    async searchUsers(searchTerm: string): Promise<UserSearchResult[]> {
        if (!searchTerm.trim()) {
            return [];
        }

        try {
            // Backend should provide: GET /admin/users/search?q={searchTerm}
            // Searches by middle_name (partial match)
            // Returns array of user profiles matching the search term
            const results = await unwrap<UserSearchResult[]>(
                appApi.get(`/admin/users/search`, { params: { q: searchTerm.trim() } })
            );
            return results || [];
        } catch (e: any) {
            // Return empty array for 404 (no results), re-throw other errors
            if (e?.response?.status === 404) return [];
            throw e;
        }
    }
}

/**
 * Default repository instance for production use.
 */
export const defaultAdminRepository: AdminRepository = new HttpAdminRepository();

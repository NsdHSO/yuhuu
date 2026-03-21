import {appApi, unwrap} from '@yuhuu/auth';
import type {
  VisitableFamily,
  VisitAssignment,
  VisitAssignmentWithFamily,
  CreateVisitableFamilyInput,
  UpdateVisitableFamilyInput,
  CreateVisitAssignmentInput,
  UpdateVisitAssignmentInput,
} from '@yuhuu/types';

/**
 * SOLID Principles Applied:
 * - Single Responsibility: Repository only handles data access, not business logic
 * - Open/Closed: Open for extension (new methods), closed for modification
 * - Liskov Substitution: Implementations can be substituted without breaking contracts
 * - Interface Segregation: Separate read and write operations
 * - Dependency Inversion: Depend on abstractions (interfaces), not concrete implementations
 */

/**
 * Visits Repository Interface
 * Defines all operations for family visits management
 */
export interface VisitsRepository {
  // Family CRUD operations
  listFamilies(): Promise<VisitableFamily[]>;
  getFamily(id: number): Promise<VisitableFamily>;
  createFamily(data: CreateVisitableFamilyInput): Promise<VisitableFamily>;
  updateFamily(id: number, data: UpdateVisitableFamilyInput): Promise<VisitableFamily>;
  deleteFamily(id: number): Promise<void>;

  // Assignment CRUD operations
  listAllAssignments(): Promise<VisitAssignment[]>;
  listMyAssignments(): Promise<VisitAssignmentWithFamily[]>;
  createAssignment(data: CreateVisitAssignmentInput): Promise<VisitAssignment>;
  updateAssignment(id: number, data: UpdateVisitAssignmentInput): Promise<VisitAssignment>;
  deleteAssignment(id: number): Promise<void>;

  // Tracking operations
  markArrived(id: number, latitude: number, longitude: number): Promise<VisitAssignment>;
  markCompleted(id: number): Promise<VisitAssignment>;
}

/**
 * HTTP implementation of VisitsRepository with real API calls
 * Connects to backend at http://localhost:8080/v1
 *
 * Open/Closed Principle: Open for extension without modifying interface
 * Liskov Substitution Principle: Fully substitutable with interface
 */
export class HttpVisitsRepository implements VisitsRepository {
  // Family CRUD operations
  async listFamilies(): Promise<VisitableFamily[]> {
    return await unwrap<VisitableFamily[]>(
      appApi.get('/admin/visits/families')
    );
  }

  async getFamily(id: number): Promise<VisitableFamily> {
    return await unwrap<VisitableFamily>(
      appApi.get(`/admin/visits/families/${id}`)
    );
  }

  async createFamily(data: CreateVisitableFamilyInput): Promise<VisitableFamily> {
    // Client-side validation: GPS required even though backend allows optional
    if (data.latitude === undefined || data.longitude === undefined) {
      throw new Error('GPS coordinates are required');
    }

    return await unwrap<VisitableFamily>(
      appApi.post('/admin/visits/families', data)
    );
  }

  async updateFamily(
    id: number,
    data: UpdateVisitableFamilyInput
  ): Promise<VisitableFamily> {
    return await unwrap<VisitableFamily>(
      appApi.put(`/admin/visits/families/${id}`, data)
    );
  }

  async deleteFamily(id: number): Promise<void> {
    // Backend returns 200 with message, not 204
    // unwrap() extracts data but we discard it for void return
    await unwrap(appApi.delete(`/admin/visits/families/${id}`));
  }

  // Assignment CRUD operations
  async listAllAssignments(): Promise<VisitAssignment[]> {
    // Admin endpoint - returns assignments with embedded family/user
    return await unwrap<VisitAssignment[]>(
      appApi.get('/admin/visits/assignments')
    );
  }

  async listMyAssignments(): Promise<VisitAssignmentWithFamily[]> {
    // User endpoint - returns assignments with full family data
    return await unwrap<VisitAssignmentWithFamily[]>(
      appApi.get('/visits/my-assignments')
    );
  }

  async createAssignment(
    data: CreateVisitAssignmentInput
  ): Promise<VisitAssignment> {
    return await unwrap<VisitAssignment>(
      appApi.post('/admin/visits/assignments', data)
    );
  }

  async updateAssignment(
    id: number,
    data: UpdateVisitAssignmentInput
  ): Promise<VisitAssignment> {
    // Same endpoint for admin (all fields) and user (notes only)
    return await unwrap<VisitAssignment>(
      appApi.put(`/visits/assignments/${id}`, data)
    );
  }

  async deleteAssignment(id: number): Promise<void> {
    // Backend returns 200 with message, not 204
    await unwrap(appApi.delete(`/admin/visits/assignments/${id}`));
  }

  // Tracking operations
  async markArrived(
    id: number,
    latitude: number,
    longitude: number
  ): Promise<VisitAssignment> {
    // Backend stores GPS and returns assignment with arrived_latitude/longitude
    return await unwrap<VisitAssignment>(
      appApi.post(`/visits/assignments/${id}/arrive`, {
        latitude,
        longitude,
      })
    );
  }

  async markCompleted(id: number): Promise<VisitAssignment> {
    return await unwrap<VisitAssignment>(
      appApi.post(`/visits/assignments/${id}/complete`, {})
    );
  }
}

/**
 * Default repository instance for dependency injection
 * Dependency Inversion Principle: Consumers depend on VisitsRepository interface
 */
export const defaultVisitsRepository: VisitsRepository = new HttpVisitsRepository();

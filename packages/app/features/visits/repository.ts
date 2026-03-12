import type {
  VisitableFamily,
  VisitAssignment,
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
 * API Response Envelope
 * Standardized response format for all API calls
 */
type ApiResponse<T> = {
  data: T;
  code: number;
  message: string;
};

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
  listMyAssignments(): Promise<VisitAssignment[]>;
  createAssignment(data: CreateVisitAssignmentInput): Promise<VisitAssignment>;
  updateAssignment(id: number, data: UpdateVisitAssignmentInput): Promise<VisitAssignment>;
  deleteAssignment(id: number): Promise<void>;

  // Tracking operations
  markArrived(id: number, latitude: number, longitude: number): Promise<VisitAssignment>;
  markCompleted(id: number): Promise<VisitAssignment>;
}

/**
 * HTTP implementation of VisitsRepository with MOCKED data
 * NOTE: Real backend endpoints not ready yet - using mock responses
 *
 * Open/Closed Principle: Open for extension (real API implementation) without modifying interface
 * Liskov Substitution Principle: Fully substitutable with interface
 */
export class HttpVisitsRepository implements VisitsRepository {
  // Mock data store (in-memory)
  private mockFamilies: VisitableFamily[] = [
    {
      id: 1,
      family_name: 'Smith Family',
      address_street: '123 Oak Street',
      address_city: 'Springfield',
      address_postal: '12345',
      latitude: 40.7128,
      longitude: -74.006,
      phone: '+1234567890',
      notes: 'Prefer afternoon visits',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      family_name: 'Johnson Family',
      address_street: '456 Maple Avenue',
      address_city: 'Springfield',
      address_postal: '12346',
      latitude: 40.7589,
      longitude: -73.9851,
      phone: '+1234567891',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  private mockAssignments: VisitAssignment[] = [
    {
      id: 1,
      family_id: 1,
      assigned_to_user_id: 1,
      scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'pending',
      arrived_at: null,
      completed_at: null,
      notes: 'First visit',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  private nextFamilyId = 3;
  private nextAssignmentId = 2;

  async listFamilies(): Promise<VisitableFamily[]> {
    // Simulate API delay
    await this.delay(300);
    return this.mockFamilies;
  }

  async getFamily(id: number): Promise<VisitableFamily> {
    await this.delay(200);
    const family = this.mockFamilies.find((f) => f.id === id);
    if (!family) {
      throw new Error(`Family with id ${id} not found`);
    }
    return family;
  }

  async createFamily(data: CreateVisitableFamilyInput): Promise<VisitableFamily> {
    await this.delay(400);
    const newFamily: VisitableFamily = {
      id: this.nextFamilyId++,
      ...data,
      phone: data.phone || null,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.mockFamilies.push(newFamily);
    return newFamily;
  }

  async updateFamily(id: number, data: UpdateVisitableFamilyInput): Promise<VisitableFamily> {
    await this.delay(400);
    const index = this.mockFamilies.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new Error(`Family with id ${id} not found`);
    }
    this.mockFamilies[index] = {
      ...this.mockFamilies[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.mockFamilies[index];
  }

  async deleteFamily(id: number): Promise<void> {
    await this.delay(300);
    const index = this.mockFamilies.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new Error(`Family with id ${id} not found`);
    }
    this.mockFamilies.splice(index, 1);
  }

  async listAllAssignments(): Promise<VisitAssignment[]> {
    await this.delay(300);
    return this.mockAssignments;
  }

  async listMyAssignments(): Promise<VisitAssignment[]> {
    await this.delay(300);
    // Mock: return all assignments (in real implementation, filter by current user)
    return this.mockAssignments.filter((a) => a.status !== 'cancelled');
  }

  async createAssignment(data: CreateVisitAssignmentInput): Promise<VisitAssignment> {
    await this.delay(400);
    const newAssignment: VisitAssignment = {
      id: this.nextAssignmentId++,
      ...data,
      status: 'pending',
      arrived_at: null,
      completed_at: null,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.mockAssignments.push(newAssignment);
    return newAssignment;
  }

  async updateAssignment(id: number, data: UpdateVisitAssignmentInput): Promise<VisitAssignment> {
    await this.delay(400);
    const index = this.mockAssignments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Assignment with id ${id} not found`);
    }
    this.mockAssignments[index] = {
      ...this.mockAssignments[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.mockAssignments[index];
  }

  async deleteAssignment(id: number): Promise<void> {
    await this.delay(300);
    const index = this.mockAssignments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Assignment with id ${id} not found`);
    }
    this.mockAssignments.splice(index, 1);
  }

  async markArrived(id: number, latitude: number, longitude: number): Promise<VisitAssignment> {
    await this.delay(400);
    const index = this.mockAssignments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Assignment with id ${id} not found`);
    }
    this.mockAssignments[index] = {
      ...this.mockAssignments[index],
      status: 'in_progress',
      arrived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return this.mockAssignments[index];
  }

  async markCompleted(id: number): Promise<VisitAssignment> {
    await this.delay(400);
    const index = this.mockAssignments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Assignment with id ${id} not found`);
    }
    this.mockAssignments[index] = {
      ...this.mockAssignments[index],
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return this.mockAssignments[index];
  }

  // Helper to simulate network delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Default repository instance for dependency injection
 * Dependency Inversion Principle: Consumers depend on VisitsRepository interface
 */
export const defaultVisitsRepository: VisitsRepository = new HttpVisitsRepository();

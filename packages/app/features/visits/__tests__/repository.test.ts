import {HttpVisitsRepository} from '../repository';
import {appApi} from '@yuhuu/auth';
import MockAdapter from 'axios-mock-adapter';
import type {
  VisitableFamily,
  VisitAssignment,
  CreateVisitableFamilyInput,
  UpdateVisitableFamilyInput,
  CreateVisitAssignmentInput,
  UpdateVisitAssignmentInput,
} from '@yuhuu/types';

/**
 * Unit tests for HttpVisitsRepository with HTTP mocking
 * SOLID Principles Applied:
 * - Single Responsibility: Each test validates one specific behavior
 * - Dependency Inversion: Tests use repository interface
 */

describe('visits/repository', () => {
  let repository: HttpVisitsRepository;
  let mockApi: MockAdapter;

  // Mock data
  const mockFamilies: VisitableFamily[] = [
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
      created_at: '2026-03-12T10:00:00Z',
      updated_at: '2026-03-12T10:00:00Z',
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
      created_at: '2026-03-12T11:00:00Z',
      updated_at: '2026-03-12T11:00:00Z',
    },
  ];

  const mockAssignments: VisitAssignment[] = [
    {
      id: 1,
      family_id: 1,
      assigned_to_user_id: 1,
      scheduled_date: '2026-03-15',
      status: 'pending',
      arrived_at: null,
      completed_at: null,
      notes: 'First visit',
      created_at: '2026-03-12T12:00:00Z',
      updated_at: '2026-03-12T12:00:00Z',
    },
  ];

  beforeEach(() => {
    repository = new HttpVisitsRepository();
    mockApi = new MockAdapter(appApi);
  });

  afterEach(() => {
    mockApi.restore();
  });

  describe('Family CRUD operations', () => {
    describe('listFamilies', () => {
      it('should return array of families', async () => {
        mockApi.onGet('/admin/visits/families').reply(200, {
          code: 200,
          data: mockFamilies,
          message: 'Success',
        });

        const families = await repository.listFamilies();

        expect(Array.isArray(families)).toBe(true);
        expect(families.length).toBe(2);
        expect(families[0]).toHaveProperty('id');
        expect(families[0]).toHaveProperty('family_name');
        expect(families[0]).toHaveProperty('address_street');
      });

      it('should return families with all required fields', async () => {
        mockApi.onGet('/admin/visits/families').reply(200, {
          code: 200,
          data: mockFamilies,
          message: 'Success',
        });

        const families = await repository.listFamilies();
        const family = families[0];

        expect(family.id).toBeDefined();
        expect(family.family_name).toBeDefined();
        expect(family.address_street).toBeDefined();
        expect(family.address_city).toBeDefined();
        expect(family.address_postal).toBeDefined();
        expect(family.latitude).toBeDefined();
        expect(family.longitude).toBeDefined();
      });

      it('should handle families with null optional fields', async () => {
        mockApi.onGet('/admin/visits/families').reply(200, {
          code: 200,
          data: mockFamilies,
          message: 'Success',
        });

        const families = await repository.listFamilies();
        const familyWithNullNotes = families.find((f) => f.notes === null);

        expect(familyWithNullNotes).toBeDefined();
        expect(familyWithNullNotes?.notes).toBeNull();
      });
    });

    describe('getFamily', () => {
      it('should return family by id', async () => {
        const targetFamily = mockFamilies[0];
        mockApi.onGet(`/admin/visits/families/${targetFamily.id}`).reply(200, {
          code: 200,
          data: targetFamily,
          message: 'Success',
        });

        const family = await repository.getFamily(targetFamily.id);

        expect(family.id).toBe(targetFamily.id);
        expect(family.family_name).toBe(targetFamily.family_name);
      });

      it('should throw error when family not found', async () => {
        mockApi.onGet('/admin/visits/families/999').reply(404, {
          code: 404,
          data: {error: 'Not found'},
          message: 'Family with id 999 not found',
        });

        await expect(repository.getFamily(999)).rejects.toThrow();
      });

      it('should return family with coordinates', async () => {
        const targetFamily = mockFamilies[0];
        mockApi.onGet(`/admin/visits/families/${targetFamily.id}`).reply(200, {
          code: 200,
          data: targetFamily,
          message: 'Success',
        });

        const family = await repository.getFamily(targetFamily.id);

        expect(typeof family.latitude).toBe('number');
        expect(typeof family.longitude).toBe('number');
        expect(family.latitude).toBeGreaterThanOrEqual(-90);
        expect(family.latitude).toBeLessThanOrEqual(90);
        expect(family.longitude).toBeGreaterThanOrEqual(-180);
        expect(family.longitude).toBeLessThanOrEqual(180);
      });
    });

    describe('createFamily', () => {
      it('should create new family and return it', async () => {
        const input: CreateVisitableFamilyInput = {
          family_name: 'Wilson Family',
          address_street: '789 Pine Road',
          address_city: 'Springfield',
          address_postal: '12347',
          latitude: 40.7306,
          longitude: -73.9352,
          phone: '+1234567892',
          notes: 'Evening visits preferred',
        };

        const createdFamily: VisitableFamily = {
          id: 3,
          ...input,
          created_at: '2026-03-13T10:00:00Z',
          updated_at: '2026-03-13T10:00:00Z',
        };

        mockApi.onPost('/admin/visits/families').reply(201, {
          code: 201,
          data: createdFamily,
          message: 'Family created successfully',
        });

        const created = await repository.createFamily(input);

        expect(created.id).toBe(3);
        expect(created.family_name).toBe(input.family_name);
        expect(created.address_street).toBe(input.address_street);
        expect(created.latitude).toBe(input.latitude);
        expect(created.phone).toBe(input.phone);
        expect(created.notes).toBe(input.notes);
        expect(created.created_at).toBeDefined();
        expect(created.updated_at).toBeDefined();
      });

      it('should create family without optional fields', async () => {
        const input: CreateVisitableFamilyInput = {
          family_name: 'Brown Family',
          address_street: '321 Elm Street',
          address_city: 'Springfield',
          address_postal: '12348',
          latitude: 40.7489,
          longitude: -73.9680,
        };

        const createdFamily: VisitableFamily = {
          id: 4,
          ...input,
          phone: null,
          notes: null,
          created_at: '2026-03-13T11:00:00Z',
          updated_at: '2026-03-13T11:00:00Z',
        };

        mockApi.onPost('/admin/visits/families').reply(201, {
          code: 201,
          data: createdFamily,
          message: 'Family created successfully',
        });

        const created = await repository.createFamily(input);

        expect(created.id).toBeDefined();
        expect(created.family_name).toBe(input.family_name);
        expect(created.phone).toBeNull();
        expect(created.notes).toBeNull();
      });

      it('should increment id for each new family', async () => {
        const input1: CreateVisitableFamilyInput = {
          family_name: 'Family A',
          address_street: 'Street A',
          address_city: 'City A',
          address_postal: '11111',
          latitude: 40.0,
          longitude: -74.0,
        };

        const input2: CreateVisitableFamilyInput = {
          family_name: 'Family B',
          address_street: 'Street B',
          address_city: 'City B',
          address_postal: '22222',
          latitude: 41.0,
          longitude: -75.0,
        };

        mockApi.onPost('/admin/visits/families').replyOnce(201, {
          code: 201,
          data: {id: 5, ...input1, phone: null, notes: null, created_at: '2026-03-13T12:00:00Z', updated_at: '2026-03-13T12:00:00Z'},
          message: 'Family created successfully',
        });

        mockApi.onPost('/admin/visits/families').replyOnce(201, {
          code: 201,
          data: {id: 6, ...input2, phone: null, notes: null, created_at: '2026-03-13T12:01:00Z', updated_at: '2026-03-13T12:01:00Z'},
          message: 'Family created successfully',
        });

        const created1 = await repository.createFamily(input1);
        const created2 = await repository.createFamily(input2);

        expect(created2.id).toBeGreaterThan(created1.id);
      });

      it('should add created family to list', async () => {
        const input: CreateVisitableFamilyInput = {
          family_name: 'Test Family',
          address_street: 'Test Street',
          address_city: 'Test City',
          address_postal: '99999',
          latitude: 42.0,
          longitude: -76.0,
        };

        // First list call
        mockApi.onGet('/admin/visits/families').replyOnce(200, {
          code: 200,
          data: mockFamilies,
          message: 'Success',
        });

        const beforeCount = (await repository.listFamilies()).length;

        // Create call
        mockApi.onPost('/admin/visits/families').replyOnce(201, {
          code: 201,
          data: {id: 7, ...input, phone: null, notes: null, created_at: '2026-03-13T13:00:00Z', updated_at: '2026-03-13T13:00:00Z'},
          message: 'Family created successfully',
        });

        await repository.createFamily(input);

        // Second list call
        const updatedFamilies = [...mockFamilies, {id: 7, ...input, phone: null, notes: null, created_at: '2026-03-13T13:00:00Z', updated_at: '2026-03-13T13:00:00Z'}];
        mockApi.onGet('/admin/visits/families').replyOnce(200, {
          code: 200,
          data: updatedFamilies,
          message: 'Success',
        });

        const afterCount = (await repository.listFamilies()).length;
        expect(afterCount).toBe(beforeCount + 1);
      });

      it('should throw error when GPS coordinates are missing', async () => {
        const input = {
          family_name: 'No GPS Family',
          address_street: 'Test Street',
          address_city: 'Test City',
          address_postal: '00000',
        } as CreateVisitableFamilyInput;

        await expect(repository.createFamily(input)).rejects.toThrow('GPS coordinates are required');
      });
    });

    describe('updateFamily', () => {
      it('should update family fields', async () => {
        const targetFamily = mockFamilies[0];
        const update: UpdateVisitableFamilyInput = {
          family_name: 'Updated Family Name',
          notes: 'Updated notes',
        };

        const updatedFamily: VisitableFamily = {
          ...targetFamily,
          ...update,
          updated_at: '2026-03-13T14:00:00Z',
        };

        mockApi.onPut(`/admin/visits/families/${targetFamily.id}`).reply(200, {
          code: 200,
          data: updatedFamily,
          message: 'Family updated successfully',
        });

        const updated = await repository.updateFamily(targetFamily.id, update);

        expect(updated.id).toBe(targetFamily.id);
        expect(updated.family_name).toBe(update.family_name);
        expect(updated.notes).toBe(update.notes);
        expect(updated.updated_at).toBeDefined();
      });

      it('should preserve unchanged fields', async () => {
        const targetFamily = mockFamilies[0];
        const update: UpdateVisitableFamilyInput = {
          family_name: 'Only Name Changed',
        };

        const updatedFamily: VisitableFamily = {
          ...targetFamily,
          ...update,
          updated_at: '2026-03-13T15:00:00Z',
        };

        mockApi.onPut(`/admin/visits/families/${targetFamily.id}`).reply(200, {
          code: 200,
          data: updatedFamily,
          message: 'Family updated successfully',
        });

        const updated = await repository.updateFamily(targetFamily.id, update);

        expect(updated.address_street).toBe(targetFamily.address_street);
      });

      it('should throw error when family not found', async () => {
        const update: UpdateVisitableFamilyInput = {
          family_name: 'Should Fail',
        };

        mockApi.onPut('/admin/visits/families/999').reply(404, {
          code: 404,
          data: {error: 'Not found'},
          message: 'Family with id 999 not found',
        });

        await expect(repository.updateFamily(999, update)).rejects.toThrow();
      });

      it('should update coordinates', async () => {
        const targetFamily = mockFamilies[0];
        const update: UpdateVisitableFamilyInput = {
          latitude: 45.5231,
          longitude: -122.6765,
        };

        const updatedFamily: VisitableFamily = {
          ...targetFamily,
          ...update,
          updated_at: '2026-03-13T16:00:00Z',
        };

        mockApi.onPut(`/admin/visits/families/${targetFamily.id}`).reply(200, {
          code: 200,
          data: updatedFamily,
          message: 'Family updated successfully',
        });

        const updated = await repository.updateFamily(targetFamily.id, update);

        expect(updated.latitude).toBe(update.latitude);
        expect(updated.longitude).toBe(update.longitude);
      });
    });

    describe('deleteFamily', () => {
      it('should delete family by id', async () => {
        const input: CreateVisitableFamilyInput = {
          family_name: 'To Be Deleted',
          address_street: 'Delete Street',
          address_city: 'Delete City',
          address_postal: '00000',
          latitude: 40.0,
          longitude: -74.0,
        };

        const createdFamily: VisitableFamily = {
          id: 8,
          ...input,
          phone: null,
          notes: null,
          created_at: '2026-03-13T17:00:00Z',
          updated_at: '2026-03-13T17:00:00Z',
        };

        mockApi.onPost('/admin/visits/families').replyOnce(201, {
          code: 201,
          data: createdFamily,
          message: 'Family created successfully',
        });

        const created = await repository.createFamily(input);

        mockApi.onGet('/admin/visits/families').replyOnce(200, {
          code: 200,
          data: [...mockFamilies, createdFamily],
          message: 'Success',
        });

        const beforeCount = (await repository.listFamilies()).length;

        // Backend returns 200 with message, not 204
        mockApi.onDelete(`/admin/visits/families/${created.id}`).reply(200, {
          code: 200,
          data: {message: 'Family deleted successfully'},
          message: 'Family deleted successfully',
        });

        await repository.deleteFamily(created.id);

        mockApi.onGet('/admin/visits/families').replyOnce(200, {
          code: 200,
          data: mockFamilies,
          message: 'Success',
        });

        const afterCount = (await repository.listFamilies()).length;
        expect(afterCount).toBe(beforeCount - 1);
      });

      it('should throw error when family not found', async () => {
        mockApi.onDelete('/admin/visits/families/999').reply(404, {
          code: 404,
          data: {error: 'Not found'},
          message: 'Family with id 999 not found',
        });

        await expect(repository.deleteFamily(999)).rejects.toThrow();
      });

      it('should not return deleted family in list', async () => {
        const input: CreateVisitableFamilyInput = {
          family_name: 'Delete Test',
          address_street: 'Test Street',
          address_city: 'Test City',
          address_postal: '11111',
          latitude: 40.0,
          longitude: -74.0,
        };

        const createdFamily: VisitableFamily = {
          id: 9,
          ...input,
          phone: null,
          notes: null,
          created_at: '2026-03-13T18:00:00Z',
          updated_at: '2026-03-13T18:00:00Z',
        };

        mockApi.onPost('/admin/visits/families').replyOnce(201, {
          code: 201,
          data: createdFamily,
          message: 'Family created successfully',
        });

        const created = await repository.createFamily(input);

        mockApi.onDelete(`/admin/visits/families/${created.id}`).reply(200, {
          code: 200,
          data: {message: 'Family deleted successfully'},
          message: 'Family deleted successfully',
        });

        await repository.deleteFamily(created.id);

        mockApi.onGet('/admin/visits/families').replyOnce(200, {
          code: 200,
          data: mockFamilies,
          message: 'Success',
        });

        const families = await repository.listFamilies();
        const deleted = families.find((f) => f.id === created.id);

        expect(deleted).toBeUndefined();
      });
    });
  });

  describe('Assignment CRUD operations', () => {
    describe('listAllAssignments', () => {
      it('should return array of assignments', async () => {
        mockApi.onGet('/admin/visits/assignments').reply(200, {
          code: 200,
          data: mockAssignments,
          message: 'Success',
        });

        const assignments = await repository.listAllAssignments();

        expect(Array.isArray(assignments)).toBe(true);
        expect(assignments.length).toBeGreaterThan(0);
      });

      it('should return assignments with all required fields', async () => {
        mockApi.onGet('/admin/visits/assignments').reply(200, {
          code: 200,
          data: mockAssignments,
          message: 'Success',
        });

        const assignments = await repository.listAllAssignments();
        const assignment = assignments[0];

        expect(assignment.id).toBeDefined();
        expect(assignment.family_id).toBeDefined();
        expect(assignment.assigned_to_user_id).toBeDefined();
        expect(assignment.scheduled_date).toBeDefined();
        expect(assignment.status).toBeDefined();
      });
    });

    describe('listMyAssignments', () => {
      it('should return non-cancelled assignments', async () => {
        const myAssignments = mockAssignments.filter((a) => a.status !== 'cancelled');
        mockApi.onGet('/visits/my-assignments').reply(200, {
          code: 200,
          data: myAssignments,
          message: 'Success',
        });

        const assignments = await repository.listMyAssignments();

        expect(Array.isArray(assignments)).toBe(true);
        assignments.forEach((assignment) => {
          expect(assignment.status).not.toBe('cancelled');
        });
      });
    });

    describe('createAssignment', () => {
      it('should create new assignment', async () => {
        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 2,
          scheduled_date: '2026-03-15',
          notes: 'First-time visit',
        };

        const createdAssignment: VisitAssignment = {
          id: 2,
          ...input,
          status: 'pending',
          arrived_at: null,
          completed_at: null,
          created_at: '2026-03-13T19:00:00Z',
          updated_at: '2026-03-13T19:00:00Z',
        };

        mockApi.onPost('/admin/visits/assignments').reply(201, {
          code: 201,
          data: createdAssignment,
          message: 'Assignment created successfully',
        });

        const created = await repository.createAssignment(input);

        expect(created.id).toBeDefined();
        expect(created.family_id).toBe(input.family_id);
        expect(created.assigned_to_user_id).toBe(input.assigned_to_user_id);
        expect(created.scheduled_date).toBe(input.scheduled_date);
        expect(created.status).toBe('pending');
        expect(created.notes).toBe(input.notes);
        expect(created.arrived_at).toBeNull();
        expect(created.completed_at).toBeNull();
      });

      it('should create assignment without optional notes', async () => {
        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 3,
          scheduled_date: '2026-03-16',
        };

        const createdAssignment: VisitAssignment = {
          id: 3,
          ...input,
          status: 'pending',
          arrived_at: null,
          completed_at: null,
          notes: null,
          created_at: '2026-03-13T20:00:00Z',
          updated_at: '2026-03-13T20:00:00Z',
        };

        mockApi.onPost('/admin/visits/assignments').reply(201, {
          code: 201,
          data: createdAssignment,
          message: 'Assignment created successfully',
        });

        const created = await repository.createAssignment(input);

        expect(created.notes).toBeNull();
      });

      it('should increment id for each new assignment', async () => {
        const input1: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-17',
        };

        const input2: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-18',
        };

        mockApi.onPost('/admin/visits/assignments').replyOnce(201, {
          code: 201,
          data: {id: 4, ...input1, status: 'pending', arrived_at: null, completed_at: null, notes: null, created_at: '2026-03-13T21:00:00Z', updated_at: '2026-03-13T21:00:00Z'},
          message: 'Assignment created successfully',
        });

        mockApi.onPost('/admin/visits/assignments').replyOnce(201, {
          code: 201,
          data: {id: 5, ...input2, status: 'pending', arrived_at: null, completed_at: null, notes: null, created_at: '2026-03-13T21:01:00Z', updated_at: '2026-03-13T21:01:00Z'},
          message: 'Assignment created successfully',
        });

        const created1 = await repository.createAssignment(input1);
        const created2 = await repository.createAssignment(input2);

        expect(created2.id).toBeGreaterThan(created1.id);
      });
    });

    describe('updateAssignment', () => {
      it('should update assignment fields', async () => {
        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-19',
        };

        const createdAssignment: VisitAssignment = {
          id: 6,
          ...input,
          status: 'pending',
          arrived_at: null,
          completed_at: null,
          notes: null,
          created_at: '2026-03-13T22:00:00Z',
          updated_at: '2026-03-13T22:00:00Z',
        };

        mockApi.onPost('/admin/visits/assignments').replyOnce(201, {
          code: 201,
          data: createdAssignment,
          message: 'Assignment created successfully',
        });

        const created = await repository.createAssignment(input);

        const update: UpdateVisitAssignmentInput = {
          scheduled_date: '2026-03-20',
          notes: 'Rescheduled',
        };

        const updatedAssignment: VisitAssignment = {
          ...createdAssignment,
          ...update,
          updated_at: '2026-03-13T23:00:00Z',
        };

        mockApi.onPut(`/visits/assignments/${created.id}`).reply(200, {
          code: 200,
          data: updatedAssignment,
          message: 'Assignment updated successfully',
        });

        const updated = await repository.updateAssignment(created.id, update);

        expect(updated.scheduled_date).toBe(update.scheduled_date);
        expect(updated.notes).toBe(update.notes);
      });

      it('should throw error when assignment not found', async () => {
        const update: UpdateVisitAssignmentInput = {
          scheduled_date: '2026-03-21',
        };

        mockApi.onPut('/visits/assignments/999').reply(404, {
          code: 404,
          data: {error: 'Not found'},
          message: 'Assignment with id 999 not found',
        });

        await expect(repository.updateAssignment(999, update)).rejects.toThrow();
      });
    });

    describe('deleteAssignment', () => {
      it('should delete assignment by id', async () => {
        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-22',
        };

        const createdAssignment: VisitAssignment = {
          id: 7,
          ...input,
          status: 'pending',
          arrived_at: null,
          completed_at: null,
          notes: null,
          created_at: '2026-03-14T00:00:00Z',
          updated_at: '2026-03-14T00:00:00Z',
        };

        mockApi.onPost('/admin/visits/assignments').replyOnce(201, {
          code: 201,
          data: createdAssignment,
          message: 'Assignment created successfully',
        });

        const created = await repository.createAssignment(input);

        mockApi.onGet('/admin/visits/assignments').replyOnce(200, {
          code: 200,
          data: [...mockAssignments, createdAssignment],
          message: 'Success',
        });

        const beforeCount = (await repository.listAllAssignments()).length;

        // Backend returns 200 with message, not 204
        mockApi.onDelete(`/admin/visits/assignments/${created.id}`).reply(200, {
          code: 200,
          data: {message: 'Assignment deleted successfully'},
          message: 'Assignment deleted successfully',
        });

        await repository.deleteAssignment(created.id);

        mockApi.onGet('/admin/visits/assignments').replyOnce(200, {
          code: 200,
          data: mockAssignments,
          message: 'Success',
        });

        const afterCount = (await repository.listAllAssignments()).length;
        expect(afterCount).toBe(beforeCount - 1);
      });

      it('should throw error when assignment not found', async () => {
        mockApi.onDelete('/admin/visits/assignments/999').reply(404, {
          code: 404,
          data: {error: 'Not found'},
          message: 'Assignment with id 999 not found',
        });

        await expect(repository.deleteAssignment(999)).rejects.toThrow();
      });
    });
  });

  describe('Tracking operations', () => {
    describe('markArrived', () => {
      it('should mark assignment as arrived', async () => {
        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-23',
        };

        const createdAssignment: VisitAssignment = {
          id: 8,
          ...input,
          status: 'pending',
          arrived_at: null,
          completed_at: null,
          notes: null,
          created_at: '2026-03-14T01:00:00Z',
          updated_at: '2026-03-14T01:00:00Z',
        };

        mockApi.onPost('/admin/visits/assignments').replyOnce(201, {
          code: 201,
          data: createdAssignment,
          message: 'Assignment created successfully',
        });

        const created = await repository.createAssignment(input);
        const latitude = 40.7128;
        const longitude = -74.006;

        const arrivedAssignment: VisitAssignment = {
          ...createdAssignment,
          status: 'in_progress',
          arrived_at: '2026-03-14T02:00:00Z',
          arrived_latitude: latitude,
          arrived_longitude: longitude,
          updated_at: '2026-03-14T02:00:00Z',
        };

        mockApi.onPost(`/visits/assignments/${created.id}/arrive`).reply(200, {
          code: 200,
          data: arrivedAssignment,
          message: 'Arrival recorded',
        });

        const arrived = await repository.markArrived(created.id, latitude, longitude);

        expect(arrived.status).toBe('in_progress');
        expect(arrived.arrived_at).toBeDefined();
        expect(arrived.arrived_at).not.toBeNull();
      });

      it('should store GPS coordinates on arrival', async () => {
        const latitude = 40.7128;
        const longitude = -74.006;

        const arrivedAssignment: VisitAssignment = {
          id: 9,
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-24',
          status: 'in_progress',
          arrived_at: '2026-03-14T03:00:00Z',
          arrived_latitude: latitude,
          arrived_longitude: longitude,
          completed_at: null,
          notes: null,
          created_at: '2026-03-14T03:00:00Z',
          updated_at: '2026-03-14T03:00:00Z',
        };

        mockApi.onPost('/visits/assignments/9/arrive').reply(200, {
          code: 200,
          data: arrivedAssignment,
          message: 'Arrival recorded',
        });

        const result = await repository.markArrived(9, latitude, longitude);

        expect(result.arrived_latitude).toBe(latitude);
        expect(result.arrived_longitude).toBe(longitude);
      });

      it('should throw error when assignment not found', async () => {
        mockApi.onPost('/visits/assignments/999/arrive').reply(404, {
          code: 404,
          data: {error: 'Not found'},
          message: 'Assignment with id 999 not found',
        });

        await expect(repository.markArrived(999, 40.0, -74.0)).rejects.toThrow();
      });

      it('should preserve other assignment fields', async () => {
        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-24',
          notes: 'Test notes',
        };

        const createdAssignment: VisitAssignment = {
          id: 10,
          ...input,
          status: 'pending',
          arrived_at: null,
          completed_at: null,
          created_at: '2026-03-14T04:00:00Z',
          updated_at: '2026-03-14T04:00:00Z',
        };

        mockApi.onPost('/admin/visits/assignments').replyOnce(201, {
          code: 201,
          data: createdAssignment,
          message: 'Assignment created successfully',
        });

        const created = await repository.createAssignment(input);

        const arrivedAssignment: VisitAssignment = {
          ...createdAssignment,
          status: 'in_progress',
          arrived_at: '2026-03-14T05:00:00Z',
          arrived_latitude: 40.0,
          arrived_longitude: -74.0,
          updated_at: '2026-03-14T05:00:00Z',
        };

        mockApi.onPost(`/visits/assignments/${created.id}/arrive`).reply(200, {
          code: 200,
          data: arrivedAssignment,
          message: 'Arrival recorded',
        });

        const arrived = await repository.markArrived(created.id, 40.0, -74.0);

        expect(arrived.family_id).toBe(created.family_id);
        expect(arrived.notes).toBe(created.notes);
        expect(arrived.scheduled_date).toBe(created.scheduled_date);
      });
    });

    describe('markCompleted', () => {
      it('should mark assignment as completed', async () => {
        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-25',
        };

        const createdAssignment: VisitAssignment = {
          id: 11,
          ...input,
          status: 'pending',
          arrived_at: null,
          completed_at: null,
          notes: null,
          created_at: '2026-03-14T06:00:00Z',
          updated_at: '2026-03-14T06:00:00Z',
        };

        mockApi.onPost('/admin/visits/assignments').replyOnce(201, {
          code: 201,
          data: createdAssignment,
          message: 'Assignment created successfully',
        });

        const created = await repository.createAssignment(input);

        const completedAssignment: VisitAssignment = {
          ...createdAssignment,
          status: 'completed',
          completed_at: '2026-03-14T07:00:00Z',
          updated_at: '2026-03-14T07:00:00Z',
        };

        mockApi.onPost(`/visits/assignments/${created.id}/complete`).reply(200, {
          code: 200,
          data: completedAssignment,
          message: 'Visit completed',
        });

        const completed = await repository.markCompleted(created.id);

        expect(completed.status).toBe('completed');
        expect(completed.completed_at).toBeDefined();
        expect(completed.completed_at).not.toBeNull();
      });

      it('should throw error when assignment not found', async () => {
        mockApi.onPost('/visits/assignments/999/complete').reply(404, {
          code: 404,
          data: {error: 'Not found'},
          message: 'Assignment with id 999 not found',
        });

        await expect(repository.markCompleted(999)).rejects.toThrow();
      });

      it('should complete assignment regardless of current status', async () => {
        const pendingAssignment: VisitAssignment = {
          id: 12,
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-26',
          status: 'pending',
          arrived_at: null,
          completed_at: null,
          notes: null,
          created_at: '2026-03-14T08:00:00Z',
          updated_at: '2026-03-14T08:00:00Z',
        };

        mockApi.onPost('/admin/visits/assignments').replyOnce(201, {
          code: 201,
          data: pendingAssignment,
          message: 'Assignment created successfully',
        });

        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-26',
        };

        const created = await repository.createAssignment(input);
        expect(created.status).toBe('pending');

        const completedAssignment: VisitAssignment = {
          ...pendingAssignment,
          status: 'completed',
          completed_at: '2026-03-14T09:00:00Z',
          updated_at: '2026-03-14T09:00:00Z',
        };

        mockApi.onPost(`/visits/assignments/${created.id}/complete`).reply(200, {
          code: 200,
          data: completedAssignment,
          message: 'Visit completed',
        });

        const completed = await repository.markCompleted(created.id);
        expect(completed.status).toBe('completed');
      });
    });
  });

  describe('Interface compliance', () => {
    it('should implement VisitsRepository interface', () => {
      expect(repository.listFamilies).toBeDefined();
      expect(repository.getFamily).toBeDefined();
      expect(repository.createFamily).toBeDefined();
      expect(repository.updateFamily).toBeDefined();
      expect(repository.deleteFamily).toBeDefined();
      expect(repository.listAllAssignments).toBeDefined();
      expect(repository.listMyAssignments).toBeDefined();
      expect(repository.createAssignment).toBeDefined();
      expect(repository.updateAssignment).toBeDefined();
      expect(repository.deleteAssignment).toBeDefined();
      expect(repository.markArrived).toBeDefined();
      expect(repository.markCompleted).toBeDefined();
    });

    it('should have all methods as functions', () => {
      expect(typeof repository.listFamilies).toBe('function');
      expect(typeof repository.getFamily).toBe('function');
      expect(typeof repository.createFamily).toBe('function');
      expect(typeof repository.updateFamily).toBe('function');
      expect(typeof repository.deleteFamily).toBe('function');
      expect(typeof repository.listAllAssignments).toBe('function');
      expect(typeof repository.listMyAssignments).toBe('function');
      expect(typeof repository.createAssignment).toBe('function');
      expect(typeof repository.updateAssignment).toBe('function');
      expect(typeof repository.deleteAssignment).toBe('function');
      expect(typeof repository.markArrived).toBe('function');
      expect(typeof repository.markCompleted).toBe('function');
    });
  });
});

import {HttpVisitsRepository} from '../repository';
import type {
  VisitableFamily,
  VisitAssignment,
  CreateVisitableFamilyInput,
  UpdateVisitableFamilyInput,
  CreateVisitAssignmentInput,
  UpdateVisitAssignmentInput,
} from '@yuhuu/types';

/**
 * Unit tests for HttpVisitsRepository
 * SOLID Principles Applied:
 * - Single Responsibility: Each test validates one specific behavior
 * - Dependency Inversion: Tests use repository interface
 */

describe('visits/repository', () => {
  let repository: HttpVisitsRepository;

  beforeEach(() => {
    repository = new HttpVisitsRepository();
  });

  describe('Family CRUD operations', () => {
    describe('listFamilies', () => {
      it('should return array of families', async () => {
        const families = await repository.listFamilies();

        expect(Array.isArray(families)).toBe(true);
        expect(families.length).toBeGreaterThan(0);
        expect(families[0]).toHaveProperty('id');
        expect(families[0]).toHaveProperty('family_name');
        expect(families[0]).toHaveProperty('address_street');
      });

      it('should return families with all required fields', async () => {
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
        const families = await repository.listFamilies();
        const familyWithNullNotes = families.find((f) => f.notes === null);

        expect(familyWithNullNotes).toBeDefined();
        expect(familyWithNullNotes?.notes).toBeNull();
      });
    });

    describe('getFamily', () => {
      it('should return family by id', async () => {
        const families = await repository.listFamilies();
        const targetId = families[0].id;

        const family = await repository.getFamily(targetId);

        expect(family.id).toBe(targetId);
        expect(family.family_name).toBeDefined();
      });

      it('should throw error when family not found', async () => {
        await expect(repository.getFamily(999)).rejects.toThrow('Family with id 999 not found');
      });

      it('should return family with coordinates', async () => {
        const families = await repository.listFamilies();
        const family = await repository.getFamily(families[0].id);

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

        const created = await repository.createFamily(input);

        expect(created.id).toBeDefined();
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

        const created1 = await repository.createFamily(input1);
        const created2 = await repository.createFamily(input2);

        expect(created2.id).toBeGreaterThan(created1.id);
      });

      it('should add created family to list', async () => {
        const beforeCount = (await repository.listFamilies()).length;

        const input: CreateVisitableFamilyInput = {
          family_name: 'Test Family',
          address_street: 'Test Street',
          address_city: 'Test City',
          address_postal: '99999',
          latitude: 42.0,
          longitude: -76.0,
        };

        await repository.createFamily(input);

        const afterCount = (await repository.listFamilies()).length;
        expect(afterCount).toBe(beforeCount + 1);
      });
    });

    describe('updateFamily', () => {
      it('should update family fields', async () => {
        const families = await repository.listFamilies();
        const targetId = families[0].id;
        const originalName = families[0].family_name;

        const update: UpdateVisitableFamilyInput = {
          family_name: 'Updated Family Name',
          notes: 'Updated notes',
        };

        const updated = await repository.updateFamily(targetId, update);

        expect(updated.id).toBe(targetId);
        expect(updated.family_name).toBe(update.family_name);
        expect(updated.family_name).not.toBe(originalName);
        expect(updated.notes).toBe(update.notes);
        expect(updated.updated_at).toBeDefined();
      });

      it('should preserve unchanged fields', async () => {
        const families = await repository.listFamilies();
        const targetId = families[0].id;
        const originalStreet = families[0].address_street;

        const update: UpdateVisitableFamilyInput = {
          family_name: 'Only Name Changed',
        };

        const updated = await repository.updateFamily(targetId, update);

        expect(updated.address_street).toBe(originalStreet);
      });

      it('should throw error when family not found', async () => {
        const update: UpdateVisitableFamilyInput = {
          family_name: 'Should Fail',
        };

        await expect(repository.updateFamily(999, update)).rejects.toThrow(
          'Family with id 999 not found'
        );
      });

      it('should update coordinates', async () => {
        const families = await repository.listFamilies();
        const targetId = families[0].id;

        const update: UpdateVisitableFamilyInput = {
          latitude: 45.5231,
          longitude: -122.6765,
        };

        const updated = await repository.updateFamily(targetId, update);

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

        const created = await repository.createFamily(input);
        const beforeCount = (await repository.listFamilies()).length;

        await repository.deleteFamily(created.id);

        const afterCount = (await repository.listFamilies()).length;
        expect(afterCount).toBe(beforeCount - 1);
      });

      it('should throw error when family not found', async () => {
        await expect(repository.deleteFamily(999)).rejects.toThrow(
          'Family with id 999 not found'
        );
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

        const created = await repository.createFamily(input);
        await repository.deleteFamily(created.id);

        const families = await repository.listFamilies();
        const deleted = families.find((f) => f.id === created.id);

        expect(deleted).toBeUndefined();
      });
    });
  });

  describe('Assignment CRUD operations', () => {
    describe('listAllAssignments', () => {
      it('should return array of assignments', async () => {
        const assignments = await repository.listAllAssignments();

        expect(Array.isArray(assignments)).toBe(true);
        expect(assignments.length).toBeGreaterThan(0);
      });

      it('should return assignments with all required fields', async () => {
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

        const created = await repository.createAssignment(input);

        const update: UpdateVisitAssignmentInput = {
          scheduled_date: '2026-03-20',
          notes: 'Rescheduled',
        };

        const updated = await repository.updateAssignment(created.id, update);

        expect(updated.scheduled_date).toBe(update.scheduled_date);
        expect(updated.notes).toBe(update.notes);
      });

      it('should throw error when assignment not found', async () => {
        const update: UpdateVisitAssignmentInput = {
          scheduled_date: '2026-03-21',
        };

        await expect(repository.updateAssignment(999, update)).rejects.toThrow(
          'Assignment with id 999 not found'
        );
      });
    });

    describe('deleteAssignment', () => {
      it('should delete assignment by id', async () => {
        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-22',
        };

        const created = await repository.createAssignment(input);
        const beforeCount = (await repository.listAllAssignments()).length;

        await repository.deleteAssignment(created.id);

        const afterCount = (await repository.listAllAssignments()).length;
        expect(afterCount).toBe(beforeCount - 1);
      });

      it('should throw error when assignment not found', async () => {
        await expect(repository.deleteAssignment(999)).rejects.toThrow(
          'Assignment with id 999 not found'
        );
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

        const created = await repository.createAssignment(input);
        const latitude = 40.7128;
        const longitude = -74.006;

        const arrived = await repository.markArrived(created.id, latitude, longitude);

        expect(arrived.status).toBe('in_progress');
        expect(arrived.arrived_at).toBeDefined();
        expect(arrived.arrived_at).not.toBeNull();
        expect(new Date(arrived.arrived_at!).getTime()).toBeLessThanOrEqual(Date.now());
      });

      it('should throw error when assignment not found', async () => {
        await expect(repository.markArrived(999, 40.0, -74.0)).rejects.toThrow(
          'Assignment with id 999 not found'
        );
      });

      it('should preserve other assignment fields', async () => {
        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-24',
          notes: 'Test notes',
        };

        const created = await repository.createAssignment(input);
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

        const created = await repository.createAssignment(input);
        const completed = await repository.markCompleted(created.id);

        expect(completed.status).toBe('completed');
        expect(completed.completed_at).toBeDefined();
        expect(completed.completed_at).not.toBeNull();
        expect(new Date(completed.completed_at!).getTime()).toBeLessThanOrEqual(Date.now());
      });

      it('should throw error when assignment not found', async () => {
        await expect(repository.markCompleted(999)).rejects.toThrow(
          'Assignment with id 999 not found'
        );
      });

      it('should complete assignment regardless of current status', async () => {
        const input: CreateVisitAssignmentInput = {
          family_id: 1,
          assigned_to_user_id: 1,
          scheduled_date: '2026-03-26',
        };

        const created = await repository.createAssignment(input);
        expect(created.status).toBe('pending');

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

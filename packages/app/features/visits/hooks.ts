import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {
  VisitableFamily,
  VisitAssignment,
  CreateVisitableFamilyInput,
  UpdateVisitableFamilyInput,
  CreateVisitAssignmentInput,
  UpdateVisitAssignmentInput,
} from '@yuhuu/types';
import type {VisitsRepository} from './repository';
import {defaultVisitsRepository} from './repository';

/**
 * Query keys factory for cache management
 * Centralized key generation prevents cache invalidation bugs
 */
export const visitKeys = {
  all: ['visits'] as const,
  families: () => [...visitKeys.all, 'families'] as const,
  family: (id: number) => [...visitKeys.families(), id] as const,
  assignments: () => [...visitKeys.all, 'assignments'] as const,
  allAssignments: () => [...visitKeys.assignments(), 'all'] as const,
  myAssignments: () => [...visitKeys.assignments(), 'my'] as const,
  assignment: (id: number) => [...visitKeys.assignments(), id] as const,
};

/**
 * Query hooks for fetching data
 */

export function useFamiliesQuery(repo: VisitsRepository = defaultVisitsRepository) {
  return useQuery<VisitableFamily[]>({
    queryKey: visitKeys.families(),
    queryFn: () => repo.listFamilies(),
  });
}

export function useMyAssignmentsQuery(repo: VisitsRepository = defaultVisitsRepository) {
  return useQuery<VisitAssignment[]>({
    queryKey: visitKeys.myAssignments(),
    queryFn: () => repo.listMyAssignments(),
  });
}

export function useAllAssignmentsQuery(repo: VisitsRepository = defaultVisitsRepository) {
  return useQuery<VisitAssignment[]>({
    queryKey: visitKeys.allAssignments(),
    queryFn: () => repo.listAllAssignments(),
  });
}

export function useAssignmentQuery(
  id: number | null,
  repo: VisitsRepository = defaultVisitsRepository
) {
  return useQuery<VisitAssignment>({
    queryKey: visitKeys.assignment(id!),
    queryFn: () => repo.listMyAssignments().then((assignments) => {
      const assignment = assignments.find((a) => a.id === id);
      if (!assignment) throw new Error(`Assignment ${id} not found`);
      return assignment;
    }),
    enabled: Boolean(id),
  });
}

/**
 * Mutation hooks for data modifications
 */

export function useCreateFamilyMutation(repo: VisitsRepository = defaultVisitsRepository) {
  const queryClient = useQueryClient();

  return useMutation<VisitableFamily, Error, CreateVisitableFamilyInput>({
    mutationFn: (data) => repo.createFamily(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: visitKeys.families()});
    },
  });
}

export function useUpdateFamilyMutation(repo: VisitsRepository = defaultVisitsRepository) {
  const queryClient = useQueryClient();

  return useMutation<VisitableFamily, Error, {id: number; data: UpdateVisitableFamilyInput}>({
    mutationFn: ({id, data}) => repo.updateFamily(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: visitKeys.families()});
    },
  });
}

export function useDeleteFamilyMutation(repo: VisitsRepository = defaultVisitsRepository) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => repo.deleteFamily(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: visitKeys.families()});
    },
  });
}

export function useCreateAssignmentMutation(repo: VisitsRepository = defaultVisitsRepository) {
  const queryClient = useQueryClient();

  return useMutation<VisitAssignment, Error, CreateVisitAssignmentInput>({
    mutationFn: (data) => repo.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: visitKeys.assignments()});
    },
  });
}

export function useMarkArrivedMutation(repo: VisitsRepository = defaultVisitsRepository) {
  const queryClient = useQueryClient();

  return useMutation<VisitAssignment, Error, {id: number; latitude: number; longitude: number}>({
    mutationFn: ({id, latitude, longitude}) => repo.markArrived(id, latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: visitKeys.assignments()});
    },
  });
}

export function useMarkCompletedMutation(repo: VisitsRepository = defaultVisitsRepository) {
  const queryClient = useQueryClient();

  return useMutation<VisitAssignment, Error, number>({
    mutationFn: (id) => repo.markCompleted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: visitKeys.assignments()});
    },
  });
}

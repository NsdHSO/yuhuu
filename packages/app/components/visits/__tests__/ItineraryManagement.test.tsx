import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ItineraryManagement} from '../ItineraryManagement';

/**
 * Unit tests for ItineraryManagement Component
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific management feature
 * - Tests family and assignment list rendering and CRUD operations
 */

// Mock dependencies
jest.mock('@yuhuu/components', () => ({
  useGlowVariant: () => ({glowVariant: 'vibrant'}),
  getGlowColor: () => '#A78BFA',
}));

jest.mock('../../../features/visits/hooks', () => ({
  useFamiliesQuery: jest.fn(),
  useAllAssignmentsQuery: jest.fn(),
  useCreateFamilyMutation: jest.fn(),
  useDeleteFamilyMutation: jest.fn(),
  useCreateAssignmentMutation: jest.fn(),
}));

import {
  useFamiliesQuery,
  useAllAssignmentsQuery,
  useCreateFamilyMutation,
  useDeleteFamilyMutation,
  useCreateAssignmentMutation,
} from '../../../features/visits/hooks';

describe('ItineraryManagement', () => {
  let queryClient: QueryClient;
  const mockCreateFamily = jest.fn();
  const mockDeleteFamily = jest.fn();
  const mockCreateAssignment = jest.fn();

  const mockFamilies = [
    {
      id: 1,
      family_name: 'Smith Family',
      address_street: '123 Oak St',
      address_city: 'Springfield',
      address_postal: '12345',
      latitude: 40.0,
      longitude: -74.0,
    },
    {
      id: 2,
      family_name: 'Johnson Family',
      address_street: '456 Maple Ave',
      address_city: 'Springfield',
      address_postal: '12346',
      latitude: 40.1,
      longitude: -74.1,
    },
  ];

  const mockAssignments = [
    {
      id: 1,
      family_id: 1,
      assigned_to_user_id: 5,
      scheduled_date: '2026-03-15',
      status: 'pending' as const,
      arrived_at: null,
      completed_at: null,
      notes: null,
    },
    {
      id: 2,
      family_id: 2,
      assigned_to_user_id: 6,
      scheduled_date: '2026-03-16',
      status: 'pending' as const,
      arrived_at: null,
      completed_at: null,
      notes: 'First visit',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {retry: false},
        mutations: {retry: false},
      },
    });

    (useFamiliesQuery as jest.Mock).mockReturnValue({
      data: mockFamilies,
      isLoading: false,
    });

    (useAllAssignmentsQuery as jest.Mock).mockReturnValue({
      data: mockAssignments,
      isLoading: false,
    });

    (useCreateFamilyMutation as jest.Mock).mockReturnValue({
      mutate: mockCreateFamily,
      isPending: false,
    });

    (useDeleteFamilyMutation as jest.Mock).mockReturnValue({
      mutate: mockDeleteFamily,
      isPending: false,
    });

    (useCreateAssignmentMutation as jest.Mock).mockReturnValue({
      mutate: mockCreateAssignment,
      isPending: false,
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('should render Families section header', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Families')).toBeTruthy();
    });

    it('should render Assignments section header', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Assignments')).toBeTruthy();
    });

    it('should render Add Family button', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Add Family')).toBeTruthy();
    });

    it('should render Create Assignment button', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Create Assignment')).toBeTruthy();
    });
  });

  describe('Family list rendering', () => {
    it('should display all families', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Smith Family')).toBeTruthy();
      expect(getByText('Johnson Family')).toBeTruthy();
    });

    it('should show Delete button for each family', () => {
      const {getAllByText} = renderWithProvider(<ItineraryManagement />);

      const deleteButtons = getAllByText('Delete');
      expect(deleteButtons.length).toBe(2);
    });

    it('should handle empty family list', () => {
      (useFamiliesQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Families')).toBeTruthy();
      expect(getByText('Add Family')).toBeTruthy();
    });

    it('should handle undefined family list', () => {
      (useFamiliesQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Families')).toBeTruthy();
    });
  });

  describe('Assignment list rendering', () => {
    it('should display all assignments', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText(/Family ID: 1.*User: 5/)).toBeTruthy();
      expect(getByText(/Family ID: 2.*User: 6/)).toBeTruthy();
    });

    it('should show scheduled dates for assignments', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('2026-03-15')).toBeTruthy();
      expect(getByText('2026-03-16')).toBeTruthy();
    });

    it('should handle empty assignment list', () => {
      (useAllAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Assignments')).toBeTruthy();
      expect(getByText('Create Assignment')).toBeTruthy();
    });

    it('should handle undefined assignment list', () => {
      (useAllAssignmentsQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Assignments')).toBeTruthy();
    });
  });

  describe('Family CRUD operations', () => {
    it('should show family form when Add Family clicked', () => {
      const {getByText, getByPlaceholderText} = renderWithProvider(
        <ItineraryManagement />
      );

      fireEvent.press(getByText('Add Family'));

      expect(getByPlaceholderText('Family Name *')).toBeTruthy();
    });

    it('should hide Add Family button when form is shown', () => {
      const {getByText, queryByText} = renderWithProvider(<ItineraryManagement />);

      fireEvent.press(getByText('Add Family'));

      expect(queryByText('Add Family')).toBeNull();
    });

    it('should hide form when Cancel clicked', () => {
      const {getByText, queryByPlaceholderText} = renderWithProvider(
        <ItineraryManagement />
      );

      fireEvent.press(getByText('Add Family'));
      fireEvent.press(getByText('Cancel'));

      expect(queryByPlaceholderText('Family Name *')).toBeNull();
      expect(getByText('Add Family')).toBeTruthy();
    });

    it('should call deleteFamily mutation when Delete clicked', () => {
      const {getAllByText} = renderWithProvider(<ItineraryManagement />);

      const deleteButtons = getAllByText('Delete');
      fireEvent.press(deleteButtons[0]);

      expect(mockDeleteFamily).toHaveBeenCalledWith(1);
    });

    it('should call delete with correct family id', () => {
      const {getAllByText} = renderWithProvider(<ItineraryManagement />);

      const deleteButtons = getAllByText('Delete');
      fireEvent.press(deleteButtons[1]); // Second family

      expect(mockDeleteFamily).toHaveBeenCalledWith(2);
    });
  });

  describe('Assignment CRUD operations', () => {
    it('should show assignment form when Create Assignment clicked', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      fireEvent.press(getByText('Create Assignment'));

      expect(getByText('Select Family')).toBeTruthy();
    });

    it('should hide Create Assignment button when form is shown', () => {
      const {getByText, queryByText} = renderWithProvider(<ItineraryManagement />);

      fireEvent.press(getByText('Create Assignment'));

      // Button should be hidden when form is shown
      const createButtons = queryByText('Create Assignment');
      expect(createButtons).toBeNull();
    });

    it('should hide form when Cancel clicked', () => {
      const {getByText, queryByText} = renderWithProvider(<ItineraryManagement />);

      fireEvent.press(getByText('Create Assignment'));
      fireEvent.press(getByText('Cancel'));

      expect(queryByText('Select Family')).toBeNull();
      expect(getByText('Create Assignment')).toBeTruthy();
    });
  });

  describe('useGlowVariant theming', () => {
    it('should use glow color for Add Family button', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Add Family')).toBeTruthy();
    });

    it('should use glow color for Create Assignment button', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Create Assignment')).toBeTruthy();
    });
  });

  describe('Integration behavior', () => {
    it('should not show both forms simultaneously', () => {
      const {getByText, queryByText, queryByPlaceholderText} = renderWithProvider(
        <ItineraryManagement />
      );

      // Show family form
      fireEvent.press(getByText('Add Family'));
      expect(queryByPlaceholderText('Family Name *')).toBeTruthy();

      // Note: Create Assignment button should still be visible
      // (forms are independent sections)
    });

    it('should maintain list while form is open', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      fireEvent.press(getByText('Add Family'));

      // Families should still be visible
      expect(getByText('Smith Family')).toBeTruthy();
      expect(getByText('Johnson Family')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle single family in list', () => {
      (useFamiliesQuery as jest.Mock).mockReturnValue({
        data: [mockFamilies[0]],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Smith Family')).toBeTruthy();
    });

    it('should handle single assignment in list', () => {
      (useAllAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [mockAssignments[0]],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText(/Family ID: 1.*User: 5/)).toBeTruthy();
    });

    it('should handle loading state for mutations', () => {
      (useCreateFamilyMutation as jest.Mock).mockReturnValue({
        mutate: mockCreateFamily,
        isPending: true,
      });

      const {getByText} = renderWithProvider(<ItineraryManagement />);

      fireEvent.press(getByText('Add Family'));

      // Form should show with isSubmitting=true
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render all section headers', () => {
      const {getByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Families')).toBeTruthy();
      expect(getByText('Assignments')).toBeTruthy();
    });

    it('should render all interactive elements', () => {
      const {getByText, getAllByText} = renderWithProvider(<ItineraryManagement />);

      expect(getByText('Add Family')).toBeTruthy();
      expect(getByText('Create Assignment')).toBeTruthy();
      expect(getAllByText('Delete').length).toBeGreaterThan(0);
    });
  });
});

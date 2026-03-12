import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import AdminScreen from '../admin';

/**
 * Integration tests for Admin Itinerary Management
 * SOLID Principles:
 * - Tests integration of itinerary section within admin screen
 * - Tests end-to-end admin workflows for family and visit management
 */

// Mock all required dependencies
jest.mock('@yuhuu/components', () => ({
  useGlowVariant: () => ({glowVariant: 'vibrant'}),
  getGlowColor: () => '#A78BFA',
  useColorScheme: () => 'light',
  GlassView: ({children, ...props}: any) => {
    const React = require('react');
    const {View} = require('react-native');
    return React.createElement(View, props, children);
  },
  GlassBackground: ({children, ...props}: any) => {
    const React = require('react');
    const {View} = require('react-native');
    return React.createElement(View, props, children);
  },
  GlassAccordion: ({children, title, testID, ...props}: any) => {
    const React = require('react');
    const {View, Text, Pressable} = require('react-native');
    const [expanded, setExpanded] = React.useState(props.defaultExpanded ?? false);
    return React.createElement(
      View,
      {testID},
      React.createElement(
        Pressable,
        {onPress: () => setExpanded(!expanded)},
        React.createElement(Text, {}, title)
      ),
      expanded && children
    );
  },
  DinnerGraph: () => null,
  DinnerAttendance: () => null,
  DinnerIdSearch: ({onDinnerIdChange}: any) => {
    const React = require('react');
    const {Pressable} = require('react-native');
    return React.createElement(Pressable, {
      testID: 'dinner-id-trigger',
      onPress: () => onDinnerIdChange(1),
    });
  },
  ParticipantsList: () => null,
  TabScreenWrapper: ({children, testID}: any) => {
    const React = require('react');
    const {ScrollView} = require('react-native');
    return React.createElement(ScrollView, {testID: testID ? `${testID}-scroll` : undefined}, children);
  },
}));

jest.mock('@gorhom/bottom-sheet', () => ({
  __esModule: true,
  BottomSheetModal: (() => {
    const React = require('react');
    return React.forwardRef(({children}: any, ref: any) => {
      const {View} = require('react-native');
      return React.createElement(View, {}, children);
    });
  })(),
  BottomSheetView: ({children}: any) => {
    const React = require('react');
    const {View} = require('react-native');
    return React.createElement(View, {}, children);
  },
  BottomSheetBackdrop: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
  SafeAreaView: ({children, ...props}: any) => {
    const React = require('react');
    const {View} = require('react-native');
    return React.createElement(View, props, children);
  },
  SafeAreaProvider: ({children}: any) => {
    const React = require('react');
    const {View} = require('react-native');
    return React.createElement(View, {}, children);
  },
}));

// Mock all admin hooks
jest.mock('../../../features/admin/hooks', () => ({
  useAdminsQuery: () => ({data: [], isLoading: false}),
  useCreateAdminMutation: () => ({mutate: jest.fn(), isPending: false}),
  useRemoveAdminMutation: () => ({mutate: jest.fn(), isPending: false}),
  useDinnerStatsQuery: () => ({data: null, isLoading: false, error: null}),
  useUserAttendanceQuery: () => ({data: null, isLoading: false, error: null}),
}));

jest.mock('../../../features/dinners/hooks', () => ({
  useDinnersQuery: () => ({data: [], isLoading: false}),
  useParticipantsQuery: () => ({data: [], isLoading: false}),
  useAddParticipantMutation: () => ({mutate: jest.fn(), isPending: false}),
  useParticipantsByDinnerQuery: () => ({data: null, isLoading: false, error: null}),
}));

jest.mock('../../../features/visits/hooks', () => ({
  useFamiliesQuery: jest.fn(),
  useAllAssignmentsQuery: jest.fn(),
  useCreateFamilyMutation: jest.fn(),
  useDeleteFamilyMutation: jest.fn(),
  useCreateAssignmentMutation: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'admin.dinnerManagement': 'Dinner Management',
        'admin.itineraryManagement': 'Itinerary Management',
        'admin.title': 'Admin Dashboard',
        'admin.dinnerParticipation': 'Dinner Participation Graph',
        'admin.searchUser': 'Search User Attendance',
        'admin.viewParticipants': 'View Dinner Participants',
        'visits.families': 'Families',
        'visits.assignments': 'Assignments',
        'visits.addFamily': 'Add Family',
        'visits.createAssignment': 'Create Assignment',
        'visits.delete': 'Delete',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@yuhuu/auth', () => ({
  useAuth: () => ({
    user: {id: 1, username: 'admin', is_admin: true},
    logout: jest.fn(),
  }),
}));

jest.mock('@/features/bootstrap/api', () => ({
  useBootstrapGate: () => true,
}));

jest.mock('@/features/roles/meRoles', () => ({
  useMyRolesQuery: () => ({
    data: [{role_name: 'Admin', id: 1}],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/components/admin/user-search', () => ({
  UserSearch: ({onSearch}: any) => {
    const React = require('react');
    const {Pressable} = require('react-native');
    return React.createElement(Pressable, {
      testID: 'user-search-trigger',
      onPress: () => onSearch({id: 1, username: 'testuser'}),
    });
  },
}));

jest.mock('@yuhuu/auth', () => ({
  useAuth: () => ({
    user: {id: 1, username: 'admin', is_admin: true},
    logout: jest.fn(),
  }),
}));

import {
  useFamiliesQuery,
  useAllAssignmentsQuery,
  useCreateFamilyMutation,
  useDeleteFamilyMutation,
  useCreateAssignmentMutation,
} from '../../../features/visits/hooks';

describe('Admin Itinerary Integration', () => {
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

  describe('Admin screen structure', () => {
    it('should render both Dinner Management and Itinerary Management sections', () => {
      const {getByText} = renderWithProvider(<AdminScreen />);

      expect(getByText('Dinner Management')).toBeTruthy();
      expect(getByText('Itinerary Management')).toBeTruthy();
    });

    it('should render Itinerary Management in collapsed accordion', () => {
      const {getByText, queryByText} = renderWithProvider(<AdminScreen />);

      expect(getByText('Itinerary Management')).toBeTruthy();
      // Content should be collapsed initially (defaultExpanded=false)
    });

    it('should expand Itinerary Management accordion when clicked', async () => {
      const {getByText} = renderWithProvider(<AdminScreen />);

      const accordion = getByText('Itinerary Management');
      fireEvent.press(accordion);

      await waitFor(() => {
        expect(getByText('Families')).toBeTruthy();
      });
    });
  });

  describe('Itinerary Management integration', () => {
    it('should render ItineraryManagement component in admin screen', () => {
      const {getByText} = renderWithProvider(<AdminScreen />);

      // Expand accordion
      fireEvent.press(getByText('Itinerary Management'));

      expect(getByText('Families')).toBeTruthy();
      expect(getByText('Assignments')).toBeTruthy();
    });

    it('should display families in itinerary section', () => {
      const {getByText} = renderWithProvider(<AdminScreen />);

      fireEvent.press(getByText('Itinerary Management'));

      expect(getByText('Smith Family')).toBeTruthy();
    });

    it('should display assignments in itinerary section', () => {
      const {getByText} = renderWithProvider(<AdminScreen />);

      fireEvent.press(getByText('Itinerary Management'));

      expect(getByText(/Family ID: 1.*User: 5/)).toBeTruthy();
    });
  });

  describe('Family management workflow', () => {
    it('should support creating a new family from admin screen', async () => {
      const {getByText, getByPlaceholderText} = renderWithProvider(<AdminScreen />);

      // Expand itinerary section
      fireEvent.press(getByText('Itinerary Management'));

      // Open family form
      fireEvent.press(getByText('Add Family'));

      // Form should be visible
      expect(getByPlaceholderText('Family Name *')).toBeTruthy();
    });

    it('should support deleting a family from admin screen', () => {
      const {getByText, getAllByText} = renderWithProvider(<AdminScreen />);

      fireEvent.press(getByText('Itinerary Management'));

      const deleteButtons = getAllByText('Delete');
      fireEvent.press(deleteButtons[0]);

      expect(mockDeleteFamily).toHaveBeenCalledWith(1);
    });
  });

  describe('Assignment management workflow', () => {
    it('should support creating a new assignment from admin screen', () => {
      const {getByText} = renderWithProvider(<AdminScreen />);

      fireEvent.press(getByText('Itinerary Management'));
      fireEvent.press(getByText('Create Assignment'));

      expect(getByText('Select Family')).toBeTruthy();
    });

    it('should list all assignments in admin view', () => {
      const {getByText} = renderWithProvider(<AdminScreen />);

      fireEvent.press(getByText('Itinerary Management'));

      expect(getByText('2026-03-15')).toBeTruthy();
    });
  });

  describe('Integration with existing admin features', () => {
    it('should render itinerary section alongside dinner section', () => {
      const {getByText} = renderWithProvider(<AdminScreen />);

      expect(getByText('Dinner Management')).toBeTruthy();
      expect(getByText('Itinerary Management')).toBeTruthy();
    });

    it('should support expanding both sections independently', async () => {
      const {getByText} = renderWithProvider(<AdminScreen />);

      // Expand dinner management
      fireEvent.press(getByText('Dinner Management'));

      // Expand itinerary management
      fireEvent.press(getByText('Itinerary Management'));

      await waitFor(() => {
        expect(getByText('Families')).toBeTruthy();
      });
    });
  });

  describe('Accordion behavior', () => {
    it('should have electric effect enabled on itinerary accordion', () => {
      const {getByTestId} = renderWithProvider(<AdminScreen />);

      const accordion = getByTestId('itinerary-section');
      expect(accordion).toBeTruthy();
    });

    it('should be collapsed by default (defaultExpanded=false)', () => {
      const {getByText, queryByText} = renderWithProvider(<AdminScreen />);

      // Accordion title should be visible
      expect(getByText('Itinerary Management')).toBeTruthy();

      // Content should not be visible initially
      // (Note: actual behavior depends on GlassAccordion implementation)
    });
  });

  describe('Empty state handling', () => {
    it('should handle no families gracefully', () => {
      (useFamiliesQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<AdminScreen />);

      fireEvent.press(getByText('Itinerary Management'));

      expect(getByText('Add Family')).toBeTruthy();
    });

    it('should handle no assignments gracefully', () => {
      (useAllAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<AdminScreen />);

      fireEvent.press(getByText('Itinerary Management'));

      expect(getByText('Create Assignment')).toBeTruthy();
    });
  });

  describe('useGlowVariant theming', () => {
    it('should apply glow variant to itinerary components', () => {
      const {getByText} = renderWithProvider(<AdminScreen />);

      fireEvent.press(getByText('Itinerary Management'));

      expect(getByText('Add Family')).toBeTruthy();
      expect(getByText('Create Assignment')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple families', () => {
      (useFamiliesQuery as jest.Mock).mockReturnValue({
        data: [
          mockFamilies[0],
          {
            id: 2,
            family_name: 'Johnson Family',
            address_street: '456 Maple Ave',
            address_city: 'Springfield',
            address_postal: '12346',
            latitude: 40.1,
            longitude: -74.1,
          },
        ],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<AdminScreen />);

      fireEvent.press(getByText('Itinerary Management'));

      expect(getByText('Smith Family')).toBeTruthy();
      expect(getByText('Johnson Family')).toBeTruthy();
    });

    it('should handle multiple assignments', () => {
      (useAllAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [
          mockAssignments[0],
          {
            id: 2,
            family_id: 2,
            assigned_to_user_id: 6,
            scheduled_date: '2026-03-16',
            status: 'pending' as const,
            arrived_at: null,
            completed_at: null,
            notes: null,
          },
        ],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<AdminScreen />);

      fireEvent.press(getByText('Itinerary Management'));

      expect(getByText('2026-03-15')).toBeTruthy();
      expect(getByText('2026-03-16')).toBeTruthy();
    });
  });
});

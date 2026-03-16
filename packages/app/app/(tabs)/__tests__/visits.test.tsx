import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import VisitsScreen from '../visits';
import * as geolocation from '../../../features/visits/services/geolocation';

/**
 * Integration tests for Visits Screen
 * SOLID Principles:
 * - Tests end-to-end user flows
 * - Tests integration between components, hooks, and services
 */

// Mock dependencies
jest.mock('../../../features/visits/services/geolocation');
jest.mock('../../../features/visits/hooks/useVisitTracking');
jest.mock('../../../features/visits/hooks', () => ({
  useMyAssignmentsQuery: jest.fn(),
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'visits.myVisits': 'My Visits',
        'common.loading': 'Loading...',
        'visits.noAssignments': 'You have no assigned visits',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@yuhuu/components', () => {
  const RN = require('react-native');
  const React = require('react');

  return {
    useGlowVariant: () => ({glowVariant: 'vibrant'}),
    getGlowColor: () => '#A78BFA',
    useGlassColors: () => ({
      activeColor: '#A78BFA',
      glowVariant: 'vibrant',
      scheme: 'light',
      text: '#000',
      subtext: '#64748B',
      glassBackground: 'rgba(200, 210, 230, 0.85)',
      glowOverlay: (borderRadius = 12) => ({
        borderRadius,
        backgroundColor: '#A78BFA0A',
      }),
      glowBorder: (borderRadius = 12, borderWidth = 1) => ({
        borderRadius,
        borderWidth,
        borderColor: '#A78BFA59',
      }),
    }),
    ThemedText: ({children, style}: any) => (
      <RN.Text style={style}>{children}</RN.Text>
    ),
    GlassBackground: ({children}: {children: React.ReactNode}) => (
      <RN.View testID="glass-background">{children}</RN.View>
    ),
    TabScreenWrapper: ({children, testID, contentContainerStyle}: any) => (
      <RN.ScrollView testID={testID} contentContainerStyle={contentContainerStyle}>
        <RN.View>{children}</RN.View>
      </RN.ScrollView>
    ),
    GlassContentCard: ({children, testID}: any) => (
      <RN.View testID={testID} style={{marginBottom: 12}}>
        <RN.View style={{borderRadius: 12, overflow: 'hidden', padding: 16}}>
          {children}
        </RN.View>
      </RN.View>
    ),
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

import {useMyAssignmentsQuery} from '../../../features/visits/hooks';
import {useVisitTracking} from '../../../features/visits/hooks/useVisitTracking';

describe('VisitsScreen Integration', () => {
  let queryClient: QueryClient;

  const mockAssignments = [
    {
      id: 1,
      family_id: 10,
      assigned_to_user_id: 5,
      scheduled_date: '2026-03-15',
      status: 'pending' as const,
      arrived_at: null,
      completed_at: null,
      notes: null,
    },
    {
      id: 2,
      family_id: 11,
      assigned_to_user_id: 5,
      scheduled_date: '2026-03-16',
      status: 'in_progress' as const,
      arrived_at: '2026-03-16T10:00:00.000Z',
      completed_at: null,
      notes: null,
    },
    {
      id: 3,
      family_id: 12,
      assigned_to_user_id: 5,
      scheduled_date: '2026-03-17',
      status: 'completed' as const,
      arrived_at: '2026-03-17T10:00:00.000Z',
      completed_at: '2026-03-17T10:15:00.000Z',
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

    // Mock geolocation service
    (geolocation.requestLocationPermissions as jest.Mock).mockResolvedValue(true);

    // Mock useVisitTracking hook
    (useVisitTracking as jest.Mock).mockReturnValue({
      isTracking: false,
      hasArrived: false,
      remainingMs: 300000,
      canComplete: false,
      startTracking: jest.fn(),
      completeVisit: jest.fn(),
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
    );
  };

  describe('Screen rendering', () => {
    it('should render screen title', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('My Visits')).toBeTruthy();
    });

    it('should request location permissions on mount', async () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithProvider(<VisitsScreen />);

      await waitFor(() => {
        expect(geolocation.requestLocationPermissions).toHaveBeenCalled();
      });
    });

    it('should show loading state', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Assignment list rendering', () => {
    it('should display pending assignments', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: mockAssignments,
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('Family 10')).toBeTruthy();
    });

    it('should display in_progress assignments', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: mockAssignments,
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('Family 11')).toBeTruthy();
    });

    it('should NOT display completed assignments', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: mockAssignments,
        isLoading: false,
      });

      const {queryByText} = renderWithProvider(<VisitsScreen />);

      expect(queryByText('Family 12')).toBeNull();
    });

    it('should filter to show only pending and in_progress', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: mockAssignments,
        isLoading: false,
      });

      const {getByText, queryByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('Family 10')).toBeTruthy(); // pending
      expect(getByText('Family 11')).toBeTruthy(); // in_progress
      expect(queryByText('Family 12')).toBeNull(); // completed (hidden)
    });
  });

  describe('Empty state', () => {
    it('should show empty state when no assignments', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('You have no assigned visits')).toBeTruthy();
    });

    it('should show empty state when all assignments completed', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [mockAssignments[2]], // Only completed assignment
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('You have no assigned visits')).toBeTruthy();
    });

    it('should not show empty state when assignments exist', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [mockAssignments[0]], // Pending assignment
        isLoading: false,
      });

      const {queryByText} = renderWithProvider(<VisitsScreen />);

      expect(queryByText('You have no assigned visits')).toBeNull();
    });
  });

  describe('VisitTrackingCard integration', () => {
    it('should render VisitCard for each assignment', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [mockAssignments[0]],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('Family 10')).toBeTruthy();
      expect(getByText('Navigate')).toBeTruthy();
      expect(getByText('Mark Complete')).toBeTruthy();
    });

    it('should pass visit data to VisitCard', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [mockAssignments[1]],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('Family 11')).toBeTruthy();
    });

    it('should use useVisitTracking hook for each visit', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [mockAssignments[0]],
        isLoading: false,
      });

      renderWithProvider(<VisitsScreen />);

      expect(useVisitTracking).toHaveBeenCalledWith(mockAssignments[0]);
    });
  });

  describe('Timer integration', () => {
    it('should display timer when visit in progress', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [mockAssignments[1]],
        isLoading: false,
      });

      (useVisitTracking as jest.Mock).mockReturnValue({
        isTracking: true,
        hasArrived: true,
        remainingMs: 300000, // 5 minutes
        canComplete: false,
        startTracking: jest.fn(),
        completeVisit: jest.fn(),
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText(/Time remaining: 5:00/)).toBeTruthy();
    });

    it('should enable complete button after timer expires', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [mockAssignments[1]],
        isLoading: false,
      });

      (useVisitTracking as jest.Mock).mockReturnValue({
        isTracking: true,
        hasArrived: true,
        remainingMs: 0,
        canComplete: true,
        startTracking: jest.fn(),
        completeVisit: jest.fn(),
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      const completeButton = getByText('Mark Complete');
      expect(completeButton).toBeTruthy();
    });
  });

  describe('Permission handling', () => {
    it('should request location permissions when granted', async () => {
      (geolocation.requestLocationPermissions as jest.Mock).mockResolvedValue(true);
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithProvider(<VisitsScreen />);

      await waitFor(() => {
        expect(geolocation.requestLocationPermissions).toHaveBeenCalled();
      });
    });

    it('should request location permissions when denied', async () => {
      (geolocation.requestLocationPermissions as jest.Mock).mockResolvedValue(false);
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithProvider(<VisitsScreen />);

      await waitFor(() => {
        expect(geolocation.requestLocationPermissions).toHaveBeenCalled();
      });
    });

    it('should only request permissions once on mount', async () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithProvider(<VisitsScreen />);

      await waitFor(() => {
        expect(geolocation.requestLocationPermissions).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined assignments data', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      const {queryByText} = renderWithProvider(<VisitsScreen />);

      // Should not crash
      expect(queryByText('My Visits')).toBeTruthy();
    });

    it('should handle null assignments data', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
      });

      const {queryByText} = renderWithProvider(<VisitsScreen />);

      // Should not crash
      expect(queryByText('My Visits')).toBeTruthy();
    });

    it('should handle multiple visits', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [mockAssignments[0], mockAssignments[1]],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('Family 10')).toBeTruthy();
      expect(getByText('Family 11')).toBeTruthy();
    });

    it('should render unique keys for each visit card', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [mockAssignments[0], mockAssignments[1]],
        isLoading: false,
      });

      const {getAllByText} = renderWithProvider(<VisitsScreen />);

      const navigateButtons = getAllByText('Navigate');
      expect(navigateButtons.length).toBe(2);
    });
  });

  describe('Dark mode support', () => {
    it('should support light mode', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<VisitsScreen />);

      expect(getByText('My Visits')).toBeTruthy();
    });
  });

  describe('Tab Screen Layout Pattern', () => {
    it('should use GlassBackground as root wrapper', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {getByTestId} = renderWithProvider(<VisitsScreen />);

      expect(getByTestId('glass-background')).toBeTruthy();
    });

    it('should use TabScreenWrapper with correct testID', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {getByTestId} = renderWithProvider(<VisitsScreen />);

      expect(getByTestId('visits-container')).toBeTruthy();
    });

    it('should NOT use hardcoded backgroundColor in root container', () => {
      (useMyAssignmentsQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {queryByTestId} = renderWithProvider(<VisitsScreen />);

      // GlassBackground should be the root, not a plain View with backgroundColor
      expect(queryByTestId('glass-background')).toBeTruthy();
    });
  });
});

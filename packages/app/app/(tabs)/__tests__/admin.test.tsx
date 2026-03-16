import React from 'react';
import {render} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import AdminScreen from '../admin';

/**
 * Integration tests for Admin Screen Orchestration
 * SOLID Principles:
 * - Single Responsibility: Tests only orchestration and route protection
 * - Dinner management features tested in component-level tests
 */

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({top: 0, bottom: 0, left: 0, right: 0})),
}));

// Mock roles hooks
const mockUseMyRolesQuery = jest.fn();
jest.mock('@/features/roles/meRoles', () => ({
  useMyRolesQuery: (options: any) => mockUseMyRolesQuery(options),
}));

// Mock bootstrap gate
jest.mock('@/features/bootstrap/api', () => ({
  useBootstrapGate: () => true,
}));

// Mock expo-router redirect
const mockRedirect = jest.fn();
jest.mock('expo-router', () => ({
  Redirect: ({href}: any) => {
    mockRedirect(href);
    const {Text} = require('react-native');
    return require('react').createElement(
      Text,
      {testID: 'redirect'},
      `Redirecting to ${href}`
    );
  },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock DinnerManagementContainer
jest.mock('@/components/admin/dinner-management-container', () => ({
  DinnerManagementContainer: ({testID}: {testID: string}) => {
    const {View, Text} = require('react-native');
    return require('react').createElement(
      View,
      {testID},
      require('react').createElement(Text, null, 'Dinner Management Container')
    );
  },
}));

// Mock ItineraryManagement
jest.mock('@/components/visits/ItineraryManagement', () => ({
  ItineraryManagement: () => {
    const {View, Text} = require('react-native');
    return require('react').createElement(
      View,
      {testID: 'itinerary-management'},
      require('react').createElement(Text, null, 'Itinerary Management')
    );
  },
}));

// Mock @yuhuu/components
jest.mock('@yuhuu/components', () => {
  const RN = require('react-native');
  return {
    GlassBackground: ({children}: {children: React.ReactNode}) =>
      require('react').createElement(
        RN.View,
        {testID: 'glass-background'},
        children
      ),
    TabScreenWrapper: ({children, testID, contentContainerStyle}: any) =>
      require('react').createElement(
        RN.ScrollView,
        {testID, contentContainerStyle},
        children
      ),
    GlassAccordion: ({children, title, testID}: any) =>
      require('react').createElement(
        RN.View,
        {testID},
        require('react').createElement(RN.Text, null, title),
        children
      ),
  };
});

describe('AdminScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirect.mockClear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {retry: false},
        mutations: {retry: false},
      },
    });
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
    );
  };

  describe('Route Protection', () => {
    it('should redirect non-admin users to profile', () => {
      mockUseMyRolesQuery.mockReturnValue({
        data: [{role_name: 'User'}],
      });

      renderWithQueryClient(<AdminScreen />);

      expect(mockRedirect).toHaveBeenCalledWith('/profile');
    });

    it('should allow admin users to access screen', () => {
      mockUseMyRolesQuery.mockReturnValue({
        data: [{role_name: 'Admin'}],
      });

      const {getByTestId} = renderWithQueryClient(<AdminScreen />);

      expect(getByTestId('admin-container')).toBeTruthy();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should handle null roles data', () => {
      mockUseMyRolesQuery.mockReturnValue({
        data: null,
      });

      renderWithQueryClient(<AdminScreen />);

      expect(mockRedirect).toHaveBeenCalledWith('/profile');
    });

    it('should handle undefined roles data', () => {
      mockUseMyRolesQuery.mockReturnValue({
        data: undefined,
      });

      renderWithQueryClient(<AdminScreen />);

      expect(mockRedirect).toHaveBeenCalledWith('/profile');
    });

    it('should redirect users with multiple non-admin roles', () => {
      mockUseMyRolesQuery.mockReturnValue({
        data: [{role_name: 'User'}, {role_name: 'Member'}],
      });

      renderWithQueryClient(<AdminScreen />);

      expect(mockRedirect).toHaveBeenCalledWith('/profile');
    });

    it('should allow users with Admin role among multiple roles', () => {
      mockUseMyRolesQuery.mockReturnValue({
        data: [{role_name: 'User'}, {role_name: 'Admin'}, {role_name: 'Member'}],
      });

      const {getByTestId} = renderWithQueryClient(<AdminScreen />);

      expect(getByTestId('admin-container')).toBeTruthy();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('Screen Orchestration', () => {
    beforeEach(() => {
      mockUseMyRolesQuery.mockReturnValue({
        data: [{role_name: 'Admin'}],
      });
    });

    it('should render GlassBackground wrapper', () => {
      const {getByTestId} = renderWithQueryClient(<AdminScreen />);

      expect(getByTestId('glass-background')).toBeTruthy();
    });

    it('should render TabScreenWrapper with correct testID', () => {
      const {getByTestId} = renderWithQueryClient(<AdminScreen />);

      expect(getByTestId('admin-container')).toBeTruthy();
    });

    it('should render DinnerManagementContainer', () => {
      const {getByTestId, getByText} = renderWithQueryClient(<AdminScreen />);

      expect(getByTestId('dinner-management-section')).toBeTruthy();
      expect(getByText('Dinner Management Container')).toBeTruthy();
    });

    it('should render Itinerary Management section', () => {
      const {getByTestId, getByText} = renderWithQueryClient(<AdminScreen />);

      expect(getByTestId('itinerary-section')).toBeTruthy();
      expect(getByText('Itinerary Management')).toBeTruthy();
    });

    it('should render both DinnerManagement and Itinerary sections', () => {
      const {getByText} = renderWithQueryClient(<AdminScreen />);

      expect(getByText('Dinner Management Container')).toBeTruthy();
      expect(getByText('Itinerary Management')).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    beforeEach(() => {
      mockUseMyRolesQuery.mockReturnValue({
        data: [{role_name: 'Admin'}],
      });
    });

    it('should use consistent section styling', () => {
      const {getByTestId} = renderWithQueryClient(<AdminScreen />);

      const itinerarySection = getByTestId('itinerary-section');
      expect(itinerarySection).toBeTruthy();
    });

    it('should maintain proper component hierarchy', () => {
      const {getByTestId} = renderWithQueryClient(<AdminScreen />);

      // GlassBackground > TabScreenWrapper > Sections
      const glassBackground = getByTestId('glass-background');
      const container = getByTestId('admin-container');

      expect(glassBackground).toBeTruthy();
      expect(container).toBeTruthy();
    });
  });
});

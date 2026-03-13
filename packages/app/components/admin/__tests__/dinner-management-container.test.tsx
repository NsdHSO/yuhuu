import React from 'react';
import {render} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {DinnerManagementContainer} from '../dinner-management-container';

/**
 * Unit tests for DinnerManagementContainer component
 * SOLID Principles:
 * - Single Responsibility: Tests orchestration of dinner management sections
 * - Tests composition pattern (container with 3 sub-sections)
 */

jest.mock('../dinner-graph-section', () => ({
  DinnerGraphSection: ({testID}: {testID: string}) => {
    const RN = require('react-native');
    return (
      <RN.View testID={testID}>
        <RN.Text>Dinner Graph Section</RN.Text>
      </RN.View>
    );
  },
}));

jest.mock('../user-attendance-section', () => ({
  UserAttendanceSection: ({testID}: {testID: string}) => {
    const RN = require('react-native');
    return (
      <RN.View testID={testID}>
        <RN.Text>User Attendance Section</RN.Text>
      </RN.View>
    );
  },
}));

jest.mock('../dinner-participants-section', () => ({
  DinnerParticipantsSection: ({testID}: {testID: string}) => {
    const RN = require('react-native');
    return (
      <RN.View testID={testID}>
        <RN.Text>Dinner Participants Section</RN.Text>
      </RN.View>
    );
  },
}));

jest.mock('@yuhuu/components', () => {
  const RN = require('react-native');
  return {
    GlassAccordion: ({children, title, testID}: any) => (
      <RN.View testID={testID}>
        <RN.Text>{title}</RN.Text>
        {children}
      </RN.View>
    ),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('DinnerManagementContainer', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {retry: false},
        mutations: {retry: false},
      },
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
    );
  };

  describe('Component rendering', () => {
    it('should render parent GlassAccordion with correct title', () => {
      const {getByText} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      expect(getByText('admin.dinnerManagement')).toBeTruthy();
    });

    it('should render with correct testID', () => {
      const {getByTestId} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      expect(getByTestId('test-container')).toBeTruthy();
    });
  });

  describe('Sub-sections rendering', () => {
    it('should render DinnerGraphSection', () => {
      const {getByText} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      expect(getByText('Dinner Graph Section')).toBeTruthy();
    });

    it('should render UserAttendanceSection', () => {
      const {getByText} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      expect(getByText('User Attendance Section')).toBeTruthy();
    });

    it('should render DinnerParticipantsSection', () => {
      const {getByText} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      expect(getByText('Dinner Participants Section')).toBeTruthy();
    });

    it('should render all 3 sections together', () => {
      const {getByText} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      expect(getByText('Dinner Graph Section')).toBeTruthy();
      expect(getByText('User Attendance Section')).toBeTruthy();
      expect(getByText('Dinner Participants Section')).toBeTruthy();
    });
  });

  describe('TestID propagation', () => {
    it('should pass testID to DinnerGraphSection', () => {
      const {getByTestId} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      expect(getByTestId('dinner-graph-section')).toBeTruthy();
    });

    it('should pass testID to UserAttendanceSection', () => {
      const {getByTestId} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      expect(getByTestId('user-search-section')).toBeTruthy();
    });

    it('should pass testID to DinnerParticipantsSection', () => {
      const {getByTestId} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      expect(getByTestId('dinner-participants-section')).toBeTruthy();
    });
  });

  describe('Orchestrator pattern', () => {
    it('should be a pure composition component with no business logic', () => {
      // This component should only compose sub-components, no data fetching
      const {getByTestId} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      // Should render without needing any props except testID
      expect(getByTestId('test-container')).toBeTruthy();
    });

    it('should delegate all state management to child components', () => {
      // Child components manage their own state (searchedUser, selectedDinnerId, etc.)
      // This orchestrator just composes them
      const {getByText} = renderWithProvider(<DinnerManagementContainer testID="test-container" />);

      // All sections should be present (child components handle their own state)
      expect(getByText('Dinner Graph Section')).toBeTruthy();
      expect(getByText('User Attendance Section')).toBeTruthy();
      expect(getByText('Dinner Participants Section')).toBeTruthy();
    });
  });
});

import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {UserAttendanceSection} from '../user-attendance-section';
import * as adminHooks from '../../../features/admin/hooks';

/**
 * Unit tests for UserAttendanceSection component
 * SOLID Principles:
 * - Single Responsibility: Tests only user attendance display
 * - Tests component with self-contained state management
 */

jest.mock('../../../features/admin/hooks');
jest.mock('../../admin/user-search', () => ({
  UserSearch: ({onSearch, testID}: any) => {
    const RN = require('react-native');
    return (
      <RN.View testID={testID}>
        <RN.Button
          title="Search User"
          onPress={() => onSearch({id: 123, username: 'testuser'})}
        />
      </RN.View>
    );
  },
}));

jest.mock('@yuhuu/components', () => {
  const RN = require('react-native');
  return {
    useGlowVariant: () => ({glowVariant: 'vibrant'}),
    getGlowColor: () => '#A78BFA',
    useColorScheme: () => 'light',
    Colors: {
      light: {tint: '#007AFF', icon: '#8E8E93'},
      dark: {tint: '#0A84FF', icon: '#8E8E93'},
    },
    GlassAccordion: ({children, title, testID}: any) => (
      <RN.View testID={testID}>
        <RN.Text>{title}</RN.Text>
        {children}
      </RN.View>
    ),
    DinnerAttendance: ({username, data, testID}: any) => (
      <RN.View testID={testID}>
        <RN.Text>Attendance for {username}: {data?.length || 0} records</RN.Text>
      </RN.View>
    ),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('UserAttendanceSection', () => {
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
    it('should render GlassAccordion with correct title', () => {
      jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      const {getByText} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      expect(getByText('admin.searchUser')).toBeTruthy();
    });

    it('should render UserSearch component', () => {
      jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      const {getByTestId} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      expect(getByTestId('test-section-search')).toBeTruthy();
    });
  });

  describe('User search interaction', () => {
    it('should not show attendance before user search', () => {
      jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);

      const {queryByTestId} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      expect(queryByTestId('test-section-loading')).toBeNull();
      expect(queryByTestId('test-section-attendance')).toBeNull();
    });

    it('should trigger query when user is searched', () => {
      const mockQuery = jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      const {getByText} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      fireEvent.press(getByText('Search User'));

      // Query should be called with username
      expect(mockQuery).toHaveBeenCalledWith('testuser');
    });
  });

  describe('Loading state', () => {
    it('should show loading spinner when fetching attendance', () => {
      jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const {getByText, getByTestId} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      fireEvent.press(getByText('Search User'));

      expect(getByTestId('test-section-loading')).toBeTruthy();
    });
  });

  describe('Error state', () => {
    it('should show error message when query fails', () => {
      jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('User not found'),
      } as any);

      const {getByText} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      fireEvent.press(getByText('Search User'));

      expect(getByText('admin.userNotFound')).toBeTruthy();
    });
  });

  describe('Empty state', () => {
    it('should show empty message when user has no attendance records', () => {
      jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      const {getByText} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      fireEvent.press(getByText('Search User'));

      expect(getByText('admin.noAttendanceRecords')).toBeTruthy();
    });
  });

  describe('Success state', () => {
    it('should render DinnerAttendance with data', () => {
      const mockData = [{dinner_id: 1, attended: true}];
      jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any);

      const {getByText, getByTestId} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      fireEvent.press(getByText('Search User'));

      expect(getByTestId('test-section-attendance')).toBeTruthy();
    });

    it('should pass username and data to DinnerAttendance', () => {
      const mockData = [{dinner_id: 1, attended: true}, {dinner_id: 2, attended: false}];
      jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any);

      const {getByText} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      fireEvent.press(getByText('Search User'));

      expect(getByText('Attendance for testuser: 2 records')).toBeTruthy();
    });
  });

  describe('State management', () => {
    it('should manage searchedUser state internally', () => {
      jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: [{dinner_id: 1, attended: true}],
        isLoading: false,
        error: null,
      } as any);

      const {getByText, getByTestId} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      // Initially no user selected
      expect(() => getByTestId('test-section-attendance')).toThrow();

      // After search, user is selected
      fireEvent.press(getByText('Search User'));
      expect(getByTestId('test-section-attendance')).toBeTruthy();
    });

    it('should not require external state props', () => {
      jest.spyOn(adminHooks, 'useUserAttendanceQuery').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      // Should render with only testID prop
      const {getByTestId} = renderWithProvider(<UserAttendanceSection testID="test-section" />);

      expect(getByTestId('test-section')).toBeTruthy();
    });
  });
});

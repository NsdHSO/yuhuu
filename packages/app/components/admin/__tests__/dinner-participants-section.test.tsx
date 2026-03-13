import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {DinnerParticipantsSection} from '../dinner-participants-section';
import * as dinnerHooks from '../../../features/dinners/hooks';

/**
 * Unit tests for DinnerParticipantsSection component
 * SOLID Principles:
 * - Single Responsibility: Tests only dinner participants display
 * - Tests component with self-contained state management
 */

jest.mock('../../../features/dinners/hooks');
jest.mock('@yuhuu/components', () => {
  const RN = require('react-native');
  return {
    useGlowVariant: () => ({glowVariant: 'vibrant'}),
    getGlowColor: () => '#A78BFA',
    useColorScheme: () => 'light',
    Colors: {
      light: {tint: '#007AFF'},
      dark: {tint: '#0A84FF'},
    },
    GlassAccordion: ({children, title, testID}: any) => (
      <RN.View testID={testID}>
        <RN.Text>{title}</RN.Text>
        {children}
      </RN.View>
    ),
    DinnerIdSearch: ({onDinnerIdChange, testID}: any) => (
      <RN.View testID={testID}>
        <RN.Button
          title="Search Dinner"
          onPress={() => onDinnerIdChange(42)}
        />
      </RN.View>
    ),
    ParticipantsList: ({participants, testID}: any) => (
      <RN.View testID={testID}>
        <RN.Text>{participants?.length || 0} participants</RN.Text>
      </RN.View>
    ),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('DinnerParticipantsSection', () => {
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
      jest.spyOn(dinnerHooks, 'useParticipantsByDinnerQuery').mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      const {getByText} = renderWithProvider(<DinnerParticipantsSection testID="test-section" />);

      expect(getByText('admin.viewParticipants')).toBeTruthy();
    });

    it('should render DinnerIdSearch component', () => {
      jest.spyOn(dinnerHooks, 'useParticipantsByDinnerQuery').mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      const {getByTestId} = renderWithProvider(<DinnerParticipantsSection testID="test-section" />);

      expect(getByTestId('test-section-search')).toBeTruthy();
    });
  });

  describe('Dinner search interaction', () => {
    it('should not show participants before dinner search', () => {
      jest.spyOn(dinnerHooks, 'useParticipantsByDinnerQuery').mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      const {queryByTestId} = renderWithProvider(<DinnerParticipantsSection testID="test-section" />);

      expect(queryByTestId('test-section-loading')).toBeNull();
      expect(queryByTestId('test-section-list')).toBeNull();
    });

    it('should trigger query when dinner is searched', () => {
      const mockQuery = jest.spyOn(dinnerHooks, 'useParticipantsByDinnerQuery').mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      const {getByText} = renderWithProvider(<DinnerParticipantsSection testID="test-section" />);

      fireEvent.press(getByText('Search Dinner'));

      // Query should be called with dinner ID
      expect(mockQuery).toHaveBeenCalledWith(42);
    });
  });

  describe('Loading state', () => {
    it('should show loading spinner when fetching participants', () => {
      jest.spyOn(dinnerHooks, 'useParticipantsByDinnerQuery').mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);

      const {getByText, getByTestId} = renderWithProvider(<DinnerParticipantsSection testID="test-section" />);

      fireEvent.press(getByText('Search Dinner'));

      expect(getByTestId('test-section-loading')).toBeTruthy();
    });
  });

  describe('Error state', () => {
    it('should show error message when query fails', () => {
      jest.spyOn(dinnerHooks, 'useParticipantsByDinnerQuery').mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Dinner not found'),
      } as any);

      const {getByText} = renderWithProvider(<DinnerParticipantsSection testID="test-section" />);

      fireEvent.press(getByText('Search Dinner'));

      expect(getByText('admin.participantsLoadError')).toBeTruthy();
    });
  });

  describe('Success state', () => {
    it('should render ParticipantsList with data', () => {
      const mockParticipants = [{user_id: 1, username: 'user1'}];
      jest.spyOn(dinnerHooks, 'useParticipantsByDinnerQuery').mockReturnValue({
        data: mockParticipants,
        isLoading: false,
        error: null,
      } as any);

      const {getByText, getByTestId} = renderWithProvider(<DinnerParticipantsSection testID="test-section" />);

      fireEvent.press(getByText('Search Dinner'));

      expect(getByTestId('test-section-list')).toBeTruthy();
    });

    it('should pass participants data to ParticipantsList', () => {
      const mockParticipants = [
        {user_id: 1, username: 'user1'},
        {user_id: 2, username: 'user2'},
      ];
      jest.spyOn(dinnerHooks, 'useParticipantsByDinnerQuery').mockReturnValue({
        data: mockParticipants,
        isLoading: false,
        error: null,
      } as any);

      const {getByText} = renderWithProvider(<DinnerParticipantsSection testID="test-section" />);

      fireEvent.press(getByText('Search Dinner'));

      expect(getByText('2 participants')).toBeTruthy();
    });
  });

  describe('State management', () => {
    it('should manage selectedDinnerId state internally', () => {
      jest.spyOn(dinnerHooks, 'useParticipantsByDinnerQuery').mockReturnValue({
        data: [{user_id: 1, username: 'user1'}],
        isLoading: false,
        error: null,
      } as any);

      const {getByText, getByTestId} = renderWithProvider(<DinnerParticipantsSection testID="test-section" />);

      // Initially no dinner selected
      expect(() => getByTestId('test-section-list')).toThrow();

      // After search, dinner is selected
      fireEvent.press(getByText('Search Dinner'));
      expect(getByTestId('test-section-list')).toBeTruthy();
    });

    it('should not require external state props', () => {
      jest.spyOn(dinnerHooks, 'useParticipantsByDinnerQuery').mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      } as any);

      // Should render with only testID prop
      const {getByTestId} = renderWithProvider(<DinnerParticipantsSection testID="test-section" />);

      expect(getByTestId('test-section')).toBeTruthy();
    });
  });
});

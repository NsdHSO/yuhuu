import React from 'react';
import {render} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {DinnerGraphSection} from '../dinner-graph-section';
import * as adminHooks from '../../../features/admin/hooks';

/**
 * Unit tests for DinnerGraphSection component
 * SOLID Principles:
 * - Single Responsibility: Tests only dinner graph display
 * - Tests component in isolation with mocked dependencies
 */

jest.mock('../../../features/admin/hooks');
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
    DinnerGraph: ({data, testID}: any) => (
      <RN.View testID={testID}>
        <RN.Text>Graph with {data?.length || 0} data points</RN.Text>
      </RN.View>
    ),
  };
});

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('DinnerGraphSection', () => {
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
      jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      const {getByText} = renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(getByText('admin.dinnerParticipation')).toBeTruthy();
    });

    it('should render with correct testID', () => {
      jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      const {getByTestId} = renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(getByTestId('test-section')).toBeTruthy();
    });
  });

  describe('Loading state', () => {
    it('should show loading spinner when data is loading', () => {
      jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const {getByTestId} = renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(getByTestId('test-section-loading')).toBeTruthy();
    });

    it('should not show graph when loading', () => {
      jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const {queryByTestId} = renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(queryByTestId('test-section-graph')).toBeNull();
    });
  });

  describe('Error state', () => {
    it('should show error message when query fails', () => {
      jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      } as any);

      const {getByText} = renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(getByText('admin.loadError')).toBeTruthy();
    });

    it('should not show graph when error occurs', () => {
      jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      } as any);

      const {queryByTestId} = renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(queryByTestId('test-section-graph')).toBeNull();
    });
  });

  describe('Success state', () => {
    it('should render DinnerGraph with data', () => {
      const mockData = [{date: '2026-03-01', count: 5}];
      jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any);

      const {getByTestId} = renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(getByTestId('test-section-graph')).toBeTruthy();
    });

    it('should pass data to DinnerGraph component', () => {
      const mockData = [{date: '2026-03-01', count: 5}, {date: '2026-03-02', count: 3}];
      jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any);

      const {getByText} = renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(getByText('Graph with 2 data points')).toBeTruthy();
    });

    it('should not show loading or error when data loaded', () => {
      const mockData = [{date: '2026-03-01', count: 5}];
      jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any);

      const {queryByTestId, queryByText} = renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(queryByTestId('test-section-loading')).toBeNull();
      expect(queryByText('admin.loadError')).toBeNull();
    });
  });

  describe('Component isolation', () => {
    it('should manage its own data fetching via useDinnerStatsQuery', () => {
      const mockQuery = jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(mockQuery).toHaveBeenCalled();
    });

    it('should not require external state management', () => {
      jest.spyOn(adminHooks, 'useDinnerStatsQuery').mockReturnValue({
        data: [{date: '2026-03-01', count: 5}],
        isLoading: false,
        error: null,
      } as any);

      // Should render without any props except testID
      const {getByTestId} = renderWithProvider(<DinnerGraphSection testID="test-section" />);

      expect(getByTestId('test-section')).toBeTruthy();
    });
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserSearch } from '../user-search';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'admin.searchPlaceholder': 'Search by name...',
        'admin.searchMinChars': 'Type at least 2 characters to search',
        'admin.noUsersFound': 'No users found',
        'common.loading': 'Searching...',
        'admin.searchFailed': 'Search failed. Please try again',
        'admin.adminAccessRequired': 'Admin access required',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock hooks
jest.mock('@/features/admin/api', () => ({
  useUserSearchQuery: jest.fn(),
}));

const mockOnSearch = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  return Wrapper;
}

describe('UserSearch - Validation Hint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show validation hint when 1 character is typed', () => {
    const { useUserSearchQuery } = require('@/features/admin/api');
    useUserSearchQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<UserSearch onSearch={mockOnSearch} />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.changeText(input, 'J');

    expect(screen.getByText('Type at least 2 characters to search')).toBeTruthy();
  });

  it('should NOT show validation hint when input is empty', () => {
    const { useUserSearchQuery } = require('@/features/admin/api');
    useUserSearchQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<UserSearch onSearch={mockOnSearch} />, { wrapper: createWrapper() });

    expect(screen.queryByText('Type at least 2 characters to search')).toBeNull();
  });

  it('should NOT show validation hint when 2 or more characters are typed', () => {
    const { useUserSearchQuery } = require('@/features/admin/api');
    useUserSearchQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<UserSearch onSearch={mockOnSearch} />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.changeText(input, 'Ja');

    expect(screen.queryByText('Type at least 2 characters to search')).toBeNull();
  });
});

describe('UserSearch - Error Display', () => {
  it('should display 403 error message', () => {
    const { useUserSearchQuery } = require('@/features/admin/api');
    useUserSearchQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { response: { status: 403 }, message: 'Forbidden' },
    });

    render(<UserSearch onSearch={mockOnSearch} />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.changeText(input, 'James');

    expect(screen.getByText(/Admin access required/i)).toBeTruthy();
  });

  it('should display generic error message for network errors', () => {
    const { useUserSearchQuery } = require('@/features/admin/api');
    useUserSearchQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });

    render(<UserSearch onSearch={mockOnSearch} />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.changeText(input, 'Test');

    expect(screen.getByText(/Search failed/i)).toBeTruthy();
  });

  it('should NOT display error when search is successful', () => {
    const { useUserSearchQuery } = require('@/features/admin/api');
    useUserSearchQuery.mockReturnValue({
      data: [{ id: 1, user_id: 22, middle_name: 'James', phone: '123' }],
      isLoading: false,
      error: null,
    });

    render(<UserSearch onSearch={mockOnSearch} />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Search by name...');
    fireEvent.changeText(input, 'James');

    expect(screen.queryByText(/Admin access required/i)).toBeNull();
    expect(screen.queryByText(/Search failed/i)).toBeNull();
  });
});

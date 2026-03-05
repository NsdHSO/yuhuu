import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserSearchQuery } from '../hooks';
import type { AdminRepository } from '../repository';

// Mock repository
const mockRepository: AdminRepository = {
  searchUsers: jest.fn(),
};

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useUserSearchQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should NOT call API when search term is less than 2 characters', async () => {
    const { result } = renderHook(
      () => useUserSearchQuery('J', mockRepository),
      { wrapper: createWrapper() }
    );

    // Wait a bit to ensure no API call
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockRepository.searchUsers).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('should call API when search term is 2 or more characters', async () => {
    const mockResults = [
      {
        id: 1,
        user_id: 22,
        middle_name: 'James',
        phone: '0812345678',
        profile_picture_url: null,
      },
    ];

    (mockRepository.searchUsers as jest.Mock).mockResolvedValue(mockResults);

    const { result } = renderHook(
      () => useUserSearchQuery('Ja', mockRepository),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockRepository.searchUsers).toHaveBeenCalledWith('Ja');
    expect(result.current.data).toEqual(mockResults);
  });

  it('should trim whitespace before checking length', async () => {
    const { result } = renderHook(
      () => useUserSearchQuery('  J  ', mockRepository),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Trimmed to "J" which is < 2 chars
    expect(mockRepository.searchUsers).not.toHaveBeenCalled();
  });

  it('should handle 403 Forbidden error gracefully', async () => {
    const error403 = {
      response: { status: 403 },
      message: 'Forbidden',
    };

    (mockRepository.searchUsers as jest.Mock).mockRejectedValue(error403);

    const { result } = renderHook(
      () => useUserSearchQuery('James', mockRepository),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
    expect(mockRepository.searchUsers).toHaveBeenCalledWith('James');
  });

  it('should handle 400 Bad Request error gracefully', async () => {
    const error400 = {
      response: { status: 400 },
      message: 'Bad Request',
    };

    (mockRepository.searchUsers as jest.Mock).mockRejectedValue(error400);

    const { result } = renderHook(
      () => useUserSearchQuery('AB', mockRepository),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network error');

    (mockRepository.searchUsers as jest.Mock).mockRejectedValue(networkError);

    const { result } = renderHook(
      () => useUserSearchQuery('Test', mockRepository),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should return empty array for 404 Not Found', async () => {
    (mockRepository.searchUsers as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(
      () => useUserSearchQuery('NonExistent', mockRepository),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});

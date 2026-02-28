import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthProvider';
import { authApi } from '@/lib/api';
import * as tokenManager from '@/lib/tokenManager';
import * as nav from '@/lib/nav';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('@/lib/tokenManager');
jest.mock('@/lib/nav');

describe('AuthProvider', () => {
    const mockPost = jest.fn();
    const mockGetValidAccessToken = jest.fn();
    const mockSetTokensFromLogin = jest.fn();
    const mockClearTokens = jest.fn();
    const mockRedirectToLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (authApi.post as jest.Mock) = mockPost;
        (tokenManager.getValidAccessToken as jest.Mock) = mockGetValidAccessToken;
        (tokenManager.setTokensFromLogin as jest.Mock) = mockSetTokensFromLogin;
        (tokenManager.clearTokens as jest.Mock) = mockClearTokens;
        (nav.redirectToLogin as jest.Mock) = mockRedirectToLogin;
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
    );

    describe('useAuth Hook', () => {
        it('should throw error when used outside AuthProvider', () => {
            // Suppress console.error for this test
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                renderHook(() => useAuth());
            }).toThrow('AuthProvider missing');

            consoleError.mockRestore();
        });

        it('should return auth context when used inside AuthProvider', () => {
            mockGetValidAccessToken.mockResolvedValue(null);

            const { result } = renderHook(() => useAuth(), { wrapper });

            expect(result.current).toHaveProperty('user');
            expect(result.current).toHaveProperty('status');
            expect(result.current).toHaveProperty('signIn');
            expect(result.current).toHaveProperty('signOut');
        });
    });

    describe('Initial State', () => {
        it('should start with loading then transition to signed-out', async () => {
            mockGetValidAccessToken.mockResolvedValue(null);

            const { result } = renderHook(() => useAuth(), { wrapper });

            // Initial state is 'idle', quickly transitions to 'loading'
            await waitFor(() => {
                expect(result.current.status).not.toBe('idle');
            });

            // Then transitions to 'signed-out'
            await waitFor(() => {
                expect(result.current.status).toBe('signed-out');
                expect(result.current.user).toBeNull();
            });
        });

        it('should set status to signed-in when valid token exists', async () => {
            mockGetValidAccessToken.mockResolvedValue('valid-token');

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.status).toBe('signed-in');
            });
        });

        it('should set status to signed-out when no valid token exists', async () => {
            mockGetValidAccessToken.mockResolvedValue(null);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.status).toBe('signed-out');
            });
        });
    });

    describe('signIn', () => {
        it('should sign in successfully with accessToken and user', async () => {
            mockGetValidAccessToken.mockResolvedValue(null);
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'access-token',
                    refreshToken: 'refresh-token',
                    user: {
                        id: '123',
                        email: 'test@example.com',
                        name: 'Test User'
                    }
                }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.signIn('test@example.com', 'password123');
            });

            expect(mockPost).toHaveBeenCalledWith('/auth/login', {
                email: 'test@example.com',
                password: 'password123'
            });

            expect(mockSetTokensFromLogin).toHaveBeenCalledWith('access-token', 'refresh-token');

            expect(result.current.user).toEqual({
                id: '123',
                email: 'test@example.com',
                name: 'Test User'
            });

            expect(result.current.status).toBe('signed-in');
        });

        it('should handle alternative token field names (access_token)', async () => {
            mockGetValidAccessToken.mockResolvedValue(null);
            mockPost.mockResolvedValue({
                data: {
                    access_token: 'access-token',
                    refresh_token: 'refresh-token'
                }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.signIn('test@example.com', 'password123');
            });

            expect(mockSetTokensFromLogin).toHaveBeenCalledWith('access-token', 'refresh-token');
            expect(result.current.status).toBe('signed-in');
        });

        it('should handle token field name (token)', async () => {
            mockGetValidAccessToken.mockResolvedValue(null);
            mockPost.mockResolvedValue({
                data: {
                    token: 'access-token'
                }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.signIn('test@example.com', 'password123');
            });

            expect(mockSetTokensFromLogin).toHaveBeenCalledWith('access-token', undefined);
            expect(result.current.status).toBe('signed-in');
        });

        it('should handle nested token in message object', async () => {
            mockGetValidAccessToken.mockResolvedValue(null);
            mockPost.mockResolvedValue({
                data: {
                    message: {
                        access_token: 'access-token',
                        refresh_token: 'refresh-token',
                        user: {
                            id: '456',
                            email: 'test2@example.com'
                        }
                    }
                }
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.signIn('test2@example.com', 'password123');
            });

            expect(mockSetTokensFromLogin).toHaveBeenCalledWith('access-token', 'refresh-token');
            expect(result.current.user).toEqual({
                id: '456',
                email: 'test2@example.com'
            });
            expect(result.current.status).toBe('signed-in');
        });

        it('should set status to signed-out on sign in failure', async () => {
            mockGetValidAccessToken.mockResolvedValue(null);
            mockPost.mockRejectedValue(new Error('Invalid credentials'));

            const { result } = renderHook(() => useAuth(), { wrapper });

            // Wait for initial loading to complete
            await waitFor(() => {
                expect(result.current.status).toBe('signed-out');
            });

            await expect(async () => {
                await act(async () => {
                    await result.current.signIn('test@example.com', 'wrongpassword');
                });
            }).rejects.toThrow('Invalid credentials');

            await waitFor(() => {
                expect(result.current.user).toBeNull();
                expect(result.current.status).toBe('signed-out');
            });
        });

        it('should set loading status during sign in', async () => {
            mockGetValidAccessToken.mockResolvedValue(null);

            let resolvePost: any;
            mockPost.mockReturnValue(
                new Promise((resolve) => {
                    resolvePost = resolve;
                })
            );

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.status).toBe('signed-out');
            });

            act(() => {
                result.current.signIn('test@example.com', 'password123');
            });

            await waitFor(() => {
                expect(result.current.status).toBe('loading');
            });

            act(() => {
                resolvePost({
                    data: {
                        accessToken: 'token'
                    }
                });
            });

            await waitFor(() => {
                expect(result.current.status).toBe('signed-in');
            });
        });
    });

    describe('signOut', () => {
        it('should sign out successfully', async () => {
            mockGetValidAccessToken.mockResolvedValue('valid-token');
            mockPost.mockResolvedValue({});

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.status).toBe('signed-in');
            });

            await act(async () => {
                await result.current.signOut();
            });

            expect(mockPost).toHaveBeenCalledWith('/auth/logout', {});
            expect(mockClearTokens).toHaveBeenCalled();
            expect(mockRedirectToLogin).toHaveBeenCalled();
            expect(result.current.user).toBeNull();
            expect(result.current.status).toBe('signed-out');
        });

        it('should clear tokens and redirect even if logout API fails', async () => {
            mockGetValidAccessToken.mockResolvedValue('valid-token');
            mockPost.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.status).toBe('signed-in');
            });

            await act(async () => {
                await result.current.signOut();
            });

            expect(mockClearTokens).toHaveBeenCalled();
            expect(mockRedirectToLogin).toHaveBeenCalled();
            expect(result.current.status).toBe('signed-out');
        });

        it('should handle redirect to login failure gracefully', async () => {
            mockGetValidAccessToken.mockResolvedValue('valid-token');
            mockPost.mockResolvedValue({});
            mockRedirectToLogin.mockImplementation(() => {
                throw new Error('Navigation error');
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.status).toBe('signed-in');
            });

            await act(async () => {
                await result.current.signOut();
            });

            // Should still complete sign out even if redirect fails
            expect(result.current.status).toBe('signed-out');
            expect(result.current.user).toBeNull();
        });
    });

    describe('User Persistence', () => {
        it('should maintain user data across re-renders', async () => {
            mockGetValidAccessToken.mockResolvedValue(null);
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'token',
                    user: {
                        id: '123',
                        email: 'test@example.com',
                        name: 'Test User'
                    }
                }
            });

            const { result, rerender } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
                await result.current.signIn('test@example.com', 'password123');
            });

            const userBeforeRerender = result.current.user;

            rerender({});

            expect(result.current.user).toEqual(userBeforeRerender);
        });
    });
});

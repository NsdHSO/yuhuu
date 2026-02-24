import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../login';
import { AuthProvider } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { authApi } from '@/lib/api';
import * as tokenManager from '@/lib/tokenManager';

/**
 * Integration Tests for Authentication Flow
 *
 * These tests verify the complete authentication workflow from UI interaction
 * through the AuthProvider to API calls and token management.
 */

// Mock dependencies
jest.mock('expo-router', () => ({
    Stack: {
        Screen: () => null
    },
    useRouter: jest.fn()
}));

jest.mock('@/lib/api');
jest.mock('@/lib/tokenManager');
jest.mock('@/lib/nav');

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light'
}));

jest.spyOn(Alert, 'alert');

describe('Authentication Flow - Integration Tests', () => {
    const mockPush = jest.fn();
    const mockReplace = jest.fn();
    const mockPost = jest.fn();
    const mockGetValidAccessToken = jest.fn();
    const mockSetTokensFromLogin = jest.fn();
    const mockClearTokens = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            replace: mockReplace
        });
        (authApi.post as jest.Mock) = mockPost;
        (tokenManager.getValidAccessToken as jest.Mock) = mockGetValidAccessToken;
        (tokenManager.setTokensFromLogin as jest.Mock) = mockSetTokensFromLogin;
        (tokenManager.clearTokens as jest.Mock) = mockClearTokens;

        // Default: no existing token
        mockGetValidAccessToken.mockResolvedValue(null);
    });

    const renderLoginWithAuth = () => {
        return render(
            <AuthProvider>
                <LoginScreen />
            </AuthProvider>
        );
    };

    describe('Complete Sign In Flow', () => {
        it('should complete full sign in flow successfully', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'test-access-token',
                    refreshToken: 'test-refresh-token',
                    user: {
                        id: '123',
                        email: 'test@example.com',
                        name: 'Test User'
                    }
                }
            });

            renderLoginWithAuth();

            // Wait for initial load
            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            // User enters credentials
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');

            // User clicks sign in
            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            // Verify API call
            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/login', {
                    email: 'test@example.com',
                    password: 'password123'
                });
            });

            // Verify tokens were saved
            expect(mockSetTokensFromLogin).toHaveBeenCalledWith(
                'test-access-token',
                'test-refresh-token'
            );

            // Verify navigation to main app
            expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
        });

        it('should handle sign in with only access token (no refresh token)', async () => {
            mockPost.mockResolvedValue({
                data: {
                    token: 'test-token'
                }
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(mockSetTokensFromLogin).toHaveBeenCalledWith('test-token', undefined);
            });

            expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
        });
    });

    describe('Sign In Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            mockPost.mockRejectedValue(new Error('Network error'));

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Login failed. Please try again.'
                );
            });

            // Should not navigate
            expect(mockReplace).not.toHaveBeenCalled();

            // Should not save tokens
            expect(mockSetTokensFromLogin).not.toHaveBeenCalled();
        });

        it('should handle 401 unauthorized error', async () => {
            mockPost.mockRejectedValue({
                response: {
                    status: 401,
                    data: {
                        message: 'Invalid email or password'
                    }
                }
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'wrongpassword');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Invalid email or password'
                );
            });

            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should handle 500 server error', async () => {
            mockPost.mockRejectedValue({
                response: {
                    status: 500,
                    data: {
                        message: 'Internal server error'
                    }
                }
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Internal server error'
                );
            });
        });
    });

    describe('User Input Validation Flow', () => {
        it('should prevent sign in with empty email', async () => {
            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            const passwordInput = screen.getByPlaceholderText('Password');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Missing fields',
                    'Please enter email and password.'
                );
            });

            // API should not be called
            expect(mockPost).not.toHaveBeenCalled();
        });

        it('should prevent sign in with empty password', async () => {
            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            const emailInput = screen.getByPlaceholderText('Email');
            fireEvent.changeText(emailInput, 'test@example.com');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Missing fields',
                    'Please enter email and password.'
                );
            });

            expect(mockPost).not.toHaveBeenCalled();
        });
    });

    describe('Sign In State Management', () => {
        it('should show loading state during sign in', async () => {
            let resolvePost: any;
            mockPost.mockReturnValue(
                new Promise((resolve) => {
                    resolvePost = resolve;
                })
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            // Should show loading state
            await waitFor(() => {
                expect(screen.getByText('Signing in…')).toBeTruthy();
            });

            // Complete the sign in
            resolvePost({
                data: {
                    accessToken: 'token'
                }
            });

            // Should navigate after completion
            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });

        it('should allow retry after failed sign in', async () => {
            // First attempt fails
            mockPost.mockRejectedValueOnce(new Error('Network error'));

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Login failed. Please try again.'
                );
            });

            // Second attempt succeeds
            mockPost.mockResolvedValueOnce({
                data: {
                    accessToken: 'token'
                }
            });

            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });
    });

    describe('Email Trimming', () => {
        it('should trim whitespace from email before sign in', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'token'
                }
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, '   test@example.com   ');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/login', {
                    email: 'test@example.com',
                    password: 'password123'
                });
            });
        });
    });
});

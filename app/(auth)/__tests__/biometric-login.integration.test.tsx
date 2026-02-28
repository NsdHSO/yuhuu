import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Text, TouchableOpacity } from 'react-native';
import LoginScreen from '../login';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { authApi } from '@/lib/api';
import * as tokenManager from '@/lib/tokenManager';
import * as biometricAuth from '@/lib/biometricAuth';
import * as secureStore from '@/lib/secureStore';

/**
 * Integration Tests for Biometric Login Flow
 *
 * These tests verify the complete biometric authentication workflow
 * from UI interaction through the AuthProvider to biometric hardware,
 * token refresh, and navigation.
 *
 * Flow:
 * 1. User sees biometric login button (when hardware available + preference enabled)
 * 2. User presses biometric button
 * 3. Device biometric prompt appears (fingerprint / face)
 * 4. On success: refreshAccessToken obtains new access token
 * 5. User navigated to main app
 * 6. On failure/cancel: user stays on login screen with error message
 */

// Mock dependencies
jest.mock('expo-router', () => ({
    Stack: { Screen: () => null },
    useRouter: jest.fn(),
}));

jest.mock('@/lib/api');
jest.mock('@/lib/tokenManager');
jest.mock('@/lib/nav');

jest.mock('@/lib/biometricAuth', () => ({
    isBiometricAvailable: jest.fn(),
    authenticateWithBiometrics: jest.fn(),
    getBiometricPreference: jest.fn(),
    getBiometricEmail: jest.fn(),
    saveBiometricPreference: jest.fn(),
    saveBiometricEmail: jest.fn(),
    clearBiometricData: jest.fn(),
}));

jest.mock('@/lib/secureStore', () => ({
    loadRefreshToken: jest.fn(),
    saveRefreshToken: jest.fn(),
    clearStoredRefreshToken: jest.fn(),
    loadAccessToken: jest.fn(),
    saveAccessToken: jest.fn(),
    clearStoredAccessToken: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

jest.spyOn(Alert, 'alert');

jest.setTimeout(15000);

describe('Biometric Login Flow - Integration Tests', () => {
    const mockPush = jest.fn();
    const mockReplace = jest.fn();
    const mockPost = jest.fn();
    const mockGet = jest.fn();
    const mockGetValidAccessToken = jest.fn();
    const mockSetTokensFromLogin = jest.fn();
    const mockClearTokens = jest.fn();
    const mockRefreshAccessToken = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            replace: mockReplace,
        });
        (authApi.post as jest.Mock) = mockPost;
        (authApi.get as jest.Mock) = mockGet;
        (tokenManager.getValidAccessToken as jest.Mock) = mockGetValidAccessToken;
        (tokenManager.setTokensFromLogin as jest.Mock) = mockSetTokensFromLogin;
        (tokenManager.clearTokens as jest.Mock) = mockClearTokens;
        (tokenManager.refreshAccessToken as jest.Mock) = mockRefreshAccessToken;

        mockGetValidAccessToken.mockResolvedValue(null);
        mockSetTokensFromLogin.mockResolvedValue(undefined);
        mockClearTokens.mockResolvedValue(undefined);
        mockRefreshAccessToken.mockResolvedValue(null);
        mockGet.mockResolvedValue({ data: {} });

        (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(false);
        (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(false);
        (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue(null);
        (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(false);
        (biometricAuth.clearBiometricData as jest.Mock).mockResolvedValue(undefined);

        (secureStore.loadRefreshToken as jest.Mock).mockResolvedValue(null);
    });

    const renderLoginWithAuth = () => {
        return render(
            <AuthProvider>
                <LoginScreen />
            </AuthProvider>
        );
    };

    // ---------- Biometric Button Visibility ----------

    describe('Biometric Button Visibility', () => {
        it('should not show biometric button when biometrics are not available', async () => {
            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            expect(screen.queryByTestId('biometric-login-button')).toBeNull();
        });

        it('should not show biometric button when hardware exists but preference is disabled', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(false);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(biometricAuth.getBiometricPreference).toHaveBeenCalled();
            });

            expect(screen.queryByTestId('biometric-login-button')).toBeNull();
        });

        it('should show biometric button when hardware available AND preference enabled', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            // Text varies by platform
            expect(
                screen.queryByText('Sign in with Face ID') ||
                screen.queryByText('Sign in with biometrics')
            ).toBeTruthy();
        });

        it('should not show biometric button while availability check is pending', async () => {
            let resolveAvailable: (value: boolean) => void;
            (biometricAuth.isBiometricAvailable as jest.Mock).mockReturnValue(
                new Promise<boolean>((resolve) => {
                    resolveAvailable = resolve;
                })
            );
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            expect(screen.queryByTestId('biometric-login-button')).toBeNull();

            resolveAvailable!(true);

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });
        });
    });

    // ---------- Successful Biometric Login ----------

    describe('Successful Biometric Login Flow', () => {
        it('should complete full biometric sign in flow successfully', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('bio@example.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockResolvedValue('new-access-token');
            mockGet.mockResolvedValue({
                data: { user: { id: '456', email: 'bio@example.com', name: 'Bio User' } },
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(biometricAuth.authenticateWithBiometrics).toHaveBeenCalledWith(
                    'Authenticate to sign in'
                );
            });

            await waitFor(() => {
                expect(mockRefreshAccessToken).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });

        it('should fetch user data after successful biometric login', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockResolvedValue('fresh-at');
            mockGet.mockResolvedValue({
                data: { user: { id: '789', email: 'user@test.com' } },
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith('/auth/me');
            });

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });

        it('should show loading state during biometric login', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('bio@example.com');

            let resolveAuth: (value: boolean) => void;
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockReturnValue(
                new Promise<boolean>((resolve) => { resolveAuth = resolve; })
            );
            mockRefreshAccessToken.mockResolvedValue('at');

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(screen.getByText('Signing in\u2026')).toBeTruthy();
            });

            resolveAuth!(true);

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });
    });

    // ---------- Biometric Authentication Failure ----------

    describe('Biometric Authentication Failure', () => {
        beforeEach(() => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);
        });

        it('should show error when biometric authentication fails', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(false);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Biometric authentication failed'
                );
            });

            expect(mockRefreshAccessToken).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should show error when no saved biometric email exists', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue(null);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'No saved biometric credentials found'
                );
            });

            expect(biometricAuth.authenticateWithBiometrics).not.toHaveBeenCalled();
            expect(mockRefreshAccessToken).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should show error when session is expired', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockResolvedValue(null);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Session expired. Please sign in with your password.'
                );
            });

            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should show error when refresh fails with network error', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockRejectedValue(new Error('Network error'));

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Error', 'Network error');
            });

            expect(mockReplace).not.toHaveBeenCalled();
        });
    });

    // ---------- User Cancellation ----------

    describe('User Cancellation Handling', () => {
        it('should handle user cancelling the biometric prompt gracefully', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(false);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalled();
            });

            expect(mockReplace).not.toHaveBeenCalled();
            expect(screen.getByPlaceholderText('Email')).toBeTruthy();
            expect(screen.getByPlaceholderText('Password')).toBeTruthy();
            expect(screen.getByText('Sign in')).toBeTruthy();
        });

        it('should allow password login after cancelling biometric', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(false);

            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'password-token',
                    user: { id: '1', email: 'user@test.com' },
                },
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalled();
            });

            fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@test.com');
            fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/login', {
                    email: 'user@test.com',
                    password: 'password123',
                });
            });

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });
    });

    // ---------- Edge Cases ----------

    describe('Edge Cases', () => {
        it('should handle biometric availability check error gracefully', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockRejectedValue(
                new Error('Hardware check failed')
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            expect(screen.queryByTestId('biometric-login-button')).toBeNull();
            expect(screen.getByPlaceholderText('Email')).toBeTruthy();
            expect(screen.getByText('Sign in')).toBeTruthy();
        });

        it('should handle getBiometricPreference error gracefully', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockRejectedValue(
                new Error('SecureStore unavailable')
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            expect(screen.queryByTestId('biometric-login-button')).toBeNull();
            expect(screen.getByPlaceholderText('Email')).toBeTruthy();
        });

        it('should keep password form functional when biometric is available', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);

            mockPost.mockResolvedValue({
                data: { accessToken: 'pw-token', user: { id: '1', email: 'test@example.com' } },
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
            fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/login', {
                    email: 'test@example.com',
                    password: 'password123',
                });
            });

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });

            expect(biometricAuth.authenticateWithBiometrics).not.toHaveBeenCalled();
        });

        it('should still show register link when biometric button is visible', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            const registerLink = screen.getByText(/Don't have an account/);
            fireEvent.press(registerLink);
            expect(mockPush).toHaveBeenCalledWith('/(auth)/register');
        });

        it('should not allow multiple concurrent biometric sign in attempts', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');

            let resolveAuth: (value: boolean) => void;
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockReturnValue(
                new Promise<boolean>((resolve) => { resolveAuth = resolve; })
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            const bioButton = screen.getByTestId('biometric-login-button');
            fireEvent.press(bioButton);

            // Wait for authenticateWithBiometrics to be called (async after getBiometricEmail resolves)
            await waitFor(() => {
                expect(biometricAuth.authenticateWithBiometrics).toHaveBeenCalledTimes(1);
            });

            // Second press while first is pending -- button is disabled via submitting state
            fireEvent.press(bioButton);

            // Should still only have one authentication attempt
            expect(biometricAuth.authenticateWithBiometrics).toHaveBeenCalledTimes(1);

            resolveAuth!(true);
        });

        it('should allow password login after authenticateWithBiometrics throws', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('bio@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockRejectedValue(
                new Error('Biometric sensor hardware error')
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            mockPost.mockResolvedValue({ data: { accessToken: 'fallback-token' } });

            fireEvent.changeText(screen.getByPlaceholderText('Email'), 'bio@test.com');
            fireEvent.changeText(screen.getByPlaceholderText('Password'), 'fallback-password');
            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });

        it('should preserve form values after biometric module errors', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockRejectedValue(
                new Error('Module error')
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'preserved@test.com');
            fireEvent.changeText(passwordInput, 'preserved-pass');

            expect(emailInput.props.value).toBe('preserved@test.com');
            expect(passwordInput.props.value).toBe('preserved-pass');
        });

        it('should reject empty credentials even when biometric is available', async () => {
            (biometricAuth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (biometricAuth.getBiometricPreference as jest.Mock).mockResolvedValue(true);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Missing fields',
                    'Please enter email and password.'
                );
            });

            expect(mockPost).not.toHaveBeenCalled();
        });
    });

    // ---------- AuthProvider signInWithBiometrics Direct Tests ----------

    describe('AuthProvider signInWithBiometrics', () => {
        function BiometricTestHarness() {
            const { signInWithBiometrics, status } = useAuth();

            return (
                <>
                    <Text testID="auth-status">{status}</Text>
                    <TouchableOpacity
                        testID="bio-trigger"
                        onPress={async () => {
                            try {
                                await signInWithBiometrics();
                            } catch (e: any) {
                                Alert.alert('Error', e.message || 'Biometric login failed');
                            }
                        }}
                    >
                        <Text>Biometric Sign In</Text>
                    </TouchableOpacity>
                </>
            );
        }

        it('should complete biometric sign in through AuthProvider', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('bio@example.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockResolvedValue('fresh-access-token');
            mockGet.mockResolvedValue({
                data: { user: { id: '100', email: 'bio@example.com', name: 'Bio User' } },
            });

            render(
                <AuthProvider>
                    <BiometricTestHarness />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('auth-status')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('bio-trigger'));

            await waitFor(() => {
                expect(biometricAuth.getBiometricEmail).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(biometricAuth.authenticateWithBiometrics).toHaveBeenCalledWith(
                    'Authenticate to sign in'
                );
            });

            await waitFor(() => {
                expect(mockRefreshAccessToken).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith('/auth/me');
            });

            await waitFor(() => {
                expect(screen.getByTestId('auth-status').props.children).toBe('signed-in');
            });
        });

        it('should throw error when no biometric email is saved', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue(null);

            render(
                <AuthProvider>
                    <BiometricTestHarness />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('auth-status')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('bio-trigger'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'No saved biometric credentials found'
                );
            });

            expect(mockRefreshAccessToken).not.toHaveBeenCalled();
        });

        it('should throw error when biometric authentication is rejected', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(false);

            render(
                <AuthProvider>
                    <BiometricTestHarness />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('auth-status')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('bio-trigger'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Biometric authentication failed'
                );
            });

            expect(mockRefreshAccessToken).not.toHaveBeenCalled();
        });

        it('should throw error when session is expired', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockResolvedValue(null);

            render(
                <AuthProvider>
                    <BiometricTestHarness />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('auth-status')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('bio-trigger'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Session expired. Please sign in with your password.'
                );
            });
        });

        it('should set status to signed-out on biometric failure', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(false);

            render(
                <AuthProvider>
                    <BiometricTestHarness />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('auth-status')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('bio-trigger'));

            await waitFor(() => {
                expect(screen.getByTestId('auth-status').props.children).toBe('signed-out');
            });
        });

        it('should set status to signed-in on biometric success', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockResolvedValue('new-at');

            render(
                <AuthProvider>
                    <BiometricTestHarness />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('auth-status')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('bio-trigger'));

            await waitFor(() => {
                expect(screen.getByTestId('auth-status').props.children).toBe('signed-in');
            });
        });

        it('should handle network failure during refresh', async () => {
            (biometricAuth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (biometricAuth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockRejectedValue(new Error('Network request failed'));

            render(
                <AuthProvider>
                    <BiometricTestHarness />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('auth-status')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('bio-trigger'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Network request failed'
                );
            });
        });
    });

    // ---------- Password Login Tests ----------

    describe('Password Login', () => {
        it('should handle network timeout gracefully', async () => {
            mockPost.mockRejectedValue(new Error('Network timeout'));

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@test.com');
            fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Login failed. Please try again.'
                );
            });

            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should handle server error during login', async () => {
            mockPost.mockRejectedValue({
                response: { status: 503, data: { message: 'Service temporarily unavailable' } },
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@test.com');
            fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Service temporarily unavailable'
                );
            });
        });

        it('should show and clear loading state', async () => {
            let resolvePost: (value: any) => void;
            mockPost.mockReturnValue(
                new Promise((resolve) => { resolvePost = resolve; })
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@test.com');
            fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(screen.getByText('Signing in\u2026')).toBeTruthy();
            });

            resolvePost!({ data: { accessToken: 'token' } });

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });

        it('should restore button text on failed login', async () => {
            let rejectPost: (reason: any) => void;
            mockPost.mockReturnValue(
                new Promise((_, reject) => { rejectPost = reject; })
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@test.com');
            fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(screen.getByText('Signing in\u2026')).toBeTruthy();
            });

            rejectPost!(new Error('Server error'));

            await waitFor(() => {
                expect(screen.getByText('Sign in')).toBeTruthy();
            });
        });

        it('should handle rapid button presses without duplicate API calls', async () => {
            let callCount = 0;
            mockPost.mockImplementation(() => {
                callCount++;
                return new Promise((resolve) =>
                    setTimeout(() => resolve({ data: { accessToken: 'token' } }), 100)
                );
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@test.com');
            fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);
            fireEvent.press(signInButton);
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });

            expect(callCount).toBe(1);
        });

        it('should allow retry after failed login', async () => {
            mockPost.mockRejectedValueOnce(new Error('Network error'));

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            fireEvent.changeText(screen.getByPlaceholderText('Email'), 'retry@test.com');
            fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Login failed. Please try again.'
                );
            });

            mockPost.mockResolvedValueOnce({ data: { accessToken: 'retry-token' } });
            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });

        it('should handle special characters in credentials', async () => {
            mockPost.mockResolvedValue({ data: { accessToken: 'special-token' } });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test+special@sub.example.com');
            fireEvent.changeText(screen.getByPlaceholderText('Password'), 'P@ssw0rd!@#$%^&*');
            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/login', {
                    email: 'test+special@sub.example.com',
                    password: 'P@ssw0rd!@#$%^&*',
                });
            });
        });
    });
});

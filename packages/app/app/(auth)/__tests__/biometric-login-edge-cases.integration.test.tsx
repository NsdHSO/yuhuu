import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import LoginScreen from '../login';
import {AuthProvider} from '@/providers/AuthProvider';
import {useRouter} from 'expo-router';
import * as auth from '@yuhuu/auth';
import * as secureStore from '@/lib/secureStore';
import {authApi} from '@yuhuu/auth';
import {initI18n} from '@yuhuu/i18n';

/**
 * Edge Case Integration Tests for Biometric Login Flow
 *
 * Covers scenarios not addressed by the primary integration test suite:
 * - Biometric button rendering with correct testID selectors
 * - Button disabled state during submission
 * - Race conditions between biometric and password login
 * - Biometric availability check timing edge cases
 * - AuthProvider state transitions during biometric flow
 * - Concurrent submission prevention
 */

// Mock dependencies
jest.mock('expo-router', () => ({
    Stack: {
        Screen: () => null,
    },
    useRouter: jest.fn(),
}));

jest.mock('@/lib/api');
jest.mock('@/lib/nav');

jest.mock('@yuhuu/auth', () => ({
    isBiometricAvailable: jest.fn(),
    authenticateWithBiometrics: jest.fn(),
    getBiometricPreference: jest.fn(),
    getBiometricEmail: jest.fn(),
    saveBiometricPreference: jest.fn(),
    saveBiometricEmail: jest.fn(),
    clearBiometricData: jest.fn(),
    authApi: {
        post: jest.fn(),
        get: jest.fn(),
    },
    getValidAccessToken: jest.fn(),
    setTokensFromLogin: jest.fn(),
    clearTokens: jest.fn(),
    refreshAccessToken: jest.fn(),
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

jest.mock('expo-localization');
jest.mock('expo-secure-store');

jest.spyOn(Alert, 'alert');

jest.setTimeout(15000);

beforeAll(async () => {
    const Localization = require('expo-localization');
    const SecureStore = require('expo-secure-store');
    Localization.getLocales.mockReturnValue([{languageCode: 'en'}]);
    SecureStore.getItemAsync.mockResolvedValue(null);
    await initI18n();
});

describe('Biometric Login - Edge Cases Integration Tests', () => {
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
        (auth.getValidAccessToken as jest.Mock) = mockGetValidAccessToken;
        (auth.setTokensFromLogin as jest.Mock) = mockSetTokensFromLogin;
        (auth.clearTokens as jest.Mock) = mockClearTokens;
        (auth.refreshAccessToken as jest.Mock) = mockRefreshAccessToken;

        // Default: no existing token
        mockGetValidAccessToken.mockResolvedValue(null);

        // Default: refreshAccessToken returns null (no session)
        mockRefreshAccessToken.mockResolvedValue(null);

        // Default: /auth/me returns user data
        mockGet.mockResolvedValue({
            data: {
                user: {
                    id: '1',
                    email: 'test@test.com'
                }
            }
        });

        // Default: biometrics not available
        (auth.isBiometricAvailable as jest.Mock).mockResolvedValue(false);
        (auth.getBiometricPreference as jest.Mock).mockResolvedValue(false);
        (auth.getBiometricEmail as jest.Mock).mockResolvedValue(null);
        (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(false);
        (auth.clearBiometricData as jest.Mock).mockResolvedValue(undefined);

        // Default: no refresh token
        (secureStore.loadRefreshToken as jest.Mock).mockResolvedValue(null);
    });

    const renderLoginWithAuth = () => {
        return render(
            <AuthProvider>
                <LoginScreen/>
            </AuthProvider>
        );
    };

    function enableBiometricMocks() {
        (auth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
        (auth.getBiometricPreference as jest.Mock).mockResolvedValue(true);
    }

    describe('Biometric Button Rendering via testID', () => {
        it('should render biometric-login-button when biometrics are available and enabled', async () => {
            enableBiometricMocks();

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });
        });

        it('should render biometric-divider when biometrics are available', async () => {
            enableBiometricMocks();

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-divider')).toBeTruthy();
            });
        });

        it('should NOT render biometric-login-button when biometrics are available but preference is disabled', async () => {
            (auth.isBiometricAvailable as jest.Mock).mockResolvedValue(true);
            (auth.getBiometricPreference as jest.Mock).mockResolvedValue(false);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            // Give the async useEffect time to resolve
            await waitFor(() => {
                expect(screen.queryByTestId('biometric-login-button')).toBeNull();
            });
        });

        it('should NOT render biometric-login-button when hardware is unavailable', async () => {
            (auth.isBiometricAvailable as jest.Mock).mockResolvedValue(false);
            (auth.getBiometricPreference as jest.Mock).mockResolvedValue(true);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            await waitFor(() => {
                expect(screen.queryByTestId('biometric-login-button')).toBeNull();
            });
        });
    });

    describe('Biometric Button Disabled State', () => {
        it('should disable biometric button during password submission', async () => {
            enableBiometricMocks();

            let resolvePost: (value: any) => void;
            mockPost.mockReturnValue(
                new Promise((resolve) => {
                    resolvePost = resolve;
                })
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            // Start a password login
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');

            fireEvent.press(screen.getByText('Sign in'));

            // During submission, biometric button should be disabled
            await waitFor(() => {
                const bioButton = screen.getByTestId('biometric-login-button');
                expect(bioButton.props.disabled || bioButton.props.accessibilityState?.disabled).toBeTruthy();
            });

            // Complete the login
            resolvePost!({
                data: {accessToken: 'token'},
            });

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });

        it('should disable sign in button during biometric submission', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');

            let resolveAuth: (value: boolean) => void;
            (auth.authenticateWithBiometrics as jest.Mock).mockReturnValue(
                new Promise<boolean>((resolve) => {
                    resolveAuth = resolve;
                })
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            // Start biometric login
            fireEvent.press(screen.getByTestId('biometric-login-button'));

            // During biometric auth, the sign in button should show loading state
            await waitFor(() => {
                expect(screen.getByText('Signing in…')).toBeTruthy();
            });

            // Resolve biometric auth (will fail since biometrics rejected)
            resolveAuth!(false);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalled();
            });
        });
    });

    describe('Successful Biometric Login via testID', () => {
        it('should complete biometric login when pressing testID button', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('bio@example.com');
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockResolvedValue('bio-access-token');
            mockGet.mockResolvedValue({
                data: {
                    user: {
                        id: '10',
                        email: 'bio@example.com',
                        name: 'Bio User',
                    },
                },
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            // Verify the complete chain
            await waitFor(() => {
                expect(auth.authenticateWithBiometrics).toHaveBeenCalledWith(
                    'Authenticate to sign in'
                );
            });

            await waitFor(() => {
                expect(mockRefreshAccessToken).toHaveBeenCalled();
            });

            expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
        });
    });

    describe('Biometric Failure via testID', () => {
        it('should show error when biometric auth returns false', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(false);
            (secureStore.loadRefreshToken as jest.Mock).mockResolvedValue('valid-rt');

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

            expect(mockPost).not.toHaveBeenCalledWith('/auth/refresh', expect.anything());
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should show error when no saved email for biometric login', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue(null);

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

            expect(auth.authenticateWithBiometrics).not.toHaveBeenCalled();
            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should show error when refresh token is expired after biometric success', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            // refreshAccessToken returns null when session is expired
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

        it('should show session expired error when refresh fails', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            // refreshAccessToken returns null on any failure
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

        it('should show session expired error when refreshAccessToken returns null', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
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
    });

    describe('Fallback to Password After Biometric Failure', () => {
        it('should allow password login after biometric button failure', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(false);
            (secureStore.loadRefreshToken as jest.Mock).mockResolvedValue('valid-rt');

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            // Biometric fails
            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalled();
            });

            // Now do password login
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'password-token',
                    user: {
                        id: '1',
                        email: 'user@test.com'
                    },
                },
            });

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'user@test.com');
            fireEvent.changeText(passwordInput, 'password123');

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

        it('should keep form inputs usable after biometric error', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(false);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalled();
            });

            // Verify form elements are still functional
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const signInButton = screen.getByText('Sign in');

            expect(emailInput).toBeTruthy();
            expect(passwordInput).toBeTruthy();
            expect(signInButton).toBeTruthy();

            // Verify we can type in inputs
            fireEvent.changeText(emailInput, 'newuser@test.com');
            expect(emailInput.props.value).toBe('newuser@test.com');
        });
    });

    describe('Concurrent Submission Prevention', () => {
        it('should prevent double-tap on biometric button', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');

            let resolveAuth: (value: boolean) => void;
            (auth.authenticateWithBiometrics as jest.Mock).mockReturnValue(
                new Promise<boolean>((resolve) => {
                    resolveAuth = resolve;
                })
            );

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            // First press
            fireEvent.press(screen.getByTestId('biometric-login-button'));

            // Button should be disabled after first press (submitting = true)
            await waitFor(() => {
                const bioButton = screen.getByTestId('biometric-login-button');
                expect(bioButton.props.disabled || bioButton.props.accessibilityState?.disabled).toBeTruthy();
            });

            // Second press should be blocked by disabled state
            fireEvent.press(screen.getByTestId('biometric-login-button'));

            // Only one signInWithBiometrics call should have been made
            // (authenticateWithBiometrics is called inside signInWithBiometrics)
            expect(auth.getBiometricEmail).toHaveBeenCalledTimes(1);

            resolveAuth!(false);
        });
    });

    describe('Biometric Availability Check Timing', () => {
        it('should handle slow biometric availability check', async () => {
            let resolveAvailability: (value: boolean) => void;
            let resolvePreference: (value: boolean) => void;

            (auth.isBiometricAvailable as jest.Mock).mockReturnValue(
                new Promise<boolean>((resolve) => {
                    resolveAvailability = resolve;
                })
            );
            (auth.getBiometricPreference as jest.Mock).mockReturnValue(
                new Promise<boolean>((resolve) => {
                    resolvePreference = resolve;
                })
            );

            renderLoginWithAuth();

            // Initially, biometric button should not be rendered
            expect(screen.queryByTestId('biometric-login-button')).toBeNull();

            // Login form should still be usable while biometric check is pending
            expect(screen.getByPlaceholderText('Email')).toBeTruthy();
            expect(screen.getByPlaceholderText('Password')).toBeTruthy();

            // Resolve the availability check
            await act(async () => {
                resolveAvailability!(true);
                resolvePreference!(true);
            });

            // Now biometric button should appear
            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });
        });

        it('should not show biometric button when availability check resolves false', async () => {
            // isBiometricAvailable returns false (e.g. no hardware)
            (auth.isBiometricAvailable as jest.Mock).mockResolvedValue(false);
            (auth.getBiometricPreference as jest.Mock).mockResolvedValue(true);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByText('Welcome back')).toBeTruthy();
            });

            // Biometric button should not appear since hardware is unavailable
            await waitFor(() => {
                expect(screen.queryByTestId('biometric-login-button')).toBeNull();
            });

            // Password login should still work
            expect(screen.getByPlaceholderText('Email')).toBeTruthy();
            expect(screen.getByPlaceholderText('Password')).toBeTruthy();
        });
    });

    describe('AuthProvider State Recovery', () => {
        it('should recover from biometric failure and allow retry', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');

            // First attempt: auth fails
            (auth.authenticateWithBiometrics as jest.Mock)
                .mockResolvedValueOnce(false);

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            // First attempt fails
            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Biometric authentication failed'
                );
            });

            // Second attempt: auth succeeds with refreshAccessToken returning a token
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValueOnce(true);
            mockRefreshAccessToken.mockResolvedValue('new-token');
            mockGet.mockResolvedValue({
                data: {
                    user: {
                        id: '1',
                        email: 'user@test.com'
                    }
                },
            });

            // Wait for submitting state to reset
            await waitFor(() => {
                const bioButton = screen.getByTestId('biometric-login-button');
                expect(bioButton.props.disabled).toBeFalsy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });
    });

    describe('Biometric Login Token Refresh', () => {
        it('should use refreshAccessToken from auth for biometric login', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockResolvedValue('refreshed-token');
            mockGet.mockResolvedValue({
                data: {
                    user: {
                        id: '1',
                        email: 'user@test.com'
                    }
                },
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(mockRefreshAccessToken).toHaveBeenCalled();
            });

            expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
        });

        it('should fetch user data after successful token refresh', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockResolvedValue('valid-token');
            mockGet.mockResolvedValue({
                data: {
                    user: {
                        id: '5',
                        email: 'user@test.com',
                        name: 'Test User',
                    },
                },
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith('/auth/me');
            });

            expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
        });

        it('should still succeed even if /auth/me fails after token refresh', async () => {
            enableBiometricMocks();
            (auth.getBiometricEmail as jest.Mock).mockResolvedValue('user@test.com');
            (auth.authenticateWithBiometrics as jest.Mock).mockResolvedValue(true);
            mockRefreshAccessToken.mockResolvedValue('valid-token');
            mockGet.mockRejectedValue(new Error('Network error'));

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('biometric-login-button'));

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });
    });

    describe('Standard Login Coexistence', () => {
        it('should allow standard login even when biometric button is visible', async () => {
            enableBiometricMocks();

            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'pw-access',
                    refreshToken: 'pw-refresh',
                    user: {
                        id: '99',
                        email: 'password@test.com'
                    },
                },
            });

            renderLoginWithAuth();

            await waitFor(() => {
                expect(screen.getByTestId('biometric-login-button')).toBeTruthy();
            });

            // Ignore biometric button, use password form
            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'password@test.com');
            fireEvent.changeText(passwordInput, 'mypassword');

            fireEvent.press(screen.getByText('Sign in'));

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/login', {
                    email: 'password@test.com',
                    password: 'mypassword',
                });
            });

            expect(mockReplace).toHaveBeenCalledWith('/(tabs)');

            // Biometric auth should NOT have been called
            expect(auth.authenticateWithBiometrics).not.toHaveBeenCalled();
        });
    });
});

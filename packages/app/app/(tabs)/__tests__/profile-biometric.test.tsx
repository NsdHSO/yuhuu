import React from 'react';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {Alert, Platform} from 'react-native';
// Import after mocks
import ProfileScreen from '../profile';

// Mock react-i18next to return English strings for existing tests
const profileTranslations: Record<string, string> = {
    'profile.title': 'Profile',
    'profile.createProfile': 'Create your profile',
    'profile.noProfile': "We didn't find a profile. Fill in the fields below and save to create one.",
    'profile.firstNamePlaceholder': 'First name',
    'profile.lastNamePlaceholder': 'Last name',
    'profile.phonePlaceholder': 'Phone',
    'profile.security': 'Security',
    'profile.language': 'Language',
    'profile.biometricLabel': 'Face ID / Touch ID',
    'profile.biometricLabelAndroid': 'Biometric Login',
    'profile.biometricDescription': 'Use Face ID or Touch ID to sign in quickly',
    'profile.biometricDescriptionAndroid': 'Use biometrics to sign in quickly',
    'profile.biometricAccessibilityLabel': 'Enable Face ID or Touch ID sign-in',
    'profile.biometricAccessibilityLabelAndroid': 'Enable biometric sign-in',
    'profile.biometricAccessibilityHint': 'Toggle to enable or disable biometric authentication for signing in',
    'profile.biometricEnableTitle': 'Verify your identity to enable biometric sign-in',
    'profile.biometricAuthFailed': 'Could not verify your identity. Please try again.',
    'profile.biometricEnableSuccess': 'Biometric sign-in enabled.',
    'profile.biometricEnableError': 'Failed to enable biometric sign-in. Please try again.',
    'profile.biometricDisableTitle': 'Disable biometric sign-in?',
    'profile.biometricDisableMessage': 'You will need to enter your email and password to sign in.',
    'profile.biometricDisableError': 'Failed to disable biometric sign-in.',
    'profile.saving': 'Saving\u2026',
    'profile.save': 'Save',
    'profile.saveSuccess': 'Profile saved.',
    'profile.saveError': 'Failed to save profile.',
    'profile.loadError': 'Failed to load profile.',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.cancel': 'Cancel',
    'common.disable': 'Disable',
};

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => profileTranslations[key] ?? key,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.mock('@/components/molecules/language-picker', () => {
    const R = require('react');
    return {__esModule: true, default: () => R.createElement('View', {testID: 'language-picker'})};
});

/**
 * Integration tests for Profile Biometric Settings
 * Tests the biometric toggle on the Profile screen:
 * - Toggle visibility when biometric hardware available
 * - Enable biometric authentication flow (with biometric verification)
 * - Disable biometric authentication flow (with confirmation dialog)
 * - Preference persistence
 * - Error handling
 */

// Spy on Alert
jest.spyOn(Alert, 'alert');

// Mock biometricAuth module
const mockIsBiometricAvailable = jest.fn();
const mockAuthenticateWithBiometrics = jest.fn();
const mockSaveBiometricPreference = jest.fn();
const mockGetBiometricPreference = jest.fn();
const mockSaveBiometricEmail = jest.fn();
const mockGetBiometricEmail = jest.fn();
const mockClearBiometricData = jest.fn();

jest.mock('@yuhuu/auth', () => ({
    isBiometricAvailable: (...args: any[]) => mockIsBiometricAvailable(...args),
    authenticateWithBiometrics: (...args: any[]) => mockAuthenticateWithBiometrics(...args),
    saveBiometricPreference: (...args: any[]) => mockSaveBiometricPreference(...args),
    getBiometricPreference: (...args: any[]) => mockGetBiometricPreference(...args),
    saveBiometricEmail: (...args: any[]) => mockSaveBiometricEmail(...args),
    getBiometricEmail: (...args: any[]) => mockGetBiometricEmail(...args),
    clearBiometricData: (...args: any[]) => mockClearBiometricData(...args),
}));

// Mock profile hooks
const mockUseMyProfileQuery = jest.fn();
const mockUseSaveMyProfileMutation = jest.fn();

jest.mock('@/features/profile/api', () => ({
    useMyProfileQuery: (opts: any) => mockUseMyProfileQuery(opts),
    useSaveMyProfileMutation: () => mockUseSaveMyProfileMutation(),
}));

// Mock bootstrap gate
jest.mock('@/features/bootstrap/api', () => ({
    useBootstrapGate: () => {
    },
}));

// Mock useAuth - Profile screen calls useAuth() to access user.email
const mockUseAuth = jest.fn();
jest.mock('@/providers/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}));

// Increase timeout for cold-start on CI where first render takes longer
jest.setTimeout(15000);

describe('ProfileScreen - Biometric Settings', () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();

        // Default: profile loaded, save mutation idle
        mockUseMyProfileQuery.mockReturnValue({
            data: {
                id: 1,
                user_id: 1,
                middle_name: 'John',
                last_name: 'Doe',
                phone: '555-1234',
                created_at: '2026-01-01',
                updated_at: '2026-01-01',
            },
            isLoading: false,
            error: null,
        });
        mockUseSaveMyProfileMutation.mockReturnValue({
            mutate: jest.fn(),
            isPending: false,
        });

        // Default auth context with user email
        mockUseAuth.mockReturnValue({
            user: {
                id: '1',
                email: 'john@example.com',
                name: 'John'
            },
            status: 'signed-in',
            signIn: jest.fn(),
            signInWithBiometrics: jest.fn(),
            signOut: jest.fn(),
        });

        // Default biometric state
        mockIsBiometricAvailable.mockResolvedValue(true);
        mockGetBiometricPreference.mockResolvedValue(false);
        mockSaveBiometricPreference.mockResolvedValue(undefined);
        mockAuthenticateWithBiometrics.mockResolvedValue(true);
        mockSaveBiometricEmail.mockResolvedValue(undefined);
        mockGetBiometricEmail.mockResolvedValue(null);
        mockClearBiometricData.mockResolvedValue(undefined);
    });

    afterEach(() => {
        Platform.OS = originalPlatform as any;
    });

    describe('Toggle Visibility', () => {
        it('should show biometric toggle when hardware is available', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);

            const {getByTestId} = render(<ProfileScreen/>);

            await waitFor(() => {
                expect(getByTestId('biometric-toggle')).toBeTruthy();
            }, {timeout: 10000});
        });

        it('should NOT show biometric toggle when hardware is unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const {queryByTestId} = render(<ProfileScreen/>);

            await waitFor(() => {
                expect(queryByTestId('biometric-toggle')).toBeNull();
            });
        });

        it('should display platform-specific label on iOS', async () => {
            Platform.OS = 'ios' as any;
            mockIsBiometricAvailable.mockResolvedValue(true);

            const {findByText} = render(<ProfileScreen/>);

            const label = await findByText('Face ID / Touch ID');
            expect(label).toBeTruthy();
        });

        // Skipped: jest-expo freezes Platform.OS at test-suite load time;
        // Object.defineProperty, direct assignment, and jest.replaceProperty
        // all fail to change it within a running test.
        it.skip('should display platform-specific label on Android', async () => {
            Platform.OS = 'android' as any;
            mockIsBiometricAvailable.mockResolvedValue(true);

            const {findByText} = render(<ProfileScreen/>);

            const label = await findByText('Biometric Login');
            expect(label).toBeTruthy();
        });

        it('should hide biometric section when availability check fails', async () => {
            mockIsBiometricAvailable.mockRejectedValue(new Error('Hardware check failed'));

            const {queryByTestId} = render(<ProfileScreen/>);

            await waitFor(() => {
                expect(queryByTestId('biometric-toggle')).toBeNull();
            });
        });
    });

    describe('Enable Biometric Authentication', () => {
        it('should require biometric verification before enabling', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(true);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(mockAuthenticateWithBiometrics).toHaveBeenCalledWith(
                    expect.stringContaining('Verify')
                );
            });
        });

        it('should save preference and email after successful biometric verification', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(true);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(mockSaveBiometricPreference).toHaveBeenCalledWith(true);
                expect(mockSaveBiometricEmail).toHaveBeenCalledWith('john@example.com');
            });
        });

        it('should NOT save preference when biometric verification fails', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(false);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(mockAuthenticateWithBiometrics).toHaveBeenCalled();
            });

            expect(mockSaveBiometricPreference).not.toHaveBeenCalled();
            expect(mockSaveBiometricEmail).not.toHaveBeenCalled();
        });

        it('should keep toggle off when biometric verification fails', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(false);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(toggle.props.value).toBe(false);
            });
        });

        it('should show success alert after enabling biometric', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(true);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Success',
                    expect.stringContaining('enabled')
                );
            });
        });

        it('should reflect enabled state in toggle when preference is already true', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await waitFor(() => {
                expect(toggle.props.value).toBe(true);
            });
        });
    });

    describe('Disable Biometric Authentication', () => {
        it('should show confirmation dialog when toggle is turned off', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await waitFor(() => {
                expect(toggle.props.value).toBe(true);
            });

            await act(async () => {
                fireEvent(toggle, 'valueChange', false);
            });

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    expect.stringContaining('Disable'),
                    expect.any(String),
                    expect.arrayContaining([
                        expect.objectContaining({text: 'Cancel'}),
                        expect.objectContaining({text: 'Disable'}),
                    ])
                );
            });
        });

        it('should clear biometric data when user confirms disable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await waitFor(() => {
                expect(toggle.props.value).toBe(true);
            });

            await act(async () => {
                fireEvent(toggle, 'valueChange', false);
            });

            // Get the Alert.alert call and simulate pressing "Disable"
            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalled();
            });

            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const buttons = alertCall[2];
            const disableButton = buttons.find((b: any) => b.text === 'Disable');

            await act(async () => {
                await disableButton.onPress();
            });

            expect(mockSaveBiometricPreference).toHaveBeenCalledWith(false);
            expect(mockClearBiometricData).toHaveBeenCalled();
        });

        it('should NOT clear data when user cancels disable dialog', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await waitFor(() => {
                expect(toggle.props.value).toBe(true);
            });

            await act(async () => {
                fireEvent(toggle, 'valueChange', false);
            });

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalled();
            });

            // User presses Cancel - no onPress callback for cancel style
            expect(mockClearBiometricData).not.toHaveBeenCalled();
        });

        it('should reflect disabled state in toggle when preference is false', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await waitFor(() => {
                expect(toggle.props.value).toBe(false);
            });
        });
    });

    describe('Preference Persistence', () => {
        it('should load saved biometric preference on mount', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);

            render(<ProfileScreen/>);

            await waitFor(() => {
                expect(mockIsBiometricAvailable).toHaveBeenCalled();
                expect(mockGetBiometricPreference).toHaveBeenCalled();
            });
        });

        it('should not load preference when hardware is unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            render(<ProfileScreen/>);

            await waitFor(() => {
                expect(mockIsBiometricAvailable).toHaveBeenCalled();
            });
            expect(mockGetBiometricPreference).not.toHaveBeenCalled();
        });

        it('should persist preference when enabling biometric', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(true);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(mockSaveBiometricPreference).toHaveBeenCalledWith(true);
            });
        });

        it('should default to disabled when no saved preference exists', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await waitFor(() => {
                expect(toggle.props.value).toBe(false);
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle biometric availability check error on mount', async () => {
            mockIsBiometricAvailable.mockRejectedValue(new Error('Check failed'));

            const {queryByTestId} = render(<ProfileScreen/>);

            await waitFor(() => {
                expect(queryByTestId('biometric-toggle')).toBeNull();
            });
        });

        it('should handle saveBiometricPreference errors without crashing', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(true);
            mockSaveBiometricPreference.mockRejectedValue(new Error('Storage error'));

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            // Should not crash when toggling
            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            expect(mockSaveBiometricPreference).toHaveBeenCalledWith(true);
        });
    });

    describe('User Context Integration', () => {
        it('should save user email when enabling biometric with authenticated user', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(true);
            mockUseAuth.mockReturnValue({
                user: {
                    id: '1',
                    email: 'jane@example.com'
                },
                status: 'signed-in',
                signIn: jest.fn(),
                signInWithBiometrics: jest.fn(),
                signOut: jest.fn(),
            });

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(mockSaveBiometricEmail).toHaveBeenCalledWith('jane@example.com');
            });
        });

        it('should not save email when user has no email', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(true);
            mockUseAuth.mockReturnValue({
                user: {id: '1'},
                status: 'signed-in',
                signIn: jest.fn(),
                signInWithBiometrics: jest.fn(),
                signOut: jest.fn(),
            });

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(mockSaveBiometricPreference).toHaveBeenCalledWith(true);
                expect(mockSaveBiometricEmail).not.toHaveBeenCalled();
            });
        });

        it('should not save email when user is null', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(true);
            mockUseAuth.mockReturnValue({
                user: null,
                status: 'signed-out',
                signIn: jest.fn(),
                signInWithBiometrics: jest.fn(),
                signOut: jest.fn(),
            });

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(mockSaveBiometricPreference).toHaveBeenCalledWith(true);
                expect(mockSaveBiometricEmail).not.toHaveBeenCalled();
            });
        });
    });

    describe('Integration Flow', () => {
        it('should complete full enable flow: verify identity -> save preference -> save email', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);
            mockAuthenticateWithBiometrics.mockResolvedValue(true);

            const {findByTestId} = render(<ProfileScreen/>);

            // Step 1: Availability is checked on mount
            await waitFor(() => {
                expect(mockIsBiometricAvailable).toHaveBeenCalled();
            });

            // Step 2: Preference is loaded on mount
            expect(mockGetBiometricPreference).toHaveBeenCalled();

            // Step 3: User toggles on
            const toggle = await findByTestId('biometric-toggle');

            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            // Step 4: Biometric verification is required
            await waitFor(() => {
                expect(mockAuthenticateWithBiometrics).toHaveBeenCalled();
            });

            // Step 5: Preference is saved
            await waitFor(() => {
                expect(mockSaveBiometricPreference).toHaveBeenCalledWith(true);
            });

            // Step 6: Email is saved
            await waitFor(() => {
                expect(mockSaveBiometricEmail).toHaveBeenCalledWith('john@example.com');
            });

            // Step 7: Success alert shown
            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Success', expect.any(String));
            });
        });

        it('should complete full disable flow: confirm dialog -> clear data', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);

            const {findByTestId} = render(<ProfileScreen/>);
            const toggle = await findByTestId('biometric-toggle');

            await waitFor(() => {
                expect(toggle.props.value).toBe(true);
            });

            await act(async () => {
                fireEvent(toggle, 'valueChange', false);
            });

            // Confirmation dialog shown
            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalled();
            });

            // User confirms
            const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
            const buttons = alertCall[2];
            const disableButton = buttons.find((b: any) => b.text === 'Disable');

            await act(async () => {
                await disableButton.onPress();
            });

            expect(mockClearBiometricData).toHaveBeenCalled();
        });

        it('should not interfere with profile save functionality', async () => {
            const mockMutate = jest.fn();
            mockUseSaveMyProfileMutation.mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            });
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(false);

            const {
                findByTestId,
                getByText
            } = render(<ProfileScreen/>);

            await findByTestId('biometric-toggle');

            const saveButton = getByText('Save');
            fireEvent.press(saveButton);

            expect(mockMutate).toHaveBeenCalled();
        });

        it('should handle loading state for profile without affecting biometric', async () => {
            mockUseMyProfileQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            });

            const {queryByTestId} = render(<ProfileScreen/>);

            expect(queryByTestId('biometric-toggle')).toBeNull();
        });

        it('should handle profile error state without affecting biometric', async () => {
            mockUseMyProfileQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: {response: {status: 500}},
            });

            const {
                getByText,
                queryByTestId
            } = render(<ProfileScreen/>);

            expect(getByText('Failed to load profile.')).toBeTruthy();
            expect(queryByTestId('biometric-toggle')).toBeNull();
        });
    });
});

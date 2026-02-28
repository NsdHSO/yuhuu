/**
 * CRITICAL TEST: Profile Screen Security Section Visibility
 *
 * This test verifies that the Security section is shown/hidden correctly
 * based on biometric availability on Samsung A52s 5G and all devices.
 *
 * REQUIREMENT: If biometrics are NOT available, the Security section must NOT appear.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';

jest.spyOn(Alert, 'alert');

const mockIsBiometricAvailable = jest.fn();
const mockGetBiometricPreference = jest.fn();
const mockSaveBiometricPreference = jest.fn();
const mockSaveBiometricEmail = jest.fn();
const mockClearBiometricData = jest.fn();
const mockAuthenticateWithBiometrics = jest.fn();

jest.mock('@/lib/biometricAuth', () => ({
    isBiometricAvailable: (...args: any[]) => mockIsBiometricAvailable(...args),
    getBiometricPreference: (...args: any[]) => mockGetBiometricPreference(...args),
    saveBiometricPreference: (...args: any[]) => mockSaveBiometricPreference(...args),
    saveBiometricEmail: (...args: any[]) => mockSaveBiometricEmail(...args),
    clearBiometricData: (...args: any[]) => mockClearBiometricData(...args),
    authenticateWithBiometrics: (...args: any[]) => mockAuthenticateWithBiometrics(...args),
}));

const mockUseMyProfileQuery = jest.fn();
const mockUseSaveMyProfileMutation = jest.fn();

jest.mock('@/features/profile/api', () => ({
    useMyProfileQuery: (opts: any) => mockUseMyProfileQuery(opts),
    useSaveMyProfileMutation: () => mockUseSaveMyProfileMutation(),
}));

jest.mock('@/features/bootstrap/api', () => ({
    useBootstrapGate: () => {},
}));

const mockUseAuth = jest.fn();
jest.mock('@/providers/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}));

// eslint-disable-next-line import/first
import ProfileScreen from '../profile';

describe('ProfileScreen - Security Section Visibility (CRITICAL)', () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();
        (Platform as any).OS = 'android';

        mockUseAuth.mockReturnValue({
            user: { id: '1', email: 'test@example.com' },
            status: 'signed-in',
            signIn: jest.fn(),
            signInWithBiometrics: jest.fn(),
            signOut: jest.fn(),
        });
        mockUseSaveMyProfileMutation.mockReturnValue({
            mutate: jest.fn(),
            isPending: false,
        });
        mockUseMyProfileQuery.mockReturnValue({
            data: {
                middle_name: 'Test',
                last_name: 'User',
                phone: '1234567890',
            },
            isLoading: false,
            error: null,
        });
        mockGetBiometricPreference.mockResolvedValue(false);
        mockSaveBiometricPreference.mockResolvedValue(undefined);
        mockAuthenticateWithBiometrics.mockResolvedValue(true);
        mockSaveBiometricEmail.mockResolvedValue(undefined);
        mockClearBiometricData.mockResolvedValue(undefined);
    });

    afterEach(() => {
        Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    });

    // ================================================================
    // CRITICAL: Security section visibility control
    // ================================================================

    describe('CRITICAL: Security section must hide when biometrics unavailable', () => {
        it('should NOT show Security section when isBiometricAvailable returns false', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const { queryByTestId } = render(<ProfileScreen />);

            await waitFor(() => {
                expect(queryByTestId('biometric-section')).toBeNull();
            });
        });

        it('should NOT show biometric toggle when unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const { queryByTestId } = render(<ProfileScreen />);

            await waitFor(() => {
                expect(queryByTestId('biometric-toggle')).toBeNull();
            });
        });

        it('should NOT show biometric label when unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const { queryByTestId } = render(<ProfileScreen />);

            await waitFor(() => {
                expect(queryByTestId('biometric-label')).toBeNull();
            });
        });

        it('should NOT show biometric description when unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const { queryByTestId } = render(<ProfileScreen />);

            await waitFor(() => {
                expect(queryByTestId('biometric-description')).toBeNull();
            });
        });
    });

    // ================================================================
    // CRITICAL: Security section must show when biometrics available
    // ================================================================

    describe('CRITICAL: Security section must show when biometrics available', () => {
        it('should SHOW Security section when isBiometricAvailable returns true', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);

            const { findByTestId } = render(<ProfileScreen />);

            const section = await findByTestId('biometric-section');
            expect(section).toBeTruthy();
        });

        it('should SHOW biometric toggle when available', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);

            const { findByTestId } = render(<ProfileScreen />);

            const toggle = await findByTestId('biometric-toggle');
            expect(toggle).toBeTruthy();
        });

        it('should SHOW biometric label when available', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);

            const { findByTestId } = render(<ProfileScreen />);

            const label = await findByTestId('biometric-label');
            expect(label).toBeTruthy();
        });

        it('should SHOW biometric description when available', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);

            const { findByTestId } = render(<ProfileScreen />);

            const desc = await findByTestId('biometric-description');
            expect(desc).toBeTruthy();
        });
    });

    // ================================================================
    // Samsung A52s 5G: Biometric unavailable scenarios
    // ================================================================

    describe('Samsung A52s 5G: Security section hidden when biometrics unavailable', () => {
        it('should hide Security section when biometric hardware absent', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const { queryByTestId } = render(<ProfileScreen />);

            await waitFor(() => {
                expect(queryByTestId('biometric-section')).toBeNull();
            });
        });

        it('should hide Security section when nothing enrolled', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const { queryByTestId } = render(<ProfileScreen />);

            await waitFor(() => {
                expect(queryByTestId('biometric-section')).toBeNull();
            });
        });

        it('should hide Security section during biometric initialization delay', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const { queryByTestId } = render(<ProfileScreen />);

            await waitFor(() => {
                expect(queryByTestId('biometric-section')).toBeNull();
            });
        });

        it('should hide Security section when availability check throws', async () => {
            mockIsBiometricAvailable.mockRejectedValue(new Error('Availability check failed'));

            const { queryByTestId } = render(<ProfileScreen />);

            await waitFor(() => {
                expect(queryByTestId('biometric-section')).toBeNull();
            });
        });
    });

    // ================================================================
    // Platform-specific labels
    // ================================================================

    describe('Platform-specific labels in Security section', () => {
        it('should show "Face ID / Touch ID" label on iOS when available', async () => {
            Object.defineProperty(Platform, 'OS', { value: 'ios' });
            mockIsBiometricAvailable.mockResolvedValue(true);

            const { findByText } = render(<ProfileScreen />);

            const label = await findByText('Face ID / Touch ID');
            expect(label).toBeTruthy();
        });

        it('should show "Biometric Login" label on Android when available', async () => {
            Object.defineProperty(Platform, 'OS', { value: 'android' });
            mockIsBiometricAvailable.mockResolvedValue(true);

            const { findByText } = render(<ProfileScreen />);

            const label = await findByText('Biometric Login');
            expect(label).toBeTruthy();
        });

        it('should show iOS-specific description on iOS', async () => {
            Object.defineProperty(Platform, 'OS', { value: 'ios' });
            mockIsBiometricAvailable.mockResolvedValue(true);

            const { findByText } = render(<ProfileScreen />);

            const desc = await findByText('Use Face ID or Touch ID to sign in quickly');
            expect(desc).toBeTruthy();
        });

        it('should show Android-specific description on Android', async () => {
            Object.defineProperty(Platform, 'OS', { value: 'android' });
            mockIsBiometricAvailable.mockResolvedValue(true);

            const { findByText } = render(<ProfileScreen />);

            const desc = await findByText('Use biometrics to sign in quickly');
            expect(desc).toBeTruthy();
        });
    });

    // ================================================================
    // Integration: Profile + Security section coexistence
    // ================================================================

    describe('Integration: Profile fields visible, Security section conditional', () => {
        it('should show profile fields but NOT Security when biometrics unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const { queryByTestId, getByText } = render(<ProfileScreen />);

            const saveButton = getByText('Save');
            expect(saveButton).toBeTruthy();

            await waitFor(() => {
                expect(queryByTestId('biometric-section')).toBeNull();
            });
        });

        it('should show both profile fields AND Security when biometrics available', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);

            const { findByTestId, getByText } = render(<ProfileScreen />);

            const saveButton = getByText('Save');
            expect(saveButton).toBeTruthy();

            const section = await findByTestId('biometric-section');
            expect(section).toBeTruthy();
        });

        it('should not skip preference check when available', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);

            render(<ProfileScreen />);

            await waitFor(() => {
                expect(mockIsBiometricAvailable).toHaveBeenCalled();
                expect(mockGetBiometricPreference).toHaveBeenCalled();
            });
        });

        it('should skip preference check when unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            render(<ProfileScreen />);

            await waitFor(() => {
                expect(mockIsBiometricAvailable).toHaveBeenCalled();
            });
            expect(mockGetBiometricPreference).not.toHaveBeenCalled();
        });
    });

    // ================================================================
    // Loading and error states
    // ================================================================

    describe('Loading and error states should not show Security section', () => {
        it('should not show Security section during profile loading', async () => {
            mockUseMyProfileQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            });

            const { queryByTestId } = render(<ProfileScreen />);

            expect(queryByTestId('biometric-section')).toBeNull();
        });

        it('should not show Security section on profile error', async () => {
            mockUseMyProfileQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: { response: { status: 500 } },
            });

            const { queryByTestId } = render(<ProfileScreen />);

            expect(queryByTestId('biometric-section')).toBeNull();
        });
    });
});

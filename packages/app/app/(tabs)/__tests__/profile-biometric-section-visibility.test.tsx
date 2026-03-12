/**
 * CRITICAL TEST: Profile Screen Security Section Visibility
 *
 * This test verifies that the Security section is shown/hidden correctly
 * based on biometric availability on Samsung A52s 5G and all devices.
 *
 * REQUIREMENT: If biometrics are NOT available, the Security section must NOT appear.
 *
 * NOTE: Biometric controls now live inside SettingsAccordion (collapsed by default).
 * Tests that check visibility must expand the accordion first.
 */

import React from 'react';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {Alert, Platform} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import ProfileScreen from '../profile';

// Mock react-i18next to return English strings for existing tests
const translations: Record<string, string> = {
    'profile.title': 'Profile',
    'profile.createProfile': 'Create your profile',
    'profile.noProfile': "We didn't find a profile. Fill in the fields below and save to create one.",
    'profile.firstNamePlaceholder': 'First name',
    'profile.lastNamePlaceholder': 'Last name',
    'profile.phonePlaceholder': 'Phone',
    'profile.settings': 'Settings',
    'profile.security': 'Security',
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
    'profile.personalInfo': 'Personal Info',
    'profile.glowTheme': 'Glow Theme',
    'profile.noName': 'No Name',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.cancel': 'Cancel',
    'common.disable': 'Disable',
};

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => translations[key] ?? key,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.mock('@yuhuu/components', () => ({
    ...jest.requireActual('@yuhuu/components'),
    LanguagePicker: () => {
        const R = require('react');
        return R.createElement('View', {testID: 'language-picker'});
    },
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 34, left: 0, right: 0 })),
    SafeAreaView: ({ children, ...props }: any) => {
        const React = require('react');
        const { View } = require('react-native');
        return React.createElement(View, props, children);
    },
}));

jest.mock('@gorhom/bottom-sheet', () => {
    const React = require('react');
    const RN = require('react-native');
    return {
        BottomSheetModal: React.forwardRef(
            ({children, testID}: any, ref: any) => {
                const [isVisible, setIsVisible] = React.useState(false);

                React.useImperativeHandle(ref, () => ({
                    present: () => setIsVisible(true),
                    dismiss: () => setIsVisible(false),
                }));

                if (!isVisible) return null;

                return React.createElement(
                    RN.View,
                    {testID},
                    children
                );
            }
        ),
        BottomSheetView: ({children, style}: any) =>
            React.createElement(RN.View, {style}, children),
        BottomSheetModalProvider: ({children}: any) => children,
    };
});

jest.spyOn(Alert, 'alert');

const mockIsBiometricAvailable = jest.fn();
const mockGetBiometricPreference = jest.fn();
const mockSaveBiometricPreference = jest.fn();
const mockSaveBiometricEmail = jest.fn();
const mockClearBiometricData = jest.fn();
const mockAuthenticateWithBiometrics = jest.fn();

jest.mock('@yuhuu/auth', () => ({
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
    useBootstrapGate: () => {
    },
}));

// Mock accordion component hooks
jest.mock('@/features/family/api', () => ({
    useMyFamilyQuery: () => ({data: [], isLoading: false}),
    useUserFamilyQuery: () => ({data: [], isLoading: false}),
    useDeleteMyFamilyRelationshipMutation: () => ({mutate: jest.fn(), isPending: false}),
    useCreateMyFamilyRelationshipMutation: () => ({mutate: jest.fn(), isPending: false}),
    useUpdateMyFamilyRelationshipMutation: () => ({mutate: jest.fn(), isPending: false}),
    useCreateUserFamilyRelationshipMutation: () => ({mutate: jest.fn(), isPending: false}),
    useUpdateUserFamilyRelationshipMutation: () => ({mutate: jest.fn(), isPending: false}),
    useDeleteUserFamilyRelationshipMutation: () => ({mutate: jest.fn(), isPending: false}),
}));

jest.mock('@/features/milestones/api', () => ({
    useMyMilestonesQuery: () => ({data: [], isLoading: false}),
    useUserMilestonesQuery: () => ({data: [], isLoading: false}),
    useDeleteMyMilestoneMutation: () => ({mutate: jest.fn(), isPending: false}),
    useCreateMyMilestoneMutation: () => ({mutate: jest.fn(), isPending: false}),
    useUpdateMyMilestoneMutation: () => ({mutate: jest.fn(), isPending: false}),
    useCreateUserMilestoneMutation: () => ({mutate: jest.fn(), isPending: false}),
    useUpdateUserMilestoneMutation: () => ({mutate: jest.fn(), isPending: false}),
    useDeleteUserMilestoneMutation: () => ({mutate: jest.fn(), isPending: false}),
}));

jest.mock('@/features/membership/api', () => ({
    useMyMembershipHistoryQuery: () => ({data: [], isLoading: false}),
    useUserMembershipHistoryQuery: () => ({data: [], isLoading: false}),
    useDeleteMyMembershipHistoryMutation: () => ({mutate: jest.fn(), isPending: false}),
    useCreateMyMembershipHistoryMutation: () => ({mutate: jest.fn(), isPending: false}),
    useUpdateMyMembershipHistoryMutation: () => ({mutate: jest.fn(), isPending: false}),
    useCreateUserMembershipHistoryMutation: () => ({mutate: jest.fn(), isPending: false}),
    useUpdateUserMembershipHistoryMutation: () => ({mutate: jest.fn(), isPending: false}),
    useDeleteUserMembershipHistoryMutation: () => ({mutate: jest.fn(), isPending: false}),
}));

jest.mock('@/features/skills/api', () => ({
    useMySkillsQuery: () => ({data: [], isLoading: false}),
    useUserSkillsQuery: () => ({data: [], isLoading: false}),
    useDeleteMySkillMutation: () => ({mutate: jest.fn(), isPending: false}),
    useCreateMySkillMutation: () => ({mutate: jest.fn(), isPending: false}),
    useUpdateMySkillMutation: () => ({mutate: jest.fn(), isPending: false}),
    useCreateUserSkillMutation: () => ({mutate: jest.fn(), isPending: false}),
    useUpdateUserSkillMutation: () => ({mutate: jest.fn(), isPending: false}),
    useDeleteUserSkillMutation: () => ({mutate: jest.fn(), isPending: false}),
}));

const mockUseAuth = jest.fn();
jest.mock('@/providers/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}));

/**
 * Helper to expand the Settings accordion (collapsed by default)
 * so biometric controls become visible.
 */
async function expandSettingsAccordion(utils: ReturnType<typeof render>) {
    const header = utils.getByTestId('settings-header');
    await act(async () => {
        fireEvent.press(header);
    });
}

describe('ProfileScreen - Security Section Visibility (CRITICAL)', () => {
    const originalPlatform = Platform.OS;
    let queryClient: QueryClient;

    const renderWithQueryClient = (component: React.ReactElement) => {
        return render(
            <QueryClientProvider client={queryClient}>
                {component}
            </QueryClientProvider>
        );
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {retry: false},
                mutations: {retry: false},
            },
        });
        jest.clearAllMocks();
        (Platform as any).OS = 'android';

        mockUseAuth.mockReturnValue({
            user: {
                id: '1',
                email: 'test@example.com'
            },
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
        Object.defineProperty(Platform, 'OS', {value: originalPlatform});
    });

    // ================================================================
    // CRITICAL: Biometric toggle hidden when biometrics unavailable
    // ================================================================

    describe('CRITICAL: Biometric toggle must hide when biometrics unavailable', () => {
        it('should NOT show biometric toggle when isBiometricAvailable returns false', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.queryByTestId('settings-biometric-toggle')).toBeNull();
            });
        });

        it('should NOT show biometric label text when unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.queryByText('Biometric Login')).toBeNull();
                expect(utils.queryByText('Face ID / Touch ID')).toBeNull();
            });
        });

        it('should NOT show biometric description text when unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.queryByText('Use biometrics to sign in quickly')).toBeNull();
                expect(utils.queryByText('Use Face ID or Touch ID to sign in quickly')).toBeNull();
            });
        });
    });

    // ================================================================
    // CRITICAL: Biometric toggle must show when biometrics available
    // ================================================================

    describe('CRITICAL: Biometric toggle must show when biometrics available', () => {
        it('should SHOW biometric toggle when isBiometricAvailable returns true', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByTestId('settings-biometric-toggle')).toBeTruthy();
            });
        });

        it('should SHOW biometric label when available on Android', async () => {
            Object.defineProperty(Platform, 'OS', {value: 'android'});
            mockIsBiometricAvailable.mockResolvedValue(true);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByText('Biometric Login')).toBeTruthy();
            });
        });

        it('should SHOW biometric description when available on Android', async () => {
            Object.defineProperty(Platform, 'OS', {value: 'android'});
            mockIsBiometricAvailable.mockResolvedValue(true);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByText('Use biometrics to sign in quickly')).toBeTruthy();
            });
        });
    });

    // ================================================================
    // Samsung A52s 5G: Biometric unavailable scenarios
    // ================================================================

    describe('Samsung A52s 5G: Biometric toggle hidden when biometrics unavailable', () => {
        it('should hide biometric toggle when biometric hardware absent', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.queryByTestId('settings-biometric-toggle')).toBeNull();
            });
        });

        it('should hide biometric toggle when nothing enrolled', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.queryByTestId('settings-biometric-toggle')).toBeNull();
            });
        });

        it('should hide biometric toggle during biometric initialization delay', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.queryByTestId('settings-biometric-toggle')).toBeNull();
            });
        });

        it('should hide biometric toggle when availability check throws', async () => {
            mockIsBiometricAvailable.mockRejectedValue(new Error('Availability check failed'));

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.queryByTestId('settings-biometric-toggle')).toBeNull();
            });
        });
    });

    // ================================================================
    // Platform-specific labels
    // ================================================================

    describe('Platform-specific labels in Settings accordion', () => {
        it('should show "Face ID / Touch ID" label on iOS when available', async () => {
            Object.defineProperty(Platform, 'OS', {value: 'ios'});
            mockIsBiometricAvailable.mockResolvedValue(true);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByText('Face ID / Touch ID')).toBeTruthy();
            });
        });

        it('should show "Biometric Login" label on Android when available', async () => {
            Object.defineProperty(Platform, 'OS', {value: 'android'});
            mockIsBiometricAvailable.mockResolvedValue(true);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByText('Biometric Login')).toBeTruthy();
            });
        });

        it('should show iOS-specific description on iOS', async () => {
            Object.defineProperty(Platform, 'OS', {value: 'ios'});
            mockIsBiometricAvailable.mockResolvedValue(true);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByText('Use Face ID or Touch ID to sign in quickly')).toBeTruthy();
            });
        });

        it('should show Android-specific description on Android', async () => {
            Object.defineProperty(Platform, 'OS', {value: 'android'});
            mockIsBiometricAvailable.mockResolvedValue(true);

            const utils = renderWithQueryClient(<ProfileScreen/>);
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByText('Use biometrics to sign in quickly')).toBeTruthy();
            });
        });
    });

    // ================================================================
    // Integration: Profile + Biometric toggle coexistence
    // ================================================================

    describe('Integration: Profile fields visible, biometric toggle conditional', () => {
        it('should show profile fields but NOT biometric toggle when biometrics unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            const utils = renderWithQueryClient(<ProfileScreen/>);

            const saveButton = utils.getByText('Save');
            expect(saveButton).toBeTruthy();

            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.queryByTestId('settings-biometric-toggle')).toBeNull();
            });
        });

        it('should show both profile fields AND biometric toggle when biometrics available', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);

            const utils = renderWithQueryClient(<ProfileScreen/>);

            const saveButton = utils.getByText('Save');
            expect(saveButton).toBeTruthy();

            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByTestId('settings-biometric-toggle')).toBeTruthy();
            });
        });

        it('should not skip preference check when available', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);

            renderWithQueryClient(<ProfileScreen/>);

            await waitFor(() => {
                expect(mockIsBiometricAvailable).toHaveBeenCalled();
                expect(mockGetBiometricPreference).toHaveBeenCalled();
            });
        });

        it('should skip preference check when unavailable', async () => {
            mockIsBiometricAvailable.mockResolvedValue(false);

            renderWithQueryClient(<ProfileScreen/>);

            await waitFor(() => {
                expect(mockIsBiometricAvailable).toHaveBeenCalled();
            });
            expect(mockGetBiometricPreference).not.toHaveBeenCalled();
        });
    });

    // ================================================================
    // Loading and error states
    // ================================================================

    describe('Loading and error states should not show biometric toggle', () => {
        it('should not show biometric toggle during profile loading', async () => {
            mockUseMyProfileQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            });

            const {queryByTestId} = renderWithQueryClient(<ProfileScreen/>);

            expect(queryByTestId('settings-biometric-toggle')).toBeNull();
        });

        it('should not show biometric toggle on profile error', async () => {
            mockUseMyProfileQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: {response: {status: 500}},
            });

            const {queryByTestId} = renderWithQueryClient(<ProfileScreen/>);

            expect(queryByTestId('settings-biometric-toggle')).toBeNull();
        });
    });
});

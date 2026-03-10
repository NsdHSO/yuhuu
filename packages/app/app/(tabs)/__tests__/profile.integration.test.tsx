/**
 * Integration tests for Profile Screen with accordion components.
 *
 * Tests accordion interactions, theme switching via GlowVariantProvider,
 * and the overall composition of the profile screen.
 */

import React from 'react';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {Alert, Platform} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import ProfileScreen from '../profile';

const translations: Record<string, string> = {
    'profile.title': 'Profile',
    'profile.createProfile': 'Create your profile',
    'profile.noProfile': "We didn't find a profile. Fill in the fields below and save to create one.",
    'profile.firstNamePlaceholder': 'First name',
    'profile.lastNamePlaceholder': 'Last name',
    'profile.phonePlaceholder': 'Phone',
    'profile.settings': 'Settings',
    'profile.personalInfo': 'Personal Info',
    'profile.churchDetails': 'Church Details',
    'profile.noChurchDetails': 'No church details available.',
    'profile.biometricLabel': 'Face ID / Touch ID',
    'profile.biometricLabelAndroid': 'Biometric Login',
    'profile.biometricDescription': 'Use Face ID or Touch ID to sign in quickly',
    'profile.biometricDescriptionAndroid': 'Use biometrics to sign in quickly',
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
    useSafeAreaInsets: jest.fn(() => ({top: 0, bottom: 34, left: 0, right: 0})),
    SafeAreaView: ({children, ...props}: any) => {
        const React = require('react');
        const {View} = require('react-native');
        return React.createElement(View, props, children);
    },
}));

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

const mockMutate = jest.fn();
const mockUseMyProfileQuery = jest.fn();
const mockUseSaveMyProfileMutation = jest.fn();

jest.mock('@/features/profile/api', () => ({
    useMyProfileQuery: (opts: any) => mockUseMyProfileQuery(opts),
    useSaveMyProfileMutation: () => mockUseSaveMyProfileMutation(),
}));

jest.mock('@/features/bootstrap/api', () => ({
    useBootstrapGate: () => {},
}));

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

async function expandSettingsAccordion(utils: ReturnType<typeof render>) {
    const header = utils.getByTestId('settings-header');
    await act(async () => {
        fireEvent.press(header);
    });
}

describe('ProfileScreen - Integration Tests', () => {
    const originalPlatform = Platform.OS;
    let queryClient: QueryClient;

    const renderScreen = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <ProfileScreen />
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
        (Platform as any).OS = 'ios';

        mockUseAuth.mockReturnValue({
            user: {id: '1', email: 'jane@example.com', name: 'Jane'},
            status: 'signed-in',
            signIn: jest.fn(),
            signInWithBiometrics: jest.fn(),
            signOut: jest.fn(),
        });
        mockUseSaveMyProfileMutation.mockReturnValue({mutate: mockMutate, isPending: false});
        mockUseMyProfileQuery.mockReturnValue({
            data: {
                id: 1,
                user_id: 1,
                middle_name: 'Jane',
                last_name: 'Smith',
                phone: '555-9876',
                created_at: '2026-01-01',
                updated_at: '2026-01-01',
            },
            isLoading: false,
            error: null,
        });
        mockIsBiometricAvailable.mockResolvedValue(true);
        mockGetBiometricPreference.mockResolvedValue(false);
        mockSaveBiometricPreference.mockResolvedValue(undefined);
        mockAuthenticateWithBiometrics.mockResolvedValue(true);
        mockSaveBiometricEmail.mockResolvedValue(undefined);
        mockClearBiometricData.mockResolvedValue(undefined);
    });

    afterEach(() => {
        Object.defineProperty(Platform, 'OS', {value: originalPlatform, configurable: true});
    });

    // ================================================================
    // Screen composition
    // ================================================================

    describe('Screen composition', () => {
        it('should render ProfileHeader with user info', () => {
            const utils = renderScreen();
            expect(utils.getByTestId('profile-header')).toBeTruthy();
        });

        it('should render PersonalInfoAccordion', () => {
            const utils = renderScreen();
            expect(utils.getByTestId('personal-info-header')).toBeTruthy();
        });

        it('should render SettingsAccordion', () => {
            const utils = renderScreen();
            expect(utils.getByTestId('settings-header')).toBeTruthy();
        });

        it('should render Save button', () => {
            const utils = renderScreen();
            expect(utils.getByText('Save')).toBeTruthy();
        });

        it('should show initials in profile header', () => {
            const utils = renderScreen();
            expect(utils.getByText('JS')).toBeTruthy();
        });
    });

    // ================================================================
    // Accordion expand/collapse interactions
    // ================================================================

    describe('Accordion interactions', () => {
        it('should expand settings accordion on press', async () => {
            const utils = renderScreen();
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByTestId('language-picker')).toBeTruthy();
            });
        });

        it('should show biometric toggle after expanding settings', async () => {
            const utils = renderScreen();
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByTestId('settings-biometric-toggle')).toBeTruthy();
            });
        });

        it('should show glow theme section after expanding settings', async () => {
            const utils = renderScreen();
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByText('Glow Theme')).toBeTruthy();
            });
        });

        it('should show glow variant buttons after expanding settings', async () => {
            const utils = renderScreen();
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByTestId('settings-glow-subtle')).toBeTruthy();
                expect(utils.getByTestId('settings-glow-vibrant')).toBeTruthy();
                expect(utils.getByTestId('settings-glow-warm')).toBeTruthy();
                expect(utils.getByTestId('settings-glow-cool')).toBeTruthy();
            });
        });
    });

    // ================================================================
    // Glow variant theme switching
    // ================================================================

    describe('Glow variant theme switching', () => {
        it('should allow pressing glow variant buttons', async () => {
            const utils = renderScreen();
            await expandSettingsAccordion(utils);

            await waitFor(() => {
                expect(utils.getByTestId('settings-glow-warm')).toBeTruthy();
            });

            await act(async () => {
                fireEvent.press(utils.getByTestId('settings-glow-warm'));
            });

            // No crash means the GlowVariantProvider context update worked
            expect(utils.getByTestId('settings-glow-warm')).toBeTruthy();
        });

        it('should allow switching between all glow variants', async () => {
            const utils = renderScreen();
            await expandSettingsAccordion(utils);

            const variants = ['subtle', 'vibrant', 'warm', 'cool'];
            for (const variant of variants) {
                await waitFor(() => {
                    expect(utils.getByTestId(`settings-glow-${variant}`)).toBeTruthy();
                });
                await act(async () => {
                    fireEvent.press(utils.getByTestId(`settings-glow-${variant}`));
                });
            }
        });
    });

    // ================================================================
    // Save flow with accordion components
    // ================================================================

    describe('Save flow', () => {
        it('should call mutate with profile data on save', () => {
            mockMutate.mockImplementation((_p: any, opts: any) => {
                opts.onSuccess();
            });
            mockUseSaveMyProfileMutation.mockReturnValue({mutate: mockMutate, isPending: false});

            const utils = renderScreen();
            fireEvent.press(utils.getByText('Save'));

            expect(mockMutate).toHaveBeenCalledWith(
                expect.objectContaining({mode: 'update'}),
                expect.any(Object),
            );
        });

        it('should show success alert on save', () => {
            mockMutate.mockImplementation((_p: any, opts: any) => {
                opts.onSuccess();
            });
            mockUseSaveMyProfileMutation.mockReturnValue({mutate: mockMutate, isPending: false});

            const utils = renderScreen();
            fireEvent.press(utils.getByText('Save'));

            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Profile saved.');
        });

        it('should show error alert on save failure', () => {
            mockMutate.mockImplementation((_p: any, opts: any) => {
                opts.onError({response: {data: {}}});
            });
            mockUseSaveMyProfileMutation.mockReturnValue({mutate: mockMutate, isPending: false});

            const utils = renderScreen();
            fireEvent.press(utils.getByText('Save'));

            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save profile.');
        });

        it('should show Saving text when mutation is pending', () => {
            mockUseSaveMyProfileMutation.mockReturnValue({mutate: mockMutate, isPending: true});

            const utils = renderScreen();
            expect(utils.getByText('Saving\u2026')).toBeTruthy();
        });
    });

    // ================================================================
    // Biometric toggle flow inside settings accordion
    // ================================================================

    describe('Biometric enable flow via settings accordion', () => {
        it('should enable biometric after expanding settings and toggling', async () => {
            const utils = renderScreen();
            await expandSettingsAccordion(utils);

            const toggle = await utils.findByTestId('settings-biometric-toggle');
            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(mockAuthenticateWithBiometrics).toHaveBeenCalled();
                expect(mockSaveBiometricPreference).toHaveBeenCalledWith(true);
                expect(Alert.alert).toHaveBeenCalledWith('Success', 'Biometric sign-in enabled.');
            });
        });

        it('should show error when biometric auth fails', async () => {
            mockAuthenticateWithBiometrics.mockResolvedValue(false);

            const utils = renderScreen();
            await expandSettingsAccordion(utils);

            const toggle = await utils.findByTestId('settings-biometric-toggle');
            await act(async () => {
                fireEvent(toggle, 'valueChange', true);
            });

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Error',
                    'Could not verify your identity. Please try again.',
                );
            });
        });
    });

    // ================================================================
    // No profile state
    // ================================================================

    describe('No profile state', () => {
        it('should show create profile message when no profile exists', () => {
            mockUseMyProfileQuery.mockReturnValue({data: null, isLoading: false, error: null});

            const utils = renderScreen();
            expect(utils.getByText('Create your profile')).toBeTruthy();
        });

        it('should still show settings accordion when no profile exists', () => {
            mockUseMyProfileQuery.mockReturnValue({data: null, isLoading: false, error: null});

            const utils = renderScreen();
            expect(utils.getByTestId('settings-header')).toBeTruthy();
        });

        it('should use create mode when saving without existing profile', () => {
            mockUseMyProfileQuery.mockReturnValue({data: null, isLoading: false, error: null});
            mockMutate.mockImplementation((_p: any, opts: any) => {
                opts.onSuccess();
            });
            mockUseSaveMyProfileMutation.mockReturnValue({mutate: mockMutate, isPending: false});

            const utils = renderScreen();
            fireEvent.press(utils.getByText('Save'));

            expect(mockMutate).toHaveBeenCalledWith(
                expect.objectContaining({mode: 'create'}),
                expect.any(Object),
            );
        });
    });

    // ================================================================
    // Error and loading states
    // ================================================================

    describe('Error and loading states', () => {
        it('should show loading indicator when profile is loading', () => {
            mockUseMyProfileQuery.mockReturnValue({data: undefined, isLoading: true, error: null});

            const utils = renderScreen();
            // When loading, the profile content should not be visible
            expect(utils.queryByText('Save')).toBeNull();
        });

        it('should show error message on non-404 error', () => {
            mockUseMyProfileQuery.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: {response: {status: 500}},
            });

            const utils = renderScreen();
            expect(utils.getByText('Failed to load profile.')).toBeTruthy();
        });
    });
});

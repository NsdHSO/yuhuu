import React from 'react';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {Alert, Platform} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import ProfileScreen from '../profile';

/**
 * TDD tests for Profile Screen i18n Migration (Task 10)
 *
 * Keys match locales/en.json structure using flat dot-notation:
 *   t('profile.title'), t('profile.biometricLabel'), t('common.success'), etc.
 */

jest.spyOn(Alert, 'alert');

const mockT = jest.fn((key: string, _options?: any) => key);
const mockUseTranslation = jest.fn(() => ({
    t: mockT,
    i18n: {language: 'en', changeLanguage: jest.fn()},
}));

jest.mock('react-i18next', () => ({
    useTranslation: (...args: any[]) => mockUseTranslation(...args),
}));

jest.mock('@yuhuu/components', () => ({
    ...jest.requireActual('@yuhuu/components'),
    LanguagePicker: () => {
        const R = require('react');
        return R.createElement('View', {testID: 'language-picker'});
    },
}));

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

const mockMutate = jest.fn();
const mockUseMyProfileQuery = jest.fn();
const mockUseSaveMyProfileMutation = jest.fn();

jest.mock('@/features/profile/api', () => ({
    useMyProfileQuery: (opts: any) => mockUseMyProfileQuery(opts),
    useSaveMyProfileMutation: () => mockUseSaveMyProfileMutation(),
}));

jest.mock('@/features/bootstrap/api', () => ({
    useBootstrapGate: () => {
    }
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
jest.mock('@/providers/AuthProvider', () => ({useAuth: () => mockUseAuth()}));

describe('ProfileScreen - i18n Migration', () => {
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
        mockUseMyProfileQuery.mockReturnValue({
            data: {
                id: 1,
                user_id: 1,
                middle_name: 'John',
                last_name: 'Doe',
                phone: '555-1234',
                created_at: '2026-01-01',
                updated_at: '2026-01-01'
            },
            isLoading: false, error: null,
        });
        mockUseSaveMyProfileMutation.mockReturnValue({mutate: mockMutate, isPending: false});
        mockUseAuth.mockReturnValue({
            user: {id: '1', email: 'john@example.com', name: 'John'},
            status: 'signed-in', signIn: jest.fn(), signInWithBiometrics: jest.fn(), signOut: jest.fn(),
        });
        mockIsBiometricAvailable.mockResolvedValue(true);
        mockGetBiometricPreference.mockResolvedValue(false);
        mockSaveBiometricPreference.mockResolvedValue(undefined);
        mockAuthenticateWithBiometrics.mockResolvedValue(true);
        mockSaveBiometricEmail.mockResolvedValue(undefined);
        mockGetBiometricEmail.mockResolvedValue(null);
        mockClearBiometricData.mockResolvedValue(undefined);
    });

    afterEach(() => {
        Object.defineProperty(Platform, 'OS', {value: originalPlatform, configurable: true});
    });

    it('should call useTranslation', () => {
        renderWithQueryClient(<ProfileScreen/>);
        expect(mockUseTranslation).toHaveBeenCalled();
    });

    it('should use t("profile.title") for the screen title', () => {
        renderWithQueryClient(<ProfileScreen/>);
        expect(mockT).toHaveBeenCalledWith('profile.title');
    });

    it('should use t("profile.createProfile") when no profile', () => {
        mockUseMyProfileQuery.mockReturnValue({data: null, isLoading: false, error: null});
        renderWithQueryClient(<ProfileScreen/>);
        expect(mockT).toHaveBeenCalledWith('profile.createProfile');
    });

    it('should use t("profile.noProfile") when no profile', () => {
        mockUseMyProfileQuery.mockReturnValue({data: null, isLoading: false, error: null});
        renderWithQueryClient(<ProfileScreen/>);
        expect(mockT).toHaveBeenCalledWith('profile.noProfile');
    });

    it('should use t("profile.firstNamePlaceholder")', () => {
        renderWithQueryClient(<ProfileScreen/>);
        expect(mockT).toHaveBeenCalledWith('profile.firstNamePlaceholder');
    });

    it('should use t("profile.lastNamePlaceholder")', () => {
        renderWithQueryClient(<ProfileScreen/>);
        expect(mockT).toHaveBeenCalledWith('profile.lastNamePlaceholder');
    });

    it('should use t("profile.phonePlaceholder")', () => {
        renderWithQueryClient(<ProfileScreen/>);
        expect(mockT).toHaveBeenCalledWith('profile.phonePlaceholder');
    });

    it('should use t("profile.security") for section title', async () => {
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        await findByTestId('biometric-section');
        expect(mockT).toHaveBeenCalledWith('profile.security');
    });

    it('should use t("profile.biometricLabel") on iOS', async () => {
        Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        await findByTestId('biometric-label');
        expect(mockT).toHaveBeenCalledWith('profile.biometricLabel');
    });

    it('should use t("profile.biometricLabelAndroid") on Android', async () => {
        Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        await findByTestId('biometric-label');
        expect(mockT).toHaveBeenCalledWith('profile.biometricLabelAndroid');
    });

    it('should use t("profile.biometricDescription") on iOS', async () => {
        Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        await findByTestId('biometric-description');
        expect(mockT).toHaveBeenCalledWith('profile.biometricDescription');
    });

    it('should use t("profile.biometricDescriptionAndroid") on Android', async () => {
        Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        await findByTestId('biometric-description');
        expect(mockT).toHaveBeenCalledWith('profile.biometricDescriptionAndroid');
    });

    it('should use t("profile.biometricAccessibilityLabel") on iOS', async () => {
        Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        await findByTestId('biometric-toggle');
        expect(mockT).toHaveBeenCalledWith('profile.biometricAccessibilityLabel');
    });

    it('should use t("profile.biometricAccessibilityLabelAndroid") on Android', async () => {
        Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        await findByTestId('biometric-toggle');
        expect(mockT).toHaveBeenCalledWith('profile.biometricAccessibilityLabelAndroid');
    });

    it('should use t("profile.biometricAccessibilityHint")', async () => {
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        await findByTestId('biometric-toggle');
        expect(mockT).toHaveBeenCalledWith('profile.biometricAccessibilityHint');
    });

    it('should use t("profile.save") when not pending', () => {
        renderWithQueryClient(<ProfileScreen/>);
        expect(mockT).toHaveBeenCalledWith('profile.save');
    });

    it('should use t("profile.saving") when pending', () => {
        mockUseSaveMyProfileMutation.mockReturnValue({mutate: mockMutate, isPending: true});
        renderWithQueryClient(<ProfileScreen/>);
        expect(mockT).toHaveBeenCalledWith('profile.saving');
    });

    it('should use t("common.success") and t("profile.saveSuccess") on save success', () => {
        mockMutate.mockImplementation((_p: any, opts: any) => {
            opts.onSuccess();
        });
        mockUseSaveMyProfileMutation.mockReturnValue({mutate: mockMutate, isPending: false});
        const {getByText} = renderWithQueryClient(<ProfileScreen/>);
        fireEvent.press(getByText('profile.save'));
        expect(mockT).toHaveBeenCalledWith('common.success');
        expect(mockT).toHaveBeenCalledWith('profile.saveSuccess');
    });

    it('should use t("common.error") and t("profile.saveError") on save error', () => {
        mockMutate.mockImplementation((_p: any, opts: any) => {
            opts.onError({response: {data: {}}});
        });
        mockUseSaveMyProfileMutation.mockReturnValue({mutate: mockMutate, isPending: false});
        const {getByText} = renderWithQueryClient(<ProfileScreen/>);
        fireEvent.press(getByText('profile.save'));
        expect(mockT).toHaveBeenCalledWith('common.error');
        expect(mockT).toHaveBeenCalledWith('profile.saveError');
    });

    it('should use t("profile.biometricEnableTitle") for auth prompt', async () => {
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        const toggle = await findByTestId('biometric-toggle');
        await act(async () => {
            fireEvent(toggle, 'valueChange', true);
        });
        await waitFor(() => {
            expect(mockT).toHaveBeenCalledWith('profile.biometricEnableTitle');
        });
    });

    it('should use t("profile.biometricAuthFailed") for auth failed', async () => {
        mockAuthenticateWithBiometrics.mockResolvedValue(false);
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        const toggle = await findByTestId('biometric-toggle');
        await act(async () => {
            fireEvent(toggle, 'valueChange', true);
        });
        await waitFor(() => {
            expect(mockT).toHaveBeenCalledWith('profile.biometricAuthFailed');
        });
    });

    it('should use t("profile.biometricEnableSuccess") for enable success', async () => {
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        const toggle = await findByTestId('biometric-toggle');
        await act(async () => {
            fireEvent(toggle, 'valueChange', true);
        });
        await waitFor(() => {
            expect(mockT).toHaveBeenCalledWith('profile.biometricEnableSuccess');
        });
    });

    it('should use t("profile.biometricEnableError") for enable error', async () => {
        mockSaveBiometricPreference.mockRejectedValue(new Error('fail'));
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        const toggle = await findByTestId('biometric-toggle');
        await act(async () => {
            fireEvent(toggle, 'valueChange', true);
        });
        await waitFor(() => {
            expect(mockT).toHaveBeenCalledWith('profile.biometricEnableError');
        });
    });

    it('should use translated keys for disable confirmation dialog', async () => {
        mockGetBiometricPreference.mockResolvedValue(true);
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        const toggle = await findByTestId('biometric-toggle');
        await waitFor(() => {
            expect(toggle.props.value).toBe(true);
        });
        await act(async () => {
            fireEvent(toggle, 'valueChange', false);
        });
        await waitFor(() => {
            expect(mockT).toHaveBeenCalledWith('profile.biometricDisableTitle');
            expect(mockT).toHaveBeenCalledWith('profile.biometricDisableMessage');
            expect(mockT).toHaveBeenCalledWith('common.cancel');
            expect(mockT).toHaveBeenCalledWith('common.disable');
        });
    });

    it('should use t("profile.biometricDisableError") for disable error', async () => {
        mockGetBiometricPreference.mockResolvedValue(true);
        mockSaveBiometricPreference.mockRejectedValue(new Error('fail'));
        const {findByTestId} = renderWithQueryClient(<ProfileScreen/>);
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
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const buttons = alertCall[2];
        const disableButton = buttons.find((b: any) => b.text === 'common.disable');
        if (disableButton?.onPress) {
            await act(async () => {
                await disableButton.onPress();
            });
        }
        expect(mockT).toHaveBeenCalledWith('profile.biometricDisableError');
    });

    it('should use t("profile.loadError") for load error', () => {
        mockUseMyProfileQuery.mockReturnValue({
            data: undefined, isLoading: false, error: {response: {status: 500}},
        });
        renderWithQueryClient(<ProfileScreen/>);
        expect(mockT).toHaveBeenCalledWith('profile.loadError');
    });

    it('should not contain any original hardcoded English strings', async () => {
        mockT.mockImplementation((key: string) => `__${key}__`);
        const {queryByText, findByTestId} = renderWithQueryClient(<ProfileScreen/>);
        await findByTestId('biometric-section');
        const hardcodedStrings = [
            'Profile', 'Create your profile', 'Security',
            'Face ID / Touch ID', 'Biometric Login',
            'Use Face ID or Touch ID to sign in quickly',
            'Use biometrics to sign in quickly',
            'Save', 'Saving\u2026', 'Failed to load profile.',
        ];
        for (const str of hardcodedStrings) {
            expect(queryByText(str)).toBeNull();
        }
    });
});

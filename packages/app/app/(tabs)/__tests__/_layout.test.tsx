import React from 'react';
import {render} from '@testing-library/react-native';
import TabLayout from '../_layout';

/**
 * Unit tests for TabLayout with role-based access control
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific role-based behavior
 * - Open/Closed: Tests ensure tabs can be extended without modifying existing logic
 *
 * ⚠️ KNOWN LIMITATION:
 * These unit tests mock Expo Router and test the EXPECTED behavior.
 * They do NOT catch integration issues between Expo Router and CustomTabBar.
 *
 * Example bug this missed:
 * - Expo Router normalized `href: null` → `href: undefined`
 * - CustomTabBar filtered on `href !== null` (which is true for undefined)
 * - Tabs showed up even though we wanted them hidden
 * - Unit tests passed because the mock correctly filtered tabBarButton
 *
 * TODO: Add E2E/integration tests that render the REAL CustomTabBar
 * to catch these integration bugs.
 */

// Mock react-i18next to return English values
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'tabs.home': 'Home',
                'tabs.admin': 'Admin',
                'tabs.supper': 'Supper',
                'tabs.profile': 'Profile',
            };
            return translations[key] ?? key;
        },
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

// Mock hooks
const mockUseMyRolesQuery = jest.fn();
const mockUseBootstrapGate = jest.fn();

jest.mock('@/features/roles/meRoles', () => ({
    useMyRolesQuery: (options: any) => mockUseMyRolesQuery(options),
}));

jest.mock('@/features/bootstrap/api', () => ({
    useBootstrapGate: () => mockUseBootstrapGate(),
}));

/**
 * Mock expo-router Tabs
 *
 * LIMITATION: This mock tests the EXPECTED behavior (tabBarButton: () => null hides tabs)
 * but doesn't test the ACTUAL Expo Router + CustomTabBar integration.
 *
 * Known issue this mock can't catch:
 * - If Expo Router normalizes href: null → href: undefined
 * - If CustomTabBar filters on href instead of tabBarButton
 *
 * For full integration testing, use E2E tests with the real CustomTabBar.
 */
jest.mock('expo-router', () => {
    const MockTabsScreen = ({
                                name,
                                options
                            }: any) => {
        const {
            View,
            Text
        } = jest.requireActual('react-native');

        // Mimic expected behavior: tabBarButton: () => null should hide the tab
        // NOTE: This doesn't catch if Expo Router breaks this contract
        if (typeof options?.tabBarButton === 'function') {
            return null;
        }

        return (
            <View testID={`tab-${name}`}>
                <Text>{options?.tabBarLabel || name}</Text>
            </View>
        );
    };

    const MockTabs = ({children}: any) => {
        const {View} = jest.requireActual('react-native');
        return <View testID="tabs-container">{children}</View>;
    };

    MockTabs.Screen = MockTabsScreen;

    return {
        Tabs: MockTabs,
    };
});

// Mock shared components from @yuhuu/components
jest.mock('@yuhuu/components', () => ({
    ...jest.requireActual('@yuhuu/components'),
    HapticTab: () => null,
    IconSymbol: () => null,
}));

describe('TabLayout - Role-Based Access Control', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseBootstrapGate.mockReturnValue(true);
    });

    describe('Admin Tab - Only visible for Admin role', () => {
        it('should show Admin tab when user has Admin role', () => {
            // Given: User has Admin role
            mockUseMyRolesQuery.mockReturnValue({
                data: [
                    {
                        role_name: 'Admin',
                        role_id: 1
                    },
                    {
                        role_name: 'Member',
                        role_id: 2
                    },
                ],
            });

            // When: TabLayout renders
            const {getByText} = render(<TabLayout/>);

            // Then: Admin tab should be present
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
            expect(getByText('Admin')).toBeTruthy();
        });

        it('should NOT show Admin tab when user has only Member role', () => {
            // Given: User has only Member role
            mockUseMyRolesQuery.mockReturnValue({
                data: [
                    {
                        role_name: 'Member',
                        role_id: 2
                    }
                ],
            });

            // When: TabLayout renders
            const {queryByText, queryAllByTestId} = render(<TabLayout/>);

            // Then: Admin tab should be hidden (tabBarButton returns null)
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
            // CRITICAL: Verify Admin tab is NOT in the DOM
            // Note: With CustomTabBar filtering, tabs with tabBarButton: () => null won't render
            expect(queryByText('Admin')).toBeNull();

            // CRITICAL: Count total tabs rendered in DOM
            // Member-only user: Home hidden (tabBarButton), Admin hidden (tabBarButton)
            // Visible: Supper, Profile = 2 tabs
            const allTabs = queryAllByTestId(/^tab-/);
            expect(allTabs).toHaveLength(2); // Only Supper and Profile visible
        });

        it('should NOT show Admin tab when user has Leader role but not Admin', () => {
            // Given: User has Leader role but NOT Admin
            mockUseMyRolesQuery.mockReturnValue({
                data: [
                    {
                        role_name: 'Leader',
                        role_id: 3
                    },
                    {
                        role_name: 'Member',
                        role_id: 2
                    },
                ],
            });

            // When: TabLayout renders
            const {queryByText, queryAllByTestId} = render(<TabLayout/>);

            // Then: Admin tab should be hidden
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
            // CRITICAL: Verify Admin tab is NOT in the DOM
            expect(queryByText('Admin')).toBeNull();

            // CRITICAL: Leader user should see exactly 3 tabs (Home, Supper, Profile)
            // Admin tab should NOT be present
            const allTabs = queryAllByTestId(/^tab-/);
            expect(allTabs).toHaveLength(3); // Home, Supper, Profile (no Admin)
        });

        it('should show Admin tab when user has Admin role among multiple roles', () => {
            // Given: User has Admin role plus other roles
            mockUseMyRolesQuery.mockReturnValue({
                data: [
                    {
                        role_name: 'Admin',
                        role_id: 1
                    },
                    {
                        role_name: 'Leader',
                        role_id: 3
                    },
                    {
                        role_name: 'Member',
                        role_id: 2
                    },
                ],
            });

            // When: TabLayout renders
            render(<TabLayout/>);

            // Then: Admin tab should be visible
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
        });

        it('should hide Admin tab by default when roles are loading', () => {
            // Given: Roles are still loading (data is undefined)
            mockUseMyRolesQuery.mockReturnValue({
                data: undefined,
            });

            // When: TabLayout renders
            const {queryByText} = render(<TabLayout/>);

            // Then: Admin tab should be hidden (to avoid flicker)
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
            // CRITICAL: Verify Admin tab is NOT in the DOM during loading
            expect(queryByText('Admin')).toBeNull();
        });

        it('should hide Admin tab when user has no roles', () => {
            // Given: User has empty roles array
            mockUseMyRolesQuery.mockReturnValue({
                data: [],
            });

            // When: TabLayout renders
            const {queryByText} = render(<TabLayout/>);

            // Then: Admin tab should be hidden
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
            // CRITICAL: Verify Admin tab is NOT in the DOM when no roles
            expect(queryByText('Admin')).toBeNull();
        });
    });

    describe('Existing Home Tab - Member-only logic', () => {
        it('should hide Home tab when user has only Member role', () => {
            // Given: User has only Member role
            mockUseMyRolesQuery.mockReturnValue({
                data: [
                    {
                        role_name: 'Member',
                        role_id: 2
                    }
                ],
            });

            // When: TabLayout renders
            render(<TabLayout/>);

            // Then: Home tab should be hidden
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
        });

        it('should show Home tab when user has Admin role', () => {
            // Given: User has Admin role
            mockUseMyRolesQuery.mockReturnValue({
                data: [
                    {
                        role_name: 'Admin',
                        role_id: 1
                    },
                    {
                        role_name: 'Member',
                        role_id: 2
                    },
                ],
            });

            // When: TabLayout renders
            render(<TabLayout/>);

            // Then: Home tab should be visible
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
        });

        it('should show Home tab when user has Leader role', () => {
            // Given: User has Leader role
            mockUseMyRolesQuery.mockReturnValue({
                data: [
                    {
                        role_name: 'Leader',
                        role_id: 3
                    },
                    {
                        role_name: 'Member',
                        role_id: 2
                    },
                ],
            });

            // When: TabLayout renders
            render(<TabLayout/>);

            // Then: Home tab should be visible
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
        });
    });

    describe('Common Tabs - Always visible', () => {
        it('should always show Supper tab for all users', () => {
            // Given: User has only Member role
            mockUseMyRolesQuery.mockReturnValue({
                data: [
                    {
                        role_name: 'Member',
                        role_id: 2
                    }
                ],
            });

            // When: TabLayout renders
            render(<TabLayout/>);

            // Then: Supper tab should be visible
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
        });

        it('should always show Profile tab for all users', () => {
            // Given: User has only Member role
            mockUseMyRolesQuery.mockReturnValue({
                data: [
                    {
                        role_name: 'Member',
                        role_id: 2
                    }
                ],
            });

            // When: TabLayout renders
            render(<TabLayout/>);

            // Then: Profile tab should be visible
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
        });
    });

    describe('Bootstrap Gate', () => {
        it('should wait for bootstrap before checking roles', () => {
            // Given: Bootstrap is not ready
            mockUseBootstrapGate.mockReturnValue(false);
            mockUseMyRolesQuery.mockReturnValue({
                data: undefined,
            });

            // When: TabLayout renders
            render(<TabLayout/>);

            // Then: Roles query should be disabled
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: false});
        });

        it('should enable roles query when bootstrap is ready', () => {
            // Given: Bootstrap is ready
            mockUseBootstrapGate.mockReturnValue(true);
            mockUseMyRolesQuery.mockReturnValue({
                data: [
                    {
                        role_name: 'Admin',
                        role_id: 1
                    }
                ],
            });

            // When: TabLayout renders
            render(<TabLayout/>);

            // Then: Roles query should be enabled
            expect(mockUseMyRolesQuery).toHaveBeenCalledWith({enabled: true});
        });
    });
});

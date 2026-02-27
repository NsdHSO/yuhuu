import React from 'react';
import { render } from '@testing-library/react-native';
import TabLayout from '../_layout';

/**
 * Unit tests for TabLayout with role-based access control
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific role-based behavior
 * - Open/Closed: Tests ensure tabs can be extended without modifying existing logic
 */

// Mock hooks
const mockUseMyRolesQuery = jest.fn();
const mockUseBootstrapGate = jest.fn();

jest.mock('@/features/roles/meRoles', () => ({
	useMyRolesQuery: (options: any) => mockUseMyRolesQuery(options),
}));

jest.mock('@/features/bootstrap/api', () => ({
	useBootstrapGate: () => mockUseBootstrapGate(),
}));

// Mock expo-router Tabs
jest.mock('expo-router', () => {
	const MockTabsScreen = ({ name, options }: any) => {
		const { View, Text } = jest.requireActual('react-native');
		return (
			<View testID={`tab-${name}`}>
				<Text>{options?.title || name}</Text>
			</View>
		);
	};

	const MockTabs = ({ children }: any) => {
		const { View } = jest.requireActual('react-native');
		return <View testID="tabs-container">{children}</View>;
	};

	MockTabs.Screen = MockTabsScreen;

	return {
		Tabs: MockTabs,
	};
});

// Mock components
jest.mock('@/components/haptic-tab', () => ({
	HapticTab: () => null,
}));

jest.mock('@/components/ui/icon-symbol', () => ({
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
					{ role_name: 'Admin', role_id: 1 },
					{ role_name: 'Member', role_id: 2 },
				],
			});

			// When: TabLayout renders
			const { getByText } = render(<TabLayout />);

			// Then: Admin tab should be present
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
			expect(getByText('Admin')).toBeTruthy();
		});

		it('should NOT show Admin tab when user has only Member role', () => {
			// Given: User has only Member role
			mockUseMyRolesQuery.mockReturnValue({
				data: [{ role_name: 'Member', role_id: 2 }],
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Admin tab should be hidden (href should be null)
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
		});

		it('should NOT show Admin tab when user has Leader role but not Admin', () => {
			// Given: User has Leader role but NOT Admin
			mockUseMyRolesQuery.mockReturnValue({
				data: [
					{ role_name: 'Leader', role_id: 3 },
					{ role_name: 'Member', role_id: 2 },
				],
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Admin tab should be hidden
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
		});

		it('should show Admin tab when user has Admin role among multiple roles', () => {
			// Given: User has Admin role plus other roles
			mockUseMyRolesQuery.mockReturnValue({
				data: [
					{ role_name: 'Admin', role_id: 1 },
					{ role_name: 'Leader', role_id: 3 },
					{ role_name: 'Member', role_id: 2 },
				],
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Admin tab should be visible
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
		});

		it('should hide Admin tab by default when roles are loading', () => {
			// Given: Roles are still loading (data is undefined)
			mockUseMyRolesQuery.mockReturnValue({
				data: undefined,
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Admin tab should be hidden (to avoid flicker)
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
		});

		it('should hide Admin tab when user has no roles', () => {
			// Given: User has empty roles array
			mockUseMyRolesQuery.mockReturnValue({
				data: [],
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Admin tab should be hidden
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
		});
	});

	describe('Existing Home Tab - Member-only logic', () => {
		it('should hide Home tab when user has only Member role', () => {
			// Given: User has only Member role
			mockUseMyRolesQuery.mockReturnValue({
				data: [{ role_name: 'Member', role_id: 2 }],
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Home tab should be hidden
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
		});

		it('should show Home tab when user has Admin role', () => {
			// Given: User has Admin role
			mockUseMyRolesQuery.mockReturnValue({
				data: [
					{ role_name: 'Admin', role_id: 1 },
					{ role_name: 'Member', role_id: 2 },
				],
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Home tab should be visible
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
		});

		it('should show Home tab when user has Leader role', () => {
			// Given: User has Leader role
			mockUseMyRolesQuery.mockReturnValue({
				data: [
					{ role_name: 'Leader', role_id: 3 },
					{ role_name: 'Member', role_id: 2 },
				],
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Home tab should be visible
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
		});
	});

	describe('Common Tabs - Always visible', () => {
		it('should always show Supper tab for all users', () => {
			// Given: User has only Member role
			mockUseMyRolesQuery.mockReturnValue({
				data: [{ role_name: 'Member', role_id: 2 }],
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Supper tab should be visible
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
		});

		it('should always show Profile tab for all users', () => {
			// Given: User has only Member role
			mockUseMyRolesQuery.mockReturnValue({
				data: [{ role_name: 'Member', role_id: 2 }],
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Profile tab should be visible
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
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
			render(<TabLayout />);

			// Then: Roles query should be disabled
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: false });
		});

		it('should enable roles query when bootstrap is ready', () => {
			// Given: Bootstrap is ready
			mockUseBootstrapGate.mockReturnValue(true);
			mockUseMyRolesQuery.mockReturnValue({
				data: [{ role_name: 'Admin', role_id: 1 }],
			});

			// When: TabLayout renders
			render(<TabLayout />);

			// Then: Roles query should be enabled
			expect(mockUseMyRolesQuery).toHaveBeenCalledWith({ enabled: true });
		});
	});
});

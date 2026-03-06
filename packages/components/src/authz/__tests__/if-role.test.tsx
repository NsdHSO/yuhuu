import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {Text} from 'react-native';
import {IfRole} from '../IfRole';

jest.mock('@yuhuu/auth', () => ({
    hasRole: jest.fn(),
    hasAnyRole: jest.fn(),
}));

import {hasRole, hasAnyRole} from '@yuhuu/auth';

const mockHasRole = hasRole as jest.MockedFunction<typeof hasRole>;
const mockHasAnyRole = hasAnyRole as jest.MockedFunction<typeof hasAnyRole>;

describe('IfRole', () => {
    beforeEach(() => {
        mockHasRole.mockReset();
        mockHasAnyRole.mockReset();
    });

    describe('single role (name prop)', () => {
        it('renders children when role matches', () => {
            mockHasRole.mockReturnValue(true);

            render(
                <IfRole name="admin">
                    <Text>Admin Panel</Text>
                </IfRole>
            );

            expect(screen.getByText('Admin Panel')).toBeTruthy();
            expect(mockHasRole).toHaveBeenCalledWith('admin');
        });

        it('does not render children when role does not match', () => {
            mockHasRole.mockReturnValue(false);

            render(
                <IfRole name="admin">
                    <Text>Admin Panel</Text>
                </IfRole>
            );

            expect(screen.queryByText('Admin Panel')).toBeNull();
            expect(mockHasRole).toHaveBeenCalledWith('admin');
        });

        it('renders fallback when role does not match', () => {
            mockHasRole.mockReturnValue(false);

            render(
                <IfRole name="admin" fallback={<Text>You are not an admin</Text>}>
                    <Text>Admin Panel</Text>
                </IfRole>
            );

            expect(screen.queryByText('Admin Panel')).toBeNull();
            expect(screen.getByText('You are not an admin')).toBeTruthy();
        });

        it('does not render fallback when role matches', () => {
            mockHasRole.mockReturnValue(true);

            render(
                <IfRole name="editor" fallback={<Text>No Access</Text>}>
                    <Text>Editor Tools</Text>
                </IfRole>
            );

            expect(screen.getByText('Editor Tools')).toBeTruthy();
            expect(screen.queryByText('No Access')).toBeNull();
        });
    });

    describe('multiple roles (anyOf prop)', () => {
        it('renders children when any role matches', () => {
            mockHasAnyRole.mockReturnValue(true);

            render(
                <IfRole anyOf={['admin', 'moderator']}>
                    <Text>Moderation Tools</Text>
                </IfRole>
            );

            expect(screen.getByText('Moderation Tools')).toBeTruthy();
            expect(mockHasAnyRole).toHaveBeenCalledWith(['admin', 'moderator']);
        });

        it('does not render children when no role matches', () => {
            mockHasAnyRole.mockReturnValue(false);

            render(
                <IfRole anyOf={['admin', 'superadmin']}>
                    <Text>Super Controls</Text>
                </IfRole>
            );

            expect(screen.queryByText('Super Controls')).toBeNull();
        });

        it('renders fallback when no role matches', () => {
            mockHasAnyRole.mockReturnValue(false);

            render(
                <IfRole anyOf={['admin']} fallback={<Text>Restricted Area</Text>}>
                    <Text>Admin Zone</Text>
                </IfRole>
            );

            expect(screen.queryByText('Admin Zone')).toBeNull();
            expect(screen.getByText('Restricted Area')).toBeTruthy();
        });

        it('uses hasAnyRole instead of hasRole for anyOf', () => {
            mockHasAnyRole.mockReturnValue(true);

            render(
                <IfRole anyOf={['editor']}>
                    <Text>Content</Text>
                </IfRole>
            );

            expect(mockHasAnyRole).toHaveBeenCalledTimes(1);
            expect(mockHasRole).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('renders children when neither name nor anyOf is provided', () => {
            render(
                <IfRole>
                    <Text>Default Content</Text>
                </IfRole>
            );

            expect(screen.getByText('Default Content')).toBeTruthy();
            expect(mockHasRole).not.toHaveBeenCalled();
            expect(mockHasAnyRole).not.toHaveBeenCalled();
        });

        it('renders children when anyOf is an empty array', () => {
            render(
                <IfRole anyOf={[]}>
                    <Text>Empty AnyOf</Text>
                </IfRole>
            );

            expect(screen.getByText('Empty AnyOf')).toBeTruthy();
            expect(mockHasAnyRole).not.toHaveBeenCalled();
        });

        it('uses fallback default of null when not provided', () => {
            mockHasRole.mockReturnValue(false);

            const {toJSON} = render(
                <IfRole name="admin">
                    <Text>Hidden</Text>
                </IfRole>
            );

            expect(screen.queryByText('Hidden')).toBeNull();
            expect(toJSON()).toBeNull();
        });

        it('renders multiple children when role matches', () => {
            mockHasRole.mockReturnValue(true);

            render(
                <IfRole name="admin">
                    <Text>Dashboard</Text>
                    <Text>Settings</Text>
                </IfRole>
            );

            expect(screen.getByText('Dashboard')).toBeTruthy();
            expect(screen.getByText('Settings')).toBeTruthy();
        });

        it('prefers anyOf over name when both are provided', () => {
            mockHasAnyRole.mockReturnValue(true);

            render(
                <IfRole name="admin" anyOf={['editor', 'moderator']}>
                    <Text>Content</Text>
                </IfRole>
            );

            expect(mockHasAnyRole).toHaveBeenCalledWith(['editor', 'moderator']);
            expect(mockHasRole).not.toHaveBeenCalled();
        });
    });
});

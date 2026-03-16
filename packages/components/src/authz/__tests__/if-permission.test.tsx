import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {Text} from 'react-native';
import {IfPermission} from '../IfPermission';

jest.mock('@yuhuu/auth', () => ({
    hasPermission: jest.fn(),
    hasAnyPermission: jest.fn(),
}));

import {hasPermission, hasAnyPermission} from '@yuhuu/auth';

const mockHasPermission = hasPermission as jest.MockedFunction<typeof hasPermission>;
const mockHasAnyPermission = hasAnyPermission as jest.MockedFunction<typeof hasAnyPermission>;

describe('IfPermission', () => {
    beforeEach(() => {
        mockHasPermission.mockReset();
        mockHasAnyPermission.mockReset();
    });

    describe('single permission (name prop)', () => {
        it('renders children when permission is granted', () => {
            mockHasPermission.mockReturnValue(true);

            render(
                <IfPermission name="read:users">
                    <Text>Allowed Content</Text>
                </IfPermission>
            );

            expect(screen.getByText('Allowed Content')).toBeTruthy();
            expect(mockHasPermission).toHaveBeenCalledWith('read:users');
        });

        it('does not render children when permission is denied', () => {
            mockHasPermission.mockReturnValue(false);

            render(
                <IfPermission name="write:users">
                    <Text>Secret Content</Text>
                </IfPermission>
            );

            expect(screen.queryByText('Secret Content')).toBeNull();
            expect(mockHasPermission).toHaveBeenCalledWith('write:users');
        });

        it('renders fallback when permission is denied', () => {
            mockHasPermission.mockReturnValue(false);

            render(
                <IfPermission name="delete:users" fallback={<Text>Access Denied</Text>}>
                    <Text>Delete Panel</Text>
                </IfPermission>
            );

            expect(screen.queryByText('Delete Panel')).toBeNull();
            expect(screen.getByText('Access Denied')).toBeTruthy();
        });

        it('does not render fallback when permission is granted', () => {
            mockHasPermission.mockReturnValue(true);

            render(
                <IfPermission name="read:users" fallback={<Text>No Access</Text>}>
                    <Text>User Data</Text>
                </IfPermission>
            );

            expect(screen.getByText('User Data')).toBeTruthy();
            expect(screen.queryByText('No Access')).toBeNull();
        });
    });

    describe('multiple permissions (anyOf prop)', () => {
        it('renders children when any permission matches', () => {
            mockHasAnyPermission.mockReturnValue(true);

            render(
                <IfPermission anyOf={['read:users', 'write:users']}>
                    <Text>User Panel</Text>
                </IfPermission>
            );

            expect(screen.getByText('User Panel')).toBeTruthy();
            expect(mockHasAnyPermission).toHaveBeenCalledWith(['read:users', 'write:users']);
        });

        it('does not render children when no permission matches', () => {
            mockHasAnyPermission.mockReturnValue(false);

            render(
                <IfPermission anyOf={['admin:all', 'super:admin']}>
                    <Text>Admin Panel</Text>
                </IfPermission>
            );

            expect(screen.queryByText('Admin Panel')).toBeNull();
        });

        it('renders fallback when no permission matches', () => {
            mockHasAnyPermission.mockReturnValue(false);

            render(
                <IfPermission anyOf={['admin:all']} fallback={<Text>Not Authorized</Text>}>
                    <Text>Admin Panel</Text>
                </IfPermission>
            );

            expect(screen.queryByText('Admin Panel')).toBeNull();
            expect(screen.getByText('Not Authorized')).toBeTruthy();
        });

        it('uses hasAnyPermission instead of hasPermission for anyOf', () => {
            mockHasAnyPermission.mockReturnValue(true);

            render(
                <IfPermission anyOf={['read:posts']}>
                    <Text>Posts</Text>
                </IfPermission>
            );

            expect(mockHasAnyPermission).toHaveBeenCalledTimes(1);
            expect(mockHasPermission).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('renders children when neither name nor anyOf is provided', () => {
            render(
                <IfPermission>
                    <Text>Default Content</Text>
                </IfPermission>
            );

            expect(screen.getByText('Default Content')).toBeTruthy();
            expect(mockHasPermission).not.toHaveBeenCalled();
            expect(mockHasAnyPermission).not.toHaveBeenCalled();
        });

        it('renders children when anyOf is an empty array', () => {
            render(
                <IfPermission anyOf={[]}>
                    <Text>Empty AnyOf Content</Text>
                </IfPermission>
            );

            expect(screen.getByText('Empty AnyOf Content')).toBeTruthy();
            expect(mockHasAnyPermission).not.toHaveBeenCalled();
        });

        it('uses fallback default of null when not provided', () => {
            mockHasPermission.mockReturnValue(false);

            const {toJSON} = render(
                <IfPermission name="secret">
                    <Text>Hidden</Text>
                </IfPermission>
            );

            expect(screen.queryByText('Hidden')).toBeNull();
            expect(toJSON()).toBeNull();
        });

        it('renders multiple children when permitted', () => {
            mockHasPermission.mockReturnValue(true);

            render(
                <IfPermission name="read:dashboard">
                    <Text>Widget 1</Text>
                    <Text>Widget 2</Text>
                </IfPermission>
            );

            expect(screen.getByText('Widget 1')).toBeTruthy();
            expect(screen.getByText('Widget 2')).toBeTruthy();
        });

        it('prefers anyOf over name when both are provided', () => {
            mockHasAnyPermission.mockReturnValue(true);

            render(
                <IfPermission name="read:users" anyOf={['write:users']}>
                    <Text>Content</Text>
                </IfPermission>
            );

            expect(mockHasAnyPermission).toHaveBeenCalledWith(['write:users']);
            expect(mockHasPermission).not.toHaveBeenCalled();
        });
    });
});

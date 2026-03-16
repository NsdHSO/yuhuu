import React from 'react';
import {render} from '@testing-library/react-native';
import {ProfileHeader} from '../profile-header';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({top: 0, bottom: 34, left: 0, right: 0}),
}));

describe('ProfileHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render with user name', () => {
            const {getByText} = render(
                <ProfileHeader
                    firstName="John"
                    lastName="Doe"
                    email="john@example.com"
                />
            );

            expect(getByText('John Doe')).toBeTruthy();
        });

        it('should render with email', () => {
            const {getByText} = render(
                <ProfileHeader
                    firstName="John"
                    lastName="Doe"
                    email="john@example.com"
                />
            );

            expect(getByText('john@example.com')).toBeTruthy();
        });

        it('should accept testID prop', () => {
            const {getByTestId} = render(
                <ProfileHeader
                    firstName="John"
                    lastName="Doe"
                    email="john@example.com"
                    testID="profile-header"
                />
            );

            expect(getByTestId('profile-header')).toBeTruthy();
        });
    });

    describe('Name Display', () => {
        it('should show first name only when last name is empty', () => {
            const {getByText} = render(
                <ProfileHeader
                    firstName="John"
                    lastName=""
                    email="john@example.com"
                />
            );

            expect(getByText('John')).toBeTruthy();
        });

        it('should show last name only when first name is empty', () => {
            const {getByText} = render(
                <ProfileHeader
                    firstName=""
                    lastName="Doe"
                    email="john@example.com"
                />
            );

            expect(getByText('Doe')).toBeTruthy();
        });

        it('should show placeholder when no name is provided', () => {
            const {getByText} = render(
                <ProfileHeader
                    firstName=""
                    lastName=""
                    email="john@example.com"
                />
            );

            expect(getByText('profile.noName')).toBeTruthy();
        });
    });

    describe('Avatar', () => {
        it('should show initials in avatar', () => {
            const {getByTestId} = render(
                <ProfileHeader
                    firstName="John"
                    lastName="Doe"
                    email="john@example.com"
                    testID="profile-header"
                />
            );

            expect(getByTestId('profile-header-avatar')).toBeTruthy();
        });

        it('should show first letter of email when no name', () => {
            const {getByText} = render(
                <ProfileHeader
                    firstName=""
                    lastName=""
                    email="john@example.com"
                    testID="profile-header"
                />
            );

            expect(getByText('J')).toBeTruthy();
        });
    });
});

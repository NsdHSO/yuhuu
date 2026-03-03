import {AuthNavigator} from '../../nav/nav';

// Mock expo-router
jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
    },
}));

describe('AuthNavigator', () => {
    let navigator: AuthNavigator;

    beforeEach(() => {
        navigator = new AuthNavigator();
    });

    describe('isAuthPath', () => {
        it('returns false in non-browser environment', () => {
            // In Node.js test env, window is undefined
            expect(navigator.isAuthPath()).toBe(false);
        });
    });

    describe('redirectToLogin', () => {
        it('does not throw', () => {
            expect(() => navigator.redirectToLogin()).not.toThrow();
        });
    });
});

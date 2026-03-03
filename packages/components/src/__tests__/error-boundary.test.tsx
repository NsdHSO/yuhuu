import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {ErrorBoundary} from '../error-boundary';
import {Text} from 'react-native';
import {initI18n} from '@/lib/i18n';

jest.mock('expo-localization', () => ({
    getLocales: jest.fn(() => [{languageCode: 'en'}]),
}));
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(() => Promise.resolve(null)),
    setItemAsync: jest.fn(() => Promise.resolve()),
}));

// Component that throws on demand
function ThrowingComponent({shouldThrow}: { shouldThrow: boolean }) {
    if (shouldThrow) {
        throw new Error('Test error message');
    }
    return <Text>Child content</Text>;
}

// Suppress console.error from ErrorBoundary.componentDidCatch during tests
const originalConsoleError = console.error;
beforeAll(async () => {
    console.error = jest.fn();
    await initI18n();
});
afterAll(() => {
    console.error = originalConsoleError;
});

describe('ErrorBoundary Component', () => {
    describe('Normal Rendering', () => {
        it('should render children when no error occurs', () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow={false}/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Child content')).toBeTruthy();
        });

        it('should not display fallback UI when no error occurs', () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow={false}/>
                </ErrorBoundary>
            );
            expect(screen.queryByText('Something went wrong')).toBeNull();
        });
    });

    describe('Error Catching', () => {
        it('should display default error UI when child throws', () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow={true}/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Something went wrong')).toBeTruthy();
        });

        it('should display the error message', () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow={true}/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Test error message')).toBeTruthy();
        });

        it('should display a fallback message when error has no message', () => {
            function ThrowEmptyError() {
                throw new Error();
            }

            render(
                <ErrorBoundary>
                    <ThrowEmptyError/>
                </ErrorBoundary>
            );
            expect(screen.getByText('An unexpected error occurred')).toBeTruthy();
        });

        it('should display "Tap to try again" reset link', () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow={true}/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Tap to try again')).toBeTruthy();
        });

        it('should call console.error with error details', () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow={true}/>
                </ErrorBoundary>
            );
            expect(console.error).toHaveBeenCalledWith(
                'ErrorBoundary caught an error:',
                expect.any(Error),
                expect.objectContaining({componentStack: expect.any(String)})
            );
        });
    });

    describe('Custom Fallback', () => {
        it('should render custom fallback when provided and error occurs', () => {
            const customFallback = <Text>Custom error page</Text>;
            render(
                <ErrorBoundary fallback={customFallback}>
                    <ThrowingComponent shouldThrow={true}/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Custom error page')).toBeTruthy();
            expect(screen.queryByText('Something went wrong')).toBeNull();
        });

        it('should not render custom fallback when no error occurs', () => {
            const customFallback = <Text>Custom error page</Text>;
            render(
                <ErrorBoundary fallback={customFallback}>
                    <ThrowingComponent shouldThrow={false}/>
                </ErrorBoundary>
            );
            expect(screen.queryByText('Custom error page')).toBeNull();
            expect(screen.getByText('Child content')).toBeTruthy();
        });
    });

    describe('getDerivedStateFromError', () => {
        it('should return hasError true and store the error', () => {
            const testError = new Error('Static method test');
            const result = ErrorBoundary.getDerivedStateFromError(testError);
            expect(result).toEqual({hasError: true, error: testError});
        });
    });

    describe('Reset Behavior', () => {
        it('should reset error state when "Tap to try again" is pressed', () => {
            const {rerender} = render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow={true}/>
                </ErrorBoundary>
            );

            expect(screen.getByText('Something went wrong')).toBeTruthy();

            // Re-render with non-throwing child before pressing reset
            rerender(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow={false}/>
                </ErrorBoundary>
            );

            fireEvent.press(screen.getByText('Tap to try again'));

            expect(screen.queryByText('Something went wrong')).toBeNull();
            expect(screen.getByText('Child content')).toBeTruthy();
        });
    });

    describe('Multiple Children', () => {
        it('should render multiple children when no error occurs', () => {
            render(
                <ErrorBoundary>
                    <Text>First child</Text>
                    <Text>Second child</Text>
                </ErrorBoundary>
            );
            expect(screen.getByText('First child')).toBeTruthy();
            expect(screen.getByText('Second child')).toBeTruthy();
        });

        it('should catch error and hide all children when one throws', () => {
            render(
                <ErrorBoundary>
                    <Text>Safe child</Text>
                    <ThrowingComponent shouldThrow={true}/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Something went wrong')).toBeTruthy();
            expect(screen.queryByText('Safe child')).toBeNull();
        });
    });
});

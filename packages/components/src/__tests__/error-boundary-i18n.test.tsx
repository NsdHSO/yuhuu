import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {Text} from 'react-native';
import i18n from '@/lib/i18n';
import {ErrorBoundary} from '../error-boundary';

jest.mock('expo-localization');
jest.mock('expo-secure-store');

function ThrowingComponent({shouldThrow}: { shouldThrow: boolean }) {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <Text>OK</Text>;
}

const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});
afterAll(() => {
    console.error = originalConsoleError;
});

describe('ErrorBoundary i18n', () => {
    beforeEach(async () => {
        const {initI18n} = require('@/lib/i18n');
        await initI18n();
    });

    afterEach(async () => {
        await i18n.changeLanguage('en');
    });

    describe('uses translation keys from errors.* namespace', () => {
        it('should use errors.boundaryTitle key for the error title', () => {
            const expected = i18n.t('errors.boundaryTitle');
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.getByText(expected)).toBeTruthy();
        });

        it('should use errors.boundaryDefault key when no error message is provided', () => {
            const expected = i18n.t('errors.boundaryDefault');

            function ThrowEmpty() {
                throw new Error();
            }

            render(
                <ErrorBoundary>
                    <ThrowEmpty/>
                </ErrorBoundary>
            );
            expect(screen.getByText(expected)).toBeTruthy();
        });

        it('should use errors.boundaryRetry key for the retry button', () => {
            const expected = i18n.t('errors.boundaryRetry');
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.getByText(expected)).toBeTruthy();
        });
    });

    describe('renders errors.boundaryTitle for error title', () => {
        it('should display "Something went wrong" in English', () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Something went wrong')).toBeTruthy();
        });

        it('should display Romanian title when locale is ro', async () => {
            await i18n.changeLanguage('ro');
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Ceva nu a funcționat')).toBeTruthy();
        });
    });

    describe('renders errors.boundaryDefault when no error message', () => {
        it('should display English fallback message', () => {
            function ThrowEmpty() {
                throw new Error();
            }

            render(
                <ErrorBoundary>
                    <ThrowEmpty/>
                </ErrorBoundary>
            );
            expect(screen.getByText('An unexpected error occurred')).toBeTruthy();
        });

        it('should display Romanian fallback message', async () => {
            await i18n.changeLanguage('ro');

            function ThrowEmpty() {
                throw new Error();
            }

            render(
                <ErrorBoundary>
                    <ThrowEmpty/>
                </ErrorBoundary>
            );
            expect(screen.getByText('A apărut o eroare neașteptată')).toBeTruthy();
        });
    });

    describe('renders error message when provided', () => {
        it('should display the actual error message instead of the default fallback', () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Test error')).toBeTruthy();
            expect(screen.queryByText('An unexpected error occurred')).toBeNull();
        });

        it('should display a custom error message', () => {
            function ThrowCustom() {
                throw new Error('Database connection failed');
            }

            render(
                <ErrorBoundary>
                    <ThrowCustom/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Database connection failed')).toBeTruthy();
        });
    });

    describe('renders errors.boundaryRetry for retry button', () => {
        it('should display English retry text', () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Tap to try again')).toBeTruthy();
        });

        it('should display Romanian retry text', async () => {
            await i18n.changeLanguage('ro');
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Atingeți pentru a încerca din nou')).toBeTruthy();
        });
    });

    describe('switches languages correctly', () => {
        it('should render Romanian translations after language change', async () => {
            await i18n.changeLanguage('ro');
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Ceva nu a funcționat')).toBeTruthy();
            expect(screen.getByText('Atingeți pentru a încerca din nou')).toBeTruthy();
        });

        it('should render English translations after switching back from Romanian', async () => {
            await i18n.changeLanguage('ro');
            await i18n.changeLanguage('en');
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Something went wrong')).toBeTruthy();
            expect(screen.getByText('Tap to try again')).toBeTruthy();
        });

        it('should fall back to English for unsupported language codes', async () => {
            await i18n.changeLanguage('fr');
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Something went wrong')).toBeTruthy();
        });
    });

    describe('no hardcoded English strings remain', () => {
        it('should not contain hardcoded English title when language is Romanian', async () => {
            await i18n.changeLanguage('ro');
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.queryByText('Something went wrong')).toBeNull();
        });

        it('should not contain hardcoded English fallback when language is Romanian', async () => {
            await i18n.changeLanguage('ro');

            function ThrowEmpty() {
                throw new Error();
            }

            render(
                <ErrorBoundary>
                    <ThrowEmpty/>
                </ErrorBoundary>
            );
            expect(screen.queryByText('An unexpected error occurred')).toBeNull();
        });

        it('should not contain hardcoded English retry text when language is Romanian', async () => {
            await i18n.changeLanguage('ro');
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow/>
                </ErrorBoundary>
            );
            expect(screen.queryByText('Tap to try again')).toBeNull();
        });

        it('should contain only Romanian strings when language is Romanian', async () => {
            await i18n.changeLanguage('ro');

            function ThrowEmpty() {
                throw new Error();
            }

            render(
                <ErrorBoundary>
                    <ThrowEmpty/>
                </ErrorBoundary>
            );
            expect(screen.getByText('Ceva nu a funcționat')).toBeTruthy();
            expect(screen.getByText('A apărut o eroare neașteptată')).toBeTruthy();
            expect(screen.getByText('Atingeți pentru a încerca din nou')).toBeTruthy();
        });
    });
});

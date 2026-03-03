import React from 'react';
import {render} from '@testing-library/react-native';
import ModalScreen from '../modal';

/**
 * TDD tests for Modal Screen i18n Migration
 *
 * Verifies that all hardcoded strings in modal.tsx are replaced
 * with translation keys via useTranslation().
 *
 * Translation keys expected:
 * modal.title  -> "This is a modal"
 * modal.goHome -> "Go to home screen"
 */

// --- Mock react-i18next ---
const mockT = jest.fn((key: string) => key);
const mockUseTranslation = jest.fn(() => ({
    t: mockT,
    i18n: {language: 'en', changeLanguage: jest.fn()},
}));

jest.mock('react-i18next', () => ({
    useTranslation: (...args: any[]) => mockUseTranslation(...args),
}));

// --- Mock expo-router ---
jest.mock('expo-router', () => ({
    Link: ({children, ...props}: any) => {
        const {Text} = require('react-native');
        return <Text {...props}>{children}</Text>;
    },
}));

describe('ModalScreen - i18n Migration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useTranslation hook integration', () => {
        it('should call useTranslation', () => {
            render(<ModalScreen/>);
            expect(mockUseTranslation).toHaveBeenCalled();
        });
    });

    describe('Modal title', () => {
        it('should use t() for title instead of hardcoded "This is a modal"', () => {
            render(<ModalScreen/>);
            expect(mockT).toHaveBeenCalledWith('modal.title');
        });
    });

    describe('Home link', () => {
        it('should use t() for link text instead of hardcoded "Go to home screen"', () => {
            render(<ModalScreen/>);
            expect(mockT).toHaveBeenCalledWith('modal.goHome');
        });
    });

    describe('No hardcoded user-facing strings remain', () => {
        it('should not contain any original hardcoded English strings', () => {
            mockT.mockImplementation((key: string) => `__${key}__`);

            const {queryByText} = render(<ModalScreen/>);

            const hardcodedStrings = [
                'This is a modal',
                'Go to home screen',
            ];

            for (const str of hardcodedStrings) {
                expect(queryByText(str)).toBeNull();
            }
        });
    });
});

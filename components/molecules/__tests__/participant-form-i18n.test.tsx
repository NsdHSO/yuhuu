import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ParticipantForm } from '../participant-form';

/**
 * TDD tests for ParticipantForm i18n migration.
 *
 * Strings to migrate:
 * "Username"         -> common.usernamePlaceholder
 * "Notes (optional)" -> common.notesPlaceholder
 * "Adding..."        -> common.adding
 * "Add Participant"  -> common.addParticipant
 * "Required"         -> common.required
 * "Please enter a username." -> common.usernameRequired
 */

jest.spyOn(Alert, 'alert');

const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: { language: 'en', changeLanguage: jest.fn() },
    }),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

describe('ParticipantForm - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("common.usernamePlaceholder") for username placeholder', () => {
        render(<ParticipantForm onSubmit={jest.fn()} isSubmitting={false} />);
        expect(mockT).toHaveBeenCalledWith('common.usernamePlaceholder');
    });

    it('should use t("common.notesPlaceholder") for notes placeholder', () => {
        render(<ParticipantForm onSubmit={jest.fn()} isSubmitting={false} />);
        expect(mockT).toHaveBeenCalledWith('common.notesPlaceholder');
    });

    it('should use t("common.addParticipant") for button text when not submitting', () => {
        render(<ParticipantForm onSubmit={jest.fn()} isSubmitting={false} />);
        expect(mockT).toHaveBeenCalledWith('common.addParticipant');
    });

    it('should use t("common.adding") for button text when submitting', () => {
        render(<ParticipantForm onSubmit={jest.fn()} isSubmitting={true} />);
        expect(mockT).toHaveBeenCalledWith('common.adding');
    });

    it('should use t() for validation alert when username is empty', () => {
        const { getByText } = render(
            <ParticipantForm onSubmit={jest.fn()} isSubmitting={false} />
        );

        fireEvent.press(getByText('common.addParticipant'));

        expect(mockT).toHaveBeenCalledWith('common.required');
        expect(mockT).toHaveBeenCalledWith('common.usernameRequired');
    });

    it('should not contain any hardcoded English strings', () => {
        mockT.mockImplementation((key: string) => `__${key}__`);
        const { queryByText } = render(
            <ParticipantForm onSubmit={jest.fn()} isSubmitting={false} />
        );

        const hardcodedStrings = [
            'Username',
            'Notes (optional)',
            'Add Participant',
            'Adding\u2026',
        ];

        for (const str of hardcodedStrings) {
            expect(queryByText(str)).toBeNull();
        }
    });
});

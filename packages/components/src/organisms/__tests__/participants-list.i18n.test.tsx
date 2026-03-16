import React from 'react';
import {render} from '@testing-library/react-native';
import {ParticipantsList} from '../participants-list';

const mockT = jest.fn((key: string, opts?: Record<string, unknown>) => {
    if (opts && opts.count !== undefined) return `__${key}__${opts.count}`;
    return `__${key}__`;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({t: mockT, i18n: {language: 'en', changeLanguage: jest.fn()}}),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

const makeParticipant = (overrides: Partial<{
    id: number;
    dinnerId: number;
    username: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
}> = {}) => ({
    id: 1,
    dinnerId: 1,
    username: 'john',
    notes: '',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
});

describe('ParticipantsList - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("admin.noParticipantsFound") for empty state', () => {
        render(<ParticipantsList participants={[]}/>);
        expect(mockT).toHaveBeenCalledWith('admin.noParticipantsFound');
    });

    it('should use t("admin.usernameLabel") for username labels', () => {
        render(<ParticipantsList participants={[makeParticipant()]}/>);
        expect(mockT).toHaveBeenCalledWith('admin.usernameLabel');
    });

    it('should use t("admin.notesLabel") for notes labels', () => {
        render(<ParticipantsList participants={[makeParticipant({notes: 'Some note'})]}/>);
        expect(mockT).toHaveBeenCalledWith('admin.notesLabel');
    });

    it('should use t("admin.addedLabel") for added date labels', () => {
        render(<ParticipantsList participants={[makeParticipant()]}/>);
        expect(mockT).toHaveBeenCalledWith('admin.addedLabel');
    });

    it('should use t("admin.participantCount") for total count', () => {
        render(<ParticipantsList participants={[makeParticipant()]}/>);
        expect(mockT).toHaveBeenCalledWith('admin.participantCount', {count: 1});
    });

    it('should pass correct count for multiple participants', () => {
        const participants = [
            makeParticipant({id: 1, username: 'john'}),
            makeParticipant({id: 2, username: 'jane'}),
            makeParticipant({id: 3, username: 'bob'}),
        ];
        render(<ParticipantsList participants={participants}/>);
        expect(mockT).toHaveBeenCalledWith('admin.participantCount', {count: 3});
    });

    it('should not contain hardcoded English strings', () => {
        const participants = [makeParticipant({notes: 'A note'})];
        const {queryByText} = render(<ParticipantsList participants={participants}/>);
        expect(queryByText('Username:')).toBeNull();
        expect(queryByText('Notes:')).toBeNull();
        expect(queryByText('Added:')).toBeNull();
        expect(queryByText(/Total: \d+ participant/)).toBeNull();
    });
});

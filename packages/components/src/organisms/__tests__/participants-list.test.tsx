import React from 'react';
import {render} from '@testing-library/react-native';
import {ParticipantsList} from '../participants-list';

const mockT = jest.fn((key: string, opts?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
        'admin.noParticipantsFound': 'No participants found',
        'admin.usernameLabel': 'Username:',
        'admin.notesLabel': 'Notes:',
        'admin.addedLabel': 'Added:',
        'admin.participantCount': `Total: ${opts?.count ?? 0}`,
    };
    return translations[key] ?? key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: jest.fn(() => 'light'),
}));

const sampleParticipants = [
    {
        id: 1,
        dinnerId: 10,
        username: 'alice',
        notes: 'Vegetarian',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
    },
    {
        id: 2,
        dinnerId: 10,
        username: 'bob',
        notes: '',
        createdAt: '2026-01-16T12:00:00Z',
        updatedAt: '2026-01-16T12:00:00Z',
    },
];

describe('ParticipantsList (organisms)', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should render empty state when participants array is empty', () => {
        const {getByText} = render(
            <ParticipantsList participants={[]} testID="participants-list"/>
        );
        expect(getByText('No participants found')).toBeTruthy();
    });

    it('should support testID prop on empty state', () => {
        const {getByTestId} = render(
            <ParticipantsList participants={[]} testID="custom-id"/>
        );
        expect(getByTestId('custom-id')).toBeTruthy();
    });

    it('should render participant cards when participants are provided', () => {
        const {getByTestId} = render(
            <ParticipantsList participants={sampleParticipants} testID="participants-list"/>
        );
        expect(getByTestId('participant-item-0')).toBeTruthy();
        expect(getByTestId('participant-item-1')).toBeTruthy();
    });

    it('should support testID prop on list container', () => {
        const {getByTestId} = render(
            <ParticipantsList participants={sampleParticipants} testID="my-list"/>
        );
        expect(getByTestId('my-list')).toBeTruthy();
    });

    it('should display participant usernames', () => {
        const {getByText} = render(
            <ParticipantsList participants={sampleParticipants} testID="participants-list"/>
        );
        expect(getByText('alice')).toBeTruthy();
        expect(getByText('bob')).toBeTruthy();
    });

    it('should display notes when present', () => {
        const {getByText} = render(
            <ParticipantsList participants={sampleParticipants} testID="participants-list"/>
        );
        expect(getByText('Vegetarian')).toBeTruthy();
    });

    it('should not display notes row when notes are empty', () => {
        const participantWithoutNotes = [
            {
                id: 3,
                dinnerId: 10,
                username: 'charlie',
                notes: '',
                createdAt: '2026-01-17T10:00:00Z',
                updatedAt: '2026-01-17T10:00:00Z',
            },
        ];
        const {queryByTestId} = render(
            <ParticipantsList participants={participantWithoutNotes} testID="participants-list"/>
        );
        expect(queryByTestId('participant-item-0')).toBeTruthy();
    });

    it('should display participant count', () => {
        render(
            <ParticipantsList participants={sampleParticipants} testID="participants-list"/>
        );
        expect(mockT).toHaveBeenCalledWith('admin.participantCount', {count: 2});
    });

    it('should display formatted dates', () => {
        const {getByText} = render(
            <ParticipantsList participants={sampleParticipants} testID="participants-list"/>
        );
        const date1 = new Date('2026-01-15T10:00:00Z').toLocaleDateString();
        const date2 = new Date('2026-01-16T12:00:00Z').toLocaleDateString();
        expect(getByText(date1)).toBeTruthy();
        expect(getByText(date2)).toBeTruthy();
    });

    it('should call translation functions with correct keys', () => {
        render(
            <ParticipantsList participants={sampleParticipants} testID="participants-list"/>
        );
        expect(mockT).toHaveBeenCalledWith('admin.usernameLabel');
        expect(mockT).toHaveBeenCalledWith('admin.addedLabel');
        expect(mockT).toHaveBeenCalledWith('admin.participantCount', {count: 2});
    });

    it('should render with light theme (default mock)', () => {
        const {getByTestId} = render(
            <ParticipantsList participants={sampleParticipants} testID="participants-list"/>
        );
        const card = getByTestId('participant-item-0');
        const flatStyle = Array.isArray(card.props.style)
            ? Object.assign({}, ...card.props.style)
            : card.props.style;
        expect(flatStyle.backgroundColor).toBe('#F3F4F6');
    });
});

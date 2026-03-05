import React from 'react';
import {Alert} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {MilestonesAccordion} from '../milestones-accordion';

const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

const mockDeleteMutate = jest.fn();
const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();

jest.mock('@/features/milestones/api', () => ({
    useMyMilestonesQuery: jest.fn(() => ({
        data: [
            {
                id: 1,
                user_id: 10,
                milestone_type: 'baptism',
                milestone_date: '2020-06-15',
                location: 'First Baptist Church',
                officiant: 'Pastor Smith',
                notes: 'A blessed day',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
        ],
        isLoading: false,
    })),
    useUserMilestonesQuery: jest.fn(() => ({
        data: [],
        isLoading: false,
    })),
    useDeleteMyMilestoneMutation: jest.fn(() => ({
        mutate: mockDeleteMutate,
        isPending: false,
    })),
    useCreateMyMilestoneMutation: jest.fn(() => ({
        mutate: mockCreateMutate,
        isPending: false,
    })),
    useUpdateMyMilestoneMutation: jest.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    })),
    useCreateUserMilestoneMutation: jest.fn(() => ({
        mutate: mockCreateMutate,
        isPending: false,
    })),
    useUpdateUserMilestoneMutation: jest.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    })),
    useDeleteUserMilestoneMutation: jest.fn(() => ({
        mutate: mockDeleteMutate,
        isPending: false,
    })),
}));

jest.mock('@/lib/dates', () => ({
    formatDateForDisplay: jest.fn((date: string) => date),
}));

jest.spyOn(Alert, 'alert');

function renderWithQueryClient(ui: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
    });
    return render(
        <QueryClientProvider client={queryClient}>
            {ui}
        </QueryClientProvider>
    );
}

describe('MilestonesAccordion - Create/Edit Forms', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockT.mockImplementation((key: string) => key);
    });

    describe('Add Button', () => {
        it('should render add button when accordion is expanded', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<MilestonesAccordion />);
            fireEvent.press(getByTestId('milestones-accordion-header'));
            expect(getByText('milestones.addButton')).toBeTruthy();
        });
    });

    describe('Create Form', () => {
        it('should show create form when add button clicked', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<MilestonesAccordion />);
            fireEvent.press(getByTestId('milestones-accordion-header'));
            fireEvent.press(getByText('milestones.addButton'));
            expect(getByTestId('milestone-form')).toBeTruthy();
        });

        it('should call create mutation with correct data', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<MilestonesAccordion />);
            fireEvent.press(getByTestId('milestones-accordion-header'));
            fireEvent.press(getByText('milestones.addButton'));
            // Default milestone type is 'conversion' (first in list)
            fireEvent.changeText(getByTestId('milestone-location-input'), 'My Church');
            fireEvent.press(getByTestId('milestone-form-submit'));
            expect(mockCreateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    milestone_type: 'conversion',
                    location: 'My Church',
                }),
                expect.any(Object),
            );
        });

        it('should validate that existing milestone type triggers duplicate warning', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<MilestonesAccordion />);
            fireEvent.press(getByTestId('milestones-accordion-header'));
            fireEvent.press(getByText('milestones.addButton'));
            // Select 'baptism' which already exists
            fireEvent.press(getByText('milestones.milestoneTypes.baptism'));
            fireEvent.press(getByTestId('milestone-form-submit'));
            expect(Alert.alert).toHaveBeenCalledWith(
                'common.error',
                'milestones.duplicateError',
            );
            expect(mockCreateMutate).not.toHaveBeenCalled();
        });
    });

    describe('Edit Form', () => {
        it('should show edit button next to delete button', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<MilestonesAccordion />);
            fireEvent.press(getByTestId('milestones-accordion-header'));
            expect(getAllByText('common.edit').length).toBeGreaterThan(0);
        });

        it('should show edit form with pre-filled data', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<MilestonesAccordion />);
            fireEvent.press(getByTestId('milestones-accordion-header'));
            fireEvent.press(getAllByText('common.edit')[0]);
            const locationInput = getByTestId('milestone-location-input');
            expect(locationInput.props.value).toBe('First Baptist Church');
        });

        it('should call update mutation with correct data', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<MilestonesAccordion />);
            fireEvent.press(getByTestId('milestones-accordion-header'));
            fireEvent.press(getAllByText('common.edit')[0]);
            fireEvent.changeText(getByTestId('milestone-location-input'), 'New Church');
            fireEvent.press(getByTestId('milestone-form-submit'));
            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    data: expect.objectContaining({location: 'New Church'}),
                }),
                expect.any(Object),
            );
        });
    });

    describe('Cancel', () => {
        it('should cancel create form and return to view mode', () => {
            const {getByTestId, getByText, queryByTestId} = renderWithQueryClient(<MilestonesAccordion />);
            fireEvent.press(getByTestId('milestones-accordion-header'));
            fireEvent.press(getByText('milestones.addButton'));
            expect(getByTestId('milestone-form')).toBeTruthy();
            fireEvent.press(getByTestId('milestone-form-cancel'));
            expect(queryByTestId('milestone-form')).toBeNull();
            expect(getByText('milestones.addButton')).toBeTruthy();
        });
    });
});

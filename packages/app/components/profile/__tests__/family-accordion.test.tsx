import React from 'react';
import {Alert} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {FamilyAccordion} from '../family-accordion';

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

jest.mock('@/features/family/api', () => ({
    useMyFamilyQuery: jest.fn(() => ({
        data: [
            {
                id: 1,
                user_id: 10,
                relationship_type: 'spouse',
                related_person_name: 'Jane Doe',
                related_person_phone: '555-1234',
                related_person_email: 'jane@example.com',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
        ],
        isLoading: false,
    })),
    useUserFamilyQuery: jest.fn(() => ({
        data: [],
        isLoading: false,
    })),
    useDeleteMyFamilyRelationshipMutation: jest.fn(() => ({
        mutate: mockDeleteMutate,
        isPending: false,
    })),
    useCreateMyFamilyRelationshipMutation: jest.fn(() => ({
        mutate: mockCreateMutate,
        isPending: false,
    })),
    useUpdateMyFamilyRelationshipMutation: jest.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    })),
    useCreateUserFamilyRelationshipMutation: jest.fn(() => ({
        mutate: mockCreateMutate,
        isPending: false,
    })),
    useUpdateUserFamilyRelationshipMutation: jest.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    })),
    useDeleteUserFamilyRelationshipMutation: jest.fn(() => ({
        mutate: mockDeleteMutate,
        isPending: false,
    })),
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

describe('FamilyAccordion - Create/Edit Forms', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockT.mockImplementation((key: string) => key);
    });

    describe('Add Button', () => {
        it('should render add button when accordion is expanded', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<FamilyAccordion />);
            fireEvent.press(getByTestId('family-accordion-header'));
            expect(getByText('family.addButton')).toBeTruthy();
        });

        it('should render add button in admin mode', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<FamilyAccordion userId={5} />);
            fireEvent.press(getByTestId('family-accordion-header'));
            expect(getByText('family.addButton')).toBeTruthy();
        });
    });

    describe('Create Form', () => {
        it('should show create form when add button clicked', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<FamilyAccordion />);
            fireEvent.press(getByTestId('family-accordion-header'));
            fireEvent.press(getByText('family.addButton'));
            expect(getByTestId('family-form')).toBeTruthy();
        });

        it('should validate required name before submission', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<FamilyAccordion />);
            fireEvent.press(getByTestId('family-accordion-header'));
            fireEvent.press(getByText('family.addButton'));
            fireEvent.press(getByTestId('family-form-submit'));
            expect(Alert.alert).toHaveBeenCalledWith(
                'common.error',
                'family.errors.nameRequired',
            );
            expect(mockCreateMutate).not.toHaveBeenCalled();
        });

        it('should validate email format if provided', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<FamilyAccordion />);
            fireEvent.press(getByTestId('family-accordion-header'));
            fireEvent.press(getByText('family.addButton'));
            fireEvent.changeText(getByTestId('family-name-input'), 'John');
            fireEvent.changeText(getByTestId('family-email-input'), 'invalid-email');
            fireEvent.press(getByTestId('family-form-submit'));
            expect(Alert.alert).toHaveBeenCalledWith(
                'common.error',
                'family.errors.invalidEmail',
            );
            expect(mockCreateMutate).not.toHaveBeenCalled();
        });

        it('should call create mutation with correct data', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<FamilyAccordion />);
            fireEvent.press(getByTestId('family-accordion-header'));
            fireEvent.press(getByText('family.addButton'));
            fireEvent.changeText(getByTestId('family-name-input'), 'John Doe');
            fireEvent.press(getByTestId('family-form-submit'));
            expect(mockCreateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    related_person_name: 'John Doe',
                    relationship_type: 'spouse',
                }),
                expect.any(Object),
            );
        });
    });

    describe('Edit Form', () => {
        it('should show edit button next to delete button', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<FamilyAccordion />);
            fireEvent.press(getByTestId('family-accordion-header'));
            expect(getAllByText('common.edit').length).toBeGreaterThan(0);
        });

        it('should show edit form with pre-filled data when edit button clicked', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<FamilyAccordion />);
            fireEvent.press(getByTestId('family-accordion-header'));
            fireEvent.press(getAllByText('common.edit')[0]);
            const nameInput = getByTestId('family-name-input');
            expect(nameInput.props.value).toBe('Jane Doe');
        });

        it('should call update mutation with correct data', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<FamilyAccordion />);
            fireEvent.press(getByTestId('family-accordion-header'));
            fireEvent.press(getAllByText('common.edit')[0]);
            fireEvent.changeText(getByTestId('family-name-input'), 'Janet Doe');
            fireEvent.press(getByTestId('family-form-submit'));
            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    data: expect.objectContaining({related_person_name: 'Janet Doe'}),
                }),
                expect.any(Object),
            );
        });
    });

    describe('Cancel', () => {
        it('should cancel create form and return to view mode', () => {
            const {getByTestId, getByText, queryByTestId} = renderWithQueryClient(<FamilyAccordion />);
            fireEvent.press(getByTestId('family-accordion-header'));
            fireEvent.press(getByText('family.addButton'));
            expect(getByTestId('family-form')).toBeTruthy();
            fireEvent.press(getByTestId('family-form-cancel'));
            expect(queryByTestId('family-form')).toBeNull();
            expect(getByText('family.addButton')).toBeTruthy();
        });
    });
});

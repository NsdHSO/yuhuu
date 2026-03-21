import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {DinnerForm} from '../dinner-form';
import {Alert} from 'react-native';

// Mock dependencies
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
    __esModule: true,
    default: {
        OS: 'ios',
        select: (obj: any) => obj.ios || obj.default,
    },
}));

jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
    useColorScheme: jest.fn(),
}));

jest.mock('../../hooks/useGlowVariant', () => ({
    useGlowVariant: jest.fn(),
    getGlowColor: jest.fn(() => '#A78BFA'),
}));

jest.mock('@yuhuu/i18n', () => ({
    useTranslation: jest.fn(),
}));

import {useColorScheme} from 'react-native';
import {useGlowVariant} from '../../hooks/useGlowVariant';
import {useTranslation} from '@yuhuu/i18n';

describe('DinnerForm', () => {
    const mockOnSubmit = jest.fn();
    const mockOnCancel = jest.fn();
    const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;
    const mockUseGlowVariant = useGlowVariant as jest.MockedFunction<typeof useGlowVariant>;
    const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseColorScheme.mockReturnValue('light');
        mockUseGlowVariant.mockReturnValue({glowVariant: 'vibrant'});
        mockUseTranslation.mockReturnValue({
            t: (key: string) => key,
            i18n: {} as any,
        });
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should render all input fields', () => {
        const {getByPlaceholderText} = render(
            <DinnerForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
        );

        expect(getByPlaceholderText('supper.dinnerDatePlaceholder')).toBeTruthy();
        expect(getByPlaceholderText('supper.mealTypePlaceholder')).toBeTruthy();
        expect(getByPlaceholderText('supper.descriptionPlaceholder')).toBeTruthy();
        expect(getByPlaceholderText('supper.locationPlaceholder')).toBeTruthy();
        expect(getByPlaceholderText('supper.maxParticipantsPlaceholder')).toBeTruthy();
    });

    it('should call onSubmit with valid data', async () => {
        const {getByPlaceholderText, getByText} = render(
            <DinnerForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
        );

        fireEvent.changeText(getByPlaceholderText('supper.dinnerDatePlaceholder'), '2026-03-25');
        fireEvent.changeText(getByPlaceholderText('supper.mealTypePlaceholder'), 'Dinner');
        fireEvent.changeText(
            getByPlaceholderText('supper.descriptionPlaceholder'),
            'Easter Fellowship'
        );
        fireEvent.changeText(getByPlaceholderText('supper.locationPlaceholder'), 'Hall');
        fireEvent.changeText(getByPlaceholderText('supper.maxParticipantsPlaceholder'), '50');

        fireEvent.press(getByText('supper.createDinner'));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                dinner_date: '2026-03-25',
                meal_type: 'Dinner',
                description: 'Easter Fellowship',
                location: 'Hall',
                max_participants: 50,
            });
        });
    });

    it('should show alert when dinner_date is missing', async () => {
        const {getByPlaceholderText, getByText} = render(
            <DinnerForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
        );

        fireEvent.changeText(getByPlaceholderText('supper.mealTypePlaceholder'), 'Lunch');
        fireEvent.press(getByText('supper.createDinner'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'common.error',
                'supper.dinnerDateRequired'
            );
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    it('should show alert when meal_type is missing', async () => {
        const {getByPlaceholderText, getByText} = render(
            <DinnerForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
        );

        fireEvent.changeText(getByPlaceholderText('supper.dinnerDatePlaceholder'), '2026-04-01');
        fireEvent.press(getByText('supper.createDinner'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('common.error', 'supper.mealTypeRequired');
            expect(mockOnSubmit).not.toHaveBeenCalled();
        });
    });

    it('should call onCancel when cancel button pressed', () => {
        const {getByText} = render(
            <DinnerForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
        );

        fireEvent.press(getByText('common.cancel'));

        expect(mockOnCancel).toHaveBeenCalled();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should disable inputs when submitting', () => {
        const {getByPlaceholderText, getByText} = render(
            <DinnerForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={true} />
        );

        const dinnerDateInput = getByPlaceholderText('supper.dinnerDatePlaceholder');
        const createButton = getByText('common.creating');

        expect(dinnerDateInput.props.editable).toBe(false);
        expect(createButton).toBeTruthy();
    });

    it('should only include optional fields if provided', async () => {
        const {getByPlaceholderText, getByText} = render(
            <DinnerForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
        );

        // Only fill required fields
        fireEvent.changeText(getByPlaceholderText('supper.dinnerDatePlaceholder'), '2026-05-01');
        fireEvent.changeText(getByPlaceholderText('supper.mealTypePlaceholder'), 'Breakfast');

        fireEvent.press(getByText('supper.createDinner'));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                dinner_date: '2026-05-01',
                meal_type: 'Breakfast',
            });
        });
    });

    it('should parse max_participants to number', async () => {
        const {getByPlaceholderText, getByText} = render(
            <DinnerForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isSubmitting={false} />
        );

        fireEvent.changeText(getByPlaceholderText('supper.dinnerDatePlaceholder'), '2026-06-01');
        fireEvent.changeText(getByPlaceholderText('supper.mealTypePlaceholder'), 'Lunch');
        fireEvent.changeText(getByPlaceholderText('supper.maxParticipantsPlaceholder'), '100');

        fireEvent.press(getByText('supper.createDinner'));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({
                dinner_date: '2026-06-01',
                meal_type: 'Lunch',
                max_participants: 100,
            });
        });
    });
});

import {renderHook, act} from '@testing-library/react-native';
import {Alert} from 'react-native';
import {useAccordionCRUD} from '../useAccordionCRUD';

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('useAccordionCRUD', () => {
    const mockOnCancel = jest.fn();
    const mockDeleteMutation = {
        mutate: jest.fn(),
        isPending: false,
    };
    const mockCreateMutation = {
        mutate: jest.fn(),
        isPending: false,
    };
    const mockUpdateMutation = {
        mutate: jest.fn(),
        isPending: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('confirms deletion with Alert', () => {
        const {result} = renderHook(() =>
            useAccordionCRUD({
                deleteMutation: mockDeleteMutation,
                createMutation: mockCreateMutation,
                updateMutation: mockUpdateMutation,
                onCancel: mockOnCancel,
                messages: {
                    deleteTitle: 'Delete Item',
                    deleteMessage: 'Delete {{name}}?',
                    deleteSuccess: 'Deleted successfully',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    error: 'Error',
                    success: 'Success',
                },
            })
        );

        act(() => {
            result.current.handleDelete(42, 'Test Item');
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Delete Item',
            'Delete Test Item?',
            expect.arrayContaining([
                expect.objectContaining({text: 'Cancel'}),
                expect.objectContaining({text: 'Delete'}),
            ])
        );
    });

    test('calls delete mutation when confirmed', () => {
        (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
            // Simulate pressing the delete button
            const deleteButton = buttons?.find((b: any) => b.text === 'Delete');
            deleteButton?.onPress();
        });

        const {result} = renderHook(() =>
            useAccordionCRUD({
                deleteMutation: mockDeleteMutation,
                createMutation: mockCreateMutation,
                updateMutation: mockUpdateMutation,
                onCancel: mockOnCancel,
                messages: {
                    deleteTitle: 'Delete',
                    deleteMessage: 'Delete {{name}}?',
                    deleteSuccess: 'Deleted',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    error: 'Error',
                    success: 'Success',
                },
            })
        );

        act(() => {
            result.current.handleDelete(42, 'Test');
        });

        expect(mockDeleteMutation.mutate).toHaveBeenCalledWith(
            42,
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            })
        );
    });

    test('calls onCancel when handleCancel is invoked', () => {
        const {result} = renderHook(() =>
            useAccordionCRUD({
                deleteMutation: mockDeleteMutation,
                createMutation: mockCreateMutation,
                updateMutation: mockUpdateMutation,
                onCancel: mockOnCancel,
                messages: {
                    deleteTitle: 'Delete',
                    deleteMessage: 'Delete {{name}}?',
                    deleteSuccess: 'Deleted',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    error: 'Error',
                    success: 'Success',
                },
            })
        );

        act(() => {
            result.current.handleCancel();
        });

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test('returns loading state from mutations', () => {
        const {result, rerender} = renderHook(
            ({createPending}) =>
                useAccordionCRUD({
                    deleteMutation: mockDeleteMutation,
                    createMutation: {...mockCreateMutation, isPending: createPending},
                    updateMutation: mockUpdateMutation,
                    onCancel: mockOnCancel,
                    messages: {
                        deleteTitle: 'Delete',
                        deleteMessage: 'Delete {{name}}?',
                        deleteSuccess: 'Deleted',
                        cancel: 'Cancel',
                        delete: 'Delete',
                        error: 'Error',
                        success: 'Success',
                    },
                }),
            {initialProps: {createPending: false}}
        );

        expect(result.current.isSubmitting).toBe(false);

        rerender({createPending: true});

        expect(result.current.isSubmitting).toBe(true);
    });

    test('validates required fields before submit', () => {
        const mockValidate = jest.fn(() => 'Name is required');

        const {result} = renderHook(() =>
            useAccordionCRUD({
                deleteMutation: mockDeleteMutation,
                createMutation: mockCreateMutation,
                updateMutation: mockUpdateMutation,
                onCancel: mockOnCancel,
                validate: mockValidate,
                messages: {
                    deleteTitle: 'Delete',
                    deleteMessage: 'Delete {{name}}?',
                    deleteSuccess: 'Deleted',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    error: 'Error',
                    success: 'Success',
                },
            })
        );

        act(() => {
            result.current.handleSubmit('create', null, {name: ''});
        });

        expect(mockValidate).toHaveBeenCalledWith({name: ''});
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Name is required');
        expect(mockCreateMutation.mutate).not.toHaveBeenCalled();
    });

    test('calls create mutation when mode is create', () => {
        const {result} = renderHook(() =>
            useAccordionCRUD({
                deleteMutation: mockDeleteMutation,
                createMutation: mockCreateMutation,
                updateMutation: mockUpdateMutation,
                onCancel: mockOnCancel,
                messages: {
                    deleteTitle: 'Delete',
                    deleteMessage: 'Delete {{name}}?',
                    deleteSuccess: 'Deleted',
                    createSuccess: 'Created successfully',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    error: 'Error',
                    success: 'Success',
                },
            })
        );

        const formData = {name: 'New Item'};

        act(() => {
            result.current.handleSubmit('create', null, formData);
        });

        expect(mockCreateMutation.mutate).toHaveBeenCalledWith(
            formData,
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            })
        );
    });

    test('calls update mutation when mode is edit', () => {
        const {result} = renderHook(() =>
            useAccordionCRUD({
                deleteMutation: mockDeleteMutation,
                createMutation: mockCreateMutation,
                updateMutation: mockUpdateMutation,
                onCancel: mockOnCancel,
                messages: {
                    deleteTitle: 'Delete',
                    deleteMessage: 'Delete {{name}}?',
                    deleteSuccess: 'Deleted',
                    updateSuccess: 'Updated successfully',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    error: 'Error',
                    success: 'Success',
                },
            })
        );

        const formData = {name: 'Updated Item'};

        act(() => {
            result.current.handleSubmit('edit', 42, formData);
        });

        expect(mockUpdateMutation.mutate).toHaveBeenCalledWith(
            {id: 42, data: formData},
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            })
        );
    });
});

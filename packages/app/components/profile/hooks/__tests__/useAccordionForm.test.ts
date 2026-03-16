import {renderHook, act} from '@testing-library/react-native';
import {useAccordionForm} from '../useAccordionForm';

describe('useAccordionForm', () => {
    const initialData = {
        name: '',
        email: '',
    };

    test('initializes with view mode', () => {
        const {result} = renderHook(() => useAccordionForm(initialData));

        expect(result.current.mode).toBe('view');
        expect(result.current.editingId).toBeNull();
        expect(result.current.formData).toEqual(initialData);
    });

    test('transitions to create mode', () => {
        const {result} = renderHook(() => useAccordionForm(initialData));

        act(() => {
            result.current.startCreate();
        });

        expect(result.current.mode).toBe('create');
        expect(result.current.editingId).toBeNull();
        expect(result.current.formData).toEqual(initialData);
    });

    test('transitions to edit mode with data', () => {
        const {result} = renderHook(() => useAccordionForm(initialData));
        const editData = {name: 'John Doe', email: 'john@example.com'};

        act(() => {
            result.current.startEdit(42, editData);
        });

        expect(result.current.mode).toBe('edit');
        expect(result.current.editingId).toBe(42);
        expect(result.current.formData).toEqual(editData);
    });

    test('updates form data', () => {
        const {result} = renderHook(() => useAccordionForm(initialData));

        act(() => {
            result.current.setFormData({name: 'Jane', email: 'jane@test.com'});
        });

        expect(result.current.formData).toEqual({name: 'Jane', email: 'jane@test.com'});
    });

    test('cancels and resets to view mode', () => {
        const {result} = renderHook(() => useAccordionForm(initialData));

        act(() => {
            result.current.startEdit(99, {name: 'Test', email: 'test@test.com'});
        });

        expect(result.current.mode).toBe('edit');
        expect(result.current.editingId).toBe(99);

        act(() => {
            result.current.cancel();
        });

        expect(result.current.mode).toBe('view');
        expect(result.current.editingId).toBeNull();
        expect(result.current.formData).toEqual(initialData);
    });

    test('resets form to initial data', () => {
        const {result} = renderHook(() => useAccordionForm(initialData));

        act(() => {
            result.current.setFormData({name: 'Changed', email: 'changed@test.com'});
        });

        expect(result.current.formData).not.toEqual(initialData);

        act(() => {
            result.current.resetForm();
        });

        expect(result.current.formData).toEqual(initialData);
    });

    test('preserves mode when resetting form', () => {
        const {result} = renderHook(() => useAccordionForm(initialData));

        act(() => {
            result.current.startCreate();
            result.current.setFormData({name: 'Test', email: 'test@test.com'});
        });

        expect(result.current.mode).toBe('create');

        act(() => {
            result.current.resetForm();
        });

        expect(result.current.mode).toBe('create');
        expect(result.current.formData).toEqual(initialData);
    });
});

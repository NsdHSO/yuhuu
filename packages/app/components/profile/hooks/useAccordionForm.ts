import {useState} from 'react';

type FormMode = 'view' | 'create' | 'edit';

export function useAccordionForm<T>(initialData: T) {
    const [mode, setMode] = useState<FormMode>('view');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<T>(initialData);

    const startCreate = () => {
        setMode('create');
        setEditingId(null);
        setFormData(initialData);
    };

    const startEdit = (id: number, data: T) => {
        setMode('edit');
        setEditingId(id);
        setFormData(data);
    };

    const cancel = () => {
        setMode('view');
        setEditingId(null);
        setFormData(initialData);
    };

    const resetForm = () => {
        setFormData(initialData);
    };

    return {
        mode,
        editingId,
        formData,
        setFormData,
        startCreate,
        startEdit,
        cancel,
        resetForm,
    };
}

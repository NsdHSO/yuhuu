import {Alert} from 'react-native';

type FormMode = 'view' | 'create' | 'edit';

interface Mutation<TData, TVariables> {
    mutate: (variables: TVariables, options?: {
        onSuccess?: (data: TData) => void;
        onError?: (error: Error) => void;
    }) => void;
    isPending: boolean;
}

interface UseAccordionCRUDOptions<TFormData> {
    deleteMutation: Mutation<any, number>;
    createMutation: Mutation<any, TFormData>;
    updateMutation: Mutation<any, {id: number; data: TFormData}>;
    onCancel: () => void;
    validate?: (data: TFormData) => string | null;
    messages: {
        deleteTitle: string;
        deleteMessage: string;
        deleteSuccess: string;
        createSuccess?: string;
        updateSuccess?: string;
        cancel: string;
        delete: string;
        error: string;
        success: string;
    };
}

export function useAccordionCRUD<TFormData>({
    deleteMutation,
    createMutation,
    updateMutation,
    onCancel,
    validate,
    messages,
}: UseAccordionCRUDOptions<TFormData>) {
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const handleDelete = (id: number, name: string) => {
        const deleteMessage = messages.deleteMessage.replace('{{name}}', name);

        Alert.alert(messages.deleteTitle, deleteMessage, [
            {text: messages.cancel, style: 'cancel'},
            {
                text: messages.delete,
                style: 'destructive',
                onPress: () => {
                    deleteMutation.mutate(id, {
                        onSuccess: () => Alert.alert(messages.success, messages.deleteSuccess),
                        onError: (e) => Alert.alert(messages.error, e.message),
                    });
                },
            },
        ]);
    };

    const handleCancel = () => {
        onCancel();
    };

    const handleSubmit = (mode: FormMode, editingId: number | null, formData: TFormData) => {
        if (validate) {
            const error = validate(formData);
            if (error) {
                Alert.alert(messages.error, error);
                return;
            }
        }

        if (mode === 'create') {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    Alert.alert(messages.success, messages.createSuccess || 'Created successfully');
                    onCancel();
                },
                onError: (e) => Alert.alert(messages.error, e.message),
            });
        } else if (mode === 'edit' && editingId !== null) {
            updateMutation.mutate(
                {id: editingId, data: formData},
                {
                    onSuccess: () => {
                        Alert.alert(messages.success, messages.updateSuccess || 'Updated successfully');
                        onCancel();
                    },
                    onError: (e) => Alert.alert(messages.error, e.message),
                }
            );
        }
    };

    return {
        handleDelete,
        handleCancel,
        handleSubmit,
        isSubmitting,
    };
}

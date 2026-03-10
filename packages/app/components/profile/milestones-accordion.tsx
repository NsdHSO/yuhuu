import React from 'react';
import {ActivityIndicator, Alert, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion} from '@yuhuu/components';
import {
    useCreateMyMilestoneMutation,
    useCreateUserMilestoneMutation,
    useDeleteMyMilestoneMutation,
    useDeleteUserMilestoneMutation,
    useMyMilestonesQuery,
    useUpdateMyMilestoneMutation,
    useUpdateUserMilestoneMutation,
    useUserMilestonesQuery,
} from '@/features/milestones/api';
import {isConflictError} from '@/lib/errors';
import {useAccordionForm, useAccordionCRUD} from './hooks';
import {AccordionEmptyState, AccordionAddButton} from './shared';
import {MilestoneForm} from './milestones/MilestoneForm';
import {MilestoneCard} from './milestones/MilestoneCard';
import {
    initialMilestoneFormData,
    validateMilestoneForm,
    transformMilestoneData,
    transformMilestoneUpdateData,
    getMilestoneMessages,
    getMilestoneLabel,
} from './milestones/milestonesHelpers';

interface MilestonesAccordionProps {
    userId?: number;
}

export function MilestonesAccordion({userId}: MilestonesAccordionProps) {
    const {t} = useTranslation();
    const isAdmin = userId !== undefined;
    const {data: milestones, isLoading} = isAdmin
        ? useUserMilestonesQuery(userId!)
        : useMyMilestonesQuery();

    const createMutation = isAdmin ? useCreateUserMilestoneMutation(userId!) : useCreateMyMilestoneMutation();
    const updateMutation = isAdmin ? useUpdateUserMilestoneMutation(userId!) : useUpdateMyMilestoneMutation();
    const deleteMutation = isAdmin ? useDeleteUserMilestoneMutation(userId!) : useDeleteMyMilestoneMutation();

    const {mode, editingId, formData, setFormData, startCreate, startEdit, cancel} =
        useAccordionForm(initialMilestoneFormData);

    const existingTypes = milestones?.map((m) => m.milestone_type) || [];

    const {handleDelete, handleCancel, handleSubmit, isSubmitting} = useAccordionCRUD({
        deleteMutation,
        createMutation: {
            ...createMutation,
            mutate: (variables: any, options: any) =>
                createMutation.mutate(transformMilestoneData(variables), {
                    ...options,
                    onError: (e: Error) => {
                        if (isConflictError(e)) {
                            Alert.alert(t('common.error'), t('milestones.duplicateError'));
                        } else {
                            options?.onError?.(e);
                        }
                    },
                }),
        },
        updateMutation: {
            ...updateMutation,
            mutate: (variables: any, options: any) =>
                updateMutation.mutate({id: variables.id, data: transformMilestoneUpdateData(variables.data)}, options),
        },
        onCancel: cancel,
        validate: (data) => validateMilestoneForm(data, existingTypes, mode, t),
        messages: getMilestoneMessages(t),
    });

    const milestoneToFormData = (m: NonNullable<typeof milestones>[number]) => ({
        milestone_type: m.milestone_type,
        milestone_date: m.milestone_date || '',
        location: m.location || '',
        officiant: m.officiant || '',
        notes: m.notes || '',
    });

    return (
        <GlassAccordion title={t('milestones.title')} variant="frosted" enableElectric enableWaves={false} testID="milestones-accordion">
            {isLoading ? (
                <ActivityIndicator />
            ) : milestones && milestones.length > 0 ? (
                <View style={{gap: 12}}>
                    {milestones.map((milestone) =>
                        mode === 'edit' && editingId === milestone.id ? (
                            <MilestoneForm
                                key={milestone.id}
                                formData={formData}
                                onChangeFormData={setFormData}
                                onCancel={handleCancel}
                                onSubmit={() => handleSubmit(mode, editingId, formData)}
                                isSubmitting={isSubmitting}
                                isEditMode
                            />
                        ) : (
                            <MilestoneCard
                                key={milestone.id}
                                milestone={milestone}
                                onEdit={() => startEdit(milestone.id, milestoneToFormData(milestone))}
                                onDelete={() => handleDelete(milestone.id, getMilestoneLabel(milestone.milestone_type))}
                                showActions={mode === 'view'}
                            />
                        ),
                    )}
                </View>
            ) : (
                <AccordionEmptyState message={t('milestones.emptyState')} />
            )}
            {mode === 'create' && (
                <MilestoneForm
                    formData={formData}
                    onChangeFormData={setFormData}
                    onCancel={handleCancel}
                    onSubmit={() => handleSubmit(mode, editingId, formData)}
                    isSubmitting={isSubmitting}
                />
            )}
            {mode === 'view' && <AccordionAddButton onPress={startCreate} label={t('milestones.addButton')} />}
        </GlassAccordion>
    );
}

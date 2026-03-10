import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion} from '@yuhuu/components';
import {
    useCreateMyFamilyRelationshipMutation,
    useCreateUserFamilyRelationshipMutation,
    useDeleteMyFamilyRelationshipMutation,
    useDeleteUserFamilyRelationshipMutation,
    useMyFamilyQuery,
    useUpdateMyFamilyRelationshipMutation,
    useUpdateUserFamilyRelationshipMutation,
    useUserFamilyQuery,
} from '@/features/family/api';
import {useAccordionForm, useAccordionCRUD} from './hooks';
import {AccordionEmptyState, AccordionAddButton} from './shared';
import {FamilyForm} from './family/FamilyForm';
import {FamilyCard} from './family/FamilyCard';
import {initialFamilyFormData, validateFamilyForm, transformFamilyData, getFamilyMessages} from './family/familyHelpers';

interface FamilyAccordionProps {
    userId?: number;
}

export function FamilyAccordion({userId}: FamilyAccordionProps) {
    const {t} = useTranslation();
    const isAdmin = userId !== undefined;
    const {data: family, isLoading} = isAdmin ? useUserFamilyQuery(userId!) : useMyFamilyQuery();

    const createMutation = isAdmin
        ? useCreateUserFamilyRelationshipMutation(userId!)
        : useCreateMyFamilyRelationshipMutation();
    const updateMutation = isAdmin
        ? useUpdateUserFamilyRelationshipMutation(userId!)
        : useUpdateMyFamilyRelationshipMutation();
    const deleteMutation = isAdmin
        ? useDeleteUserFamilyRelationshipMutation(userId!)
        : useDeleteMyFamilyRelationshipMutation();

    const {mode, editingId, formData, setFormData, startCreate, startEdit, cancel} =
        useAccordionForm(initialFamilyFormData);

    const {handleDelete, handleCancel, handleSubmit, isSubmitting} = useAccordionCRUD({
        deleteMutation,
        createMutation: {
            ...createMutation,
            mutate: (variables: any, options: any) => createMutation.mutate(transformFamilyData(variables), options),
        },
        updateMutation: {
            ...updateMutation,
            mutate: (variables: any, options: any) =>
                updateMutation.mutate({id: variables.id, data: transformFamilyData(variables.data)}, options),
        },
        onCancel: cancel,
        validate: (data) => validateFamilyForm(data, t),
        messages: getFamilyMessages(t),
    });

    const memberToFormData = (m: NonNullable<typeof family>[number]) => ({
        relationship_type: m.relationship_type,
        related_person_name: m.related_person_name || '',
        related_person_dob: m.related_person_dob || '',
        related_person_phone: m.related_person_phone || '',
        related_person_email: m.related_person_email || '',
    });

    return (
        <GlassAccordion title={t('family.title')} variant="frosted" enableElectric enableWaves={false} testID="family-accordion">
            {isLoading ? (
                <ActivityIndicator />
            ) : family && family.length > 0 ? (
                <View style={{gap: 12}}>
                    {family.map((member) =>
                        mode === 'edit' && editingId === member.id ? (
                            <FamilyForm
                                key={member.id}
                                formData={formData}
                                onChangeFormData={setFormData}
                                onCancel={handleCancel}
                                onSubmit={() => handleSubmit(mode, editingId, formData)}
                                isSubmitting={isSubmitting}
                            />
                        ) : (
                            <FamilyCard
                                key={member.id}
                                member={member}
                                onEdit={() => startEdit(member.id, memberToFormData(member))}
                                onDelete={() => handleDelete(member.id, member.related_person_name || t('family.thisMember'))}
                                showActions={mode === 'view'}
                            />
                        )
                    )}
                </View>
            ) : (
                <AccordionEmptyState message={t('family.emptyState')} />
            )}
            {mode === 'create' && (
                <FamilyForm
                    formData={formData}
                    onChangeFormData={setFormData}
                    onCancel={handleCancel}
                    onSubmit={() => handleSubmit(mode, editingId, formData)}
                    isSubmitting={isSubmitting}
                />
            )}
            {mode === 'view' && <AccordionAddButton onPress={startCreate} label={t('family.addButton')} />}
        </GlassAccordion>
    );
}

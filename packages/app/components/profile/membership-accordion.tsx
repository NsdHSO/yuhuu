import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion} from '@yuhuu/components';
import {
    useCreateMyMembershipHistoryMutation, useDeleteMyMembershipHistoryMutation,
    useMyMembershipHistoryQuery, useUpdateMyMembershipHistoryMutation,
    useUserMembershipHistoryQuery, useCreateUserMembershipHistoryMutation,
    useUpdateUserMembershipHistoryMutation, useDeleteUserMembershipHistoryMutation,
} from '@/features/membership/api';
import {useAccordionForm, useAccordionCRUD} from './hooks';
import {AccordionEmptyState, AccordionAddButton} from './shared';
import {MembershipForm} from './membership/MembershipForm';
import {MembershipCard} from './membership/MembershipCard';
import {
    initialMembershipFormData, validateMembershipForm, getMembershipMessages,
    recordToMembershipFormData, wrapCreateMutation, wrapUpdateMutation,
} from './membership/membershipHelpers';

interface MembershipAccordionProps {
    userId?: number;
}

export function MembershipAccordion({userId}: MembershipAccordionProps) {
    const {t} = useTranslation();
    const isAdminView = userId !== undefined;
    const myQuery = useMyMembershipHistoryQuery();
    const userQuery = useUserMembershipHistoryQuery(userId ?? 0);
    const {data: history, isLoading} = isAdminView ? userQuery : myQuery;

    const deleteMy = useDeleteMyMembershipHistoryMutation();
    const createMy = useCreateMyMembershipHistoryMutation();
    const updateMy = useUpdateMyMembershipHistoryMutation();
    const deleteUser = useDeleteUserMembershipHistoryMutation(userId ?? 0);
    const createUser = useCreateUserMembershipHistoryMutation(userId ?? 0);
    const updateUser = useUpdateUserMembershipHistoryMutation(userId ?? 0);

    const deleteMutation = isAdminView ? deleteUser : deleteMy;
    const createMutation = isAdminView ? createUser : createMy;
    const updateMutation = isAdminView ? updateUser : updateMy;

    const {mode, editingId, formData, setFormData, startCreate, startEdit, cancel} =
        useAccordionForm(initialMembershipFormData);

    const {handleDelete, handleCancel, handleSubmit, isSubmitting} = useAccordionCRUD({
        deleteMutation,
        createMutation: wrapCreateMutation(createMutation, t),
        updateMutation: wrapUpdateMutation(updateMutation, t),
        onCancel: cancel,
        validate: (data) => validateMembershipForm(data, t, mode as 'create' | 'edit', history ?? undefined),
        messages: getMembershipMessages(t),
    });

    return (
        <GlassAccordion title={t('membership.title')} variant="frosted" enableElectric enableWaves={false} testID="membership-accordion">
            {isLoading ? (
                <ActivityIndicator />
            ) : history && history.length > 0 ? (
                <View style={{gap: 12}}>
                    {history.map((record) =>
                        mode === 'edit' && editingId === record.id ? (
                            <MembershipForm
                                key={record.id}
                                formData={formData}
                                onChangeFormData={setFormData}
                                onCancel={handleCancel}
                                onSubmit={() => handleSubmit(mode, editingId, formData)}
                                isSubmitting={isSubmitting}
                            />
                        ) : (
                            <MembershipCard
                                key={record.id}
                                record={record}
                                onEdit={() => startEdit(record.id, recordToMembershipFormData(record))}
                                onDelete={() => handleDelete(record.id, record.church_name)}
                                showActions={mode === 'view'}
                            />
                        )
                    )}
                </View>
            ) : (
                <AccordionEmptyState message={t('membership.emptyState')} />
            )}
            {mode === 'create' && (
                <MembershipForm
                    formData={formData}
                    onChangeFormData={setFormData}
                    onCancel={handleCancel}
                    onSubmit={() => handleSubmit(mode, editingId, formData)}
                    isSubmitting={isSubmitting}
                />
            )}
            {mode === 'view' && <AccordionAddButton onPress={startCreate} label={t('membership.addButton')} />}
        </GlassAccordion>
    );
}

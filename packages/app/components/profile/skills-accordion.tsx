import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion} from '@yuhuu/components';
import {
    useCreateMySkillMutation,
    useCreateUserSkillMutation,
    useDeleteMySkillMutation,
    useDeleteUserSkillMutation,
    useMySkillsQuery,
    useUpdateMySkillMutation,
    useUpdateUserSkillMutation,
    useUserSkillsQuery,
} from '@/features/skills/api';
import {useAccordionForm, useAccordionCRUD} from './hooks';
import {AccordionEmptyState, AccordionAddButton} from './shared';
import {SkillForm} from './skills/SkillForm';
import {SkillCard} from './skills/SkillCard';
import {initialSkillFormData, validateSkillForm, transformSkillData, getSkillMessages} from './skills/skillsHelpers';

interface SkillsAccordionProps {
    userId?: number;
}

export function SkillsAccordion({userId}: SkillsAccordionProps) {
    const {t} = useTranslation();
    const isAdmin = userId !== undefined;

    const mySkills = useMySkillsQuery();
    const userSkills = useUserSkillsQuery(userId ?? 0);
    const {data: skills, isLoading} = isAdmin ? userSkills : mySkills;

    const createMy = useCreateMySkillMutation();
    const updateMy = useUpdateMySkillMutation();
    const deleteMy = useDeleteMySkillMutation();
    const createUser = useCreateUserSkillMutation(userId ?? 0);
    const updateUser = useUpdateUserSkillMutation(userId ?? 0);
    const deleteUser = useDeleteUserSkillMutation(userId ?? 0);

    const createMutation = isAdmin ? createUser : createMy;
    const updateMutation = isAdmin ? updateUser : updateMy;
    const deleteMutation = isAdmin ? deleteUser : deleteMy;

    const {mode, editingId, formData, setFormData, startCreate, startEdit, cancel} =
        useAccordionForm(initialSkillFormData);

    const {handleDelete, handleCancel, handleSubmit, isSubmitting} = useAccordionCRUD({
        deleteMutation,
        createMutation: {
            ...createMutation,
            mutate: (variables: any, options: any) => createMutation.mutate(transformSkillData(variables), options),
        },
        updateMutation: {
            ...updateMutation,
            mutate: (variables: any, options: any) =>
                updateMutation.mutate({id: variables.id, data: transformSkillData(variables.data)}, options),
        },
        onCancel: cancel,
        validate: (data) => validateSkillForm(data, t),
        messages: getSkillMessages(t),
    });

    const skillToFormData = (s: NonNullable<typeof skills>[number]) => ({
        skill_name: s.skill_name,
        skill_category: s.skill_category || '',
        proficiency_level: s.proficiency_level || '',
        years_of_experience: s.years_of_experience !== undefined ? String(s.years_of_experience) : '',
        is_willing_to_serve: s.is_willing_to_serve,
    });

    return (
        <GlassAccordion title={t('skills.title')} variant="frosted" enableElectric enableWaves={false} testID="skills-accordion">
            {isLoading ? (
                <ActivityIndicator />
            ) : skills && skills.length > 0 ? (
                <View style={{gap: 12}}>
                    {skills.map((skill) =>
                        mode === 'edit' && editingId === skill.id ? (
                            <SkillForm
                                key={skill.id}
                                formData={formData}
                                onChangeFormData={setFormData}
                                onCancel={handleCancel}
                                onSubmit={() => handleSubmit(mode, editingId, formData)}
                                isSubmitting={isSubmitting}
                            />
                        ) : (
                            <SkillCard
                                key={skill.id}
                                skill={skill}
                                onEdit={() => startEdit(skill.id, skillToFormData(skill))}
                                onDelete={() => handleDelete(skill.id, skill.skill_name)}
                                showActions={mode === 'view'}
                            />
                        )
                    )}
                </View>
            ) : (
                <AccordionEmptyState message={t('skills.emptyState')} />
            )}
            {mode === 'create' && (
                <SkillForm
                    formData={formData}
                    onChangeFormData={setFormData}
                    onCancel={handleCancel}
                    onSubmit={() => handleSubmit(mode, editingId, formData)}
                    isSubmitting={isSubmitting}
                />
            )}
            {mode === 'view' && <AccordionAddButton onPress={startCreate} label={t('skills.addButton')} />}
        </GlassAccordion>
    );
}

import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, Switch, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion, GlassCard, ThemedText, useColorScheme, Colors} from '@yuhuu/components';
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
import type {CreateUserSkillInput, ProficiencyLevel, SkillCategory} from '@/features/skills/api';
import {getErrorMessage, isConflictError} from '@/lib/errors';

type FormMode = 'view' | 'create' | 'edit';

type SkillFormData = {
    skill_name: string;
    skill_category: SkillCategory | '';
    proficiency_level: ProficiencyLevel | '';
    years_of_experience: string;
    is_willing_to_serve: boolean;
};

const initialFormData: SkillFormData = {
    skill_name: '',
    skill_category: '',
    proficiency_level: '',
    years_of_experience: '',
    is_willing_to_serve: true,
};

const CATEGORIES: SkillCategory[] = ['Music', 'Technology', 'Teaching', 'Administration', 'Hospitality', 'Creative Arts'];
const PROFICIENCY_LEVELS: ProficiencyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

type SkillsAccordionProps = {
    userId?: number;
};

export function SkillsAccordion({userId}: SkillsAccordionProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const isAdmin = userId !== undefined;
    const mySkills = useMySkillsQuery();
    const userSkills = useUserSkillsQuery(userId ?? 0, {enabled: isAdmin});
    const {data: skills, isLoading} = isAdmin ? userSkills : mySkills;

    // Call all hooks unconditionally (Rules of Hooks)
    const deleteMyMutation = useDeleteMySkillMutation();
    const createMyMutation = useCreateMySkillMutation();
    const updateMyMutation = useUpdateMySkillMutation();
    const deleteUserMutation = useDeleteUserSkillMutation(userId ?? 0);
    const createUserMutation = useCreateUserSkillMutation(userId ?? 0);
    const updateUserMutation = useUpdateUserSkillMutation(userId ?? 0);

    // Select which mutation to use based on admin context
    const deleteMutation = isAdmin ? deleteUserMutation : deleteMyMutation;
    const createMutation = isAdmin ? createUserMutation : createMyMutation;
    const updateMutation = isAdmin ? updateUserMutation : updateMyMutation;

    const [mode, setMode] = useState<FormMode>('view');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<SkillFormData>(initialFormData);

    const inputStyles = useMemo(() => ({
        container: {
            borderWidth: 1,
            borderColor: scheme === 'dark' ? '#2A2A2A' : '#ccc',
            borderRadius: 8,
            padding: 12,
            color: Colors[scheme].text,
            backgroundColor: scheme === 'dark' ? '#1F2937' : '#fff',
        } as const,
        placeholderColor: scheme === 'dark' ? '#9CA3AF' : '#6B7280',
    }), [scheme]);

    const handleDelete = (id: number, skillName: string) => {
        Alert.alert(
            t('skills.deleteTitle'),
            t('skills.deleteMessage', {skillName}),
            [
                {text: t('common.cancel'), style: 'cancel'},
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        deleteMutation.mutate(id, {
                            onSuccess: () => Alert.alert(t('common.success'), t('skills.deleteSuccess')),
                            onError: (e) => Alert.alert(t('common.error'), getErrorMessage(e)),
                        });
                    },
                },
            ]
        );
    };

    const handleEdit = (skill: typeof skills extends (infer T)[] | undefined ? T : never) => {
        if (!skill) return;
        setMode('edit');
        setEditingId(skill.id);
        setFormData({
            skill_name: skill.skill_name,
            skill_category: skill.skill_category || '',
            proficiency_level: skill.proficiency_level || '',
            years_of_experience: skill.years_of_experience !== undefined ? String(skill.years_of_experience) : '',
            is_willing_to_serve: skill.is_willing_to_serve,
        });
    };

    const handleCancel = () => {
        setMode('view');
        setEditingId(null);
        setFormData(initialFormData);
    };

    const handleSubmit = () => {
        if (!formData.skill_name.trim()) {
            Alert.alert(t('common.error'), t('skills.errors.skillNameRequired'));
            return;
        }

        const data: CreateUserSkillInput = {
            skill_name: formData.skill_name.trim(),
            ...(formData.skill_category ? {skill_category: formData.skill_category as SkillCategory} : {}),
            ...(formData.proficiency_level ? {proficiency_level: formData.proficiency_level as ProficiencyLevel} : {}),
            ...(formData.years_of_experience ? {years_of_experience: parseInt(formData.years_of_experience, 10)} : {}),
            is_willing_to_serve: formData.is_willing_to_serve,
        };

        if (mode === 'create') {
            createMutation.mutate(data, {
                onSuccess: () => {
                    Alert.alert(t('common.success'), t('skills.createSuccess'));
                    handleCancel();
                },
                onError: (e) => {
                    if (isConflictError(e)) {
                        Alert.alert(t('common.error'), t('skills.duplicateError'));
                    } else {
                        Alert.alert(t('common.error'), getErrorMessage(e, t('skills.createError')));
                    }
                },
            });
        } else if (mode === 'edit' && editingId !== null) {
            updateMutation.mutate({id: editingId, data}, {
                onSuccess: () => {
                    Alert.alert(t('common.success'), t('skills.updateSuccess'));
                    handleCancel();
                },
                onError: (e) => {
                    if (isConflictError(e)) {
                        Alert.alert(t('common.error'), t('skills.duplicateError'));
                    } else {
                        Alert.alert(t('common.error'), getErrorMessage(e, t('skills.updateError')));
                    }
                },
            });
        }
    };

    const getProficiencyColor = (level?: string) => {
        const colors: Record<string, string> = {
            beginner: '#94A3B8',
            intermediate: '#60A5FA',
            advanced: '#8B5CF6',
            expert: '#F59E0B',
        };
        return level ? colors[level] || '#94A3B8' : '#94A3B8';
    };

    const getProficiencyLabel = (level?: string) => {
        if (!level) return '';
        return level.charAt(0).toUpperCase() + level.slice(1);
    };

    const getCategoryIcon = (category?: string) => {
        const icons: Record<string, string> = {
            Music: '🎵',
            Technology: '💻',
            Teaching: '📚',
            Administration: '📋',
            Hospitality: '🤝',
            'Creative Arts': '🎨',
        };
        return category ? icons[category] || '⭐' : '⭐';
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const renderForm = () => (
        <View testID="skill-form" style={{gap: 12, marginTop: 8}}>
            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('skills.fields.skillName')}
            </ThemedText>
            <TextInput
                testID="skill-name-input"
                value={formData.skill_name}
                onChangeText={(text) => setFormData(prev => ({...prev, skill_name: text}))}
                placeholder={t('skills.fields.skillNamePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                editable={!isSubmitting}
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('skills.fields.skillCategory')}
            </ThemedText>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                {CATEGORIES.map(cat => (
                    <Pressable
                        key={cat}
                        onPress={() => setFormData(prev => ({
                            ...prev,
                            skill_category: prev.skill_category === cat ? '' : cat,
                        }))}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: formData.skill_category === cat
                                ? (scheme === 'dark' ? '#3B82F6' : '#2563EB')
                                : (scheme === 'dark' ? '#374151' : '#D1D5DB'),
                            backgroundColor: formData.skill_category === cat
                                ? (scheme === 'dark' ? '#1E3A5F' : '#DBEAFE')
                                : 'transparent',
                        }}
                    >
                        <ThemedText style={{fontSize: 13}}>
                            {t(`skills.categories.${cat}`)}
                        </ThemedText>
                    </Pressable>
                ))}
            </View>

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('skills.fields.proficiencyLevel')}
            </ThemedText>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                {PROFICIENCY_LEVELS.map(level => (
                    <Pressable
                        key={level}
                        onPress={() => setFormData(prev => ({
                            ...prev,
                            proficiency_level: prev.proficiency_level === level ? '' : level,
                        }))}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: formData.proficiency_level === level
                                ? getProficiencyColor(level)
                                : (scheme === 'dark' ? '#374151' : '#D1D5DB'),
                            backgroundColor: formData.proficiency_level === level
                                ? getProficiencyColor(level) + '33'
                                : 'transparent',
                        }}
                    >
                        <ThemedText style={{fontSize: 13}}>
                            {t(`skills.proficiencyLevels.${level}`)}
                        </ThemedText>
                    </Pressable>
                ))}
            </View>

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('skills.fields.yearsOfExperience')}
            </ThemedText>
            <TextInput
                testID="skill-years-input"
                value={formData.years_of_experience}
                onChangeText={(text) => setFormData(prev => ({...prev, years_of_experience: text.replace(/[^0-9]/g, '')}))}
                placeholder={t('skills.fields.yearsOfExperiencePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                keyboardType="numeric"
                editable={!isSubmitting}
            />

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                    {t('skills.fields.isWillingToServe')}
                </ThemedText>
                <Switch
                    testID="skill-willing-switch"
                    value={formData.is_willing_to_serve}
                    onValueChange={(val) => setFormData(prev => ({...prev, is_willing_to_serve: val}))}
                    disabled={isSubmitting}
                />
            </View>

            <View style={{flexDirection: 'row', gap: 12, marginTop: 8}}>
                <Pressable
                    testID="skill-form-cancel"
                    onPress={handleCancel}
                    style={{flex: 1, padding: 12, borderRadius: 8, alignItems: 'center'}}
                >
                    <ThemedText>{t('common.cancel')}</ThemedText>
                </Pressable>
                <Pressable
                    testID="skill-form-submit"
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        backgroundColor: isSubmitting
                            ? (scheme === 'dark' ? '#374151' : '#D1D5DB')
                            : (scheme === 'dark' ? '#3B82F6' : '#2563EB'),
                        opacity: isSubmitting ? 0.7 : 1,
                    }}
                >
                    <ThemedText style={{color: '#fff', fontWeight: '600'}}>
                        {t('common.save')}
                    </ThemedText>
                </Pressable>
            </View>
        </View>
    );

    return (
        <GlassAccordion title={t('skills.title')} variant="frosted" testID="skills-accordion">
            {isLoading ? (
                <ActivityIndicator/>
            ) : skills && skills.length > 0 ? (
                <View style={{gap: 12}}>
                    {skills.map((skill) => (
                        mode === 'edit' && editingId === skill.id ? (
                            <View key={skill.id}>{renderForm()}</View>
                        ) : (
                            <GlassCard
                                key={skill.id}
                                variant="tinted"
                                borderRadius={8}
                                style={{
                                    padding: 12,
                                }}
                            >
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginBottom: 4
                                }}>
                                    <View style={{flex: 1}}>
                                        <ThemedText style={{fontSize: 16, fontWeight: '600'}}>
                                            {skill.skill_name}
                                        </ThemedText>
                                        {skill.proficiency_level && (
                                            <View
                                                style={{
                                                    backgroundColor: getProficiencyColor(skill.proficiency_level),
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 2,
                                                    borderRadius: 4,
                                                    alignSelf: 'flex-start',
                                                    marginTop: 4,
                                                }}
                                            >
                                                <ThemedText
                                                    style={{color: 'white', fontSize: 12, fontWeight: '600'}}>
                                                    {getProficiencyLabel(skill.proficiency_level)}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                    {mode === 'view' && (
                                        <View style={{flexDirection: 'row', gap: 8}}>
                                            <Pressable
                                                onPress={() => handleEdit(skill)}
                                                style={{padding: 4}}
                                            >
                                                <ThemedText style={{
                                                    color: scheme === 'dark' ? '#3B82F6' : '#2563EB',
                                                    fontSize: 14
                                                }}>{t('common.edit')}</ThemedText>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => handleDelete(skill.id, skill.skill_name)}
                                                style={{padding: 4}}
                                            >
                                                <ThemedText style={{
                                                    color: '#EF4444',
                                                    fontSize: 14
                                                }}>{t('common.delete')}</ThemedText>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                                {skill.skill_category && (
                                    <ThemedText style={{
                                        fontSize: 14,
                                        color: Colors[scheme].tabIconDefault,
                                        marginTop: 4
                                    }}>
                                        {getCategoryIcon(skill.skill_category)} {skill.skill_category}
                                    </ThemedText>
                                )}
                                {skill.years_of_experience !== undefined && (
                                    <ThemedText style={{fontSize: 13, marginTop: 4}}>
                                        📊 {t('skills.yearsExperience', {count: skill.years_of_experience})}
                                    </ThemedText>
                                )}
                                {skill.is_willing_to_serve && (
                                    <ThemedText style={{fontSize: 13, marginTop: 2, color: '#10B981'}}>
                                        {t('skills.willingToServe')}
                                    </ThemedText>
                                )}
                            </GlassCard>
                        )
                    ))}
                </View>
            ) : (
                <ThemedText style={{textAlign: 'center', color: Colors[scheme].tabIconDefault}}>
                    {t('skills.emptyState')}
                </ThemedText>
            )}

            {mode === 'create' && renderForm()}

            {mode === 'view' && (
                <Pressable
                    onPress={() => setMode('create')}
                    style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: scheme === 'dark' ? '#374151' : '#D1D5DB',
                        borderStyle: 'dashed',
                        alignItems: 'center',
                    }}
                >
                    <ThemedText style={{
                        color: scheme === 'dark' ? '#3B82F6' : '#2563EB',
                        fontWeight: '600'
                    }}>
                        {t('skills.addButton')}
                    </ThemedText>
                </Pressable>
            )}
        </GlassAccordion>
    );
}

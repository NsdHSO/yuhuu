import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion, GlassCard, GlassInput, ThemedText, useColorScheme, Colors} from '@yuhuu/components';
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
import type {CreateFamilyRelationshipInput, RelationshipType} from '@/features/family/api';
import {getErrorMessage, isConflictError} from '@/lib/errors';

type FormMode = 'view' | 'create' | 'edit';

type FamilyFormData = {
    relationship_type: RelationshipType;
    related_person_name: string;
    related_person_dob: string;
    related_person_phone: string;
    related_person_email: string;
};

const initialFormData: FamilyFormData = {
    relationship_type: 'spouse',
    related_person_name: '',
    related_person_dob: '',
    related_person_phone: '',
    related_person_email: '',
};

const RELATIONSHIP_TYPES: RelationshipType[] = ['spouse', 'child', 'parent', 'sibling'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FamilyAccordionProps {
    userId?: number;
}

export function FamilyAccordion({userId}: FamilyAccordionProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const isAdmin = userId !== undefined;
    const myFamily = useMyFamilyQuery();
    const userFamily = useUserFamilyQuery(userId ?? 0);
    const {data: family, isLoading} = isAdmin ? userFamily : myFamily;

    // Call all hooks unconditionally (Rules of Hooks)
    const deleteMyMutation = useDeleteMyFamilyRelationshipMutation();
    const createMyMutation = useCreateMyFamilyRelationshipMutation();
    const updateMyMutation = useUpdateMyFamilyRelationshipMutation();
    const deleteUserMutation = useDeleteUserFamilyRelationshipMutation(userId ?? 0);
    const createUserMutation = useCreateUserFamilyRelationshipMutation(userId ?? 0);
    const updateUserMutation = useUpdateUserFamilyRelationshipMutation(userId ?? 0);

    // Select which mutation to use based on admin context
    const deleteMutation = isAdmin ? deleteUserMutation : deleteMyMutation;
    const createMutation = isAdmin ? createUserMutation : createMyMutation;
    const updateMutation = isAdmin ? updateUserMutation : updateMyMutation;

    const [mode, setMode] = useState<FormMode>('view');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<FamilyFormData>(initialFormData);

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

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            t('family.deleteTitle'),
            t('family.deleteMessage', {name}),
            [
                {text: t('common.cancel'), style: 'cancel'},
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        deleteMutation.mutate(id, {
                            onSuccess: () => Alert.alert(t('common.success'), t('family.deleteSuccess')),
                            onError: (e) => Alert.alert(t('common.error'), getErrorMessage(e)),
                        });
                    },
                },
            ]
        );
    };

    const handleEdit = (member: NonNullable<typeof family>[number]) => {
        setMode('edit');
        setEditingId(member.id);
        setFormData({
            relationship_type: member.relationship_type,
            related_person_name: member.related_person_name || '',
            related_person_dob: member.related_person_dob || '',
            related_person_phone: member.related_person_phone || '',
            related_person_email: member.related_person_email || '',
        });
    };

    const handleCancel = () => {
        setMode('view');
        setEditingId(null);
        setFormData(initialFormData);
    };

    const handleSubmit = () => {
        if (!formData.related_person_name.trim()) {
            Alert.alert(t('common.error'), t('family.errors.nameRequired'));
            return;
        }

        if (formData.related_person_email.trim() && !EMAIL_REGEX.test(formData.related_person_email.trim())) {
            Alert.alert(t('common.error'), t('family.errors.invalidEmail'));
            return;
        }

        const data: CreateFamilyRelationshipInput = {
            relationship_type: formData.relationship_type,
            related_person_name: formData.related_person_name.trim(),
            ...(formData.related_person_dob ? {related_person_dob: formData.related_person_dob} : {}),
            ...(formData.related_person_phone.trim() ? {related_person_phone: formData.related_person_phone.trim()} : {}),
            ...(formData.related_person_email.trim() ? {related_person_email: formData.related_person_email.trim()} : {}),
        };

        if (mode === 'create') {
            createMutation.mutate(data, {
                onSuccess: () => {
                    Alert.alert(t('common.success'), t('family.createSuccess'));
                    handleCancel();
                },
                onError: (e) => {
                    if (isConflictError(e)) {
                        Alert.alert(t('common.error'), getErrorMessage(e));
                    } else {
                        Alert.alert(t('common.error'), getErrorMessage(e, t('family.createError')));
                    }
                },
            });
        } else if (mode === 'edit' && editingId !== null) {
            updateMutation.mutate({id: editingId, data}, {
                onSuccess: () => {
                    Alert.alert(t('common.success'), t('family.updateSuccess'));
                    handleCancel();
                },
                onError: (e) => {
                    Alert.alert(t('common.error'), getErrorMessage(e, t('family.updateError')));
                },
            });
        }
    };

    const getRelationshipLabel = (type: string) => {
        const labels: Record<string, string> = {
            spouse: '💑 Spouse',
            child: '👶 Child',
            parent: '👪 Parent',
            sibling: '👫 Sibling',
        };
        return labels[type] || type;
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const renderForm = () => (
        <View testID="family-form" style={{gap: 12, marginTop: 8}}>
            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('family.fields.relationshipType')}
            </ThemedText>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                {RELATIONSHIP_TYPES.map(type => (
                    <Pressable
                        key={type}
                        onPress={() => setFormData(prev => ({...prev, relationship_type: type}))}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: formData.relationship_type === type
                                ? (scheme === 'dark' ? '#3B82F6' : '#2563EB')
                                : (scheme === 'dark' ? '#374151' : '#D1D5DB'),
                            backgroundColor: formData.relationship_type === type
                                ? (scheme === 'dark' ? '#1E3A5F' : '#DBEAFE')
                                : 'transparent',
                        }}
                    >
                        <ThemedText style={{fontSize: 13}}>
                            {t(`family.relationshipTypes.${type}`)}
                        </ThemedText>
                    </Pressable>
                ))}
            </View>

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('family.fields.relatedPersonName')}
            </ThemedText>
            <TextInput
                testID="family-name-input"
                value={formData.related_person_name}
                onChangeText={(text) => setFormData(prev => ({...prev, related_person_name: text}))}
                placeholder={t('family.fields.relatedPersonNamePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                editable={!isSubmitting}
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('family.fields.relatedPersonPhone')}
            </ThemedText>
            <TextInput
                testID="family-phone-input"
                value={formData.related_person_phone}
                onChangeText={(text) => setFormData(prev => ({...prev, related_person_phone: text}))}
                placeholder={t('family.fields.relatedPersonPhonePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                keyboardType="phone-pad"
                editable={!isSubmitting}
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('family.fields.relatedPersonEmail')}
            </ThemedText>
            <TextInput
                testID="family-email-input"
                value={formData.related_person_email}
                onChangeText={(text) => setFormData(prev => ({...prev, related_person_email: text}))}
                placeholder={t('family.fields.relatedPersonEmailPlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
            />

            <View style={{flexDirection: 'row', gap: 12, marginTop: 8}}>
                <Pressable
                    testID="family-form-cancel"
                    onPress={handleCancel}
                    style={{flex: 1, padding: 12, borderRadius: 8, alignItems: 'center'}}
                >
                    <ThemedText>{t('common.cancel')}</ThemedText>
                </Pressable>
                <Pressable
                    testID="family-form-submit"
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
        <GlassAccordion
            title={t('family.title')}
            variant="frosted"
            glowVariant="vibrant"
            enableElectric={true}
            enableWaves={false}
            testID="family-accordion"
        >
            {isLoading ? (
                <ActivityIndicator />
            ) : family && family.length > 0 ? (
                <View style={{gap: 12}}>
                    {family.map((member) => (
                        mode === 'edit' && editingId === member.id ? (
                            <View key={member.id}>{renderForm()}</View>
                        ) : (
                            <GlassCard
                                key={member.id}
                                variant="tinted"
                                borderRadius={8}
                                style={{
                                    padding: 12,
                                    marginBottom: 8,
                                }}
                            >
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                                    <ThemedText style={{fontSize: 16, fontWeight: '600'}}>
                                        {member.related_person_name || `User #${member.related_user_id}`}
                                    </ThemedText>
                                    {mode === 'view' && (
                                        <View style={{flexDirection: 'row', gap: 8}}>
                                            <Pressable
                                                onPress={() => handleEdit(member)}
                                                style={{padding: 4}}
                                            >
                                                <ThemedText style={{
                                                    color: scheme === 'dark' ? '#3B82F6' : '#2563EB',
                                                    fontSize: 14
                                                }}>{t('common.edit')}</ThemedText>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => handleDelete(member.id, member.related_person_name || t('family.thisMember'))}
                                                style={{padding: 4}}
                                            >
                                                <ThemedText style={{color: '#EF4444', fontSize: 14}}>{t('common.delete')}</ThemedText>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                                <ThemedText style={{fontSize: 14, color: Colors[scheme].tabIconDefault}}>
                                    {getRelationshipLabel(member.relationship_type)}
                                </ThemedText>
                                {member.related_person_phone && (
                                    <ThemedText style={{fontSize: 13, marginTop: 4}}>
                                        📞 {member.related_person_phone}
                                    </ThemedText>
                                )}
                                {member.related_person_email && (
                                    <ThemedText style={{fontSize: 13, marginTop: 2}}>
                                        ✉️ {member.related_person_email}
                                    </ThemedText>
                                )}
                            </GlassCard>
                        )
                    ))}
                </View>
            ) : (
                <ThemedText style={{textAlign: 'center', color: Colors[scheme].tabIconDefault}}>
                    {t('family.emptyState')}
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
                        {t('family.addButton')}
                    </ThemedText>
                </Pressable>
            )}
        </GlassAccordion>
    );
}

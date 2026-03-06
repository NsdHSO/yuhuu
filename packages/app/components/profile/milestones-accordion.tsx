import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion, GlassCard, GlassInput, ThemedText, useColorScheme, Colors} from '@yuhuu/components';
import {
    useCreateMyMilestoneMutation,
    useDeleteMyMilestoneMutation,
    useMyMilestonesQuery,
    useUpdateMyMilestoneMutation,
    useUserMilestonesQuery,
    useCreateUserMilestoneMutation,
    useUpdateUserMilestoneMutation,
    useDeleteUserMilestoneMutation,
} from '@/features/milestones/api';
import type {CreateSpiritualMilestoneInput, MilestoneType} from '@/features/milestones/api';
import {getErrorMessage, isConflictError} from '@/lib/errors';
import {formatDateForDisplay} from '@/lib/dates';

type FormMode = 'view' | 'create' | 'edit';

type MilestoneFormData = {
    milestone_type: MilestoneType;
    milestone_date: string;
    location: string;
    officiant: string;
    notes: string;
};

const initialFormData: MilestoneFormData = {
    milestone_type: 'conversion',
    milestone_date: '',
    location: '',
    officiant: '',
    notes: '',
};

const MILESTONE_TYPES: MilestoneType[] = [
    'conversion', 'baptism', 'water_baptism', 'spirit_baptism',
    'confirmation', 'dedication', 'ordination',
];

interface MilestonesAccordionProps {
    userId?: number;
}

export function MilestonesAccordion({userId}: MilestonesAccordionProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const isAdmin = userId !== undefined;
    const myMilestones = useMyMilestonesQuery();
    const userMilestones = useUserMilestonesQuery(userId ?? 0);
    const {data: milestones, isLoading} = isAdmin ? userMilestones : myMilestones;

    // Call all hooks unconditionally (Rules of Hooks)
    const deleteMyMutation = useDeleteMyMilestoneMutation();
    const createMyMutation = useCreateMyMilestoneMutation();
    const updateMyMutation = useUpdateMyMilestoneMutation();
    const deleteUserMutation = useDeleteUserMilestoneMutation(userId ?? 0);
    const createUserMutation = useCreateUserMilestoneMutation(userId ?? 0);
    const updateUserMutation = useUpdateUserMilestoneMutation(userId ?? 0);

    // Select which mutation to use based on admin context
    const deleteMutation = isAdmin ? deleteUserMutation : deleteMyMutation;
    const createMutation = isAdmin ? createUserMutation : createMyMutation;
    const updateMutation = isAdmin ? updateUserMutation : updateMyMutation;

    const [mode, setMode] = useState<FormMode>('view');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<MilestoneFormData>(initialFormData);

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

    const handleDelete = (id: number, type: string) => {
        Alert.alert(
            t('milestones.deleteTitle'),
            t('milestones.deleteMessage', {type}),
            [
                {text: t('common.cancel'), style: 'cancel'},
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        deleteMutation.mutate(id, {
                            onSuccess: () => Alert.alert(t('common.success'), t('milestones.deleteSuccess')),
                            onError: (e) => Alert.alert(t('common.error'), getErrorMessage(e)),
                        });
                    },
                },
            ]
        );
    };

    const handleEdit = (milestone: NonNullable<typeof milestones>[number]) => {
        setMode('edit');
        setEditingId(milestone.id);
        setFormData({
            milestone_type: milestone.milestone_type,
            milestone_date: milestone.milestone_date || '',
            location: milestone.location || '',
            officiant: milestone.officiant || '',
            notes: milestone.notes || '',
        });
    };

    const handleCancel = () => {
        setMode('view');
        setEditingId(null);
        setFormData(initialFormData);
    };

    const handleSubmit = () => {
        if (mode === 'create') {
            // Check for duplicate milestone type
            const existingTypes = milestones?.map(m => m.milestone_type) || [];
            if (existingTypes.includes(formData.milestone_type)) {
                Alert.alert(t('common.error'), t('milestones.duplicateError'));
                return;
            }

            const data: CreateSpiritualMilestoneInput = {
                milestone_type: formData.milestone_type,
                ...(formData.milestone_date ? {milestone_date: formData.milestone_date} : {}),
                ...(formData.location.trim() ? {location: formData.location.trim()} : {}),
                ...(formData.officiant.trim() ? {officiant: formData.officiant.trim()} : {}),
                ...(formData.notes.trim() ? {notes: formData.notes.trim()} : {}),
            };

            createMutation.mutate(data, {
                onSuccess: () => {
                    Alert.alert(t('common.success'), t('milestones.createSuccess'));
                    handleCancel();
                },
                onError: (e) => {
                    if (isConflictError(e)) {
                        Alert.alert(t('common.error'), t('milestones.duplicateError'));
                    } else {
                        Alert.alert(t('common.error'), getErrorMessage(e, t('milestones.createError')));
                    }
                },
            });
        } else if (mode === 'edit' && editingId !== null) {
            const data = {
                ...(formData.milestone_date ? {milestone_date: formData.milestone_date} : {}),
                ...(formData.location.trim() ? {location: formData.location.trim()} : {}),
                ...(formData.officiant.trim() ? {officiant: formData.officiant.trim()} : {}),
                ...(formData.notes.trim() ? {notes: formData.notes.trim()} : {}),
            };

            updateMutation.mutate({id: editingId, data}, {
                onSuccess: () => {
                    Alert.alert(t('common.success'), t('milestones.updateSuccess'));
                    handleCancel();
                },
                onError: (e) => {
                    Alert.alert(t('common.error'), getErrorMessage(e, t('milestones.updateError')));
                },
            });
        }
    };

    const getMilestoneIcon = (type: string) => {
        const icons: Record<string, string> = {
            conversion: '✨',
            baptism: '💧',
            water_baptism: '🌊',
            spirit_baptism: '🕊️',
            confirmation: '🙏',
            dedication: '💝',
            ordination: '📜',
        };
        return icons[type] || '⭐';
    };

    const getMilestoneLabel = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const renderForm = () => (
        <View testID="milestone-form" style={{gap: 12, marginTop: 8}}>
            {mode === 'create' && (
                <>
                    <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                        {t('milestones.fields.milestoneType')}
                    </ThemedText>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                        {MILESTONE_TYPES.map(type => (
                            <Pressable
                                key={type}
                                onPress={() => setFormData(prev => ({...prev, milestone_type: type}))}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: formData.milestone_type === type
                                        ? (scheme === 'dark' ? '#3B82F6' : '#2563EB')
                                        : (scheme === 'dark' ? '#374151' : '#D1D5DB'),
                                    backgroundColor: formData.milestone_type === type
                                        ? (scheme === 'dark' ? '#1E3A5F' : '#DBEAFE')
                                        : 'transparent',
                                }}
                            >
                                <ThemedText style={{fontSize: 13}}>
                                    {t(`milestones.milestoneTypes.${type}`)}
                                </ThemedText>
                            </Pressable>
                        ))}
                    </View>
                </>
            )}

            {mode === 'edit' && (
                <ThemedText style={{fontSize: 14, fontWeight: '600', color: Colors[scheme].tabIconDefault}}>
                    {getMilestoneIcon(formData.milestone_type)} {getMilestoneLabel(formData.milestone_type)}
                </ThemedText>
            )}

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('milestones.fields.location')}
            </ThemedText>
            <GlassInput
                testID="milestone-location-input"
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({...prev, location: text}))}
                placeholder={t('milestones.fields.locationPlaceholder')}
                editable={!isSubmitting}
                variant="ultra-thin"
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('milestones.fields.officiant')}
            </ThemedText>
            <GlassInput
                testID="milestone-officiant-input"
                value={formData.officiant}
                onChangeText={(text) => setFormData(prev => ({...prev, officiant: text}))}
                placeholder={t('milestones.fields.officiantPlaceholder')}
                editable={!isSubmitting}
                variant="ultra-thin"
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('milestones.fields.notes')}
            </ThemedText>
            <GlassInput
                testID="milestone-notes-input"
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({...prev, notes: text}))}
                placeholder={t('milestones.fields.notesPlaceholder')}
                style={{minHeight: 80, textAlignVertical: 'top'}}
                multiline
                editable={!isSubmitting}
                variant="ultra-thin"
            />

            <View style={{flexDirection: 'row', gap: 12, marginTop: 8}}>
                <Pressable
                    testID="milestone-form-cancel"
                    onPress={handleCancel}
                    style={{flex: 1, padding: 12, borderRadius: 8, alignItems: 'center'}}
                >
                    <ThemedText>{t('common.cancel')}</ThemedText>
                </Pressable>
                <Pressable
                    testID="milestone-form-submit"
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
            title={t('milestones.title')}
            variant="frosted"
            enableElectric={true}
            enableWaves={true}
            testID="milestones-accordion"
        >
            {isLoading ? (
                <ActivityIndicator />
            ) : milestones && milestones.length > 0 ? (
                <View style={{gap: 12}}>
                    {milestones.map((milestone) => (
                        mode === 'edit' && editingId === milestone.id ? (
                            <View key={milestone.id}>{renderForm()}</View>
                        ) : (
                            <GlassCard
                                key={milestone.id}
                                variant="tinted"
                                borderRadius={8}
                                style={{
                                    padding: 12,
                                }}
                            >
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                                    <ThemedText style={{fontSize: 16, fontWeight: '600'}}>
                                        {getMilestoneIcon(milestone.milestone_type)} {getMilestoneLabel(milestone.milestone_type)}
                                    </ThemedText>
                                    {mode === 'view' && (
                                        <View style={{flexDirection: 'row', gap: 8}}>
                                            <Pressable
                                                onPress={() => handleEdit(milestone)}
                                                style={{padding: 4}}
                                            >
                                                <ThemedText style={{
                                                    color: scheme === 'dark' ? '#3B82F6' : '#2563EB',
                                                    fontSize: 14
                                                }}>{t('common.edit')}</ThemedText>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => handleDelete(milestone.id, getMilestoneLabel(milestone.milestone_type))}
                                                style={{padding: 4}}
                                            >
                                                <ThemedText style={{color: '#EF4444', fontSize: 14}}>{t('common.delete')}</ThemedText>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                                {milestone.milestone_date && (
                                    <ThemedText style={{fontSize: 14, color: Colors[scheme].tabIconDefault}}>
                                        📅 {formatDateForDisplay(milestone.milestone_date)}
                                    </ThemedText>
                                )}
                                {milestone.location && (
                                    <ThemedText style={{fontSize: 13, marginTop: 4}}>
                                        📍 {milestone.location}
                                    </ThemedText>
                                )}
                                {milestone.officiant && (
                                    <ThemedText style={{fontSize: 13, marginTop: 2}}>
                                        👤 {milestone.officiant}
                                    </ThemedText>
                                )}
                                {milestone.notes && (
                                    <ThemedText style={{fontSize: 13, marginTop: 4, fontStyle: 'italic'}}>
                                        {milestone.notes}
                                    </ThemedText>
                                )}
                            </GlassCard>
                        )
                    ))}
                </View>
            ) : (
                <ThemedText style={{textAlign: 'center', color: Colors[scheme].tabIconDefault}}>
                    {t('milestones.emptyState')}
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
                        {t('milestones.addButton')}
                    </ThemedText>
                </Pressable>
            )}
        </GlassAccordion>
    );
}

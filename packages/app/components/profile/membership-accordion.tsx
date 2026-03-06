import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Alert, Pressable, Switch, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion, GlassCard, ThemedText, useColorScheme, Colors} from '@yuhuu/components';
import {
    useCreateMyMembershipHistoryMutation,
    useDeleteMyMembershipHistoryMutation,
    useMyMembershipHistoryQuery,
    useUpdateMyMembershipHistoryMutation,
    useUserMembershipHistoryQuery,
    useCreateUserMembershipHistoryMutation,
    useUpdateUserMembershipHistoryMutation,
    useDeleteUserMembershipHistoryMutation,
} from '@/features/membership/api';
import type {CreateMembershipHistoryInput, TransferType} from '@/features/membership/api';
import {getErrorMessage, isConflictError} from '@/lib/errors';
import {formatDateForDisplay} from '@/lib/dates';

type FormMode = 'view' | 'create' | 'edit';

type MembershipFormData = {
    church_name: string;
    start_date: string;
    end_date: string;
    hasEndDate: boolean;
    transfer_type: TransferType | '';
    previous_role: string;
    transfer_letter_received: boolean;
    notes: string;
};

const initialFormData: MembershipFormData = {
    church_name: '',
    start_date: '',
    end_date: '',
    hasEndDate: false,
    transfer_type: '',
    previous_role: '',
    transfer_letter_received: false,
    notes: '',
};

const TRANSFER_TYPES: TransferType[] = ['transfer_in', 'transfer_out', 'new_member', 'restored'];

interface MembershipAccordionProps {
    userId?: number;
}

export function MembershipAccordion({userId}: MembershipAccordionProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const isAdminView = userId !== undefined;
    const myQuery = useMyMembershipHistoryQuery();
    const userQuery = useUserMembershipHistoryQuery(userId ?? 0);
    const {data: history, isLoading} = isAdminView ? userQuery : myQuery;

    // Call all hooks unconditionally (Rules of Hooks)
    const deleteMyMutation = useDeleteMyMembershipHistoryMutation();
    const createMyMutation = useCreateMyMembershipHistoryMutation();
    const updateMyMutation = useUpdateMyMembershipHistoryMutation();
    const deleteUserMutation = useDeleteUserMembershipHistoryMutation(userId ?? 0);
    const createUserMutation = useCreateUserMembershipHistoryMutation(userId ?? 0);
    const updateUserMutation = useUpdateUserMembershipHistoryMutation(userId ?? 0);

    // Select which mutation to use based on admin context
    const deleteMutation = isAdminView ? deleteUserMutation : deleteMyMutation;
    const createMutation = isAdminView ? createUserMutation : createMyMutation;
    const updateMutation = isAdminView ? updateUserMutation : updateMyMutation;

    const [mode, setMode] = useState<FormMode>('view');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<MembershipFormData>(initialFormData);

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

    const handleDelete = (id: number, churchName: string) => {
        Alert.alert(
            t('membership.deleteTitle'),
            t('membership.deleteMessage', {churchName}),
            [
                {text: t('common.cancel'), style: 'cancel'},
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        deleteMutation.mutate(id, {
                            onSuccess: () => Alert.alert(t('common.success'), t('membership.deleteSuccess')),
                            onError: (e) => Alert.alert(t('common.error'), getErrorMessage(e)),
                        });
                    },
                },
            ]
        );
    };

    const handleEdit = (record: NonNullable<typeof history>[number]) => {
        setMode('edit');
        setEditingId(record.id);
        setFormData({
            church_name: record.church_name,
            start_date: record.start_date || '',
            end_date: record.end_date || '',
            hasEndDate: !!record.end_date,
            transfer_type: record.transfer_type || '',
            previous_role: record.previous_role || '',
            transfer_letter_received: record.transfer_letter_received || false,
            notes: record.notes || '',
        });
    };

    const handleCancel = () => {
        setMode('view');
        setEditingId(null);
        setFormData(initialFormData);
    };

    const handleSubmit = () => {
        if (!formData.church_name.trim()) {
            Alert.alert(t('common.error'), t('membership.errors.churchNameRequired'));
            return;
        }

        const isActiveMembership = !formData.hasEndDate;

        // Check active membership constraint (only for create, and only if creating active membership)
        if (mode === 'create' && isActiveMembership) {
            const hasActiveMembership = history?.some(r => !r.end_date);
            if (hasActiveMembership) {
                Alert.alert(t('common.error'), t('membership.duplicateActiveError'));
                return;
            }
        }

        const data: CreateMembershipHistoryInput = {
            church_name: formData.church_name.trim(),
            ...(formData.start_date ? {start_date: formData.start_date} : {}),
            end_date: formData.hasEndDate ? (formData.end_date || new Date().toISOString().split('T')[0]) : null,
            ...(formData.transfer_type ? {transfer_type: formData.transfer_type as TransferType} : {}),
            ...(formData.previous_role.trim() ? {previous_role: formData.previous_role.trim()} : {}),
            transfer_letter_received: formData.transfer_letter_received,
            ...(formData.notes.trim() ? {notes: formData.notes.trim()} : {}),
        };

        if (mode === 'create') {
            createMutation.mutate(data, {
                onSuccess: () => {
                    Alert.alert(t('common.success'), t('membership.createSuccess'));
                    handleCancel();
                },
                onError: (e) => {
                    if (isConflictError(e)) {
                        Alert.alert(t('common.error'), t('membership.duplicateActiveError'));
                    } else {
                        Alert.alert(t('common.error'), getErrorMessage(e, t('membership.createError')));
                    }
                },
            });
        } else if (mode === 'edit' && editingId !== null) {
            updateMutation.mutate({id: editingId, data}, {
                onSuccess: () => {
                    Alert.alert(t('common.success'), t('membership.updateSuccess'));
                    handleCancel();
                },
                onError: (e) => {
                    Alert.alert(t('common.error'), getErrorMessage(e, t('membership.updateError')));
                },
            });
        }
    };

    const getTransferLabel = (type?: string) => {
        const labels: Record<string, string> = {
            transfer_in: '⬅️ Transfer In',
            transfer_out: '➡️ Transfer Out',
            new_member: '✨ New Member',
            restored: '🔄 Restored',
        };
        return type ? labels[type] || type : '';
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const renderForm = () => (
        <View testID="membership-form" style={{gap: 12, marginTop: 8}}>
            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('membership.fields.churchName')}
            </ThemedText>
            <TextInput
                testID="membership-church-input"
                value={formData.church_name}
                onChangeText={(text) => setFormData(prev => ({...prev, church_name: text}))}
                placeholder={t('membership.fields.churchNamePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                editable={!isSubmitting}
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('membership.fields.transferType')}
            </ThemedText>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                {TRANSFER_TYPES.map(type => (
                    <Pressable
                        key={type}
                        onPress={() => setFormData(prev => ({
                            ...prev,
                            transfer_type: prev.transfer_type === type ? '' : type,
                        }))}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: formData.transfer_type === type
                                ? (scheme === 'dark' ? '#3B82F6' : '#2563EB')
                                : (scheme === 'dark' ? '#374151' : '#D1D5DB'),
                            backgroundColor: formData.transfer_type === type
                                ? (scheme === 'dark' ? '#1E3A5F' : '#DBEAFE')
                                : 'transparent',
                        }}
                    >
                        <ThemedText style={{fontSize: 13}}>
                            {t(`membership.transferTypes.${type}`)}
                        </ThemedText>
                    </Pressable>
                ))}
            </View>

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('membership.fields.previousRole')}
            </ThemedText>
            <TextInput
                testID="membership-role-input"
                value={formData.previous_role}
                onChangeText={(text) => setFormData(prev => ({...prev, previous_role: text}))}
                placeholder={t('membership.fields.previousRolePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                editable={!isSubmitting}
            />

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                    {t('membership.fields.transferLetterReceived')}
                </ThemedText>
                <Switch
                    testID="membership-letter-switch"
                    value={formData.transfer_letter_received}
                    onValueChange={(val) => setFormData(prev => ({...prev, transfer_letter_received: val}))}
                    disabled={isSubmitting}
                />
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <View>
                    <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                        {t('membership.fields.endDate')}
                    </ThemedText>
                    <ThemedText style={{fontSize: 12, color: Colors[scheme].tabIconDefault}}>
                        {t('membership.fields.endDateHint')}
                    </ThemedText>
                </View>
                <Switch
                    testID="membership-has-end-date-switch"
                    value={formData.hasEndDate}
                    onValueChange={(val) => setFormData(prev => ({...prev, hasEndDate: val}))}
                    disabled={isSubmitting}
                />
            </View>

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('membership.fields.notes')}
            </ThemedText>
            <TextInput
                testID="membership-notes-input"
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({...prev, notes: text}))}
                placeholder={t('membership.fields.notesPlaceholder')}
                style={[inputStyles.container, {minHeight: 80, textAlignVertical: 'top'}]}
                placeholderTextColor={inputStyles.placeholderColor}
                multiline
                editable={!isSubmitting}
            />

            <View style={{flexDirection: 'row', gap: 12, marginTop: 8}}>
                <Pressable
                    testID="membership-form-cancel"
                    onPress={handleCancel}
                    style={{flex: 1, padding: 12, borderRadius: 8, alignItems: 'center'}}
                >
                    <ThemedText>{t('common.cancel')}</ThemedText>
                </Pressable>
                <Pressable
                    testID="membership-form-submit"
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
            title={t('membership.title')}
            variant="frosted"
            enableElectric={true}
            enableWaves={true}
            testID="membership-accordion"
        >
            {isLoading ? (
                <ActivityIndicator />
            ) : history && history.length > 0 ? (
                <View style={{gap: 12}}>
                    {history.map((record) => (
                        mode === 'edit' && editingId === record.id ? (
                            <View key={record.id}>{renderForm()}</View>
                        ) : (
                            <GlassCard
                                key={record.id}
                                variant="tinted"
                                borderRadius={8}
                                style={{
                                    padding: 12,
                                }}
                            >
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                                    <View style={{flex: 1}}>
                                        <ThemedText style={{fontSize: 16, fontWeight: '600'}}>
                                            {record.church_name}
                                        </ThemedText>
                                        {!record.end_date && (
                                            <View
                                                style={{
                                                    backgroundColor: '#10B981',
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 2,
                                                    borderRadius: 4,
                                                    alignSelf: 'flex-start',
                                                    marginTop: 4,
                                                }}
                                            >
                                                <ThemedText style={{color: 'white', fontSize: 12, fontWeight: '600'}}>
                                                    {t('membership.active')}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                    {mode === 'view' && (
                                        <View style={{flexDirection: 'row', gap: 8}}>
                                            <Pressable
                                                onPress={() => handleEdit(record)}
                                                style={{padding: 4}}
                                            >
                                                <ThemedText style={{
                                                    color: scheme === 'dark' ? '#3B82F6' : '#2563EB',
                                                    fontSize: 14
                                                }}>{t('common.edit')}</ThemedText>
                                            </Pressable>
                                            <Pressable
                                                onPress={() => handleDelete(record.id, record.church_name)}
                                                style={{padding: 4}}
                                            >
                                                <ThemedText style={{color: '#EF4444', fontSize: 14}}>{t('common.delete')}</ThemedText>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                                {record.transfer_type && (
                                    <ThemedText style={{fontSize: 14, color: Colors[scheme].tabIconDefault, marginTop: 4}}>
                                        {getTransferLabel(record.transfer_type)}
                                    </ThemedText>
                                )}
                                {record.start_date && (
                                    <ThemedText style={{fontSize: 13, marginTop: 4}}>
                                        📅 {formatDateForDisplay(record.start_date)}
                                        {record.end_date && ` - ${formatDateForDisplay(record.end_date)}`}
                                    </ThemedText>
                                )}
                                {record.previous_role && (
                                    <ThemedText style={{fontSize: 13, marginTop: 2}}>
                                        👤 {record.previous_role}
                                    </ThemedText>
                                )}
                                {record.notes && (
                                    <ThemedText style={{fontSize: 13, marginTop: 4, fontStyle: 'italic'}}>
                                        {record.notes}
                                    </ThemedText>
                                )}
                            </GlassCard>
                        )
                    ))}
                </View>
            ) : (
                <ThemedText style={{textAlign: 'center', color: Colors[scheme].tabIconDefault}}>
                    {t('membership.emptyState')}
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
                        {t('membership.addButton')}
                    </ThemedText>
                </Pressable>
            )}
        </GlassAccordion>
    );
}

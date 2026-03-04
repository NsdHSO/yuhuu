import React from 'react';
import {View, Pressable, Alert, ActivityIndicator} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Accordion} from '@/components/admin/accordion';
import {ThemedText} from '@/components/themed-text';
import {useColorScheme} from '@/hooks/use-color-scheme';
import {
    useMyMembershipHistoryQuery,
    useDeleteMyMembershipHistoryMutation,
} from '@/features/membership/api';
import {getErrorMessage} from '@/lib/errors';
import {formatDateForDisplay} from '@/lib/dates';
import {Colors} from '@/constants/theme';

export function MembershipAccordion() {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const {data: history, isLoading} = useMyMembershipHistoryQuery();
    const deleteMutation = useDeleteMyMembershipHistoryMutation();

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

    const getTransferLabel = (type?: string) => {
        const labels: Record<string, string> = {
            transfer_in: '⬅️ Transfer In',
            transfer_out: '➡️ Transfer Out',
            new_member: '✨ New Member',
            restored: '🔄 Restored',
        };
        return type ? labels[type] || type : '';
    };

    return (
        <Accordion title={t('membership.title')} testID="membership-accordion">
            {isLoading ? (
                <ActivityIndicator />
            ) : history && history.length > 0 ? (
                <View style={{gap: 12}}>
                    {history.map((record) => (
                        <View
                            key={record.id}
                            style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: scheme === 'dark' ? '#1F2937' : '#F9FAFB',
                                borderWidth: 1,
                                borderColor: scheme === 'dark' ? '#374151' : '#E5E7EB',
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
                                <Pressable
                                    onPress={() => handleDelete(record.id, record.church_name)}
                                    style={{padding: 4}}
                                >
                                    <ThemedText style={{color: '#EF4444', fontSize: 14}}>{t('common.delete')}</ThemedText>
                                </Pressable>
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
                        </View>
                    ))}
                </View>
            ) : (
                <ThemedText style={{textAlign: 'center', color: Colors[scheme].tabIconDefault}}>
                    {t('membership.emptyState')}
                </ThemedText>
            )}
        </Accordion>
    );
}

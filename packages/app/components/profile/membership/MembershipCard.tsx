import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassCard, ThemedText, useColorScheme, Colors, getGlowColor, useGlowVariant} from '@yuhuu/components';
import {formatDateForDisplay} from '@/lib/dates';
import {getTransferLabel} from './membershipHelpers';

interface MembershipRecord {
    id: number;
    church_name: string;
    start_date: string | null;
    end_date: string | null;
    transfer_type: string | null;
    previous_role: string | null;
    notes: string | null;
}

interface MembershipCardProps {
    record: MembershipRecord;
    onEdit: () => void;
    onDelete: () => void;
    showActions: boolean;
}

export function MembershipCard({record, onEdit, onDelete, showActions}: MembershipCardProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    return (
        <GlassCard variant="tinted" borderRadius={8} style={{padding: 12}}>
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
                {showActions && (
                    <View style={{flexDirection: 'row', gap: 8}}>
                        <Pressable onPress={onEdit} style={{padding: 4}}>
                            <ThemedText style={{color: activeColor, fontSize: 14}}>
                                {t('common.edit')}
                            </ThemedText>
                        </Pressable>
                        <Pressable onPress={onDelete} style={{padding: 4}}>
                            <ThemedText style={{color: '#EF4444', fontSize: 14}}>
                                {t('common.delete')}
                            </ThemedText>
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
    );
}

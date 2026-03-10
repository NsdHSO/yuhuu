import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Colors, GlassCard, ThemedText, useColorScheme, getGlowColor, useGlowVariant} from '@yuhuu/components';
import {formatDateForDisplay} from '@/lib/dates';
import {getMilestoneIcon, getMilestoneLabel} from './milestonesHelpers';

interface MilestoneItem {
    id: number;
    milestone_type: string;
    milestone_date?: string | null;
    location?: string | null;
    officiant?: string | null;
    notes?: string | null;
}

interface MilestoneCardProps {
    milestone: MilestoneItem;
    onEdit: () => void;
    onDelete: () => void;
    showActions: boolean;
}

export function MilestoneCard({milestone, onEdit, onDelete, showActions}: MilestoneCardProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    return (
        <GlassCard variant="tinted" borderRadius={8} style={{padding: 12}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                <ThemedText style={{fontSize: 16, fontWeight: '600'}}>
                    {getMilestoneIcon(milestone.milestone_type)} {getMilestoneLabel(milestone.milestone_type)}
                </ThemedText>
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
            {milestone.milestone_date && (
                <ThemedText style={{fontSize: 14, color: Colors[scheme].tabIconDefault}}>
                    {'\uD83D\uDCC5'} {formatDateForDisplay(milestone.milestone_date)}
                </ThemedText>
            )}
            {milestone.location && (
                <ThemedText style={{fontSize: 13, marginTop: 4}}>
                    {'\uD83D\uDCCD'} {milestone.location}
                </ThemedText>
            )}
            {milestone.officiant && (
                <ThemedText style={{fontSize: 13, marginTop: 2}}>
                    {'\uD83D\uDC64'} {milestone.officiant}
                </ThemedText>
            )}
            {milestone.notes && (
                <ThemedText style={{fontSize: 13, marginTop: 4, fontStyle: 'italic'}}>
                    {milestone.notes}
                </ThemedText>
            )}
        </GlassCard>
    );
}

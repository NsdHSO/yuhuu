import React from 'react';
import {View, Pressable, Alert, ActivityIndicator} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Accordion} from '@/components/admin/accordion';
import {ThemedText} from '@/components/themed-text';
import {useColorScheme} from '@/hooks/use-color-scheme';
import {
    useMyMilestonesQuery,
    useUserMilestonesQuery,
    useDeleteMyMilestoneMutation,
} from '@/features/milestones/api';
import {getErrorMessage} from '@/lib/errors';
import {formatDateForDisplay} from '@/lib/dates';
import {Colors} from '@/constants/theme';

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
    const deleteMutation = useDeleteMyMilestoneMutation();

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

    return (
        <Accordion title={t('milestones.title')} testID="milestones-accordion">
            {isLoading ? (
                <ActivityIndicator />
            ) : milestones && milestones.length > 0 ? (
                <View style={{gap: 12}}>
                    {milestones.map((milestone) => (
                        <View
                            key={milestone.id}
                            style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: scheme === 'dark' ? '#1F2937' : '#F9FAFB',
                                borderWidth: 1,
                                borderColor: scheme === 'dark' ? '#374151' : '#E5E7EB',
                            }}
                        >
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                                <ThemedText style={{fontSize: 16, fontWeight: '600'}}>
                                    {getMilestoneIcon(milestone.milestone_type)} {getMilestoneLabel(milestone.milestone_type)}
                                </ThemedText>
                                {!isAdmin && (
                                    <Pressable
                                        onPress={() => handleDelete(milestone.id, getMilestoneLabel(milestone.milestone_type))}
                                        style={{padding: 4}}
                                    >
                                        <ThemedText style={{color: '#EF4444', fontSize: 14}}>{t('common.delete')}</ThemedText>
                                    </Pressable>
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
                        </View>
                    ))}
                </View>
            ) : (
                <ThemedText style={{textAlign: 'center', color: Colors[scheme].tabIconDefault}}>
                    {t('milestones.emptyState')}
                </ThemedText>
            )}
        </Accordion>
    );
}

import React, {useState} from 'react';
import {View, Text, Pressable, Alert, ActivityIndicator} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Accordion} from '@/components/admin/accordion';
import {ThemedText} from '@/components/themed-text';
import {useColorScheme} from '@/hooks/use-color-scheme';
import {
    useMyFamilyQuery,
    useUserFamilyQuery,
    useCreateMyFamilyRelationshipMutation,
    useDeleteMyFamilyRelationshipMutation,
    type FamilyRelationship,
} from '@/features/family/api';
import {isConflictError, getErrorMessage} from '@/lib/errors';
import {Colors} from '@/constants/theme';

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
    const deleteMutation = useDeleteMyFamilyRelationshipMutation();

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

    const getRelationshipLabel = (type: string) => {
        const labels: Record<string, string> = {
            spouse: '💑 Spouse',
            child: '👶 Child',
            parent: '👪 Parent',
            sibling: '👫 Sibling',
        };
        return labels[type] || type;
    };

    return (
        <Accordion title={t('family.title')} testID="family-accordion">
            {isLoading ? (
                <ActivityIndicator />
            ) : family && family.length > 0 ? (
                <View style={{gap: 12}}>
                    {family.map((member) => (
                        <View
                            key={member.id}
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
                                    {member.related_person_name || `User #${member.related_user_id}`}
                                </ThemedText>
                                {!isAdmin && (
                                    <Pressable
                                        onPress={() => handleDelete(member.id, member.related_person_name || t('family.thisMember'))}
                                        style={{padding: 4}}
                                    >
                                        <Text style={{color: '#EF4444', fontSize: 14}}>{t('common.delete')}</Text>
                                    </Pressable>
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
                        </View>
                    ))}
                </View>
            ) : (
                <ThemedText style={{textAlign: 'center', color: Colors[scheme].tabIconDefault}}>
                    {t('family.emptyState')}
                </ThemedText>
            )}
        </Accordion>
    );
}

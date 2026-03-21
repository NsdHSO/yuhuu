import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassContentCard, ThemedText, useColorScheme, Colors, useGlassColors} from '@yuhuu/components';
import type {FamilyRelationship} from '@/features/family/api';

interface FamilyCardProps {
    member: FamilyRelationship;
    onEdit: () => void;
    onDelete: () => void;
    showActions: boolean;
}

const getRelationshipLabel = (type: string) => {
    const labels: Record<string, string> = {
        spouse: '💑 Spouse',
        child: '👶 Child',
        parent: '👪 Parent',
        sibling: '👫 Sibling',
    };
    return labels[type] || type;
};

export function FamilyCard({member, onEdit, onDelete, showActions}: FamilyCardProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const colors = useGlassColors();

    return (
        <GlassContentCard borderRadius={8} padding={12} style={{marginBottom: 8}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                <ThemedText style={{fontSize: 16, fontWeight: '600'}}>
                    {member.related_person_name || `User #${member.related_user_id}`}
                </ThemedText>
                {showActions && (
                    <View style={{flexDirection: 'row', gap: 8}}>
                        <Pressable onPress={onEdit} style={{padding: 4}}>
                            <ThemedText style={{color: colors.activeColor, fontSize: 14}}>
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
        </GlassContentCard>
    );
}

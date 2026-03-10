import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassCard, ThemedText, useColorScheme, Colors, getGlowColor, useGlowVariant} from '@yuhuu/components';

interface FamilyMember {
    id: number;
    relationship_type: string;
    related_person_name: string | null;
    related_user_id: number | null;
    related_person_phone: string | null;
    related_person_email: string | null;
}

interface FamilyCardProps {
    member: FamilyMember;
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
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    return (
        <GlassCard
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
    );
}

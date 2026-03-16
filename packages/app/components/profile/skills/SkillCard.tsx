import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassContentCard, ThemedText, useColorScheme, Colors, useGlassColors} from '@yuhuu/components';
import {getProficiencyColor, getProficiencyLabel, getCategoryIcon} from './skillsHelpers';

interface Skill {
    id: number;
    skill_name: string;
    skill_category?: string;
    proficiency_level?: string;
    years_of_experience?: number;
    is_willing_to_serve: boolean;
}

interface SkillCardProps {
    skill: Skill;
    onEdit: () => void;
    onDelete: () => void;
    showActions: boolean;
}

export function SkillCard({skill, onEdit, onDelete, showActions}: SkillCardProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const colors = useGlassColors();

    return (
        <GlassContentCard borderRadius={8} padding={12}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                <View style={{flex: 1}}>
                    <ThemedText style={{fontSize: 16, fontWeight: '600'}}>
                        {skill.skill_name}
                    </ThemedText>
                    {skill.proficiency_level && (
                        <View style={{
                            backgroundColor: getProficiencyColor(skill.proficiency_level),
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                            alignSelf: 'flex-start',
                            marginTop: 4,
                        }}>
                            <ThemedText style={{color: 'white', fontSize: 12, fontWeight: '600'}}>
                                {getProficiencyLabel(skill.proficiency_level)}
                            </ThemedText>
                        </View>
                    )}
                </View>
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
            {skill.skill_category && (
                <ThemedText style={{fontSize: 14, color: Colors[scheme].tabIconDefault, marginTop: 4}}>
                    {getCategoryIcon(skill.skill_category)} {skill.skill_category}
                </ThemedText>
            )}
            {skill.years_of_experience !== undefined && (
                <ThemedText style={{fontSize: 13, marginTop: 4}}>
                    📊 {t('skills.yearsExperience', {count: skill.years_of_experience})}
                </ThemedText>
            )}
            {skill.is_willing_to_serve && (
                <ThemedText style={{fontSize: 13, marginTop: 2, color: '#10B981'}}>
                    {t('skills.willingToServe')}
                </ThemedText>
            )}
        </GlassContentCard>
    );
}

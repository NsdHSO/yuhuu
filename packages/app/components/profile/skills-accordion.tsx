import React from 'react';
import {ActivityIndicator, Alert, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Accordion} from '@/components/admin/accordion';
import {ThemedText} from '@/components/themed-text';
import {useColorScheme} from '@/hooks/use-color-scheme';
import {useDeleteMySkillMutation, useMySkillsQuery, useUserSkillsQuery,} from '@/features/skills/api';
import {getErrorMessage} from '@/lib/errors';
import {Colors} from '@/constants/theme';

type SkillsAccordionProps = {
    userId?: number;
};

export function SkillsAccordion({userId}: SkillsAccordionProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const isAdmin = userId !== undefined;
    const mySkills = useMySkillsQuery();
    const userSkills = useUserSkillsQuery(userId ?? 0, {enabled: isAdmin});
    const {data: skills, isLoading} = isAdmin ? userSkills : mySkills;
    const deleteMutation = useDeleteMySkillMutation();

    const handleDelete = (id: number, skillName: string) => {
        Alert.alert(
            t('skills.deleteTitle'),
            t('skills.deleteMessage', {skillName}),
            [
                {text: t('common.cancel'), style: 'cancel'},
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        deleteMutation.mutate(id, {
                            onSuccess: () => Alert.alert(t('common.success'), t('skills.deleteSuccess')),
                            onError: (e) => Alert.alert(t('common.error'), getErrorMessage(e)),
                        });
                    },
                },
            ]
        );
    };

    const getProficiencyColor = (level?: string) => {
        const colors: Record<string, string> = {
            beginner: '#94A3B8',
            intermediate: '#60A5FA',
            advanced: '#8B5CF6',
            expert: '#F59E0B',
        };
        return level ? colors[level] || '#94A3B8' : '#94A3B8';
    };

    const getProficiencyLabel = (level?: string) => {
        if (!level) return '';
        return level.charAt(0).toUpperCase() + level.slice(1);
    };

    const getCategoryIcon = (category?: string) => {
        const icons: Record<string, string> = {
            Music: '🎵',
            Technology: '💻',
            Teaching: '📚',
            Administration: '📋',
            Hospitality: '🤝',
            'Creative Arts': '🎨',
        };
        return category ? icons[category] || '⭐' : '⭐';
    };

    return (
        <Accordion title={t('skills.title')} testID="skills-accordion">
            {isLoading ? (
                <ActivityIndicator/>
            ) : skills && skills.length > 0 ? (
                <View style={{gap: 12}}>
                    {skills.map((skill) => (
                        <View
                            key={skill.id}
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
                                        {skill.skill_name}
                                    </ThemedText>
                                    {skill.proficiency_level && (
                                        <View
                                            style={{
                                                backgroundColor: getProficiencyColor(skill.proficiency_level),
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                borderRadius: 4,
                                                alignSelf: 'flex-start',
                                                marginTop: 4,
                                            }}
                                        >
                                            <ThemedText style={{color: 'white', fontSize: 12, fontWeight: '600'}}>
                                                {getProficiencyLabel(skill.proficiency_level)}
                                            </ThemedText>
                                        </View>
                                    )}
                                </View>
                                {!isAdmin && (
                                    <Pressable
                                        onPress={() => handleDelete(skill.id, skill.skill_name)}
                                        style={{padding: 4}}
                                    >
                                        <ThemedText style={{color: '#EF4444', fontSize: 14}}>{t('common.delete')}</ThemedText>
                                    </Pressable>
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
                        </View>
                    ))}
                </View>
            ) : (
                <ThemedText style={{textAlign: 'center', color: Colors[scheme].tabIconDefault}}>
                    {t('skills.emptyState')}
                </ThemedText>
            )}
        </Accordion>
    );
}

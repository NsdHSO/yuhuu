import type {CreateUserSkillInput, ProficiencyLevel, SkillCategory} from '@/features/skills/api';

export type SkillFormData = {
    skill_name: string;
    skill_category: SkillCategory | '';
    proficiency_level: ProficiencyLevel | '';
    years_of_experience: string;
    is_willing_to_serve: boolean;
};

export const initialSkillFormData: SkillFormData = {
    skill_name: '',
    skill_category: '',
    proficiency_level: '',
    years_of_experience: '',
    is_willing_to_serve: true,
};

export const CATEGORIES: SkillCategory[] = ['Music', 'Technology', 'Teaching', 'Administration', 'Hospitality', 'Creative Arts'];
export const PROFICIENCY_LEVELS: ProficiencyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export function validateSkillForm(data: SkillFormData, t: (key: string) => string): string | null {
    if (!data.skill_name.trim()) {
        return t('skills.errors.skillNameRequired');
    }
    return null;
}

export function transformSkillData(data: SkillFormData): CreateUserSkillInput {
    return {
        skill_name: data.skill_name.trim(),
        ...(data.skill_category ? {skill_category: data.skill_category as SkillCategory} : {}),
        ...(data.proficiency_level ? {proficiency_level: data.proficiency_level as ProficiencyLevel} : {}),
        ...(data.years_of_experience ? {years_of_experience: parseInt(data.years_of_experience, 10)} : {}),
        is_willing_to_serve: data.is_willing_to_serve,
    };
}

export function getSkillMessages(t: (key: string, params?: any) => string) {
    return {
        deleteTitle: t('skills.deleteTitle'),
        deleteMessage: t('skills.deleteMessage', {skillName: '{{name}}'}),
        deleteSuccess: t('skills.deleteSuccess'),
        createSuccess: t('skills.createSuccess'),
        updateSuccess: t('skills.updateSuccess'),
        cancel: t('common.cancel'),
        delete: t('common.delete'),
        error: t('common.error'),
        success: t('common.success'),
    };
}

export function getProficiencyColor(level?: string): string {
    const colors: Record<string, string> = {
        beginner: '#94A3B8',
        intermediate: '#60A5FA',
        advanced: '#8B5CF6',
        expert: '#F59E0B',
    };
    return level ? colors[level] || '#94A3B8' : '#94A3B8';
}

export function getProficiencyLabel(level?: string): string {
    if (!level) return '';
    return level.charAt(0).toUpperCase() + level.slice(1);
}

export function getCategoryIcon(category?: string): string {
    const icons: Record<string, string> = {
        Music: '🎵',
        Technology: '💻',
        Teaching: '📚',
        Administration: '📋',
        Hospitality: '🤝',
        'Creative Arts': '🎨',
    };
    return category ? icons[category] || '⭐' : '⭐';
}

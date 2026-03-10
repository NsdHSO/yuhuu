import type {CreateSpiritualMilestoneInput, MilestoneType} from '@/features/milestones/api';

export type MilestoneFormData = {
    milestone_type: MilestoneType;
    milestone_date: string;
    location: string;
    officiant: string;
    notes: string;
};

export const initialMilestoneFormData: MilestoneFormData = {
    milestone_type: 'conversion',
    milestone_date: '',
    location: '',
    officiant: '',
    notes: '',
};

export const MILESTONE_TYPES: MilestoneType[] = [
    'conversion',
    'baptism',
    'water_baptism',
    'spirit_baptism',
    'confirmation',
    'dedication',
    'ordination',
];

export function getMilestoneIcon(type: string) {
    const icons: Record<string, string> = {
        conversion: '\u2728',
        baptism: '\uD83D\uDCA7',
        water_baptism: '\uD83C\uDF0A',
        spirit_baptism: '\uD83D\uDD4A\uFE0F',
        confirmation: '\uD83D\uDE4F',
        dedication: '\uD83D\uDC9D',
        ordination: '\uD83D\uDCDC',
    };
    return icons[type] || '\u2B50';
}

export function getMilestoneLabel(type: string) {
    return type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function validateMilestoneForm(
    data: MilestoneFormData,
    existingTypes: MilestoneType[],
    mode: 'view' | 'create' | 'edit',
    t: (key: string) => string,
): string | null {
    if (mode === 'create' && existingTypes.includes(data.milestone_type)) {
        return t('milestones.duplicateError');
    }
    return null;
}

export function transformMilestoneData(data: MilestoneFormData): CreateSpiritualMilestoneInput {
    return {
        milestone_type: data.milestone_type,
        ...(data.milestone_date ? {milestone_date: data.milestone_date} : {}),
        ...(data.location.trim() ? {location: data.location.trim()} : {}),
        ...(data.officiant.trim() ? {officiant: data.officiant.trim()} : {}),
        ...(data.notes.trim() ? {notes: data.notes.trim()} : {}),
    };
}

export function transformMilestoneUpdateData(data: MilestoneFormData) {
    return {
        ...(data.milestone_date ? {milestone_date: data.milestone_date} : {}),
        ...(data.location.trim() ? {location: data.location.trim()} : {}),
        ...(data.officiant.trim() ? {officiant: data.officiant.trim()} : {}),
        ...(data.notes.trim() ? {notes: data.notes.trim()} : {}),
    };
}

export function getMilestoneMessages(t: (key: string, params?: any) => string) {
    return {
        deleteTitle: t('milestones.deleteTitle'),
        deleteMessage: t('milestones.deleteMessage', {type: '{{name}}'}),
        deleteSuccess: t('milestones.deleteSuccess'),
        createSuccess: t('milestones.createSuccess'),
        updateSuccess: t('milestones.updateSuccess'),
        cancel: t('common.cancel'),
        delete: t('common.delete'),
        error: t('common.error'),
        success: t('common.success'),
    };
}

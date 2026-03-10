import type {CreateFamilyRelationshipInput, RelationshipType} from '@/features/family/api';

export type FamilyFormData = {
    relationship_type: RelationshipType;
    related_person_name: string;
    related_person_dob: string;
    related_person_phone: string;
    related_person_email: string;
};

export const initialFamilyFormData: FamilyFormData = {
    relationship_type: 'spouse',
    related_person_name: '',
    related_person_dob: '',
    related_person_phone: '',
    related_person_email: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFamilyForm(data: FamilyFormData, t: (key: string) => string): string | null {
    if (!data.related_person_name.trim()) {
        return t('family.errors.nameRequired');
    }
    if (data.related_person_email.trim() && !EMAIL_REGEX.test(data.related_person_email.trim())) {
        return t('family.errors.invalidEmail');
    }
    return null;
}

export function transformFamilyData(data: FamilyFormData): CreateFamilyRelationshipInput {
    return {
        relationship_type: data.relationship_type,
        related_person_name: data.related_person_name.trim(),
        ...(data.related_person_dob ? {related_person_dob: data.related_person_dob} : {}),
        ...(data.related_person_phone.trim() ? {related_person_phone: data.related_person_phone.trim()} : {}),
        ...(data.related_person_email.trim() ? {related_person_email: data.related_person_email.trim()} : {}),
    };
}

export function getFamilyMessages(t: (key: string, params?: any) => string) {
    return {
        deleteTitle: t('family.deleteTitle'),
        deleteMessage: t('family.deleteMessage', {name: '{{name}}'}),
        deleteSuccess: t('family.deleteSuccess'),
        createSuccess: t('family.createSuccess'),
        updateSuccess: t('family.updateSuccess'),
        cancel: t('common.cancel'),
        delete: t('common.delete'),
        error: t('common.error'),
        success: t('common.success'),
    };
}

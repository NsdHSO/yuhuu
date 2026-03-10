import {Alert} from 'react-native';
import type {CreateMembershipHistoryInput, TransferType} from '@/features/membership/api';
import {isConflictError, getErrorMessage} from '@/lib/errors';

export type MembershipFormData = {
    church_name: string;
    start_date: string;
    end_date: string;
    hasEndDate: boolean;
    transfer_type: TransferType | '';
    previous_role: string;
    transfer_letter_received: boolean;
    notes: string;
};

export const initialMembershipFormData: MembershipFormData = {
    church_name: '',
    start_date: '',
    end_date: '',
    hasEndDate: false,
    transfer_type: '',
    previous_role: '',
    transfer_letter_received: false,
    notes: '',
};

export const TRANSFER_TYPES: TransferType[] = ['transfer_in', 'transfer_out', 'new_member', 'restored'];

export function validateMembershipForm(
    data: MembershipFormData,
    t: (key: string) => string,
    mode: 'create' | 'edit',
    existingHistory?: Array<{end_date: string | null}>,
): string | null {
    if (!data.church_name.trim()) {
        return t('membership.errors.churchNameRequired');
    }

    const isActiveMembership = !data.hasEndDate;
    if (mode === 'create' && isActiveMembership) {
        const hasActiveMembership = existingHistory?.some(r => !r.end_date);
        if (hasActiveMembership) {
            return t('membership.duplicateActiveError');
        }
    }

    return null;
}

export function transformMembershipData(data: MembershipFormData): CreateMembershipHistoryInput {
    return {
        church_name: data.church_name.trim(),
        ...(data.start_date ? {start_date: data.start_date} : {}),
        end_date: data.hasEndDate ? (data.end_date || new Date().toISOString().split('T')[0]) : null,
        ...(data.transfer_type ? {transfer_type: data.transfer_type as TransferType} : {}),
        ...(data.previous_role.trim() ? {previous_role: data.previous_role.trim()} : {}),
        transfer_letter_received: data.transfer_letter_received,
        ...(data.notes.trim() ? {notes: data.notes.trim()} : {}),
    };
}

export function getMembershipMessages(t: (key: string, params?: any) => string) {
    return {
        deleteTitle: t('membership.deleteTitle'),
        deleteMessage: t('membership.deleteMessage', {churchName: '{{name}}'}),
        deleteSuccess: t('membership.deleteSuccess'),
        createSuccess: t('membership.createSuccess'),
        updateSuccess: t('membership.updateSuccess'),
        cancel: t('common.cancel'),
        delete: t('common.delete'),
        error: t('common.error'),
        success: t('common.success'),
    };
}

export function recordToMembershipFormData(r: {
    church_name: string;
    start_date?: string | null;
    end_date?: string | null;
    transfer_type?: string | null;
    previous_role?: string | null;
    transfer_letter_received?: boolean | null;
    notes?: string | null;
}): MembershipFormData {
    return {
        church_name: r.church_name,
        start_date: r.start_date || '',
        end_date: r.end_date || '',
        hasEndDate: !!r.end_date,
        transfer_type: (r.transfer_type || '') as MembershipFormData['transfer_type'],
        previous_role: r.previous_role || '',
        transfer_letter_received: r.transfer_letter_received || false,
        notes: r.notes || '',
    };
}

export function wrapCreateMutation(mutation: any, t: (key: string) => string) {
    return {
        ...mutation,
        mutate: (variables: any, options: any) => mutation.mutate(transformMembershipData(variables), {
            ...options,
            onError: (e: Error) => {
                if (isConflictError(e)) {
                    Alert.alert(t('common.error'), t('membership.duplicateActiveError'));
                } else {
                    Alert.alert(t('common.error'), getErrorMessage(e, t('membership.createError')));
                }
            },
        }),
    };
}

export function wrapUpdateMutation(mutation: any, t: (key: string) => string) {
    return {
        ...mutation,
        mutate: (variables: any, options: any) =>
            mutation.mutate({id: variables.id, data: transformMembershipData(variables.data)}, {
                ...options,
                onError: (e: Error) => Alert.alert(t('common.error'), getErrorMessage(e, t('membership.updateError'))),
            }),
    };
}

export function getTransferLabel(type?: string) {
    const labels: Record<string, string> = {
        transfer_in: '⬅️ Transfer In',
        transfer_out: '➡️ Transfer Out',
        new_member: '✨ New Member',
        restored: '🔄 Restored',
    };
    return type ? labels[type] || type : '';
}

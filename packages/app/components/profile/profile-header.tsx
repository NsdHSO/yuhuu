import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassCard, ThemedText, useColorScheme, Colors} from '@yuhuu/components';

type ProfileHeaderProps = {
    firstName: string;
    lastName: string;
    email: string;
    testID?: string;
};

export function ProfileHeader({
    firstName,
    lastName,
    email,
    testID,
}: ProfileHeaderProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';

    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const initials = getInitials(firstName, lastName, email);

    return (
        <View testID={testID} style={{alignItems: 'center', paddingVertical: 16}}>
            <View
                testID={testID ? `${testID}-avatar` : undefined}
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: Colors[scheme].tint,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                }}
            >
                <ThemedText style={{
                    color: '#fff',
                    fontSize: 28,
                    fontWeight: '700',
                }}>
                    {initials}
                </ThemedText>
            </View>
            <ThemedText style={{fontSize: 20, fontWeight: '700'}}>
                {fullName || t('profile.noName')}
            </ThemedText>
            <ThemedText
                lightColor="#6B7280"
                darkColor="#9CA3AF"
                style={{fontSize: 14, marginTop: 4}}
            >
                {email}
            </ThemedText>
        </View>
    );
}

function getInitials(firstName: string, lastName: string, email: string): string {
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (lastName) return lastName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return '?';
}

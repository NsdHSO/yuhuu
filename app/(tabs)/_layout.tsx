import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMyRolesQuery } from '@/features/roles/meRoles';
import { useBootstrapGate } from '@/features/bootstrap/api';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const ready = useBootstrapGate();
    const { data: myRoles } = useMyRolesQuery({ enabled: ready });
    // Hide Home tab when user has only the Member role
    const isMemberOnly = myRoles ? myRoles.every((r) => r.role_name === 'Member') : true; // default hide to avoid flicker

    return (
        <>
            <Tabs
                initialRouteName="profile"
                screenOptions={{
                    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                    headerShown: false,
                }}
            >
                {/* Home tab - hidden for Member-only users */}
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color}/>,
                        // Hide the tab completely when Member-only
                        href: isMemberOnly ? null : undefined,
                    }}
                />

                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color}/>,
                        tabBarButton: HapticTab,
                    }}
                />
            </Tabs>
        </>
    );
}

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
    // Show Admin tab only for Admin role
    const isAdmin = myRoles ? myRoles.some((r) => r.role_name === 'Admin') : false;

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

                {/* Admin tab - only visible for Admin role */}
                <Tabs.Screen
                    name="admin"
                    options={{
                        title: 'Admin',
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="shield.fill" color={color}/>,
                        // Cannot use tabBarButton with href - removing HapticTab for role-based visibility
                        // Hide the tab when user is not Admin
                        href: isAdmin ? undefined : null,
                    }}
                />

                <Tabs.Screen
                    name="supper"
                    options={{
                        title: 'Supper',
                        tabBarIcon: ({ color }) => <IconSymbol size={28} name="fork.knife" color={color}/>,
                        tabBarButton: HapticTab,
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

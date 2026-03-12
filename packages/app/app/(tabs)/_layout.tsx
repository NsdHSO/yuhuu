import {Tabs} from 'expo-router';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {IconSymbol, Colors, useColorScheme, CustomTabBar} from '@yuhuu/components';
import {useMyRolesQuery} from '@/features/roles/meRoles';
import {useBootstrapGate} from '@/features/bootstrap/api';
import {useMyAssignmentsQuery} from '@/features/visits/hooks';

export default function TabLayout() {
    const {t} = useTranslation();
    const colorScheme = useColorScheme();
    const ready = useBootstrapGate();
    const {data: myRoles} = useMyRolesQuery({enabled: ready});

    // Hide Home tab when user has only the Member role
    const isMemberOnly = myRoles ? myRoles.every((r) => r.role_name === 'Member') : true; // default hide to avoid flicker
    // Show Admin tab only for Admin role
    const isAdmin = myRoles ? myRoles.some((r) => r.role_name === 'Admin') : false;
    // Show Visits tab only if user has assignments
    const {data: myAssignments} = useMyAssignmentsQuery();
    const hasVisits = (myAssignments?.length ?? 0) > 0;

    return (
        <>
            <Tabs
                initialRouteName="profile"
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                    headerShown: false,
                }}
            >
                {/* Home tab - hidden for Member-only users */}
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarLabel: t('tabs.home'),
                        tabBarIcon: ({color}) => <IconSymbol size={28} name="house.fill" color={color}/>,
                        tabBarButton: isMemberOnly ? () => null : undefined,
                    }}
                />

                {/* Admin tab - only visible for Admin role */}
                <Tabs.Screen
                    name="admin"
                    options={{
                        tabBarLabel: t('tabs.admin'),
                        tabBarIcon: ({color}) => <IconSymbol size={28} name="shield.fill" color={color}/>,
                        tabBarButton: isAdmin ? undefined : () => null,
                    }}
                />

                {/* Visits tab - only visible if user has assignments */}
                <Tabs.Screen
                    name="visits"
                    options={{
                        tabBarLabel: t('tabs.visits'),
                        tabBarIcon: ({color}) => <IconSymbol size={28} name="map.fill" color={color}/>,
                        tabBarButton: hasVisits ? undefined : () => null,
                    }}
                />

                <Tabs.Screen
                    name="supper"
                    options={{
                        tabBarLabel: t('tabs.supper'),
                        tabBarIcon: ({color}) => <IconSymbol size={28} name="fork.knife" color={color}/>,
                    }}
                />

                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarLabel: t('tabs.profile'),
                        tabBarIcon: ({color}) => <IconSymbol size={28} name="person.crop.circle" color={color}/>,
                    }}
                />
            </Tabs>
        </>
    );
}

import {Tabs} from 'expo-router';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {HapticTab, IconSymbol, Colors, useColorScheme, GlassView} from '@yuhuu/components';
import {useMyRolesQuery} from '@/features/roles/meRoles';
import {useBootstrapGate} from '@/features/bootstrap/api';

export default function TabLayout() {
    const {t} = useTranslation();
    const colorScheme = useColorScheme();
    const ready = useBootstrapGate();
    const {data: myRoles} = useMyRolesQuery({enabled: ready});
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
                    tabBarStyle: {
                        position: 'absolute',
                        borderTopWidth: 0,
                        backgroundColor: 'transparent',
                        elevation: 0,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                    },
                    tabBarBackground: () => (
                        <GlassView
                            variant="prominent"
                            borderRadius={0}
                            enableShadow={true}
                            shadowLevel="medium"
                            enableBorder={false}
                            style={{flex: 1}}
                        />
                    ),
                }}
            >
                {/* Home tab - hidden for Member-only users */}
                <Tabs.Screen
                    name="index"
                    options={{
                        title: t('tabs.home'),
                        tabBarIcon: ({color}) => <IconSymbol size={28} name="house.fill" color={color}/>,
                        // Hide the tab completely when Member-only
                        href: isMemberOnly ? null : undefined,
                    }}
                />

                {/* Admin tab - only visible for Admin role */}
                <Tabs.Screen
                    name="admin"
                    options={{
                        title: t('tabs.admin'),
                        tabBarIcon: ({color}) => <IconSymbol size={28} name="shield.fill" color={color}/>,
                        // Cannot use tabBarButton with href - removing HapticTab for role-based visibility
                        // Hide the tab when user is not Admin
                        href: isAdmin ? undefined : null,
                    }}
                />

                <Tabs.Screen
                    name="supper"
                    options={{
                        title: t('tabs.supper'),
                        tabBarIcon: ({color}) => <IconSymbol size={28} name="fork.knife" color={color}/>,
                        tabBarButton: HapticTab,
                    }}
                />

                <Tabs.Screen
                    name="profile"
                    options={{
                        title: t('tabs.profile'),
                        tabBarIcon: ({color}) => <IconSymbol size={28} name="person.crop.circle" color={color}/>,
                        tabBarButton: HapticTab,
                    }}
                />
            </Tabs>
        </>
    );
}

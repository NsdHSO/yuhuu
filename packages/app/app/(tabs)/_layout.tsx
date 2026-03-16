import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

import { useBootstrapGate } from "@/features/bootstrap/api";
import { useMyRolesQuery } from "@/features/roles/meRoles";
import { useMyAssignmentsQuery } from "@/features/visits/hooks";
import {
    Colors,
    CustomTabBar,
    IconSymbol,
    useColorScheme,
} from "@yuhuu/components";

export default function TabLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const ready = useBootstrapGate();
  const { data: myRoles } = useMyRolesQuery({ enabled: ready });

  // Defensive: Ensure myRoles is an array (handle envelope unwrapping edge cases)
  const rolesArray = Array.isArray(myRoles) ? myRoles : [];

  // Hide Home tab when user has only the Member role
  const isMemberOnly =
    rolesArray.length > 0
      ? rolesArray.every((r) => r.role_name === "Member")
      : true; // default hide to avoid flicker
  // Show Admin tab only for Admin role
  const isAdmin = rolesArray.some((r) => r.role_name === "Admin");
  // Show Visits tab only if user has assignments
  const { data: myAssignments } = useMyAssignmentsQuery();
  const hasVisits = (myAssignments?.length ?? 0) > 0;

  return (
    <>
      <Tabs
        initialRouteName="profile"
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
        }}
      >
        {/* Home tab - hidden for Member-only users */}
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: t("tabs.home"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
            tabBarButton: isMemberOnly ? () => null : undefined,
          }}
        />

        {/* Admin tab - only visible for Admin role */}
        <Tabs.Screen
          name="admin"
          options={{
            tabBarLabel: t("tabs.admin"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="shield.fill" color={color} />
            ),
            tabBarButton: isAdmin ? undefined : () => null,
          }}
        />

        {/* Visits tab - only visible if user has assignments */}
        <Tabs.Screen
          name="visits"
          options={{
            tabBarLabel: t("tabs.visits"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="map.fill" color={color} />
            ),
            tabBarButton: hasVisits ? undefined : () => null,
          }}
        />

        <Tabs.Screen
          name="supper"
          options={{
            tabBarLabel: t("tabs.supper"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="fork.knife" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: t("tabs.profile"),
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.crop.circle" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

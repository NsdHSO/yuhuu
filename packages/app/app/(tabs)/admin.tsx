import { DinnerManagementContainer } from "@/components/admin/dinner-management-container";
import { ItineraryManagement } from "@/components/visits/ItineraryManagement";
import { useBootstrapGate } from "@/features/bootstrap/api";
import { useMyRolesQuery } from "@/features/roles/meRoles";
import {
  GlassAccordion,
  GlassBackground,
  TabScreenWrapper,
} from "@yuhuu/components";
import { Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

/**
 * Admin screen - Only accessible to users with Admin role
 *
 * SOLID Principles:
 * - Single Responsibility: This screen orchestrates admin features
 * - Open/Closed: Can be extended with new admin sections without modifying existing logic
 * - Dependency Inversion: Depends on hooks abstraction, not implementation
 */
export default function AdminScreen() {
  const { t } = useTranslation();
  const ready = useBootstrapGate();
  const { data: myRoles } = useMyRolesQuery({ enabled: ready });

  // Route protection: Only Admin role can access this screen
  const isAdmin = myRoles
    ? myRoles.some((r) => r.role_name === "Admin")
    : false;
  if (!isAdmin) {
    return <Redirect href="/profile" />;
  }

  return (
    <GlassBackground>
      <TabScreenWrapper
        testID="admin-container"
        contentContainerStyle={styles.container}
      >
        {/* Dinner Management - All 3 sections */}
        <DinnerManagementContainer testID="dinner-management-section" />

        {/* Itinerary Management */}
        <View testID="itinerary-section" style={styles.section}>
          <GlassAccordion
            title={t("admin.itineraryManagement")}
            variant="frosted"
            defaultExpanded={false}
            enableElectric={true}
            enableWaves={false}
          >
            <ItineraryManagement />
          </GlassAccordion>
        </View>
      </TabScreenWrapper>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
});

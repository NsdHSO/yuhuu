import { UserSearch } from "@/components/admin/user-search";
import { ChurchInformationAccordion } from "@/components/profile/church-information-accordion";
import {
    useDinnerStatsQuery,
    useUserAttendanceQuery,
} from "@/features/admin/hooks";
import { useParticipantsByDinnerQuery } from "@/features/dinners/hooks";
import { useMyRolesQuery } from "@/features/roles/meRoles";
import { useBootstrapGate } from "@/features/bootstrap/api";
import {
    Colors,
    DinnerAttendance,
    DinnerGraph,
    DinnerIdSearch,
    GlassAccordion,
    GlassBackground,
    ParticipantsList,
    TabScreenWrapper,
    useColorScheme,
} from "@yuhuu/components";
import { Redirect } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

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
  const scheme = useColorScheme();
  const ready = useBootstrapGate();
  const { data: myRoles } = useMyRolesQuery({ enabled: ready });
  const [searchedUser, setSearchedUser] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [selectedDinnerId, setSelectedDinnerId] = useState<number | null>(null);

  // Fetch dinner stats for the graph
  const {
    data: dinnerStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useDinnerStatsQuery();

  // Fetch user attendance based on search
  const {
    data: userAttendance,
    isLoading: isLoadingAttendance,
    error: attendanceError,
  } = useUserAttendanceQuery(searchedUser?.username ?? "");

  // Fetch participants for selected dinner
  const {
    data: participants,
    isLoading: isLoadingParticipants,
    error: participantsError,
  } = useParticipantsByDinnerQuery(selectedDinnerId);

  // Route protection: Only Admin role can access this screen
  const isAdmin = myRoles ? myRoles.some((r) => r.role_name === 'Admin') : false;
  if (!isAdmin) {
    return <Redirect href="/profile" />;
  }

  const handleSearch = (user: { id: number; username: string }) => {
    setSearchedUser(user);
  };

  const handleDinnerIdChange = (dinnerId: number | null) => {
    setSelectedDinnerId(dinnerId);
  };

  return (
    <GlassBackground>
      <TabScreenWrapper testID="admin-container" contentContainerStyle={styles.container}>
          {/* Dinner Graph Section - Expandable */}
          <View testID="dinner-graph-section" style={styles.section}>
            <GlassAccordion
              title={t("admin.dinnerParticipation")}
              variant="frosted"
              defaultExpanded={true}
              enableElectric={true}
              enableWaves={false}
              testID="dinner-graph-accordion"
            >
              {isLoadingStats ? (
                <View
                  testID="dinner-graph-loading"
                  style={styles.loadingContainer}
                >
                  <ActivityIndicator
                    size="large"
                    color={Colors[scheme ?? "light"].tint}
                  />
                </View>
              ) : statsError ? (
                <Text style={[styles.errorText, { color: "#EF4444" }]}>
                  {t("admin.loadError")}
                </Text>
              ) : (
                <DinnerGraph testID="dinner-graph" data={dinnerStats} />
              )}
            </GlassAccordion>
          </View>

          {/* User Search Section - Expandable */}
          <View testID="user-search-section" style={styles.section}>
            <GlassAccordion
              title={t("admin.searchUser")}
              variant="frosted"
              defaultExpanded={true}
              enableElectric={true}
              enableWaves={false}
              testID="user-search-accordion"
            >
              <UserSearch testID="user-search" onSearch={handleSearch} />

              {/* Attendance Results */}
              {searchedUser && (
                <View style={styles.attendanceContainer}>
                  {isLoadingAttendance ? (
                    <View
                      testID="attendance-loading"
                      style={styles.loadingContainer}
                    >
                      <ActivityIndicator
                        size="large"
                        color={Colors[scheme ?? "light"].tint}
                      />
                    </View>
                  ) : attendanceError ? (
                    <Text style={[styles.errorText, { color: "#EF4444" }]}>
                      {t("admin.userNotFound")}
                    </Text>
                  ) : userAttendance && userAttendance.length === 0 ? (
                    <Text
                      style={[
                        styles.emptyText,
                        { color: Colors[scheme ?? "light"].icon },
                      ]}
                    >
                      {t("admin.noAttendanceRecords")}
                    </Text>
                  ) : (
                    <DinnerAttendance
                      testID="dinner-attendance"
                      username={searchedUser.username}
                      data={userAttendance}
                    />
                  )}
                </View>
              )}
            </GlassAccordion>
          </View>

          {/* User Profile Accordions - Shown when a user is searched */}
          {searchedUser && (
            <View style={{ marginTop: 16 }}>
              <ChurchInformationAccordion userId={searchedUser.id} />
            </View>
          )}

          {/* Dinner Participants Section - Expandable */}
          <View testID="dinner-participants-section" style={styles.section}>
            <GlassAccordion
              title={t("admin.viewParticipants")}
              variant="frosted"
              defaultExpanded={false}
              enableElectric={true}
              enableWaves={false}
              testID="dinner-participants-accordion"
            >
              <DinnerIdSearch
                testID="dinner-id-search"
                onDinnerIdChange={handleDinnerIdChange}
              />

              {/* Participants Results */}
              {selectedDinnerId && (
                <View style={styles.participantsContainer}>
                  {isLoadingParticipants ? (
                    <View
                      testID="participants-loading"
                      style={styles.loadingContainer}
                    >
                      <ActivityIndicator
                        size="large"
                        color={Colors[scheme ?? "light"].tint}
                      />
                    </View>
                  ) : participantsError ? (
                    <Text style={[styles.errorText, { color: "#EF4444" }]}>
                      {t("admin.participantsLoadError")}
                    </Text>
                  ) : participants ? (
                    <ParticipantsList
                      testID="participants-list"
                      participants={participants}
                    />
                  ) : null}
                </View>
              )}
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
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    marginVertical: 8,
    fontStyle: "italic",
  },
  attendanceContainer: {
    marginTop: 16,
  },
  participantsContainer: {
    marginTop: 16,
  },
});

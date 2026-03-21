import { GlassBackground, TabScreenWrapper, ThemedText } from "@yuhuu/components";
import type { VisitAssignmentWithFamily } from "@yuhuu/types";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { VisitCard } from "../../components/visits/VisitCard";
import { useMyAssignmentsQuery } from "../../features/visits/hooks";
import { useVisitTracking } from "../../features/visits/hooks/useVisitTracking";
import { requestLocationPermissions } from "../../features/visits/services/geolocation";

function VisitTrackingCard({ visit }: { visit: VisitAssignmentWithFamily }) {
  const { remainingMs, canComplete, completeVisit } = useVisitTracking(visit);

  // Extract family data with fallbacks
  const familyName = visit.family?.family_name ?? `Family ${visit.family_id}`;
  const address = visit.family
    ? `${visit.family.address_street}, ${visit.family.address_city}, ${visit.family.address_postal}`
    : 'Address not available';

  return (
    <VisitCard
      visit={visit}
      familyName={familyName}
      address={address}
      remainingMs={remainingMs}
      canComplete={canComplete}
      onComplete={completeVisit}
    />
  );
}

export default function VisitsScreen() {
  const { t } = useTranslation();
  const { data: assignments, isLoading } = useMyAssignmentsQuery();

  useEffect(() => {
    requestLocationPermissions();
  }, []);

  const pendingOrInProgress = assignments?.filter(
    (a) => a.status === "pending" || a.status === "in_progress",
  );

  return (
    <GlassBackground>
      <TabScreenWrapper
        testID="visits-container"
        contentContainerStyle={styles.container}
      >
        <ThemedText style={styles.title}>{t('visits.myVisits')}</ThemedText>

        {isLoading && <ThemedText style={styles.loadingText}>{t('common.loading')}</ThemedText>}

        {!isLoading &&
          pendingOrInProgress &&
          pendingOrInProgress.length === 0 && (
            <ThemedText style={styles.emptyText}>{t('visits.noAssignments')}</ThemedText>
          )}

        {pendingOrInProgress?.map((visit) => (
          <VisitTrackingCard key={visit.id} visit={visit} />
        ))}
      </TabScreenWrapper>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  loadingText: {
    opacity: 0.6,
    textAlign: "center",
  },
  emptyText: {
    opacity: 0.6,
    textAlign: "center",
    marginTop: 24,
  },
});

import React, {useEffect} from 'react';
import {Text, StyleSheet} from 'react-native';
import {requestLocationPermissions} from '../../features/visits/services/geolocation';
import {useMyAssignmentsQuery} from '../../features/visits/hooks';
import {useVisitTracking} from '../../features/visits/hooks/useVisitTracking';
import {VisitCard} from '../../components/visits/VisitCard';
import type {VisitAssignment} from '@yuhuu/types';
import {GlassBackground, TabScreenWrapper} from '@yuhuu/components';

function VisitTrackingCard({visit}: {visit: VisitAssignment}) {
  const {remainingMs, canComplete, completeVisit} = useVisitTracking(visit);

  return (
    <VisitCard
      visit={visit}
      familyName={`Family ${visit.family_id}`}
      address="123 Main St"
      remainingMs={remainingMs}
      canComplete={canComplete}
      onComplete={completeVisit}
    />
  );
}

export default function VisitsScreen() {
  const {data: assignments, isLoading} = useMyAssignmentsQuery();

  useEffect(() => {
    requestLocationPermissions();
  }, []);

  const pendingOrInProgress = assignments?.filter(
    (a) => a.status === 'pending' || a.status === 'in_progress'
  );

  return (
    <GlassBackground>
      <TabScreenWrapper
        testID="visits-container"
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>My Visits</Text>

        {isLoading && <Text style={styles.loadingText}>Loading...</Text>}

        {!isLoading && pendingOrInProgress && pendingOrInProgress.length === 0 && (
          <Text style={styles.emptyText}>
            You have no assigned visits
          </Text>
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
    fontWeight: '700',
    marginBottom: 20,
  },
  loadingText: {
    color: '#888',
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
  },
});

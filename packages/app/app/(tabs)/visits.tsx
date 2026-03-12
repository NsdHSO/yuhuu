import React, {useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useColorScheme} from 'react-native';
import {requestLocationPermissions} from '../../features/visits/services/geolocation';
import {useMyAssignmentsQuery} from '../../features/visits/hooks';
import {useVisitTracking} from '../../features/visits/hooks/useVisitTracking';
import {VisitCard} from '../../components/visits/VisitCard';
import type {VisitAssignment} from '@yuhuu/types';

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
  const scheme = useColorScheme() ?? 'light';
  const {data: assignments, isLoading} = useMyAssignmentsQuery();

  useEffect(() => {
    requestLocationPermissions();
  }, []);

  const pendingOrInProgress = assignments?.filter(
    (a) => a.status === 'pending' || a.status === 'in_progress'
  );

  return (
    <View style={[styles.container, {backgroundColor: scheme === 'dark' ? '#000' : '#fff'}]}>
      <Text style={[styles.title, {color: scheme === 'dark' ? '#fff' : '#000'}]}>
        My Visits
      </Text>

      <ScrollView style={styles.list}>
        {isLoading && <Text style={{color: '#888', textAlign: 'center'}}>Loading...</Text>}

        {!isLoading && pendingOrInProgress && pendingOrInProgress.length === 0 && (
          <Text style={{color: '#888', textAlign: 'center', marginTop: 24}}>
            You have no assigned visits
          </Text>
        )}

        {pendingOrInProgress?.map((visit) => (
          <VisitTrackingCard key={visit.id} visit={visit} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

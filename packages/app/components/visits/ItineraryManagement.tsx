import React, {useState} from 'react';
import {View, Text, Pressable, ScrollView,useColorScheme} from 'react-native';
import {useGlowVariant, getGlowColor} from '@yuhuu/components';
import type {CreateVisitableFamilyInput} from '@yuhuu/types';
import {
  useFamiliesQuery,
  useAllAssignmentsQuery,
  useCreateFamilyMutation,
  useDeleteFamilyMutation,
  useCreateAssignmentMutation,
} from '../../features/visits/hooks';
import {FamilyForm} from './FamilyForm';
import {AssignmentForm} from './AssignmentForm';
import {useTranslation} from 'react-i18next';

export function ItineraryManagement() {
  const {glowVariant} = useGlowVariant();
  const scheme = useColorScheme() ?? 'light';
  const activeColor = getGlowColor(glowVariant, scheme);
  const {t} = useTranslation();

  const {data: families} = useFamiliesQuery();
  const {data: assignments} = useAllAssignmentsQuery();
  const createFamily = useCreateFamilyMutation();
  const deleteFamily = useDeleteFamilyMutation();
  const createAssignment = useCreateAssignmentMutation();

  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  return (
    <ScrollView style={{padding: 16}}>
      <Text style={{fontSize: 18, fontWeight: '600', color: scheme === 'dark' ? '#fff' : '#000', marginBottom: 12}}>
        {t('visits.families')}
      </Text>

      {families?.map((family) => (
        <View key={family.id} style={{padding: 12, backgroundColor: scheme === 'dark' ? '#1a1a1a' : '#f5f5f5', borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: scheme === 'dark' ? '#fff' : '#000'}}>{family.family_name}</Text>
          <Pressable onPress={() => deleteFamily.mutate(family.id)}>
            <Text style={{color: '#ff4444'}}>{t('visits.deleteFamily')}</Text>
          </Pressable>
        </View>
      ))}

      {!showFamilyForm && (
        <Pressable onPress={() => setShowFamilyForm(true)} style={{backgroundColor: activeColor, borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 24}}>
          <Text style={{color: '#fff', fontWeight: '600'}}>{t('visits.addFamily')}</Text>
        </Pressable>
      )}

      {showFamilyForm && <FamilyForm onSubmit={(data) => {createFamily.mutate(data as CreateVisitableFamilyInput); setShowFamilyForm(false);}} onCancel={() => setShowFamilyForm(false)} isSubmitting={createFamily.isPending} />}

      <Text style={{fontSize: 18, fontWeight: '600', color: scheme === 'dark' ? '#fff' : '#000', marginBottom: 12, marginTop: 16}}>
        {t('visits.assignments')}
      </Text>

      {assignments?.map((assignment) => (
        <View key={assignment.id} style={{padding: 12, backgroundColor: scheme === 'dark' ? '#1a1a1a' : '#f5f5f5', borderRadius: 8, marginBottom: 8}}>
          <Text style={{color: scheme === 'dark' ? '#fff' : '#000'}}>Family ID: {assignment.family_id} | User: {assignment.assigned_to_user_id}</Text>
          <Text style={{color: '#888', fontSize: 12}}>{assignment.scheduled_date}</Text>
        </View>
      ))}

      {!showAssignmentForm && (
        <Pressable onPress={() => setShowAssignmentForm(true)} style={{backgroundColor: activeColor, borderRadius: 8, padding: 12, alignItems: 'center'}}>
          <Text style={{color: '#fff', fontWeight: '600'}}>{t('visits.createAssignment')}</Text>
        </Pressable>
      )}

      {showAssignmentForm && <AssignmentForm onSubmit={(data) => {createAssignment.mutate(data); setShowAssignmentForm(false);}} onCancel={() => setShowAssignmentForm(false)} isSubmitting={createAssignment.isPending} />}
    </ScrollView>
  );
}

import React, {useState, useEffect} from 'react';
import {View, Pressable, Text, TextInput,useColorScheme} from 'react-native';
import {useGlowVariant, getGlowColor} from '@yuhuu/components';
import {useFamiliesQuery} from '../../features/visits/hooks';
import type {CreateVisitAssignmentInput} from '@yuhuu/types';
import {useQueryClient} from '@tanstack/react-query';
import type {UserResponse} from '@/features/profile/api';

type Props = {
  onSubmit: (data: CreateVisitAssignmentInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export function AssignmentForm({onSubmit, onCancel, isSubmitting}: Props) {
  const {glowVariant} = useGlowVariant();
  const scheme = useColorScheme() ?? 'light';
  const activeColor = getGlowColor(glowVariant, scheme);
  const {data: families} = useFamiliesQuery();

  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData<UserResponse>(['me']);
  const currentUserId = userData?.id ?? 0;

  const [formData, setFormData] = useState({
    family_id: 0,
    assigned_to_user_id: currentUserId,
    scheduled_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Update assigned_to_user_id if bootstrap user changes
  useEffect(() => {
    if (currentUserId && currentUserId !== formData.assigned_to_user_id) {
      setFormData(prev => ({...prev, assigned_to_user_id: currentUserId}));
    }
  }, [currentUserId, formData.assigned_to_user_id]);

  const handleSubmit = () => {
    if (!formData.family_id || !formData.assigned_to_user_id || !formData.scheduled_date) {
      return;
    }
    onSubmit(formData);
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: activeColor + '40',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: scheme === 'dark' ? '#1a1a1a' : '#fff',
    color: scheme === 'dark' ? '#fff' : '#000',
  };

  return (
    <View style={{padding: 16}}>
      <Text style={{color: scheme === 'dark' ? '#fff' : '#000', marginBottom: 8}}>Select Family</Text>
      <View style={inputStyle}>
        {families?.map((family) => (
          <Pressable
            key={family.id}
            onPress={() => setFormData({...formData, family_id: family.id})}
            style={{padding: 8, backgroundColor: formData.family_id === family.id ? activeColor + '20' : 'transparent'}}
          >
            <Text style={{color: scheme === 'dark' ? '#fff' : '#000'}}>{family.family_name}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput style={inputStyle} placeholder="Scheduled Date (YYYY-MM-DD)" placeholderTextColor="#888" value={formData.scheduled_date} onChangeText={(text) => setFormData({...formData, scheduled_date: text})} />
      <TextInput style={inputStyle} placeholder="Notes" placeholderTextColor="#888" value={formData.notes} onChangeText={(text) => setFormData({...formData, notes: text})} multiline />

      <View style={{flexDirection: 'row', gap: 8, marginTop: 8}}>
        <Pressable onPress={onCancel} style={{flex: 1, backgroundColor: '#ccc', borderRadius: 8, padding: 14, alignItems: 'center'}}>
          <Text style={{color: '#fff', fontWeight: '600'}}>Cancel</Text>
        </Pressable>
        <Pressable onPress={handleSubmit} disabled={isSubmitting} style={{flex: 1, backgroundColor: activeColor, borderRadius: 8, padding: 14, alignItems: 'center', opacity: isSubmitting ? 0.6 : 1}}>
          <Text style={{color: '#fff', fontWeight: '600'}}>{isSubmitting ? 'Creating...' : 'Create'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

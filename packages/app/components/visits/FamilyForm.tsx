import React, {useState} from 'react';
import {View, TextInput, Pressable, Text,useColorScheme} from 'react-native';
import {useGlowVariant, getGlowColor} from '@yuhuu/components';
import type {CreateVisitableFamilyInput, UpdateVisitableFamilyInput} from '@yuhuu/types';

type Props = {
  initialData?: Partial<CreateVisitableFamilyInput>;
  onSubmit: (data: CreateVisitableFamilyInput | UpdateVisitableFamilyInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export function FamilyForm({initialData, onSubmit, onCancel, isSubmitting}: Props) {
  const {glowVariant} = useGlowVariant();
  const scheme = useColorScheme() ?? 'light';
  const activeColor = getGlowColor(glowVariant, scheme);

  const [formData, setFormData] = useState({
    family_name: initialData?.family_name || '',
    address_street: initialData?.address_street || '',
    address_city: initialData?.address_city || '',
    address_postal: initialData?.address_postal || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    phone: initialData?.phone || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = () => {
    if (!formData.family_name || !formData.address_street || !formData.address_city || !formData.address_postal) {
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
      <TextInput style={inputStyle} placeholder="Family Name *" placeholderTextColor="#888" value={formData.family_name} onChangeText={(text) => setFormData({...formData, family_name: text})} />
      <TextInput style={inputStyle} placeholder="Street Address *" placeholderTextColor="#888" value={formData.address_street} onChangeText={(text) => setFormData({...formData, address_street: text})} />
      <TextInput style={inputStyle} placeholder="City *" placeholderTextColor="#888" value={formData.address_city} onChangeText={(text) => setFormData({...formData, address_city: text})} />
      <TextInput style={inputStyle} placeholder="Postal Code *" placeholderTextColor="#888" value={formData.address_postal} onChangeText={(text) => setFormData({...formData, address_postal: text})} />
      <TextInput style={inputStyle} placeholder="Phone" placeholderTextColor="#888" value={formData.phone} onChangeText={(text) => setFormData({...formData, phone: text})} keyboardType="phone-pad" />
      <TextInput style={inputStyle} placeholder="Notes" placeholderTextColor="#888" value={formData.notes} onChangeText={(text) => setFormData({...formData, notes: text})} multiline />

      <View style={{flexDirection: 'row', gap: 8, marginTop: 8}}>
        <Pressable onPress={onCancel} style={{flex: 1, backgroundColor: '#ccc', borderRadius: 8, padding: 14, alignItems: 'center'}}>
          <Text style={{color: '#fff', fontWeight: '600'}}>Cancel</Text>
        </Pressable>
        <Pressable onPress={handleSubmit} disabled={isSubmitting} style={{flex: 1, backgroundColor: activeColor, borderRadius: 8, padding: 14, alignItems: 'center', opacity: isSubmitting ? 0.6 : 1}}>
          <Text style={{color: '#fff', fontWeight: '600'}}>{isSubmitting ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

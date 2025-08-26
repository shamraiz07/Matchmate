// src/screens/Fisherman/AddTrip/components/SaveBar.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useFormContext, useWatch } from 'react-hook-form';
import { s } from '../styles';
import type { FormValues } from '../types';

type Props = {
  gpsAvailable: boolean;
  onSave: () => Promise<void> | void; // allow async
  loading?: boolean;
  label?: string;
};

export default function SaveBar({ gpsAvailable, onSave, loading = false, label = 'Save Trip' }: Props) {
  const { control } = useFormContext<FormValues>();
  const tripCost = useWatch({ control, name: 'tripCost' });

  // basic validation for the CTA
  const costValid = Number(tripCost) >= 0 || tripCost === '' || tripCost == null;
  const disabled = !gpsAvailable || !costValid || loading;

  return (
    <TouchableOpacity
      style={[s.button, (disabled || loading) && s.buttonDisabled]}
      onPress={onSave}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {loading ? <ActivityIndicator color="#fff" /> : null}
        <Text style={s.buttonText}>{loading ? 'Saving…' : label}</Text>
      </View>
    </TouchableOpacity>
  );
}

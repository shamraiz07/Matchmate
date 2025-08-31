/* eslint-disable react-native/no-inline-styles */
// src/screens/Fisherman/AddTrip/FishingActivity.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Alert,
  StatusBar,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';

import { FishermanStackParamList } from '../../../app/navigation/stacks/FishermanStack';
import { useCurrentLocation } from './hooks/useCurrentLocation';
import {
  createFishingActivity,
  updateFishingActivity,
  getFishingActivityById,
  type CreateFishingActivityBody,
} from '../../../services/fishingActivity';
import { isOnline } from '../../../offline/net';
import { enqueueCreateActivity } from '../../../offline/TripQueues';
import { buildActivityId } from '../../../utils/ids';

type Nav = NativeStackNavigationProp<
  FishermanStackParamList,
  'FishingActivity'
>;
type R = RouteProp<FishermanStackParamList, 'FishingActivity'>;

type FormValues = {
  activityNo: number;
  mesh: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null;
  netLen: string;
  netWid: string;
  netting: Date | null;
  hauling: Date | null;
};

// Time formatting function for API
function formatTimeForAPI(date: Date | null): string | null {
  if (!date) return null;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Format time for display
function formatTimeForDisplay(date: Date | null): string {
  if (!date) return 'Select time';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function FishingActivity() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();

  const {
    mode = 'create',
    activityId,
    tripId: tripIdParam,
    activityNo: activityNoParam,
    meta,
    prefill,
  } = route.params ?? {};

  const displayTripCode = String(meta?.trip_id ?? tripIdParam ?? '');
  const tripPkForApi = meta?.id;
  const initialActivity = activityNoParam ?? 1;

  const { gps, loading: gpsLoading } = useCurrentLocation();

  const { watch, setValue, getValues } = useForm<FormValues>({
    mode: 'onTouched',
    defaultValues: {
      activityNo: initialActivity,
      mesh: null,
      netLen: '',
      netWid: '',
      netting: null,
      hauling: null,
    },
  });

  const existingGpsRef = useRef<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showNettingPicker, setShowNettingPicker] = useState(false);
  const [showHaulingPicker, setShowHaulingPicker] = useState(false);

  // ---- Prefill for EDIT ----
  useEffect(() => {
    let cancelled = false;

    async function loadExisting() {
      try {
        // show instantaneous prefill if caller passed it
        if (prefill && typeof prefill === 'object') {
          safeApplyPrefill(prefill);
        }

        if (activityId != null) {
          const a = await getFishingActivityById(activityId);
          if (!cancelled) safeApplyPrefill(a);
        }
      } catch (e: any) {
        if (!cancelled)
          Alert.alert('Failed', e?.message || 'Unable to load activity.');
      }
    }

    if (mode === 'edit') loadExisting();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activityId]);

  function safeApplyPrefill(a: any) {
    // These keys should exist on your adapted DTO (adjust if your adapter names differ)
    if (a?.activity_number) setValue('activityNo', a.activity_number);
    if (a?.mesh_size) setValue('mesh', a.mesh_size as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null);
    if (a?.net_length) setValue('netLen', String(a.net_length));
    if (a?.net_width) setValue('netWid', String(a.net_width));
    
    // Parse time strings to Date objects
    if (a?.time_of_netting) {
      const nettingTime = parseTimeString(a.time_of_netting);
      if (nettingTime) setValue('netting', nettingTime);
    }
    if (a?.time_of_hauling) {
      const haulingTime = parseTimeString(a.time_of_hauling);
      if (haulingTime) setValue('hauling', haulingTime);
    }
    
    if (a?.gps_latitude) existingGpsRef.current.lat = Number(a.gps_latitude);
    if (a?.gps_longitude) existingGpsRef.current.lng = Number(a.gps_longitude);
  }

  // Parse time string (HH:MM) to Date object
  function parseTimeString(timeStr: string): Date | null {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Handle time picker changes
  function handleTimeChange(
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
    field: 'netting' | 'hauling'
  ) {
    if (Platform.OS === 'android') {
      setShowNettingPicker(false);
      setShowHaulingPicker(false);
    }

    if (event.type === 'dismissed') return;

    if (selectedDate) {
      setValue(field, selectedDate);
    }
  }

  async function onSubmit() {
    if (!gps?.lat || !gps?.lng) {
      Alert.alert('GPS Required', 'Please wait for GPS location or recapture.');
      return;
    }

    const values = getValues();
    const online = await isOnline();

    // Validate time fields
    if (!values.netting || !values.hauling) {
      Alert.alert(
        'Time Required',
        'Please select both netting and hauling times.'
      );
      return;
    }

    try {
      setSubmitting(true);

      // Build the activity body with properly formatted times
      const body: CreateFishingActivityBody = {
        trip_id: tripPkForApi || 0,
        activity_number: values.activityNo,
        time_of_netting: formatTimeForAPI(values.netting),
        time_of_hauling: formatTimeForAPI(values.hauling),
        mesh_size: values.mesh,
        net_length: values.netLen ? Number(values.netLen) : null,
        net_width: values.netWid ? Number(values.netWid) : null,
        gps_latitude: gps.lat,
        gps_longitude: gps.lng,
      };

      if (online) {
        if (mode === 'edit' && activityId != null) {
          const updated = await updateFishingActivity(activityId, body);
          Toast.show({
            type: 'success',
            text1: 'Updated ✅',
            text2: 'Fishing activity updated successfully.',
            position: 'top',
            visibilityTime: 2500,
          });
          navigation.replace('FishingActivityDetails', {
            activityId,
            fallback: updated?.data ?? updated,
            tripId: displayTripCode,
          });
        } else {
          const created = await createFishingActivity(body);
          Toast.show({
            type: 'success',
            text1: 'Saved 🎉',
            text2: 'Fishing activity recorded successfully.',
            position: 'top',
            visibilityTime: 2500,
          });
          const newId = created?.data?.id ?? created?.id ?? created?.activity?.id;
          navigation.replace('FishingActivityDetails', {
            activityId: newId,
            fallback: created?.data ?? created,
            tripId: displayTripCode,
          });
        }
      } else {
        // Offline mode
        const activityCode = buildActivityId();
        
        // Enqueue the activity creation
        const job = await enqueueCreateActivity(body, {
          tripLocalId: typeof tripPkForApi === 'string' ? tripPkForApi : undefined,
          tripServerId: typeof tripPkForApi === 'number' ? tripPkForApi : undefined,
        });

        Toast.show({
          type: 'success',
          text1: 'Saved Offline 🎉',
          text2: 'Activity will sync when online.',
          position: 'top',
          visibilityTime: 2500,
        });

        // Navigate to details with local ID
        navigation.replace('FishingActivityDetails', {
          activityId: job.localId,
          fallback: {
            id: job.localId,
            activity_id: activityCode,
            trip_id: displayTripCode,
            ...body,
            status: 'pending_upload'
          },
          tripId: displayTripCode,
        });
      }
    } catch (e: any) {
      Alert.alert(
        'Failed',
        e?.message ||
          (mode === 'edit'
            ? 'Unable to update activity.'
            : 'Unable to create activity.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ------------ UI ------------ */

  const netting = watch('netting');
  const hauling = watch('hauling');
  const mesh = watch('mesh');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>
            {mode === 'edit' ? 'Edit Fishing Activity' : 'Create Fishing Activity'}
          </Text>
          <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 4 }}>
            Trip: {displayTripCode} • Activity #{initialActivity}
          </Text>
        </View>

        {/* GPS Status */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons
              name={gps ? 'location-on' : 'location-off'}
              size={20}
              color={gps ? '#10b981' : '#ef4444'}
            />
            <Text style={{ color: gps ? '#10b981' : '#ef4444' }}>
              {gps ? 'GPS Ready' : 'Waiting for GPS...'}
            </Text>
            {gpsLoading && <ActivityIndicator size="small" color="#6b7280" />}
          </View>
          {gps && (
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}
            </Text>
          )}
        </View>

        {/* Form Fields */}
        <View style={{ gap: 16 }}>
          {/* Activity Number */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Activity Number
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#fff',
              }}
              value={String(watch('activityNo'))}
              onChangeText={(text) => setValue('activityNo', Number(text) || 1)}
              keyboardType="numeric"
              placeholder="1"
            />
          </View>

          {/* Mesh Size */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Mesh Size
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                <Pressable
                  key={size}
                  onPress={() => setValue('mesh', size)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: mesh === size ? '#1f720d' : '#f3f4f6',
                    borderWidth: 1,
                    borderColor: mesh === size ? '#1f720d' : '#d1d5db',
                  }}
                >
                  <Text
                    style={{
                      color: mesh === size ? '#fff' : '#374151',
                      fontWeight: mesh === size ? '600' : '400',
                    }}
                  >
                    {size}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Net Dimensions */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                Net Length (m)
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#fff',
                }}
                value={watch('netLen')}
                onChangeText={(text) => setValue('netLen', text)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                Net Width (m)
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#fff',
                }}
                value={watch('netWid')}
                onChangeText={(text) => setValue('netWid', text)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          {/* Time Fields */}
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Fishing Times
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
              Select the start and end times for your fishing activity
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6 }}>
                  Netting Time *
                </Text>
                <Pressable
                  onPress={() => setShowNettingPicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: netting ? '#1f720d' : '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor: '#fff',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ 
                    fontSize: 16, 
                    color: netting ? '#1f2937' : '#9ca3af' 
                  }}>
                    {formatTimeForDisplay(netting)}
                  </Text>
                  <MaterialIcons 
                    name="access-time" 
                    size={20} 
                    color={netting ? '#1f720d' : '#9ca3af'} 
                  />
                </Pressable>
                {showNettingPicker && (
                  <DateTimePicker
                    value={netting || new Date()}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => handleTimeChange(event, date, 'netting')}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6 }}>
                  Hauling Time *
                </Text>
                <Pressable
                  onPress={() => setShowHaulingPicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: hauling ? '#1f720d' : '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor: '#fff',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ 
                    fontSize: 16, 
                    color: hauling ? '#1f2937' : '#9ca3af' 
                  }}>
                    {formatTimeForDisplay(hauling)}
                  </Text>
                  <MaterialIcons 
                    name="access-time" 
                    size={20} 
                    color={hauling ? '#1f720d' : '#9ca3af'} 
                  />
                </Pressable>
                {showHaulingPicker && (
                  <DateTimePicker
                    value={hauling || new Date()}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => handleTimeChange(event, date, 'hauling')}
                  />
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
          <Pressable
            disabled={submitting || gpsLoading}
            onPress={onSubmit}
            style={[
              {
                flex: 1,
                backgroundColor: '#1f720d',
                paddingVertical: 16,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              },
              (submitting || gpsLoading) && { opacity: 0.7 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons
                  name={mode === 'edit' ? 'save' : 'save'}
                  size={18}
                  color="#fff"
                />
                <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>
                  {mode === 'edit'
                    ? 'Update Fishing Activity'
                    : 'Create Fishing Activity'}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
/* ---- small atoms ---- */
function KV({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: '#6b7280' }}>{label}</Text>
      <Text style={{ fontWeight: '500' }}>{value}</Text>
    </View>
  );
}


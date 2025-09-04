/* eslint-disable react-native/no-inline-styles */
// src/screens/mfd/MFDRecordDetails.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StatusBar,
  Platform,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

import {
  fetchMFDRecordById,
  type Record,
  getStatusColor,
  getStatusText,
} from '../../services/mfd';
import { MFDStackParamList } from '../../app/navigation/stacks/MFDStack';
import PALETTE from '../../theme/palette';

/* ---------- constants ---------- */
const PRIMARY = PALETTE.green700;

/* ---------- main component ---------- */
export default function MFDRecordDetails() {
  const navigation = useNavigation();
  const { params } =
    useRoute<RouteProp<MFDStackParamList, 'RecordDetails'>>();

  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMFDRecordById(params.recordId);
      setRecord(data);
    } catch (error) {
      console.error('Error loading record:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load record details',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  }, [params.recordId]);

  useEffect(() => {
    load();
  }, [load]);

  // refresh whenever screen regains focus (after actions)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trip': return 'sailing';
      case 'distribution': return 'inventory';
      case 'purchase': return 'shopping-cart';
      case 'assignment': return 'assignment';
      case 'boat': return 'directions-boat';
      default: return 'description';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trip': return '#2196f3';
      case 'distribution': return '#4caf50';
      case 'purchase': return '#ff9800';
      case 'assignment': return '#f44336';
      case 'boat': return '#9c27b0';
      default: return '#757575';
    }
  };

  const toTitle = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }
  if (!record) return null;

  const typeColor = getTypeColor(record.type);
  const typeIcon = getTypeIcon(record.type);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: PRIMARY }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          accessibilityLabel="Back"
        >
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </Pressable>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.title} numberOfLines={1}>
            {record.title}
          </Text>

          <View style={styles.typePill}>
            <MaterialIcons name={typeIcon} size={16} color={typeColor} />
            <Text style={[styles.typeText, { color: typeColor }]}>
              {toTitle(record.type)}
            </Text>
          </View>

          <Text style={styles.subtitle}>
            Record #{record.id}
          </Text>
        </View>
      </View>

      {/* Quick info strip */}
      <View style={[styles.quickStrip, shadow(0.05, 8, 3)]}>
        <View style={styles.quickItem}>
          <MaterialIcons name="schedule" size={16} color={PALETTE.text600} />
          <Text style={styles.quickText}>
            {new Date(record.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.quickDivider} />
        <View style={styles.quickItem}>
          <MaterialIcons name="update" size={16} color={PALETTE.text600} />
          <Text style={styles.quickText}>
            {new Date(record.updated_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 14, gap: 12 }}>
        {/* Basic Record Information */}
        <Section title="Basic Record Information" icon="description">
          <Row icon="badge" label="Record ID" value={`#${record.id}`} />
          <Row icon="title" label="Title" value={record.title} />
          <Row icon="category" label="Type" value={toTitle(record.type)} />
          <Row icon="description" label="Description" value={record.description || 'No description provided'} />
        </Section>

        {/* Record Data */}
        <Section title="Record Data" icon="data-object">
          <View style={styles.dataContainer}>
            <Text style={styles.dataText}>
              {JSON.stringify(record.data, null, 2)}
            </Text>
          </View>
        </Section>

        {/* Timestamps */}
        <Section title="Timestamps" icon="schedule">
          <Row 
            icon="add" 
            label="Created At" 
            value={new Date(record.created_at).toLocaleString()} 
          />
          <Row 
            icon="update" 
            label="Updated At" 
            value={new Date(record.updated_at).toLocaleString()} 
          />
        </Section>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}

/* ---------- presentational pieces ---------- */
function Section({
  title,
  icon = 'info',
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon as any} size={20} color={PALETTE.text700} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <MaterialIcons name={icon as any} size={16} color={PALETTE.text600} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/* ---------- styles ---------- */
const shadow = (opacity: number, radius: number, offset: number) => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: offset },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation: radius,
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff', flexShrink: 1 },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  typeText: { fontSize: 12, fontWeight: '600' },
  subtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginTop: 2 },

  quickStrip: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  quickItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  quickDivider: { width: 1, height: 20, backgroundColor: PALETTE.border, marginHorizontal: 12 },
  quickText: { fontSize: 14, color: PALETTE.text600, fontWeight: '500' },

  /* sections */
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  sectionTitle: { fontWeight: '800', color: PALETTE.text900, fontSize: 14, flexShrink: 1 },
  sectionContent: { marginTop: 8, gap: 8 },

  /* rows */
  row: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { color: PALETTE.text600, fontSize: 12, fontWeight: '700' },
  value: { color: PALETTE.text900, fontWeight: '800' },

  /* data container */
  dataContainer: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 8,
    padding: 12,
  },
  dataText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: PALETTE.text700,
    lineHeight: 16,
  },
});

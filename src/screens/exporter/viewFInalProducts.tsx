import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExporterStackParamList } from '../../app/navigation/stacks/ExporterStack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PALETTE from '../../theme/palette';
import { fetchTraceabilityRecords, type TraceabilityRecord } from '../../services/traceability';

type Nav = NativeStackNavigationProp<ExporterStackParamList>;

function adapt(r: TraceabilityRecord) {
  return {
    id: String(r.id),
    doc: r.document_no,
    exporter: r.exporter_name || r.company?.name || '—',
    invoiceNo: r.invoice_no || '—',
    consignee: r.consignee_name || '—',
    country: r.consignee_country || '—',
    quantityKg: Number(r.total_quantity_kg || 0),
    date: new Date(r.document_date || r.created_at || '').toDateString(),
    status: (r.status_label || r.status || 'Pending') as 'Approved' | 'Pending' | 'Rejected',
  };
}

const ListHeader = ({ status, setStatus, handleBack }: { 
  status: 'All' | 'Approved' | 'Pending' | 'Rejected', 
  setStatus: (s: 'All' | 'Approved' | 'Pending' | 'Rejected') => void,
  handleBack: () => void 
}) => (
  <View>
    {/* App bar */}
    <View style={styles.appbar}>
      <Pressable onPress={handleBack} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}>
        <Icon name="arrow-back" size={22} color="#FFFFFF" />
      </Pressable>
      <Text style={styles.appbarTitle}>Traceability Records</Text>
      <View style={styles.spacer} />
    </View>

    {/* Filters (outside header) */}
    <View style={styles.headerPadding}>
      <View style={styles.filtersCard}>
        <Text style={styles.filtersTitle}>Status</Text>
        <View style={styles.chipsRow}>
          {(['All','Approved','Pending','Rejected'] as const).map(s => (
            <Pressable key={s} onPress={() => setStatus(s)} style={[styles.chip, status === s && styles.chipActive]}>
              <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  </View>
);

const ItemSeparator = () => <View style={styles.itemSeparator} />;

const EmptyState = ({ status, navigation }: { 
  status: 'All' | 'Approved' | 'Pending' | 'Rejected',
  navigation: any 
}) => (
  <View style={styles.emptyState}>
    <Icon name="description" size={64} color={PALETTE.text500} />
    <Text style={styles.emptyTitle}>No Records Found</Text>
    <Text style={styles.emptyMessage}>
      {status === 'All' 
        ? "You haven't created any traceability records yet. Create your first record to get started."
        : `No ${status.toLowerCase()} records found. Try changing the filter or create a new record.`
      }
    </Text>
    <Pressable 
      onPress={() => navigation.navigate('traceabilityForm')} 
      style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.9 }]}
    >
      <Icon name="add" size={20} color="#fff" />
      <Text style={styles.createBtnText}>Create New Record</Text>
    </Pressable>
  </View>
);

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const RecordItem = ({ item, originalRecords, navigation }: { 
  item: ReturnType<typeof adapt>, 
  originalRecords: TraceabilityRecord[], 
  navigation: any 
}) => (
  <View style={styles.recordCard}>
    <View style={styles.recordHeader}>
      <Text style={styles.doc}>{item.doc}</Text>
      <View style={styles.statusPill}><Text style={styles.statusText}>{item.status}</Text></View>
    </View>
    <View style={styles.recordGrid}>
      <Field label="Exporter" value={item.exporter} />
      <Field label="Invoice No" value={item.invoiceNo} />
      <Field label="Consignee" value={item.consignee} />
      <Field label="Consignee Country" value={item.country} />
      <Field label="Quantity (KG)" value={`${item.quantityKg.toFixed(2)} KG`} />
      <Field label="Date" value={item.date} />
    </View>
    <View style={styles.actionsRow}>
      <Pressable onPress={() => {
        const originalRecord = originalRecords.find(r => String(r.id) === item.id);
        if (originalRecord) {
          navigation.navigate('ViewRecord', { record: originalRecord });
        }
      }} style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.95 }]}>
        <Icon name="visibility" size={16} color={PALETTE.text900} />
        <Text style={styles.outlineText}>View</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('traceabilityForm')} style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.95 }]}>
        <Icon name="description" size={16} color="#fff" />
        <Text style={styles.secondaryText}>Generate Document</Text>
      </Pressable>
    </View>
  </View>
);

const ListHeaderWrapper = ({ status, setStatus, handleBack }: { 
  status: 'All' | 'Approved' | 'Pending' | 'Rejected', 
  setStatus: (s: 'All' | 'Approved' | 'Pending' | 'Rejected') => void,
  handleBack: () => void 
}) => <ListHeader status={status} setStatus={setStatus} handleBack={handleBack} />;

const EmptyStateWrapper = ({ status, navigation }: { 
  status: 'All' | 'Approved' | 'Pending' | 'Rejected',
  navigation: any 
}) => <EmptyState status={status} navigation={navigation} />;

export default function ViewFinalProduct() {
  const navigation = useNavigation<Nav>();
  
  const handleBack = useCallback(() => {
    // @ts-ignore
    navigation.navigate('ExporterHome');
  }, [navigation]);

  const [status, setStatus] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');
  const [rows, setRows] = useState<ReturnType<typeof adapt>[]>([]);
  const [originalRecords, setOriginalRecords] = useState<TraceabilityRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await fetchTraceabilityRecords({});
        setOriginalRecords(list);
        setRows(list.map(adapt));
      } catch (e) {
        setOriginalRecords([]);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => (status === 'All' ? true : r.status === status));
  }, [status, rows]);

  const renderListHeader = useCallback(() => 
    <ListHeaderWrapper status={status} setStatus={setStatus} handleBack={handleBack} />, 
    [status, setStatus, handleBack]
  );

  const renderEmptyState = useCallback(() => 
    <EmptyStateWrapper status={status} navigation={navigation} />, 
    [status, navigation]
  );

  return (
      <FlatList
        data={filtered}
        keyExtractor={it => it.id}
        ListHeaderComponent={renderListHeader}
        renderItem={({ item }) => <RecordItem item={item} originalRecords={originalRecords} navigation={navigation} />}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.contentPadding}
        refreshing={loading}
        ListEmptyComponent={renderEmptyState}
        onRefresh={async () => {
          try {
            setLoading(true);
            const list = await fetchTraceabilityRecords({});
            setOriginalRecords(list);
            setRows(list.map(adapt));
          } finally {
            setLoading(false);
          }
        }}
      />
  );
}

const styles = StyleSheet.create({
  appbar: { backgroundColor: PALETTE.green700, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#145A1F' },
  appbarTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  filtersCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12 },
  filtersTitle: { color: PALETTE.text700, fontWeight: '700', marginBottom: 8 },
  chipsRow: { marginTop: 10, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#C7E0CC', backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#E8F5E9', borderColor: '#A7D7B5' },
  chipText: { color: PALETTE.text700, fontWeight: '700' },
  chipTextActive: { color: PALETTE.green700 },
  recordCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  recordHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  doc: { color: '#1B5E20', fontWeight: '800' },
  statusPill: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { color: '#2e7d32', fontWeight: '800' },
  recordGrid: { marginTop: 10, rowGap: 8 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff' },
  outlineText: { color: PALETTE.text900, fontWeight: '800', marginLeft: 6 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#345bce' },
  secondaryText: { color: '#fff', fontWeight: '800', marginLeft: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { color: PALETTE.text700, fontWeight: '700', fontSize: 18, marginTop: 16, marginBottom: 8 },
  emptyMessage: { color: PALETTE.text500, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: PALETTE.green700, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  createBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  fieldContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldLabel: { color: PALETTE.text600 },
  fieldValue: { color: PALETTE.text900, fontWeight: '800' },
  spacer: { width: 44 },
  headerPadding: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4 },
  itemSeparator: { height: 12 },
  contentPadding: { paddingVertical: 10, paddingHorizontal: 14 },
});



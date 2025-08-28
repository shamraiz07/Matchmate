// src/screens/middleman/Distributions.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  RefreshControl,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MiddleManStackParamList } from '../../app/navigation/stacks/MiddleManStack';

type Nav = NativeStackNavigationProp<MiddleManStackParamList, 'MiddleManHome'>;

type Option = { label: string; value: string };

type Distribution = {
  id: string;
  name: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  trip: string;
  fisherman: string;
  weight: number;
  date: string; // "20/August/2025"
};

const COLORS = {
  bg: '#F7F8FA',
  card: '#FFFFFF',
  tint: '#1F720D',
  text: '#0B1220',
  muted: '#6B7280',
  border: '#E5E7EB',
  badge: {
    Verified: '#1E88E5', // blue
    Pending: '#FB8C00',  // orange
    Rejected: '#E53935', // red
  },
  chip: '#F1F5F9',
  chipText: '#111827',
  accent: '#32936F',
  grayBtn: '#828282',
};

const TRIPS: Option[] = [
  { label: 'All Trips', value: 'All' },
  { label: 'Dummy Trip 1', value: 'Dummy Trip 1' },
];

const STATUSES: Option[] = [
  { label: 'All Status', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Verified', value: 'Verified' },
  { label: 'Rejected', value: 'Rejected' },
];

const MIDDLEMEN: Option[] = [
  { label: 'All Middle Men', value: 'All' },
  { label: 'Middle Man 1', value: 'Middle Man 1' },
];

const DUMMY: Distribution[] = [
  { id: '1', name: 'DIST-1', status: 'Pending',  trip: 'Trip11', fisherman: 'Ali',    weight: 50,  date: '20/August/2025' },
  { id: '2', name: 'DIST-2', status: 'Verified', trip: 'Trip12', fisherman: 'Faraz',  weight: 150, date: '22/August/2025' },
  { id: '3', name: 'DIST-3', status: 'Rejected', trip: 'Trip13', fisherman: 'John',   weight: 30,  date: '19/August/2025' },
  { id: '4', name: 'DIST-4', status: 'Verified', trip: 'Trip14', fisherman: 'Doe',    weight: 25,  date: '01/August/2025' },
  { id: '5', name: 'DIST-5', status: 'Verified', trip: 'Trip15', fisherman: 'Behroz', weight: 76,  date: '21/August/2025' },
  { id: '6', name: 'DIST-6', status: 'Pending',  trip: 'Trip16', fisherman: 'Khan',   weight: 265, date: '29/August/2025' },
  { id: '7', name: 'DIST-7', status: 'Rejected', trip: 'Trip17', fisherman: 'Niazi',  weight: 65,  date: '18/August/2025' },
  { id: '8', name: 'DIST-8', status: 'Verified', trip: 'Trip18', fisherman: 'Sher',   weight: 29,  date: '11/August/2025' },
];

function parseWeirdDate(d: string): Date {
  // Handles "20/August/2025" etc.
  // Fallback to today if parsing fails.
  const safe = d.replace(/\//g, ' ');
  const dt = new Date(safe);
  return isNaN(dt.getTime()) ? new Date() : dt;
}

export default function Distributions() {
  const navigation = useNavigation<Nav>();

  // UI filter (draft)
  const [trip, setTrip] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [middleMan, setMiddleMan] = useState<string>('All');

  const [dateFrom, setDateFrom] = useState<Date>(() => {
    // default: first day of current month
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dateTo, setDateTo] = useState<Date>(new Date());

  // Pickers visibility
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  // Data / refreshing
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<Distribution[]>(DUMMY);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: replace with API call
    setTimeout(() => {
      setData(prev => [...prev]); // no-op just to simulate network
      setRefreshing(false);
    }, 600);
  }, []);

  const onChangeFrom = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== 'ios') setShowFrom(false);
    if (selected) setDateFrom(selected);
  };
  const onChangeTo = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== 'ios') setShowTo(false);
    if (selected) setDateTo(selected);
  };

  const clearFilters = useCallback(() => {
    setTrip('All');
    setStatus('All');
    setMiddleMan('All');
    const d = new Date();
    setDateFrom(new Date(d.getFullYear(), d.getMonth(), 1));
    setDateTo(new Date());
  }, []);

  // Derived: filtered + sorted (newest first)
  const filtered = useMemo(() => {
    const from = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate(), 0, 0, 0);
    const to   = new Date(dateTo.getFullYear(),   dateTo.getMonth(),   dateTo.getDate(),   23,59,59);

    const within = (d: string) => {
      const dd = parseWeirdDate(d);
      return dd >= from && dd <= to;
    };

    return data
      .filter(item => (trip === 'All' ? true : item.trip === trip))
      .filter(item => (status === 'All' ? true : item.status === status))
      .filter(_ => (middleMan === 'All' ? true : true)) // wiring reserved for real data
      .filter(item => within(item.date))
      .sort((a, b) => parseWeirdDate(b.date).getTime() - parseWeirdDate(a.date).getTime());
  }, [data, trip, status, middleMan, dateFrom, dateTo]);

  const totalWeight = useMemo(
    () => filtered.reduce((sum, it) => sum + (Number(it.weight) || 0), 0),
    [filtered]
  );

  const renderItem = useCallback(({ item }: { item: Distribution }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => navigation.navigate('distributionDetails' as never, { id: item.id } as never)}
      >
        <View style={styles.item}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: COLORS.badge[item.status] }]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>

          <Row label="Trip" value={item.trip} />
          <Row label="Fisherman" value={item.fisherman} />
          <Row label="Weight" value={`${item.weight} kg`} />
          <Row label="Date" value={parseWeirdDate(item.date).toLocaleDateString()} />
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  const keyExtractor = useCallback((it: Distribution) => it.id, []);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <>
            <View style={styles.card}>
              <Text style={styles.header}>Filter Distributions</Text>

              <FieldRow label="Trip">
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.dropdownText}
                  data={TRIPS}
                  search
                  maxHeight={220}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Trip"
                  searchPlaceholder="Search..."
                  value={trip}
                  onChange={(it: Option) => setTrip(it.value)}
                />
              </FieldRow>

              <FieldRow label="Status">
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.dropdownText}
                  data={STATUSES}
                  search
                  maxHeight={220}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Status"
                  searchPlaceholder="Search..."
                  value={status}
                  onChange={(it: Option) => setStatus(it.value)}
                />
              </FieldRow>

              <FieldRow label="Middle Man">
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholder}
                  selectedTextStyle={styles.dropdownText}
                  data={MIDDLEMEN}
                  search
                  maxHeight={220}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Middle Man"
                  searchPlaceholder="Search..."
                  value={middleMan}
                  onChange={(it: Option) => setMiddleMan(it.value)}
                />
              </FieldRow>

              <FieldRow label="Date From">
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFrom(true)} activeOpacity={0.7}>
                  <Text style={styles.dateText}>{dateFrom.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showFrom && (
                  <DateTimePicker
                    value={dateFrom}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeFrom}
                  />
                )}
              </FieldRow>

              <FieldRow label="Date To">
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTo(true)} activeOpacity={0.7}>
                  <Text style={styles.dateText}>{dateTo.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showTo && (
                  <DateTimePicker
                    value={dateTo}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeTo}
                  />
                )}
              </FieldRow>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  activeOpacity={0.85}
                  // Filtering is live; this "Apply" acts as a visual affordance.
                  onPress={() => {}}
                >
                  <Text style={styles.btnPrimaryText}>🔍 Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGray]}
                  activeOpacity={0.85}
                  onPress={clearFilters}
                >
                  <Text style={styles.btnGrayText}>✖️ Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Summary chips */}
            <View style={styles.summaryRow}>
              <Chip label="Results" value={`${filtered.length}`} />
              <Chip label="Total Weight" value={`${totalWeight} kg`} />
              {status !== 'All' && <Chip label="Status" value={status} />}
              {trip !== 'All' && <Chip label="Trip" value={trip} />}
            </View>

            <Text style={styles.sectionTitle}>All Distributions</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No distributions found</Text>
            <Text style={styles.emptyText}>Try adjusting filters or clearing the date range.</Text>
            <TouchableOpacity style={[styles.btn, styles.btnGray, { marginTop: 8 }]} onPress={clearFilters}>
              <Text style={styles.btnGrayText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.tint} />}
      />
    </View>
  );
}

/* ---------- Small UI bits ---------- */

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.itemRow}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>
        <Text style={{ fontWeight: '600' }}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  listContent: { padding: 12, paddingBottom: 24 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },

  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  fieldLabel: { width: '28%', fontSize: 14, color: COLORS.muted },

  dropdown: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
  },
  placeholder: { color: '#9CA3AF', fontSize: 14 },
  dropdownText: { fontSize: 14, color: COLORS.text },

  dateBtn: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  dateText: { fontSize: 14, color: COLORS.text },

  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, gap: 10 },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: COLORS.accent },
  btnPrimaryText: { color: '#FFF', fontWeight: '700' },
  btnGray: { backgroundColor: COLORS.grayBtn },
  btnGrayText: { color: '#FFF', fontWeight: '700' },

  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10, paddingHorizontal: 4 },
  chip: {
    backgroundColor: COLORS.chip,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  chipText: { color: COLORS.chipText, fontSize: 13 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginVertical: 8, paddingHorizontal: 4 },

  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  itemLabel: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  itemValue: { fontSize: 13, color: COLORS.text },

  empty: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    marginTop: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptyText: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
});

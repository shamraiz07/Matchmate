import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PALETTE from '../../theme/palette';
import { 
  fetchMFDRecords, 
  type Record, 
  getStatusColor,
  getStatusText 
} from '../../services/mfd';
import { type TraceabilityRecord } from '../../services/traceability';
import { MFDStackParamList } from '../../app/navigation/stacks/MFDStack';
import Toast from 'react-native-toast-message';

type Nav = NativeStackNavigationProp<MFDStackParamList>;

export default function MFDRecordsList() {
  const navigation = useNavigation<Nav>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [filter, setFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMFDRecords({ page: 1, per_page: 50 });
      setRecords(data.items || []);
    } catch (error) {
      console.error('Error loading records:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load records',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  }, [loadRecords]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRecordPress = (record: Record) => {
    navigation.navigate('RecordDetails', { recordId: record.id });
  };

  const filteredRecords = records.filter(record => {
    if (filter === 'All') return true;
    return record.status === filter.toLowerCase();
  });

  const getTypeIcon = (record: TraceabilityRecord) => {
    // For traceability records, we'll use document icon
    return 'description';
  };

  const getTypeColor = (record: TraceabilityRecord) => {
    // Use status-based colors for traceability records
    switch (record.status) {
      case 'approved': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'rejected': return '#f44336';
      default: return '#757575';
    }
  };

  const RecordCard = ({ record }: { record: Record }) => (
    <Pressable 
      onPress={() => handleRecordPress(record)} 
      style={({ pressed }) => [styles.recordCard, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.recordHeader}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor(record) + '20' }]}>
          <Icon name={getTypeIcon(record)} size={20} color={getTypeColor(record)} />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>{record.document_no}</Text>
          <Text style={styles.recordType}>{record.status?.toUpperCase() || 'UNKNOWN'}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={PALETTE.text400} />
      </View>
      
      <View style={styles.recordDetails}>
        {record.consignee_name && (
          <View style={styles.detailRow}>
            <Icon name="person" size={16} color={PALETTE.text600} />
            <Text style={styles.detailText} numberOfLines={2}>
              Consignee: {record.consignee_name}
            </Text>
          </View>
        )}
        {record.consignee_country && (
          <View style={styles.detailRow}>
            <Icon name="place" size={16} color={PALETTE.text600} />
            <Text style={styles.detailText}>
              Country: {record.consignee_country}
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Icon name="schedule" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            Created: {new Date(record.created_at || '').toLocaleDateString()}
          </Text>
        </View>
        {record.total_quantity_kg && (
          <View style={styles.detailRow}>
            <Icon name="scale" size={16} color={PALETTE.text600} />
            <Text style={styles.detailText}>
              Weight: {record.total_quantity_kg} kg
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  const FilterChip = ({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) => (
    <Pressable 
      onPress={onPress}
      style={[styles.filterChip, isActive && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PALETTE.green700} />
        <Text style={styles.loadingText}>Loading records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>MFD Records</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by status</Text>
        <View style={styles.filtersRow}>
          {(['All', 'Approved', 'Pending', 'Rejected'] as const).map((status) => (
            <FilterChip
              key={status}
              label={status}
              isActive={filter === status}
              onPress={() => setFilter(status)}
            />
          ))}
        </View>
      </View>

      {/* Records List */}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <RecordCard record={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="description" size={64} color={PALETTE.text400} />
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'All' 
                ? "No records available at the moment."
                : `No ${filter.toLowerCase()} records found.`
              }
            </Text>
          </View>
        )}
      />

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PALETTE.text600,
  },
  header: {
    backgroundColor: PALETTE.green700,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.text900,
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: PALETTE.border,
  },
  filterChipActive: {
    backgroundColor: PALETTE.green700,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: PALETTE.text600,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.text900,
    marginBottom: 4,
  },
  recordType: {
    fontSize: 12,
    color: PALETTE.text600,
    fontWeight: '600',
  },
  recordDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: PALETTE.text600,
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PALETTE.text700,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: PALETTE.text500,
    textAlign: 'center',
  },
});

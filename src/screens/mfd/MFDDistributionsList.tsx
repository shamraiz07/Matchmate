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
  fetchMFDDistributions, 
  type FishLotDistribution, 
  getStatusColor,
  getStatusText 
} from '../../services/mfd';
import { MFDStackParamList } from '../../app/navigation/stacks/MFDStack';
import Toast from 'react-native-toast-message';

type Nav = NativeStackNavigationProp<MFDStackParamList>;

export default function MFDDistributionsList() {
  const navigation = useNavigation<Nav>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [distributions, setDistributions] = useState<FishLotDistribution[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Verified' | 'Rejected'>('All');

  const loadDistributions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMFDDistributions({ page: 1, per_page: 50 });
      setDistributions(data.items || []);
    } catch (error) {
      console.error('Error loading distributions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load distributions',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDistributions();
    setRefreshing(false);
  }, [loadDistributions]);

  useEffect(() => {
    loadDistributions();
  }, [loadDistributions]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDistributionPress = (distribution: FishLotDistribution) => {
    navigation.navigate('DistributionDetails', { distributionId: distribution.id });
  };

  const filteredDistributions = distributions.filter(distribution => {
    if (filter === 'All') return true;
    return distribution.verification_status === filter.toLowerCase();
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'verified': return 'Verified';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const DistributionCard = ({ distribution }: { distribution: FishLotDistribution }) => (
    <Pressable 
      onPress={() => handleDistributionPress(distribution)} 
      style={({ pressed }) => [styles.distributionCard, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.distributionHeader}>
        <View style={styles.distributionInfo}>
          <Text style={styles.distributionId}>Distribution #{distribution.id}</Text>
          <Text style={styles.tripInfo}>Trip: {distribution.trip?.trip_id || 'Unknown'}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: getStatusColor(distribution.verification_status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(distribution.verification_status) }]}>
            {getStatusLabel(distribution.verification_status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.distributionDetails}>
        <View style={styles.detailRow}>
          <Icon name="person" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            Fisherman: {distribution.trip?.captain_name || 'Unknown'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="scale" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            Total Weight: {distribution.total_quantity_kg} kg
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="schedule" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            Created: {new Date(distribution.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="inventory" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            Lots: {distribution.distributed_lots.length} lot(s)
          </Text>
        </View>
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
        <Text style={styles.loadingText}>Loading distributions...</Text>
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
        <Text style={styles.headerTitle}>MFD Distributions</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by status</Text>
        <View style={styles.filtersRow}>
          {(['All', 'Pending', 'Verified', 'Rejected'] as const).map((status) => (
            <FilterChip
              key={status}
              label={status}
              isActive={filter === status}
              onPress={() => setFilter(status)}
            />
          ))}
        </View>
      </View>

      {/* Distributions List */}
      <FlatList
        data={filteredDistributions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <DistributionCard distribution={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="inventory" size={64} color={PALETTE.text400} />
            <Text style={styles.emptyTitle}>No distributions found</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'All' 
                ? "No distributions available at the moment."
                : `No ${filter.toLowerCase()} distributions found.`
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
  distributionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  distributionInfo: {
    flex: 1,
  },
  distributionId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.text900,
    marginBottom: 4,
  },
  tripInfo: {
    fontSize: 14,
    color: PALETTE.text600,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  distributionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: PALETTE.text600,
    marginLeft: 8,
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

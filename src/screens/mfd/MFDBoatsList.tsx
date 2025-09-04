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
  fetchMFDBoats, 
  type Boat, 
  getStatusColor,
  getStatusText 
} from '../../services/mfd';
import { MFDStackParamList } from '../../app/navigation/stacks/MFDStack';
import Toast from 'react-native-toast-message';

type Nav = NativeStackNavigationProp<MFDStackParamList>;

export default function MFDBoatsList() {
  const navigation = useNavigation<Nav>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  const loadBoats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMFDBoats({ page: 1, per_page: 50 });
      setBoats(data.items || []);
    } catch (error) {
      console.error('Error loading boats:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load boats',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBoats();
    setRefreshing(false);
  }, [loadBoats]);

  useEffect(() => {
    loadBoats();
  }, [loadBoats]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBoatPress = (boat: Boat) => {
    navigation.navigate('BoatDetails', { boatId: boat.id });
  };

  const filteredBoats = boats.filter(boat => {
    if (filter === 'All') return true;
    return boat.is_active === (filter === 'Active');
  });

  const BoatCard = ({ boat }: { boat: Boat }) => (
    <Pressable 
      onPress={() => handleBoatPress(boat)} 
      style={({ pressed }) => [styles.boatCard, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.boatHeader}>
        <View style={styles.boatInfo}>
          <Text style={styles.boatName}>{boat.boat_name}</Text>
          <Text style={styles.boatReg}>{boat.boat_registration_number}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: (boat.is_active ? '#4caf50' : '#f44336') + '20' }]}>
          <Text style={[styles.statusText, { color: boat.is_active ? '#4caf50' : '#f44336' }]}>
            {boat.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.boatDetails}>
        <View style={styles.detailRow}>
          <Icon name="directions-boat" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            Type: {boat.boat_type || 'Not specified'}
          </Text>
        </View>
        {boat.length_m && (
          <View style={styles.detailRow}>
            <Icon name="straighten" size={16} color={PALETTE.text600} />
            <Text style={styles.detailText}>
              Length: {boat.length_m}m
            </Text>
          </View>
        )}
        {boat.width_m && (
          <View style={styles.detailRow}>
            <Icon name="width-full" size={16} color={PALETTE.text600} />
            <Text style={styles.detailText}>
              Width: {boat.width_m}m
            </Text>
          </View>
        )}
        {boat.capacity_crew && (
          <View style={styles.detailRow}>
            <Icon name="group" size={16} color={PALETTE.text600} />
            <Text style={styles.detailText}>
              Crew Capacity: {boat.capacity_crew}
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Icon name="schedule" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            Created: {new Date(boat.created_at).toLocaleDateString()}
          </Text>
        </View>
        {boat.mfd_approved_no && (
          <View style={styles.detailRow}>
            <Icon name="verified" size={16} color={PALETTE.text600} />
            <Text style={styles.detailText}>
              MFD Approval: {boat.mfd_approved_no}
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
        <Text style={styles.loadingText}>Loading boats...</Text>
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
        <Text style={styles.headerTitle}>MFD Boats</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by status</Text>
        <View style={styles.filtersRow}>
          {(['All', 'Active', 'Inactive'] as const).map((status) => (
            <FilterChip
              key={status}
              label={status}
              isActive={filter === status}
              onPress={() => setFilter(status)}
            />
          ))}
        </View>
      </View>

      {/* Boats List */}
      <FlatList
        data={filteredBoats}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <BoatCard boat={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="directions-boat" size={64} color={PALETTE.text400} />
            <Text style={styles.emptyTitle}>No boats found</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'All' 
                ? "No boats available at the moment."
                : `No ${filter.toLowerCase()} boats found.`
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
  boatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  boatInfo: {
    flex: 1,
  },
  boatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.text900,
    marginBottom: 4,
  },
  boatReg: {
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
  boatDetails: {
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

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FCSStackParamList } from '../../app/navigation/stacks/FCSStack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PALETTE from '../../theme/palette';
import { fetchFCSTrips, type TripRowDTO, approveFCSTrip, rejectFCSTrip } from '../../services/fcs';
import Toast from 'react-native-toast-message';

type Nav = NativeStackNavigationProp<FCSStackParamList>;

export default function FCSTripsList() {
  const navigation = useNavigation<Nav>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState<TripRowDTO[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed' | 'Pending'>('All');
  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripRowDTO | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchFCSTrips({ page: 1, per_page: 50 });
      setTrips(data.items || []);
    } catch (error) {
      console.error('Error loading trips:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load trips',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  }, [loadTrips]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleApprove = useCallback(async (trip: TripRowDTO) => {
    try {
      setApproveLoading(trip.id.toString());
      await approveFCSTrip(trip.id);
      Toast.show({
        type: 'success',
        text1: 'Trip Approved',
        text2: `Trip ${trip.trip_name} has been approved successfully`,
        position: 'top',
      });
      await loadTrips(); // Refresh the list
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Approval Failed',
        text2: error?.message || 'Failed to approve trip',
        position: 'top',
      });
    } finally {
      setApproveLoading(null);
    }
  }, [loadTrips]);

  const handleReject = useCallback(async (trip: TripRowDTO) => {
    setSelectedTrip(trip);
    setRejectionReason('');
    setShowRejectModal(true);
  }, []);

  const confirmReject = useCallback(async () => {
    if (!selectedTrip || !rejectionReason.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Input',
        text2: 'Please provide a rejection reason',
        position: 'top',
      });
      return;
    }

    try {
      setRejectLoading(selectedTrip.id.toString());
      await rejectFCSTrip(selectedTrip.id, { rejection_reason: rejectionReason.trim() });
      Toast.show({
        type: 'success',
        text1: 'Trip Rejected',
        text2: `Trip ${selectedTrip.trip_name} has been rejected`,
        position: 'top',
      });
      setShowRejectModal(false);
      setSelectedTrip(null);
      setRejectionReason('');
      await loadTrips(); // Refresh the list
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Rejection Failed',
        text2: error?.message || 'Failed to reject trip',
        position: 'top',
      });
    } finally {
      setRejectLoading(null);
    }
  }, [selectedTrip, rejectionReason, loadTrips]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTripPress = (trip: TripRowDTO) => {
    navigation.navigate('TripDetails', { tripId: String(trip.id), trip: trip as any });
  };



  const filteredTrips = trips.filter(trip => {
    switch (filter) {
      case 'Active': return trip.status === 'active';
      case 'Completed': return trip.status === 'completed';
      case 'Pending': return trip.status === 'pending' || trip.status === 'pending_approval';
      default: return true;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return PALETTE.blue700;
      case 'completed': return PALETTE.green700;
      case 'pending':
      case 'pending_approval': return PALETTE.orange700;
      default: return PALETTE.text600;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'pending':
      case 'pending_approval': return 'Pending';
      default: return status;
    }
  };

  const TripCard = ({ trip }: { trip: TripRowDTO }) => (
    <Pressable 
      onPress={() => handleTripPress(trip)} 
      style={({ pressed }) => [styles.tripCard, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.tripHeader}>
        <View style={styles.tripInfo}>
          <Text style={styles.tripId}>{trip.trip_name}</Text>
          <Text style={styles.boatName}>{trip.boat_name || 'Unknown Boat'}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: getStatusColor(trip.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
            {getStatusLabel(trip.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.tripDetails}>
        <View style={styles.detailRow}>
          <Icon name="person" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>{trip.fisherman_name || 'Unknown Captain'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="location-on" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>{trip.departure_port || 'Unknown Port'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="schedule" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            {trip.departure_time || trip.created_at || 'Unknown Date'}
          </Text>
        </View>
      </View>

      {(trip.status === 'pending' || trip.status === 'pending_approval') && (
        <View style={styles.actionButtons}>
          <Pressable 
            onPress={() => handleApprove(trip)}
            style={[
              styles.actionButton, 
              styles.approveButton,
              approveLoading === trip.id.toString() && { opacity: 0.6 }
            ]}
            disabled={approveLoading === trip.id.toString() || rejectLoading === trip.id.toString()}
          >
            {approveLoading === trip.id.toString() ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="check" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </>
            )}
          </Pressable>
          <Pressable 
            onPress={() => handleReject(trip)}
            style={[
              styles.actionButton, 
              styles.rejectButton,
              rejectLoading === trip.id.toString() && { opacity: 0.6 }
            ]}
            disabled={approveLoading === trip.id.toString() || rejectLoading === trip.id.toString()}
          >
            {rejectLoading === trip.id.toString() ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="close" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </>
            )}
          </Pressable>
        </View>
      )}
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
        <Text style={styles.loadingText}>Loading trips...</Text>
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
        <Text style={styles.headerTitle}>FCS Trips Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by status</Text>
        <View style={styles.filtersRow}>
          {(['All', 'Active', 'Completed', 'Pending'] as const).map((status) => (
            <FilterChip
              key={status}
              label={status}
              isActive={filter === status}
              onPress={() => setFilter(status)}
            />
          ))}
        </View>
      </View>

      {/* Trips List */}
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TripCard trip={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="sailing" size={64} color={PALETTE.text400} />
            <Text style={styles.emptyTitle}>No trips found</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'All' 
                ? "No trips available at the moment."
                : `No ${filter.toLowerCase()} trips found.`
              }
            </Text>
          </View>
        )}
      />

      {/* Rejection Modal */}
      <Modal
        visible={showRejectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Icon name="warning" size={24} color={PALETTE.error} />
              <Text style={styles.modalTitle}>Reject Trip</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              Please provide a reason for rejecting this trip:
            </Text>
            
            <Text style={styles.modalTripInfo}>
              Trip: {selectedTrip?.trip_name}
            </Text>
            
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter rejection reason..."
              placeholderTextColor={PALETTE.text400}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  (!rejectionReason.trim() || rejectLoading) && { opacity: 0.6 }
                ]}
                onPress={confirmReject}
                disabled={!rejectionReason.trim() || !!rejectLoading}
              >
                {rejectLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Reject Trip</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.text900,
    marginBottom: 4,
  },
  boatName: {
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
  tripDetails: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: PALETTE.green700,
  },
  rejectButton: {
    backgroundColor: PALETTE.error,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
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
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PALETTE.text900,
    marginLeft: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: PALETTE.text600,
    marginBottom: 12,
  },
  modalTripInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.text900,
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: PALETTE.text900,
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: PALETTE.border,
  },
  confirmButton: {
    backgroundColor: PALETTE.error,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.text600,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

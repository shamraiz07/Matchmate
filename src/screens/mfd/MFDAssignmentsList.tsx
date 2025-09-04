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
  fetchMFDAssignments, 
  type Assignment, 
  getStatusColor,
  getStatusText 
} from '../../services/mfd';
import { MFDStackParamList } from '../../app/navigation/stacks/MFDStack';
import Toast from 'react-native-toast-message';

type Nav = NativeStackNavigationProp<MFDStackParamList>;

export default function MFDAssignmentsList() {
  const navigation = useNavigation<Nav>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive' | 'Pending'>('All');

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMFDAssignments({ page: 1, per_page: 50 });
      setAssignments(data.items || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load assignments',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
  }, [loadAssignments]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAssignmentPress = (assignment: Assignment) => {
    navigation.navigate('AssignmentDetails', { assignmentId: assignment.id });
  };

  const handleCreateNew = () => {
    navigation.navigate('AssignmentCreate');
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'All') return true;
    return assignment.status === filter.toLowerCase();
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <Pressable 
      onPress={() => handleAssignmentPress(assignment)} 
      style={({ pressed }) => [styles.assignmentCard, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.assignmentHeader}>
        <View style={styles.assignmentInfo}>
          <Text style={styles.assignmentId}>Assignment #{assignment.id}</Text>
          <Text style={styles.assignmentDate}>
            {new Date(assignment.assignment_date).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: getStatusColor(assignment.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(assignment.status) }]}>
            {getStatusLabel(assignment.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.assignmentDetails}>
        <View style={styles.detailRow}>
          <Icon name="person" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            Fisherman: {assignment.fisherman?.name || 'Unknown'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="directions-boat" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            Boat: {assignment.boat?.boat_name || 'Unknown'} ({assignment.boat?.boat_registration_number || 'N/A'})
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="schedule" size={16} color={PALETTE.text600} />
          <Text style={styles.detailText}>
            Created: {new Date(assignment.created_at).toLocaleDateString()}
          </Text>
        </View>
        {assignment.notes && (
          <View style={styles.detailRow}>
            <Icon name="note" size={16} color={PALETTE.text600} />
            <Text style={styles.detailText} numberOfLines={2}>
              Notes: {assignment.notes}
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
        <Text style={styles.loadingText}>Loading assignments...</Text>
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
        <Text style={styles.headerTitle}>MFD Assignments</Text>
        <Pressable onPress={handleCreateNew} style={({ pressed }) => [styles.createButton, pressed && { opacity: 0.8 }]}>
          <Icon name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by status</Text>
        <View style={styles.filtersRow}>
          {(['All', 'Active', 'Inactive', 'Pending'] as const).map((status) => (
            <FilterChip
              key={status}
              label={status}
              isActive={filter === status}
              onPress={() => setFilter(status)}
            />
          ))}
        </View>
      </View>

      {/* Assignments List */}
      <FlatList
        data={filteredAssignments}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <AssignmentCard assignment={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="assignment" size={64} color={PALETTE.text400} />
            <Text style={styles.emptyTitle}>No assignments found</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'All' 
                ? "No assignments available at the moment."
                : `No ${filter.toLowerCase()} assignments found.`
              }
            </Text>
            <Pressable onPress={handleCreateNew} style={styles.createNewButton}>
              <Icon name="add" size={20} color="#fff" />
              <Text style={styles.createNewButtonText}>Create New Assignment</Text>
            </Pressable>
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
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.text900,
    marginBottom: 4,
  },
  assignmentDate: {
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
  assignmentDetails: {
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
    marginBottom: 20,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.green700,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createNewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

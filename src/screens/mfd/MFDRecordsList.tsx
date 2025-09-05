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
import { type TraceabilityRecord, fetchTraceabilityRecords } from '../../services/traceability';
import { getAuthToken } from '../../services/https';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { MFDStackParamList } from '../../app/navigation/stacks/MFDStack';
import Toast from 'react-native-toast-message';

type Nav = NativeStackNavigationProp<MFDStackParamList>;

const getTypeColor = (record: TraceabilityRecord) => {
  // Use status-based colors for traceability records
  switch (record.status) {
    case 'approved': return '#4caf50';
    case 'pending': return '#ff9800';
    case 'rejected': return '#f44336';
    default: return '#757575';
  }
};

const RecordCard = ({ record, onRecordPress, onGenerateDocument }: { 
  record: TraceabilityRecord; 
  onRecordPress: (record: TraceabilityRecord) => void;
  onGenerateDocument: (record: TraceabilityRecord) => void;
}) => (
  <View style={styles.recordCard}>
    {/* Header Section */}
    <View style={styles.cardHeader}>
      <Text style={styles.documentId}>{record.document_no}</Text>
      <View style={[styles.statusPill, { backgroundColor: getTypeColor(record) + '20' }]}>
        <Text style={[styles.statusText, { color: getTypeColor(record) }]}>
          {record.status_label || record.status?.toUpperCase() || 'UNKNOWN'}
        </Text>
      </View>
    </View>

    {/* Information Rows */}
    <View style={styles.infoSection}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Exporter</Text>
        <Text style={styles.detailValue}>{record.exporter_name || '—'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Invoice No</Text>
        <Text style={styles.detailValue}>{record.invoice_no || '—'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Consignee</Text>
        <Text style={styles.detailValue}>{record.consignee_name || '—'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Consignee Country</Text>
        <Text style={styles.detailValue}>{record.consignee_country || '—'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Quantity (KG)</Text>
        <Text style={styles.detailValue}>{record.total_quantity_kg || '0.00'} KG</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Date</Text>
        <Text style={styles.detailValue}>
          {record.document_date 
            ? new Date(record.document_date).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })
            : '—'
          }
        </Text>
      </View>
    </View>

    {/* Action Buttons */}
    <View style={styles.actionButtons}>
      <Pressable 
        onPress={() => onRecordPress(record)} 
        style={({ pressed }) => [styles.viewButton, pressed && { opacity: 0.8 }]}
      >
        <Icon name="visibility" size={16} color="#fff" />
        <Text style={styles.viewButtonText}>View</Text>
      </Pressable>
      
      <Pressable 
        onPress={() => onGenerateDocument(record)} 
        style={({ pressed }) => [styles.generateButton, pressed && { opacity: 0.8 }]}
      >
        <Icon name="description" size={16} color="#fff" />
        <Text style={styles.generateButtonText}>Generate Document</Text>
      </Pressable>
    </View>
  </View>
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

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Icon name="description" size={64} color={PALETTE.text400} />
    <Text style={styles.emptyTitle}>No records found</Text>
    <Text style={styles.emptyMessage}>
      There are no traceability records available at the moment.
    </Text>
  </View>
);

export default function MFDRecordsList() {
  const navigation = useNavigation<Nav>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<TraceabilityRecord[]>([]);
  const [filter, setFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTraceabilityRecords({ status: filter === 'All' ? undefined : filter.toLowerCase() });
      setRecords(data || []);
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
  }, [filter]);

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

  const handleRecordPress = (record: TraceabilityRecord) => {
    navigation.navigate('RecordDetails', { recordId: record.id });
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to storage to download PDF files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleGenerateDocument = async (record: TraceabilityRecord) => {
    try {
      // Show loading toast
      Toast.show({
        type: 'info',
        text1: 'Generating Document',
        text2: `Please wait while we generate the document for ${record.document_no}`,
        position: 'top',
      });

      // Request storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Storage permission is required to download PDF files.',
          position: 'top',
        });
        return;
      }

      // Call the generate document API directly with fetch to handle PDF response
      const response = await fetch(`${process.env.API_BASE_URL || 'http://192.168.18.44:1000/api'}/traceability-records/${record.id}/generate-document`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });

      if (response.ok) {
        // Get the PDF blob
        const pdfBlob = await response.blob();
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const base64PDF = base64Data.split(',')[1]; // Remove data:application/pdf;base64, prefix
            
            // Create filename
            const fileName = `traceability-${record.document_no}.pdf`;
            
            // Define file path
            const downloadsPath = Platform.OS === 'android' 
              ? RNFS.DownloadDirectoryPath 
              : RNFS.DocumentDirectoryPath;
            const filePath = `${downloadsPath}/${fileName}`;
            
            // Write file to device storage
            await RNFS.writeFile(filePath, base64PDF, 'base64');
            
            console.log('PDF saved to:', filePath);
            
            Toast.show({
              type: 'success',
              text1: 'Document Downloaded',
              text2: `PDF saved to ${Platform.OS === 'android' ? 'Downloads' : 'Documents'} folder`,
              position: 'top',
            });
            
            // Show success alert with file location
            Alert.alert(
              'Download Complete',
              `PDF document has been saved to:\n${filePath}`,
              [
                {
                  text: 'OK',
                  style: 'default',
                },
              ]
            );
            
          } catch (writeError) {
            console.error('Error saving PDF:', writeError);
            Toast.show({
              type: 'error',
              text1: 'Save Failed',
              text2: 'Failed to save PDF to device storage.',
              position: 'top',
            });
          }
        };
        
        reader.onerror = () => {
          Toast.show({
            type: 'error',
            text1: 'Conversion Failed',
            text2: 'Failed to convert PDF data.',
            position: 'top',
          });
        };
        
        reader.readAsDataURL(pdfBlob);
        
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      Toast.show({
        type: 'error',
        text1: 'Generation Failed',
        text2: 'Failed to generate document. Please try again.',
        position: 'top',
      });
    }
  };

  const filteredRecords = records;

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
        <View style={styles.headerSpacer} />
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
        renderItem={({ item }) => (
          <RecordCard 
            record={item} 
            onRecordPress={handleRecordPress}
            onGenerateDocument={handleGenerateDocument}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={EmptyState}
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
    paddingTop: 20,
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
  headerSpacer: {
    width: 40,
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
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
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
  infoSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  viewButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  generateButton: {
    backgroundColor: '#9c27b0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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

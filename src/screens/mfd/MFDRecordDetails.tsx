/* eslint-disable react-native/no-inline-styles */
// src/screens/mfd/MFDRecordDetails.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StatusBar,
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
  fetchTraceabilityRecordById,
  type TraceabilityRecord,
} from '../../services/traceability';
import { getAuthToken } from '../../services/https';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { MFDStackParamList } from '../../app/navigation/stacks/MFDStack';
import PALETTE from '../../theme/palette';

/* ---------- constants ---------- */
const PRIMARY = PALETTE.green700;

/* ---------- main component ---------- */
export default function MFDRecordDetails() {
  const navigation = useNavigation();
  const { params } =
    useRoute<RouteProp<MFDStackParamList, 'RecordDetails'>>();

  const [record, setRecord] = useState<TraceabilityRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTraceabilityRecordById(params.recordId);
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

  const handleGenerateDocument = async () => {
    if (!record) return;
    
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

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={{ marginTop: 16, color: PALETTE.text600 }}>Loading record details...</Text>
      </SafeAreaView>
    );
  }
  if (!record) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Back to Records"
        >
          <MaterialIcons name="arrow-back" size={20} color="white" />
          <Text style={styles.backButtonText}>Back to Records</Text>
        </Pressable>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.title}>Traceability Record Details</Text>
        <Text style={styles.breadcrumb}>Traceability Record • Document No: {record.document_no}</Text>

        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Document Header */}
          <View style={styles.documentHeader}>
            <View style={styles.documentInfo}>
              <MaterialIcons name="description" size={24} color="#333" />
              <Text style={styles.documentTitle}>
                Traceability Record Document No: {record.document_no}
              </Text>
            </View>
            <Text style={styles.statusText}>{record.status_label || record.status?.toUpperCase() || 'UNKNOWN'}</Text>
          </View>

          {/* Document Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Information</Text>
            <View style={styles.infoGrid}>
              <InfoRow label="Document No" value={record.document_no} />
              <InfoRow label="Manual ID" value={record.mfd_manual_id || 'N/A'} />
              <InfoRow label="Document Date" value={record.document_date ? new Date(record.document_date).toLocaleString() : 'N/A'} />
              <InfoRow label="Date of Shipment" value={record.date_of_shipment ? new Date(record.date_of_shipment).toLocaleString() : 'N/A'} />
              <InfoRow label="Invoice No" value={record.invoice_no || 'N/A'} />
              <InfoRow label="Export Certificate No" value={record.export_certificate_no || 'N/A'} />
              <InfoRow label="Consignee Name" value={record.consignee_name || 'N/A'} />
              <InfoRow label="Consignee Country" value={record.consignee_country || 'N/A'} />
            </View>
          </View>

          {/* Company Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            <View style={styles.infoGrid}>
              <InfoRow label="Exporter" value={record.exporter_name || 'N/A'} />
              <InfoRow label="Company" value={record.company?.name || record.exporter_name || 'N/A'} />
              <InfoRow label="Plant Address" value={record.plant_address || 'N/A'} />
              <InfoRow label="Validating Authority" value={record.validating_authority || 'N/A'} />
              <InfoRow label="Final Weight" value={`${record.total_quantity_kg || '0.00'} KG`} />
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={[styles.statusPill, { backgroundColor: record.status === 'approved' ? '#4caf50' : '#ff9800' }]}>
                  <Text style={styles.statusPillText}>{record.status_label || record.status?.toUpperCase() || 'UNKNOWN'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Selected Lots Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Lots ({record.selected_lots?.length || 0})</Text>
            {record.selected_lots && record.selected_lots.length > 0 ? (
              <View style={styles.lotsTable}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Lot No</Text>
                  <Text style={styles.tableHeaderText}>Final Product Name</Text>
                  <Text style={styles.tableHeaderText}>Quantity (KG)</Text>
                </View>
                {record.selected_lots.map((lot, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{lot.lot_no}</Text>
                    <Text style={styles.tableCell}>{lot.final_product_name}</Text>
                    <Text style={styles.tableCell}>{lot.quantity_kg}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No lots selected</Text>
            )}
          </View>

          {/* Approval Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Approval Information</Text>
            <View style={styles.infoGrid}>
              <InfoRow label="Approved By" value={record.approver?.name || 'N/A'} />
              <InfoRow label="Approved At" value={record.approved_at ? new Date(record.approved_at).toLocaleString() : 'N/A'} />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backToRecordsButton}
            >
              <MaterialIcons name="arrow-back" size={20} color="#333" />
              <Text style={styles.backToRecordsText}>Back to Records</Text>
            </Pressable>
            
            <Pressable
              onPress={handleGenerateDocument}
              style={styles.generateButton}
            >
              <MaterialIcons name="picture-as-pdf" size={20} color="#fff" />
              <Text style={styles.generateButtonText}>Generate Document</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}

/* ---------- presentational pieces ---------- */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    color: 'white',

  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  breadcrumb: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentHeader: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentTitle: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  lotsTable: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 16,
  },
  backToRecordsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    flex: 1,
    justifyContent: 'center',
  },
  backToRecordsText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2196f3',
    flex: 1,
    justifyContent: 'center',
  },
  generateButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
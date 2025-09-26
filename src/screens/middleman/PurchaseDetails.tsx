import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MiddleManStackParamList } from '../../app/navigation/stacks/MiddleManStack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PALETTE from '../../theme/palette';
import {
  fetchPurchaseById,
  type MiddlemanPurchase,
  getStatusColor,
  getStatusText,
  formatDate,
  formatDateTime,
} from '../../services/middlemanDistribution';

// --- Types ---
type Nav = NativeStackNavigationProp<MiddleManStackParamList, 'MiddleManHome'>;
type Route = {
  params: {
    purchaseId: number;
  };
};

export default function PurchaseDetails() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { purchaseId } = route.params;

  const [purchase, setPurchase] = useState<MiddlemanPurchase | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch Purchase Details ---
  const loadPurchaseDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchPurchaseById(purchaseId);
      setPurchase(response);
    } catch (error) {
      console.error('Error loading purchase details:', error);
      Alert.alert('Error', 'Failed to load purchase details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchaseDetails();
  }, [purchaseId]);

  // --- Loader ---
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={PALETTE.green700} barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PALETTE.green700} />
          <Text style={styles.loadingText}>Loading purchase details...</Text>
        </View>
      </View>
    );
  }

  if (!purchase) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={PALETTE.green700} barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Purchase not found</Text>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(purchase.status);
  const statusText = purchase.status_label || getStatusText(purchase.status);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PALETTE.green700} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.8 }]}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Purchase Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Purchase Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="info" size={20} color={PALETTE.blue700} />
            <Text style={styles.cardTitle}>Purchase Information</Text>
          </View>
          
          <View style={styles.cardContent}>
            <Row label="Status" value={statusText} valueColor={statusColor} />
            <Row label="Final Product" value={purchase.final_product_name} />
            <Row label="Total Quantity" value={`${purchase.total_quantity_kg} kg`} />
            <Row label="Final Weight" value={`${purchase.final_weight_quantity} kg`} />
            <Row label="Processing Efficiency" value="100.0%" />
            <Row label="Created" value={formatDateTime(purchase.created_at)} />
            <Row label="Updated" value={formatDateTime(purchase.updated_at)} />
            <Row label="Reference" value={purchase.purchase_reference} />
            {purchase.processing_notes && (
              <Row label="Processing Notes" value={purchase.processing_notes} />
            )}
          </View>
        </View>

        {/* Exporter Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person" size={20} color={PALETTE.blue700} />
            <Text style={styles.cardTitle}>Exporter</Text>
          </View>
          
          <View style={styles.cardContent}>
            <Row label="Name" value={purchase.exporter?.name || '—'} />
            <Row label="Email" value={purchase.exporter?.email || '—'} />
            <Row label="Phone" value={purchase.exporter?.phone || '—'} />
            <Row label="Export License" value={purchase.exporter?.export_license_number || '—'} />
            <Row label="Verification Status" value={purchase.exporter?.verification_status || '—'} />
            <Row label="Is Active" value={purchase.exporter?.is_active ? 'Yes' : 'No'} />
          </View>
        </View>

        {/* Middle Man Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person" size={20} color={PALETTE.green700} />
            <Text style={styles.cardTitle}>Middle Man</Text>
          </View>
          
          <View style={styles.cardContent}>
            <Row label="Name" value={purchase.middle_man?.name || '—'} />
            <Row label="Email" value={purchase.middle_man?.email || '—'} />
            <Row label="Phone" value={purchase.middle_man?.phone || '—'} />
            <Row label="Company Name" value={purchase.middle_man?.company_name || '—'} />
            <Row label="Business Address" value={purchase.middle_man?.business_address || '—'} />
            <Row label="Business Phone" value={purchase.middle_man?.business_phone || '—'} />
            <Row label="Business Email" value={purchase.middle_man?.business_email || '—'} />
            <Row label="Verification Status" value={purchase.middle_man?.verification_status || '—'} />
            <Row label="Is Active" value={purchase.middle_man?.is_active ? 'Yes' : 'No'} />
          </View>
        </View>

        {/* Company Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="business" size={20} color={PALETTE.blue700} />
            <Text style={styles.cardTitle}>Company</Text>
          </View>
          
          <View style={styles.cardContent}>
            <Row label="Name" value={purchase.company?.name || '—'} />
            <Row label="Email" value={purchase.company?.email || '—'} />
            <Row label="Phone" value={purchase.company?.phone || '—'} />
            <Row label="Export License" value={purchase.company?.export_license_number || '—'} />
            <Row label="Verification Status" value={purchase.company?.verification_status || '—'} />
            <Row label="Is Active" value={purchase.company?.is_active ? 'Yes' : 'No'} />
          </View>
        </View>

        {/* Purchased Lots Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="inventory" size={20} color={PALETTE.blue700} />
            <Text style={styles.cardTitle}>Purchased Lots ({purchase.purchased_lots.length})</Text>
          </View>
          
          <View style={styles.cardContent}>
            {(purchase.enriched_purchased_lots || purchase.purchased_lots).map((lot, index) => {
              const enrichedLot = purchase.enriched_purchased_lots?.[index];
              return (
                <View key={index} style={styles.lotItem}>
                  <View style={styles.lotHeader}>
                    <Text style={styles.lotNumber}>{lot.lot_no}</Text>
                    <Text style={styles.lotQuantity}>{lot.quantity_kg} kg</Text>
                  </View>
                  {enrichedLot && (
                    <View style={styles.lotDetails}>
                      <View style={styles.lotDetailRow}>
                        <Text style={styles.lotDetailLabel}>Species:</Text>
                        <Text style={styles.lotDetailValue}>{enrichedLot.species_name}</Text>
                      </View>
                      <View style={styles.lotDetailRow}>
                        <Text style={styles.lotDetailLabel}>Grade:</Text>
                        <Text style={styles.lotDetailValue}>{enrichedLot.grade}</Text>
                      </View>
                      <View style={styles.lotDetailRow}>
                        <Text style={styles.lotDetailLabel}>Type:</Text>
                        <Text style={styles.lotDetailValue}>{enrichedLot.type}</Text>
                      </View>
                      {enrichedLot.notes && (
                        <View style={styles.lotDetailRow}>
                          <Text style={styles.lotDetailLabel}>Notes:</Text>
                          <Text style={styles.lotDetailValue}>{enrichedLot.notes}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Actions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="settings" size={20} color={PALETTE.blue700} />
            <Text style={styles.cardTitle}>Actions</Text>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.actionsText}>No actions available at this time</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// --- Components ---

const Row = ({ 
  label, 
  value, 
  valueColor 
}: { 
  label: string; 
  value: string; 
  valueColor?: string; 
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}:</Text>
    <Text style={[styles.rowValue, valueColor && { color: valueColor }]} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PALETTE.text600,
  },
  errorText: {
    fontSize: 16,
    color: PALETTE.text600,
  },
  header: {
    backgroundColor: PALETTE.green700,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PALETTE.text900,
    marginLeft: 8,
  },
  cardContent: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.text600,
    width: '40%',
  },
  rowValue: {
    fontSize: 14,
    color: PALETTE.text900,
    flex: 1,
    textAlign: 'right',
  },
  lotItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  lotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lotNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.green700,
  },
  lotQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.text900,
  },
  lotDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  lotDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lotDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: PALETTE.text600,
    width: '30%',
  },
  lotDetailValue: {
    fontSize: 12,
    color: PALETTE.text900,
    flex: 1,
    textAlign: 'right',
  },
  actionsText: {
    fontSize: 14,
    color: PALETTE.text600,
    fontStyle: 'italic',
  },
});

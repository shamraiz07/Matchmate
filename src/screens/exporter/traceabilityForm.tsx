/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, TextInput, Platform, FlatList, Modal, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import PALETTE from '../../theme/palette';
import { fetchExporterCompanies, type ExporterCompany, createTraceabilityRecord } from '../../services/traceability';
import { getUser } from '../../services/users';

type LotRow = { lot_no: string; final_product_name: string; quantity_kg: string };

function Field({ label, value, onChangeText, keyboardType, placeholder }: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
  placeholder?: string;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder || label}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />
    </View>
  );
}

const ItemSeparator = () => <View style={{ height: 6 }} />;

export default function TraceabilityForm() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [companyId, setCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<ExporterCompany[]>([]);
  const [companyModal, setCompanyModal] = useState(false);

  const [invoiceNo, setInvoiceNo] = useState('');
  const [exportCertNo, setExportCertNo] = useState('');
  const [consigneeName, setConsigneeName] = useState('');
  const [consigneeCountry, setConsigneeCountry] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date());
  const [shipmentDate, setShipmentDate] = useState(new Date());
  const [showDocumentDatePicker, setShowDocumentDatePicker] = useState(false);
  const [showShipmentDatePicker, setShowShipmentDatePicker] = useState(false);
  const [validatingAuthority, setValidatingAuthority] = useState('');
  const [exporterName, setExporterName] = useState('');
  const [plantAddress, setPlantAddress] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [lots, setLots] = useState<LotRow[]>([{ lot_no: '', final_product_name: '', quantity_kg: '' }]);

  const [exporterId, setExporterId] = useState<number | null>(null);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const handleDocumentDateChange = (event: any, selectedDate?: Date) => {
    setShowDocumentDatePicker(false);
    if (selectedDate) {
      setDocumentDate(selectedDate);
    }
  };

  const handleShipmentDateChange = (event: any, selectedDate?: Date) => {
    setShowShipmentDatePicker(false);
    if (selectedDate) {
      setShipmentDate(selectedDate);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [user, list] = await Promise.all([getUser(), fetchExporterCompanies()]);
        setExporterId(user?.id ?? null);
        setExporterName(user?.company_name || user?.name || '');
        // Filter out the current user from the companies list to prevent self-selection
        const filteredCompanies = list.filter(company => company.id !== user?.id);
        setCompanies(filteredCompanies);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const addLot = () => setLots(prev => [...prev, { lot_no: '', final_product_name: '', quantity_kg: '' }]);
  const updateLot = (i: number, key: keyof LotRow, value: string) => setLots(prev => prev.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)));
  const removeLot = (i: number) => setLots(prev => prev.filter((_, idx) => idx !== i));

  const totalQuantityKg = useMemo(() => {
    return lots.reduce((acc, l) => acc + (parseFloat(l.quantity_kg || '0') || 0), 0);
  }, [lots]);

  const handleSubmit = useCallback(async () => {
    if (!exporterId) {
      Alert.alert('Error', 'Missing exporter account.');
      return;
    }
    if (!companyId) {
      Alert.alert('Missing Company', 'Please select a company.');
      return;
    }
    
    // Validate that the selected company exists
    const selectedCompany = companies.find(c => String(c.id) === companyId);
    if (!selectedCompany) {
      Alert.alert('Invalid Company', 'The selected company is not valid. Please select a different company.');
      return;
    }
    
    // Validate that the selected company is not the same as the exporter
    if (selectedCompany.id === exporterId) {
      Alert.alert('Invalid Selection', 'You cannot select yourself as the company. Please select a different company.');
      return;
    }
    if (!invoiceNo || !consigneeName || !consigneeCountry) {
      Alert.alert('Missing Info', 'Please fill required fields.');
      return;
    }
    if (!lots.length || !lots[0].lot_no) {
      Alert.alert('Missing Lots', 'Please add at least one lot.');
      return;
    }
    try {
      setSubmitting(true);
      
      // Debug: Log available companies and selected company
      console.log('Exporter ID:', exporterId);
      console.log('Available companies:', companies);
      console.log('Selected company ID:', companyId);
      console.log('Selected company:', selectedCompany);
      console.log('Are exporter and company the same?', selectedCompany.id === exporterId);
      
      const body = {
        exporter_id: exporterId,
        company_id: selectedCompany.id,
        invoice_no: invoiceNo,
        consignee_name: consigneeName,
        consignee_country: consigneeCountry,
        document_date: formatDate(documentDate),
        date_of_shipment: formatDate(shipmentDate),
        export_certificate_no: exportCertNo || undefined,
        selected_lots: lots.map(l => ({ lot_no: l.lot_no, quantity_kg: l.quantity_kg || '0', final_product_name: l.final_product_name })),
        total_quantity_kg: String(totalQuantityKg),
        total_value: totalValue || '0',
        validating_authority: validatingAuthority || 'Marine Fisheries Department',
        exporter_name: exporterName,
        plant_address: plantAddress,
      } as any;

      await createTraceabilityRecord(body);
      Alert.alert('Success', 'Traceability record created successfully.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create record');
    } finally {
      setSubmitting(false);
    }
  }, [exporterId, companyId, invoiceNo, consigneeName, consigneeCountry, documentDate, shipmentDate, exportCertNo, lots, totalQuantityKg, totalValue, validatingAuthority, exporterName, plantAddress, navigation, companies]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.green50 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => (navigation as any).goBack()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}>
            <Icon name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Create Traceability Record</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Company */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Purchase Selection</Text>
          <Text style={styles.label}>Exporter Company</Text>
          <Text style={styles.helpText}>Select a different company to create a traceability record for</Text>
          <Pressable onPress={() => setCompanyModal(true)} style={({ pressed }) => [styles.select, pressed && { opacity: 0.95 }]}>
            <View style={styles.selectedCompany}>
              {companyId ? (
                <>
                  <Text style={styles.selectedCompanyName}>
                    {companies.find(c => String(c.id) === companyId)?.company_name || companies.find(c => String(c.id) === companyId)?.name || 'Company'}
                  </Text>
                  {companies.find(c => String(c.id) === companyId)?.contact_person && (
                    <Text style={styles.selectedCompanyContact}>
                      Contact: {companies.find(c => String(c.id) === companyId)?.contact_person}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.placeholderText}>Select Exporter Company</Text>
              )}
            </View>
            <Icon name="arrow-drop-down" size={22} color={PALETTE.text700} />
          </Pressable>
        </View>

        {/* Document details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Document Details</Text>
          <Field label="Invoice No" value={invoiceNo} onChangeText={setInvoiceNo} placeholder="INV-0001" />
          <Field label="Export Certificate No" value={exportCertNo} onChangeText={setExportCertNo} placeholder="ECN-0001" />
          <Field label="Consignee Name" value={consigneeName} onChangeText={setConsigneeName} placeholder="Consignee full name" />
          <Field label="Consignee Country" value={consigneeCountry} onChangeText={setConsigneeCountry} placeholder="Country" />
          {/* Document Date Picker */}
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Document Date</Text>
            <Pressable onPress={() => setShowDocumentDatePicker(true)} style={({ pressed }) => [styles.datePicker, pressed && { opacity: 0.95 }]}>
              <Text style={{ color: PALETTE.text900, fontSize: 16 }}>{formatDate(documentDate)}</Text>
              <Icon name="calendar-today" size={20} color={PALETTE.green700} />
            </Pressable>
          </View>

          {/* Shipment Date Picker */}
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.label}>Date of Shipment</Text>
            <Pressable onPress={() => setShowShipmentDatePicker(true)} style={({ pressed }) => [styles.datePicker, pressed && { opacity: 0.95 }]}>
              <Text style={{ color: PALETTE.text900, fontSize: 16 }}>{formatDate(shipmentDate)}</Text>
              <Icon name="calendar-today" size={20} color={PALETTE.green700} />
            </Pressable>
          </View>
          <Field label="Validating Authority" value={validatingAuthority} onChangeText={setValidatingAuthority} placeholder="Marine Fisheries Department" />
          <Field label="Exporter Name" value={exporterName} onChangeText={setExporterName} placeholder="Company Exporter" />
          <Field label="Plant Address" value={plantAddress} onChangeText={setPlantAddress} placeholder="Business address" />
          <Field label="Total Value" value={totalValue} onChangeText={setTotalValue} keyboardType="numeric" placeholder="0.00" />
        </View>

        {/* Selected lots */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Selected Lots</Text>
          {lots.map((row, idx) => (
            <View key={idx} style={{ marginBottom: 10 }}>
              <Field label="Lot No" value={row.lot_no} onChangeText={t => updateLot(idx, 'lot_no', t)} placeholder="LOT-2025-0001" />
              <Field label="Final Product Name" value={row.final_product_name} onChangeText={t => updateLot(idx, 'final_product_name', t)} placeholder="Tuna" />
              <Field label="Quantity (KG)" value={row.quantity_kg} onChangeText={t => updateLot(idx, 'quantity_kg', t)} keyboardType="numeric" placeholder="0" />
              {lots.length > 1 && (
                <Pressable onPress={() => removeLot(idx)} style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.9 }]}>
                  <Icon name="delete" size={16} color="#fff" />
                  <Text style={styles.removeBtnText}>Remove</Text>
                </Pressable>
              )}
            </View>
          ))}
          <Pressable onPress={addLot} style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.9 }]}>
            <Icon name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Add Lot</Text>
          </Pressable>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Quantity (KG)</Text>
            <Text style={styles.totalValue}>{totalQuantityKg.toFixed(2)}</Text>
          </View>
        </View>

        <Pressable onPress={handleSubmit} disabled={submitting} style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.9 }, submitting && { opacity: 0.7 }]}>
          {submitting ? <ActivityIndicator color="#fff" /> : (<>
            <Icon name="send" size={18} color="#fff" />
            <Text style={styles.submitText}>Create Traceability Record</Text>
          </>)}
        </Pressable>
      </ScrollView>

      {/* Company picker */}
      <Modal visible={companyModal} animationType="fade" transparent onRequestClose={() => setCompanyModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCompanyModal(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Company</Text>
          <FlatList
            data={companies}
            keyExtractor={it => String(it.id)}
            renderItem={({ item }) => (
              <Pressable onPress={() => { setCompanyId(String(item.id)); setCompanyModal(false); }} style={({ pressed }) => [styles.modalItem, pressed && { opacity: 0.9 }]}>
                <View style={styles.companyItem}>
                  <Text style={styles.companyName}>{item.company_name || item.name}</Text>
                  {item.contact_person && (
                    <Text style={styles.companyContact}>Contact: {item.contact_person}</Text>
                  )}
                  <View style={styles.companyDetails}>
                    {item.email && (
                      <Text style={styles.companyDetail}>{item.email}</Text>
                    )}
                    {item.phone && (
                      <Text style={styles.companyDetail}>{item.phone}</Text>
                    )}
                    {item.registration_no && (
                      <Text style={styles.companyDetail}>Reg: {item.registration_no}</Text>
                    )}
                  </View>
                  {item.status && (
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#E8F5E8' : '#FFEBEE' }]}>
                      <Text style={[styles.statusText, { color: item.status === 'active' ? PALETTE.green700 : '#C62828' }]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )}
            ItemSeparatorComponent={ItemSeparator}
          />
        </View>
      </Modal>

      {/* Document Date Picker Modal */}
      {showDocumentDatePicker && (
        <DateTimePicker
          value={documentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDocumentDateChange}
        />
      )}

      {/* Shipment Date Picker Modal */}
      {showShipmentDatePicker && (
        <DateTimePicker
          value={shipmentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleShipmentDateChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#145A1F' },
  headerTitle: { color: PALETTE.text900, fontWeight: '800', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: PALETTE.border, padding: 12, marginBottom: 12 },
  sectionTitle: { color: PALETTE.text900, fontWeight: '800', marginBottom: 8 },
  label: { color: PALETTE.text700, marginBottom: 6, fontWeight: '700' },
  helpText: { color: PALETTE.text500, fontSize: 12, marginBottom: 8, fontStyle: 'italic' },
  input: { borderWidth: 1, borderColor: PALETTE.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 8, color: PALETTE.text900, backgroundColor: '#fff' },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: PALETTE.border, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 8 },
  selectedCompany: { flex: 1 },
  selectedCompanyName: { color: PALETTE.text900, fontWeight: '600', fontSize: 16 },
  selectedCompanyContact: { color: PALETTE.text600, fontSize: 12, marginTop: 2 },
  placeholderText: { color: '#9CA3AF', fontSize: 16 },
  addBtn: { marginTop: 4, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PALETTE.green700, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '800' },
  removeBtn: { alignSelf: 'flex-start', marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#C62828', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  removeBtnText: { color: '#fff', fontWeight: '800' },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  totalRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { color: PALETTE.text700, fontWeight: '700' },
  totalValue: { color: PALETTE.text900, fontWeight: '800' },
  submitBtn: { marginTop: 4, backgroundColor: PALETTE.green700, paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  submitText: { color: '#fff', fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: { position: 'absolute', left: 20, right: 20, top: '50%', transform: [{ translateY: -220 }], borderRadius: 16, backgroundColor: '#fff', padding: 16, maxHeight: 440, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8 },
  modalTitle: { color: PALETTE.text900, fontWeight: '800', fontSize: 16, marginBottom: 8 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: PALETTE.border },
  companyItem: { flex: 1 },
  companyName: { color: PALETTE.text900, fontWeight: '700', fontSize: 16, marginBottom: 4 },
  companyContact: { color: PALETTE.text700, fontSize: 14, marginBottom: 4 },
  companyDetails: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  companyDetail: { color: PALETTE.text600, fontSize: 12, marginRight: 12, marginBottom: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '600' },
});

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, FlatList } from 'react-native';

interface PrefDropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  onClear: () => void;
}

export default function PrefDropdown({
  label,
  value,
  options,
  onSelect,
  onClear,
}: PrefDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Pressable
          onPress={() => setIsOpen(true)}
          style={styles.dropdown}>
          <Text style={[styles.dropdownText, !value && styles.placeholder]}>
            {value || 'Select'}
          </Text>
          <Text style={styles.arrow}>▼</Text>
        </Pressable>
        {value && (
          <Pressable onPress={onClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onSelect(item);
                    setIsOpen(false);
                  }}>
                  <Text style={styles.optionText}>{item}</Text>
                  {value === item && <Text style={styles.check}>✓</Text>}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdown: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  placeholder: {
    color: '#8C8A9A',
  },
  arrow: {
    color: '#D4AF37',
    fontSize: 10,
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
  },
  clearText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
    padding: 20,
  },
  modalTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  option: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  check: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
  },
});


import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
} from 'react-native';

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  required?: boolean;
  containerStyle?: any;
}

export default function Dropdown({
  label,
  value,
  options,
  onSelect,
  required = false,
  containerStyle,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label} {required && '*'}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setIsOpen(true)}
        style={styles.dropdown}>
        <Text style={[styles.dropdownText, !value && styles.placeholder]}>
          {value || label}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
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
        </TouchableOpacity>
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
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  dropdownText: {
    color: '#000000',
    fontSize: 14,
    flex: 1,
  },
  placeholder: {
    color: '#8C8A9A',
  },
  arrow: {
    color: '#8C8A9A',
    fontSize: 10,
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


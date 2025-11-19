import React from 'react';
import { Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';

export default function SearchScreen({ navigation }: any) {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <Header title="Search Filters" onBack={handleBack} />
      <Text style={styles.title}>Search Filters</Text>
      <TextInput
        placeholder="City"
        placeholderTextColor="#8C8A9A"
        style={styles.input}
      />
      <TextInput
        placeholder="Profession"
        placeholderTextColor="#8C8A9A"
        style={styles.input}
      />
      <TextInput
        placeholder="Religion / Sect"
        placeholderTextColor="#8C8A9A"
        style={styles.input}
      />
      <Pressable onPress={() => navigation.goBack()} style={styles.primary}>
        <Text style={styles.primaryText}>Apply</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700' },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  primary: {
    backgroundColor: '#D4AF37',
    padding: 14,
    borderRadius: 10,
    marginTop: 18,
    alignItems: 'center',
  },
  primaryText: { color: '#000000', fontWeight: '700' },
});


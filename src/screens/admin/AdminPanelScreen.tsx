import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';

export default function AdminPanelScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Admin Panel</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>• Verify Users</Text>
        <Text style={styles.cardText}>• Manage Plans</Text>
        <Text style={styles.cardText}>• Review Reports</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700' },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  cardText: { color: '#FFFFFF' },
});


import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';

export default function DeleteAccountScreen({ navigation }: any) {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <Header title="Delete Account" onBack={handleBack} />
      <Text style={styles.title}>Delete Account</Text>
      <Text style={styles.warning}>
        This is irreversible in production. Demo confirms only.
      </Text>
      <Pressable
        onPress={() => navigation.replace('Login')}
        style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Confirm Delete</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700' },
  warning: { color: '#FFFFFF', marginTop: 8, opacity: 0.8 },
  confirmButton: {
    backgroundColor: '#E14D4D',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  confirmButtonText: { color: '#FFFFFF', fontWeight: '700' },
});


import React from 'react';
import { Text, View, StyleSheet, ScrollView, Pressable } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';

export default function PaymentsScreen({ navigation, route }: any) {
  // If route.params has a plan, show payment options, otherwise show payment history
  const { plan } = route?.params ?? {};

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  if (plan) {
    // Payment screen for selecting payment method
    // Capitalize the plan name (silver -> Silver, gold -> Gold, platinum -> Platinum)
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
    const headerTitle = `${planName} Plan`;
    
    return (
      <Screen>
        <Header title={headerTitle} onBack={handleBack} />
        <View style={styles.paymentContainer}>
          <View style={styles.paymentSection}>
            <Text style={styles.paymentLabel}>Payment</Text>
            <Pressable
              onPress={() => navigation.replace('Main')}
              style={styles.paymentButton}>
              <Text style={styles.paymentButtonText}>JazzCash (Mock)</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => navigation.replace('Main')}
            style={styles.paymentButton}>
            <Text style={styles.paymentButtonText}>EasyPaisa (Mock)</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.replace('Main')}
            style={styles.paymentButton}>
            <Text style={styles.paymentButtonText}>Card (Mock)</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  // Payment history screen
  return (
    <Screen>
      <Header title="Payment History" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.historyTitle}>Payment History</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No payment history available.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  paymentContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  paymentSection: {
    marginBottom: 4,
  },
  paymentLabel: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 8,
    paddingLeft: 4,
  },
  paymentButton: {
    backgroundColor: '#D4AF37',
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    alignItems: 'center',
  },
  paymentButtonText: { color: '#000000', fontWeight: '700' },
  historyTitle: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#D4AF37',
    fontSize: 16,
    opacity: 0.8,
  },
});

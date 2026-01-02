import React from 'react';
import { Text, View, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import { useUser_Subscriptions } from '../../service/Hooks/User_Report_Hook';
import Toast from 'react-native-toast-message';

const plans = [
  {
    id: 'free',
    plan_id: 1,
    name: 'FREE',
    price: '0',
    duration: '/1 month',
    benefits: [
      { label: 'Connection requests', value: '5' },
      { label: 'Chats limit', value: '1' },
      { label: 'Call Session', value: '5' },
    ],
  },
  {
    id: 'silver',
    plan_id: 2,
    name: 'SILVER',
    price: 'Rs 2500',
    duration: '/1 month',
    benefits: [
      { label: 'Connection requests', value: '10' },
      { label: 'Chats limit', value: '3' },
      { label: 'Call Session', value: '7' },
    ],
  },
  {
    id: 'gold',
    plan_id: 3,
    name: 'GOLD',
    price: 'Rs 5500',
    duration: '/3 months',
    benefits: [
      { label: 'Connection requests', value: '15' },
      { label: 'Chats limit', value: '5' },
      { label: 'Call Session', value: '10' },
    ],
  },
  {
    id: 'platinum',
    plan_id: 4,
    name: 'PLATINUM',
    price: 'Rs 9500',
    duration: '/6 months',
    benefits: [
      { label: 'Connection requests', value: 'unlimited' },
      { label: 'Chats limit', value: 'unlimited' },
      { label: 'Call Session', value: 'unlimited' },
    ],
  },
];

export default function SubscriptionsScreen({ navigation }: any) {
  const subscriptionMutation = useUser_Subscriptions();

  const handleSelectPlan = async (plan: typeof plans[0]) => {
    if (plan.id === 'free') {
      // Navigate immediately for free plan
      navigation.navigate('Main');
    } else {
      // For paid plans, send subscription request to backend
      const payload = {
        plan_id: plan.plan_id,
        auto_renew: true,
      };

      try {
        await subscriptionMutation.mutateAsync(
          { payload },
          {
            onSuccess: (res: any) => {
              console.log('Subscription successful:', res);
              
              // Navigate to Payments screen after success (for paid plans)
              navigation.navigate('Payments', { plan: plan.id });
              
              // Show toast after a short delay
              setTimeout(() => {
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Subscription request sent successfully',
                });
              }, 500);
            },
            onError: (err: any) => {
              console.error('Subscription error:', err);
              const errorMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Failed to process subscription. Please try again.';
              Alert.alert('Error', errorMessage);
            },
          },
        );
      } catch (error: any) {
        console.error('Subscription error:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <Header title="Choose Plan" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Choose your premium plan</Text>

        <View style={styles.agreementBox}>
          <Text style={styles.agreementText}>
            By continuing, you agree to{' '}
            <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>

        {plans.map(plan => (
          <View key={plan.id} style={styles.planCard}>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planDuration}>{plan.duration}</Text>
            </View>

            <Text style={styles.benefitsTitle}>Premium Benefits</Text>

            <View style={styles.benefitsList}>
              {plan.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.benefitLabel}>{benefit.label}</Text>
                  <Text style={styles.benefitValue}>{benefit.value}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => handleSelectPlan(plan)}
              style={[
                styles.buyButton,
                plan.id === 'free' && styles.buyButtonFree,
                subscriptionMutation.isPending && styles.buyButtonDisabled,
              ]}
             >
              <Text
                style={[
                  styles.buyButtonText,
                  plan.id === 'free' && styles.buyButtonTextFree,
                ]}>
                {subscriptionMutation.isPending
                  ? 'Processing...'
                  : plan.id === 'free'
                  ? 'Continue Free'
                  : 'Buy Premium'}
              </Text>
            </Pressable>

            {plan.id !== 'free' && (
              <Text style={styles.agreementTextBottom}>
                By continuing, you agree to{' '}
                <Text style={styles.linkTextBottom}>Terms & Conditions</Text> and{' '}
                <Text style={styles.linkTextBottom}>Privacy Policy</Text>
              </Text>
            )}
          </View>
        ))}

       

        <View style={styles.spacing} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  pageTitle: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  agreementBox: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  agreementText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
  linkText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  planName: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planPrice: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: '700',
    marginRight: 4,
  },
  planDuration: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
  benefitsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkmark: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
    width: 20,
  },
  benefitLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  benefitValue: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buyButtonFree: {
    backgroundColor: '#D4AF37',
  },
  buyButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
  buyButtonTextFree: {
    color: '#000000',
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  agreementTextBottom: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.8,
  },
  linkTextBottom: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  remindLaterButton: {
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  remindLaterText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
  spacing: {
    height: 20,
  },
});

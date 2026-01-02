import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Pressable, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import PlanCelebrationAnimation from '../../components/PlanCelebrationAnimation';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionItem {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const paymentMethods: AccordionItem[] = [
  {
    id: 'jazzcash',
    title: 'JazzCash',
    icon: 'phone-portrait',
    description: 'Pay securely using your JazzCash account. Enter your mobile number and complete the transaction.',
  },
  {
    id: 'easypaisa',
    title: 'EasyPaisa',
    icon: 'wallet',
    description: 'Pay using your EasyPaisa wallet. Quick and secure payment processing.',
  },
  {
    id: 'banktransfer',
    title: 'Bank Transfer',
    icon: 'card',
    description: 'Transfer funds directly from your bank account. Bank details will be provided after clicking proceed.',
  },
];

export default function PaymentsScreen({ navigation, route }: any) {
  const { plan } = route?.params ?? {};
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Form states
  const [jazzcashPhone, setJazzcashPhone] = useState('');
  const [easypaisaPhone, setEasypaisaPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [cvc, setCvc] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const toggleAccordion = (id: string) => {
    // Enable smooth animation for accordion expansion/collapse
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
    // Clear errors when closing accordion
    if (expandedId === id) {
      setErrors({});
    }
  };

  const validatePhone = (phone: string): boolean => {
    // Basic phone validation - should be numeric and have reasonable length
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateAccountNumber = (account: string): boolean => {
    // Account number should be 11-13 digits
    const accountRegex = /^[0-9]{11,13}$/;
    return accountRegex.test(account.replace(/\s+/g, ''));
  };

  const validateCVC = (cvcValue: string): boolean => {
    // CVC should be exactly 3 digits
    const cvcRegex = /^[0-9]{3}$/;
    return cvcRegex.test(cvcValue);
  };

  const handleProceed = (methodId: string) => {
    const newErrors: {[key: string]: string} = {};
    
    if (methodId === 'jazzcash') {
      if (!jazzcashPhone.trim()) {
        newErrors.jazzcashPhone = 'Phone number is required';
      } else if (!validatePhone(jazzcashPhone)) {
        newErrors.jazzcashPhone = 'Please enter a valid phone number';
      }
    } else if (methodId === 'easypaisa') {
      if (!easypaisaPhone.trim()) {
        newErrors.easypaisaPhone = 'Phone number is required';
      } else if (!validatePhone(easypaisaPhone)) {
        newErrors.easypaisaPhone = 'Please enter a valid phone number';
      }
    } else if (methodId === 'banktransfer') {
      if (!accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required';
      } else if (!validateAccountNumber(accountNumber)) {
        newErrors.accountNumber = 'Account number must be 11-13 digits';
      }
      if (!cvc.trim()) {
        newErrors.cvc = 'CVC is required';
      } else if (!validateCVC(cvc)) {
        newErrors.cvc = 'CVC must be 3 digits';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and show celebration animation
    setErrors({});
    setShowCelebration(true);
    
    // After animation, navigate to Main
    setTimeout(() => {
      setShowCelebration(false);
      navigation.navigate('Main');
    }, 3000);
  };

  if (plan) {
    // Payment screen for selecting payment method after subscription
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
    const headerTitle = 'Complete Payment';
    
    return (
      <Screen>
        <Header title={headerTitle} onBack={handleBack} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.topText}>
            Please select your preferred payment method to complete your {planName} Plan subscription.
          </Text>

          <View style={styles.accordionContainer}>
            {paymentMethods.map((method) => {
              const isExpanded = expandedId === method.id;
              
              return (
                <View key={method.id} style={styles.accordionItem}>
            <Pressable
                    style={styles.accordionHeader}
                    onPress={() => toggleAccordion(method.id)}
                  >
                    <View style={styles.accordionHeaderContent}>
                      <View style={styles.iconContainer}>
                        <Icon name={method.icon} size={24} color="#D4AF37" />
                      </View>
                      <Text style={styles.accordionTitle}>{method.title}</Text>
                    </View>
                    <Icon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color="#D4AF37"
                    />
            </Pressable>

                  {isExpanded && (
                    <View style={styles.accordionContent}>
                      <Text style={styles.accordionDescription}>{method.description}</Text>
                      
                      {/* JazzCash Phone Input */}
                      {method.id === 'jazzcash' && (
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}>Phone Number *</Text>
                          <TextInput
                            style={[styles.textInput, errors.jazzcashPhone && styles.inputError]}
                            placeholder="Enter your JazzCash number"
                            placeholderTextColor="#8C8A9A"
                            value={jazzcashPhone}
                            onChangeText={(text) => {
                              setJazzcashPhone(text);
                              if (errors.jazzcashPhone) {
                                setErrors({...errors, jazzcashPhone: ''});
                              }
                            }}
                            keyboardType="phone-pad"
                            maxLength={15}
                          />
                          {errors.jazzcashPhone && (
                            <Text style={styles.errorText}>{errors.jazzcashPhone}</Text>
                          )}
                        </View>
                      )}

                      {/* EasyPaisa Phone Input */}
                      {method.id === 'easypaisa' && (
                        <View style={styles.inputContainer}>
                          <Text style={styles.inputLabel}>Phone Number *</Text>
                          <TextInput
                            style={[styles.textInput, errors.easypaisaPhone && styles.inputError]}
                            placeholder="Enter your EasyPaisa number"
                            placeholderTextColor="#8C8A9A"
                            value={easypaisaPhone}
                            onChangeText={(text) => {
                              setEasypaisaPhone(text);
                              if (errors.easypaisaPhone) {
                                setErrors({...errors, easypaisaPhone: ''});
                              }
                            }}
                            keyboardType="phone-pad"
                            maxLength={15}
                          />
                          {errors.easypaisaPhone && (
                            <Text style={styles.errorText}>{errors.easypaisaPhone}</Text>
                          )}
                        </View>
                      )}

                      {/* Bank Transfer Account Number and CVC */}
                      {method.id === 'banktransfer' && (
                        <>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Account Number *</Text>
                            <TextInput
                              style={[styles.textInput, errors.accountNumber && styles.inputError]}
                              placeholder="Enter account number (11-13 digits)"
                              placeholderTextColor="#8C8A9A"
                              value={accountNumber}
                              onChangeText={(text) => {
                                // Only allow digits
                                const digitsOnly = text.replace(/[^0-9]/g, '');
                                setAccountNumber(digitsOnly);
                                if (errors.accountNumber) {
                                  setErrors({...errors, accountNumber: ''});
                                }
                              }}
                              keyboardType="number-pad"
                              maxLength={13}
                            />
                            {errors.accountNumber && (
                              <Text style={styles.errorText}>{errors.accountNumber}</Text>
                            )}
                          </View>

                          <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>CVC *</Text>
                            <TextInput
                              style={[styles.textInput, errors.cvc && styles.inputError]}
                              placeholder="Enter CVC (3 digits)"
                              placeholderTextColor="#8C8A9A"
                              value={cvc}
                              onChangeText={(text) => {
                                // Only allow digits, max 3
                                const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, 3);
                                setCvc(digitsOnly);
                                if (errors.cvc) {
                                  setErrors({...errors, cvc: ''});
                                }
                              }}
                              keyboardType="number-pad"
                              maxLength={3}
                              secureTextEntry={true}
                            />
                            {errors.cvc && (
                              <Text style={styles.errorText}>{errors.cvc}</Text>
                            )}
          </View>
                        </>
                      )}

          <Pressable
                        style={styles.proceedButton}
                        onPress={() => handleProceed(method.id)}
                      >
                        <Text style={styles.proceedButtonText}>Click to proceed</Text>
          </Pressable>
        </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Celebration Animation */}
        <PlanCelebrationAnimation
          visible={showCelebration}
          planName={planName}
          onClose={() => {
            setShowCelebration(false);
            navigation.navigate('Main');
          }}
        />
      </Screen>
    );
  }

  // Payment history screen (existing functionality)
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
    paddingHorizontal: 16,
  },
  topText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  accordionContainer: {
    gap: 12,
  },
  accordionItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  accordionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  accordionDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginTop: 12,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 14,
    color: '#000000',
    fontSize: 14,
    height: 48,
  },
  inputError: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 4,
  },
  proceedButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  proceedButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
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
  paymentButtonText: {
    color: '#000000',
    fontWeight: '700',
  },
  historyTitle: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    color: '#D4AF37',
    fontSize: 16,
    opacity: 0.8,
  },
});

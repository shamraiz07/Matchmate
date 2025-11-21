import React, { useRef, useState } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Screen from '../../components/Screen';
import { useVerifyOTP } from '../../service/Hooks/User_Auth_Hook';
import Toast from 'react-native-toast-message';

const OTP_LENGTH = 4;

export default function OtpScreen({ navigation, route }: any) {
  const { email } = route?.params || {};
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<Array<RNTextInput | null>>([]);
  const verifyOTPMutation = useVerifyOTP();

  const handleVerifyOTP = async () => { 
    try {
      const formattedOTP = otpValues.join(""); // ["7","8","6","5"] → "7865"
      if (formattedOTP.length !== OTP_LENGTH) {
        Toast.show({
          type: "error",
          text1: "Invalid OTP",
          text2: "Please enter a valid OTP.",
        });
        return;
      }
      verifyOTPMutation.mutateAsync(
        { 
          otp: formattedOTP,
          email: email,
          stage: "verify"
        },
        {
          onSuccess: (res) => {
            console.log("response of verify otp", res.data);
            setIsVerified(true);
            setTimeout(() => {  
              navigation.navigate("NewPassword", {email: email, resetToken: res.data.reset_token});
            }, 1000);
          },
          onError: (err: any) => {
            console.log("error of verify otp", err.response?.data);
            
            const errorMsg =
            err.response?.data?.non_field_errors?.[0] ||
            "Invalid or expired OTP.";
  
          Toast.show({
            type: "error",
            text1: "Verify OTP Failed",
            text2: errorMsg,
          });  
            setIsVerified(false);
          },
        }
      );
    } catch (error: any) {
      console.log("error of verify otp", error.response?.data);
      setIsVerified(false);
    }
  };
  

  const handleChange = (text: string, index: number) => {
    const sanitized = text.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otpValues];
    updated[index] = sanitized;
    setOtpValues(updated);

    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isButtonDisabled =
    verifyOTPMutation.isPending || otpValues.some((val) => val === '');

  return (
    <>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <Screen>
        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit code we sent to your email address
        </Text>

        <View style={styles.otpRow}>
          {otpValues.map((value, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              value={value}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
              keyboardType="number-pad"
              maxLength={1}
              placeholder="•"
              placeholderTextColor="rgba(255,255,255,0.3)"
              style={styles.otpInput}
              autoFocus={index === 0}
              returnKeyType="next"
            />
          ))}
        </View>

        <Pressable
              style={[
                styles.primaryButton,
                isButtonDisabled && { opacity: 0.6 },
              ]}
              onPress={handleVerifyOTP}
              disabled={isButtonDisabled}
            >
              {verifyOTPMutation.isPending ? (
                <ActivityIndicator color="#000" /> 
              ) : (
                <Text style={styles.primaryText}>
                  {isVerified ? 'Verified' : 'Verify'}
                </Text>
              )}
        </Pressable>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    marginTop: '5%',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
    marginBottom: 16,
  },
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    backgroundColor: '#1A1A1A',
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryText: { color: '#000000', fontWeight: '700', fontSize: 16 },
});
 
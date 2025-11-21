import React, { useState } from 'react';
import { Text, TextInput, Pressable, StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSendResetLink } from '../../service/Hooks/User_Auth_Hook';
import Toast from 'react-native-toast-message';
export default function ResetPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const sendResetLinkMutation = useSendResetLink();
  const handleSendResetLink = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
      });
      return;
    }
    try{
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter your email.",
      });
      return;
    }
    sendResetLinkMutation.mutateAsync(email,{
      onSuccess: (res) => {
        console.log('response of send reset link', res.data);
        navigation.navigate('Otp',{email: email});
      },
      onError: (err: any) => {
        console.log('error of send reset link', err.response.data);
        const errorMsg =
            err.response?.data?.error?.[0] ||
            "No account found with this email..";
  
          Toast.show({
            type: "error",
            text1: "Reset Password Failed",
            text2: errorMsg,
          });  
          console.log("error of send reset link", err.response?.data);
      },
    });
  } catch (error: any) {
    console.log('error of send reset link', error.response.data);
  }
  };

  return (
    <>
    <Screen>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        placeholder="Email or Phone"
        placeholderTextColor="#8C8A9A"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
   <Pressable
        onPress={handleSendResetLink}
        style={[styles.primary, sendResetLinkMutation.isPending && { opacity: 0.7 }]}
        disabled={sendResetLinkMutation.isLoading}
      >
        {sendResetLinkMutation.isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Send reset link</Text>
        )}
      </Pressable>
    </Screen>
    </>
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
  header: {
    height: 80,
    marginTop: '5%',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
    marginBottom: 16,
  },
  primaryText: { color: '#000000', fontWeight: '700' },
});


import React, { useState } from 'react';
import { Text, TextInput, Pressable,  StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import { useNewPassword } from '../../service/Hooks/User_Auth_Hook';
import Toast from 'react-native-toast-message';

export default function NewPasswordScreen({ navigation, route }: any) {
  const { email,resetToken } = route?.params || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const newPasswordMutation = useNewPassword();
  const handleSubmit = () => {
    if (!newPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please enter a new password.",
      });
      return;
    }

    if (!confirmPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please confirm your password.",
      });
      return;
    }

    // Check password match
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "New password and confirm password must be the same.",
      });
      return;
    }

try{
    const payload = {
      email: email,
      new_password: newPassword,
      confirm_password: confirmPassword,
      
    };
    newPasswordMutation.mutateAsync(  {
      payload,
      resetToken,  // now passed correctly
    },{
      onSuccess: (res) => {
        console.log('response of new password', res.data);

        navigation.navigate('Login');
      },
      onError: (err: any) => {
        const data = err.response?.data || {};
      
        let message = 'Unable to reset password.';
      
        if (Array.isArray(data?.new_password)) {
          message = data.new_password.join(' ');
        } else if (typeof data?.new_password === 'string') {
          message = data.new_password;
        }
      
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: message,
        });
      
        console.log('error of new password', data);
      },
    });
  } catch (error: any) {
    console.log('error of new password', error.response.data);
  }
  }
  return (
    <Screen>
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Please enter your new password to continue
      </Text>

      <TextInput
        placeholder="New Password"
        placeholderTextColor="#8C8A9A"
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#8C8A9A"
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable onPress={handleSubmit} style={styles.primary}>
        <Text style={styles.primaryText}>Continue</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#FFFFFF',
    marginTop: 6,
    opacity: 0.8,
    textAlign: 'center',
  },
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
  primaryText: {
    color: '#000000',
    fontWeight: '700',
  },
});


import React from 'react';
import { Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';

export default function ResetPasswordScreen({ navigation }: any) {
  return (
    <Screen>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        placeholder="Email or Phone"
        placeholderTextColor="#8C8A9A"
        style={styles.input}
      />
      <Pressable onPress={() => navigation.goBack()} style={styles.primary}>
        <Text style={styles.primaryText}>Send reset link</Text>
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


import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';

export default function OnboardingScreen({ navigation }: any) {
  return (
    <Screen>
      <Text style={styles.title}>Welcome to Matchmate</Text>
      <Text style={styles.subtitle}>
        AI matchmaking, secure connections, audio/video calls.
      </Text>
      <Pressable
        onPress={() => navigation.replace('Login')}
        style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#D4AF37', fontSize: 24, fontWeight: '700', marginTop: 16 },
  subtitle: { color: '#FFFFFF', marginTop: 8, opacity: 0.9 },
  button: {
    marginTop: 24,
    backgroundColor: '#D4AF37',
    padding: 14,
    borderRadius: 10,
    width: 160,
    alignItems: 'center',
  },
  buttonText: { color: '#000000', fontWeight: '600' },
});


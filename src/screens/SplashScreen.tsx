import React, { useEffect } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../components/Screen';

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), 1000);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <Screen>
      <Text style={styles.title}>Matchmate</Text>
      <Text style={styles.subtitle}>
        Modern matrimonial matchmaking with private chat and calls.
      </Text>
      <Pressable
        onPress={() => navigation.replace('Login')}
        style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#D4AF37', fontSize: 28, fontWeight: '700', marginTop: 40 },
  subtitle: { color: '#FFFFFF', marginTop: 12, opacity: 0.8 },
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


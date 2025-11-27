import React from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import { useAuthStore } from '../../store/Auth_store';

export default function ProfileScreen({ navigation }: any) {
  return (
    <Screen>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>Plan: Free</Text>
      <View style={{ height: 12 }} />
      <Pressable
        onPress={() => navigation.navigate('Subscriptions')}
        style={styles.primary}>
        <Text style={styles.primaryText}>Upgrade</Text>
      </Pressable>
      <View style={{ height: 8 }} />
      <Pressable
        onPress={() => navigation.navigate('Settings')}
        style={styles.ghost}>
        <Text style={styles.ghostText}>Settings</Text>
      </Pressable>
      <View style={{ height: 8 }} />
      <Pressable
        onPress={() => {
          navigation.replace('Login')}
        }
        style={styles.ghost}>
        <Text style={styles.ghostText}>Logout</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#FFFFFF', marginTop: 6, opacity: 0.8 },
  primary: {
    backgroundColor: '#D4AF37',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryText: { color: '#000000', fontWeight: '700' },
  ghost: {
    borderColor: '#D4AF37',
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  ghostText: { color: '#D4AF37', fontWeight: '700' },
});


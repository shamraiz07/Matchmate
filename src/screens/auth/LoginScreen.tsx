import React, { useState } from 'react';
import { Text, TextInput, Pressable, View, StyleSheet, Alert } from 'react-native';
import Screen from '../../components/Screen';
import { userLogin } from '../../service/Auth/UeserRegistration';
import { useLoginUser } from '../../service/Hooks/User_Auth_Hook';
import { useAuthStore } from '../../store/Auth_store';
export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLoginUser();
  const  setUser  = useAuthStore((state) => state.setUser);
  const handleLogin = async () => {
    try {
    const data = {
      email,
      password,
    };
    loginMutation.mutate(data,{
      onSuccess: (res) => {
        console.log('response of user login', res.data);
        setUser(res.data.user);
        navigation.replace('Main');
      },
      onError: (err: any) => {
        console.log('error of user login', err.response.data);
      },

    });
    } catch (error: any) {
      console.log('error of user login', error.response.data);
    }
  };
  return (
    <Screen>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email or Phone"
        placeholderTextColor="#8C8A9A"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#8C8A9A"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Pressable onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>
      <Pressable
        onPress={() => handleLogin()}
        style={styles.primary}>
        <Text style={styles.primaryText}>Login</Text>
      </Pressable>
      <View style={{ height: 12 }} />
      <Pressable
        onPress={() => navigation.navigate('Register')}
        style={styles.ghost}>
        <Text style={styles.ghostText}>Create account</Text>
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
  link: { color: '#D4AF37', marginTop: 8 },
  primary: {
    backgroundColor: '#D4AF37',
    padding: 14,
    borderRadius: 10,
    marginTop: 18,
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


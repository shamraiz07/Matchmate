import React, { useState } from 'react';
import { Text, TextInput, Pressable, View, StyleSheet, Alert } from 'react-native';
import Screen from '../../components/Screen';
import { userLogin } from '../../service/Auth/UeserRegistration';
import { useLoginUser } from '../../service/Hooks/User_Auth_Hook';
import { useAuthStore } from '../../store/Auth_store';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLoginUser();
  const  setUser  = useAuthStore((state) => state.setUser);
  const  setToken  = useAuthStore((state) => state.setToken);
  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email.trim()) {
        Toast.show({
          type: "error",
          text1: "Missing Information",
          text2: "Please enter your email.",
        });
        return;
      }

      if (!emailRegex.test(email.trim())) {
        Toast.show({
          type: "error",
          text1: "Invalid Email",
          text2: "Please enter a valid email address.",
        });
        return;
      }

      if (!password.trim()) {
        Toast.show({
          type: "error",
          text1: "Missing Information",
          text2: "Please enter your password.",
        });
        return;
      }

    try {
      const data = {
        email,
        password,
      };
  
      loginMutation.mutateAsync({payload: data}, {
        onSuccess: (res) => {
          console.log('response of user login', res?.data);
          setUser(res?.data.user);
          setToken(res?.data.token);
          if(res?.data?.hasProfile){
          navigation.replace('Main');
        }
        else{
          navigation.replace('ProfileSetup');
        }
      },
  
        onError: (err: any) => {
          const data = err.response?.data || {};
          const msg =
            data?.non_field_errors?.[0] ||
            data?.detail ||
            "Invalid email or password.";
        
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: msg,
          });
        
          console.log("login error ===>", data);
        },
      });
  
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "Something went wrong!",
      });
      console.log("error of user login", error.response?.data);
    }
  };
  return (
    <Screen>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Sign in to your account to continue</Text>
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
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700',textAlign: 'center' },
  subtitle: { color: '#FFFFFF', marginTop: 6, opacity: 0.8,textAlign: 'center' },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  link: { color: '#D4AF37', marginTop: 8,textAlign: 'right' },
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


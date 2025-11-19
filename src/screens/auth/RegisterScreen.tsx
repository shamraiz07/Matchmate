import React, { useState } from 'react';
import { Text, TextInput, Pressable, View, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import { userRegistration } from '../../service/Auth/UeserRegistration';

export default function RegisterScreen({ navigation }: any) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleGoogleSignUp = () => {
    // TODO: Implement Google Sign Up
    console.log('Sign up with Google');
    navigation.replace('Subscriptions');
  };

  const handleEmailSignUp = async () => {
    if (username && firstName && lastName && email && phoneNumber && password && confirmPassword) {
      if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return;
      }
      const data = {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        password,
        confirm_password: confirmPassword,
      };
      const response = await userRegistration(data);
      console.log('response of user registration', response);
      // navigation.replace('Subscriptions');
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Sign up to start finding your perfect match
        </Text>

        <View style={styles.spacing} />

        {/* Sign up with Google */}
        <Pressable onPress={handleGoogleSignUp} style={styles.googleButton}>
          <Text style={styles.googleButtonText}>🔗 Sign up with Google</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign up with Email */}
        {!showEmailForm ? (
          <Pressable
            onPress={() => setShowEmailForm(true)}
            style={styles.emailButton}>
            <Text style={styles.emailButtonText}>📧 Sign up with Email</Text>
          </Pressable>
        ) : (
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Username"
              placeholderTextColor="#8C8A9A"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="First name"
              placeholderTextColor="#8C8A9A"
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            <TextInput
              placeholder="Last name"
              placeholderTextColor="#8C8A9A"
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#8C8A9A"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Phone number"
              placeholderTextColor="#8C8A9A"
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#8C8A9A"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor="#8C8A9A"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable
              onPress={handleEmailSignUp}
              style={[
                styles.continueButton,
                (!username || !firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) && styles.continueButtonDisabled,
              ]}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </Pressable>
          </View>
        )}

        {/* Already have account */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>(Login)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
   justifyContent: 'center',
  },
  title: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  spacing: {
    height: 32,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  googleButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4AF37',
    opacity: 0.3,
  },
  dividerText: {
    color: '#D4AF37',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  emailButton: {
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
  formContainer: {
    marginTop: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  loginLink: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
});

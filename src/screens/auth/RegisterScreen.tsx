import React, { useState } from 'react';
import { Text, TextInput, Pressable, View, StyleSheet, ScrollView ,ActivityIndicator} from 'react-native';
import Screen from '../../components/Screen';
// import { userRegistration } from '../../service/Auth/UeserRegistration';
import { useRegister } from '../../service/Hooks/User_Auth_Hook';
import { useAuthStore } from '../../store/Auth_store';
import Toast from 'react-native-toast-message';
export default function RegisterScreen({ navigation }: any) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthCountry, setBirthCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const registerMutation = useRegister();
  const setUser = useAuthStore((state) => state.setUser);
  // Validation functions
  const validateEmail = (emailValue: string): string => {
    if (!emailValue.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePhone = (phoneValue: string): string => {
    if (!phoneValue.trim()) {
      return 'Phone number is required';
    }
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneValue.trim().replace(/[^0-9]/g, ''))) {
      return 'Please enter a valid phone number (10-15 digits)';
    }
    return '';
  };

  const validatePassword = (passwordValue: string): string => {
    if (!passwordValue.trim()) {
      return 'Password is required';
    }
    return '';
  };

  const validateConfirmPassword = (confirmPasswordValue: string, passwordValue: string): string => {
    if (!confirmPasswordValue.trim()) {
      return 'Please confirm your password';
    }
    if (confirmPasswordValue !== passwordValue) {
      return 'Passwords do not match';
    }
    return '';
  };

  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'username':
        return !value.trim() ? 'Username is required' : '';
      case 'firstName':
        return !value.trim() ? 'First name is required' : '';
      case 'lastName':
        return !value.trim() ? 'Last name is required' : '';
      case 'email':
        return validateEmail(value);
      case 'phoneNumber':
        return validatePhone(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(value, password);
      default:
        return '';
    }
  };

  const getReadableErrorMessage = (backendErrors: any) => {
    if (!backendErrors || typeof backendErrors !== 'object') return 'Something went wrong';
  
    let messages: string[] = [];
  
    Object.keys(backendErrors).forEach((field) => {
      if (Array.isArray(backendErrors[field])) {
        messages.push(backendErrors[field][0]); // first error only
      } else if (typeof backendErrors[field] === 'string') {
        messages.push(backendErrors[field]);
      }
    });
  
    return messages.join('\n') || 'Registration failed. Please check your information.';
  };
  
  const handleEmailSignUp = async () => {
    // Clear previous errors
    setErrors({});

    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    const usernameError = validateField('username', username);
    if (usernameError) newErrors.username = usernameError;

    const firstNameError = validateField('firstName', firstName);
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateField('lastName', lastName);
    if (lastNameError) newErrors.lastName = lastNameError;

    const emailError = validateField('email', email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validateField('phoneNumber', phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;

    const passwordError = validateField('password', password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateField('confirmPassword', confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    // If there are validation errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: firstError,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log("🟩 FUNCTION CALL — handleEmailSignUp");
  
    try {
      // Log all fields
      console.log("📌 Current State:", {
        username,
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        confirmPassword,
      });
  
      const data = {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        birth_country: birthCountry.trim(),
        password,
        confirm_password: confirmPassword,
       };
  
      console.log("📦 FINAL PAYLOAD TO MUTATION:", data);
  
      (registerMutation.mutateAsync as any)(data, {
        onSuccess: (res: any) => {
          console.log("🎉 REGISTRATION SUCCESS");
          console.log("📥 Response:", res.data);
          setIsLoading(false);
          setUser(res.data.user);
          navigation.replace('Login');
          Toast.show({
            type: 'success',
            text1:"🎉 REGISTRATION SUCCESS",
            text2: "Registration successful! Please login to continue.",
          });
        },
        onError: (err: any) => {
          console.log("🔥 REGISTRATION ERROR");
          console.log("⬅ Error Data:", err?.response?.data);
          setIsLoading(false);
          
          const backendErrors = err?.response?.data || {};
          const fieldErrors: Record<string, string> = {};

          // Map backend errors to field errors
          if (backendErrors.username) {
            fieldErrors.username = Array.isArray(backendErrors.username) 
              ? backendErrors.username[0] 
              : backendErrors.username;
          }
          if (backendErrors.first_name) {
            fieldErrors.firstName = Array.isArray(backendErrors.first_name) 
              ? backendErrors.first_name[0] 
              : backendErrors.first_name;
          }
          if (backendErrors.last_name) {
            fieldErrors.lastName = Array.isArray(backendErrors.last_name) 
              ? backendErrors.last_name[0] 
              : backendErrors.last_name;
          }
          if (backendErrors.email) {
            fieldErrors.email = Array.isArray(backendErrors.email) 
              ? backendErrors.email[0] 
              : backendErrors.email;
          }
          if (backendErrors.phone_number) {
            fieldErrors.phoneNumber = Array.isArray(backendErrors.phone_number) 
              ? backendErrors.phone_number[0] 
              : backendErrors.phone_number;
          }
          if (backendErrors.birth_country) {
            fieldErrors.birthCountry = Array.isArray(backendErrors.birth_country) 
              ? backendErrors.birth_country[0] 
              : backendErrors.birth_country;
          }
          if (backendErrors.password) {
            fieldErrors.password = Array.isArray(backendErrors.password) 
              ? backendErrors.password[0] 
              : backendErrors.password;
          }
          if (backendErrors.confirm_password) {
            fieldErrors.confirmPassword = Array.isArray(backendErrors.confirm_password) 
              ? backendErrors.confirm_password[0] 
              : backendErrors.confirm_password;
          }

          setErrors(fieldErrors);

          const errorMessage = getReadableErrorMessage(backendErrors);
        
          Toast.show({
            type: 'error',
            text1: 'Registration Failed',
            text2: errorMessage,
          });
        },
      });
    } catch (error: any) {
      console.log("Error:", error);
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred. Please try again.',
      });
    }
  };
  
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Creates Account</Text>
        <Text style={styles.subtitle}>
          Sign up to start finding your perfect match
        </Text>

       
        {/* Sign up with Email */}
        {!showEmailForm ? (
          <View>
           <View style={styles.spacing} />
          <Pressable
            onPress={() => setShowEmailForm(true)}
            style={styles.emailButton}>
            <Text style={styles.emailButtonText}>Create Account with Email</Text>
          </Pressable>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View>
              <TextInput
                placeholder="Username"
                placeholderTextColor="#8C8A9A"
                style={[styles.input, errors.username && styles.inputError]}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errors.username) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.username;
                      return newErrors;
                    });
                  }
                }}
                autoCapitalize="none"
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            <View>
              <TextInput
                placeholder="First name"
                placeholderTextColor="#8C8A9A"
                style={[styles.input, errors.firstName && styles.inputError]}
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.firstName) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.firstName;
                      return newErrors;
                    });
                  }
                }}
                autoCapitalize="words"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            <View>
              <TextInput
                placeholder="Last name"
                placeholderTextColor="#8C8A9A"
                style={[styles.input, errors.lastName && styles.inputError]}
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.lastName) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.lastName;
                      return newErrors;
                    });
                  }
                }}
                autoCapitalize="words"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            <View>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#8C8A9A"
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.email;
                      return newErrors;
                    });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View>
              <TextInput
                placeholder="Phone number"
                placeholderTextColor="#8C8A9A"
                style={[styles.input, errors.phoneNumber && styles.inputError]}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (errors.phoneNumber) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.phoneNumber;
                      return newErrors;
                    });
                  }
                }}
                keyboardType="phone-pad"
              />
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
            </View>

            <View>
              <TextInput
                placeholder="Birth country"
                placeholderTextColor="#8C8A9A"
                style={[styles.input, errors.birthCountry && styles.inputError]}
                value={birthCountry}
                onChangeText={(text) => {
                  setBirthCountry(text);
                  if (errors.birthCountry) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.birthCountry;
                      return newErrors;
                    });
                  }
                }}
                autoCapitalize="words"
              />
              {errors.birthCountry && (
                <Text style={styles.errorText}>{errors.birthCountry}</Text>
              )}
            </View>

            <View>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#8C8A9A"
                secureTextEntry
                style={[styles.input, errors.password && styles.inputError]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.password;
                      return newErrors;
                    });
                  }
                  // Also clear confirm password error if passwords match
                  if (text === confirmPassword && errors.confirmPassword) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.confirmPassword;
                      return newErrors;
                    });
                  }
                }}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <View>
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor="#8C8A9A"
                secureTextEntry
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.confirmPassword;
                      return newErrors;
                    });
                  }
                  // Check match in real-time
                  if (text && password && text !== password) {
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: 'Passwords do not match',
                    }));
                  } else if (text === password && errors.confirmPassword) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.confirmPassword;
                      return newErrors;
                    });
                  }
                }}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>
            <Pressable
              onPress={handleEmailSignUp}
              disabled={isLoading}
              style={[
                styles.continueButton,
                (!username || !firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) && styles.continueButtonDisabled,
              ]}>
                {isLoading ? <ActivityIndicator size="small" color="#D4AF37" /> : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
            </Pressable>
                {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

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
  },
  googleButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
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
    // marginTop: 8,
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
  inputError: {
    borderColor: '#E14D4D',
    borderWidth: 2,
  },
  errorText: {
    color: '#E14D4D',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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


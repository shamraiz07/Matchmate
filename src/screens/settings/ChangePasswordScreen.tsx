import React, { useState } from 'react';
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { useChangePassword } from '../../service/Hooks/User_Auth_Hook';
import Toast from 'react-native-toast-message';

export default function ChangePasswordScreen({ navigation }: any) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useChangePassword();

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const newErrors: Record<string, string> = {};
    
    // Validate current password
    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    // Validate new password
    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is same as current password
    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    // If there are validation errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: firstError,
      });
      return;
    }

    try {
      const payload = {
        current_password: currentPassword.trim(),
        new_password: newPassword.trim(),
        confirm_password: confirmPassword.trim(),
      };

      await changePasswordMutation.mutateAsync({ payload }, {
        onSuccess: (res: any) => {
          console.log('Password changed successfully:', res.data);
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Password changed successfully',
          });
          // Clear form
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setErrors({});
          // Navigate back after a short delay
          setTimeout(() => {
            navigation.goBack();
          }, 1500);
        },
        onError: (err: any) => {
          console.error('Error changing password:', err);
          const errorData = err?.response?.data || {};
          
          // Handle different error scenarios
          let errorMessage = 'Failed to change password. Please try again.';
          
          if (errorData.current_password) {
            if (Array.isArray(errorData.current_password)) {
              errorMessage = errorData.current_password[0];
            } else if (typeof errorData.current_password === 'string') {
              errorMessage = errorData.current_password;
            }
            setErrors({ currentPassword: errorMessage });
          } else if (errorData.new_password) {
            if (Array.isArray(errorData.new_password)) {
              errorMessage = errorData.new_password[0];
            } else if (typeof errorData.new_password === 'string') {
              errorMessage = errorData.new_password;
            }
            setErrors({ newPassword: errorMessage });
          } else if (errorData.non_field_errors) {
            if (Array.isArray(errorData.non_field_errors)) {
              errorMessage = errorData.non_field_errors[0];
            } else if (typeof errorData.non_field_errors === 'string') {
              errorMessage = errorData.non_field_errors;
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }

          Toast.show({
            type: 'error',
            text1: 'Change Password Failed',
            text2: errorMessage,
          });
        },
      });
    } catch (error: any) {
      console.error('Unexpected error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <Screen>
      <Header title="Change Password" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Enter your current password and choose a new password
          </Text>

          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                placeholder="Enter current password"
                placeholderTextColor="#8C8A9A"
                style={[
                  styles.input,
                  errors.currentPassword && styles.inputError,
                ]}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (errors.currentPassword) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.currentPassword;
                      return newErrors;
                    });
                  }
                }}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Icon
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#8C8A9A"
                />
              </Pressable>
            </View>
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                placeholder="Enter new password"
                placeholderTextColor="#8C8A9A"
                style={[
                  styles.input,
                  errors.newPassword && styles.inputError,
                ]}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.newPassword;
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
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#8C8A9A"
                />
              </Pressable>
            </View>
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                placeholder="Confirm new password"
                placeholderTextColor="#8C8A9A"
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError,
                ]}
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
                  if (text && newPassword && text !== newPassword) {
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: 'Passwords do not match',
                    }));
                  } else if (text === newPassword && errors.confirmPassword) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.confirmPassword;
                      return newErrors;
                    });
                  }
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#8C8A9A"
                />
              </Pressable>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSubmit}
            style={[
              styles.saveButton,
              changePasswordMutation.isPending && styles.saveButtonDisabled,
            ]}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <ActivityIndicator size="large" color="#D4AF37" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    color: '#FFFFFF',
    padding: 12,
    paddingRight: 50,
    borderRadius: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#E14D4D',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 4,
  },
  errorText: {
    color: '#E14D4D',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
});

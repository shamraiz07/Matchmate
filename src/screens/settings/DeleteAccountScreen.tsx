import React, { useState } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import { useDeleteAccount } from '../../service/Hooks/User_Profile_Hook';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DeleteAccountScreen({ navigation }: any) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const DeleteAccountMutation = useDeleteAccount();

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleDeleteButtonPress = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    try {
      await DeleteAccountMutation.mutateAsync();
      Toast.show({
        type: 'success',
        text1: 'Account deleted successfully',
      });
      navigation.replace('Login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to delete account. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };

  return (
    <Screen>
      <View style={styles.headerContainer}>
        <Header title="Delete Account" onBack={handleBack} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Delete Account</Text>
        <Text style={styles.warning}>
        Are you sure? Deleting your account is permanent and all your data will be lost. You will not be able to recover it.
        </Text>
        <Pressable
          onPress={handleDeleteButtonPress}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Confirm Delete</Text>
        </Pressable>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Account?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete your account? This action cannot
              be undone and all your data will be permanently deleted.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={handleCancelDelete}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalConfirmText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  warning: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 32,
  },
  deleteButton: {
    backgroundColor: '#E14D4D',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.9,
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#E14D4D',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});


import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { fetchMFDAssignmentById, updateMFDAssignment } from '../../services/mfd';
import { MFDStackParamList } from '../../app/navigation/stacks/MFDStack';
import PALETTE from '../../theme/palette';

type Route = RouteProp<MFDStackParamList, 'AssignmentEdit'>;

const PRIMARY = PALETTE.green700;

export default function MFDAssignmentEdit() {
  const navigation = useNavigation();
  const { params } = useRoute<Route>();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    fisherman_id: '',
    boat_id: '',
    assignment_date: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
    notes: '',
  });

  const loadAssignment = useCallback(async () => {
    try {
      setInitialLoading(true);
      const assignment = await fetchMFDAssignmentById(params.assignmentId);
      setFormData({
        fisherman_id: assignment.fisherman_id.toString(),
        boat_id: assignment.boat_id.toString(),
        assignment_date: assignment.assignment_date.split('T')[0], // Extract date part
        status: assignment.status,
        notes: assignment.notes || '',
      });
    } catch (error) {
      console.error('Error loading assignment:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load assignment details',
        position: 'top',
      });
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  }, [params.assignmentId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadAssignment();
    }, [loadAssignment])
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!formData.fisherman_id || !formData.boat_id || !formData.assignment_date) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields',
        position: 'top',
      });
      return;
    }

    try {
      setLoading(true);
      await updateMFDAssignment(params.assignmentId, {
        fisherman_id: parseInt(formData.fisherman_id),
        boat_id: parseInt(formData.boat_id),
        assignment_date: formData.assignment_date,
        status: formData.status,
        notes: formData.notes || undefined,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Assignment updated successfully',
        position: 'top',
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error updating assignment:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update assignment',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  }, [formData, params.assignmentId, navigation]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? All changes will be lost.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading assignment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: PRIMARY }]}>
        <Pressable
          onPress={handleCancel}
          style={styles.iconBtn}
          accessibilityLabel="Cancel"
        >
          <MaterialIcons name="close" size={22} color="#fff" />
        </Pressable>

        <Text style={styles.title}>Edit Assignment</Text>

        <Pressable
          onPress={handleSubmit}
          style={[styles.saveBtn, loading && { opacity: 0.5 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="check" size={22} color="#fff" />
          )}
        </Pressable>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Fisherman ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fisherman ID *</Text>
            <TextInput
              style={styles.input}
              value={formData.fisherman_id}
              onChangeText={(value) => handleInputChange('fisherman_id', value)}
              placeholder="Enter fisherman ID"
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          {/* Boat ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Boat ID *</Text>
            <TextInput
              style={styles.input}
              value={formData.boat_id}
              onChangeText={(value) => handleInputChange('boat_id', value)}
              placeholder="Enter boat ID"
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          {/* Assignment Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assignment Date *</Text>
            <TextInput
              style={styles.input}
              value={formData.assignment_date}
              onChangeText={(value) => handleInputChange('assignment_date', value)}
              placeholder="YYYY-MM-DD"
              editable={!loading}
            />
          </View>

          {/* Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusContainer}>
              {(['active', 'inactive', 'pending'] as const).map((status) => (
                <Pressable
                  key={status}
                  style={[
                    styles.statusOption,
                    formData.status === status && styles.statusOptionActive,
                  ]}
                  onPress={() => handleInputChange('status', status)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.statusText,
                      formData.status === status && styles.statusTextActive,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Enter assignment notes (optional)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>
        </View>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: PALETTE.text600,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.text900,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: PALETTE.text900,
  },
  textArea: {
    height: 100,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PALETTE.border,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: PALETTE.green700,
    borderColor: PALETTE.green700,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.text600,
  },
  statusTextActive: {
    color: '#fff',
  },
});

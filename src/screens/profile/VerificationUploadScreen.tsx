import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';

export default function VerificationUploadScreen({ navigation, route }: any) {
  const { attributeName, attributeId } = route?.params ?? {};
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handlePickFromGallery = () => {
    // In production, use react-native-image-picker or similar
    // For now, simulate the action
    Alert.alert(
      'Pick Photo',
      'This would open the gallery to select an ID card photo. In production, integrate react-native-image-picker.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Pick',
          onPress: () => {
            // Simulate selecting an image
            setSelectedImage('picked');
            setUploaded(false);
          },
        },
      ]
    );
  };

  const handleTakePhoto = () => {
    // In production, use react-native-image-picker with camera option
    Alert.alert(
      'Take Photo',
      'This would open the camera to take a photo of your ID card. In production, integrate react-native-image-picker with camera option.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Capture',
          onPress: () => {
            // Simulate taking a photo
            setSelectedImage('captured');
            setUploaded(false);
          },
        },
      ]
    );
  };

  const handleScanID = () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please pick or take a photo first');
      return;
    }

    // Simulate scanning process
    Alert.alert(
      'Scanning ID Card',
      'Scanning your ID card for verification...',
      [
        {
          text: 'OK',
          onPress: () => {
            setUploaded(true);
            Alert.alert(
              'Success',
              'Your ID card has been scanned and uploaded successfully. Verification will be processed within 24-48 hours.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.goBack();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleUpload = () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please pick or take a photo first');
      return;
    }

    setUploaded(true);
    Alert.alert(
      'Upload Successful',
      'Your document has been uploaded successfully. Verification will be processed within 24-48 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <Header title={`Verify ${attributeName || 'Attribute'}`} onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Icon name="document-text" size={64} color="#D4AF37" />
          <Text style={styles.title}>Upload ID Card</Text>
          <Text style={styles.subtitle}>
            Upload or take a photo of your ID card to verify your {attributeName || 'attribute'}
          </Text>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Choose an option</Text>

          <Pressable style={styles.optionCard} onPress={handlePickFromGallery}>
            <View style={styles.optionIconContainer}>
              <Icon name="images" size={32} color="#D4AF37" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Pick from Gallery</Text>
              <Text style={styles.optionDescription}>
                Select an existing photo of your ID card from your gallery
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#808080" />
          </Pressable>

          <Pressable style={styles.optionCard} onPress={handleTakePhoto}>
            <View style={styles.optionIconContainer}>
              <Icon name="camera" size={32} color="#D4AF37" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Take Photo</Text>
              <Text style={styles.optionDescription}>
                Use your camera to take a new photo of your ID card
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#808080" />
          </Pressable>
        </View>

        {selectedImage && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewContainer}>
              <View style={styles.imagePlaceholder}>
                <Icon name="document" size={48} color="#D4AF37" />
                <Text style={styles.previewText}>
                  {selectedImage === 'picked' ? 'Photo from Gallery' : 'Photo from Camera'}
                </Text>
                <Text style={styles.previewSubtext}>ID Card Ready</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <View style={styles.instructionItem}>
            <Icon name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>
              Ensure the ID card is clearly visible and all text is readable
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>
              Make sure there's good lighting and no glare on the card
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>
              The entire ID card should be within the frame
            </Text>
          </View>
        </View>

        {selectedImage && !uploaded && (
          <View style={styles.actionButtons}>
            <Pressable style={styles.scanButton} onPress={handleScanID}>
              <Icon name="scan" size={20} color="#FFFFFF" />
              <Text style={styles.scanButtonText}>Scan ID Card</Text>
            </Pressable>
            <Pressable style={styles.uploadButton} onPress={handleUpload}>
              <Icon name="cloud-upload" size={20} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>Upload Document</Text>
            </Pressable>
          </View>
        )}

        {uploaded && (
          <View style={styles.successSection}>
            <Icon name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.successText}>Upload Successful!</Text>
            <Text style={styles.successSubtext}>
              Your document has been submitted for verification
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 16,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 20,
    alignItems: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    width: '100%',
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  previewSubtext: {
    color: '#D4AF37',
    fontSize: 14,
    opacity: 0.8,
  },
  instructionsSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  instructionsTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.8,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  scanButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  uploadButton: {
    backgroundColor: '#FFA500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  successSection: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
});


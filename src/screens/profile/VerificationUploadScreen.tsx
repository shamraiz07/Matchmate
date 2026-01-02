import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  PermissionsAndroid,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import ImagePicker from 'react-native-image-crop-picker';
import { useCNIC_Verification_Upload } from '../../service/Hooks/User_Verification_Hook';
import Toast from 'react-native-toast-message';
export default function VerificationUploadScreen({ navigation, route }: any) {
  const { attributeName, attributeId } = route?.params ?? {};
  const [images, setImages] = useState<Array<{ uri: string; type: string; fileName?: string; mimeType?: string }>>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const verificationUploadMutation = useCNIC_Verification_Upload();

  const MAX_IMAGES = 2;
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera permission to take photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Camera permission error:', err);
      return false;
    }
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: any): { title: string; message: string } => {
    const statusCode = error?.response?.status;
    const errorData = error?.response?.data || error?.data || {};

    // Handle specific HTTP status codes
    if (statusCode === 400) {
      const message = errorData?.message || errorData?.error || errorData?.detail;
      if (message) {
        return {
          title: 'Invalid Request',
          message: Array.isArray(message) ? message[0] : message,
        };
      }
      return {
        title: 'Invalid Request',
        message: 'The image format is invalid or missing required information. Please try again.',
      };
    }

    if (statusCode === 401) {
      return {
        title: 'Authentication Required',
        message: 'Your session has expired. Please log in again to continue.',
      };
    }

    if (statusCode === 403) {
      return {
        title: 'Permission Denied',
        message: 'You do not have permission to upload verification documents. Please contact support.',
      };
    }

    if (statusCode === 413) {
      return {
        title: 'File Too Large',
        message: 'The image file is too large. Please compress the image or choose a smaller file (max 10MB).',
      };
    }

    if (statusCode === 415) {
      return {
        title: 'Unsupported File Type',
        message: 'The file format is not supported. Please upload JPG, PNG, or JPEG images only.',
      };
    }

    if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
      return {
        title: 'Server Error',
        message: 'Our servers are experiencing issues. Please try again in a few minutes.',
      };
    }

    if (statusCode === 504) {
      return {
        title: 'Upload Timeout',
        message: 'The upload took too long. Please check your internet connection and try again with a smaller image.',
      };
    }

    // Handle network errors
    if (error?.message) {
      if (error.message.includes('Network') || error.message.includes('network')) {
        return {
          title: 'Network Error',
          message: 'No internet connection. Please check your network settings and try again.',
        };
      }
      if (error.message.includes('timeout')) {
        return {
          title: 'Request Timeout',
          message: 'The request took too long. Please check your internet connection and try again.',
        };
      }
    }

    // Handle backend error messages
    if (errorData?.message) {
      return {
        title: 'Upload Failed',
        message: Array.isArray(errorData.message) ? errorData.message[0] : errorData.message,
      };
    }

    if (errorData?.error) {
      return {
        title: 'Upload Failed',
        message: Array.isArray(errorData.error) ? errorData.error[0] : errorData.error,
      };
    }

    if (errorData?.detail) {
      return {
        title: 'Upload Failed',
        message: errorData.detail,
      };
    }

    // Default error
    return {
      title: 'Upload Failed',
      message: 'Failed to upload document. Please check your internet connection and try again.',
    };
  };
  // -------------------------
  // PICK FROM GALLERY WITH CROPPING
  // -------------------------
  const handlePickFromGallery = () => {
    if (images.length >= MAX_IMAGES) {
      Toast.show({
        type: 'info',
        text1: 'Maximum Images Reached',
        text2: 'You can only upload 2 photos (front and back). Please remove an existing image first.',
      });
      return;
    }

    ImagePicker.openPicker({
      width: 800,
      height: 600,
      cropping: true,
      cropperToolbarTitle: 'Crop Image',
      cropperChooseText: 'Choose',
      cropperCancelText: 'Cancel',
      compressImageQuality: 0.8,
      includeBase64: false,
    })
      .then(image => {
        const imageData = {
          uri: image.path,
          type: 'gallery',
          fileName: image.filename || `image_${Date.now()}.jpg`,
          mimeType: image.mime || 'image/jpeg',
        };
        setImages(prev => [...prev, imageData]);
        if (!selectedImage) {
          setSelectedImage(image.path);
        }
        Toast.show({
          type: 'success',
          text1: 'Image Selected',
          text2: 'Image has been cropped and added successfully',
        });
      })
      .catch(error => {
        // User cancelled cropping
        if (error.code === 'E_PICKER_CANCELLED') {
          return;
        }
        
        // Handle specific image picker errors
        let errorTitle = 'Gallery Error';
        let errorMessage = 'Failed to pick image from gallery.';

        if (error.code === 'E_PERMISSION_MISSING') {
          errorTitle = 'Permission Required';
          errorMessage = 'Gallery permission is required. Please enable it in your device settings.';
        } else if (error.code === 'E_PICKER_NO_CAMERA_PERMISSION') {
          errorTitle = 'Permission Required';
          errorMessage = 'Camera permission is required. Please enable it in your device settings.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        Toast.show({
          type: 'error',
          text1: errorTitle,
          text2: errorMessage,
        });
      });
  };

  // -------------------------
  // TAKE PHOTO WITH CROPPING
  // -------------------------
  const handleTakePhoto = async () => {
    try {
      if (images.length >= MAX_IMAGES) {
        Toast.show({
          type: 'info',
          text1: 'Maximum Images Reached',
          text2: 'You can only upload 2 photos (front and back). Please remove an existing image first.',
        });
        return;
      }

      const permission = await requestCameraPermission();
      if (!permission) {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Camera permission is required to take photos. Please enable it in your device settings.',
        });
        return;
      }

      ImagePicker.openCamera({
        width: 800,
        height: 600,
        cropping: true,
        cropperToolbarTitle: 'Crop Image',
        cropperChooseText: 'Use This Photo',
        cropperCancelText: 'Retake',
        compressImageQuality: 0.8,
        includeBase64: false,
      })
        .then(image => {
          const imageData = {
            uri: image.path,
            type: 'camera',
            fileName: image.filename || `camera_${Date.now()}.jpg`,
            mimeType: image.mime || 'image/jpeg',
          };
          setImages(prev => [...prev, imageData]);
          if (!selectedImage) {
            setSelectedImage(image.path);
          }
          Toast.show({
            type: 'success',
            text1: 'Photo Captured',
            text2: 'Photo has been cropped and added successfully',
          });
        })
        .catch(error => {
          // User cancelled
          if (error.code === 'E_PICKER_CANCELLED') {
            return;
          }

          // Handle specific camera errors
          let errorTitle = 'Camera Error';
          let errorMessage = 'Failed to open camera.';

          if (error.code === 'E_PERMISSION_MISSING') {
            errorTitle = 'Permission Denied';
            errorMessage = 'Camera permission is required. Please enable it in your device settings.';
          } else if (error.code === 'E_PICKER_CANNOT_RUN_CAMERA_ON_SIMULATOR') {
            errorTitle = 'Camera Not Available';
            errorMessage = 'Camera is not available on simulator. Please use a real device.';
          } else if (error.message) {
            errorMessage = error.message;
          }

          Toast.show({
            type: 'error',
            text1: errorTitle,
            text2: errorMessage,
          });
        });
    } catch (error: any) {
      console.error('Error opening camera:', error);
      const { title, message } = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: title,
        text2: message,
      });
    }
  };

  // -------------------------
  // REMOVE IMAGE
  // -------------------------
  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
    // Update selectedImage if the removed image was selected
    if (selectedImage === images[index]?.uri) {
      setSelectedImage(updated.length > 0 ? updated[0]?.uri || null : null);
    }
  };

  // -------------------------
  // CROP EXISTING IMAGE
  // -------------------------
  const handleCropImage = (index: number) => {
    const imageToCrop = images[index];
    if (!imageToCrop?.uri) return;

    ImagePicker.openCropper({
      path: imageToCrop.uri,
      width: 800,
      height: 600,
      cropping: true,
      mediaType: 'photo',
      cropperToolbarTitle: 'Crop Image',
      cropperChooseText: 'Save',
      cropperCancelText: 'Cancel',
      compressImageQuality: 0.8,
    })
      .then(image => {
        const updated = [...images];
        updated[index] = {
          uri: image.path,
          type: imageToCrop.type,
          fileName: image.filename || imageToCrop.fileName || `image_${Date.now()}.jpg`,
          mimeType: image.mime || imageToCrop.mimeType || 'image/jpeg',
        };
        setImages(updated);
        
        if (selectedImage === imageToCrop.uri) {
          setSelectedImage(image.path);
        }
        
        Toast.show({
          type: 'success',
          text1: 'Image Cropped',
          text2: 'Image has been cropped successfully',
        });
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          return;
        }
        
        Toast.show({
          type: 'error',
          text1: 'Cropping Failed',
          text2: error.message || 'Failed to crop image. Please try again.',
        });
      });
  };

  // -------------------------
  // CREATE FORMDATA FOR UPLOAD
  // -------------------------
  const createFormData = () => {
    const formData = new FormData();

    // Backend requires front_image and back_image with specific field names
    if (images.length >= 1) {
      const frontImage = images[0];
      const fileExtension = frontImage.uri.split('.').pop() || 'jpg';
      const fileName = frontImage.fileName || `front_image_${Date.now()}.${fileExtension}`;
      
      formData.append('front_image', {
        uri: Platform.OS === 'ios' ? frontImage.uri.replace('file://', '') : frontImage.uri,
        name: fileName,
        type: frontImage.mimeType || 'image/jpeg',
      } as any);
    }

    if (images.length >= 2) {
      const backImage = images[1];
      const fileExtension = backImage.uri.split('.').pop() || 'jpg';
      const fileName = backImage.fileName || `back_image_${Date.now()}.${fileExtension}`;
      
      formData.append('back_image', {
        uri: Platform.OS === 'ios' ? backImage.uri.replace('file://', '') : backImage.uri,
        name: fileName,
        type: backImage.mimeType || 'image/jpeg',
      } as any);
    }

    // Append attribute information if available
    if (attributeId) {
      formData.append('attribute_id', attributeId.toString());
    }
    if (attributeName) {
      formData.append('attribute_name', attributeName);
    }

    return formData;
  };

  // -------------------------
  // UPLOAD DOCUMENT
  // -------------------------
  const handleUpload = async () => {
    if (images.length < 2) {
      Toast.show({
        type: 'info',
        text1: 'Images Required',
        text2: 'Please upload both front and back images of your ID card to continue.',
      });
      return;
    }

    setUploading(true);
    const formData = createFormData();

    try {
      await verificationUploadMutation.mutateAsync(
        { payload: formData },
        {
          onSuccess: (res: any) => {
            console.log('Upload response:', res);
            setUploading(false);
            
            // Check if the response indicates rejection
            const responseData = res?.data || res?.response?.data || res;
            
            if (responseData?.status === 'rejected' || responseData?.rejection_reason) {
              // Document was rejected
              const reason = responseData?.rejection_reason || 
                            responseData?.message || 
                            'Document verification failed. Please ensure the image is clear and all text is readable.';
              
              setRejected(true);
              setRejectionReason(reason);
              setUploaded(false);
              
              // Show toast with rejection reason
              Toast.show({
                type: 'error',
                text1: 'Verification Rejected',
                text2: reason,
                visibilityTime: 6000,
              });
            } else {
              // Document was accepted
              setUploaded(true);
              setRejected(false);
              setRejectionReason('');
              
              Toast.show({
                type: 'success',
                text1: 'Upload Successful',
                text2: 'Your document has been uploaded successfully. Verification will be processed within 24-48 hours.',
                visibilityTime: 4000,
              });
            }
          },
          onError: (err: any) => {
            console.error('Upload error:', err);
            setUploading(false);
            
            // Check if error response contains rejection information
            const errorData = err?.response?.data || err?.data || {};
            
            if (errorData?.status === 'rejected' || errorData?.rejection_reason) {
              // Document was rejected
              const reason = errorData?.rejection_reason || 
                            errorData?.message || 
                            'Document verification failed. Please ensure the image is clear and all text is readable.';
              
              setRejected(true);
              setRejectionReason(reason);
              setUploaded(false);
              
              // Show toast with rejection reason
              Toast.show({
                type: 'error',
                text1: 'Verification Rejected',
                text2: reason,
                visibilityTime: 6000,
              });
            } else {
              // Regular error - use getErrorMessage for user-friendly messages
              const { title, message } = getErrorMessage(err);
              Toast.show({
                type: 'error',
                text1: title,
                text2: message,
                visibilityTime: 5000,
              });
            }
          },
        },
      );
    } catch (error: any) {
      console.error('Upload exception:', error);
      setUploading(false);
      const { title, message } = getErrorMessage(error);
      Toast.show({
        type: 'error',
        text1: title,
        text2: message,
        visibilityTime: 5000,
      });
    }
  };

  return (
    <Screen>
      <Header
        title={`Verify ${attributeName || 'Attribute'}`}
        onBack={handleBack}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Icon name="document-text" size={64} color="#D4AF37" />
          <Text style={styles.title}>Upload ID Card</Text>
          <Text style={styles.subtitle}>
            Upload or take a photo of your ID card to verify your{' '}
            {attributeName || 'attribute'}
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

        {/* PREVIEW SECTION */}
        {images.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>
              Selected Images ({images.length}/2)
            </Text>
            {images.length < 2 && (
              <Text style={styles.warningText}>
                ⚠️ Please upload both front and back images
              </Text>
            )}

            <View style={styles.previewGrid}>
              {images.map((img, index) => (
                <View key={index} style={styles.imageBox}>
                  <Image source={{ uri: img.uri }} style={styles.image} />

                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Icon name="close" color="#fff" size={18} />
                  </Pressable>

                  <Pressable
                    style={styles.cropBtn}
                    onPress={() => handleCropImage(index)}
                  >
                    <Icon name="crop" color="#fff" size={18} />
                  </Pressable>

                 
                </View>
              ))}
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

        {images.length > 0 && !uploaded && !rejected && (
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.uploadButton, uploading && styles.buttonDisabled]}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Icon name="cloud-upload" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Text>
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

        {rejected && (
          <View style={styles.errorSection}>
            <Icon name="close-circle" size={64} color="#FF0000" />
            <Text style={styles.errorText}>Verification Rejected</Text>
            <Text style={styles.errorSubtext}>
              Your document could not be verified. Please review the reasons below and try again.
            </Text>
            <View style={styles.rejectionReasonContainer}>
              <Text style={styles.rejectionReasonTitle}>Rejection Reasons:</Text>
              <Text style={styles.rejectionReasonText}>{rejectionReason}</Text>
            </View>
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                setRejected(false);
                setRejectionReason('');
                setImages([]);
                setSelectedImage(null);
              }}
            >
              <Icon name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Upload Again</Text>
            </Pressable>
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
  warningText: {
    color: '#FFA500',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
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
  previewGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
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
  buttonDisabled: {
    opacity: 0.6,
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
  imageBox: {
    width: '47%',
    height: 160,
    backgroundColor: '#000',
    borderRadius: 12,
    borderColor: '#D4AF37',
    borderWidth: 1,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
    borderRadius: 20,
  },
  cropBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.8)',
    padding: 5,
    borderRadius: 20,
  },

  typeText: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 10,
  },
  errorSection: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: '#FF0000',
    marginTop: 16,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 16,
  },
  rejectionReasonContainer: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  rejectionReasonTitle: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  rejectionReasonText: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.9,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    width: '100%',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import { launchCamera } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/Auth_store';

interface VerificationAttributeProps {
  icon: string;
  title: string;
  status: 'pending' | 'verified' | 'not_started';
  onPress: () => void;
}

function VerificationAttribute({ icon, title, status, onPress }: VerificationAttributeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'verified':
        return '#4CAF50'; // Green for verified
      case 'pending':
        return '#FFA500'; // Orange for pending
      default:
        return '#D4AF37'; // Gold for not started
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      default:
        return 'Not Started';
    }
  };

  const iconColor = getStatusColor();
  const borderColor = getStatusColor();
  const showVerifiedBadge = status === 'verified';

  return (
    <Pressable
      style={[styles.attributeCard, { borderColor: borderColor }]}
      onPress={onPress}
    >
      <View style={styles.attributeContent}>
        <View style={[styles.iconContainer, { borderColor: iconColor }]}>
          <Icon name={icon} size={32} color={iconColor} />
          {showVerifiedBadge && (
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
          )}
        </View>
        <View style={styles.attributeInfo}>
          <Text style={styles.attributeTitle}>{title}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: iconColor }]} />
            <Text style={[styles.statusText, { color: iconColor }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function ProfileVerificationScreen({ navigation }: any) {
  const user = useAuthStore(state => state.user);
  const profileCompletion = user?.profile_completion;
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  // Map attributes with their corresponding section completion percentages
  const attributes = useMemo(() => {
    // Calculate verification status based on profile completion
    const getVerificationStatus = (
      sectionPercentage: number | undefined,
      isPhoto: boolean = false,
    ): 'pending' | 'verified' | 'not_started' => {
      if (isPhoto) {
        // Photo is only verified when overall completion is 100%
        const overallCompletion = profileCompletion?.completion_percentage || 0;
      console.log('overallCompletion', overallCompletion);

        if (overallCompletion === 100) {
          return 'verified';
        }
        // If media section has some completion, show as pending
        const mediaCompletion = profileCompletion?.sections?.media || 0;
        if (mediaCompletion > 0 && mediaCompletion < 100) {
          return 'pending';
        }
        return 'unverified';
      }

      // For other fields, check their section completion
      if (!sectionPercentage) {
        return 'not_started';
      }
      if (sectionPercentage === 100) {
        return 'verified';
      }
      if (sectionPercentage > 0) {
        return 'pending';
      }
      return 'not_started';
    };

    const sections = profileCompletion?.sections || {};
    const candidateInfoCompletion = sections.candidate_information || 0;

    return [
      {
        id: 'name',
        icon: 'person',
        title: 'Name',
        status: getVerificationStatus(candidateInfoCompletion),
      },
      {
        id: 'age',
        icon: 'calendar',
        title: 'Age',
        status: getVerificationStatus(candidateInfoCompletion),
      },
      {
        id: 'photo',
        icon: 'camera',
        title: 'Photo',
        status: getVerificationStatus(sections.media, true),
      },
      {
        id: 'nationality',
        icon: 'flag',
        title: 'Nationality',
        status: getVerificationStatus(candidateInfoCompletion),
      },
      {
        id: 'address',
        icon: 'location',
        title: 'Address',
        status: getVerificationStatus(candidateInfoCompletion),
      },
    ];
  }, [profileCompletion]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true;
  };

  const openCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Camera permission is required to take photos',
        });
        return;
      }

      launchCamera(
        {
          mediaType: 'photo' as const,
          quality: 1 as const,
          cameraType: 'back',
          saveToPhotos: false,
        },
        (response) => {
          if (response.didCancel) {
            console.log('User cancelled camera');
            return;
          }

          if (response.errorCode) {
            console.error('Camera error:', response.errorCode, response.errorMessage);
            Toast.show({
              type: 'error',
              text1: 'Camera Error',
              text2: response.errorMessage || 'Failed to open camera',
            });
            return;
          }

          if (response.errorMessage) {
            console.error('Camera error message:', response.errorMessage);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: response.errorMessage,
            });
            return;
          }

          if (!response.assets || !response.assets[0]) {
            console.log('No image captured');
            return;
          }

          // Navigate to VerificationUploadScreen with captured photo
          navigation.navigate('VerificationUpload', {
            attributeId: 'photo',
            attributeName: 'Photo',
            capturedPhoto: response.assets[0],
          });
        }
      );
    } catch (error: any) {
      console.error('Error opening camera:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to open camera. Please try again.',
      });
    }
  };

  const handleAttributePress = (id: string, title: string) => {
    // If Photo attribute, open camera directly
    if (id === 'photo') {
      openCamera();
    } else {
      // For other attributes, navigate to VerificationUploadScreen
      navigation.navigate('VerificationUpload', {
        attributeId: id,
        attributeName: title,
      });
    }
  };

  return (
    <Screen>
      <Header title="Profile Verification" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Profile Verification</Text>
        <Text style={styles.subtitle}>
          Complete your profile to get verified. All sections must be 100% complete
          for photo verification.
        </Text>
        
        {/* Show overall completion percentage */}
        {profileCompletion && (
          <View style={styles.completionContainer}>
            <Text style={styles.completionText}>
              Profile Completion: {profileCompletion.completion_percentage || 0}%
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${profileCompletion.completion_percentage || 0}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        <View style={styles.attributesContainer}>
          {attributes.map((attr) => (
            <VerificationAttribute
              key={attr.id}
              icon={attr.icon}
              title={attr.title}
              status={attr.status}
              onPress={() => handleAttributePress(attr.id, attr.title)}
            />
          ))}
        </View>

        {/* Show message about photo verification */}
        {profileCompletion?.completion_percentage !== 100 && (
          <Text style={styles.infoText}>
            Your Profile Picture will be verified by Admin once your profile is
            100% complete. Please complete all sections above.
          </Text>
        )}

        {profileCompletion?.completion_percentage === 100 && (
          <Text style={styles.infoText}>
            Your Profile Picture is being verified by Admin. Please wait for 24
            working hours.
          </Text>
        )}

        <Pressable
          style={styles.uploadButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Icon name="arrow-back" size={16} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    // fontWeight: '700',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  pageTitle: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    // opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
  },
  attributesContainer: {
    marginBottom: 24,
    gap: 12,
  },
  attributeCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 0.8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  attributeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000000',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  attributeInfo: {
    flex: 1,
  },
  attributeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  completionContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  completionText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 4,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.8,
    marginTop: 12,
    marginBottom: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});


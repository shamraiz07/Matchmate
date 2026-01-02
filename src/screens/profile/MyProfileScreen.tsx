import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert, Image, Platform, PermissionsAndroid, ActivityIndicator } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import Dropdown from '../../components/Dropdown';
import DatePicker from 'react-native-date-picker';
import { useProfileUpdate, useProfileView, Profile_Picture_Verify } from '../../service/Hooks/User_Profile_Hook';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
interface SectionProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  isEditing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

function Section({
  title,
  children,
  onEdit,
  isEditing = false,
  onSave,
  onCancel,
}: SectionProps) {
  const isPreferences = title === 'Preferences';
  return (
    <View style={[styles.section, isPreferences && styles.preferencesSection]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isPreferences && styles.preferencesTitle]}>
          {title}
        </Text>
        {isEditing ? (
          <View style={styles.editActions}>
            <Pressable
              onPress={onCancel}
              style={[styles.cancelButton, isPreferences && styles.preferencesCancelButton]}>
              <Text
                style={[
                  styles.cancelButtonText,
                  isPreferences && styles.preferencesCancelButtonText,
                ]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              style={[styles.saveButton, isPreferences && styles.preferencesSaveButton]}>
              <Text
                style={[
                  styles.saveButtonText,
                  isPreferences && styles.preferencesSaveButtonText,
                ]}>
                Save
              </Text>
            </Pressable>
          </View>
        ) : (
          onEdit && (
            <Pressable
              onPress={onEdit}
              style={[styles.editButton, isPreferences && styles.preferencesEditButton]}>
              <Text
                style={[
                  styles.editButtonText,
                  isPreferences && styles.preferencesEditButtonText,
                ]}>
                Edit
              </Text>
            </Pressable>
          )
        )}
      </View>
      {children}
    </View>
  );
}

interface InfoItemProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
  textColor?: string;
  editable?: boolean;
  onChangeText?: (text: string) => void;
}

function InfoItem({
  icon,
  label,
  value,
  iconColor = '#D4AF37',
  textColor,
  editable = false,
  onChangeText,
}: InfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <Icon name={icon} size={20} color={iconColor} style={styles.infoIcon} />
      <Text style={[styles.infoLabel, textColor && { color: textColor }]}>
        {label}
      </Text>
      {editable ? (
        <TextInput
          style={[
            styles.editableInput,
            textColor && { color: textColor, borderColor: textColor },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter value"
          placeholderTextColor={textColor ? '#FFFFFF80' : '#808080'}
        />
      ) : (
        <Text style={[styles.infoValue, textColor && { color: textColor }]}>
          {value || 'Not specified'}
        </Text>
      )}
    </View>
  );
}

interface InfoItemDropdownProps {
  icon: string;
  label: string;
  value: string;
  options: string[];
  iconColor?: string;
  textColor?: string;
  editable?: boolean;
  onSelect?: (value: string) => void;
}

function InfoItemDropdown({
  icon,
  label,
  value,
  options,
  iconColor = '#D4AF37',
  textColor,
  editable = false,
  onSelect,
}: InfoItemDropdownProps) {
  return (
    <View style={styles.infoItem}>
      <Icon name={icon} size={20} color={iconColor} style={styles.infoIcon} />
      <Text style={[styles.infoLabel, textColor && { color: textColor }]}>
        {label}
      </Text>
      {editable ? (
        <View style={styles.dropdownContainer}>
          <Dropdown
            label=""
            value={value}
            options={options}
            onSelect={onSelect || (() => {})}
            containerStyle={styles.dropdownStyle}
          />
        </View>
      ) : (
        <Text style={[styles.infoValue, textColor && { color: textColor }]}>
          {value || 'Not specified'}
        </Text>
      )}
    </View>
  );
}

export default function MyProfileScreen({ navigation }: any) {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  // Dropdown options (same as ProfileSetupScreen)
  const genderOptions = ['male', 'female'];
  const maritalStatusOptions = ['Single', 'Divorced', 'Married', 'Separated', 'Widower'];
  const cityOptions = [
    'Abbottabad',
    'Bahawalpur',
    'Chaman',
    'Dera Ghazi Khan',
    'Dera Ismail Khan',
    'Faisalabad',
    'Gilgit',
    'Gujranwala',
    'Gujrat',
    'Gwadar',
    'Haripur',
    'Hunza',
    'Hyderabad',
    'Islamabad',
    'Jacobabad',
    'Jhang',
    'Karachi',
    'Kasur',
    'Khuzdar',
    'Kohat',
    'Kotli',
    'Lahore',
    'Larkana',
    'Mansehra',
    'Mardan',
    'Mastung',
    'Mirpur (AJK)',
    'Mirpur Khas',
    'Multan',
    'Muzaffarabad',
    'Nawabshah',
    'Nowshera',
    'Okara',
    'Other',
    'Peshawar',
    'Quetta',
    'Rahim Yar Khan',
    'Rawalpindi',
    'Sahiwal',
    'Sargodha',
    'Sheikhupura',
    'Skardu',
    'Sialkot',
    'Sukkur',
    'Swabi',
    'Thatta',
    'Turbat',
    'Zhob',
  ];
  
  const religionOptions = ['Muslim', 'Christian', 'Hindu', 'Sikh', 'Other'];
  const sectOptions = ['Sunni', 'Shia', 'Ahle Hadith', 'Deobandi', 'Barelvi'];
  const casteOptions = [
    'Abbasi',
    'Achakzai',
    'Afridi',
    'Ansari',
    'Arain',
    'Awan',
    'Bajwa',
    'Bangash',
    'Barakzai',
    'Bhatti',
    'Bhutto',
    'Bhat',
    'Brohi',
    'Bugti',
    'Butt',
    'Chandio',
    'Chaudhry',
    'Cheema',
    'Dar',
    'Farooqi',
    'Gill',
    'Gondal',
    'Gorchani',
    'Gujjar',
    'Jamali',
    'Janjua',
    'Jatt',
    'Junejo',
    'Kakar',
    'Kalhoro',
    'Kharal',
    'Khattak',
    'Khosa',
    'Khoso',
    'Lashari',
    'Leghari',
    'Lone',
    'Mahar',
    'Malik',
    'Mangrio',
    'Marri',
    'Mazari',
    'Mehsud',
    'Mengal',
    'Minhas',
    'Mir',
    'Mirani',
    'Mohmand',
    'Niazi',
    'Orakzai',
    'Other',
    'Panhwar',
    'Popalzai',
    'Qaisrani',
    'Qureshi',
    'Rajput',
    'Raisani',
    'Rind',
    'Samma',
    'Sandhu',
    'Shah',
    'Sheikh',
    'Shinwari',
    'Siddiqui',
    'Solangi',
    'Soomro',
    'Syed',
    'Talpur',
    'Turi',
    'Virk',
    'Wani',
    'Warraich',
    'Wazir',
    'Yousafzai',
  ];
  
  const heightOptions = [
    '121.92',
    '137.16',
    '152.40',
    '157.48',
    '162.56',
    '167.64',
    '172.72',
    '177.80',
    '182.88',
    '198.12',
  ];
  const educationOptions = [
    'Primary',
    'Secondary',
    'Higher Secondary',
    'Bachelor',
    'Master',
    'PhD',
    'Diploma',
  ];
  const employmentOptions = ['Business', 'Employed', 'Home-maker', 'Retired', 'Self-employed', 'Unemployed'];
  const professionOptions = [
    'Engineer',
    'Doctor',
    'Teacher',
    'Business',
    'IT Professional',
    'Accountant',
    'Lawyer',
    'Other',
  ];
  const parentEmploymentOptions = ['Employed', 'Unemployed', 'Retired'];
  const deceasedOptions = ['yes', 'no'];
  const [profileData, setProfileData] = useState<any>({});
  const [selectedImage, setSelectedImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const profileUpdateMutation = useProfileUpdate();
  const profilePictureMutation = Profile_Picture_Verify();
  // Fetch profile data from API
  const { data: profileResponse } = useProfileView();
  const queryClient = useQueryClient();
  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return '';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Helper function to capitalize first letter
  const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Map API response to local state structure
// Only run the effect when the actual data changes, not the response object
useEffect(() => {
  if (!profileResponse?.data) return;

  const apiData = profileResponse.data;
  const candidateInfo = apiData.candidate_information || {};
  const profileDetails = apiData.profile_details || {};
  const familyDetails = apiData.family_details || {};
  const siblingsDetails = apiData.siblings_details || {};
  const educationEmployment = apiData.education_employment || {};
  const media = apiData.media || {};
  const meta = apiData.meta || {};

  const formatted = {
    hidden_name: candidateInfo.hidden_name || '',
    date_of_birth: candidateInfo.date_of_birth || '',
    phone_country_code: candidateInfo.phone_country_code || '',
    phone_number: candidateInfo.phone_number || '',
    contact: candidateInfo.phone_number || '',
    matrimonyId: meta.profile_id?.toString() || '',
    name: candidateInfo.candidate_name || '',
    gender: capitalize(profileDetails.gender || ''),
    maritalStatus: capitalize(profileDetails.marital_status || ''),
    age: calculateAge(candidateInfo.date_of_birth || ''),
    religion: candidateInfo.religion || '',
    sect: candidateInfo.sect || '',
    caste: candidateInfo.caste || '',
    weight: candidateInfo.weight_kg ? `${candidateInfo.weight_kg}kg` : '',
    height: candidateInfo.height_cm ? `${candidateInfo.height_cm}cm` : '',
    disability: 'No',
    description: apiData?.ai_generated_description?.description || '',
    country: candidateInfo.country || '',
    city: candidateInfo.city || '',
    employmentStatus: educationEmployment.employment_status || '',
    profession: educationEmployment.profession || '',
    educationLevel: educationEmployment.education_level || '',
    brothers: siblingsDetails.total_brothers?.toString() || '0',
    sisters: siblingsDetails.total_sisters?.toString() || '0',
    blur_photo: media.blur_photo || false,
    profilePicture: media.profile_picture || null,
    fatherDeceased: familyDetails.father_status || '',
    motherDeceased: familyDetails.mother_status || '',
    fatherEmployment: familyDetails.father_employment_status || '',
    motherEmployment: familyDetails.mother_employment_status || '',
    instituate_name: educationEmployment.institute_name || '',
    degree_title: educationEmployment.degree_title || '',
    duration: educationEmployment.duration || '',
    birth_country: candidateInfo.birth_country || '',
  };
  console.log("formatted------------------>>", formatted);
  setProfileData(formatted);
}, [profileResponse?.data]); // Changed from profileResponse to profileResponse?.data
    

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleEdit = (section: string) => {
    setEditingSection(section);
    // Initialize edit data with current values
    setEditData({ ...profileData });
  };

  const handleSave = (_section: string) => {
   
    console.log("editData------------------>>", editData);
    
    // Extract numeric values from height and weight (remove "cm" and "kg")
    const heightValue = editData.height 
      ? parseFloat(String(editData.height).replace(/cm/gi, '').trim()) || null
      : null;
    const weightValue = editData.weight 
      ? parseFloat(String(editData.weight).replace(/kg/gi, '').trim()) || null
      : null;
    
    // Build the payload in your required format
    const payload = {
      candidate_information: {
        candidate_name: editData.name,
        hidden_name: editData.hidden_name || 'false',
        date_of_birth: editData.date_of_birth,
        country: editData.country,
        city: editData.city,
        religion: editData.religion,
        sect: editData.sect,
        caste: editData.caste,
        height_cm: heightValue,
        weight_kg: weightValue,
        phone_country_code: editData.phone_country_code,
        phone_number: editData.phone_number,
        birth_country: editData.birth_country,
      },
      generated_description: editData.description,
      profile_details: {
        profile_for: editData.profile_for,
        gender: editData.gender.toLowerCase(),
        marital_status: editData.maritalStatus,
      },
  
      family_details: {
        father_status: (editData.fatherDeceased === "yes" || editData.fatherDeceased === "deceased") ? "deceased" : "alive",
        father_employment_status: editData.fatherEmployment,
        mother_status: (editData.motherDeceased === "yes" || editData.motherDeceased === "deceased") ? "deceased" : "alive",
        mother_employment_status: editData.motherEmployment,
      },
  
      siblings_details: {
        total_brothers: Number(editData.brothers || 0),
        total_sisters: Number(editData.sisters || 0),
      },
  
      education_employment: {
        education_level: editData.educationLevel,
        employment_status: editData.employmentStatus,
        profession: editData.profession,
        instituate_name: editData.institute_name,
        degree_title: editData.degree_title,
        duration: editData.duration,
      },
  
      media: {
        blur_photo: editData.blur_photo,
      },
    };
    console.log("Payloadd", payload);
  
    profileUpdateMutation.mutateAsync(
      { payload },
      {
        onSuccess: (res) => {
          console.log("Profile updated successfully", res);
          Toast.show({
            type: "success",
            text1: "Profile updated successfully",
          });
          queryClient.invalidateQueries({ queryKey: ["profile-view"] });
        },
        onError: (err: any) => {
          console.log("error updating profile", err.response);
        },
      }
    );
  
    setEditingSection(null);
  };
  

  const handleCancel = () => {
    setEditingSection(null);
    setEditData({});
  };

  const updateField = (path: string, value: any) => {
    const keys = path.split(".");
    setEditData((prev: any) => {
      let obj = { ...prev };
      let ref = obj;
  
      keys.slice(0, -1).forEach((key) => {
        ref[key] = ref[key] || {};
        ref = ref[key];
      });
  
      ref[keys[keys.length - 1]] = value;
      return obj;
    });
  };
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
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
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const pickImageFromGallery = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 1 as const,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel || response.errorCode) return;

      if (!response.assets || !response.assets[0]) return;

      const image = response.assets[0];

      // Clear error when user selects a new image
      if (errors.selectedImage) {
        setErrors((prev: Record<string, string>) => {
          const newErrors = { ...prev };
          delete newErrors.selectedImage;
          return newErrors;
        });
      }

      // Auto upload (don't set selectedImage here, let onSuccess handle it)
      await uploadProfilePicture(image);
    });
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required.');
      return;
    }

    launchCamera({ mediaType: 'photo' as const, quality: 1 as const }, async (response) => {
      if (response.didCancel || response.errorCode) return;

      if (!response.assets || !response.assets[0]) return;

      const image = response.assets[0];

      // Clear error when user selects a new image
      if (errors.selectedImage) {
        setErrors((prev: Record<string, string>) => {
          const newErrors = { ...prev };
          delete newErrors.selectedImage;
          return newErrors;
        });
      }

      // Auto upload (don't set selectedImage here, let onSuccess handle it)
      await uploadProfilePicture(image);
    });
  };

  // Helper function to get user-friendly error messages
  const getImageUploadErrorMessage = (error: any): { title: string; message: string } => {
    const statusCode = error?.response?.status;
    const errorData = error?.response?.data || error?.data || {};

    // Handle specific HTTP status codes
    if (statusCode === 400) {
      const message = errorData?.message || errorData?.error || errorData?.detail;
      if (message) {
        // Check if message is HTML (like nginx error pages)
        if (typeof message === 'string' && message.includes('<html>')) {
          return {
            title: 'Invalid Image Format',
            message: 'The image format is invalid or corrupted. Please choose a valid image file (JPG, PNG, or JPEG).',
          };
        }
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
        message: 'You do not have permission to upload profile pictures. Please contact support.',
      };
    }

    if (statusCode === 413) {
      return {
        title: 'File Too Large',
        message: 'The image file is too large. Please compress the image or choose a smaller file (recommended size: under 5MB).',
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

    // Handle HTML error responses (like nginx error pages)
    if (error?.response?.data) {
      const dataStr = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data);
      
      if (dataStr.includes('413') || dataStr.includes('Request Entity Too Large')) {
        return {
          title: 'File Too Large',
          message: 'The image file is too large. Please compress the image or choose a smaller file (recommended size: under 5MB).',
        };
      }
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
      if (error.message.includes('413') || error.message.includes('Request Entity Too Large')) {
        return {
          title: 'File Too Large',
          message: 'The image file is too large. Please compress the image or choose a smaller file.',
        };
      }
    }

    // Handle backend error messages
    if (errorData?.reason) {
      return {
        title: 'Upload Failed',
        message: errorData.reason,
      };
    }

    if (errorData?.message) {
      // Check if message is HTML
      const messageStr = Array.isArray(errorData.message) ? errorData.message[0] : errorData.message;
      if (typeof messageStr === 'string' && messageStr.includes('<html>')) {
        return {
          title: 'Upload Failed',
          message: 'Failed to upload image. Please ensure the file is not too large and try again.',
        };
      }
      return {
        title: 'Upload Failed',
        message: messageStr,
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
      message: 'Failed to upload photo. Please check your internet connection and try again.',
    };
  };

  const uploadProfilePicture = async (image: any) => {
    try {
      setUploading(true);
      
      // Clear any previous errors
      if (errors.selectedImage) {
        setErrors((prev: Record<string, string>) => {
          const newErrors = { ...prev };
          delete newErrors.selectedImage;
          return newErrors;
        });
      }
  
      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
        name: image.fileName || "photo.jpg",
        type: image.type || "image/jpeg",
      } as any);
  
      console.log("payload_picture", formData);
  
      await profilePictureMutation.mutateAsync(
        { payload: formData },
        {
          onSuccess: () => {
            setUploading(false);
            setSelectedImage(image.uri);
            
            // Invalidate profile query to refresh data
            queryClient.invalidateQueries({ queryKey: ['profile-view'] });
            
            Toast.show({
              type: 'success',
              text1: 'Upload Successful',
              text2: 'Profile picture uploaded successfully',
            });
          },
          onError: (error: any) => {
            console.log("Upload error:", error);
            setUploading(false);
            
            // Clear selected image on error
            setSelectedImage('');
            
            // Get user-friendly error message
            const { title, message } = getImageUploadErrorMessage(error);
            
            // Set error in state to display in UI
            setErrors((prev: Record<string, string>) => ({
              ...prev,
              selectedImage: message,
            }));
            
            // Show toast with error message
            Toast.show({
              type: 'error',
              text1: title,
              text2: message,
              visibilityTime: 5000,
            });
          },
        }
      );
  
    } catch (error: any) {
      console.log("Upload exception:", error);
      setUploading(false);
      
      // Clear selected image on error
      setSelectedImage('');
      
      // Get user-friendly error message
      const { title, message } = getImageUploadErrorMessage(error);
      
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        selectedImage: message,
      }));
      
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
      <Header title="My Profile" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Section
          title="Photos"
          onEdit={() => handleEdit('Photos')}
          isEditing={editingSection === 'Photos'}
          onSave={() => handleSave('Photos')}
          onCancel={handleCancel}>
          <View style={styles.profilePhotoContainer}>
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color="#D4AF37" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            ) : selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : profileData.profilePicture ? (
              <Image
                source={{ uri: profileData.profilePicture }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Icon name="person" size={64} color="#D4AF37" />
            )}
            
            {editingSection === 'Photos' && (
              <View style={styles.photoButtons}>
                <Pressable 
                  style={styles.photoButton} 
                  onPress={pickImageFromGallery}
                  disabled={uploading}
                >
                  <Icon name="images" size={20} color="#000000" />
                  <Text style={styles.photoButtonText}>Gallery</Text>
                </Pressable>
                <Pressable 
                  style={styles.photoButton} 
                  onPress={takePhoto}
                  disabled={uploading}
                >
                  <Icon name="camera" size={20} color="#000000" />
                  <Text style={styles.photoButtonText}>Camera</Text>
                </Pressable>
              </View>
            )}
            
            {errors.selectedImage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.selectedImage}</Text>
              </View>
            )}
            
            {!editingSection && (
              <Pressable style={styles.profileButton}>
                <Text style={styles.profileButtonText}>Profile</Text>
              </Pressable>
            )}
          </View>
        </Section>

        <Section
          title="Contact information"
          onEdit={() => handleEdit('Contact')}
          isEditing={editingSection === 'Contact'}
          onSave={() => handleSave('Contact')}
          onCancel={handleCancel}>
          <InfoItem
            icon="call"
            label="Contact"
            value={editingSection === 'Contact' ? editData.contact : profileData.contact}
            editable={editingSection === 'Contact'}
            onChangeText={(text) => updateField('contact', text)}
          />
        </Section>

        <Section
          title="About you"
          onEdit={() => handleEdit('About')}
          isEditing={editingSection === 'About'}
          onSave={() => handleSave('About')}
          onCancel={handleCancel}>
          <InfoItem
            icon="card"
            label="Matrimony ID"
            value={profileData.matrimonyId}
            editable={false}
          />
          <InfoItem
            icon="card"
            label="Name"
            value={editingSection === 'About' ? editData.name : profileData.name}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('name', text)}
          />
          <InfoItemDropdown
            icon="people"
            label="Gender"
            value={editingSection === 'About' ? editData.gender?.toLowerCase() || '' : profileData.gender?.toLowerCase() || ''}
            options={genderOptions}
            editable={editingSection === 'About'}
            onSelect={(value) => updateField('gender', value)}
          />
          <InfoItemDropdown
            icon="heart"
            label="Marital status"
            value={
              editingSection === 'About' ? editData.maritalStatus || '' : profileData.maritalStatus || ''
            }
            options={maritalStatusOptions}
            editable={editingSection === 'About'}
            onSelect={(value) => updateField('maritalStatus', value)}
          />
          {/* DOB - Date of Birth */}
          <Pressable
            disabled={editingSection !== 'About'}
            onPress={() => {
              if (editingSection === 'About') {
                // Parse existing date or use current date
                const existingDate = editData.date_of_birth 
                  ? new Date(editData.date_of_birth) 
                  : (profileData.date_of_birth ? new Date(profileData.date_of_birth) : new Date());
                setSelectedDate(existingDate);
                setDatePickerOpen(true);
              }
            }}
            style={styles.dobContainer}
          >
            <Icon name="calendar" size={20} color="#D4AF37" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>DOB</Text>
            <View style={styles.dobValueContainer}>
              <Text style={[
                styles.dobValue,
                editingSection !== 'About' && styles.readOnlyDobValue
              ]}>
                {editingSection === 'About' 
                  ? (editData.date_of_birth 
                      ? new Date(editData.date_of_birth).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : profileData.date_of_birth 
                        ? new Date(profileData.date_of_birth).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'Select date')
                  : (profileData.date_of_birth 
                      ? new Date(profileData.date_of_birth).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'Not specified')}
              </Text>
              {editingSection === 'About' && (
                <Icon name="chevron-forward" size={20} color="#D4AF37" />
              )}
            </View>
          </Pressable>
          
          <InfoItem
            icon="calendar"
            label="Age"
            value={editingSection === 'About' ? editData.age : profileData.age}
            editable={false}
          />
          <InfoItemDropdown
            icon="hand-left"
            label="Religion"
            value={editingSection === 'About' ? editData.religion || '' : profileData.religion || ''}
            options={religionOptions}
            editable={editingSection === 'About'}
            onSelect={(value) => updateField('religion', value)}
          />
          <InfoItemDropdown
            icon="person"
            label="Sect"
            value={editingSection === 'About' ? editData.sect || '' : profileData.sect || ''}
            options={sectOptions}
            editable={editingSection === 'About'}
            onSelect={(value) => updateField('sect', value)}
          />
          <InfoItemDropdown
            icon="triangle"
            label="Caste"
            value={editingSection === 'About' ? editData.caste || '' : profileData.caste || ''}
            options={casteOptions}
            editable={editingSection === 'About'}
            onSelect={(value) => updateField('caste', value)}
          />
          <InfoItem
            icon="scale"
            label="Weight"
            value={editingSection === 'About' ? editData.weight : profileData.weight}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('weight', text)}
          />
          <InfoItemDropdown
            icon="resize"
            label="Height"
            value={
              editingSection === 'About'
                ? editData.height?.replace(/cm/gi, '').trim() || ''
                : profileData.height?.replace(/cm/gi, '').trim() || ''
            }
            options={heightOptions}
            editable={editingSection === 'About'}
            onSelect={(value) => updateField('height', `${value}cm`)}
          />
          <InfoItem
            icon="accessibility"
            label="Disability"
            value={editingSection === 'About' ? editData.disability : profileData.disability}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('disability', text)}
          />
        </Section>

        <Section
          title="More about you"
          onEdit={() => handleEdit('Description')}
          isEditing={editingSection === 'Description'}
          onSave={() => handleSave('Description')}
          onCancel={handleCancel}>
          {editingSection === 'Description' ? (
            <TextInput
              style={styles.descriptionInput}
              value={editData.description || profileData.description}
              onChangeText={(text) => updateField('description', text)}
              multiline
              numberOfLines={6}
              placeholder="Tell us more about yourself"
              placeholderTextColor="#808080"
            />
          ) : (
            <Text style={styles.description}>{profileData.description}</Text>
          )}
        </Section>

        <Section
          title="Region & location"
          onEdit={() => handleEdit('Region')}
          isEditing={editingSection === 'Region'}
          onSave={() => handleSave('Region')}
          onCancel={handleCancel}>
          <InfoItem
            icon="globe"
            label="Country"
            value={profileData.country || ''}
            editable={false}
          />
          <InfoItemDropdown
            icon="location"
            label="City"
            value={editingSection === 'Region' ? editData.city || '' : profileData.city || ''}
            options={cityOptions}
            editable={editingSection === 'Region'}
            onSelect={(value) => updateField('city', value)}
          />
          <InfoItem
            icon="location"
            label="Birth Country"
            value={editingSection === 'Region' ? editData.birth_country || '' : profileData.birth_country || ''}
            editable={editingSection === 'Region'}
            onChangeText={(text) => updateField('birth_country', text)}
          />
        </Section>

        <Section title="Nationality">
          <InfoItem
            icon="flag"
            label="Nationality"
            value={profileData.nationality || 'Pakistani'}
            editable={false}
          />
        </Section>

        <Section
          title="Education"
          onEdit={() => handleEdit('Education')}
          isEditing={editingSection === 'Education'}
          onSave={() => handleSave('Education')}
          onCancel={handleCancel}>
          <InfoItemDropdown
            icon="school"
            label="Education Level"
            value={
              editingSection === 'Education' ? editData.educationLevel || '' : profileData.educationLevel || ''
            }
            options={educationOptions}
            editable={editingSection === 'Education'}
            onSelect={(value) => updateField('educationLevel', value)}
          />
          <Text style={styles.subsectionTitle}>Bachelors</Text>
          <InfoItem
            icon="business"
            label="Institute"
            value={editingSection === 'Education' ? editData.instituate_name : profileData.instituate_name}
            editable={editingSection === 'Education'}
            onChangeText={(text) => updateField('institute', text)}
          />
          <InfoItem
            icon="school"
            label="Degree Title"
            value={
              editingSection === 'Education' ? editData.degree_title : profileData.degree_title
            }
            editable={editingSection === 'Education'}
            onChangeText={(text) => updateField('degreeTitle', text)}
          />
          <InfoItem
            icon="calendar"
            label="Duration"
            value={editingSection === 'Education' ? editData.duration : profileData.duration}
            editable={editingSection === 'Education'}
            onChangeText={(text) => updateField('duration', text)}
          />
        </Section>

        <Section
          title="Employment"
          onEdit={() => handleEdit('Employment')}
          isEditing={editingSection === 'Employment'}
          onSave={() => handleSave('Employment')}
          onCancel={handleCancel}>
          <InfoItemDropdown
            icon="briefcase"
            label="Employment status"
            value={
              editingSection === 'Employment'
                ? editData.employmentStatus || ''
                : profileData.employmentStatus || ''
            }
            options={employmentOptions}
            editable={editingSection === 'Employment'}
            onSelect={(value) => updateField('employmentStatus', value)}
          />
          <InfoItemDropdown
            icon="person"
            label="Profession"
            value={
              editingSection === 'Employment'
                ? editData.profession || ''
                : profileData.profession || ''
            }
            options={professionOptions}
            editable={editingSection === 'Employment'}
            onSelect={(value) => updateField('profession', value)}
          />
        </Section>

        <Section
          title="Parents"
          onEdit={() => handleEdit('Parents')}
          isEditing={editingSection === 'Parents'}
          onSave={() => handleSave('Parents')}
          onCancel={handleCancel}>
          <Text style={styles.subsectionTitle}>Father</Text>
          {/* <InfoItem
            icon="school"
            label="Education Level"
            value={
              editingSection === 'Parents' ? editData.fatherEducation : profileData.fatherEducation
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('fatherEducation', text)}
          /> */}
          <InfoItemDropdown
            icon="briefcase"
            label="Employment Status"
            value={
              editingSection === 'Parents'
                ? editData.fatherEmployment || ''
                : profileData.fatherEmployment || ''
            }
            options={parentEmploymentOptions}
            editable={editingSection === 'Parents'}
            onSelect={(value) => updateField('fatherEmployment', value)}
          />
          {/* <InfoItem
            icon="person"
            label="Profession"
            value={
              editingSection === 'Parents' ? editData.fatherProfession : profileData.fatherProfession
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('fatherProfession', text)}
          /> */}
          <InfoItemDropdown
            icon="heart"
            label="Deceased"
            value={
              (() => {
                const val = editingSection === 'Parents' ? editData.fatherDeceased : profileData.fatherDeceased;
                return val === 'deceased' || val === 'yes' ? 'yes' : 'no';
              })()
            }
            options={deceasedOptions}
            editable={editingSection === 'Parents'}
            onSelect={(value) => updateField('fatherDeceased', value)}
          />

          <Text style={styles.subsectionTitle}>Mother</Text>
          {/* <InfoItem
            icon="school"
            label="Education Level"
            value={
              editingSection === 'Parents' ? editData.motherEducation : profileData.motherEducation
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('motherEducation', text)}
          /> */}
          <InfoItemDropdown
            icon="briefcase"
            label="Employment Status"
            value={
              editingSection === 'Parents'
                ? editData.motherEmployment || ''
                : profileData.motherEmployment || ''
            }
            options={parentEmploymentOptions}
            editable={editingSection === 'Parents'}
            onSelect={(value) => updateField('motherEmployment', value)}
          />
          {/* <InfoItem
            icon="person"
            label="Profession"
            value={
              editingSection === 'Parents' ? editData.motherProfession : profileData.motherProfession
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('motherProfession', text)}
          /> */}
          <InfoItemDropdown
            icon="heart"
            label="Deceased"
            value={
              (() => {
                const val = editingSection === 'Parents' ? editData.motherDeceased : profileData.motherDeceased;
                return val === 'deceased' || val === 'yes' ? 'yes' : 'no';
              })()
            }
            options={deceasedOptions}
            editable={editingSection === 'Parents'}
            onSelect={(value) => updateField('motherDeceased', value)}
          />
        </Section>

        <Section
          title="Siblings"
          onEdit={() => handleEdit('Siblings')}
          isEditing={editingSection === 'Siblings'}
          onSave={() => handleSave('Siblings')}
          onCancel={handleCancel}>
          {editingSection === 'Siblings' ? (
            <>
              <View style={styles.siblingEditContainer}>
                <Text style={styles.siblingLabel}>Brothers:</Text>
                <TextInput
                  style={styles.siblingInput}
                  value={editData.brothers || profileData.brothers}
                  onChangeText={(text) => updateField('brothers', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#808080"
                />
              </View>
              <View style={styles.siblingEditContainer}>
                <Text style={styles.siblingLabel}>Sisters:</Text>
                <TextInput
                  style={styles.siblingInput}
                  value={editData.sisters || profileData.sisters}
                  onChangeText={(text) => updateField('sisters', text)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#808080"
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.siblingText}>Brothers: {profileData.brothers}</Text>
              <Text style={styles.siblingText}>Sisters: {profileData.sisters}</Text>
            </>
          )}
        </Section>

        {/* <Section
          title="Preferences"
          onEdit={() => handleEdit('Preferences')}
          isEditing={editingSection === 'Preferences'}
          onSave={() => handleSave('Preferences')}
          onCancel={handleCancel}>
          <InfoItem
            icon="time"
            label="Marital status"
            value={
              editingSection === 'Preferences'
                ? editData.prefMaritalStatus
                : profileData.prefMaritalStatus
            }
            iconColor="#FFFFFF"
            textColor="#FFFFFF"
            editable={editingSection === 'Preferences'}
            onChangeText={(text) => updateField('prefMaritalStatus', text)}
          />
          <InfoItem
            icon="calendar"
            label="Age"
            value={editingSection === 'Preferences' ? editData.prefAge : profileData.prefAge}
            iconColor="#FFFFFF"
            textColor="#FFFFFF"
            editable={editingSection === 'Preferences'}
            onChangeText={(text) => updateField('prefAge', text)}
          />
          <InfoItem
            icon="globe"
            label="Country"
            value={
              editingSection === 'Preferences' ? editData.prefCountry : profileData.prefCountry
            }
            iconColor="#FFFFFF"
            textColor="#FFFFFF"
            editable={editingSection === 'Preferences'}
            onChangeText={(text) => updateField('prefCountry', text)}
          />
          <InfoItem
            icon="location"
            label="City"
            value={editingSection === 'Preferences' ? editData.prefCity : profileData.prefCity}
            iconColor="#FFFFFF"
            textColor="#FFFFFF"
            editable={editingSection === 'Preferences'}
            onChangeText={(text) => updateField('prefCity', text)}
          />
          <InfoItem
            icon="hands"
            label="Religion"
            value={
              editingSection === 'Preferences' ? editData.prefReligion : profileData.prefReligion
            }
            iconColor="#FFFFFF"
            textColor="#FFFFFF"
            editable={editingSection === 'Preferences'}
            onChangeText={(text) => updateField('prefReligion', text)}
          />
          <InfoItem
            icon="triangle"
            label="Caste"
            value={editingSection === 'Preferences' ? editData.prefCaste : profileData.prefCaste}
            iconColor="#FFFFFF"
            textColor="#FFFFFF"
            editable={editingSection === 'Preferences'}
            onChangeText={(text) => updateField('prefCaste', text)}
          />
        </Section> */}
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={datePickerOpen}
        date={selectedDate}
        mode="date"
        maximumDate={new Date()}
        minimumDate={new Date(1900, 0, 1)}
        onConfirm={date => {
          setDatePickerOpen(false);
          setSelectedDate(date);
          
          // Format date as YYYY-MM-DD for backend
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}`;
          
          // Update editData with formatted date
          updateField('date_of_birth', formattedDate);
          
          // Recalculate age based on new date
          const today = new Date();
          let age = today.getFullYear() - date.getFullYear();
          const monthDiff = today.getMonth() - date.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            age--;
          }
          updateField('age', age.toString());
        }}
        onCancel={() => {
          setDatePickerOpen(false);
        }}
        theme="dark"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#808080',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  preferencesCancelButton: {
    backgroundColor: '#FFFFFF',
  },
  preferencesCancelButtonText: {
    color: '#000000',
  },
  preferencesSaveButton: {
    backgroundColor: '#4CAF50',
  },
  preferencesSaveButtonText: {
    color: '#FFFFFF',
  },
  editableInput: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 6,
    padding: 8,
    minWidth: 120,
    textAlign: 'right',
  },
  descriptionInput: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  siblingEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  siblingLabel: {
    color: '#000000',
    fontSize: 14,
    marginRight: 12,
    width: 80,
  },
  siblingInput: {
    color: '#000000',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 6,
    padding: 8,
    flex: 1,
    maxWidth: 100,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  profileButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadingContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadingText: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    width: '100%',
    justifyContent: 'center',
  },
  photoButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    maxWidth: 150,
  },
  photoButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF0000',
    width: '100%',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
  },
  infoLabel: {
    color: '#000000',
    fontSize: 14,
    flex: 1,
    opacity: 0.7,
  },
  infoValue: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  dobContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dobValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  dobValue: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  readOnlyDobValue: {
    opacity: 0.7,
  },
  description: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  inputField: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputPlaceholder: {
    color: '#808080',
    fontSize: 14,
  },
  subsectionTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  siblingText: {
    color: '#000000',
    fontSize: 14,
    marginBottom: 8,
  },
  preferencesSection: {
    backgroundColor: '#D4AF37',
    marginTop: 16,
  },
  preferencesTitle: {
    color: '#FFFFFF',
  },
  preferencesEditButton: {
    backgroundColor: '#000000',
  },
  preferencesEditButtonText: {
    color: '#FFFFFF',
  },
  dropdownContainer: {
    flex: 1,
    marginLeft: 8,
  },
  dropdownStyle: {
    marginBottom: 0,
  },
});


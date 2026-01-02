import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  PermissionsAndroid,
  Platform,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Screen from '../../components/Screen';
import Dropdown from '../../components/Dropdown';
import { Profile_Picture_Verify, useProfileCreate } from '../../service/Hooks/User_Profile_Hook';
import {launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

export default function ProfileSetupScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [profileFor, setProfileFor] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  
  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 2: Candidate Information
  const [candidateName, setCandidateName] = useState('');
  const [hiddenName] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [country] = useState('Pakistan'); // Read-only: always Pakistan
  const [city, setCity] = useState('');
  const [religion] = useState('Muslim'); // Read-only: always Muslim
  const [sect, setSect] = useState('');
  const [caste, setCaste] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [phoneCode, setPhoneCode] = useState('+92');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Step 3: Photo (placeholder)
  const [selectedImage, setSelectedImage] = useState('');
  const [blurPhoto, setBlurPhoto] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  // Step 4: Education & Employment
  const [educationLevel, setEducationLevel] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [profession, setProfession] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [degreeTitle, setDegreeTitle] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [duration, setDuration] = useState('');

  // Step 5: Family Details
  const [fatherAlive, setFatherAlive] = useState(true);
  const [fatherEmployment, setFatherEmployment] = useState('');
  const [motherAlive, setMotherAlive] = useState(true);
  const [motherEmployment, setMotherEmployment] = useState('');
  const [brothersCount, setBrothersCount] = useState(0);
  const [sistersCount, setSistersCount] = useState(0);

  const profileForOptions = ['Myself', 'Brother', 'Sister', 'Son', 'Daughter', 'Other'];
  const genderOptions = ['male', 'female'];
  const maritalStatusOptions = ['Single', 'Divorced', 'Married', 'Separated', 'Widower']; 
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
  const employmentStatusOptions = ['Employed', 'Unemployed', 'Retired'];

  // Generate year options from 1950 to current year
  const currentYear = new Date().getFullYear();

  // Exclude current year from list
  const yearOptions = Array.from(
    { length: currentYear - 1950 },
    (_, i) => String(currentYear - 1 - i)
  );
  
  
  // End year options include "Current" option
  const endYearOptions = ['Current', ...yearOptions];

  const steps = [
    { icon: 'person', label: 'Profile For' },
    { icon: 'document-text', label: 'Candidate Info' },
    { icon: 'camera', label: 'Photo' },
    { icon: 'briefcase', label: 'Education' },
    { icon: 'people', label: 'Family' },
  ];
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
            message: "This app needs access to your camera to take photos",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
          buttonPositive: "OK",
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
  
  const profileUpdateMutation = useProfileCreate();
 const  profilePictureMutation = Profile_Picture_Verify();
 const uploadProfilePicture = async (image: any) => {
  try {
    setUploading(true);
    
    // Clear any previous errors
    if (errors.selectedImage) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.selectedImage;
        return newErrors;
      });
    }

    // Validate image before upload
    if (!image || !image.uri) {
      setUploading(false);
      const errorMsg = 'Please select a valid image';
      setErrors(prev => ({
        ...prev,
        selectedImage: errorMsg,
      }));
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: errorMsg,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: image.uri,
      name: image.fileName || "photo.jpg",
      type: image.type || "image/jpeg",
    });

    console.log("payload_picture", formData);

    await profilePictureMutation.mutateAsync(
      { payload: formData },
      {
        onSuccess: () => {
          setUploading(false);
          setSelectedImage(image.uri);
          Toast.show({
            type: 'success',
            text1: 'Photo Uploaded',
            text2: 'Your photo has been uploaded successfully',
          });
        },
        onError: (error: any) => {
          console.log("Error!---------------------->>>>>", error?.response?.data);
          setUploading(false);
          
          // Clear selected image on error
          setSelectedImage('');
          
          // Extract user-friendly error message from backend response
          let errorMessage = 'Failed to upload photo. Please try again.';
          
          // Handle HTTP status codes
          const statusCode = error?.response?.status;
          
          if (statusCode === 413) {
            errorMessage = 'Image file is too large. Please choose a smaller image or compress it before uploading.';
          } else if (statusCode === 400) {
            errorMessage = 'Invalid image format. Please choose a valid image file (JPG, PNG, etc.).';
          } else if (statusCode === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (statusCode === 403) {
            errorMessage = 'You do not have permission to upload photos.';
          } else if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
            errorMessage = 'Server error. Please try again later.';
          } else if (statusCode === 504) {
            errorMessage = 'Upload timed out. Please try again with a smaller image.';
          } else if (error?.response?.data) {
            const errorData = error.response.data;
            
            // Handle different error formats from backend
            if (errorData.reason) {
              errorMessage = errorData.reason;
            } else if (errorData.message) {
              // Handle array or string messages
              errorMessage = Array.isArray(errorData.message) 
                ? errorData.message[0] 
                : errorData.message;
            } else if (errorData.error) {
              errorMessage = Array.isArray(errorData.error) 
                ? errorData.error[0] 
                : errorData.error;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData.file) {
              // Handle file-specific errors
              errorMessage = Array.isArray(errorData.file) 
                ? errorData.file[0] 
                : errorData.file;
            }
          } else if (error?.message) {
            // Handle network or other errors
            if (error.message.includes('Network')) {
              errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message.includes('timeout')) {
              errorMessage = 'Upload timed out. Please try again with a smaller image.';
            } else if (error.message.includes('413')) {
              errorMessage = 'Image file is too large. Please choose a smaller image or compress it before uploading.';
            } else {
              errorMessage = error.message;
            }
          }
          
          // Set error in state to display in UI
          setErrors(prev => ({
            ...prev,
            selectedImage: errorMessage,
          }));
          
          // Show toast with error message
          Toast.show({
            type: 'error',
            text1: 'Upload Failed',
            text2: errorMessage,
          });
        },
      }
    );

  } catch (e: any) {
    setUploading(false);
    console.log("Upload error:", e);
    
    // Clear selected image on error
    setSelectedImage('');
    
    // Handle unexpected errors with user-friendly messages
    let errorMessage = 'Failed to upload photo. Please try again.';
    
    // Handle HTTP status codes
    const statusCode = e?.response?.status;
    
    if (statusCode === 413) {
      errorMessage = 'Image file is too large. Please choose a smaller image or compress it before uploading.';
    } else if (statusCode === 400) {
      errorMessage = 'Invalid image format. Please choose a valid image file (JPG, PNG, etc.).';
    } else if (statusCode === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (statusCode === 403) {
      errorMessage = 'You do not have permission to upload photos.';
    } else if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
      errorMessage = 'Server error. Please try again later.';
    } else if (statusCode === 504) {
      errorMessage = 'Upload timed out. Please try again with a smaller image.';
    } else if (e?.response?.data) {
      const errorData = e.response.data;
      if (errorData.reason) {
        errorMessage = errorData.reason;
      } else if (errorData.message) {
        errorMessage = Array.isArray(errorData.message) 
          ? errorData.message[0] 
          : errorData.message;
      } else if (errorData.error) {
        errorMessage = Array.isArray(errorData.error) 
          ? errorData.error[0] 
          : errorData.error;
      }
    } else if (e?.message) {
      if (e.message.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (e.message.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try again with a smaller image.';
      } else if (e.message.includes('413')) {
        errorMessage = 'Image file is too large. Please choose a smaller image or compress it before uploading.';
      } else {
        errorMessage = e.message;
      }
    }
    
    setErrors(prev => ({
      ...prev,
      selectedImage: errorMessage,
    }));
    
    Toast.show({
      type: 'error',
      text1: 'Upload Failed',
      text2: errorMessage,
    });
  }
};

  // Validation functions for each step
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!profileFor.trim()) {
      newErrors.profileFor = 'Please select profile for';
    }
    if (!gender.trim()) {
      newErrors.gender = 'Please select gender';
    }
    if (!maritalStatus.trim()) {
      newErrors.maritalStatus = 'Please select marital status';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: firstError,
      });
      return false;
    }
    
    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
  
    if (!candidateName.trim()) {
      newErrors.candidateName = 'Candidate name is required';
    }
  
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
  
    // Country and religion are read-only (always Pakistan and Muslim), no validation needed
  
    if (!city) {
      newErrors.city = 'City is required';
    }
    if (!sect) {
      newErrors.sect = 'Sect is required';
    }
    if (!height) {
      newErrors.height = 'Height is required';
    }
  
    if (!phoneCode) {
      newErrors.phoneCode = 'Phone code is required';
    }
  
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (phoneNumber.length < 7) {
      newErrors.phoneNumber = 'Enter a valid phone number';
    }
  
    setErrors(newErrors);
  
    if (Object.keys(newErrors).length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: Object.values(newErrors)[0],
      });
      return false;
    }
  
    return true;
  };
  

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedImage.trim()) {
      newErrors.selectedImage = 'Please upload a photo';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: firstError,
      });
      return false;
    }
    
    return true;
  };

  const validateStep4 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!educationLevel.trim()) {
      newErrors.educationLevel = 'Education level is required';
    }
    if (!instituteName.trim()) {
      newErrors.instituteName = 'Institute name is required';
    }
    if (!degreeTitle.trim()) {
      newErrors.degreeTitle = 'Degree title is required';
    }
    if (!startYear.trim()) {
      newErrors.startYear = 'Start year is required';
    }
    if (!endYear.trim()) {
      newErrors.endYear = 'End year is required';
    } else if (startYear.trim()) {
      // Validate that end year is not before start year
      const start = parseInt(startYear, 10);
      const endValue = endYear === 'Current' ? currentYear : parseInt(endYear, 10);
      
      if (!isNaN(start) && !isNaN(endValue)) {
        if (endValue < start) {
          newErrors.endYear = 'End year cannot be before start year';
        }
      }
    }
    if (!employmentStatus.trim()) {
      newErrors.employmentStatus = 'Employment status is required';
    }
    if (!profession.trim()) {
      newErrors.profession = 'Profession is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: firstError,
      });
      return false;
    }
    
    return true;
  };

  const validateStep5 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!fatherEmployment.trim()) {
      newErrors.fatherEmployment = 'Father employment status is required';
    }
    if (!motherEmployment.trim()) {
      newErrors.motherEmployment = 'Mother employment status is required';
    }
    // Siblings can be 0, so no validation needed
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: firstError,
      });
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    // Validate current step before proceeding
    let isValid = true;
    
    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else if (currentStep === 3) {
      isValid = validateStep3();
    } else if (currentStep === 4) {
      isValid = validateStep4();
    } else if (currentStep === 5) {
      isValid = validateStep5();
    }
    
    if (!isValid) {
      return; // Stop if validation fails
    }
    
    // Clear errors when moving to next step
    setErrors({});
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } 
    else {
      try{
      // Set loading state
      setSubmitting(true);
      
      // Collect all profile data
      const payload = {
        candidate_information: {
          candidate_name: candidateName,
          hidden_name: hiddenName,
          date_of_birth: dateOfBirth,
          country: country,
          city: city,
          religion: religion,
          sect: sect,
          caste: caste,
          height_cm: height,
          weight_kg: weight,
          phone_country_code: phoneCode,
          phone_number: phoneNumber,
        },
      
        profile_details: {
          profile_for: profileFor,
          gender: gender,
          marital_status: maritalStatus,
        },
      
        family_details: {
          father_status: fatherAlive ? "alive" : "deceased",
          father_employment_status: fatherEmployment,
          mother_status: motherAlive ? "alive" : "deceased",
          mother_employment_status: motherEmployment,
        },
      
        siblings_details: {
          total_brothers: brothersCount,
          total_sisters: sistersCount,
        },
      
        education_employment: {
          education_level: educationLevel,
          employment_status: employmentStatus,
          profession: profession,
          institute_name: instituteName,
          degree_title: degreeTitle,
          duration: duration,
          // Convert "Current" to actual year for backend if needed
          start_year: startYear,
          end_year: endYear === 'Current' ? String(currentYear) : endYear,
        },
      
        media: {
          blur_photo: blurPhoto,
        },
      };
      
      console.log("📦 Profile Setup Payload:", payload);
      
      profileUpdateMutation.mutate({payload: payload}, {
        onSuccess: (res: any) => {
          setSubmitting(false);
          console.log("✅ Profile setup success:", res);
          
          // Handle different response structures
          const responseData = res?.data || res;
          
          if(res?.status === 200 || responseData){
            Toast.show({
              type: "success",
              text1: "Profile Created Successfully",
              text2: "Your profile has been created successfully",
            });
            navigation.replace('MoreAboutYou', { profileData: responseData });
          } else {
            Toast.show({
              type: "error",
              text1: "Profile Creation Failed",
              text2: "Unexpected response from server. Please try again.",
            });
          }
        },
        onError: (err: any) => {
          setSubmitting(false);
          console.log("❌ Profile setup error:", err);
          
          // Field name mapping: backend field names -> user-friendly names
          const fieldNameMap: Record<string, string> = {
            'candidate_name': 'Candidate Name',
            'hidden_name': 'Hidden Name',
            'date_of_birth': 'Date of Birth',
            'country': 'Country',
            'city': 'City',
            'religion': 'Religion',
            'sect': 'Sect',
            'caste': 'Caste',
            'height_cm': 'Height',
            'weight_kg': 'Weight',
            'phone_country_code': 'Phone Country Code',
            'phone_number': 'Phone Number',
            'profile_for': 'Profile For',
            'gender': 'Gender',
            'marital_status': 'Marital Status',
            'father_status': 'Father Status',
            'father_employment_status': 'Father Employment Status',
            'mother_status': 'Mother Status',
            'mother_employment_status': 'Mother Employment Status',
            'total_brothers': 'Total Brothers',
            'total_sisters': 'Total Sisters',
            'education_level': 'Education Level',
            'employment_status': 'Employment Status',
            'profession': 'Profession',
            'instituate_name': 'Institute Name',
            'degree_title': 'Degree Title',
            'duration': 'Duration',
            'start_year': 'Start Year',
            'end_year': 'End Year',
            'blur_photo': 'Blur Photo',
          };
          
          // Extract user-friendly error message
          let errorMessage = 'Failed to create profile. Please try again.';
          let errorTitle = 'Profile Creation Failed';
          
          if (err?.response?.data) {
            const errorData = err.response.data;
            
            // Handle different error formats
            if (errorData.message) {
              errorMessage = Array.isArray(errorData.message) 
                ? errorData.message[0] 
                : errorData.message;
            } else if (errorData.error) {
              errorMessage = Array.isArray(errorData.error) 
                ? errorData.error[0] 
                : errorData.error;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData.non_field_errors) {
              errorMessage = Array.isArray(errorData.non_field_errors) 
                ? errorData.non_field_errors[0] 
                : errorData.non_field_errors;
            } else {
              // Handle field-specific errors
              const fieldKeys = Object.keys(errorData);
              
              if (fieldKeys.length > 0) {
                // Get the first field error (prioritize specific fields)
                const firstField = fieldKeys[0];
                const fieldErrorValue = errorData[firstField];
                
                // Extract error message from array or string
                let fieldErrorMessage = '';
                if (Array.isArray(fieldErrorValue)) {
                  fieldErrorMessage = fieldErrorValue[0] || '';
                } else if (typeof fieldErrorValue === 'string') {
                  fieldErrorMessage = fieldErrorValue;
                } else if (typeof fieldErrorValue === 'object' && fieldErrorValue !== null) {
                  // Handle nested error objects
                  const nestedErrors = Object.values(fieldErrorValue).flat();
                  if (nestedErrors.length > 0) {
                    fieldErrorMessage = Array.isArray(nestedErrors[0]) 
                      ? nestedErrors[0][0] 
                      : String(nestedErrors[0]);
                  }
                }
                
                // Get user-friendly field name
                const userFriendlyFieldName = fieldNameMap[firstField] || firstField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                // Construct error message with field name
                if (fieldErrorMessage) {
                  errorMessage = `${userFriendlyFieldName}: ${fieldErrorMessage}`;
                } else {
                  errorMessage = `${userFriendlyFieldName} is invalid or required.`;
                }
                
                // If there are multiple field errors, mention it
                if (fieldKeys.length > 1) {
                  errorTitle = `Multiple Fields Have Errors`;
                  errorMessage += ` (and ${fieldKeys.length - 1} more field${fieldKeys.length > 2 ? 's' : ''})`;
                } else {
                  errorTitle = `${userFriendlyFieldName} Error`;
                }
              }
            }
          } else if (err?.message) {
            if (err.message.includes('Network')) {
              errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (err.message.includes('timeout')) {
              errorMessage = 'Request timed out. Please try again.';
            } else {
              errorMessage = err.message;
            }
          }
          
          Toast.show({
            type: "error",
            text1: errorTitle,
            text2: errorMessage,
            visibilityTime: 5000,
          });
        },
      });
      }catch(error: any){
        setSubmitting(false);
        console.log("❌ Profile setup exception:", error);
        
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (error?.message) {
          errorMessage = error.message;
        }
        
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMessage,
        });
      }
      // Complete profile setup - navigate to MoreAboutYou
    }
  };
  const pickImageFromGallery = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 1 as const,
    };
  
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      
      if (response.errorCode) {
        console.error('Image picker error:', response.errorCode, response.errorMessage);
        let errorMsg = 'Failed to access photo library.';
        if (response.errorCode === 'permission') {
          errorMsg = 'Please grant photo library permission in settings to select photos.';
        } else if (response.errorMessage) {
          errorMsg = response.errorMessage;
        }
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorMsg,
        });
        return;
      }
      
      if (!response.assets || !response.assets[0]) {
        Toast.show({
          type: 'error',
          text1: 'No Image Selected',
          text2: 'Please select a photo to upload',
        });
        return;
      }
  
      const image = response.assets[0];
      
      // Clear error when user selects a new image
      if (errors.selectedImage) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.selectedImage;
          return newErrors;
        });
      }
  
      // Auto upload (don't set selectedImage here, let onSuccess handle it)
      await uploadProfilePicture(image);
    });
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
        async (response) => {
          if (response.didCancel) {
            console.log('User cancelled camera');
            return;
          }
          
          if (response.errorCode) {
            console.error('Camera error:', response.errorCode, response.errorMessage);
            let errorMsg = 'Failed to open camera. Please try again.';
            if (response.errorCode === 'camera_unavailable') {
              errorMsg = 'Camera is not available on this device.';
            } else if (response.errorCode === 'permission') {
              errorMsg = 'Camera permission denied. Please enable it in settings.';
            } else if (response.errorMessage) {
              errorMsg = response.errorMessage;
            }
            Toast.show({
              type: 'error',
              text1: 'Camera Error',
              text2: errorMsg,
            });
            return;
          }
          
          if (response.errorMessage) {
            console.error('Camera error message:', response.errorMessage);
            Toast.show({
              type: 'error',
              text1: 'Camera Error',
              text2: response.errorMessage || 'Failed to capture photo',
            });
            return;
          }
      
          if (!response.assets || !response.assets[0]) {
            Toast.show({
              type: 'info',
              text1: 'No Photo Captured',
              text2: 'Please try taking a photo again',
            });
            return;
          }
  
      const image = response.assets[0];
      
      // Clear error when user selects a new image
      if (errors.selectedImage) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.selectedImage;
          return newErrors;
        });
      }
  
      // Auto upload (don't set selectedImage here, let onSuccess handle it)
      await uploadProfilePicture(image);
        }
      );
    } catch (error: any) {
      console.error('Error opening camera:', error);
      let errorMsg = 'Failed to open camera. Please try again.';
      if (error?.message) {
        if (error.message.includes('Permission')) {
          errorMsg = 'Camera permission is required. Please enable it in settings.';
        } else {
          errorMsg = error.message;
        }
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMsg,
    });
    }
  };
  
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.sectionTitle}>This profile is for *</Text>
      <View style={styles.buttonGrid}>
        {profileForOptions.map(option => (
          <Pressable
            key={option}
            onPress={() => {
              setProfileFor(option);
              if (errors.profileFor) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.profileFor;
                  return newErrors;
                });
              }
            }}
            style={[
              styles.selectButton,
              profileFor === option && styles.selectButtonActive,
              errors.profileFor && styles.selectButtonError,
            ]}>
            <Text
              style={[
                styles.selectButtonText,
                profileFor === option && styles.selectButtonTextActive,
              ]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.profileFor && (
        <Text style={styles.errorText}>{errors.profileFor}</Text>
      )}

      <Text style={styles.sectionTitle}>Gender *</Text>
      <View style={styles.buttonGrid}>
        {genderOptions.map(option => (
          <Pressable
            key={option}
            onPress={() => {
              setGender(option);
              if (errors.gender) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.gender;
                  return newErrors;
                });
              }
            }}
            style={[
              styles.selectButton,
              gender === option && styles.selectButtonActive,
              errors.gender && styles.selectButtonError,
            ]}>
            <Text
              style={[
                styles.selectButtonText,
                gender === option && styles.selectButtonTextActive,
              ]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.gender && (
        <Text style={styles.errorText}>{errors.gender}</Text>
      )}

      <Text style={styles.sectionTitle}>Candidate Marital Status *</Text>
      <View style={styles.buttonGrid}>
        {maritalStatusOptions.map(option => (
          <Pressable
            key={option}
            onPress={() => {
              setMaritalStatus(option);
              if (errors.maritalStatus) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.maritalStatus;
                  return newErrors;
                });
              }
            }}
            style={[
              styles.selectButton,
              maritalStatus === option && styles.selectButtonActive,
              errors.maritalStatus && styles.selectButtonError,
            ]}>
            <Text
              style={[
                styles.selectButtonText,
                maritalStatus === option && styles.selectButtonTextActive,
              ]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.maritalStatus && (
        <Text style={styles.errorText}>{errors.maritalStatus}</Text>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.sectionTitle}>Candidate information</Text>
      <Text style={styles.label}>Candidate name *</Text>
      <TextInput
        placeholder="Enter candidate name"
        placeholderTextColor="#8C8A9A"
        style={[
          styles.textInput,
          errors.candidateName && styles.textInputError,
        ]}
        value={candidateName}
        onChangeText={(text) => {
          setCandidateName(text);
          if (errors.candidateName) {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.candidateName;
              return newErrors;
            });
          }
        }}
      />
      {errors.candidateName && (
        <Text style={styles.errorText}>{errors.candidateName}</Text>
      )}

      {/* <View style={styles.checkboxContainer}>
        <Pressable
          onPress={() => setHiddenName(!hiddenName)}
          style={styles.checkbox}>
          {hiddenName && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>
        <Text style={styles.checkboxLabel}>Hidden Name</Text>
      </View> */}

      <Text style={styles.label}>Date of birth *</Text>
      <Pressable
        onPress={() => setDatePickerOpen(true)}
        style={styles.dateInputContainer}>
        <Text
          style={[
            styles.dateInputText,
            !dateOfBirth && styles.dateInputPlaceholder,
          ]}>
          {dateOfBirth || 'DD/MM/YYYY'}
        </Text>
        <Icon name="calendar" size={20} color="#8C8A9A" />
      </Pressable>
      
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
        
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
        
          setDateOfBirth(`${year}-${month}-${day}`); // ⬅️ YYYY-MM-DD
          
          // Clear error if date is selected
          if (errors.dateOfBirth) {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.dateOfBirth;
              return newErrors;
            });
          }
        }}
        onCancel={() => {
          setDatePickerOpen(false);
        }}
        theme="dark"
      />
      {/* Country - Read Only */}
      <View style={styles.readOnlyContainer}>
        <Text style={styles.readOnlyLabel}>Country *</Text>
        <View style={styles.readOnlyValue}>
          <Text style={styles.readOnlyText}>{country}</Text>
        </View>
      </View>

      {/* City */}
      <View>
        <Dropdown 
          label="City" 
          value={city} 
          options={cityOptions} 
          onSelect={(value) => {
            setCity(value);
            if (errors.city) {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.city;
                return newErrors;
              });
            }
          }} 
          required
          error={!!errors.city}
        />
        {errors.city && (
          <Text style={styles.errorText}>{errors.city}</Text>
        )}
      </View>

      {/* Religion - Read Only */}
      <View style={styles.readOnlyContainer}>
        <Text style={styles.readOnlyLabel}>Religion *</Text>
        <View style={styles.readOnlyValue}>
          <Text style={styles.readOnlyText}>{religion}</Text>
        </View>
      </View>

      {/* Sect */}
      <Dropdown label="Sect *" value={sect} options={sectOptions} onSelect={(value) => {
        setSect(value);
        if (errors.sect) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.sect;
            return newErrors;
          });
        }
      }} />
      {errors.sect && (
        <Text style={styles.errorText}>{errors.sect}</Text>
      )}
      <Dropdown label="Caste" value={caste} options={casteOptions} onSelect={(value) => {
        setCaste(value);
        if (errors.caste) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.caste;
            return newErrors;
          });
        }
      }} />
      {errors.caste && (
        <Text style={styles.errorText}>{errors.caste}</Text>
      )}
      <Dropdown label="Height *" value={height} options={heightOptions} onSelect={(value) => {
        setHeight(value);
        if (errors.height) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.height;
            return newErrors;
          });
        }
      }} />
      {errors.height && (
        <Text style={styles.errorText}>{errors.height}</Text>
      )}
      <View style={styles.weightContainer}>
        <Text style={styles.label}>Weight</Text>
        <View style={styles.weightInputContainer}>
          <TextInput
            placeholder="Enter weight"
            placeholderTextColor="#8C8A9A"
            style={styles.weightInput}
            value={weight}
            onChangeText={(text) => {
              setWeight(text);
              if (errors.weight) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.weight;
                  return newErrors;
                });
              }
            }}
            keyboardType="numeric"
          />
          <Text style={styles.unitText}>KG</Text>
        </View>
      </View>

      <Text style={styles.label}>Phone Number *</Text>
      <View style={styles.phoneContainer}>
        <Dropdown
          label=""
          value={phoneCode}
          options={['+92']}
          onSelect={(value) => {
            setPhoneCode(value);
            if (errors.phoneCode) {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.phoneCode;
                return newErrors;
              });
            }
          }}
          required
          error={!!errors.phoneCode}
          containerStyle={styles.phoneDropdownContainer}
        />
        <TextInput
          placeholder="Phone"
          placeholderTextColor="#8C8A9A"
          style={[styles.textInput, styles.phoneInput, errors.phoneNumber && styles.textInputError]}
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            if (errors.phoneNumber) {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.phoneNumber;
                return newErrors;
              });
            }
          }}
          keyboardType="phone-pad"
        />
      </View>
      {errors.phoneNumber && (
        <Text style={styles.errorText}>{errors.phoneNumber}</Text>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.sectionTitle}>Upload photo</Text>

      <View style={styles.photoButtons}>
        <Pressable style={styles.photoButton} onPress={() => pickImageFromGallery()}>
          <Text style={styles.photoButtonText}>Upload photo</Text>
        </Pressable>
        <Pressable style={styles.photoButton} onPress={() => openCamera()}>
          <Text style={styles.photoButtonText}>Take a Selfie</Text>
        </Pressable>
      </View>

      <View style={[
        styles.photoPlaceholder,
        errors.selectedImage && styles.photoPlaceholderError,
      ]}>
  {uploading ? (
    <ActivityIndicator size="large" color="#D4AF37" />
  ) : selectedImage ? (
          <ImageBackground
      source={{ uri: selectedImage }}
      style={styles.selectedImage}
      resizeMode="cover"
            blurRadius={blurPhoto ? 8 : 0}
          >
            {blurPhoto && (
              <View style={styles.blurOverlay}>
                <Icon name="eye-off" size={32} color="#FFFFFF" />
                <Text style={styles.blurOverlayText}>Photo Blurred</Text>
              </View>
            )}
          </ImageBackground>
  ) : (
    <Icon name="camera" size={48} color="#D4AF37" />
  )}
</View>


      {errors.selectedImage && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, styles.photoErrorText]}>
            {errors.selectedImage}
          </Text>
        </View>
      )}

      <View style={styles.blurContainer}>
        <View style={styles.blurLabelContainer}>
        <Text style={styles.blurLabel}>Blur Photo</Text>
          <Text style={styles.blurDescription}>
            {blurPhoto 
              ? 'Your photo will be blurred to other users' 
              : 'Your photo will be visible to other users'}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setBlurPhoto(!blurPhoto);
            // Show confirmation toast
            Toast.show({
              type: 'info',
              text1: blurPhoto ? 'Blur Disabled' : 'Blur Enabled',
              text2: blurPhoto 
                ? 'Your photo will be visible to other users'
                : 'Your photo will be blurred to other users',
            });
          }}
          style={[styles.toggle, blurPhoto && styles.toggleActive]}>
          <View style={[styles.toggleCircle, blurPhoto && styles.toggleCircleActive]} />
        </Pressable>
      </View>
    </View>
  );

  // Calculate duration when start and end years are selected
  useEffect(() => {
    if (startYear && endYear) {
      const start = parseInt(startYear, 10);
      // Handle "Current" option for end year
      const endValue = endYear === 'Current' ? currentYear : parseInt(endYear, 10);
      
      if (!isNaN(start) && !isNaN(endValue)) {
        if (endValue >= start) {
          // Format duration as "startYear-endYear" (e.g., "2020-2025" or "2020-Current")
          const endDisplay = endYear === 'Current' ? String(currentYear) : endYear;
          setDuration(`${startYear}-${endDisplay}`);
        } else {
          setDuration('');
        }
      } else {
        setDuration('');
      }
    } else {
      setDuration('');
    }
  }, [startYear, endYear, currentYear]);

  const renderStep4 = () => (
    <View>
      <Text style={styles.sectionTitle}>Education & Employment</Text>

      <View>
        <Dropdown
          label="Education Level"
          value={educationLevel}
          options={educationOptions}
          onSelect={(value) => {
            setEducationLevel(value);
            if (errors.educationLevel) {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.educationLevel;
                return newErrors;
              });
            }
          }}
          required
          error={!!errors.educationLevel}
        />
        {errors.educationLevel && (
          <Text style={styles.errorText}>{errors.educationLevel}</Text>
        )}
      </View>

      <Text style={styles.label}>Institute Name *</Text>
      <TextInput
        placeholder="Enter institute name"
        placeholderTextColor="#8C8A9A"
        style={[
          styles.textInput,
          errors.instituteName && styles.textInputError,
        ]}
        value={instituteName}
        onChangeText={(text) => {
          setInstituteName(text);
          if (errors.instituteName) {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.instituteName;
              return newErrors;
            });
          }
        }}
      />
      {errors.instituteName && (
        <Text style={styles.errorText}>{errors.instituteName}</Text>
      )}

      <Text style={styles.label}>Degree Title *</Text>
      <TextInput
        placeholder="Enter degree title"
        placeholderTextColor="#8C8A9A"
        style={[
          styles.textInput,
          errors.degreeTitle && styles.textInputError,
        ]}
        value={degreeTitle}
        onChangeText={(text) => {
          setDegreeTitle(text);
          if (errors.degreeTitle) {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.degreeTitle;
              return newErrors;
            });
          }
        }}
      />
      {errors.degreeTitle && (
        <Text style={styles.errorText}>{errors.degreeTitle}</Text>
      )}

      <View style={styles.yearContainer}>
        <View style={styles.yearDropdownContainer}>
          <Dropdown
            label="Start Year"
            value={startYear}
            options={yearOptions}
            onSelect={(value) => {
              setStartYear(value);
              if (errors.startYear) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.startYear;
                  return newErrors;
                });
              }
              // Clear endYear error if it was related to date comparison
              if (errors.endYear && endYear && endYear !== 'Current') {
                const start = parseInt(value, 10);
                const end = parseInt(endYear, 10);
                if (!isNaN(start) && !isNaN(end) && end >= start) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.endYear;
                    return newErrors;
                  });
                }
              }
            }}
            required
            error={!!errors.startYear}
          />
          {errors.startYear && (
            <Text style={styles.errorText}>{errors.startYear}</Text>
          )}
        </View>

        <View style={styles.yearDropdownContainer}>
  <Dropdown
    label="End Year"
    value={endYear}
    options={endYearOptions}
    required
    error={!!errors.endYear}
    onSelect={(value) => {
      setEndYear(value);

      // Clear previous error
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.endYear;
        return updated;
      });

      // Skip validation if "Current"
      if (value === 'Current') return;

      // Validate against start year
      if (startYear) {
        const start = Number(startYear);
        const end = Number(value);

        if (!isNaN(start) && !isNaN(end) && end < start) {
          setErrors(prev => ({
            ...prev,
            endYear: 'End year cannot be before start year',
          }));
        }
      }
    }}
  />

  {errors.endYear && (
    <Text style={styles.errorText}>{errors.endYear}</Text>
  )}
</View>

      </View>

      {duration && (
        <View style={styles.durationContainer}>
          <Text style={styles.label}>Duration</Text>
          <View style={styles.durationDisplay}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        </View>
      )}

      <Text style={styles.label}>Employment status *</Text>
      <View style={styles.buttonGrid}>
        {employmentOptions.map(option => (
          <Pressable
            key={option}
            onPress={() => {
              setEmploymentStatus(option);
              if (errors.employmentStatus) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.employmentStatus;
                  return newErrors;
                });
              }
            }}
            style={[
              styles.selectButton,
              employmentStatus === option && styles.selectButtonActive,
              errors.employmentStatus && styles.selectButtonError,
            ]}>
            <Text
              style={[
                styles.selectButtonText,
                employmentStatus === option && styles.selectButtonTextActive,
              ]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      {errors.employmentStatus && (
        <Text style={styles.errorText}>{errors.employmentStatus}</Text>
      )}

      <View>
        <Dropdown
          label="Profession"
          value={profession}
          options={professionOptions}
          onSelect={(value) => {
            setProfession(value);
            if (errors.profession) {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.profession;
                return newErrors;
              });
            }
          }}
          required
          error={!!errors.profession}
        />
        {errors.profession && (
          <Text style={styles.errorText}>{errors.profession}</Text>
        )}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View>
      <Text style={styles.sectionTitle}>CANDIDATE FATHER DETAILS</Text>

      <View style={styles.aliveButtons}>
        <Pressable
          onPress={() => setFatherAlive(true)}
          style={[
            styles.aliveButton,
            fatherAlive && styles.aliveButtonActive,
          ]}>
          <Text
            style={[
              styles.aliveButtonText,
              fatherAlive && styles.aliveButtonTextActive,
            ]}>
            Alive
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFatherAlive(false)}
          style={[
            styles.aliveButton,
            !fatherAlive && styles.aliveButtonActive,
          ]}>
          <Text
            style={[
              styles.aliveButtonText,
              !fatherAlive && styles.aliveButtonTextActive,
            ]}>
            Deceased
          </Text>
        </Pressable>
      </View>

      <Dropdown
        label="Employment Status *"
        value={fatherEmployment}
        options={employmentStatusOptions}
        onSelect={(value) => {
          setFatherEmployment(value);
          if (errors.fatherEmployment) {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.fatherEmployment;
              return newErrors;
            });
          }
        }}
        required
        error={!!errors.fatherEmployment}
      />
      {errors.fatherEmployment && (
        <Text style={styles.errorText}>{errors.fatherEmployment}</Text>
      )}

      <Text style={styles.sectionTitle}>CANDIDATE MOTHER DETAILS</Text>

      <View style={styles.aliveButtons}>
        <Pressable
          onPress={() => setMotherAlive(true)}
          style={[
            styles.aliveButton,
            motherAlive && styles.aliveButtonActive,
          ]}>
          <Text
            style={[
              styles.aliveButtonText,
              motherAlive && styles.aliveButtonTextActive,
            ]}>
            Alive
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMotherAlive(false)}
          style={[
            styles.aliveButton,
            !motherAlive && styles.aliveButtonActive,
          ]}>
          <Text
            style={[
              styles.aliveButtonText,
              !motherAlive && styles.aliveButtonTextActive,
            ]}>
            Deceased
          </Text>
        </Pressable>
      </View>

      <Dropdown
        label="Employment Status *"
        value={motherEmployment}
        options={employmentStatusOptions}
        onSelect={(value) => {
          setMotherEmployment(value);
          if (errors.motherEmployment) {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.motherEmployment;
              return newErrors;
            });
          }
        }}
        required
        error={!!errors.motherEmployment}
      />
      {errors.motherEmployment && (
        <Text style={styles.errorText}>{errors.motherEmployment}</Text>
      )}
  <Text style={styles.sectionTitle}>CANDIDATE SIBLINGS DETAILS</Text>
      <View style={styles.counterContainer}>
        <Text style={styles.counterLabel}>Total No. of Brothers</Text>
        <View style={styles.counter}>
          <Pressable
            onPress={() => setBrothersCount(Math.max(0, brothersCount - 1))}
            style={styles.counterButton}>
            <Text style={styles.counterButtonText}>-</Text>
          </Pressable>
          <View style={styles.counterDisplay}>
            <Text style={styles.counterValue}>{brothersCount}</Text>
          </View>
          <Pressable
            onPress={() => setBrothersCount(brothersCount + 1)}
            style={styles.counterButton}>
            <Text style={styles.counterButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterLabel}>Total No. of Sisters</Text>
        <View style={styles.counter}>
          <Pressable
            onPress={() => setSistersCount(Math.max(0, sistersCount - 1))}
            style={styles.counterButton}>
            <Text style={styles.counterButtonText}>-</Text>
          </Pressable>
          <View style={styles.counterDisplay}>
            <Text style={styles.counterValue}>{sistersCount}</Text>
          </View>
          <Pressable
            onPress={() => setSistersCount(sistersCount + 1)}
            style={styles.counterButton}>
            <Text style={styles.counterButtonText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <Screen>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.progressStep}>
            <View
              style={[
                styles.progressCircle,
                index + 1 <= currentStep && styles.progressCircleActive,
              ]}>
              <Icon
                name={step.icon}
                size={20}
                color={index + 1 <= currentStep ? '#000000' : '#FFFFFF'}
              />
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  index + 1 < currentStep && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <View style={styles.arrowContainer}>
            <View style={[styles.arrowTriangle, styles.leftArrow]} />
          </View>
        </Pressable>
        <Pressable
          onPress={handleNext}
          disabled={submitting}
          style={[
            styles.nextButton,
            currentStep === totalSteps && styles.completeButton,
            submitting && styles.buttonDisabled,
          ]}>
          {currentStep === totalSteps ? (
            submitting ? (
              <ActivityIndicator size="large" color="#D4AF37" />
            ) : (
            <Text style={styles.completeButtonText}>Complete</Text>
            )
          ) : (
            <View style={styles.arrowContainer}>
              <View style={[styles.arrowTriangle, styles.rightArrow]} />
            </View>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: '10%',
    height: 80,
    borderRadius:10,
    backgroundColor: '#1A1A1A',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: '#D4AF37',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#000000',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#D4AF37',
  },
  scrollContent: {
    
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 20,
  
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
 
    
  },
  selectButton: {

    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 8,
    // marginRight: 8,
    marginBottom: 8,
    // minWidth: 100,
  },
  selectButtonActive: {
    backgroundColor: '#D4AF37',
  },
  selectButtonText: {
    color: '#8C8A9A',
    fontSize: 14,
    textAlign: 'center',
  },
  selectButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  label: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    color: '#1F1E2E',
    fontSize: 14,
    marginBottom: 12,
  },
  dateInputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    color: '#1F1E2E',
    fontSize: 14,
    flex: 1,
  },
  dateInputPlaceholder: {
    color: '#8C8A9A',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  weightContainer: {
    marginBottom: 12,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    color: '#1F1E2E',
    fontSize: 14,
    flex: 1,
  },
  unitText: {
    color: '#8C8A9A',
    fontSize: 14,
    marginLeft: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  phoneDropdownContainer: {
    width: 100,
    marginBottom: 12,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 12,
    height: 48,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  photoButton: {
    backgroundColor: '#D4AF37',
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#1F1E2E',
    fontWeight: '700',
    fontSize: 14,
  },
  photoPlaceholder: {
    height: 200,
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  blurOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  blurContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 14,
    borderRadius: 8,
  },
  blurLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  blurLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  blurDescription: {
    color: '#8C8A9A',
    fontSize: 12,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#D4AF37',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8C8A9A',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  aliveButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  aliveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  aliveButtonActive: {
    backgroundColor: '#D4AF37',
  },
  aliveButtonText: {
    color: '#8C8A9A',
    fontSize: 14,
    fontWeight: '600',
  },
  aliveButtonTextActive: {
    color: '#FFFFFF',
  },
  counterContainer: {
    marginBottom: 20,
  },
  counterLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    backgroundColor: '#D4AF37',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '700',
  },
  counterDisplay: {
    backgroundColor: '#FFFFFF',
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderRadius: 8,
  },
  counterValue: {
    color: '#1F1E2E',
    fontSize: 18,
    fontWeight: '700',
  },
  navButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#000000',
  },
  backButton: {
    backgroundColor: '#D4AF37',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  nextButton: {
    backgroundColor: '#D4AF37',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  completeButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 32,
    paddingVertical: 16,
    width: 'auto',
    minWidth: 140,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowTriangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  leftArrow: {
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderRightWidth: 20,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
    borderLeftWidth: 0,
  },
  rightArrow: {
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderLeftWidth: 20,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
    borderRightWidth: 0,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  errorContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  photoErrorText: {
    marginTop: 0,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  textInputError: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  dateInputError: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  selectButtonError: {
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  photoPlaceholderError: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  yearContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  yearDropdownContainer: {
    flex: 1,
  },
  durationContainer: {
    marginBottom: 12,
  },
  durationDisplay: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  durationText: {
    color: '#1F1E2E',
    fontSize: 14,
    fontWeight: '600',
  },
  readOnlyContainer: {
    marginBottom: 16,
  },
  readOnlyLabel: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  readOnlyValue: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  readOnlyText: {
    color: '#1F1E2E',
    fontSize: 14,
  },
});

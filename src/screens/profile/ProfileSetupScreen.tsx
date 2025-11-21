import React, { useState } from 'react';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  PermissionsAndroid, Platform,
  Image
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Screen from '../../components/Screen';
import Dropdown from '../../components/Dropdown';
import { useProfileCreate, useProfileView } from '../../service/Hooks/User_Profile_Hook';
import { useAuthStore } from '../../store/Auth_store';
import {launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

export default function ProfileSetupScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const token = useAuthStore((state) => state.token);
  const { data: profileData } = useProfileView();
  console.log('profile data in home screens', profileData);
  console.log("token of profile setup===========================",token);
  // Step 1: Profile For, Gender, Marital Status
  const [profileFor, setProfileFor] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');

  // Step 2: Candidate Information
  const [candidateName, setCandidateName] = useState('');
  const [hiddenName, setHiddenName] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [religion, setReligion] = useState('');
  const [sect, setSect] = useState('');
  const [caste, setCaste] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [phoneCode, setPhoneCode] = useState('+92');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Step 3: Photo (placeholder)
  const [selectedImage, setSelectedImage] = useState('');
  const [blurPhoto, setBlurPhoto] = useState(false);

  // Step 4: Education & Employment
  const [educationLevel, setEducationLevel] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [profession, setProfession] = useState('');

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
  const countryOptions = ['Pakistan', 'India', 'USA', 'UK', 'Canada', 'UAE', 'Saudi Arabia'];
  const cityOptions = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan', 'Rawalpindi'];
  const religionOptions = ['Muslim', 'Christian', 'Hindu', 'Sikh', 'Other'];
  const sectOptions = ['Sunni', 'Shia', 'Ahle Hadith', 'Deobandi', 'Barelvi'];
  const casteOptions = ['Syed', 'Mughal', 'Rajput', 'Arain', 'Jatt', 'Other'];
  const heightOptions = [
    121.92,
    137.16,
    152.40,
    157.48,
    162.56,
    167.64,
    172.72,
    177.80,
    182.88,
    198.12,
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

  const steps = [
    { icon: 'person', label: 'Profile For' },
    { icon: 'document-text', label: 'Candidate Info' },
    { icon: 'camera', label: 'Photo' },
    { icon: 'briefcase', label: 'Education' },
    { icon: 'people', label: 'Family' },
  ];
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "This app needs access to your camera",
          buttonPositive: "OK",
        }
      );
  
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };
  
  const profileUpdateMutation = useProfileCreate();
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      try{
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
        },
      
        media: {
          blur_photo: blurPhoto,
        },
      };
      profileUpdateMutation.mutate({payload: payload}, {
        onSuccess: (res) => {
          console.log("response of profile update===========================",res);
          if(res.status === 200){
            navigation.navigate('Main');
            Toast.show({
              type: "success",
              text1: "Profile updated successfully",
            });
          }
        },
        onError: (err: any) => {
          console.log("error of profile update===========================",err);
        },
      });
      }catch(error: any){
        console.log("error of profile update===========================",error);
      }
      // Complete profile setup - navigate to MoreAboutYou
      // navigation.replace('MoreAboutYou', { profileData });
    }
  };
  const pickImageFromGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
  
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const image = response.assets[0];
        console.log("Selected Image:", image);
        
        // Example: Save to state
        setSelectedImage(image.uri);
      }
    });
  };
  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log("Camera permission denied");
      return;
    }
  
    const options = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
    };
  
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error:', response.errorMessage);
      } else {
        const image = response.assets[0];
        setSelectedImage(image.uri);
      }
    });
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
            onPress={() => setProfileFor(option)}
            style={[
              styles.selectButton,
              profileFor === option && styles.selectButtonActive,
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

      <Text style={styles.sectionTitle}>Gender *</Text>
      <View style={styles.buttonGrid}>
        {genderOptions.map(option => (
          <Pressable
            key={option}
            onPress={() => setGender(option)}
            style={[
              styles.selectButton,
              gender === option && styles.selectButtonActive,
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

      <Text style={styles.sectionTitle}>Candidate Marital Status *</Text>
      <View style={styles.buttonGrid}>
        {maritalStatusOptions.map(option => (
          <Pressable
            key={option}
            onPress={() => setMaritalStatus(option)}
            style={[
              styles.selectButton,
              maritalStatus === option && styles.selectButtonActive,
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
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.sectionTitle}>Candidate information</Text>
      <Text style={styles.label}>Candidate name *</Text>
      <TextInput
        placeholder="Enter candidate name"
        placeholderTextColor="#8C8A9A"
        style={styles.textInput}
        value={candidateName}
        onChangeText={setCandidateName}
      />

      <View style={styles.checkboxContainer}>
        <Pressable
          onPress={() => setHiddenName(!hiddenName)}
          style={styles.checkbox}>
          {hiddenName && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>
        <Text style={styles.checkboxLabel}>Hidden Name</Text>
      </View>

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
        }}
        onCancel={() => {
          setDatePickerOpen(false);
        }}
        theme="dark"
      />

      <Dropdown
        label="Country"
        value={country}
        options={countryOptions}
        onSelect={setCountry}
      />

      <Dropdown label="City *" value={city} options={cityOptions} onSelect={setCity} required />

      <Dropdown
        label="Religion"
        value={religion}
        options={religionOptions}
        onSelect={setReligion}
      />

      <Dropdown label="Sect" value={sect} options={sectOptions} onSelect={setSect} />

      <Dropdown label="Caste" value={caste} options={casteOptions} onSelect={setCaste} />

      <Dropdown label="Height" value={height} options={heightOptions} onSelect={setHeight} />

      <View style={styles.weightContainer}>
        <Text style={styles.label}>Weight</Text>
        <View style={styles.weightInputContainer}>
          <TextInput
            placeholder="Enter weight"
            placeholderTextColor="#8C8A9A"
            style={styles.weightInput}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <Text style={styles.unitText}>KG</Text>
        </View>
      </View>

      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.phoneContainer}>
        <Dropdown
          label=""
          value={phoneCode}
          options={['+92', '+1', '+44', '+971', '+966']}
          onSelect={setPhoneCode}
          containerStyle={styles.phoneDropdownContainer}
        />
        <TextInput
          placeholder="Phone"
          placeholderTextColor="#8C8A9A"
          style={[styles.textInput, styles.phoneInput]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>
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

      <View style={styles.photoPlaceholder}>
        {selectedImage ? (
          <Image
            source={{ uri: selectedImage }}
            style={styles.selectedImage}
            resizeMode="cover"
          />
        ) : (
          <Icon name="camera" size={48} color="#D4AF37" />
        )}
      </View>

      <View style={styles.blurContainer}>
        <Text style={styles.blurLabel}>Blur Photo</Text>
        <Pressable
          onPress={() => setBlurPhoto(!blurPhoto)}
          style={[styles.toggle, blurPhoto && styles.toggleActive]}>
          <View style={[styles.toggleCircle, blurPhoto && styles.toggleCircleActive]} />
        </Pressable>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.sectionTitle}>Education & Employment</Text>

      <Dropdown
        label="Education Level *"
        value={educationLevel}
        options={educationOptions}
        onSelect={setEducationLevel}
        required
      />

      <Text style={styles.label}>Employment status *</Text>
      <View style={styles.buttonGrid}>
        {employmentOptions.map(option => (
          <Pressable
            key={option}
            onPress={() => setEmploymentStatus(option)}
            style={[
              styles.selectButton,
              employmentStatus === option && styles.selectButtonActive,
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

      <Dropdown
        label="Profession *"
        value={profession}
        options={professionOptions}
        onSelect={setProfession}
        required
      />
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
        label="Employment Status"
        value={fatherEmployment}
        options={employmentStatusOptions}
        onSelect={setFatherEmployment}
      />

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
        label="Employment Status"
        value={motherEmployment}
        options={employmentStatusOptions}
        onSelect={setMotherEmployment}
      />
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
          style={[
            styles.nextButton,
            currentStep === totalSteps && styles.completeButton,
          ]}>
          {currentStep === totalSteps ? (
            <Text style={styles.completeButtonText}>Complete</Text>
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
  },
  blurContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 14,
    borderRadius: 8,
  },
  blurLabel: {
    color: '#FFFFFF',
    fontSize: 14,
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
});

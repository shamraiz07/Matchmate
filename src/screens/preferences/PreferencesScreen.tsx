import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Screen from '../../components/Screen';
import PrefDropdown from '../../components/PrefDropdown';
import RangeSlider from '../../components/RangeSlider';
import Header from '../../components/Header';
import { useSearch_Profile_Match, useProfileView } from '../../service/Hooks/User_Profile_Hook';
import Toast from 'react-native-toast-message';

export default function PreferencesScreen({ navigation }: any) {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };
  const SearchprofileMutation = useSearch_Profile_Match();
  const { data: profileResponse } = useProfileView();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Basic preferences
  const [status, setStatus] = useState('');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(34);
  const [caste, setCaste] = useState('');
  const [city, setCity] = useState('');
  const [employment, setEmployment] = useState('');
  const [profession, setProfession] = useState('');
  const [disability, setDisability] = useState(false);
  
  // Additional fields from ProfileSetupScreen
  const [sect, setSect] = useState('');

  // Read-only fields from user profile
  const [userCountry, setUserCountry] = useState('Pakistan');
  const [userReligion, setUserReligion] = useState('Muslim');

  // Dropdown options (same as ProfileSetupScreen)
  const statusOptions = ['Single', 'Divorced', 'Married', 'Separated', 'Widower'];
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

  // Fetch user profile data to get country and religion
  useEffect(() => {
    if (profileResponse?.data) {
      const apiData = profileResponse.data;
      const candidateInfo = apiData.candidate_information || {};
      
      // Set read-only fields from user profile
      if (candidateInfo.country) {
        setUserCountry(candidateInfo.country);
      }
      if (candidateInfo.religion) {
        setUserReligion(candidateInfo.religion);
      }
    }
  }, [profileResponse?.data]);


  const handleReset = () => {
    setStatus('');
    setAgeMin(18);
    setAgeMax(34);
    setCaste('');
    setCity('');
    setEmployment('');
    setProfession('');
    setDisability(false);
    setSect('');
    setErrors({});
  };

  const handleApply = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const validationErrors: Record<string, string> = {};

    // Age range validation
    if (ageMin > ageMax) {
      validationErrors.ageRange = 'Minimum age cannot be greater than maximum age';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: firstError || 'Please check your input',
      });
      return;
    }

    try {
      setLoading(true);

      console.log('📌 Current State:', {
        status,
        ageMin,
        ageMax,
        caste,
        city,
        employment,
        profession,
        disability,
        sect,
        userCountry,
        userReligion,
      });

      const data = {
        status,
        religion: userReligion, // Use read-only religion from user profile
        caste,
        country: userCountry, // Use read-only country from user profile
        city,
        employment_status: employment,
        profession,
        prefers_disability: disability,
        min_age: ageMin,
        max_age: ageMax,
        // Additional fields
        sect: sect || undefined,
      };

      // Remove undefined fields
      Object.keys(data).forEach(key => {
        if (data[key as keyof typeof data] === undefined) {
          delete data[key as keyof typeof data];
        }
      });

      console.log('📦 FINAL PAYLOAD TO MUTATION:', data);

      await SearchprofileMutation.mutateAsync(
        { payload: data },
        {
          onSuccess: (res: any) => {
            setLoading(false);

            console.log('📥 SearchResponse:', res);
            if (res?.matching_profiles && res.matching_profiles.length > 0) {
              navigation.navigate('SearchResults', {
                results: res,
              });

              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Profiles found!',
              });
            } else {
              Toast.show({
                type: 'info',
                text1: 'No Results',
                text2: 'No profiles match your preferences',
              });
            }
          },
          onError: (err: any) => {
            setLoading(false);

            console.log('🔥 Search ERROR:', err?.response?.data);

            const errorData = err?.response?.data || {};
            let errorMessage = 'Search failed. Please try again.';

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
            }

            Toast.show({
              type: 'error',
              text1: 'Search Failed',
              text2: errorMessage,
            });
          },
        },
      );
    } catch (error: any) {
      setLoading(false);
      console.log('Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>
          Searching profiles...
        </Text>
      </View>
    );
  }
  return (
    <Screen>
      <Header title="Preferences" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Preferences about partner</Text>

        {/* Age Range Slider */}
        <RangeSlider
          minAge={ageMin}
          maxAge={ageMax}
          setMinAge={setAgeMin}
          setMaxAge={setAgeMax}
          // onValueChange={handleAgeChange}
        />

        {/* Status */}
        <PrefDropdown
          label="Status"
          value={status}
          options={statusOptions}
          onSelect={setStatus}
          onClear={() => setStatus('')}
        />

        {/* Country - Read Only */}
        <View style={styles.readOnlyContainer}>
          <Text style={styles.readOnlyLabel}>Country</Text>
          <View style={styles.readOnlyValue}>
            <Text style={styles.readOnlyText}>{userCountry || 'Pakistan'}</Text>
          </View>
        </View>

        {/* Religion - Read Only */}
        <View style={styles.readOnlyContainer}>
          <Text style={styles.readOnlyLabel}>Religion</Text>
          <View style={styles.readOnlyValue}>
            <Text style={styles.readOnlyText}>{userReligion || 'Muslim'}</Text>
          </View>
        </View>

        {/* Sect */}
        <PrefDropdown
          label="Sect"
          value={sect}
          options={sectOptions}
          onSelect={setSect}
          onClear={() => setSect('')}
        />

        {/* Caste/Tribe */}
        <PrefDropdown
          label="Caste/Tribe"
          value={caste}
          options={casteOptions}
          onSelect={setCaste}
          onClear={() => setCaste('')}
        />

        {/* City */}
        <PrefDropdown
          label="City"
          value={city}
          options={cityOptions}
          onSelect={setCity}
          onClear={() => setCity('')}
        />

        {/* Employment Status */}
        <PrefDropdown
          label="Employment Status"
          value={employment}
          options={employmentOptions}
          onSelect={setEmployment}
          onClear={() => setEmployment('')}
        />

        {/* Profession */}
        <PrefDropdown
          label="Profession"
          value={profession}
          options={professionOptions}
          onSelect={setProfession}
          onClear={() => setProfession('')}
        />

        {/* Age Range Error */}
        {errors.ageRange && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.ageRange}</Text>
          </View>
        )}

        {/* Disability Checkbox */}
        <View style={styles.checkboxContainer}>
          <Pressable
            onPress={() => setDisability(!disability)}
            style={styles.checkbox}
          >
            {disability && <Text style={styles.checkmark}>✓</Text>}
          </Pressable>
          <Text style={styles.checkboxLabel}>Disability</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </Pressable>
          <Pressable onPress={handleApply} style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#D4AF37',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 14,
  },
  readOnlyText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    fontSize: 14,
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
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E14D4D',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
});

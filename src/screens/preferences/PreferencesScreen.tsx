import React, { useState } from 'react';
import { Text, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import PrefDropdown from '../../components/PrefDropdown';
import RangeSlider from '../../components/RangeSlider';
import Header from '../../components/Header';

export default function PreferencesScreen({ navigation }: any) {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const [status, setStatus] = useState('Single');
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(34);
  const [religion, setReligion] = useState('Muslim');
  const [caste, setCaste] = useState('Butt');
  const [country, setCountry] = useState('Pakistan');
  const [city, setCity] = useState('Lahore');
  const [employment, setEmployment] = useState('Employed');
  const [profession, setProfession] = useState('Software Engineer');
  const [disability, setDisability] = useState(false);

  const statusOptions = ['Single', 'Divorced', 'Married', 'Separated', 'Widower'];
  const religionOptions = ['Muslim', 'Christian', 'Hindu', 'Sikh', 'Other'];
  const casteOptions = ['Butt', 'Syed', 'Mughal', 'Rajput', 'Arain', 'Jatt', 'Other'];
  const countryOptions = ['Pakistan', 'India', 'USA', 'UK', 'Canada', 'UAE', 'Saudi Arabia'];
  const cityOptions = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan', 'Rawalpindi'];
  const employmentOptions = ['Employed', 'Unemployed', 'Business', 'Self-employed', 'Retired'];
  const professionOptions = [
    'Software Engineer',
    'Doctor',
    'Teacher',
    'Engineer',
    'Business',
    'Accountant',
    'Lawyer',
    'Other',
  ];

  const handleAgeChange = (min: number, max: number) => {
    setAgeMin(min);
    setAgeMax(max);
  };

  const handleReset = () => {
    setStatus('');
    setAgeMin(18);
    setAgeMax(34);
    setReligion('');
    setCaste('');
    setCountry('');
    setCity('');
    setEmployment('');
    setProfession('');
    setDisability(false);
  };

  const handleApply = () => {
    navigation.replace('Main');
  };

  return (
    <Screen>
      <Header title="Preferences" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Preferences about partner</Text>

        {/* Age Range Slider */}
        <RangeSlider
          min={18}
          max={60}
          initialMin={ageMin}
          initialMax={ageMax}
          onValueChange={handleAgeChange}
        />

        {/* Status */}
        <PrefDropdown
          label="Status"
          value={status}
          options={statusOptions}
          onSelect={setStatus}
          onClear={() => setStatus('')}
        />

        {/* Religion/Community */}
        <PrefDropdown
          label="Religion/Community"
          value={religion}
          options={religionOptions}
          onSelect={setReligion}
          onClear={() => setReligion('')}
        />

        {/* Caste/Tribe */}
        <PrefDropdown
          label="Caste/Tribe"
          value={caste}
          options={casteOptions}
          onSelect={setCaste}
          onClear={() => setCaste('')}
        />

        {/* Country */}
        <PrefDropdown
          label="Country"
          value={country}
          options={countryOptions}
          onSelect={setCountry}
          onClear={() => setCountry('')}
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

        {/* Disability Checkbox */}
        <View style={styles.checkboxContainer}>
          <Pressable
            onPress={() => setDisability(!disability)}
            style={styles.checkbox}>
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
});


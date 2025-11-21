import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert, Image } from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import { useProfileUpdate, useProfileView } from '../../service/Hooks/User_Profile_Hook';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
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

export default function MyProfileScreen({ navigation }: any) {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };
  const profileUpdateMutation = useProfileUpdate();
  // Fetch profile data from API
  const { data: profileResponse } = useProfileView();
  console.log('profile data response', profileResponse);
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
  const mappedProfileData = useMemo(() => {
    if (!profileResponse?.data) {
      return {
        contact: '',
        matrimonyId: '',
        name: '',
        gender: '',
        maritalStatus: '',
        age: '',
        religion: '',
        sect: '',
    ethnicity: '',
    caste: '',
        weight: '',
    height: '',
    disability: 'No',
        description: '',
        country: '',
        city: '',
    birthCountry: '',
    nationality: '',
    languages: '',
    institute: '',
    degreeTitle: '',
        duration: '',
        employmentStatus: '',
    fatherEducation: '',
        fatherEmployment: '',
    fatherProfession: '',
    fatherDeceased: 'No',
    motherEducation: '',
        motherEmployment: '',
    motherProfession: '',
    motherDeceased: 'No',
    brothers: '0',
        sisters: '0',
    prefMaritalStatus: '',
    prefAge: '18 - 70 Yrs',
    prefCountry: '',
    prefCity: '',
    prefReligion: '',
    prefCaste: '',
        profilePicture: null,
      };
    }

    const apiData = profileResponse.data;
    const candidateInfo = apiData.candidate_information || {};
    const profileDetails = apiData.profile_details || {};
    const familyDetails = apiData.family_details || {};
    const siblingsDetails = apiData.siblings_details || {};
    const educationEmployment = apiData.education_employment || {};
    const media = apiData.media || {};
    const meta = apiData.meta || {};

    const phoneContact = candidateInfo.phone_country_code && candidateInfo.phone_number
      ? `${candidateInfo.phone_country_code}${candidateInfo.phone_number}`
      : '';

    return {
      contact: phoneContact,
      matrimonyId: meta.profile_id?.toString() || '',
      name: candidateInfo.candidate_name || '',
      gender: capitalize(profileDetails.gender || ''),
      maritalStatus: capitalize(profileDetails.marital_status || ''),
      age: calculateAge(candidateInfo.date_of_birth || ''),
      religion: candidateInfo.religion || '',
      sect: candidateInfo.sect || '',
      ethnicity: '',
      caste: candidateInfo.caste || '',
      weight: candidateInfo.weight_kg ? `${candidateInfo.weight_kg}kg` : '',
      height: candidateInfo.height_cm ? `${candidateInfo.height_cm}cm` : '',
      disability: 'No',
      description: `I am ${calculateAge(candidateInfo.date_of_birth || '')} years old ${capitalize(profileDetails.marital_status || '')} ${capitalize(profileDetails.gender || '')}, currently residing in ${candidateInfo.city || ''}, ${candidateInfo.country || ''}. I belong to the ${candidateInfo.religion || ''} (${candidateInfo.sect || ''}) faith. My weight is ${candidateInfo.weight_kg || ''} kg. I am currently ${educationEmployment.employment_status || ''} and working as ${educationEmployment.profession || ''}.`,
      country: candidateInfo.country || '',
      city: candidateInfo.city || '',
      birthCountry: '',
      nationality: '',
      languages: '',
      institute: '',
      degreeTitle: '',
      duration: '',
      employmentStatus: educationEmployment.employment_status || '',
      profession: educationEmployment.profession || '',
      educationLevel: educationEmployment.education_level || '',
      fatherEducation: '',
      fatherEmployment: familyDetails.father_employment_status || '',
      fatherProfession: '',
      fatherDeceased: familyDetails.father_status === 'deceased' ? 'Yes' : 'No',
      motherEducation: '',
      motherEmployment: familyDetails.mother_employment_status || '',
      motherProfession: '',
      motherDeceased: familyDetails.mother_status === 'deceased' ? 'Yes' : 'No',
      brothers: siblingsDetails.total_brothers?.toString() || '0',
      sisters: siblingsDetails.total_sisters?.toString() || '0',
      prefMaritalStatus: '',
      prefAge: '18 - 70 Yrs',
      prefCountry: '',
      prefCity: '',
      prefReligion: '',
      prefCaste: '',
      profilePicture: media.profile_picture || null,
    };
  }, [profileResponse]);

  // State management for profile data
  const [profileData, setProfileData] = useState(mappedProfileData);

  // Update local state when API data changes
  useEffect(() => {
    if (profileResponse?.data) {
      setProfileData(mappedProfileData);
    }
  }, [profileResponse, mappedProfileData]);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleEdit = (section: string) => {
    setEditingSection(section);
    // Initialize edit data with current values
    setEditData({ ...profileData });
  };

  const handleSave = (_section: string) => {
    console.log('editData', editData);
    profileUpdateMutation.mutate({payload: editData}, {
      onSuccess: (res) => {
        console.log("response of profile update===========================",res);
        Toast.show({
          type: "success",
          text1: "Profile updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['profile-view'] });
      },
      onError: (err: any) => {
        console.log("error of profile update===========================",err.response);
      },
    });
    setProfileData({ ...profileData, ...editData });
    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditData({});
  };

  const updateField = (field: string, value: string) => {
    setEditData({ ...editData, [field]: value });
  };

  return (
    <Screen>
      <Header title="My Profile" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Section
          title="Photos"
          onEdit={() => Alert.alert('Photos', 'Photo upload feature coming soon!')}
          isEditing={editingSection === 'Photos'}
          onSave={() => handleSave('Photos')}
          onCancel={handleCancel}>
          <View style={styles.profilePhotoContainer}>
            {profileData.profilePicture ? (
              <Image
                source={{ uri: profileData.profilePicture }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
            <Icon name="person" size={64} color="#D4AF37" />
            )}
            <Pressable style={styles.profileButton}>
              <Text style={styles.profileButtonText}>Profile</Text>
            </Pressable>
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
          <InfoItem
            icon="people"
            label="Gender"
            value={editingSection === 'About' ? editData.gender : profileData.gender}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('gender', text)}
          />
          <InfoItem
            icon="heart"
            label="Marital status"
            value={
              editingSection === 'About' ? editData.maritalStatus : profileData.maritalStatus
            }
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('maritalStatus', text)}
          />
          <InfoItem
            icon="calendar"
            label="Age"
            value={editingSection === 'About' ? editData.age : profileData.age}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('age', text)}
          />
          <InfoItem
            icon="hands"
            label="Religion"
            value={editingSection === 'About' ? editData.religion : profileData.religion}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('religion', text)}
          />
          <InfoItem
            icon="person"
            label="Sect"
            value={editingSection === 'About' ? editData.sect : profileData.sect}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('sect', text)}
          />
          <InfoItem
            icon="hand-left"
            label="Ethnicity"
            value={editingSection === 'About' ? editData.ethnicity : profileData.ethnicity}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('ethnicity', text)}
          />
          <InfoItem
            icon="triangle"
            label="Caste"
            value={editingSection === 'About' ? editData.caste : profileData.caste}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('caste', text)}
          />
          <InfoItem
            icon="scale"
            label="Weight"
            value={editingSection === 'About' ? editData.weight : profileData.weight}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('weight', text)}
          />
          <InfoItem
            icon="resize"
            label="Height"
            value={editingSection === 'About' ? editData.height : profileData.height}
            editable={editingSection === 'About'}
            onChangeText={(text) => updateField('height', text)}
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
            value={editingSection === 'Region' ? editData.country : profileData.country}
            editable={editingSection === 'Region'}
            onChangeText={(text) => updateField('country', text)}
          />
          <InfoItem
            icon="location"
            label="City"
            value={editingSection === 'Region' ? editData.city : profileData.city}
            editable={editingSection === 'Region'}
            onChangeText={(text) => updateField('city', text)}
          />
          <InfoItem
            icon="location"
            label="Birth country"
            value={editingSection === 'Region' ? editData.birthCountry : profileData.country}
            editable={editingSection === 'Region'}
            onChangeText={(text) => updateField('birthCountry', text)}
          />
        </Section>

        <Section
          title="Nationality"
          onEdit={() => handleEdit('Nationality')}
          isEditing={editingSection === 'Nationality'}
          onSave={() => handleSave('Nationality')}
          onCancel={handleCancel}>
          {editingSection === 'Nationality' ? (
            <TextInput
              style={styles.inputField}
              value={editData.nationality || profileData.nationality}
              onChangeText={(text) => updateField('nationality', text)}
              placeholder="Enter nationality"
              placeholderTextColor="#808080"
            />
          ) : (
            <View style={styles.inputField}>
              <Text style={styles.inputPlaceholder}>
                {profileData.nationality || 'Pakistani'}
              </Text>
            </View>
          )}
        </Section>

        <Section
          title="Language(s)"
          onEdit={() => handleEdit('Languages')}
          isEditing={editingSection === 'Languages'}
          onSave={() => handleSave('Languages')}
          onCancel={handleCancel}>
          {editingSection === 'Languages' ? (
            <TextInput
              style={styles.inputField}
              value={editData.languages || profileData.languages}
              onChangeText={(text) => updateField('languages', text)}
              placeholder="Enter languages"
              placeholderTextColor="#808080"
            />
          ) : (
            <View style={styles.inputField}>
              <Text style={styles.inputPlaceholder}>
                {profileData.languages || 'Not specified'}
              </Text>
            </View>
          )}
        </Section>

        <Section
          title="Education"
          onEdit={() => handleEdit('Education')}
          isEditing={editingSection === 'Education'}
          onSave={() => handleSave('Education')}
          onCancel={handleCancel}>
          <InfoItem
            icon="school"
            label="Education Level"
            value={
              editingSection === 'Education' ? editData.educationLevel : profileData.educationLevel
            }
            editable={editingSection === 'Education'}
            onChangeText={(text) => updateField('educationLevel', text)}
          />
          <Text style={styles.subsectionTitle}>Bachelors</Text>
          <InfoItem
            icon="business"
            label="Institute"
            value={editingSection === 'Education' ? editData.institute : profileData.institute}
            editable={editingSection === 'Education'}
            onChangeText={(text) => updateField('institute', text)}
          />
          <InfoItem
            icon="school"
            label="Degree Title"
            value={
              editingSection === 'Education' ? editData.degreeTitle : profileData.degreeTitle
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
          <InfoItem
            icon="briefcase"
            label="Employment status"
            value={
              editingSection === 'Employment'
                ? editData.employmentStatus
                : profileData.employmentStatus
            }
            editable={editingSection === 'Employment'}
            onChangeText={(text) => updateField('employmentStatus', text)}
          />
          <InfoItem
            icon="person"
            label="Profession"
            value={
              editingSection === 'Employment'
                ? editData.profession
                : profileData.profession
            }
            editable={editingSection === 'Employment'}
            onChangeText={(text) => updateField('profession', text)}
          />
        </Section>

        <Section
          title="Accommodation"
          onEdit={() => Alert.alert('Accommodation', 'Feature coming soon!')}>
          <Text style={styles.inputPlaceholder}>No accommodation details available</Text>
        </Section>

        <Section
          title="Parents"
          onEdit={() => handleEdit('Parents')}
          isEditing={editingSection === 'Parents'}
          onSave={() => handleSave('Parents')}
          onCancel={handleCancel}>
          <Text style={styles.subsectionTitle}>Father</Text>
          <InfoItem
            icon="school"
            label="Education Level"
            value={
              editingSection === 'Parents' ? editData.fatherEducation : profileData.fatherEducation
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('fatherEducation', text)}
          />
          <InfoItem
            icon="briefcase"
            label="Employment Status"
            value={
              editingSection === 'Parents'
                ? editData.fatherEmployment
                : profileData.fatherEmployment
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('fatherEmployment', text)}
          />
          <InfoItem
            icon="person"
            label="Profession"
            value={
              editingSection === 'Parents' ? editData.fatherProfession : profileData.fatherProfession
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('fatherProfession', text)}
          />
          <InfoItem
            icon="heart"
            label="Deceased"
            value={
              editingSection === 'Parents' ? editData.fatherDeceased : profileData.fatherDeceased
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('fatherDeceased', text)}
          />

          <Text style={styles.subsectionTitle}>Mother</Text>
          <InfoItem
            icon="school"
            label="Education Level"
            value={
              editingSection === 'Parents' ? editData.motherEducation : profileData.motherEducation
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('motherEducation', text)}
          />
          <InfoItem
            icon="briefcase"
            label="Employment Status"
            value={
              editingSection === 'Parents'
                ? editData.motherEmployment
                : profileData.motherEmployment
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('motherEmployment', text)}
          />
          <InfoItem
            icon="person"
            label="Profession"
            value={
              editingSection === 'Parents' ? editData.motherProfession : profileData.motherProfession
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('motherProfession', text)}
          />
          <InfoItem
            icon="heart"
            label="Deceased"
            value={
              editingSection === 'Parents' ? editData.motherDeceased : profileData.motherDeceased
            }
            editable={editingSection === 'Parents'}
            onChangeText={(text) => updateField('motherDeceased', text)}
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
});


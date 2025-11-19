import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';

interface MoreAboutYouScreenProps {
  navigation: any;
  route: any;
}

export default function MoreAboutYouScreen({ navigation, route }: MoreAboutYouScreenProps) {
  const profileData = route?.params?.profileData || {};
  const [generatedText, setGeneratedText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const maxCharacters = 1000;

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  useEffect(() => {
    // Generate paragraph based on profile data
    const paragraph = generateProfileParagraph(profileData);
    setGeneratedText(paragraph);
    setCharacterCount(paragraph.length);
  }, []);

  const generateProfileParagraph = (data: any): string => {
    let paragraph = '';

    // Age calculation from date of birth
    let age = '';
    if (data.dateOfBirth) {
      try {
        // Handle DD/MM/YYYY format
        const [day, month, year] = data.dateOfBirth.split('/');
        const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        age = `${calculatedAge}`;
      } catch (e) {
        // If date parsing fails, skip age
      }
    }

    // Gender
    if (data.gender) {
      paragraph += age ? `I am ${age} ` : 'I am ';
      paragraph += data.maritalStatus || 'Single';
      paragraph += ` ${data.gender}. `;
    }

    // Location
    if (data.city && data.country) {
      paragraph += `Currently residing in ${data.city}, ${data.country}. `;
    } else if (data.city) {
      paragraph += `Currently residing in ${data.city}. `;
    } else if (data.country) {
      paragraph += `Currently residing in ${data.country}. `;
    }

    // Religion
    if (data.religion) {
      paragraph += `I belong to the ${data.religion}`;
      if (data.sect) {
        paragraph += ` (${data.sect})`;
      }
      paragraph += ' faith. ';
    }

    // Weight
    if (data.weight) {
      paragraph += `My weight is ${data.weight} kg. `;
    }

    // Employment and Profession
    if (data.employmentStatus || data.profession) {
      paragraph += `I am currently `;
      if (data.employmentStatus) {
        paragraph += data.employmentStatus;
        if (data.profession) {
          paragraph += ` and working as a ${data.profession}`;
        }
      } else if (data.profession) {
        paragraph += `working as a ${data.profession}`;
      }
      paragraph += '. ';
    }

    // Closing statement
    paragraph += "I'm looking for a partner who shares my values and interests, as I believe mutual understanding is key to a strong relationship.";

    return paragraph.trim();
  };

  const handleTextChange = (text: string) => {
    if (text.length <= maxCharacters) {
      setGeneratedText(text);
      setCharacterCount(text.length);
    }
  };

  const handleAccept = () => {
    // Navigate to Main (Home Screen)
    navigation.replace('Main');
  };

  const handleReject = () => {
    // Go back to profile setup or allow editing
    navigation.goBack();
  };

  return (
    <Screen>
      <Header title="More About You" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>More About You</Text>

        <View style={styles.textContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            value={generatedText}
            onChangeText={handleTextChange}
            placeholder="Your description will appear here..."
            placeholderTextColor="#8C8A9A"
            maxLength={maxCharacters}
          />
          <Text style={styles.characterCount}>
            {characterCount} / {maxCharacters}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable onPress={handleReject} style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>✕</Text>
          </Pressable>
          <Pressable onPress={handleAccept} style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>✓</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backArrow: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
  },
  placeholder: {
    width: 24,
  },
  textContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  textInput: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 180,
    lineHeight: 20,
  },
  characterCount: {
    fontSize: 12,
    color: '#8C8A9A',
    textAlign: 'right',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#8C8A9A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});


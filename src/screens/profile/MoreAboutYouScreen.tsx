import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import { useProfileParagraph } from '../../service/Hooks/User_Profile_Hook';

interface MoreAboutYouScreenProps {
  navigation: any;
  route: any;
}

export default function MoreAboutYouScreen({ navigation, route }: MoreAboutYouScreenProps) {
  const profileData = route?.params?.profileData || {};
  const [generatedText, setGeneratedText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const maxCharacters = 1000;

  // ⬅️ Import your mutation hook
  const {
    mutateAsync: getParagraph,
    data,
    isPending,
    isError
  } = useProfileParagraph();
  console.log('Paraaaa',data)
  const handleBack = () => {
    navigation.navigate('ProfileSetup');
  };

  useEffect(() => {
 
    // Step 2: Call API as soon as screen opens
    getParagraph({}, {
      onSuccess: (res: any) => {
        // Update paragraph from API response
        console.log('generated_description',res)
        if (res?.generated_description) {
          setGeneratedText(res.generated_description);
          setCharacterCount(res.generated_description.length);
        }
      },
    });

  }, [getParagraph]);

  const handleTextChange = (text) => {
    if (text.length <= maxCharacters) {
      setGeneratedText(text);
      setCharacterCount(text.length);
    }
  };

  const handleAccept = () => navigation.replace('Main');
  const handleReject = () => navigation.goBack();
  
  return (
    <Screen>
      <Header title="More About You" onBack={handleBack} />
  
      {isPending ? (
        <View style={{ flex:1,justifyContent:'center',alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text>Generating description...</Text>
        </View>
      ) : (
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
      )}
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
    marginBottom: 20,
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


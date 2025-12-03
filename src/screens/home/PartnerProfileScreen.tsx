import React from 'react';
import {
  Text,
  Pressable,
  View,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';

export default function PartnerProfileScreen({ navigation, route }: any) {
  const { data } = route.params ?? {};
  console.log('user_______data------------>>>>', data);
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <View>
      <Header onBack={handleBack} />
      <ImageBackground
        source={{ uri: data?.profile_picture }}
        style={{
          height: '90%',
          width: '100%',
          justifyContent: 'center',
          // alignItems: 'center',
          borderRadius: 100,
        }}
        // blurRadius={1}
        resizeMode="cover"
      >
        <Text>sddsdsdsds</Text>
      </ImageBackground>
      {/* <Text style={styles.title}>Partner Profile #{id}</Text>
      <Text style={styles.info}>Education: BSc CS</Text>
      <Text style={styles.info}>Profession: Engineer</Text>
      <View style={{ height: 16 }} />
      <Pressable
        onPress={() => navigation.navigate('Chat', { id })}
        style={styles.primary}
      >
        <Text style={styles.primaryText}>Chat</Text>
      </Pressable>
      <View style={{ height: 8 }} />
      <Pressable
        onPress={() => navigation.navigate('Call', { id })}
        style={styles.secondary}
      >
        <Text style={styles.secondaryText}>Call</Text>
      </Pressable>
      <View style={{ height: 8 }} />
      <Pressable style={styles.ghost}>
        <Text style={styles.ghostText}>Block / Report</Text>
      </Pressable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700' },
  info: { color: '#FFFFFF', marginTop: 6, opacity: 0.8 },
  primary: {
    backgroundColor: '#D4AF37',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryText: { color: '#000000', fontWeight: '700' },
  secondary: {
    backgroundColor: '#D4AF37',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryText: { color: '#000000', fontWeight: '700' },
  ghost: {
    borderColor: '#D4AF37',
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  ghostText: { color: '#D4AF37', fontWeight: '700' },
});

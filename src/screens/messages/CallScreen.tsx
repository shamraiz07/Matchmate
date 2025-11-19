import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';

export default function CallScreen({ navigation, route }: any) {
  const { type = 'audio', id } = route.params ?? {};
  
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  return (
    <Screen>
      <Header 
        title={`${type === 'video' ? 'Video' : 'Audio'} Call`} 
        onBack={handleBack}
      />
      <View style={styles.container}>
        <Text style={styles.callType}>
          {type === 'video' ? 'Video' : 'Audio'} Call
        </Text>
        <Text style={styles.userInfo}>with User #{id}</Text>
      </View>
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.endButton}>
        <Text style={styles.endButtonText}>End Call</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callType: { color: '#D4AF37', fontSize: 22, fontWeight: '700' },
  userInfo: { color: '#FFFFFF', marginTop: 8, opacity: 0.8 },
  endButton: {
    backgroundColor: '#E14D4D',
    padding: 14,
    borderRadius: 40,
    alignSelf: 'center',
    width: 140,
    alignItems: 'center',
    marginBottom: 20,
  },
  endButtonText: { color: '#FFFFFF', fontWeight: '700' },
});


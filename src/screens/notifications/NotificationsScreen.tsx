import React from 'react';
import { Text, FlatList, View, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';

export default function NotificationsScreen({ navigation }: any) {
  const items = [
    { id: '1', text: 'No notifications found' },
    // { id: '2', text: 'Subscription discount 20% off' },
  ];
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };
  return (
    <Screen>
      <Header title="Notifications" onBack={handleBack} />
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.text}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700',
    height: 40,
    marginTop: '10%'},
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  cardText: { color: '#FFFFFF' },
});


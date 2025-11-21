import React from 'react';
import { Text, Pressable, FlatList, View, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import { useAuthStore } from '../../store/Auth_store';
import { useProfileView } from '../../service/Hooks/User_Profile_Hook';
const MOCK_MATCHES = Array.from({ length: 8 }).map((_, i) => ({
  id: String(i + 1),
  name: `Ayesha ${i + 1}`,
  age: 24 + i,
  city: 'Lahore',
}));

export default function HomeScreen({ navigation }: any) {
  const user = useAuthStore((state) => state.user);
  console.log('user in home screen', user);
  const { data: profileData } = useProfileView();
  console.log('profile data in home screen', JSON.stringify(profileData));
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Pressable onPress={() => navigation.navigate('Preferences')}>
          <Text style={styles.filterText}>Filters</Text>
        </Pressable>
      </View>
      <FlatList
        data={MOCK_MATCHES}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Chat', { id: item.id })}
            style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>
              {item.age} • {item.city}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    marginTop: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700' },
  filterText: { color: '#D4AF37' },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  cardTitle: { color: '#FFFFFF', fontWeight: '700' },
  cardSubtitle: { color: '#FFFFFF', opacity: 0.7 },
});


import React from 'react';
import {
  Text,
  Pressable,
  FlatList,
  View,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import Screen from '../../components/Screen';
import { useAuthStore } from '../../store/Auth_store';
import {
  useProfileMatch,
  useProfileView,
} from '../../service/Hooks/User_Profile_Hook';
import {
  useSee_SendConnection_to_user,
  useSeeAllFriendConnection,
} from '../../service/Hooks/User_Connection_Hook';
import { useUserConnection } from '../../store/User_Connection_store';

export default function HomeScreen({ navigation }: any) {
  // const user = useAuthStore((state) => state.user);
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const setUserSeeConnection = useUserConnection(s => s.setUserSeeConnection);
  const setuserAllConnection = useUserConnection(s => s.setuserAllConnection);
  console.log('user in home screen', user);
  const { data: SeeConnection } = useSee_SendConnection_to_user();
  const { data: SeeAllFriendConnection } = useSeeAllFriendConnection();
  console.log(
    'see connection----------------------->>>>>>>>>>>>>>>>>>',
    SeeConnection,
    'see All connection----------------------->>>>>>>>>>>>>>>>>>',
    SeeAllFriendConnection,
  );
  setuserAllConnection(SeeAllFriendConnection?.data);
  setUserSeeConnection(SeeConnection?.data);
  const { data: profileData, isLoading: loading1 } = useProfileView();
  const { data: profileMatch, isLoading: loading2 } = useProfileMatch();
  setUser(profileData?.data);
  const MOCK_MATCHES = profileMatch?.results;
  // ✅ Correct loading condition
  if (loading1 || loading2) {
    return <Text>Loading...</Text>;
  }
  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return '';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  };
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
            onPress={() =>
              navigation.navigate('Partnerprofile', { data: item })
            }
            style={styles.card}
          >
            <ImageBackground
              source={{ uri: item?.profile_picture }}
              style={{
                height: '100%',
                width: '100%',
                justifyContent: 'center',
                // alignItems: 'center',
                // borderRadius: 120,
              }}
              blurRadius={1}
              resizeMode="cover"
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: '800',
                  textAlign: 'center',
                  textShadowColor: 'rgba(0, 0, 0, 0.9)',
                  textShadowOffset: { width: 2, height: 2 },
                  textShadowRadius: 6,
                }}
              >
                {item?.candidate_name}
              </Text>
              <View style={styles.main_head_boxed}>
                <View style={styles.head_boxed}>
                  <Text style={styles.head_boxed_text}>
                    {item?.marital_status}
                  </Text>
                </View>
                <View style={styles.head_boxed}>
                  <Text style={styles.head_boxed_text}>
                    {calculateAge(item?.date_of_birth || '')}
                  </Text>
                </View>
                <View style={styles.head_boxed}>
                  <Text style={styles.head_boxed_text}>{item?.caste}</Text>
                </View>
                <View style={styles.head_boxed}>
                  <Text style={styles.head_boxed_text}>{item?.city}</Text>
                </View>
                <View style={styles.head_boxed}>
                  <Text style={styles.head_boxed_text}>
                    {item?.education_level}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        )}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: 10,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          // borderWidth:2,
          // borderColor:'white'
        }}
        numColumns={2}
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
    borderWidth: 0.75,
    borderColor: '#D4AF37',
    padding: 10,
    height: 240,
    margin: 4,
    width: 180,
    borderRadius: 12,
    // marginTop: 12,
  },
  cardTitle: { color: '#FFFFFF', fontWeight: '700' },
  cardSubtitle: { color: '#FFFFFF', opacity: 0.7 },
  head_boxed: {
    backgroundColor: 'white',
    width: 50,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
  },
  main_head_boxed: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  head_boxed_text: {
    textAlign: 'center',
  },
});

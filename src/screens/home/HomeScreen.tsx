import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  Pressable,
  FlatList,
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
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
import { useFocusEffect } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import { useFCM_Token_Register } from '../../service/Hooks/User_Profile_Hook';
import { notificationService } from '../../service/Notifications/NotificationService';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16; // Horizontal padding of screen
const CARD_GAP = 8; // Gap between cards
const CARD_MARGIN = 4; // Margin around each card
// Calculate card width: (screen width - padding - gaps - margins) / 2
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP - CARD_MARGIN * 4) / 2;

export default function HomeScreen({ navigation }: any) {
  // const user = useAuthStore((state) => state.user);
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const {mutateAsync: registerFcmMutate, isLoading} = useFCM_Token_Register();
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
  const { data: profileData, isLoading: loading1, refetch: refetchProfile } = useProfileView();
  const { data: profileMatch, isLoading: loading2, refetch: refetchMatches } = useProfileMatch();
  const requestUserPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
  
      console.log('Notification Permission:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };
  
  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('🔥 FCM TOKEN:', token);
      registerFcmMutate(
        { payload: { fcm_token: token ,device_type:'android'} },
        {
          onSuccess: (response) => {
            console.log('🔥 FCM Token Registered:', response);
          },
          onError: (error) => {
            console.log('❌ FCM Token Registration Error:', error);
          }
        }
      );
    } catch (error) {
      console.log('❌ FCM Token Error:', error);
    }
  };
  
  useEffect(() => {
    const init = async () => {
      useAuthStore.getState().hydrate();

      const permissionGranted = await requestUserPermission();

      if (permissionGranted) {
        await getFcmToken();
        notificationService.initialize();
      } else {
        console.log('❌ Notification permission denied');
      }
    };

    init();
  },[]);
  // Refetch profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Refetch profile data to get updated information
      refetchProfile();
      refetchMatches();
    }, [refetchProfile, refetchMatches])
  );
  
  setUser(profileData?.data);
  const MOCK_MATCHES = profileMatch?.results;
  console.log('MOCK_MATCHES', MOCK_MATCHES);
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
  if (isLoading) {
    return <ActivityIndicator size="large" color="#D4AF37" />;
  }
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
              style={styles.imageBackground}
              blurRadius={item?.is_public ? 1 : 0}
              resizeMode="cover"
            >
              <Text style={styles.cardTitleText}>
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
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    marginTop: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING,
  },
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700' },
  filterText: { color: '#D4AF37' },
  listContent: {
    paddingHorizontal: CARD_PADDING,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 0.75,
    borderColor: '#D4AF37',
    padding: 8,
    height: 240,
    borderRadius: 12,
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
    overflow: 'hidden',
  },
  imageBackground: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
  },
  cardTitleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    marginBottom: 8,
  },
  cardTitle: { color: '#FFFFFF', fontWeight: '700' },
  cardSubtitle: { color: '#FFFFFF', opacity: 0.7 },
  head_boxed: {
    backgroundColor: 'white',
    width: 50,
    height: 25,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
  },
  main_head_boxed: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    rowGap: 10,
    justifyContent: 'center',
  },
  head_boxed_text: {
    color: '#2B2A2A',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 10,
  },
});

import React from 'react';
import {
  Text,
  Pressable,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSendConnection } from '../../service/Hooks/User_Connection_Hook';
import Toast from 'react-native-toast-message';
import { useUserConnection } from '../../store/User_Connection_store';

export default function PartnerProfileScreen({ navigation, route }: any) {
  const { data } = route.params ?? {};
  const Send_Connection_mutation = useSendConnection();
  const SeeConnection = useUserConnection(state => state.userSeeConnection);
  const AllConnectionFriend = useUserConnection(
    state => state.userAllConnection,
  );
  console.log(
    'user_______data------------>>>>',
    data,
    'userSeeConnection------------------------>>>>>>>>>>>>>',
    SeeConnection,
    'userSeeALLConnection------------------------>>>>>>>>>>>>>',
    AllConnectionFriend,
  );
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };
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

  const SendConnectionHandle = () => {
    try {
      const payload = {
        to_user_id: data?.user_id,
      };
      Send_Connection_mutation.mutateAsync(
        { payload },
        {
          onSuccess: res => {
            Toast.show({
              type: 'success',
              text1: 'Connection send successfully',
            });
          },
          onError: err => {
            console.log('error', err, JSON.stringify(err));
          },
        },
      );
    } catch (error) {
      console.log('Errorrr_send_Connection', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
      });
    }
  };
  const pendingRequests = SeeConnection || [];
  const allFriends = AllConnectionFriend || [];

  // Check if user is already in accepted friend list
  const alreadyFriend = allFriends.some(
    item => item?.status === 'approved'  && item?.friend?.id === data?.user_id,
  );

  // Check if user already sent a pending request
  const alreadySent = pendingRequests.some(
    req =>
      req.direction === 'sent' &&
      req.status === 'pending' &&
      req.friend?.id === data?.user_id,
  );
  return (
    <View>
      <Header onBack={handleBack} />
      <ImageBackground
        source={{ uri: data?.profile_picture }}
        style={{
          height: '90%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 60,
          overflow: 'hidden',
          borderTopColor: 'white',
          borderTopWidth: 1,
        }}
        blurRadius={1}
        resizeMode="cover"
      >
        <Text style={styles.info}>
          {data.first_name} {data.last_name}
        </Text>
        <View>
          <View style={styles.main_head_boxed}>
            <View style={styles.head_boxed}>
              <Icon name={'mars'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>{data?.marital_status}</Text>
            </View>
            <View style={styles.head_boxed}>
              <FontAwesome
                name={'clock-rotate-left'}
                size={15}
                color={'white'}
              />
              <Text style={styles.head_boxed_text}>
                {calculateAge(data?.date_of_birth || '')}
              </Text>
            </View>
            <View style={styles.head_boxed}>
              <Feather name={'cast'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>{data?.caste}</Text>
            </View>
            <View style={styles.head_boxed}>
              <FontAwesome name={'user-tie'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>{data?.city}</Text>
            </View>
            <View style={styles.head_boxed}>
              <FontAwesome name={'graduation-cap'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>
                {data?.education_level}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.profile_lastboxed}>
          <TouchableOpacity style={styles.main_upper_box}>
            <View style={styles.images_boxed}>
              <Icon name={'image'} size={25} color={'white'} />
            </View>
            <Text style={styles.main_upper_box_text}>Image</Text>
          </TouchableOpacity>
          {!alreadyFriend && (
            <TouchableOpacity
              style={[styles.main_upper_box, alreadySent && { opacity: 0.4 }]}
              disabled={alreadySent}
              onPress={() => {
                if (!alreadySent) SendConnectionHandle();
              }}
            >
              <View style={styles.images_heart_boxed}>
                <Entypo name={'heart-outlined'} size={40} color={'#E83C91'} />
              </View>

              <Text style={styles.main_upper_box_text}>
                {alreadySent ? 'Pending...' : 'Connect'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.main_upper_box}>
            <View style={styles.images_boxed}>
              <Ionicons name={'chatbox-outline'} size={25} color={'white'} />
            </View>
            <Text style={styles.main_upper_box_text}>Chat</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: '#D4AF37', fontSize: 22, fontWeight: '700' },
  info: { color: '#FFFFFF', fontSize: 22 },
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
    backgroundColor: 'rgba(0,0,0,0.4)', // soft black
    width: '25%',
    gap: 5,
    padding: 10,
    borderRadius: 8,
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  main_head_boxed: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: 5,
  },
  head_boxed_text: {
    color: 'white',
    textAlign: 'center',
  },
  profile_lastboxed: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    height: '12%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', // soft black
    gap: 15,
    flexDirection: 'row',
    bottom: '18%',
    borderColor: 'white',
  },
  images_boxed: {
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)', // soft black
    width: 70,
    height: 70,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  images_heart_boxed: {
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 70,
    height: 70,
    borderRadius: 100,
    alignItems: 'center',
    // 🌸 Smooth soft pink glow
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 12,

    // Android
    elevation: 24,
  },
  main_upper_box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  main_upper_box_text: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '800',
  },
});

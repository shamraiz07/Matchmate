import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import {
  useAcceptConnection,
  useRejectConnection,
} from '../../service/Hooks/User_Connection_Hook';
import Toast from 'react-native-toast-message';
import { BASE_URL_IMAGE } from '../../constants/config';
import { useQueryClient } from '@tanstack/react-query';

export default function ConnectionRequestDetailScreen({ navigation, route }: any) {
  const { connectionRequest } = route.params ?? {};
  const queryClient = useQueryClient();
  const Accept_mutation = useAcceptConnection();
  const Reject_mutation = useRejectConnection();

  // Extract friend data from connection request
  const data = connectionRequest?.friend || connectionRequest || {};

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

  const AcceptConnectionHandle = () => {
    try {
      if (Accept_mutation.isPending) {
        return;
      }

      const payload = {
        connection_id: connectionRequest?.connection_id,
      };

      Accept_mutation.mutateAsync(
        { payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['SeeAllConnected'] });
            queryClient.invalidateQueries({ queryKey: ['SeeAllFriendConnectionByOthers'] });
            Toast.show({
              type: 'success',
              text1: 'Connection Accepted',
              text2: 'You are now connected with this user',
            });
            // Navigate back after accepting
            navigation.goBack();
          },
          onError: (err: any) => {
            console.log('error accepting connection', err);
            const errorMessage =
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              'Failed to accept connection request';
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: errorMessage,
            });
          },
        },
      );
    } catch (error) {
      console.log('Errorrr_AcceptConnectionHandle', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred',
      });
    }
  };

  const RejectConnectionHandle = () => {
    try {
      if (Reject_mutation.isPending) {
        return;
      }

      const payload = {
        connection_id: connectionRequest?.connection_id,
      };

      Reject_mutation.mutateAsync(
        { payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['SeeAllConnected'] });
            queryClient.invalidateQueries({ queryKey: ['SeeAllFriendConnectionByOthers'] });
            Toast.show({
              type: 'success',
              text1: 'Connection Rejected',
              text2: 'The connection request has been rejected',
            });
            // Navigate back after rejecting
            navigation.goBack();
          },
          onError: (err: any) => {
            console.log('error rejecting connection', err);
            const errorMessage =
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              'Failed to reject connection request';
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: errorMessage,
            });
          },
        },
      );
    } catch (error) {
      console.log('Errorrr_RejectConnectionHandle', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred',
      });
    }
  };

  const isAccepting = Accept_mutation.isPending;
  const isRejecting = Reject_mutation.isPending;

  const getProfileImageUrl = (profile_picture?: string) => {
    if (!profile_picture) return null;

    // already full URL
    if (profile_picture.startsWith('http://') || profile_picture.startsWith('https://')) {
      return profile_picture;
    }

    // relative path → add base url
    return `${BASE_URL_IMAGE}${profile_picture}`;
  };

  return (
    <View>
      <Header onBack={handleBack} />
      <ImageBackground
        source={{
          uri: getProfileImageUrl(data?.profile?.profile_picture) ||
            'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d'
        }}
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
        blurRadius={data?.is_public === true ? 0 : 1}
        resizeMode="cover"
      >
        <Text style={styles.info}>
          {data?.first_name || ''} {data?.last_name || ''}
        </Text>
        <View>
          <View style={styles.main_head_boxed}>
            <View style={styles.head_boxed}>
              <Icon name={'mars'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>
                {data?.profile?.marital_status || 'N/A'}
              </Text>
            </View>
            <View style={styles.head_boxed}>
              <FontAwesome name={'clock-rotate-left'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>
                {calculateAge(data?.profile?.date_of_birth)}
              </Text>
            </View>
            <View style={styles.head_boxed}>
              <Feather name={'cast'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>
                {data?.profile?.caste || 'N/A'}
              </Text>
            </View>
            <View style={styles.head_boxed}>
              <FontAwesome name={'user-tie'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>
                {data?.profile?.city || 'N/A'}
              </Text>
            </View>
            <View style={styles.head_boxed}>
              <FontAwesome name={'graduation-cap'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>
                {data?.profile?.education_level || 'N/A'}
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

          {/* Accept Button */}
          <TouchableOpacity
            style={styles.main_upper_box}
            onPress={AcceptConnectionHandle}
            disabled={isAccepting || isRejecting}
          >
            <View style={styles.images_heart_boxed}>
              {isAccepting ? (
                <ActivityIndicator size="large" color="#4CAF50" />
              ) : (
                <Entypo name={'check'} size={40} color={'#4CAF50'} />
              )}
            </View>
            <Text style={styles.main_upper_box_text}>
              {isAccepting ? 'Accepting...' : 'Accept'}
            </Text>
          </TouchableOpacity>

          {/* Reject Button */}
          <TouchableOpacity
            style={styles.main_upper_box}
            onPress={RejectConnectionHandle}
            disabled={isAccepting || isRejecting}
          >
            <View style={[styles.images_boxed, styles.rejectButtonBox]}>
              {isRejecting ? (
                <ActivityIndicator size="large" color="#FF4444" />
              ) : (
                <Entypo name={'cross'} size={40} color={'#FF4444'} />
              )}
            </View>
            <Text style={styles.main_upper_box_text}>
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Text>
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
  },
  cardTitle: { color: '#FFFFFF', fontWeight: '700' },
  cardSubtitle: { color: '#FFFFFF', opacity: 0.7 },
  head_boxed: {
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    gap: 15,
    flexDirection: 'row',
    bottom: '18%',
    borderColor: 'white',
  },
  images_boxed: {
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 24,
  },
  rejectButtonBox: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderColor: '#FF4444',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  modalTitle: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancel: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  modalConfirm: {
    flex: 1,
    marginLeft: 10,
    padding: 12,
    backgroundColor: '#D4AF37',
    borderRadius: 10,
  },
  modalCancelText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  modalConfirmText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledImageBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderColor: '#666666',
  },
  disabledText: {
    color: '#666666',
    opacity: 0.7,
  },
});

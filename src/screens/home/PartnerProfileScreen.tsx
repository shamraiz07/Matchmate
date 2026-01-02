import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useRemove_userConnection,
  useSendConnection,
  useCancel_userConnection,
  useAcceptConnection,
  useRejectConnection,
  useSeeAllFriendConnectionByOthers,
} from '../../service/Hooks/User_Connection_Hook';
import Toast from 'react-native-toast-message';
import { useUserConnection } from '../../store/User_Connection_store';
import {
  useSee_SendConnection_to_user,
  useSeeAllFriendConnection,
} from '../../service/Hooks/User_Connection_Hook';
import { useAuthStore } from '../../store/Auth_store';
import { BASE_URL_IMAGE } from '../../constants/config';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native';

export default function PartnerProfileScreen({ navigation, route }: any) {
  const { data } = route.params ?? {};
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [localPendingRequest, setLocalPendingRequest] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values for the info button
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const queryClient = useQueryClient();
  const Send_Connection_mutation = useSendConnection();
  const Remove_Connection_mutation = useRemove_userConnection();
  const Cancel_Connection_mutation = useCancel_userConnection();
  const SeeConnection = useUserConnection(state => state.userSeeConnection);
  const AllConnectionFriend = useUserConnection(
    state => state.userAllConnection,
  );
  const setUserSeeConnection = useUserConnection(s => s.setUserSeeConnection);
  const setuserAllConnection = useUserConnection(s => s.setuserAllConnection);
  const { refetch: refetchSeeConnection } = useSee_SendConnection_to_user();
  const { refetch: refetchAllFriendConnection } = useSeeAllFriendConnection();
  const { data: receivedConnectionRequestsData, refetch: refetchReceivedConnections } = useSeeAllFriendConnectionByOthers();
  const Accept_Connection_mutation = useAcceptConnection();
  const Reject_Connection_mutation = useRejectConnection();
  const currentUser = useAuthStore(state => state.user);
  const currentUserId = currentUser?.meta?.user_id || currentUser?.user_id || currentUser?.id;
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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refetch connection-related queries to get latest connection status
      const [seeConnectionResult, allFriendConnectionResult] = await Promise.all([
        refetchSeeConnection(),
        refetchAllFriendConnection(),
        refetchReceivedConnections(),
      ]);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['SendConnection_to_user'] });
      queryClient.invalidateQueries({ queryKey: ['SeeAllConnection'] });
      queryClient.invalidateQueries({ queryKey: ['SeeAllConnected'] });
      queryClient.invalidateQueries({ queryKey: ['SeeAllConnectedFriend'] });
      
      // Update the Zustand store with fresh data
      if (seeConnectionResult?.data) {
        setUserSeeConnection(seeConnectionResult.data?.data);
      }
      if (allFriendConnectionResult?.data) {
        setuserAllConnection(allFriendConnectionResult.data?.data);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
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
      // Check if request is already pending
      if (alreadySent || localPendingRequest) {
        Toast.show({
          type: 'info',
          text1: 'Request Already Sent',
          text2: 'You have already sent a connection request to this user',
        });
        return;
      }

      // Check if mutation is already in progress
      if (Send_Connection_mutation.isPending) {
        return;
      }

      // Get the user ID from various possible fields (same logic as Chat navigation)
      const userId =
        data?.user_id ||
        data?.friend?.id ||
        data?.id ||
        data?.friend?.user_id;

      // Validate that user_id exists
      if (!userId) {
        console.error('Cannot send connection: User ID is missing', data);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User information is missing',
        });
        return;
      }

      // Prevent self-connection
      if (currentUserId && String(userId) === String(currentUserId)) {
        console.error('Cannot send connection: Cannot connect to yourself');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'You cannot send a connection request to yourself',
        });
        return;
      }

      // Ensure user_id is a number (server might expect integer)
      const userIdNumber = Number(userId);
      if (isNaN(userIdNumber) || userIdNumber <= 0) {
        console.error('Invalid user ID:', userId);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Invalid user information',
        });
        return;
      }

      const payload = {
        to_user_id: userIdNumber,
      };

      console.log('Sending connection request:', {
        payload,
        currentUserId,
        targetUserId: userIdNumber,
        originalUserId: userId,
      });

      Send_Connection_mutation.mutateAsync(
        { payload },
        {
          onSuccess: (res: any) => {
            console.log('Connection request response:', res);
            
            // Extract response data
            const responseData = res?.data || res?.response?.data || res;
            
            // If response has pending status, store it locally
            if (responseData?.status === 'pending') {
              setLocalPendingRequest(responseData);
            }
            
            // Invalidate queries to refresh connection list
            queryClient.invalidateQueries({ queryKey: ['SendConnection_to_user'] });
            queryClient.invalidateQueries({ queryKey: ['SeeAllConnection'] });
            
            Toast.show({
              type: 'success',
              text1: 'Connection Request Sent',
              text2: 'Your connection request has been sent successfully',
            });
          },
          onError: (err: any) => {
            console.log('Connection request error:', err);
            console.log('Error response:', err?.response);
            console.log('Error data:', err?.response?.data);
            console.log('Error status:', err?.response?.status);
            
            // Handle HTML error responses (server returning HTML instead of JSON)
            let errorMessage = 'Failed to send connection request';
            let errorTitle = 'Connection Request Failed';
            
            if (err?.response) {
              const status = err.response.status;
              const responseData = err.response.data;
              
              // Check if response is HTML (server error page)
              if (typeof responseData === 'string' && responseData.includes('<!doctype html>')) {
                if (status === 500) {
                  errorMessage = 'Server error occurred. The server encountered an unexpected error. Please try again later or contact support.';
                  errorTitle = 'Server Error (500)';
                } else {
                  errorMessage = `Server error (${status}). Please try again later.`;
                  errorTitle = `Server Error (${status})`;
                }
              } else if (typeof responseData === 'object' && responseData !== null) {
                // Handle JSON error responses
                if (responseData.message) {
                  errorMessage = responseData.message;
                } else if (responseData.error) {
                  errorMessage = responseData.error;
                } else if (responseData.detail) {
                  errorMessage = responseData.detail;
                } else if (responseData.non_field_errors) {
                  errorMessage = Array.isArray(responseData.non_field_errors) 
                    ? responseData.non_field_errors.join(', ')
                    : responseData.non_field_errors;
                }
              } else if (typeof responseData === 'string') {
                errorMessage = responseData;
              }
              
              // Add status-specific messages
              if (status === 400) {
                errorTitle = 'Invalid Request';
              } else if (status === 401) {
                errorTitle = 'Authentication Error';
                errorMessage = 'Please log in again';
              } else if (status === 403) {
                errorTitle = 'Permission Denied';
              } else if (status === 404) {
                errorTitle = 'Not Found';
                errorMessage = 'User not found';
              } else if (status === 500) {
                errorTitle = 'Server Error';
              }
            } else if (err?.message) {
              errorMessage = err.message;
            }

            Toast.show({
              type: 'error',
              text1: errorTitle,
              text2: errorMessage,
              visibilityTime: 4000,
            });
          },
        },
      );
    } catch (error) {
      console.log('Errorrr_send_Connection', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred',
      });
    }
  };
  const RemoveConnectionHandle = () => {
    try {
      const payload = {
        connection_id: data?.connection_id,
      };
      Remove_Connection_mutation.mutateAsync(
        { payload },
        {
          onSuccess: () => {
            Toast.show({
              type: 'success',
              text1: 'Remove Connection successfully',
            });
            navigation.navigate('Main');
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

  // Get connection data first
  const pendingRequests = SeeConnection || [];
  const allFriends = AllConnectionFriend || [];
  const receivedConnectionRequests = receivedConnectionRequestsData?.data || [];

  // Get the user ID to check against
  const targetUserId =
    data?.user_id || data?.friend?.id || data?.id || data?.friend?.user_id;

  // Check if user already sent a pending request and get the request object
  const pendingRequest = pendingRequests.find(
    (req: any) =>
      req.direction === 'sent' &&
      req.status === 'pending' &&
      (req.friend?.id === targetUserId ||
        req.friend?.id === data?.user_id ||
        req.friend?.id === data?.friend?.id ||
        req.friend?.id === data?.id),
  );

  // Use local pending request if available, otherwise use the one from store
  const activePendingRequest = localPendingRequest || pendingRequest;

  // Check if current user received a connection request from the target user
  const receivedRequest = receivedConnectionRequests.find(
    (req: any) =>
      req.status === 'pending' &&
      (req.friend?.id === targetUserId ||
        req.friend?.user_id === targetUserId ||
        req.friend?.id === data?.user_id ||
        req.friend?.id === data?.friend?.id ||
        req.friend?.id === data?.id),
  );

  const CancelConnectionHandle = () => {
    try {
      const connectionId = activePendingRequest?.connection_id || activePendingRequest?.id;
      
      if (!connectionId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Connection request not found',
        });
        return;
      }

      const payload = {
        connection_id: connectionId,
      };

      Cancel_Connection_mutation.mutateAsync(
        { payload },
        {
          onSuccess: () => {
            // Clear local pending request
            setLocalPendingRequest(null);
            
            // Invalidate queries to refresh the connection list
            queryClient.invalidateQueries({ queryKey: ['SendConnection_to_user'] });
            queryClient.invalidateQueries({ queryKey: ['SeeAllConnection'] });
            
            Toast.show({
              type: 'success',
              text1: 'Connection Request Cancelled',
              text2: 'Your connection request has been cancelled',
            });
            
            // Note: Not navigating away, just updating UI state
          },
          onError: (err: any) => {
            console.log('error cancelling connection', err);
            const errorMessage =
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              'Failed to cancel connection request';
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: errorMessage,
            });
          },
        },
      );
    } catch (error) {
      console.log('Errorrr_cancel_Connection', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred',
      });
    }
  };

  // Check if user is already in accepted friend list
  const alreadyFriend = allFriends.some(
    (item: any) =>
      item?.status === 'approved' &&
      (item?.friend?.id === targetUserId ||
        item?.friend?.user_id === targetUserId ||
        item?.friend?.id === data?.user_id ||
        item?.friend?.id === data?.friend?.id),
  );

  const alreadySent = !!activePendingRequest;
  const hasReceivedRequest = !!receivedRequest;
  const isSendingRequest = Send_Connection_mutation.isPending;
  const isCancellingRequest = Cancel_Connection_mutation.isPending;
  const isAcceptingRequest = Accept_Connection_mutation.isPending;
  const isRejectingRequest = Reject_Connection_mutation.isPending;

  const AcceptConnectionHandle = () => {
    try {
      const connectionId = receivedRequest?.connection_id || receivedRequest?.id;
      
      if (!connectionId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Connection request not found',
        });
        return;
      }

      const payload = {
        connection_id: connectionId,
      };

      Accept_Connection_mutation.mutateAsync(
        { payload },
        {
          onSuccess: () => {
            // Invalidate queries to refresh the connection list
            queryClient.invalidateQueries({ queryKey: ['SeeAllConnected'] });
            queryClient.invalidateQueries({ queryKey: ['SeeAllConnection'] });
            queryClient.invalidateQueries({ queryKey: ['SendConnection_to_user'] });
            refetchReceivedConnections();
            refetchAllFriendConnection();
            
            Toast.show({
              type: 'success',
              text1: 'Connection Accepted',
              text2: 'You are now connected with this user',
            });
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
      const connectionId = receivedRequest?.connection_id || receivedRequest?.id;
      
      if (!connectionId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Connection request not found',
        });
        return;
      }

      const payload = {
        connection_id: connectionId,
      };

      Reject_Connection_mutation.mutateAsync(
        { payload },
        {
          onSuccess: () => {
            // Invalidate queries to refresh the connection list
            queryClient.invalidateQueries({ queryKey: ['SeeAllConnected'] });
            queryClient.invalidateQueries({ queryKey: ['SeeAllConnection'] });
            refetchReceivedConnections();
            
            Toast.show({
              type: 'success',
              text1: 'Connection Rejected',
              text2: 'The connection request has been rejected',
            });
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

  console.log('data------------->>>', data?.friend?.profile);
  const getProfileImageUrl = (profile_picture?: string) => {
    if (!profile_picture) return null;
  
    // already full URL
    if (profile_picture.startsWith('http://') || profile_picture.startsWith('https://')) {
      return profile_picture;
    }
  
    // relative path → add base url
    return `${BASE_URL_IMAGE}${profile_picture}`;
  };

  // Handle info button press with animation
  const handleInfoButtonPress = () => {
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotate animation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });

    // Open modal
    setShowInfoModal(true);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <View style={{ flex: 1 }}>
      <Header onBack={handleBack} />
      
      {/* Attractive Info Button */}
      <TouchableOpacity
        style={styles.infoButtonContainer}
        onPress={handleInfoButtonPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.infoButton,
            {
              transform: [
                { scale: scaleAnim },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          <Ionicons name="information-circle" size={28} color="#D4AF37" />
          <View style={styles.infoButtonGlow} />
        </Animated.View>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
            colors={['#D4AF37']}
          />
        }
      >
        <ImageBackground
          source={{
            uri: getProfileImageUrl(data?.friend?.profile?.profile_picture || data?.profile_picture) || 
              'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d'
          }}
          style={{
            minHeight: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 60,
            overflow: 'hidden',
            borderTopColor: 'white',
            borderTopWidth: 1,
          }}
          blurRadius={ data?.is_public === true || data?.friend?.profile?.is_public  === true || data?.friend?.profile?.blur_photo === false ? 0 : 10}
          resizeMode="cover"
        >
        <Text style={styles.info}>
          {data.friend?.first_name || data.first_name}{' '}
          {data.friend?.last_name || data.last_name}
        </Text>
        <View>
          <View style={styles.main_head_boxed}>
            <View style={styles.head_boxed}>
              <Icon name={'mars'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>{data?.friend?.profile?.marital_status || data?.marital_status}</Text>
            </View>
            <View style={styles.head_boxed}>
              <FontAwesome
                name={'clock-rotate-left'}
                size={15}
                color={'white'}
              />
              <Text style={styles.head_boxed_text}>
                {calculateAge(data?.date_of_birth || data?.friend?.profile?.date_of_birth)}
              </Text>
            </View>
            <View style={styles.head_boxed}>
              <Feather name={'cast'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>{data?.friend?.profile?.caste || data?.caste}</Text>
            </View>
            <View style={styles.head_boxed}>
              <FontAwesome name={'user-tie'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>{data?.friend?.profile?.city || data?.city}</Text>
            </View>
            <View style={styles.head_boxed}>
              <FontAwesome name={'graduation-cap'} size={15} color={'white'} />
              <Text style={styles.head_boxed_text}>
                {data?.friend?.profile?.education_level || data?.education_level}
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
          {alreadyFriend ? (
            <TouchableOpacity
              style={styles.main_upper_box}
              onPress={() => setShowRemoveModal(true)}
            >
              <View style={styles.images_heart_boxed}>
                <Entypo name={'check'} size={40} color={'#E83C91'} />
              </View>
              <Text style={styles.main_upper_box_text}>Friend</Text>
            </TouchableOpacity>
          ) : hasReceivedRequest ? (
            <>
              {/* Accept Button */}
              <TouchableOpacity
                style={styles.main_upper_box}
                onPress={AcceptConnectionHandle}
                disabled={isAcceptingRequest || isRejectingRequest}
              >
                <View style={[styles.images_heart_boxed, styles.acceptButtonBox]}>
                  {isAcceptingRequest ? (
                    <ActivityIndicator size="large" color="#4CAF50" />
                  ) : (
                    <Entypo name={'check'} size={40} color={'#4CAF50'} />
                  )}
                </View>
                <Text style={styles.main_upper_box_text}>
                  {isAcceptingRequest ? 'Accepting...' : 'Accept'}
                </Text>
              </TouchableOpacity>
              {/* Reject Button */}
              <TouchableOpacity
                style={styles.main_upper_box}
                onPress={RejectConnectionHandle}
                disabled={isAcceptingRequest || isRejectingRequest}
              >
                <View style={[styles.images_boxed, styles.rejectButtonBox]}>
                  {isRejectingRequest ? (
                    <ActivityIndicator size="large" color="#FF4444" />
                  ) : (
                    <Entypo name={'cross'} size={40} color={'#FF4444'} />
                  )}
                </View>
                <Text style={styles.main_upper_box_text}>
                  {isRejectingRequest ? 'Rejecting...' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </>
          ) : isSendingRequest ? (
            <TouchableOpacity
              style={styles.main_upper_box}
              disabled
            >
              <View style={styles.images_heart_boxed}>
                <ActivityIndicator size="large" color="#D4AF37" />
              </View>
              <Text style={styles.main_upper_box_text}>Sending...</Text>
            </TouchableOpacity>
          ) : alreadySent ? (
            <TouchableOpacity
              style={styles.main_upper_box}
              onPress={CancelConnectionHandle}
              disabled={isCancellingRequest}
            >
              <View style={styles.images_heart_boxed}>
                {isCancellingRequest ? (
                  <ActivityIndicator size="large" color="#D4AF37" />
                ) : (
                  <Entypo name={'circle-with-cross'} size={40} color={'#E83C91'} />
                )}
              </View>
              <Text style={styles.main_upper_box_text}>
                {isCancellingRequest ? 'Cancelling...' : 'Cancel Request'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.main_upper_box}
              onPress={SendConnectionHandle}
            >
              <View style={styles.images_heart_boxed}>
                <Entypo name={'heart-outlined'} size={40} color={'#E83C91'} />
              </View>
              <Text style={styles.main_upper_box_text}>Connect</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.main_upper_box,
              !alreadyFriend && styles.disabledButton,
            ]}
            onPress={() => {
              // Check if users are friends before allowing chat
              if (!alreadyFriend) {
                Toast.show({
                  type: 'info',
                  text1: 'Chat Restricted',
                  text2: 'You can only chat with users who are your friends. Send a connection request first.',
                  visibilityTime: 3000,
                });
                return;
              }

              // Get the user ID from various possible fields
              const userId =
                data?.user_id ||
                data?.friend?.id ||
                data?.id ||
                data?.friend?.user_id;
              
              // Get the user object
              const userObject = data?.friend || data;

              console.log('Navigating to Chat with:', {
                otherUserId: userId,
                otherUser: userObject,
                data: data,
              });

              if (!userId) {
                console.error('Cannot navigate to Chat: User ID is missing');
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'User information is missing',
                });
                return;
              }

              navigation.navigate('Chat', {
                otherUserId: userId,
                otherUser: userObject,
              });
            }}
            disabled={!alreadyFriend}
          >
            <View
              style={[
                styles.images_boxed,
                !alreadyFriend && styles.disabledImageBox,
              ]}
            >
              <Ionicons
                name={'chatbox-outline'}
                size={25}
                color={alreadyFriend ? 'white' : '#666666'}
              />
            </View>
            <Text
              style={[
                styles.main_upper_box_text,
                !alreadyFriend && styles.disabledText,
              ]}
            >
              Chat
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      </ScrollView>
      {/* 
// ! ||--------------------------------------------------------------------------------||
// ! ||                                   Model_code                                   ||
// ! ||--------------------------------------------------------------------------------||
      */}
      <Modal
        visible={showRemoveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Remove Connection?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove this connection?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowRemoveModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={() => {
                  setShowRemoveModal(false);
                  RemoveConnectionHandle(); // call your function now
                }}
              >
                <Text style={styles.modalConfirmText}>Yes, Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Attractive Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.infoModalOverlay}>
          <Animated.View style={styles.infoModalContainer}>
            <View style={styles.infoModalHeader}>
              <View style={styles.infoModalIconContainer}>
                <Ionicons name="sparkles" size={40} color="#D4AF37" />
              </View>
              <Text style={styles.infoModalTitle}>Profile Information</Text>
              <TouchableOpacity
                style={styles.infoModalCloseButton}
                onPress={() => setShowInfoModal(false)}
              >
                <Ionicons name="close-circle" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.infoModalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.infoSection}>
                <View style={styles.infoItem}>
                  <Ionicons name="person-circle-outline" size={24} color="#D4AF37" />
                  <View style={styles.infoItemContent}>
                    <Text style={styles.infoItemTitle}>About This Profile</Text>
                    <Text style={styles.infoItemText}>
                    {data?.generated_description}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem1}>
                  <Ionicons name="shield-checkmark-outline" size={24} color="#D4AF37" />
                  <View style={styles.infoItemContent}>
                  <Text style={styles.infoItemTitle}>Account Status : <Text style={styles.infoItemText}>
                    {data?.admin_verification_status ? 'Pending' : 'Verified'}
                  </Text></Text>
                  <Text style={styles.infoItemText}>
                    {data?.admin_verification_status
                      ? 'This user account verification is pending by admin.'
                      : 'This user account has been successfully verified by admin.'}
                  </Text>
                </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.infoModalFooter}>
              <TouchableOpacity
                style={styles.infoModalButton}
                onPress={() => setShowInfoModal(false)}
              >
                <Text style={styles.infoModalButtonText}>Got It</Text>
                <Ionicons name="checkmark-circle" size={20} color="#000000" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  acceptButtonBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  rejectButtonBox: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderColor: '#FF4444',
    borderWidth: 2,
  },
  // Info Button Styles
  infoButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
    elevation: 10,
  },
  infoButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  infoButtonGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4AF37',
    opacity: 0.2,
  },
  // Info Modal Styles
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoModalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  infoModalHeader: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
    alignItems: 'center',
    position: 'relative',
  },
  infoModalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  infoModalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  infoModalContent: {
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  infoSection: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    gap: 12,
  },
  infoItem1: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 30,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    gap: 12,
  },
  infoItemContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 6,
  },
  infoItemText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    textAlign: 'left',
  },
  infoModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  infoModalButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  infoModalButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

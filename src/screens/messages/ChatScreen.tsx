import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import Screen from '../../components/Screen';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/Auth_store';
import {
  Create_Session,
  Ready_Session,
  Start_Session,
  useSee_AllConservation,
  useSend_Message,
} from '../../service/Hooks/User_Conservation_Hook';
import { useReport_User } from '../../service/Hooks/User_Report_Hook';
import { getConversationBetweenUsers } from '../../constants/ChatHelper';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function ChatScreen({ navigation, route }: any) {
  const { otherUserId, otherUser } = route.params || {};
  const user = useAuthStore(state => state.user);
  const sendMessageMutation = useSend_Message();
  const [isPaused, setIsPaused] = useState(false);
  const StartSessionMutation = Start_Session();
  const ReadySessionMutation = Ready_Session();
  const { data: chatMutation, refetch, isLoading: isLoadingConversations, isFetching: isFetchingConversations } = useSee_AllConservation();
  console.log('chatmutation');
  console.log('ChatScreen route.params:', route.params);
  console.log('ChatScreen otherUserId:', otherUserId);
  const currentUserId = user?.meta?.user_id;

  // Validate otherUserId exists
  if (!otherUserId) {
    console.error('otherUserId is missing in route.params');
  }
  const [showCallMenu, setShowCallMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionid, setSessionId] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSuggestTimeModal, setShowSuggestTimeModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [isFavorite, setIsFavorite] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string>('');
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const reportUserMutation = useReport_User();
  const [favoriteChats, setFavoriteChats] = useState<Set<number>>(new Set());
  const [isOnline] = useState(false); // Mock status
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const SessionMutation = Create_Session();
  const downArrowRef = useRef<View>(null);
  const threeDotsRef = useRef<View>(null);
  const attachButtonRef = useRef<View>(null);
  // Get all messages and filter out session creation messages
  const allMessages = getConversationBetweenUsers(
    chatMutation?.data || [],
    currentUserId,
    otherUserId,
  );

  // Filter out messages that contain session creation content (SESSION_ID pattern)
  const messages = useMemo(() => {
    if (!allMessages || allMessages.length === 0) return [];
    
    return allMessages.filter((msg: any) => {
      const content = msg?.content || '';
      // Hide messages that contain [SESSION_ID:xxx] pattern (case-insensitive and with optional whitespace)
      const hasSessionId = /\[SESSION_ID:\s*\d+\s*\]/i.test(content);
      if (hasSessionId) {
        console.log('Filtering out session message:', content.substring(0, 100));
      }
      return !hasSessionId;
    });
  }, [allMessages]);

  // Debug: Log important values
  useEffect(() => {
    console.log('ChatScreen mounted/updated:', {
      otherUserId,
      otherUser,
      currentUserId,
      hasMessages: messages.length > 0,
      messageText,
    });
  }, [otherUserId, otherUser, currentUserId, messages.length, messageText]);

  // Load favorite chats from AsyncStorage on mount and when otherUserId changes
  useEffect(() => {
    const loadFavoriteChats = async () => {
      try {
        const stored = await AsyncStorage.getItem('favoriteChats');
        if (stored) {
          const favorites = JSON.parse(stored);
          const favoritesSet = new Set<number>(favorites);
          setFavoriteChats(favoritesSet);
          setIsFavorite(favoritesSet.has(otherUserId));
        } else {
          setFavoriteChats(new Set());
          setIsFavorite(false);
        }
      } catch (error) {
        console.log('Error loading favorite chats:', error);
        setFavoriteChats(new Set());
        setIsFavorite(false);
      }
    };
    loadFavoriteChats();
  }, [otherUserId]);

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
      await refetch(); // from useSee_AllConservation
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Refetch messages when screen comes into focus to get latest messages
      refetch();
      
      let isActive = true;

      const intervalId = setInterval(() => {
        // Only refetch if the screen is active AND we aren't paused
        if (isActive && !isPaused) {
          console.log('Refreshing messages...');
          refetch();
        }
      }, 7000);

      return () => {
        isActive = false;
        clearInterval(intervalId);
      };
    }, [refetch, isPaused]), // Add isPaused to dependencies
  );
  // Extract session ID from message (hidden format: [SESSION_ID:12345])
  const extractSessionId = (text: string): string | null => {
    const sessionRegex = /\[SESSION_ID:(\d+)\]/;
    const match = text.match(sessionRegex);
    return match ? match[1] : null;
  };

  // Remove session ID from visible text
  const removeSessionIdFromText = (text: string): string => {
    return text.replace(/\[SESSION_ID:\d+\]/g, '').trim();
  };

  const extractUrl = (text: string): string | null => {
    // First remove session ID to get clean text for URL extraction
    const cleanText = removeSessionIdFromText(text);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = cleanText.match(urlRegex);
    return match ? match[0] : null;
  };

  const handleOpenLink = (url: string, messageContent: string, isInitiator: boolean) => {
    // Extract session ID from the message content
    const extractedSessionId = extractSessionId(messageContent);
    console.log('extractedSessionId', extractedSessionId,messageContent);
    if (sessionid) {
      Alert.alert('Join Session', 'Do you want!!!!!!!!!!!!! to join this session?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: async () => {
            ReadySessionMutation.mutateAsync(
              {
                payload: {},
                participantId: sessionid,
              },
              {
                onSuccess: async (res: any) => {
                  console.log('Session ready response:', res);
                  
                  // If participant: open browser immediately (no waiting)
                  // If initiator: wait for participant to be ready
                  if (!isInitiator) {
                    // Participant - open browser immediately
                    const supported = await Linking.canOpenURL(url);
                    if (supported) {
                      await Linking.openURL(url);
                    } else {
                      Alert.alert('Error', 'Cannot open this link');
                    }
                  } else {
                    // Initiator - check if participant is ready
                    const participantReady = res?.participant_ready === true;
                    
                    if (participantReady) {
                      // Participant is ready, open the link in browser
                      const supported = await Linking.canOpenURL(url);
                      if (supported) {
                        await Linking.openURL(url);
                      } else {
                        Alert.alert('Error', 'Cannot open this link');
                      }
                    } else {
                      // Participant not ready yet, show waiting message
                      Alert.alert(
                        'Waiting for Participant',
                        'The participant is not ready yet. Please wait for them to join.',
                        [{ text: 'OK' }]
                      );
                    }
                  }
                },
                onError: (err: any) => {
                  console.error('Failed to ready session:', err);
                  const errorMessage =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    'Failed to join session. Please try again.';
                  Alert.alert('Error', errorMessage);
                },
              },
            );
          },
        },
      ]);
    } else {
      // Fallback for regular URLs (if no session ID found)
      Alert.alert('Open Link', 'Do you want==================>>>>>>>><<<<<<<< to open this link in your browser?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: async () => {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
              await Linking.openURL(url);
            } else {
              Alert.alert('Error', 'Cannot open this link');
            }
          },
        },
      ]);
    }
  };
  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = !isFavorite;
      const updatedFavorites = new Set(favoriteChats);

      if (newFavoriteStatus) {
        updatedFavorites.add(otherUserId);
      } else {
        updatedFavorites.delete(otherUserId);
      }

      // Save to AsyncStorage
      const favoritesArray = Array.from(updatedFavorites);
      await AsyncStorage.setItem('favoriteChats', JSON.stringify(favoritesArray));

      // Update state
      setFavoriteChats(updatedFavorites);
      setIsFavorite(newFavoriteStatus);

    Alert.alert(
      'Success',
        newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites',
    );
    } catch (error) {
      console.log('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleStartCall = () => {
    setShowRemoveModal(true);
    setShowCallMenu(false);
    // navigation.navigate('Call', { type: 'audio' });
  };

  const handleSuggestCallTime = () => {
    setShowCallMenu(false);
    setShowSuggestTimeModal(true);
    setSelectedDateTime(new Date());
  };

  const handleConfirmSuggestTime = () => {
    const formattedDate = selectedDateTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = selectedDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const suggestionMessage = `📞 Call suggestion: ${formattedDate} at ${formattedTime}`;

    // In real app, this would send the message to the chat
    setMessageText(suggestionMessage);
    setShowSuggestTimeModal(false);

    Alert.alert(
      'Success',
      `Call time suggestion sent!\n${formattedDate} at ${formattedTime}`,
      [{ text: 'OK' }],
    );
  };

  const handleBlockUser = () => {
    setShowUserMenu(false);
    Alert.alert('Block User', 'Are you sure you want to block this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Success', 'User has been blocked');
          navigation.goBack();
        },
      },
    ]);
  };

  // Report reasons list
  const reportReasons = [
    'Inappropriate content',
    'Harassment or bullying',
    'Spam or fake profile',
    'Suspicious activity',
    'Violence or threats',
    'Other',
  ];

  const handleReportUser = () => {
    setShowUserMenu(false);
    setShowReportModal(true);
    setSelectedReportReason('');
    setOtherReasonText('');
    setShowReportDropdown(false);
  };

  const handleSelectReportReason = (reason: string) => {
    setSelectedReportReason(reason);
    setShowReportDropdown(false);
    if (reason !== 'Other') {
      setOtherReasonText('');
    }
  };

  // Helper function to extract user-friendly error messages
  const getReportErrorMessage = (error: any): { title: string; message: string } => {
    const statusCode = error?.response?.status;
    const errorData = error?.response?.data || error?.data || {};

    // Handle specific HTTP status codes
    if (statusCode === 400) {
      // Check for field-specific errors (like reported_user_id)
      if (errorData.reported_user_id) {
        const reportedError = Array.isArray(errorData.reported_user_id) 
          ? errorData.reported_user_id[0] 
          : errorData.reported_user_id;
        
        return {
          title: 'Report Already Submitted',
          message: reportedError || 'You have already reported this user. Please wait for admin review.',
        };
      }
      
      // Check for other field errors
      const fieldErrors = Object.keys(errorData);
      if (fieldErrors.length > 0) {
        const firstField = fieldErrors[0];
        const fieldErrorValue = errorData[firstField];
        const errorMessage = Array.isArray(fieldErrorValue) 
          ? fieldErrorValue[0] 
          : fieldErrorValue;
        
        return {
          title: 'Invalid Request',
          message: errorMessage || 'Please check your input and try again.',
        };
      }
      
      return {
        title: 'Invalid Request',
        message: 'The report request is invalid. Please try again.',
      };
    }

    if (statusCode === 401) {
      return {
        title: 'Authentication Required',
        message: 'Your session has expired. Please log in again.',
      };
    }

    if (statusCode === 403) {
      return {
        title: 'Permission Denied',
        message: 'You do not have permission to report users.',
      };
    }

    if (statusCode === 404) {
      return {
        title: 'User Not Found',
        message: 'The user you are trying to report could not be found.',
      };
    }

    if (statusCode === 429) {
      return {
        title: 'Too Many Requests',
        message: 'You have submitted too many reports. Please wait a moment before trying again.',
      };
    }

    if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
      return {
        title: 'Server Error',
        message: 'Our servers are experiencing issues. Please try again in a few minutes.',
      };
    }

    // Handle network errors
    if (error?.message) {
      if (error.message.includes('Network') || error.message.includes('network')) {
        return {
          title: 'Network Error',
          message: 'No internet connection. Please check your network settings and try again.',
        };
      }
      if (error.message.includes('timeout')) {
        return {
          title: 'Request Timeout',
          message: 'The request took too long. Please check your internet connection and try again.',
        };
      }
    }

    // Handle backend error messages
    if (errorData?.message) {
      return {
        title: 'Report Failed',
        message: Array.isArray(errorData.message) ? errorData.message[0] : errorData.message,
      };
    }

    if (errorData?.error) {
      return {
        title: 'Report Failed',
        message: Array.isArray(errorData.error) ? errorData.error[0] : errorData.error,
      };
    }

    if (errorData?.detail) {
      return {
        title: 'Report Failed',
        message: errorData.detail,
      };
    }

    // Default error
    return {
      title: 'Report Failed',
      message: 'Failed to submit report. Please check your internet connection and try again.',
    };
  };

  const handleSubmitReport = () => {
    if (!selectedReportReason) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a reason for reporting',
      });
      return;
    }

    if (selectedReportReason === 'Other' && !otherReasonText.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please provide a reason',
      });
      return;
    }

    const reportReason = selectedReportReason === 'Other' 
      ? otherReasonText.trim() 
      : selectedReportReason;

    const payload = {
      reported_user_id: otherUserId,
      reason: reportReason,
    };

    // Close modal and show loading
    setShowReportModal(false);
    setIsSubmittingReport(true);

    reportUserMutation.mutateAsync(
      { payload },
      {
        onSuccess: (res: any) => {
          console.log('Report submitted successfully:', res);
          setIsSubmittingReport(false);
          setSelectedReportReason('');
          setOtherReasonText('');
          setShowReportDropdown(false);
          
          Toast.show({
            type: 'success',
            text1: 'Report Submitted',
            text2: 'Your report has been submitted successfully. We will review it shortly.',
            visibilityTime: 4000,
          });
        },
        onError: (err: any) => {
          setIsSubmittingReport(false);
          
          const { title, message } = getReportErrorMessage(err);
          
          Toast.show({
            type: 'error',
            text1: title,
            text2: message,
            visibilityTime: 5000,
          });
        },
      },
    );
  };
  const handleCreateSession = () => {
    setLoading(true);
    SessionMutation.mutateAsync(
      { payload: {}, participantId: otherUserId },
      {
        onSuccess: res => {
          if (res?.id) {
            setSessionId(res?.id);
            StartSessionMutation.mutateAsync(
              { payload: {}, participantId: res.id },
              {
                onSuccess: sessionRes => {
                  if (sessionRes?.zoom_meeting_url) {
                   
                    // Don't show the session message in the text input
                    // The message will be sent automatically without showing in the input
                    setIsPaused(true);
                    
                    // Optionally, you can send the session message automatically here if needed
                    // For now, we're not showing it in the input field
                  }
                  setLoading(false);
                },
                onError: error => {
                  setLoading(false);
                  Alert.alert('Error', 'Failed to generate meeting link');
                },
              },
            );
          }
        },
        onError: (error: any) => {
          setLoading(false);
          console.log('Session creation error:', error);
          
          // Extract error details from backend response
          const errorData = error?.response?.data || error?.data || {};
          
          const errorTitle = errorData?.error || 'Session Creation Failed';
          const errorDetail = errorData?.detail || errorData?.message || 'Failed to create session. Please try again.';
          const limit = errorData?.limit;
          const used = errorData?.used;
          const upgradeRequired = errorData?.upgrade_required;
          
          // Build detailed error message
          let errorMessage = errorDetail;
          
          // Add limit information if available
          if (limit !== undefined && used !== undefined) {
            errorMessage += `\n\nUsed: ${used} / ${limit} sessions`;
          }
          
          // Create alert buttons
          const alertButtons: any[] = [
            { text: 'OK', style: 'default' }
          ];
          
          // Add upgrade button if upgrade is required
          if (upgradeRequired) {
            alertButtons.push({
              text: 'Upgrade Plan',
              style: 'default',
              onPress: () => {
                // Navigate to subscriptions screen
                navigation.navigate('Subscriptions');
              }
            });
          }
          
          Alert.alert(
            errorTitle,
            errorMessage,
            alertButtons
          );
        },
      },
    );
  };
  const handleShowCallMenu = () => {
    if (downArrowRef.current) {
      downArrowRef.current.measureInWindow((x, y, width, height) => {
        setMenuPosition({ x: x + width - 200, y: y + height + 4 });
        setShowCallMenu(true);
      });
    } else {
      setShowCallMenu(true);
    }
  };

  const handleShowUserMenu = () => {
    if (threeDotsRef.current) {
      threeDotsRef.current.measureInWindow((x, y, width, height) => {
        setMenuPosition({ x: x + width - 200, y: y + height + 4 });
        setShowUserMenu(true);
      });
    } else {
      setShowUserMenu(true);
    }
  };

  const handleSendMessage = () => {
    // Ensure we don't send empty text
    if (!messageText.trim()) {
      console.log('Message text is empty');
      return;
    }

    // Validate otherUserId exists
    if (!otherUserId) {
      console.error('Cannot send message: otherUserId is missing');
      Alert.alert('Error', 'Cannot send message: User information is missing');
      return;
    }

    console.log('Sending message to otherUserId:', otherUserId);
    console.log('Message content:', messageText.trim());

    const payload = {
      receiver_id: otherUserId,
      content: messageText.trim(),
    };

    console.log('Message payload:', payload);

    sendMessageMutation.mutateAsync(
      { payload: payload },
      {
        onSuccess: (response) => {
          console.log('Message sent successfully:', response);
          setMessageText(''); // Clear input ONLY after user clicks send
          refetch();
        },
        onError: error => {
          console.error('Failed to send message:', error);
          Alert.alert('Error', 'Failed to send message. Please try again.');
        },
      },
    );
  };

  const handleAttachDocument = () => {
    setShowAttachMenu(true);
  };

  const handleDocumentOption = () => {
    setShowAttachMenu(false);
    // In real app, this would open document picker
    Alert.alert('Document Picker', 'Document picker would open here');
  };

  const handleGalleryOption = () => {
    setShowAttachMenu(false);
    // In real app, this would open image picker
    Alert.alert('Image Picker', 'Image picker would open here');
  };

  const handleCameraOption = () => {
    setShowAttachMenu(false);
    // In real app, this would open camera
    Alert.alert('Camera', 'Camera would open here');
  };
  const otherUserInfo = useMemo(() => {
    if (!chatMutation?.data?.length || !currentUserId) return null;

    const msg = chatMutation.data.find(
      (m: any) => m.sender.id === otherUserId || m.receiver.id === otherUserId,
    );

    if (!msg) return null;

    return msg.sender.id === otherUserId ? msg.sender : msg.receiver;
  }, [chatMutation?.data, currentUserId, otherUserId]);
  const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.trim()?.[0] ?? '';
    const last = lastName?.trim()?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  };
  const userInitial = getInitials(
    otherUserInfo?.first_name,
    otherUserInfo?.last_name,
  );
  const renderMessage = ({ item }: any) => {
    const isMe = item.sender.id === currentUserId;
    const url = extractUrl(item.content);
    // Remove session ID from visible text
    const displayText = removeSessionIdFromText(item.content);
    // If current user sent the message, they are the initiator
    // If current user received the message, they are the participant
    const isInitiator = isMe;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        <Pressable
          disabled={!url}
          onPress={() => {
            if (url) {
              // Pass the original message content to extract session ID
              // Pass isInitiator to determine if user should wait or open immediately
              handleOpenLink(url, item.content, isInitiator);
            }
          }}
        >
          <View
            style={[
              styles.messageBubble,
              isMe ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isMe ? styles.myMessageText : styles.theirMessageText,
                url && styles.linkText, // optional styling
              ]}
            >
              {displayText}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };
  // Show loading for session creation (separate from data loading)
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Please wait...</Text>
        <Text style={styles.loadingText}>Your Call link generate</Text>
      </View>
    );
  }

  // Show loading indicator while initial data is being fetched (only on initial load, not refetch)
  if (isLoadingConversations && !chatMutation?.data) {
    return (
      <Screen>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </Screen>
    );
  }
  return (
    <Screen>
      <View style={styles.customHeader}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerMainContent}>
          <View style={styles.headerTopSection}>
            <View style={styles.profileSection}>
              <View style={styles.profileIconContainer}>
                <View style={styles.profileIcon}>
                  <Text style={styles.profileInitials}>{userInitial}</Text>
                </View>
                <View
                  style={[
                    styles.statusIndicator,
                    isOnline && styles.statusOffline,
                  ]}
                />
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                onPress={handleToggleFavorite}
                style={styles.starButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  name={isFavorite ? 'star' : 'star-outline'}
                  size={22}
                  color={isFavorite ? '#FFD700' : '#D4AF37'}
                />
              </Pressable>
              <View ref={downArrowRef} collapsable={false}>
                <Pressable
                  onPress={handleShowCallMenu}
                  style={styles.downArrowButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="chevron-down" size={18} color="#D4AF37" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View ref={threeDotsRef} collapsable={false}>
          <Pressable
            onPress={handleShowUserMenu}
            style={styles.threeDotsButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="ellipsis-vertical" size={20} color="#D4AF37" />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => item?.id?.toString() || `message-${index}`}
        renderItem={renderMessage}
        refreshControl={
          <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
            tintColor="#D4AF37"
            colors={['#D4AF37']}
          />
        }
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />

      <View style={styles.inputContainer}>
        {/* <View ref={attachButtonRef} collapsable={false}>
          <Pressable
            style={styles.attachButton}
            onPress={handleAttachDocument}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="attach-outline" size={24} color="#D4AF37" />
          </Pressable>
        </View> */}
        <TextInput
          placeholder="Send a message..."
          placeholderTextColor="#8C8A9A"
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <Pressable
          style={[
            styles.sendButton,
            messageText.trim() && styles.sendButtonActive,
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Icon
            name="paper-plane"
            size={24}
            color={messageText.trim() ? '#FFFFFF' : '#8C8A9A'}
          />
        </Pressable>
      </View>

      {/* Call Menu Modal */}
      <Modal
        visible={showCallMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCallMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCallMenu(false)}
        >
          <View
            style={[
              styles.menuContainer,
              styles.callMenuContainer,
              { top: menuPosition.y, left: menuPosition.x },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Pressable style={styles.menuItem} onPress={handleStartCall}>
              <Icon name="call" size={20} color="#D4AF37" />
              <Text style={styles.menuItemText}>Start a call</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={handleSuggestCallTime}>
              <Icon name="time-outline" size={20} color="#D4AF37" />
              <Text style={styles.menuItemText}>Suggest a call time</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowUserMenu(false)}
        >
          <View
            style={[
              styles.menuContainer,
              styles.userMenuContainer,
              { top: menuPosition.y, left: menuPosition.x },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Pressable style={styles.menuItem} onPress={handleReportUser}>
              <Icon name="warning-outline" size={20} color="#FF4444" />
              <Text style={[styles.menuItemText, styles.dangerText]}>
                Report this user
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Attach File Menu Modal */}
      <Modal
        visible={showAttachMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAttachMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAttachMenu(false)}
        >
          <View
            style={styles.attachMenuContainer}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.attachMenuTitle}>Attach File</Text>
            <Text style={styles.attachMenuSubtitle}>Choose an option</Text>
            <View style={styles.attachMenuOptions}>
              <Pressable
                style={styles.attachMenuOption}
                onPress={handleDocumentOption}
              >
                <Text style={styles.attachMenuOptionText}>DOCUMENT</Text>
              </Pressable>
              <Pressable
                style={styles.attachMenuOption}
                onPress={handleGalleryOption}
              >
                <Text style={styles.attachMenuOptionText}>GALLERY</Text>
              </Pressable>
              <Pressable
                style={styles.attachMenuOption}
                onPress={handleCameraOption}
              >
                <Text style={styles.attachMenuOptionText}>CAMERA</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Suggest Call Time Modal */}
      <Modal
        visible={showSuggestTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSuggestTimeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSuggestTimeModal(false)}
        >
          <View
            style={styles.suggestTimeContainer}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.suggestTimeHeader}>
              <Text style={styles.suggestTimeTitle}>Suggest Call Time</Text>
              <Pressable
                onPress={() => setShowSuggestTimeModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.dateTimeSection}>
              <Text style={styles.sectionLabel}>Select Date & Time</Text>
              <View style={styles.dateTimeDisplay}>
                <Icon name="calendar-outline" size={20} color="#D4AF37" />
                <Text style={styles.dateTimeText}>
                  {selectedDateTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.dateTimeDisplay}>
                <Icon name="time-outline" size={20} color="#D4AF37" />
                <Text style={styles.dateTimeText}>
                  {selectedDateTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <DatePicker
                date={selectedDateTime}
                onDateChange={setSelectedDateTime}
                mode="datetime"
                theme="dark"
                textColor="#FFFFFF"
                style={styles.datePicker}
              />
            </View>

            <View style={styles.suggestTimeActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowSuggestTimeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.suggestButton}
                onPress={handleConfirmSuggestTime}
              >
                <Text style={styles.suggestButtonText}>Suggest Time</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
      <Modal
        visible={showRemoveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Session Verification?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to join this session?
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
                  handleCreateSession();
                  setShowRemoveModal(false);
                }}
              >
                <Text style={styles.modalConfirmText}>Yes, I,m Sure</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report User Modal */}
      <Modal
        visible={showReportModal && !isSubmittingReport}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isSubmittingReport) {
            setShowReportModal(false);
          }
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            if (!showReportDropdown) {
              setShowReportModal(false);
            }
            setShowReportDropdown(false);
          }}
        >
          <Pressable
            style={styles.reportModalContainer}
            onStartShouldSetResponder={() => true}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.reportModalTitle}>Report User</Text>
            <Text style={styles.reportModalSubtitle}>
              Why are you reporting this user?
            </Text>

            {/* Dropdown */}
            <View style={styles.reportDropdownContainer}>
              <Pressable
                style={styles.reportDropdownButton}
                onPress={() => setShowReportDropdown(!showReportDropdown)}
              >
                <Text
                  style={[
                    styles.reportDropdownButtonText,
                    !selectedReportReason && styles.reportDropdownPlaceholder,
                  ]}
                >
                  {selectedReportReason || 'Select a reason'}
                </Text>
                <Icon
                  name={showReportDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#D4AF37"
                />
              </Pressable>

              {showReportDropdown && (
                <View
                  style={styles.reportDropdownList}
                  onStartShouldSetResponder={() => true}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  <ScrollView
                    style={styles.reportDropdownScroll}
                    contentContainerStyle={styles.reportDropdownContent}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                    scrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {reportReasons.map((reason, index) => (
                      <Pressable
                        key={index}
                        style={styles.reportDropdownItem}
                        onPress={() => handleSelectReportReason(reason)}
                      >
                        <Text style={styles.reportDropdownItemText}>
                          {reason}
                        </Text>
                        {selectedReportReason === reason && (
                          <Icon name="checkmark" size={20} color="#D4AF37" />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Other Reason Text Input */}
            {selectedReportReason === 'Other' && (
              <View style={styles.reportOtherInputContainer}>
                <TextInput
                  style={styles.reportOtherInput}
                  placeholder="Please specify the reason..."
                  placeholderTextColor="#8C8A9A"
                  value={otherReasonText}
                  onChangeText={setOtherReasonText}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* Buttons */}
            <View style={styles.reportModalButtons}>
              <TouchableOpacity
                style={styles.reportCancelButton}
                onPress={() => {
                  setShowReportModal(false);
                  setSelectedReportReason('');
                  setOtherReasonText('');
                  setShowReportDropdown(false);
                }}
              >
                <Text style={styles.reportCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reportSubmitButton,
                  (!selectedReportReason ||
                    (selectedReportReason === 'Other' &&
                      !otherReasonText.trim()) ||
                    isSubmittingReport) &&
                    styles.reportSubmitButtonDisabled,
                ]}
                onPress={handleSubmitReport}
                disabled={
                  !selectedReportReason ||
                  (selectedReportReason === 'Other' && !otherReasonText.trim()) ||
                  isSubmittingReport
                }
              >
                {isSubmittingReport ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.reportSubmitButtonText}>Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Loading Overlay for Report Submission */}
      {isSubmittingReport && (
        <Modal
          visible={isSubmittingReport}
          transparent
          animationType="fade"
        >
          <View style={styles.loadingOverlay}>
            <View style={styles.reportLoadingContainer}>
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text style={styles.reportLoadingText}>Submitting report...</Text>
            </View>
          </View>
        </Modal>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  linkText: {
    textDecorationLine: 'underline',
    color: '#fff',
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginTop: '10%',
    paddingBottom: 5,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    marginTop: 4,
  },
  headerMainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#20B2AA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#000000',
  },
  statusOffline: {
    backgroundColor: '#808080',
  },
  userInfo: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  offlineBadge: {
    backgroundColor: '#808080',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  username: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  lastSeen: {
    color: '#8C8A9A',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starButton: {
    padding: 4,
  },
  downArrowButton: {
    padding: 4,
  },
  userStatusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  userStatusText: {
    color: '#8C8A9A',
    fontSize: 12,
  },
  threeDotsButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageTimestamp: {
    textAlign: 'center',
    color: '#8C8A9A',
    fontSize: 12,
    marginVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: '#D4AF37',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#4A90E2',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000000',
  },
  theirMessageText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    gap: 8,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#D4AF37',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    minWidth: 200,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
  },
  callMenuContainer: {
    // Position will be set dynamically
  },
  userMenuContainer: {
    // Position will be set dynamically
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerText: {
    color: '#FF4444',
  },
  attachMenuContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    width: 340,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  attachMenuTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  attachMenuSubtitle: {
    color: '#8C8A9A',
    fontSize: 14,
    marginBottom: 20,
  },
  attachMenuOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '100%',
  },
  attachMenuOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  attachMenuOptionText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    includeFontPadding: false,
  },
  suggestTimeContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
    width: '90%',
    maxWidth: 400,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  suggestTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  suggestTimeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  dateTimeSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 10,
  },
  dateTimeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  pickerContainer: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 10,
  },
  datePicker: {
    backgroundColor: 'transparent',
  },
  suggestTimeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8C8A9A',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
  },
  suggestButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.21)', // semi-transparent black
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Android
    elevation: 999, // Android
  },
  loadingText: {
    marginTop: 12,
    color: '#D4AF37',
    fontSize: 19,
  },
  // Report Modal Styles
  reportModalContainer: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 2,
    // height: 300,
    borderColor: '#D4AF37',
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  reportModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 8,
    textAlign: 'center',
  },
  reportModalSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  reportDropdownContainer: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 10,
  },
  reportDropdownButton: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  reportDropdownPlaceholder: {
    color: '#8C8A9A',
  },
  reportDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    marginTop: 4,
    height: 350,
    zIndex: 1000,
    elevation: 10,
    overflow: 'hidden',
  },
  reportDropdownScroll: {
    flex: 1,
  },
  reportDropdownContent: {
    paddingVertical: 4,
  },
  reportDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  reportDropdownItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  reportOtherInputContainer: {
    marginBottom: 20,
  },
  reportOtherInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  reportModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportCancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  reportCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reportSubmitButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  reportSubmitButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  reportSubmitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportLoadingContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  reportLoadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
});

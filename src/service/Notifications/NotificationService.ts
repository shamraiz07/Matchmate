import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { navigate } from '../../utils/navigationRef';
import { useAuthStore } from '../../store/Auth_store';

class NotificationService {
  private notificationHandlers: Map<string, () => void> = new Map();

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Android 13+ requires runtime permission
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission denied');
            return false;
          }
        }
      }

      // Request FCM permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Handle notification tap and navigate to appropriate screen
   */
  handleNotificationNavigation(data: any) {
    console.log('Handling notification navigation with data:', data);

    if (!data || !data.type) {
      console.log('No notification type found, navigating to Main');
      navigate('Main');
      return;
    }

    const notificationType = data.type.toLowerCase();

    switch (notificationType) {
      case 'message':
        this.handleMessageNotification(data);
        break;

      case 'connection_request':
      case 'connection':
        this.handleConnectionRequestNotification(data);
        break;

      default:
        console.log('Unknown notification type, navigating to Main');
        navigate('Main');
    }
  }

  /**
   * Handle message notification - navigate to ChatScreen
   */
  private handleMessageNotification(data: any) {
    const senderId = data.sender_id || data.senderId;
    const conversationId = data.conversation_id || data.conversationId;

 
    if (!senderId) {
      console.error('sender_id is missing in notification data');
      navigate('Main');
      return;
    }

    // Get user data if available
    const otherUser = data.otherUser
      ? JSON.parse(data.otherUser)
      : {
          id: parseInt(senderId, 10),
          username: data.sender_name || data.senderName || 'User',
          first_name: data.sender_first_name || data.senderFirstName,
          last_name: data.sender_last_name || data.senderLastName,
        };

    console.log('Navigating to ChatScreen with:', {
      otherUserId: senderId,
      otherUser,
    });

    // Navigate to Chat screen
    navigate('Chat', {
      otherUserId: parseInt(senderId, 10),
      otherUser,
    });
  }

  /**
   * Handle connection request notification - navigate to Connection screen
   */
  private handleConnectionRequestNotification(data: any) {
    console.log('Navigating to Connection screen');

    // Navigate to Main tab first, then to Connection tab
    navigate('Main');
    
    // Connection is a tab, so we need to navigate to it differently
    // Since Connection is a tab in MainTabs, we just need to navigate to Main
    // and the tab will be selected automatically if we set initialRouteName
    // For now, we'll navigate to Main and let user manually go to Connection tab
    // Or we can use a different approach
    
    // Alternative: Navigate to Main and show a message
    setTimeout(() => {
      // The Connection screen is a tab, so user needs to manually switch
      // We could also create a deep link or use a different navigation approach
      navigate('Main');
    }, 100);
  }

  /**
   * Initialize notification handlers
   */
  initialize() {

    // 🔹 FOREGROUND: Sirf notification show karo, navigate NAHI
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);
  
      if (remoteMessage.notification) {
        console.log('Notification:', remoteMessage.notification);
        // 👉 yahan sirf toast / banner dikhao
      }
  
      // ❌ yahan navigation nahi karni
    });
  
  
    // 🔹 BACKGROUND: User tap kare → navigate karo
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification opened from BACKGROUND:',
        remoteMessage,
      );
  
      if (remoteMessage?.data) {
        this.handleNotificationNavigation(remoteMessage.data);
      }
    });
  
  
    // 🔹 CLOSED (Quit): App notification se open ho → navigate karo
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification opened from QUIT state:',
            remoteMessage,
          );
  
          // navigation ready hone ka wait
          setTimeout(() => {
            if (remoteMessage?.data) {
              this.handleNotificationNavigation(remoteMessage.data);
            }
          }, 800);
        }
      });
  
  
    // 🔹 Token refresh
    messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      this.sendTokenToBackend(token);
    });
  }
  

  /**
   * Send FCM token to backend
   */
  async sendTokenToBackend(token: string) {
    try {
      const user = useAuthStore.getState().user;
      if (!user || !user.meta?.access_token) {
        console.log('User not authenticated, skipping token registration');
        return;
      }

      const { Register_FCM_Token } = await import(
        '../Api_service/Notification_Service'
      );
      

      const payload = {
        fcm_token: token,
        device_type: 'android',
      };

      await Register_FCM_Token(payload, user.meta.access_token);
      console.log('FCM token registered successfully');
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();


import React, { useEffect } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import ProfileSetupScreen from './screens/profile/ProfileSetupScreen';
import MoreAboutYouScreen from './screens/profile/MoreAboutYouScreen';
import PreferencesScreen from './screens/preferences/PreferencesScreen';
import HomeScreen from './screens/home/HomeScreen';
import MessagesScreen from './screens/messages/MessagesScreen';
import NotificationsScreen from './screens/notifications/NotificationsScreen';
import OtpScreen from './screens/auth/OtpScreen';
import SearchScreen from './screens/home/SearchScreen';
import ChatScreen from './screens/messages/ChatScreen';
import CallScreen from './screens/messages/CallScreen';
import SubscriptionsScreen from './screens/subscriptions/SubscriptionsScreen';
import PaymentsScreen from './screens/subscriptions/PaymentsScreen';
import QuotaBalanceScreen from './screens/subscriptions/QuotaBalanceScreen';
import AdminPanelScreen from './screens/admin/AdminPanelScreen';
import SettingsScreen from './screens/settings/SettingsScreen';
import AccountSettingsScreen from './screens/settings/AccountSettingsScreen';
import DeleteAccountScreen from './screens/settings/DeleteAccountScreen';
import MyProfileScreen from './screens/profile/MyProfileScreen';
import NewPasswordScreen from './screens/auth/NewPasswordScreen';
import ProfileVerificationScreen from './screens/profile/ProfileVerificationScreen';
import VerificationUploadScreen from './screens/profile/VerificationUploadScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useAuthStore } from './store/Auth_store';
import { Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import SearchResultsScreen from './screens/preferences/SearchResultsScreen';
import PartnerProfileScreen from './screens/home/PartnerProfileScreen';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const MatchmateTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#D4AF37', // Golden (#D4AF37)
    background: '#000000', // Black
    card: '#1A1A1A', // Dark gray/black for cards
    text: '#FFFFFF', // White text
    border: '#D4AF37', // Golden borders
    notification: '#D4AF37', // Golden for notifications
  },
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#D4AF37', // Golden color for active tab
        tabBarInactiveTintColor: '#808080', // Grey color for inactive tabs
        tabBarStyle: {
          backgroundColor: '#1A1A1A', // Dark background
          borderTopColor: '#333333',
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size = 24, focused }) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              size={size || 24}
              color={color || '#808080'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size = 24, focused }) => (
            <Icon
              name={focused ? 'chatbubble' : 'chatbubble-outline'}
              size={size || 24}
              color={color || '#808080'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size = 24, focused }) => (
            <Icon
              name={focused ? 'notifications' : 'notifications-outline'}
              size={size || 24}
              color={color || '#808080'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size = 24, focused }) => (
            <Icon
              name="menu"
              size={size || 24}
              color={focused ? color || '#D4AF37' : color || '#808080'}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore(state => state.is_Authenticated);
  const isHydrated = useAuthStore(state => state.isHydrated);

  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  if (!isHydrated) {
    // Show splash or loading screenp
    console.log('isAuthenticated_userr', isAuthenticated);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000000',
        }}
      >
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (

// ! ||--------------------------------------------------------------------------------||
// ! ||                               //All screen roots                               ||
// ! ||--------------------------------------------------------------------------------||

    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer theme={MatchmateTheme}>
          <Stack.Navigator
            initialRouteName={isAuthenticated ? 'Main' : 'Login'}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="MoreAboutYou" component={MoreAboutYouScreen} />
            <Stack.Screen name="Preferences" component={PreferencesScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen
              name="Partnerprofile"
              component={PartnerProfileScreen}
            />
            <Stack.Screen
              name="SearchResults"
              component={SearchResultsScreen}
            />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Call" component={CallScreen} />
            <Stack.Screen
              name="Subscriptions"
              component={SubscriptionsScreen}
            />
            <Stack.Screen name="Payments" component={PaymentsScreen} />
            <Stack.Screen name="ChoosePlan" component={SubscriptionsScreen} />
            <Stack.Screen name="PaymentHistory" component={PaymentsScreen} />
            <Stack.Screen name="QuotaBalance" component={QuotaBalanceScreen} />
            <Stack.Screen name="MyProfile" component={MyProfileScreen} />
            <Stack.Screen
              name="ProfileVerification"
              component={ProfileVerificationScreen}
            />
            <Stack.Screen
              name="VerificationUpload"
              component={VerificationUploadScreen}
            />
            <Stack.Screen
              name="AccountSettings"
              component={AccountSettingsScreen}
            />
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="DeleteAccount"
              component={DeleteAccountScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
      <Toast />
    </QueryClientProvider>
  );
}

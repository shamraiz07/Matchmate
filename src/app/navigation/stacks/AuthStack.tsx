// src/navigation/stacks/AuthStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../../../screens/auth/login';
// import WebViewScreen from '../../../screens/WebViewScreen';

export type AuthStackParamList = {
  Login: undefined;
  WebView: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
    screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
      }}>
      <Stack.Screen name="Login" component={Login} options={{ headerTitle: 'Sign In' }} />
    </Stack.Navigator>
  );
}

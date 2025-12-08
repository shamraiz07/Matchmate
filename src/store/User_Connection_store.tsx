import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  userSeeConnection: any;
  userAllConnection: null;
  token: string | null;

  setUserSeeConnection: (user: any) => Promise<void>;
  setuserAllConnection: (user: any) => Promise<void>;
}

export const useUserConnection = create<UserState>(set => ({
  userSeeConnection: null,
  userAllConnection: null,
  token: null,

  setUserSeeConnection: async user => {
    try {
      console.log('UserSeeConnection', user);

      await AsyncStorage.setItem('UserSeeConnection', JSON.stringify(user));

      set({ userSeeConnection: user });
    } catch (error) {
      console.log('Error saving UserSeeConnection:', error);
    }
  },
  setuserAllConnection: async user => {
    try {
      console.log('UserAllConnection', user);

      await AsyncStorage.setItem('UserAllConnection', JSON.stringify(user));

      set({ userAllConnection: user });
    } catch (error) {
      console.log('Error saving UserAllConnection:', error);
    }
  },
}));

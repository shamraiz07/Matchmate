import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  user: any;
  token: string | null;
  is_Authenticated: boolean;
  isHydrated: boolean;

  setUser: (user: any) => Promise<void>;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  is_Authenticated: false,
  isHydrated: false,

  setUser: async (user) => {
    console.log('user_info',user)
    await AsyncStorage.setItem("user_info", JSON.stringify(user));
    set((state) => ({
      user,
      is_Authenticated: !!(user && state.token),
    }));
  },

  setToken: async (token) => {
    await AsyncStorage.setItem("token", token);
    set((state) => ({
      token,
      is_Authenticated: !!(state.user && token),
    }));
  },

  logout: async () => {
    console.log('logout_called')
    await AsyncStorage.removeItem("user_info");
    await AsyncStorage.removeItem("token");
    set({ user: null, token: null, is_Authenticated: false });
  },

  hydrate: async () => {
    const storedUser = await AsyncStorage.getItem("user_info");
    const storedToken = await AsyncStorage.getItem("token");

    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = storedToken || null;

    set({
      user,
      token,
      is_Authenticated: !!(user && token),
      isHydrated: true,
    });
  },
}));

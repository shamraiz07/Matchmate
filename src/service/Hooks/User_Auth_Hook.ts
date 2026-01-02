import { LoginUser, newPassword, registerUser, sendResetLink, verifyOTP, changePassword } from "../Api_service/Auth_Service";
import {useMutation} from '@tanstack/react-query'
import { useAuthStore } from '../../store/Auth_store';
// Register User Hook
export const useRegister = () => {
  return useMutation({
    mutationFn: async (payload) => {
      console.log("🟦 React Query Mutation Called");
      console.log("➡ Payload Received:", payload);
      return registerUser(payload);
    },
  });
};

// Login User Hook
export const useLoginUser =() => {
  return useMutation({
    mutationFn: async ({payload}: {payload: any}) => {
      console.log("🟦 React Query Mutation Called",payload);
      console.log("➡ Payload Received:", payload);
      return LoginUser(payload);
    },
  })
};

// OTP Send ON EMAIL Hook
export const useSendResetLink = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      console.log("🟦 React Query Mutation Called", email);
      console.log("➡ Payload Received:", email);
      return sendResetLink(email);
    },
  });
};

// OTP Verify API
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      console.log("🟦 React Query Mutation Called", payload);
      console.log("➡ Payload Received:", payload);
      return verifyOTP(payload);
    },
  });
};

// New Password API
export const useNewPassword = () => {
  return useMutation({
    mutationFn: async ({payload, resetToken}: {payload: any, resetToken: string}) => {
      console.log("🟦 React Query Mutation Called", payload);
      console.log("➡ Payload Received:", payload);
      return newPassword(payload, resetToken);
    },
  });
};

// Change Password API Hook
export const useChangePassword = () => {
  const token = useAuthStore(state => state.token);
  console.log('token of useChangePassword===========================', token);
  return useMutation({
    mutationFn: async ({payload}: {payload: any}) => {
      console.log("🟦 CHANGE PASSWORD React Query Mutation Called");
      console.log("➡ Payload Received:", payload);
      return changePassword(payload, token || '');
    },
  });
};


import { LoginUser, registerUser } from "../Api_service/Auth_Service";
import {useMutation} from '@tanstack/react-query'

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
    mutationFn: async (payload) => {
      console.log("🟦 React Query Mutation Called",payload);
      console.log("➡ Payload Received:", payload);
      return LoginUser(payload);
    },
  })
};

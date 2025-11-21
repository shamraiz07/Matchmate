import {useMutation, useQuery} from '@tanstack/react-query'
import { profileCreate, profileUpdate, profileView } from '../Api_service/User_Service';
import { useAuthStore } from '../../store/Auth_store';

// Profile Create Hook
export const useProfileCreate = () => {
    const token = useAuthStore((state) => state.token);
    console.log("token of profile update===========================",token);
  return useMutation({
    mutationFn: async ({payload}: {payload: any}) => {
      return profileCreate(payload, token || '');
    },
  });
};

// Profile View Hook
export const useProfileView = () => {
  const token = useAuthStore((state) => state.token);
  console.log("token of profile view===========================",token);
  return useQuery({
    queryKey: ['profile-view'],
    queryFn: () => profileView(token || ''),
    enabled: !!token,
  });
};

// Profile Update Hook
export const useProfileUpdate = () => {
  const token = useAuthStore((state) => state.token);
  console.log("token of profile update===========================",token);
  return useMutation({
    mutationFn: async ({payload}: {payload: any}) => {
      return profileUpdate(payload, token || '');
    },
  });
};
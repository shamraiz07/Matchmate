import {useMutation, useQuery} from '@tanstack/react-query'
import { Profile_Picture_Verification, profileCreate, profileMatch, profileUpdate, profileUpdate_Generated, profileView } from '../Api_service/User_Service';
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
  return useQuery({
    queryKey: ['profile-view'],
    queryFn: () => profileView(token || ''),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: !!token, // Only run if token exists
  });
};

// Profile Update Hook
export const useProfileUpdate = () => {
  const token = useAuthStore((state) => state.token);
  return useMutation({
    mutationFn: async ({payload}: {payload: any}) => {
      return profileUpdate(payload, token || '');
    },
  });
};

// Profile_Pragarph Generated Hook
export const useProfileParagraph = () => {
  const token = useAuthStore((state) => state.token);
  console.log("token ouseProfileParagraph--------------------------",token);
return useMutation({
  mutationFn: async () => {
    return profileUpdate_Generated(token || '');
  },
});
};

// Profile_Picture_Verfication
export const Profile_Picture_Verify = () => {
  const token = useAuthStore((state) => state.token);
  console.log("token Picture_Verification--------------------------",token);
  return useMutation({
    mutationFn: async ({payload}: {payload: any}) => {
    console.log('payload_picture',payload)
    return Profile_Picture_Verification(payload,token || '');
  },
});
};

// Profile Match Hook
export const useProfileMatch = () => {
  const token = useAuthStore((state) => state.token);
  console.log('useProfileMatch------------->>>',token)
  return useQuery({
    queryKey: ["profile-match"],
    queryFn: () => profileMatch(token || ''),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: !!token, // Only run if token exists
  });
};

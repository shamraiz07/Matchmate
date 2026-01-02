
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/Auth_store';
import { Report_User, User_CNIC_Verify, User_Quota_Balance, User_Subscriptions } from '../Api_service/User_Report';
// ! ||--------------------------------------------------------------------------------||
// ! ||                         // Profile_Picture_Verfication                         ||
// ! ||--------------------------------------------------------------------------------||
export const useReport_User = () => {
    const token = useAuthStore(state => state.token);
    console.log('token Picture_Verification--------------------------', token);
    return useMutation({
      mutationFn: async ({ payload }: { payload: any }) => {
        console.log('payload_picture', payload);
        return Report_User(payload, token || '');
      },
    });
  };

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // CNIC Verify API                             ||
// ! ||--------------------------------------------------------------------------------||
export const useUser_CNIC_Verify = () => {
  const token = useAuthStore(state => state.token);
  console.log('token CNIC_Verify--------------------------', token);
  return useMutation({
    mutationFn: async ({ payload }: { payload: any }) => {
      console.log('payload_CNIC_Verify', payload);
      return User_CNIC_Verify(payload, token || '');
    },
  });
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Subscriptions API                             ||
// ! ||--------------------------------------------------------------------------------||
export const useUser_Subscriptions = () => {
  const token = useAuthStore(state => state.token);
  console.log('token Subscriptions--------------------------', token);
  return useMutation({
    mutationFn: async ({ payload }: { payload: any }) => {
      console.log('payload_Subscriptions', payload);
      return User_Subscriptions(payload, token || '');
    },
  });
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Quota Balance API                             ||
// ! ||--------------------------------------------------------------------------------||
export const useUser_Quota_Balance = () => {
  const token = useAuthStore(state => state.token);
  console.log('useUser_Quota_Balance------------->>>', token);
  return useQuery({
    queryKey: ['User_Quota_Balance'],
    queryFn: () => User_Quota_Balance(token || ''),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: !!token, // Only run if token exists
  });
};
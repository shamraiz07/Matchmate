import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/Auth_store';
import {
    SeeAllFriendConnection,
  SeeConnectionViewSend,
  Send_Connection,
} from '../Api_service/User_Connection_Service';

// ! ||--------------------------------------------------------------------------------||
// ! ||                              Send_Connection_Hook                              ||
// ! ||--------------------------------------------------------------------------------||
export const useSendConnection = () => {
  const token = useAuthStore(state => state.token);
  console.log(
    'token of Send  Connection Hook called===========================',
    token,
  );
  return useMutation({
    mutationFn: async ({ payload }: { payload: any }) => {
      return Send_Connection(payload, token || '');
    },
  });
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // See Send User Connection Hook                  ||
// ! ||--------------------------------------------------------------------------------||
export const useSee_SendConnection_to_user = () => {
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: ['SendConnection_to_user'],
    queryFn: () => SeeConnectionViewSend(token || ''),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: !!token, // Only run if token exists
  });
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                        // See Send User Connection Hook                        ||
// ! ||--------------------------------------------------------------------------------||
export const useSeeAllFriendConnection = ()=>{
    const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: ['SeeAllConnection'],
    queryFn: () => SeeAllFriendConnection(token || ''),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: !!token, // Only run if token exists
  });
}
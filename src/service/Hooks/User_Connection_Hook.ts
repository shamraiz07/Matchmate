import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/Auth_store';
import {
  Accept_Connection,
  All_Connection,
  Cancel_User_Connection,
  Reject_Connection,
  Remove_User_Connection,
  SeeAllFriendConnection,
  SeeAllFriendConnection_Send_by_others,
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
export const useSeeAllFriendConnection = () => {
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
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                        // See Friend Connection By Others Hook                        ||
// ! ||--------------------------------------------------------------------------------||
export const useSeeAllFriendConnectionByOthers = () => {
  console.log('useSeeAllFriendConnectionByOtherscaaaalllledddddd');
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: ['SeeAllConnected'],
    queryFn: () => SeeAllFriendConnection_Send_by_others(token || ''),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: !!token, // Only run if token exists
  });
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              Accept_Connection_Hook                              ||
// ! ||--------------------------------------------------------------------------------||
export const useAcceptConnection = () => {
  const token = useAuthStore(state => state.token);
  console.log(
    'token of useAcceptConnection Hook called===========================',
    token,
  );
  return useMutation({
    mutationFn: async ({ payload }: { payload: any }) => {
      return Accept_Connection(payload, token || '');
    },
  });
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              Reject_Connection_Hook                              ||
// ! ||--------------------------------------------------------------------------------||
export const useRejectConnection = () => {
  const token = useAuthStore(state => state.token);
  console.log(
    'token of useRejectConnection Hook called===========================',
    token,
  );
  return useMutation({
    mutationFn: async ({ payload }: { payload: any }) => {
      return Reject_Connection(payload, token || '');
    },
  });
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              All_Friends_SEE_Hook                              ||
// ! ||--------------------------------------------------------------------------------||
export const useAll_Friends_See = () => {
  console.log('useAll_Friends_See_Called');
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: ['SeeAllConnectedFriend'],
    queryFn: () => All_Connection(token || ''),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: !!token, // Only run if token exists
  });
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              REMOVE_Connection_Hook                              ||
// ! ||--------------------------------------------------------------------------------||
export const useRemove_userConnection = () => {
  const token = useAuthStore(state => state.token);
  console.log(
    'token of useRemove_userConnection Hook called===========================',
    token,
  );
  return useMutation({
    mutationFn: async ({ payload }: { payload: any }) => {
      return Remove_User_Connection(payload, token || '');
    },
  });
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              CANCEL_Connection_Hook                              ||
// ! ||--------------------------------------------------------------------------------||
export const useCancel_userConnection = () => {
  const token = useAuthStore(state => state.token);
  console.log(
    'token of useCancel_userConnection Hook called===========================',
    token,
  );
  return useMutation({
    mutationFn: async ({ payload }: { payload: any }) => {
      return Cancel_User_Connection(payload, token || '');
    },
  });
};

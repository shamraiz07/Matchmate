import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/Auth_store';
import {
  See_AllConservation,
  Send_Message,
  User_Create_Session,
  User_Ready_Session,
  User_Start_Session,
} from '../Api_service/User_Conservation_Service';

// ! ||--------------------------------------------------------------------------------||
// ! ||                              See_AllConservation_Hook                          ||
// ! ||--------------------------------------------------------------------------------||

export const useSee_AllConservation = () => {
  console.log('useSee_AllConservation_Called');
  const token = useAuthStore(state => state.token);
  return useQuery({
    queryKey: ['SeeAllConservation'],
    queryFn: () => See_AllConservation(token || ''),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    enabled: !!token, // Only run if token exists
  });
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              Send_Message_Hook                              ||
// ! ||--------------------------------------------------------------------------------||
export const useSend_Message = () => {
  const token = useAuthStore(state => state.token);
  console.log(
    'token of useSend_Message Hook called===========================',
    token,
  );
  return useMutation({
    mutationFn: async ({ payload }: { payload: any }) => {
      console.log('payloaddd----------Hookkk', payload);
      return Send_Message(payload, token || '');
    },
  });
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              Create_Session_Hook                              ||
// ! ||--------------------------------------------------------------------------------||
export const Create_Session = () => {
  const token = useAuthStore(state => state.token);
  console.log(
    'token of Create_Session Hook called===========================',
    token,
  );
  return useMutation({
    mutationFn: async ({
      participantId,
    }: {
      payload: any;
      participantId: any;
    }) => {
      console.log('payloaddd----------Hookkk', participantId);
      return User_Create_Session(participantId, token || '');
    },
  });
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              Start_Session_Hook                              ||
// ! ||--------------------------------------------------------------------------------||
export const Start_Session = () => {
  const token = useAuthStore(state => state.token);
  console.log(
    'token of Create_Session Hook called===========================',
    token,
  );
  return useMutation({
    mutationFn: async ({
      participantId,
    }: {
      payload: any;
      participantId: any;
    }) => {
      console.log('payloaddd----------Hookkk', participantId);
      return User_Start_Session(participantId, token || '');
    },
  });
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              Ready_Session_Hook                              ||
// ! ||--------------------------------------------------------------------------------||
export const Ready_Session = () => {
  const token = useAuthStore(state => state.token);
  console.log(
    'token of Create_Session Hook called===========================',
    token,
  );
  return useMutation({
    mutationFn: async ({
      participantId,
    }: {
      payload: any;
      participantId: any;
    }) => {
      console.log('payloaddd----------Hookkk', participantId);
      return User_Ready_Session(participantId, token || '');
    },
  });
};

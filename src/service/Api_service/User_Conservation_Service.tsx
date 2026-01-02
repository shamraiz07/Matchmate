// ! ||--------------------------------------------------------------------------------||
// ! ||                       import apiClient from "../Client";                       ||
// ! ||--------------------------------------------------------------------------------||

import apiClient from '../Client';
import { ENDPOINTS_User_Call, ENDPOINTS_User_Conservation } from '../Endpoint';

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // See All Conservation API                             ||
// ! ||--------------------------------------------------------------------------------||
export const See_AllConservation = async (token: string) => {
  console.log('🟦 See_AllConservation SERVICE CALLED');
  try {
    const response = await apiClient.get(
      ENDPOINTS_User_Conservation.See_All_User_Conservation,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (error: any) {
    throw error;
  }
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Send message API                             ||
// ! ||--------------------------------------------------------------------------------||
export const Send_Message = async (payload: any, token: string) => {
  console.log('🟦 Send_Message SERVICE CALLED', payload);
  try {
    const response = await apiClient.post(
      ENDPOINTS_User_Conservation.Send_User_Message,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (error: any) {
    throw error;
  }
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Create Session API                             ||
// ! ||--------------------------------------------------------------------------------||
// services/userCall.ts
export const User_Create_Session = async (
  participantId: number,
  token: string,
) => {
  console.log('🟦 Create_Session SERVICE CALLED', {
    participantId,
  });

  try {
    const response = await apiClient.post(
      ENDPOINTS_User_Call.Create_Session(participantId),
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Start Session API                             ||
// ! ||--------------------------------------------------------------------------------||
// services/userCall.ts
export const User_Start_Session = async (
  participantId: number,
  token: string,
) => {
  console.log('🟦 Create_Session SERVICE CALLED', {
    participantId,
  });

  try {
    const response = await apiClient.post(
      ENDPOINTS_User_Call.Start_Session(participantId),
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error('❌ Create session error', error?.response || error);
    throw error;
  }
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Ready Session API                             ||
// ! ||--------------------------------------------------------------------------------||
// services/userCall.ts
export const User_Ready_Session = async (
  participantId: number,
  token: string,
) => {
  console.log('🟦 Create_Session SERVICE CALLED', {
    participantId,
  });

  try {
    const response = await apiClient.post(
      ENDPOINTS_User_Call.Ready_Session(participantId),
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error('❌ Create session error', error?.response || error);
    throw error;
  }
};

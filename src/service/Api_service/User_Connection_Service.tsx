// ! ||--------------------------------------------------------------------------------||
// ! ||                       import apiClient from "../Client";                       ||
// ! ||--------------------------------------------------------------------------------||

import apiClient from '../Client';
import { ENDPOINTS_Connection } from '../Endpoint';

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Send Connection API                             ||
// ! ||--------------------------------------------------------------------------------||
export const Send_Connection = async (payload: any, token: string) => {
  console.log('🟦 Send_Connection SERVICE CALLED');
  try {
    const response = await apiClient.post(
      ENDPOINTS_Connection.SEND_USER_CONNECTION,
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
// ! ||                              // See Cooneection Send User APi                              ||
// ! ||--------------------------------------------------------------------------------||
export const SeeConnectionViewSend = async (token: string) => {
  console.log('🟦 SeeConnectionViewSend SERVICE CALLED');
  try {
    const response = await apiClient.get(
      ENDPOINTS_Connection.SEE_ALL_PENDING_REQUEST_USER_SEND,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log('see_respnce', response);
    return response;
  } catch (error: any) {
    throw error;
  }
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                                 See All Friends                                ||
// ! ||--------------------------------------------------------------------------------||
export const SeeAllFriendConnection = async (token: string) => {
  console.log('🟦 SeeAllFriendConnection SERVICE CALLED');
  try {
    const response = await apiClient.get(
      ENDPOINTS_Connection.SEE_ALL_USER_FRIEND,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log('see_respnce', response);
    return response;
  } catch (error: any) {
    throw error;
  }
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                   SEE_ALL_USER_FRIEND_REQUEST_SEND_BY_OTHERS;                  ||
// ! ||--------------------------------------------------------------------------------||
export const SeeAllFriendConnection_Send_by_others = async (token: string) => {
  console.log('🟦 SeeAllFriendConnection_Send_by_others SERVICE CALLED');
  try {
    const response = await apiClient.get(
      ENDPOINTS_Connection.SEE_ALL_USER_FRIEND_REQUEST_SEND_BY_OTHERS,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log('SeeAllFriendConnection_Send_by_others_respnce', response);
    return response;
  } catch (error: any) {
    throw error;
  }
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Accept Connection API                             ||
// ! ||--------------------------------------------------------------------------------||
export const Accept_Connection = async (payload: any, token: string) => {
  console.log('🟦 Send_Connection SERVICE CALLED');
  try {
    const response = await apiClient.post(
      ENDPOINTS_Connection.USER_Accept_CONNECTION,
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
// ! ||                              // Reject Connection API                             ||
// ! ||--------------------------------------------------------------------------------||
export const Reject_Connection = async (payload: any, token: string) => {
  console.log('🟦 Reject_Connection SERVICE CALLED');
  try {
    const response = await apiClient.post(
      ENDPOINTS_Connection.USER_Reject_CONNECTION,
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
// ! ||                              // All Connection API                             ||
// ! ||--------------------------------------------------------------------------------||
export const All_Connection = async (token: string) => {
  console.log('🟦 Reject_Connection SERVICE CALLED');
  try {
    const response = await apiClient.get(ENDPOINTS_Connection.ALL_USER_FRIEND, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                              // REMOVE USER Connection API                             ||
// ! ||--------------------------------------------------------------------------------||
export const Remove_User_Connection = async (payload: any, token: string) => {
  console.log('🟦 Remove_User_Connection SERVICE CALLED');
  try {
    const response = await apiClient.post(
      ENDPOINTS_Connection.REMOVE_USER_FRIEND,
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
// ! ||                              // CANCEL USER Connection API                             ||
// ! ||--------------------------------------------------------------------------------||
export const Cancel_User_Connection = async (payload: any, token: string) => {
  console.log('🟦 Cancel_User_Connection SERVICE CALLED');
  try {
    const response = await apiClient.post(
      ENDPOINTS_Connection.CANCEL_USER_FRIEND,
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

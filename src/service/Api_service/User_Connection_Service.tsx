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

import apiClient from '../Client';
import { ENDPOINTS_FCM_Token } from '../Endpoint';

// ! ||--------------------------------------------------------------------------------||
// ! ||                              Register FCM Token API                             ||
// ! ||--------------------------------------------------------------------------------||
export const Register_FCM_Token = async (payload: any, token: string) => {
  console.log('🟦 Register_FCM_Token SERVICE CALLED', payload);
  try {
    const response = await apiClient.post(
      ENDPOINTS_FCM_Token.FCM_Token,
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


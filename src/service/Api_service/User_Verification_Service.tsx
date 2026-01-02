// ! ||--------------------------------------------------------------------------------||
// ! ||                       import apiClient from "../Client";                       ||
// ! ||--------------------------------------------------------------------------------||

import apiClient from '../Client';
import { ENDPOINTS_User_CNIC_Verify } from '../Endpoint';

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // CNIC Verification API                          ||
// ! ||--------------------------------------------------------------------------------||
export const CNIC_Verification_Upload = async (
  payload: any,
  token: string,
) => {
  console.log('🟦 CNIC_Verification_Upload SERVICE CALLED');
  try {
    const response = await apiClient.post(
      ENDPOINTS_User_CNIC_Verify.CNIC_Verify,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response;
  } catch (error: any) {
    throw error;
  }
};

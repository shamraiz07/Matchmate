// ! ||--------------------------------------------------------------------------------||
// ! ||                       import apiClient from "../Client";                       ||
// ! ||--------------------------------------------------------------------------------||

import apiClient from '../Client';
import { ENDPOINTS_User_CNIC_Verify, ENDPOINTS_User_Report, ENDPOINTS_User_Subscriptions } from '../Endpoint';

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Send message API                             ||
// ! ||--------------------------------------------------------------------------------||
export const Report_User = async (payload: any, token: string) => {
    console.log('🟦 Report_User SERVICE CALLED', payload);
    try {
      const response = await apiClient.post(
        ENDPOINTS_User_Report.Report_User,
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
// ! ||                              // CNIC Verify API                             ||
// ! ||--------------------------------------------------------------------------------||
export const User_CNIC_Verify = async (payload: any, token: string) => {
    console.log('🟦 CNIC_Verify SERVICE CALLED', payload);
    try {
      const response = await apiClient.post(
        ENDPOINTS_User_CNIC_Verify.CNIC_Verify,
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
// ! ||                              // Subscriptions API                             ||
// ! ||--------------------------------------------------------------------------------||
export const User_Subscriptions = async (payload: any, token: string) => {
    console.log('🟦 Subscriptions SERVICE CALLED', payload);
    try {
      const response = await apiClient.post(
        ENDPOINTS_User_Subscriptions.Subscriptions,
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
// ! ||                              // Quota Balance API                             ||
// ! ||--------------------------------------------------------------------------------||
export const User_Quota_Balance = async ( token: string) => {
  console.log('🟦 Quota Balance SERVICE CALLED');
  try {
    const response = await apiClient.get(
      ENDPOINTS_User_Subscriptions.Quota_Balance,
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
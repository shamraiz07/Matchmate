import apiClient from "../Client";
import { ENDPOINTS_USER } from "../Endpoint";

// Profile Update API
export const profileCreate = async (payload: any, token: string) => {
    console.log("🟦 PROFILE UPDATE SERVICE CALLED");
    try {
      const response = await apiClient.post(
        ENDPOINTS_USER.PROFILE_CREATE,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  // Profile View API
  export const profileView = async (token: string) => {
    console.log("🟦 PROFILE VIEW SERVICE CALLED");
    try {
      const response = await apiClient.get(ENDPOINTS_USER.PROFILE_VIEW, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error: any) {
        throw error;
    }
  };

  // Profile Update API
  export const profileUpdate = async (payload: any, token: string) => {
    console.log("🟦 PROFILE UPDATE SERVICE CALLED");
    try {
      const response = await apiClient.post(ENDPOINTS_USER.USER_PROFILE_UPDATE, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  };
import apiClient from "../Client";
import { ENDPOINTS } from "../Endpoint";

// Register User API
export const registerUser = async (payload: any) => {
  console.log("📨 AUTH SERVICE — registerUser");
  console.log("➡ Payload Sent:", payload);
  try {
    const response = await apiClient.post(ENDPOINTS.REGISTER, payload);
    console.log("✅ AUTH SERVICE — Success Response:", response.data);
    return response;
  } catch (error: any) {
    console.log("❌ AUTH SERVICE ERROR:", error.response?.data);
    throw error;
  }
};

// Login User API
export const LoginUser = async (data: any) => {
  console.log("🟦 LOGIN SERVICE CALLED");
  console.log("➡ Payload:", data);

  try {
    const response = await apiClient.post(ENDPOINTS.LOGIN, data);

    console.log("⬅ Server Response:", response.data);

    return response;

  } catch (error: any) {
    throw error;
  }
};

// OTP Send ON EMAIL API
export const sendResetLink = async (email: string) => {
  console.log("🟦 SEND RESET LINK SERVICE CALLED");
  console.log("➡ Payload:", email);
  try {
    const response = await apiClient.post(ENDPOINTS.OTP_SEND, { email });
    return response;
  } catch (error: any) {
    throw error;
  }
};

// OTP Verify API
export const verifyOTP = async (payload: any) => {
  console.log("🟦 OTP VERIFY SERVICE CALLED");
  console.log("➡ Payload:", payload);
  try {
    const response = await apiClient.post(ENDPOINTS.OTP_VERIFY, payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

// New Password API
export const newPassword = async (payload: any, resetToken: string) => {
  console.log("🟦 NEW PASSWORD SERVICE CALLED");
  console.log("➡ Payload:", payload);
  try {
    const response = await apiClient.post(ENDPOINTS.NEW_PASSWORD, payload ,{
      headers: {
        "x-reset-token": resetToken,
      }
    });
    return response;
  } catch (error: any) {
    throw error;
  }
};

// Change Password API
export const changePassword = async (payload: any, token: string) => {
  console.log("🟦 CHANGE PASSWORD SERVICE CALLED");
  console.log("➡ Payload:", payload);
  try {
    const response = await apiClient.post(ENDPOINTS.CHANGE_PASSWORD, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ CHANGE PASSWORD SERVICE — Success Response:", response.data);
    return response;
  } catch (error: any) {
    console.log("❌ CHANGE PASSWORD SERVICE ERROR:", error.response?.data);
    throw error;
  }
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Send Connection API                             ||
// ! ||--------------------------------------------------------------------------------||
export const deleteAcoount = async (token: string) => {
  console.log('🟦 deleteAcoount SERVICE CALLED',token);
  try {
    const response = await apiClient.delete(
      ENDPOINTS.DELETE_ACCOUNT,
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
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

    return { error: false, data: response.data };

  } catch (error: any) {
    console.log("❌ Login Error:", error.response?.data);

    return {
      error: true,
      data: error.response?.data || error.message,
    };
  }
};

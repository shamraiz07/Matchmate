// ! ||--------------------------------------------------------------------------------||
// ! ||                       import apiClient from "../Client";                       ||
// ! ||--------------------------------------------------------------------------------||
import apiClient from '../Client';
import { ENDPOINTS_USER } from '../Endpoint';

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Profile Update API                             ||
// ! ||--------------------------------------------------------------------------------||
export const profileCreate = async (payload: any, token: string) => {
  console.log('🟦 PROFILE UPDATE SERVICE CALLED');
  try {
    const response = await apiClient.post(
      ENDPOINTS_USER.PROFILE_CREATE,
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
// ! ||                               // Profile View API                              ||
// ! ||--------------------------------------------------------------------------------||
export const profileView = async (token: string) => {
  console.log('🟦 PROFILE VIEW SERVICE CALLED');
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

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Profile Update API                             ||
// ! ||--------------------------------------------------------------------------------||
export const profileUpdate = async (payload: any, token: string) => {
  console.log('🟦 PROFILE UPDATE SERVICE CALLED', payload);
  try {
    const response = await apiClient.post(
      ENDPOINTS_USER.USER_PROFILE_UPDATE,
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
// ! ||                            // Profile_Paragraph API                            ||
// ! ||--------------------------------------------------------------------------------||
export const profileUpdate_Generated = async (token: string) => {
  console.log('🟦 profileUpdate_Generated SERVICE CALLED');

  try {
    const response = await apiClient.post(
      ENDPOINTS_USER.PARAGRAPH_GENERATED,
      {}, // empty body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log('❌ API ERROR', error.response?.data);
    throw error;
  }
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                         // Profile_Picture_Verification                        ||
// ! ||--------------------------------------------------------------------------------||
export const Profile_Picture_Verification = async (
  payload: any,
  token: string,
) => {
  console.log('🟦 Profile_Picture_Verification SERVICE CALLED');
  try {
    const response = await apiClient.post(
      ENDPOINTS_USER.PROFILE_PICTURE_VERIFICATION,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Explicitly state this
        },
      },
    );
    return response;
  } catch (error: any) {
    throw error;
  }
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              // Profile_Match API                              ||
// ! ||--------------------------------------------------------------------------------||
export const profileMatch = async (token: string) => {
  console.log('🟦 profileMatch SERVICE CALLED');
  try {
    const response = await apiClient.get(ENDPOINTS_USER.PROFILE_MATCH, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.log('❌ API ERROR', error.response?.data);
    throw error;
  }
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                           //Search_Profile_Match_API                           ||
// ! ||--------------------------------------------------------------------------------||
export const SearchprofileMatch = async (payload: any, token: string) => {
  console.log('🟦 profileMatch SERVICE CALLED', payload, token);
  try {
    const response = await apiClient.patch(
      ENDPOINTS_USER.PROFILE_MATCH_SEARCH,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.log('❌ API ERROR SearchprofileMatch', error.response?.data);
    throw error;
  }
};

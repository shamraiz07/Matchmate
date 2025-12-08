// ! ||--------------------------------------------------------------------------------||
// ! ||                               User_Authentication_Block                        ||
// ! ||--------------------------------------------------------------------------------||
export const ENDPOINTS = {
  REGISTER: '/register/',
  LOGIN: '/login/',
  USER: '/user/',
  OTP_SEND: '/password-reset/request/',
  OTP_VERIFY: '/password-reset/confirm/',
  NEW_PASSWORD: '/password-reset/confirm/',
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                                  User_Profile_Block                                 ||
// ! ||--------------------------------------------------------------------------------||
export const ENDPOINTS_USER = {
  PROFILE_PICTURE_VERIFICATION: '/profile/photo/',
  PROFILE_CREATE: '/profile/',
  PROFILE_VIEW: '/profile/',
  USER_PROFILE_UPDATE: '/profile/',
  PARAGRAPH_GENERATED: '/profile/description/',
  // ! ||--------------------------------------------------------------------------------||
  // ! ||--------------------------PROFILE_MATCH_OPPOSITE_GENDER------------         ||
  // ! ||--------------------------------------------------------------------------------||
  PROFILE_MATCH: '/profiles/',
  PROFILE_MATCH_SEARCH: '/preferences/',
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              User_Connection_Block                             ||
// ! ||--------------------------------------------------------------------------------||
export const ENDPOINTS_Connection = {
  SEE_ALL_PENDING_REQUEST_USER_SEND: '/v1/connections/pending/sent/',
  SEE_ALL_USER_FRIEND:'/v1/connections/friends/',
  SEND_USER_CONNECTION: '/v1/connections/request/',
};

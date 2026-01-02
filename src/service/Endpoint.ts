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
  CHANGE_PASSWORD: '/account/change-password/',
  DELETE_ACCOUNT: '/account/delete/',
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
  SEE_ALL_USER_FRIEND_REQUEST_SEND_BY_OTHERS:
    '/v1/connections/pending/received/',
  SEE_ALL_USER_FRIEND: '/v1/connections/friends/',
  SEND_USER_CONNECTION: '/v1/connections/request/',
  USER_Accept_CONNECTION: '/v1/connections/accept/',
  USER_Reject_CONNECTION: '/v1/connections/reject/',
  ALL_USER_FRIEND: '/v1/connections/friends/',
  REMOVE_USER_FRIEND: '/v1/connections/remove/',
  CANCEL_USER_FRIEND: '/v1/connections/cancel/',
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                            User_Conservation_Block;                            ||
// ! ||--------------------------------------------------------------------------------||
export const ENDPOINTS_User_Conservation = {
  See_All_User_Conservation: '/v1/messages/all/',
  Send_User_Message: '/v1/messages/send/',
};
// ! ||--------------------------------------------------------------------------------||
// ! ||                            User_Call_Block;                            ||
// ! ||--------------------------------------------------------------------------------||
export const ENDPOINTS_User_Call = {
  Create_Session: (participantId: number | string) =>
    `/v1/sessions/create/?participant_id=${participantId}`,
  Start_Session: (participantId: number | string) =>
    `/v1/sessions/${participantId}/start/`,
  Ready_Session: (participantId: number | string) =>
    `/v1/sessions/${participantId}/ready/`,
};

export const ENDPOINTS_User_Report = {
  Report_User: '/reports/',
};

export const ENDPOINTS_User_CNIC_Verify = {
  CNIC_Verify: '/cnic/verify/',
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                              User_Subscriptions_Block                             ||
// ! ||--------------------------------------------------------------------------------||
export const ENDPOINTS_User_Subscriptions = {
  Subscriptions: '/subscriptions/',
  Quota_Balance: '/subscriptions/usage/',
};


// ! ||--------------------------------------------------------------------------------||
// ! ||                             FCM_Token_Block                             ||
// ! ||--------------------------------------------------------------------------------||
export const ENDPOINTS_FCM_Token = {
  FCM_Token: '/devices/register/',
};

// ! ||--------------------------------------------------------------------------------||
// ! ||                             FAQ_Block                             ||
// ! ||--------------------------------------------------------------------------------||
export const ENDPOINTS_FAQ = {
  FAQ: '/support/',
};
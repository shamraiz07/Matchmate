import axios from 'axios';
import { BASE_URL } from '../constants/config';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased to 30 seconds for slower networks
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    // Automatically detect FormData
    if (!(config.data instanceof FormData)) {
      console.log('form_detectedddddddddd---------------->>>');
      config.headers['Content-Type'] = 'application/json';
    }

    config.headers['Accept'] = 'application/json';

    console.log('📤 AXIOS REQUEST:');
    console.log('➡ URL:', config.baseURL + config.url);
    console.log('➡ Method:', config.method);
    console.log('➡ Payload---------------->:', config.data);
    console.log('➡ Headers:', config.headers);

    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    console.log('📥 AXIOS RESPONSE:');
    console.log('⬅ Status:', response.status);
    console.log('⬅ Data:', response.data);
    return response;
  },
  error => {
    console.log('❌ AXIOS ERROR:');
    console.log('⬅ Status:', error.response?.status);
    console.log('⬅ Error Data:', error.response?.data);
    console.log('⬅ URL:', error.config?.url);
    console.log('⬅ Full URL:', error.config?.baseURL + error.config?.url);
    console.log('⬅ Error Message:', error.message);
    console.log('⬅ Error Code:', error.code);
    if (error.code === 'ECONNABORTED') {
      console.log('⬅ Request timeout - network may be slow or unreachable');
    }
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      console.log('⬅ Network Error - check device connectivity and firewall settings');
    }
    return Promise.reject(error);
  },
);

export default apiClient;

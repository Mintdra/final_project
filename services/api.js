import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://anouvot.web.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log token info for debugging (mask most of the token for security)
      const maskedToken = token.length > 20
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
        : '***';
      console.log('API Request: Token retrieved from storage:', `Bearer ${maskedToken}`);
      console.log('API Request: Sending to:', config.method?.toUpperCase(), config.baseURL + config.url);
    } else {
      console.warn('API Request: No token found in AsyncStorage!');
      console.warn('API Request: This may cause authorization errors. Please ensure you are logged in.');
    }

    // Log request headers (excluding sensitive data)
    console.log('API Request Headers:', {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers.Authorization ? 'Bearer ***' : 'Not set',
    });

    return config;
  },
  (error) => {
    console.error('API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

export default api;
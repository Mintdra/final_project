import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const token = response.data.token || response.data.idToken;
    
    // Save token
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getToken: async () => {
    return await AsyncStorage.getItem('token');
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};

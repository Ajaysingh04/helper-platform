import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local Wi-Fi API (laptop and phone are on same Wi-Fi 192.168.1.9)
export const LOCAL_API_URL = 'http://192.168.1.9:5000/api';
export const PRODUCTION_API_URL = 'https://helper-backend-api-8878.onrender.com/api';

// Prioritize local Wi-Fi backend for live updates and new endpoints
export const BASE_API_URL = LOCAL_API_URL;
export const BASE_IMAGE_URL = 'http://192.168.1.9:5000';

const client = axios.create({
  baseURL: BASE_API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('helper_user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Dual network fallback: If 404 or network failure, try alternate URL
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isFallbackEligible =
      !error.response ||
      error.response?.status === 404 ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      error.code === 'ECONNABORTED';

    if (isFallbackEligible && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;
      if (originalRequest.baseURL === LOCAL_API_URL) {
        originalRequest.baseURL = PRODUCTION_API_URL;
        return client(originalRequest).catch(() => Promise.reject(error));
      } else {
        originalRequest.baseURL = LOCAL_API_URL;
        return client(originalRequest).catch(() => Promise.reject(error));
      }
    }
    return Promise.reject(error);
  }
);

export default client;

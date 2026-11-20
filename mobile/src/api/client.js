import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local and Cloud API Candidates
export const LOCAL_API_URL = 'http://192.168.1.10:5000/api';
export const LOCAL_API_FALLBACK = 'http://192.168.1.8:5000/api';
export const PRODUCTION_API_URL = 'https://helper-backend-api-8878.onrender.com/api';

// Prioritize production cloud backend so customer app connects 24/7 on Wi-Fi or mobile data
export const BASE_API_URL = PRODUCTION_API_URL;
export const BASE_IMAGE_URL = 'https://helper-backend-api-8878.onrender.com';

const client = axios.create({
  baseURL: BASE_API_URL,
  timeout: 7000,
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
      if (originalRequest.baseURL === PRODUCTION_API_URL) {
        originalRequest.baseURL = LOCAL_API_URL;
        return client(originalRequest).catch(() => {
          originalRequest.baseURL = LOCAL_API_FALLBACK;
          return client(originalRequest).catch(() => Promise.reject(error));
        });
      } else {
        originalRequest.baseURL = PRODUCTION_API_URL;
        return client(originalRequest).catch(() => Promise.reject(error));
      }
    }
    return Promise.reject(error);
  }
);

export default client;

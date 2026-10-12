import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// With adb reverse tcp:5000 tcp:5000, localhost works directly over USB.
// Wi-Fi fallback: http://192.168.1.9:5000/api
export const BASE_API_URL = 'http://localhost:5000/api';
export const BASE_IMAGE_URL = 'http://localhost:5000';

const client = axios.create({
  baseURL: BASE_API_URL,
  timeout: 15000,
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

export default client;

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('helper_user_token');
      const storedUser = await AsyncStorage.getItem('helper_current_user');
      if (storedToken && storedUser) {
        setCurrentUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.log('Error reading auth storage', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (user, token) => {
    try {
      await AsyncStorage.setItem('helper_user_token', token);
      await AsyncStorage.setItem('helper_current_user', JSON.stringify(user));
      setCurrentUser(user);
      setIsLoggedIn(true);
    } catch (e) {
      console.log('Error saving auth storage', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('helper_user_token');
      await AsyncStorage.removeItem('helper_current_user');
      setCurrentUser(null);
      setIsLoggedIn(false);
    } catch (e) {
      console.log('Error clearing auth storage', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

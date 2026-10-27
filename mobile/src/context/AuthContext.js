import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

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
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setIsLoggedIn(true);

        // Fetch latest live data from backend
        const uid = parsed.id || parsed._id;
        if (uid) {
          client.get(`/users/${uid}`).then((res) => {
            if (res.data?.success && res.data?.data) {
              const liveUser = { ...parsed, ...res.data.data };
              setCurrentUser(liveUser);
              AsyncStorage.setItem('helper_current_user', JSON.stringify(liveUser)).catch(() => {});
            }
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.log('Error reading auth storage', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (user, token) => {
    try {
      await AsyncStorage.setItem('helper_user_token', token || 'jwt_session_' + Date.now());
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

  const updateProfile = async (updatedFields) => {
    try {
      const mergedUser = {
        ...(currentUser || {
          name: updatedFields?.name || 'Customer',
          phone: updatedFields?.phone || '',
          email: updatedFields?.email || '',
          role: 'customer',
          avatar: '',
        }),
        ...updatedFields,
      };
      await AsyncStorage.setItem('helper_current_user', JSON.stringify(mergedUser));
      setCurrentUser(mergedUser);
      setIsLoggedIn(true);

      // Backend sync: Update user profile on MongoDB
      const uid = mergedUser.id || mergedUser._id;
      if (uid) {
        client.put(`/users/${uid}`, {
          name: mergedUser.name,
          phone: mergedUser.phone,
          email: mergedUser.email,
          avatar: mergedUser.photo || mergedUser.avatar,
          city: mergedUser.city,
          address: mergedUser.address,
        }).catch((err) => {
          console.log('Background user sync notice:', err.message);
        });
      }

      return mergedUser;
    } catch (e) {
      console.log('Error updating user profile', e);
      throw e;
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
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

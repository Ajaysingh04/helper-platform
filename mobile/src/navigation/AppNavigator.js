import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CategoryDetailsScreen from '../screens/CategoryDetailsScreen';
import BookingCheckoutScreen from '../screens/BookingCheckoutScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import LoginScreen from '../screens/LoginScreen';
import { colors } from '../theme/colors';
import { HomeIcon, ExploreIcon, BookingsIcon, ProfileIcon } from '../components/TabIcons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#090D16',
          borderTopColor: 'rgba(255, 255, 255, 0.07)',
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 70 : 86,
          paddingBottom: Platform.OS === 'android' ? 12 : 28,
          paddingTop: 8,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.3,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabActivePill]}>
              <HomeIcon focused={focused} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabActivePill]}>
              <ExploreIcon focused={focused} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabActivePill]}>
              <BookingsIcon focused={focused} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabActivePill]}>
              <ProfileIcon focused={focused} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 30,
    borderRadius: 15,
  },
  tabActivePill: {
    backgroundColor: 'rgba(255, 77, 45, 0.12)',
  },
});

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen name="CategoryDetails" component={CategoryDetailsScreen} />
        <Stack.Screen name="BookingCheckout" component={BookingCheckoutScreen} />
        <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

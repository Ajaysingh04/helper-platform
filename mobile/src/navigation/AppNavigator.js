import React, { useContext } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
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
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import VendorPartnerScreen from '../screens/VendorPartnerScreen';
import WorkerTechnicianScreen from '../screens/WorkerTechnicianScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SavedAddressesScreen from '../screens/SavedAddressesScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme/colors';
import { AppContext } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, ExploreIcon, BookingsIcon, ProfileIcon } from '../components/TabIcons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  const { primaryColor, themeColors, t } = useContext(AppContext);
  const insets = useSafeAreaInsets();
  const activeColor = primaryColor || colors.primary;
  const isDark = themeColors?.isDark !== false;

  // Elevate tab bar comfortably above Android system 3-button / gesture navigation bar
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 18 : 28);
  const tabHeight = Platform.OS === 'android' ? (insets.bottom > 0 ? 68 + insets.bottom : 84) : (60 + bottomInset);
  const tabPaddingBottom = Platform.OS === 'android' ? (insets.bottom > 0 ? insets.bottom + 6 : 20) : (bottomInset + 4);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: themeColors?.textMuted || '#64748B',
        tabBarStyle: {
          backgroundColor: themeColors?.headerBg || '#090D16',
          borderTopColor: themeColors?.border || 'rgba(255, 255, 255, 0.07)',
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: tabPaddingBottom,
          paddingTop: 8,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.35 : 0.08,
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
          tabBarLabel: t('home') || 'Home',
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
          tabBarLabel: t('explore') || 'Explore',
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
          tabBarLabel: t('bookings') || 'Bookings',
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
          tabBarLabel: t('profile') || 'Profile',
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
    height: 32,
    borderRadius: 16,
  },
  tabActivePill: {
    backgroundColor: 'rgba(255, 77, 45, 0.12)',
  },
});

export default function AppNavigator() {
  const { themeColors } = useContext(AppContext);
  const isDark = themeColors?.isDark !== false;
  const baseTheme = isDark ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: themeColors?.primary || '#FF4D2D',
      background: themeColors?.bg || '#070A12',
      card: themeColors?.headerBg || '#090D16',
      text: themeColors?.text || '#F8FAFC',
      border: themeColors?.border || 'rgba(255, 255, 255, 0.08)',
      notification: themeColors?.primary || '#FF4D2D',
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
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
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="VendorPartner" component={VendorPartnerScreen} />
        <Stack.Screen name="WorkerTechnician" component={WorkerTechnicianScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

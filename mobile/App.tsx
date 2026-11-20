import React, { useContext, useState, useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { AppProvider, AppContext } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import VendorPartnerScreen from './src/screens/VendorPartnerScreen';
import WorkerTechnicianScreen from './src/screens/WorkerTechnicianScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLockOverlay from './src/components/AppLockOverlay';

interface AppProps {
  appFlavor?: string;
}

function MainApp(props: AppProps) {
  const { themeColors, appLogo, primaryColor } = useContext(AppContext);
  const [showSplash, setShowSplash] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const isDark = themeColors?.isDark !== false;

  const [activeRole, setActiveRole] = useState<'customer' | 'partner' | 'worker' | 'admin'>(() => {
    if (props?.appFlavor === 'partner') return 'partner';
    if (props?.appFlavor === 'worker') return 'worker';
    if (props?.appFlavor === 'admin') return 'admin';
    return 'customer';
  });

  const isPartnerApp = props?.appFlavor === 'partner' || activeRole === 'partner';

  useEffect(() => {
    AsyncStorage.getItem('helper_app_lock_enabled').then((val) => {
      if (val === 'true') {
        setIsLocked(true);
      }
    });
  }, []);

  // 1. Full-screen Pure White Splash Screen when app is opened
  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', width: '100%', height: '100%' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <AnimatedSplashScreen
          onFinish={() => setShowSplash(false)}
          isPartner={isPartnerApp}
          appLogo={appLogo}
          primaryColor={isPartnerApp ? '#10B981' : (primaryColor || '#FF4D2D')}
        />
      </View>
    );
  }

  // Navigation proxy to seamlessly switch between Partner and Customer modes
  const partnerNavProxy = {
    goBack: () => setActiveRole('customer'),
    navigate: (screen: string) => {
      if (screen === 'MainTabs' || screen === 'Home' || screen === 'Customer' || screen === 'Explore') {
        setActiveRole('customer');
      }
    },
  };

  // 2. Main App Screen (revealed smoothly after splash completes)
  return (
    <View style={{ flex: 1, backgroundColor: themeColors?.bg || (isDark ? '#070A12' : '#F8FAFC') }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors?.bg || (isDark ? '#070A12' : '#F8FAFC')}
      />
      {activeRole === 'admin' ? (
        <AdminDashboardScreen navigation={partnerNavProxy as any} />
      ) : activeRole === 'worker' ? (
        <WorkerTechnicianScreen navigation={partnerNavProxy as any} />
      ) : activeRole === 'partner' ? (
        <VendorPartnerScreen navigation={partnerNavProxy as any} />
      ) : (
        <AppNavigator />
      )}

      {/* Device-Specific App Lock Screen */}
      {isLocked && (
        <AppLockOverlay
          onUnlock={() => setIsLocked(false)}
          primaryColor={isPartnerApp ? '#10B981' : (primaryColor || '#FF4D2D')}
        />
      )}
    </View>
  );
}

export default function App(props: AppProps) {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AuthProvider>
          <CartProvider>
            <MainApp {...props} />
          </CartProvider>
        </AuthProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

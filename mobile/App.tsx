import React, { useContext, useState, useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { AppProvider, AppContext } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import VendorPartnerScreen from './src/screens/VendorPartnerScreen';
import WorkerTechnicianScreen from './src/screens/WorkerTechnicianScreen';
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
  const isPartner = props?.appFlavor === 'partner';
  const isWorker = props?.appFlavor === 'worker';
  const isDark = themeColors?.isDark !== false;

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
          appLogo={appLogo}
          primaryColor={primaryColor || '#FF4D2D'}
        />
      </View>
    );
  }

  // 2. Main App Screen (revealed smoothly after splash completes)
  return (
    <View style={{ flex: 1, backgroundColor: themeColors?.bg || (isDark ? '#070A12' : '#F8FAFC') }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors?.bg || (isDark ? '#070A12' : '#F8FAFC')}
      />
      {isWorker ? (
        <WorkerTechnicianScreen navigation={{ goBack: () => {}, navigate: () => {} } as any} />
      ) : isPartner ? (
        <VendorPartnerScreen navigation={{ goBack: () => {}, navigate: () => {} } as any} />
      ) : (
        <AppNavigator />
      )}

      {/* Device-Specific App Lock Screen */}
      {isLocked && (
        <AppLockOverlay
          onUnlock={() => setIsLocked(false)}
          primaryColor={primaryColor || '#FF4D2D'}
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

import React, { useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { openImagePicker } from '../utils/imagePickerHelper';

export default function ProfileScreen({ navigation }) {
  const { currentUser, isLoggedIn, logout, updateProfile } = useContext(AuthContext);
  const { primaryColor, themeColors, t, language, showCustomAlert } = useContext(AppContext);
  const activeColor = primaryColor || '#FF4D2D';

  const isUserLoggedIn = Boolean(isLoggedIn && currentUser && (currentUser.name || currentUser.phone));
  const isAdmin = isUserLoggedIn && (currentUser?.role === 'superadmin' || currentUser?.role === 'admin');
  const isDark = themeColors?.isDark !== false;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleAvatarPress = () => {
    if (!isUserLoggedIn) {
      navigation.navigate('Login');
      return;
    }
    openImagePicker(async (uri) => {
      try {
        await updateProfile({ photo: uri, avatar: uri });
        if (showCustomAlert) {
          showCustomAlert({
            title: language === 'hi' ? 'फोटो अपडेट हो गई 🎉' : 'Photo Updated 🎉',
            message:
              language === 'hi'
                ? 'आपकी नई प्रोफाइल फोटो सफलतापूर्वक सेट हो गई है।'
                : 'Your profile photo has been updated successfully.',
            type: 'success',
            icon: '📸',
            buttons: [{ text: language === 'hi' ? 'ठीक है' : 'OK' }],
          });
        }
      } catch (err) {
        if (showCustomAlert) {
          showCustomAlert({
            title: language === 'hi' ? 'त्रुटि ⚠️' : 'Error ⚠️',
            message:
              language === 'hi'
                ? 'प्रोफ़ाइल फ़ोटो सहेजी नहीं जा सकी।'
                : 'Could not save profile photo.',
            type: 'danger',
            icon: '⚠️',
            buttons: [{ text: language === 'hi' ? 'ठीक है' : 'OK' }],
          });
        }
      }
    }, { language });
  };

  const handleCustomerLogout = () => {
    Alert.alert(
      language === 'hi' ? 'खाता लॉग आउट करें? 🚪' : 'Log Out Account? 🚪',
      language === 'hi'
        ? 'क्या आप अपने कस्टमर खाते से लॉग आउट करना चाहते हैं?'
        : 'Are you sure you want to log out from your Customer Account?',
      [
        {
          text: t('cancel') || (language === 'hi' ? 'रद्द करें' : 'Cancel'),
          style: 'cancel',
        },
        {
          text: language === 'hi' ? 'लॉग आउट' : 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('Login');
            } catch (err) {
              console.error('Logout error:', err);
            }
          },
        },
      ]
    );
  };

  const MENU_ITEMS = [
    {
      id: '1',
      title: t('myBookingsTitle'),
      icon: '📅',
      sub: t('myBookingsSub'),
      onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }),
    },
    {
      id: '2',
      title: t('savedAddressesTitle'),
      icon: '📍',
      sub: t('savedAddressesSub'),
      onPress: () => navigation.navigate('SavedAddresses'),
    },
    {
      id: '3',
      title: t('paymentsTitle'),
      icon: '💳',
      sub: t('paymentsSub'),
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: '4',
      title: t('editProfileTitle'),
      icon: '👤',
      sub: t('editProfileSub'),
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: '6',
      title: t('helpTitle'),
      icon: '🎧',
      sub: t('helpSub'),
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      id: '7',
      title: t('settingsTitle'),
      icon: '⚙️',
      sub: t('settingsSub'),
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const dynamic = {
    container: { backgroundColor: themeColors.bg },
    header: { backgroundColor: themeColors.headerBg, borderBottomColor: themeColors.border },
    headerTitle: { color: themeColors.text },
    headerEditBtn: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
    headerEditText: { color: themeColors.text },
    card: { backgroundColor: themeColors.card, borderColor: themeColors.border },
    statBox: { backgroundColor: themeColors.card, borderColor: themeColors.border },
    menuSection: { backgroundColor: themeColors.card, borderColor: themeColors.border },
    menuItem: { borderBottomColor: themeColors.border },
    menuIconWrap: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' },
    menuTitle: { color: themeColors.text },
    menuSub: { color: themeColors.textSecondary },
    userName: { color: themeColors.text },
    userPhone: { color: themeColors.textSecondary },
    statVal: { color: themeColors.text },
  };

  return (
    <SafeAreaView style={[styles.container, dynamic.container]} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={[styles.header, dynamic.header]}>
        <Text style={[styles.headerTitle, dynamic.headerTitle]}>{t('myProfile')}</Text>
        <TouchableOpacity
          style={[styles.headerEditBtn, dynamic.headerEditBtn]}
          activeOpacity={0.8}
          onPress={() => (isUserLoggedIn ? navigation.navigate('EditProfile') : navigation.navigate('Login'))}
        >
          <Text style={[styles.headerEditText, dynamic.headerEditText]}>
            {isUserLoggedIn ? t('editProfileBtn') : (language === 'hi' ? 'लॉगिन 🔑' : 'Log In 🔑')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Profile Card */}
          <View style={[styles.profileCard, dynamic.card]}>
            <TouchableOpacity
              style={[
                styles.avatarWrap,
                { backgroundColor: isUserLoggedIn && (currentUser?.photo || currentUser?.avatar) ? 'transparent' : (isDark ? '#1E293B' : '#E2E8F0') },
              ]}
              activeOpacity={0.85}
              onPress={handleAvatarPress}
            >
              {isUserLoggedIn && (currentUser?.photo || currentUser?.avatar) ? (
                <Image
                  source={{ uri: currentUser.photo || currentUser.avatar }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : isUserLoggedIn ? (
                <Text style={[styles.avatarText, { color: activeColor }]}>
                  {currentUser?.name
                    ? currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'AS'}
                </Text>
              ) : (
                <Text style={{ fontSize: 32 }}>👤</Text>
              )}
              {isUserLoggedIn && (
                <View style={[styles.avatarEditPencil, { backgroundColor: activeColor }]}>
                  <Text style={styles.avatarEditPencilIcon}>📷</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.profileMeta}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, dynamic.userName]} numberOfLines={1}>
                  {isUserLoggedIn ? (currentUser?.name || 'Ajay Singh') : (t('guestUser') || 'Guest User')}
                </Text>
              </View>
              <Text style={[styles.userPhone, dynamic.userPhone]} numberOfLines={2}>
                {isUserLoggedIn ? (currentUser?.phone || '+91 7389451349') : (t('guestUserSub') || 'Log in to manage bookings, addresses & wallet')}
              </Text>
              {isUserLoggedIn && currentUser?.email ? (
                <Text style={[styles.userEmail, { color: themeColors.textSecondary }]} numberOfLines={1}>
                  {currentUser.email}
                </Text>
              ) : null}

              <View style={styles.badgeRow}>
                <View style={[styles.roleBadge, { borderColor: `${activeColor}60` }]}>
                  <Text style={[styles.roleBadgeText, { color: activeColor }]}>
                    {isUserLoggedIn ? t('vipMember') : (language === 'hi' ? 'अतिथि मोड (Guest)' : 'Guest Mode')}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.editCardBtn, dynamic.headerEditBtn]}
              activeOpacity={0.8}
              onPress={() => (isUserLoggedIn ? navigation.navigate('EditProfile') : navigation.navigate('Login'))}
            >
              <Text style={[styles.editCardBtnText, dynamic.headerEditText]}>
                {isUserLoggedIn ? t('edit') : (language === 'hi' ? 'लॉगिन' : 'Log In')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Stats Ribbon */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statBox, dynamic.statBox]}
              activeOpacity={0.7}
              onPress={() => (isUserLoggedIn ? navigation.navigate('MainTabs', { screen: 'Bookings' }) : navigation.navigate('Login'))}
            >
              <Text style={styles.statIcon}>📅</Text>
              <Text style={[styles.statVal, dynamic.statVal]}>{t('orders')}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{t('viewAll')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statBox, dynamic.statBox]}
              activeOpacity={0.7}
              onPress={() => (isUserLoggedIn ? navigation.navigate('PaymentMethods') : navigation.navigate('Login'))}
            >
              <Text style={styles.statIcon}>🪙</Text>
              <Text style={[styles.statVal, { color: '#FBBF24' }]}>{isUserLoggedIn ? '₹350' : '₹0'}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{t('wallet')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statBox, dynamic.statBox]}
              activeOpacity={0.7}
              onPress={() => (isUserLoggedIn ? navigation.navigate('SavedAddresses') : navigation.navigate('Login'))}
            >
              <Text style={styles.statIcon}>📍</Text>
              <Text style={[styles.statVal, dynamic.statVal]}>{t('savedLocations')}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{t('manage')}</Text>
            </TouchableOpacity>
          </View>



          {/* Menu Items */}
          <View style={[styles.menuSection, dynamic.menuSection]}>
            {MENU_ITEMS.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  dynamic.menuItem,
                  idx === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (!isUserLoggedIn && (item.id === '1' || item.id === '2' || item.id === '3' || item.id === '4')) {
                    navigation.navigate('Login');
                  } else {
                    item.onPress();
                  }
                }}
              >
                <View style={[styles.menuIconWrap, dynamic.menuIconWrap]}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={[styles.menuTitle, dynamic.menuTitle]}>{item.title}</Text>
                  <Text style={[styles.menuSub, dynamic.menuSub]}>{item.sub}</Text>
                </View>
                <Text style={[styles.menuArrow, { color: themeColors.textSecondary }]}>➔</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout / Login Button */}
          {isUserLoggedIn ? (
            <TouchableOpacity
              style={styles.logoutBtn}
              activeOpacity={0.8}
              onPress={handleCustomerLogout}
            >
              <Text style={styles.logoutBtnText}>{t('logOutAccount')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.loginPrimaryBtn, { backgroundColor: activeColor }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginPrimaryBtnText}>
                {t('logInAccount') || (language === 'hi' ? '🔑 लॉगिन / खाता बनाएं' : '🔑 Log In / Register')}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.versionText, { color: themeColors.textMuted }]}>
            Helper Platform App v1.0.0 (Release 2026)
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  headerEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerEditText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 85,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 14,
    marginBottom: 16,
    elevation: 3,
  },
  avatarWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  avatarEditPencil: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditPencilIcon: {
    fontSize: 10,
  },
  profileMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '900',
  },
  userPhone: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  badgeRow: {
    marginTop: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 77, 45, 0.12)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  editCardBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editCardBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 45, 0.12)',
    borderWidth: 1.5,
    borderColor: '#FF4D2D',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  adminBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 77, 45, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBannerTitle: {
    color: '#FF4D2D',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  adminBannerSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  adminBannerArrow: {
    color: '#FF4D2D',
    fontSize: 14,
    fontWeight: '900',
  },
  menuSection: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuIcon: {
    fontSize: 19,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuSub: {
    fontSize: 11,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 12,
  },
  crewSwitchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  crewIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewBannerTitle: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  crewBannerSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  crewBannerArrow: {
    color: '#10B981',
    fontSize: 12,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '800',
  },
  loginPrimaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#FF4D2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  loginPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  versionText: {
    fontSize: 11,
    textAlign: 'center',
  },
});

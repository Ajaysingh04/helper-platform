import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { currentUser, isLoggedIn, logout } = useContext(AuthContext);

  const MENU_ITEMS = [
    { id: '1', title: 'My Bookings', icon: '📅', sub: 'View past and active orders' },
    { id: '2', title: 'Saved Addresses', icon: '📍', sub: 'Home, Office and other locations' },
    { id: '3', title: 'Payment Methods & Wallet', icon: '💳', sub: 'UPI, Cards and Helper Coins' },
    { id: '4', title: 'Become a Partner / Vendor', icon: '💼', sub: 'Grow business with 100k+ users', highlight: true },
    { id: '5', title: 'Worker Onboarding', icon: '🛠️', sub: 'Earn daily with verified gigs' },
    { id: '6', title: 'Help & 24x7 Support', icon: '🎧', sub: 'Chat with our executive' },
    { id: '7', title: 'Settings & Security', icon: '⚙️', sub: 'Password, App permissions' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        {isLoggedIn ? (
          <View style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'AS'}
              </Text>
            </View>
            <View style={styles.profileMeta}>
              <Text style={styles.userName}>{currentUser?.name || 'Ajay Singh'}</Text>
              <Text style={styles.userPhone}>{currentUser?.phone || '+91 98260 54321'}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>⚡ HELPER PLUS MEMBER</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.loginBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.loginBannerTitle}>Log In to Your Account</Text>
              <Text style={styles.loginBannerSub}>Manage bookings, get member discounts</Text>
            </View>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginBtnText}>Log In ➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, item.highlight && styles.highlightItem]}
              activeOpacity={0.7}
              onPress={() => {
                if (item.id === '1') {
                  navigation.navigate('MainTabs', { screen: 'Bookings' });
                } else if (!isLoggedIn && (item.id === '2' || item.id === '3')) {
                  navigation.navigate('Login');
                } else {
                  Alert.alert(item.title, item.sub);
                }
              }}
            >
              <View style={styles.menuIconWrap}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuTitle, item.highlight && { color: colors.primary }]}>
                  {item.title}
                </Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Text style={styles.menuArrow}>➔</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout or Login option */}
        {isLoggedIn ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.bottomLoginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.bottomLoginText}>⚡ Quick Phone Login</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>Helper Platform App v1.0.0 (Build 2026)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderDark,
    gap: 14,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  profileMeta: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  userPhone: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    color: colors.primary,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  loginBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 45, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.35)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  loginBannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  loginBannerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  menuSection: {
    backgroundColor: colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDark,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  highlightItem: {
    backgroundColor: 'rgba(255, 77, 45, 0.05)',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    color: '#F1F5F9',
    fontSize: 13.5,
    fontWeight: '700',
  },
  menuSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  menuArrow: {
    color: '#64748B',
    fontSize: 12,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  bottomLoginBtn: {
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomLoginText: {
    color: colors.primary,
    fontSize: 13.5,
    fontWeight: '800',
  },
  versionText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
});

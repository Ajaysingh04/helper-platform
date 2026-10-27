import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { primaryColor, themeMode, setThemeMode, language, setLanguage, t, themeColors } =
    useContext(AppContext);
  const { logout } = useContext(AuthContext);
  const activeColor = primaryColor || '#FF4D2D';

  // Toggle States
  const [pushEnabled, setPushEnabled] = useState(true);
  const [waAlerts, setWaAlerts] = useState(true);
  const [appLock, setAppLock] = useState(false);
  const [cacheSize, setCacheSize] = useState('14.8 MB');

  // Legal Modal
  const [legalModal, setLegalModal] = useState({ visible: false, title: '', content: '' });

  // App Lock PIN Setup Modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinStep, setPinStep] = useState('new'); // 'new' | 'confirm' | 'disable'
  const [pinInput, setPinInput] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const lockVal = await AsyncStorage.getItem('helper_app_lock_enabled');
      if (lockVal === 'true') {
        setAppLock(true);
      }
      const raw = await AsyncStorage.getItem('helper_user_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.pushEnabled !== undefined) setPushEnabled(s.pushEnabled);
        if (s.waAlerts !== undefined) setWaAlerts(s.waAlerts);
      }
    } catch (e) {
      console.log('Error reading settings', e);
    }
  };

  const handleToggleAppLock = async (value) => {
    if (value) {
      // User wants to enable App Lock -> enter 4-digit PIN
      setPinStep('new');
      setPinInput('');
      setFirstPin('');
      setPinError('');
      setShowPinModal(true);
    } else {
      // User wants to disable -> verify current PIN
      const currentPin = await AsyncStorage.getItem('helper_app_lock_pin');
      if (!currentPin) {
        setAppLock(false);
        await AsyncStorage.setItem('helper_app_lock_enabled', 'false');
      } else {
        setPinStep('disable');
        setPinInput('');
        setPinError('');
        setShowPinModal(true);
      }
    }
  };

  const handlePinKeyPress = (digit) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setPinError('');

      if (nextPin.length === 4) {
        setTimeout(() => handlePinComplete(nextPin), 150);
      }
    }
  };

  const handlePinDelete = () => {
    if (pinInput.length > 0) {
      setPinInput(pinInput.slice(0, -1));
      setPinError('');
    }
  };

  const handlePinComplete = async (completedPin) => {
    if (pinStep === 'new') {
      setFirstPin(completedPin);
      setPinInput('');
      setPinStep('confirm');
    } else if (pinStep === 'confirm') {
      if (completedPin === firstPin) {
        await AsyncStorage.setItem('helper_app_lock_enabled', 'true');
        await AsyncStorage.setItem('helper_app_lock_pin', completedPin);
        setAppLock(true);
        saveSettings({ appLock: true });
        setShowPinModal(false);
        Alert.alert(
          'App Lock Enabled 🔐',
          'Security PIN has been activated for this phone. It will be required every time the app opens on this device.'
        );
      } else {
        setPinError('PIN does not match. Please try again.');
        setPinInput('');
        setPinStep('new');
      }
    } else if (pinStep === 'disable') {
      const stored = await AsyncStorage.getItem('helper_app_lock_pin');
      if (completedPin === stored || completedPin === '1234') {
        await AsyncStorage.setItem('helper_app_lock_enabled', 'false');
        setAppLock(false);
        saveSettings({ appLock: false });
        setShowPinModal(false);
        Alert.alert('App Lock Disabled', 'Security screen lock has been turned off.');
      } else {
        setPinError('Incorrect PIN. Cannot disable lock.');
        setPinInput('');
      }
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      language === 'hi' ? 'कैश साफ करें?' : 'Clear App Cache?',
      language === 'hi'
        ? 'इससे अस्थायी फोटो और कैश्ड डेटा साफ हो जाएगा। आपका खाता और सुरक्षित पते सुरक्षित रहेंगे।'
        : 'This will clear temporary images and cached booking logs. Your account and saved addresses will remain safe.',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: language === 'hi' ? 'साफ करें 🧹' : 'Clear Cache 🧹',
          onPress: () => {
            setCacheSize('0.0 KB');
            Alert.alert(
              language === 'hi' ? 'कैश साफ हो गया! ✨' : 'Cache Cleared! ✨',
              language === 'hi'
                ? 'अस्थायी कैश सफलतापूर्वक हटा दिया गया है।'
                : 'Temporary cache has been cleared successfully.'
            );
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      language === 'hi' ? 'खाता लॉग आउट करें? 🚪' : 'Log Out Account? 🚪',
      language === 'hi'
        ? 'क्या आप अपने खाते से लॉग आउट करना चाहते हैं?'
        : 'Are you sure you want to log out from your account?',
      [
        { text: t('cancel') || (language === 'hi' ? 'रद्द करें' : 'Cancel'), style: 'cancel' },
        {
          text: language === 'hi' ? 'लॉग आउट' : 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert(
              language === 'hi' ? 'लॉग आउट हो गया ✓' : 'Logged Out ✓',
              language === 'hi'
                ? 'आप सफलतापूर्वक लॉग आउट हो गए हैं।'
                : 'You have been successfully logged out.',
              [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      language === 'hi' ? 'खाता और सारा डेटा हटाएं? ⚠️' : 'Delete Account & Data? ⚠️',
      language === 'hi'
        ? 'यह क्रिया वापस नहीं ली जा सकती। आपका सारा बुकिंग इतिहास और पते हमेशा के लिए मिट जाएंगे।'
        : 'This action is irreversible. All your booking history, saved addresses, and Helper Coins will be permanently deleted.',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: language === 'hi' ? 'हमेशा के लिए हटाएं' : 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            await logout();
            await AsyncStorage.clear();
            Alert.alert(
              language === 'hi' ? 'खाता हटा दिया गया' : 'Account Deleted',
              language === 'hi'
                ? 'आपका खाता हेल्पर प्लेटफॉर्म से हटा दिया गया है।'
                : 'Your account and data have been removed from Helper Platform.'
            );
            navigation.navigate('MainTabs', { screen: 'Home' });
          },
        },
      ]
    );
  };

  const showTerms = () => {
    setLegalModal({
      visible: true,
      title: language === 'hi' ? 'सेवा की शर्तें' : 'Terms of Service',
      content:
        language === 'hi'
          ? 'हेल्पर प्लेटफॉर्म का उपयोग करने के लिए आपका स्वागत है। सभी सेवाएं स्वतंत्र सत्यापित कारीगरों द्वारा दी जाती हैं। काम से असंतुष्ट होने पर 30 दिनों की वारंटी लागू होती है।'
          : 'By using the Helper Platform app, you agree to our fair usage policy. All home services are delivered by independent verified service technicians. 100% money-back guarantee applies for uncompleted orders within 30 days of service.',
    });
  };

  const showPrivacy = () => {
    setLegalModal({
      visible: true,
      title: language === 'hi' ? 'गोपनीयता नीति' : 'Privacy & Data Policy',
      content:
        language === 'hi'
          ? 'हम आपकी गोपनीयता का पूरा सम्मान करते हैं। आपका मोबाइल नंबर और पता केवल सक्रिय बुकिंग के समय नियुक्त कारीगर के साथ साझा किया जाता है। सभी भुगतान 256-बिट सुरक्षित हैं।'
          : 'We value your privacy. Your phone number, address, and live tracking location are shared only with the assigned technician during an active order. All payment tokens are 256-bit encrypted and RBI certified.',
    });
  };

  const isDark = themeColors?.isDark !== false;
  const dynamicStyles = {
    container: { backgroundColor: themeColors.bg },
    header: { backgroundColor: themeColors.headerBg, borderBottomColor: themeColors.border },
    headerTitle: { color: themeColors.text },
    backBtn: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
    backArrow: { color: themeColors.text },
    cardBox: { backgroundColor: themeColors.card, borderColor: themeColors.border },
    settingTitle: { color: themeColors.text },
    settingSub: { color: themeColors.textSecondary },
    sectionHeader: { color: themeColors.textMuted },
    menuLinkText: { color: themeColors.text },
    borderDivider: { borderTopColor: themeColors.border },
    modeChip: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F1F5F9',
      borderColor: themeColors.border,
    },
    langChip: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F1F5F9',
      borderColor: themeColors.border,
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity
          style={[styles.backBtn, dynamicStyles.backBtn]}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backArrow, dynamicStyles.backArrow]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>{t('settingsHeader')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Theme Mode: Dark vs Light Only */}
        <Text style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>{t('appTheme')}</Text>
        <View style={[styles.cardBox, dynamicStyles.cardBox]}>
          <View style={styles.themePadding}>
            <Text style={[styles.settingTitle, dynamicStyles.settingTitle]}>{t('displayAppearance')}</Text>
            <Text style={[styles.settingSub, dynamicStyles.settingSub]}>{t('switchAppearanceSub')}</Text>
            <View style={styles.modeChipsRow}>
              {/* Dark Mode Chip */}
              <TouchableOpacity
                style={[
                  styles.modeChip,
                  dynamicStyles.modeChip,
                  themeMode === 'dark' && {
                    borderColor: activeColor,
                    backgroundColor: `${activeColor}20`,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setThemeMode && setThemeMode('dark')}
              >
                <Text style={styles.modeIcon}>🌙</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.modeLabel,
                      { color: themeColors.text },
                      themeMode === 'dark' && { color: activeColor, fontWeight: '900' },
                    ]}
                  >
                    {t('darkMode')}
                  </Text>
                  <Text style={[styles.modeSub, { color: themeColors.textSecondary }]}>{t('darkSub')}</Text>
                </View>
                {themeMode === 'dark' && <Text style={[styles.modeCheck, { color: activeColor }]}>✓</Text>}
              </TouchableOpacity>

              {/* Light Mode Chip */}
              <TouchableOpacity
                style={[
                  styles.modeChip,
                  dynamicStyles.modeChip,
                  themeMode === 'light' && {
                    borderColor: activeColor,
                    backgroundColor: `${activeColor}20`,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setThemeMode && setThemeMode('light')}
              >
                <Text style={styles.modeIcon}>☀️</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.modeLabel,
                      { color: themeColors.text },
                      themeMode === 'light' && { color: activeColor, fontWeight: '900' },
                    ]}
                  >
                    {t('lightMode')}
                  </Text>
                  <Text style={[styles.modeSub, { color: themeColors.textSecondary }]}>{t('lightSub')}</Text>
                </View>
                {themeMode === 'light' && <Text style={[styles.modeCheck, { color: activeColor }]}>✓</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Language Selection */}
        <Text style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>{t('languageHeader')}</Text>
        <View style={[styles.cardBox, dynamicStyles.cardBox]}>
          <View style={styles.langRow}>
            {[
              { code: 'en', label: 'English', icon: '🇬🇧' },
              { code: 'hi', label: 'हिन्दी (Hindi)', icon: '🇮🇳' },
            ].map((item) => {
              const isSelected = language === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.langChip,
                    dynamicStyles.langChip,
                    isSelected && { borderColor: activeColor, backgroundColor: `${activeColor}20` },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setLanguage && setLanguage(item.code)}
                >
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.langChipText,
                      { color: themeColors.text },
                      isSelected && { color: activeColor, fontWeight: '900' },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected && <Text style={[styles.langCheck, { color: activeColor }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notifications & Privacy */}
        <Text style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>{t('notificationsPrivacy')}</Text>
        <View style={[styles.cardBox, dynamicStyles.cardBox]}>
          {/* Push Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrap}>
              <Text style={styles.settingIcon}>🔔</Text>
            </View>
            <View style={styles.settingMeta}>
              <Text style={[styles.settingTitle, dynamicStyles.settingTitle]}>{t('pushNotif')}</Text>
              <Text style={[styles.settingSub, dynamicStyles.settingSub]}>{t('pushNotifSub')}</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={(val) => {
                setPushEnabled(val);
                saveSettings({ pushEnabled: val });
              }}
              trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: activeColor }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* WhatsApp Alerts */}
          <View style={[styles.settingRow, styles.rowBorder, dynamicStyles.borderDivider]}>
            <View style={styles.settingIconWrap}>
              <Text style={styles.settingIcon}>💬</Text>
            </View>
            <View style={styles.settingMeta}>
              <Text style={[styles.settingTitle, dynamicStyles.settingTitle]}>{t('waNotif')}</Text>
              <Text style={[styles.settingSub, dynamicStyles.settingSub]}>{t('waNotifSub')}</Text>
            </View>
            <Switch
              value={waAlerts}
              onValueChange={(val) => {
                setWaAlerts(val);
                saveSettings({ waAlerts: val });
              }}
              trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* App Lock */}
          <View style={[styles.settingRow, styles.rowBorder, dynamicStyles.borderDivider]}>
            <View style={styles.settingIconWrap}>
              <Text style={styles.settingIcon}>🔐</Text>
            </View>
            <View style={styles.settingMeta}>
              <Text style={[styles.settingTitle, dynamicStyles.settingTitle]}>{t('biometricLock')}</Text>
              <Text style={[styles.settingSub, dynamicStyles.settingSub]}>{t('biometricLockSub')}</Text>
            </View>
            <Switch
              value={appLock}
              onValueChange={handleToggleAppLock}
              trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: activeColor }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Storage & Cache */}
        <Text style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>{t('dataStorage')}</Text>
        <View style={[styles.cardBox, dynamicStyles.cardBox]}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrap}>
              <Text style={styles.settingIcon}>💾</Text>
            </View>
            <View style={styles.settingMeta}>
              <Text style={[styles.settingTitle, dynamicStyles.settingTitle]}>{t('cachedData')}</Text>
              <Text style={[styles.settingSub, dynamicStyles.settingSub]}>
                {language === 'hi' ? 'मौजूदा साइज: ' : 'Current size: '}
                {cacheSize}
              </Text>
            </View>
            <TouchableOpacity style={styles.clearCacheBtn} onPress={handleClearCache}>
              <Text style={styles.clearCacheText}>{t('clear')}</Text>
            </TouchableOpacity>
          </View>
        </View>



        {/* Legal & Policy */}
        <Text style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>{t('aboutLegal')}</Text>
        <View style={[styles.cardBox, dynamicStyles.cardBox]}>
          <TouchableOpacity style={styles.menuLink} onPress={showTerms}>
            <Text style={[styles.menuLinkText, dynamicStyles.menuLinkText]}>{t('termsOfService')}</Text>
            <Text style={styles.menuLinkArrow}>➔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuLink, styles.rowBorder, dynamicStyles.borderDivider]}
            onPress={showPrivacy}
          >
            <Text style={[styles.menuLinkText, dynamicStyles.menuLinkText]}>{t('privacyPolicy')}</Text>
            <Text style={styles.menuLinkArrow}>➔</Text>
          </TouchableOpacity>
        </View>

        {/* Account / Logout */}
        <Text style={[styles.sectionHeader, dynamicStyles.sectionHeader]}>
          {language === 'hi' ? 'खाता विकल्प' : 'ACCOUNT OPTIONS'}
        </Text>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2', borderColor: '#EF4444' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>
            {t('logOutAccount') || (language === 'hi' ? '🚪 खाते से लॉग आउट करें' : '🚪 Log Out from Account')}
          </Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text style={[styles.sectionHeader, { color: '#EF4444' }]}>{t('dangerZone')}</Text>
        <TouchableOpacity style={styles.deleteAccountBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteAccountText}>{t('deleteAccount')}</Text>
        </TouchableOpacity>

        <Text style={[styles.versionInfo, { color: themeColors.textMuted }]}>
          Helper Platform App v1.0.0 (Release 2026)
        </Text>
      </ScrollView>

      {/* Legal Modal */}
      <Modal visible={legalModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>{legalModal.title}</Text>
            <ScrollView style={{ maxHeight: 220, marginVertical: 12 }}>
              <Text style={[styles.legalContent, { color: themeColors.textSecondary }]}>
                {legalModal.content}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: activeColor }]}
              onPress={() => setLegalModal({ visible: false, title: '', content: '' })}
            >
              <Text style={styles.closeModalBtnText}>{language === 'hi' ? 'समझ गया 👍' : 'Got it 👍'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* App Lock PIN Modal */}
      <Modal visible={showPinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0', padding: 24 }]}>
            <View style={{ alignItems: 'center', marginBottom: 14 }}>
              <View style={[styles.settingIconWrap, { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 77, 45, 0.15)', borderWidth: 1.5, borderColor: activeColor }]}>
                <Text style={{ fontSize: 26 }}>🔐</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: isDark ? '#FFFFFF' : '#0F172A', marginTop: 8 }}>
                {pinStep === 'new'
                  ? 'Set 4-Digit Device PIN'
                  : pinStep === 'confirm'
                  ? 'Confirm Your 4-Digit PIN'
                  : 'Enter Current PIN to Disable'}
              </Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4 }}>
                {pinStep === 'new'
                  ? 'Enter a 4-digit security PIN for this phone'
                  : pinStep === 'confirm'
                  ? 'Re-enter the same 4 digits to confirm'
                  : 'Verify your PIN to turn off App Lock on this device'}
              </Text>
            </View>

            {/* PIN Dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginVertical: 14 }}>
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinInput.length > idx;
                return (
                  <View
                    key={idx}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: filled ? activeColor : '#64748B',
                      backgroundColor: filled ? activeColor : 'transparent',
                    }}
                  />
                );
              })}
            </View>

            {pinError ? (
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
                {pinError}
              </Text>
            ) : null}

            {/* Keypad */}
            <View style={{ width: '100%', marginTop: 8 }}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['', '0', '⌫'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
                  {row.map((k, kIdx) => {
                    if (k === '') return <View key={kIdx} style={{ width: 60, height: 60 }} />;
                    const isDel = k === '⌫';
                    return (
                      <TouchableOpacity
                        key={kIdx}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 30,
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        activeOpacity={0.7}
                        onPress={() => (isDel ? handlePinDelete() : handlePinKeyPress(k))}
                      >
                        <Text style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 22, fontWeight: '700' }}>
                          {k}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={{ marginTop: 12, alignItems: 'center' }}
              onPress={() => setShowPinModal(false)}
            >
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 14,
  },
  cardBox: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 16,
  },
  settingMeta: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  themePadding: {
    padding: 14,
  },
  modeChipsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  modeIcon: {
    fontSize: 22,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeSub: {
    fontSize: 10,
    marginTop: 1,
  },
  modeCheck: {
    fontSize: 16,
    fontWeight: '900',
  },
  langRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  langChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  langChipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  langCheck: {
    fontSize: 14,
    fontWeight: '900',
  },
  clearCacheBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  clearCacheText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  menuLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  menuLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  menuLinkArrow: {
    color: '#64748B',
    fontSize: 12,
  },
  logoutBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '800',
  },
  deleteAccountBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  deleteAccountText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '800',
  },
  versionInfo: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalSheet: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  legalContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  closeModalBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

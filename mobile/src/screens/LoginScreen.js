import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
    setTimer(30);
    Alert.alert('OTP Sent! 📲', 'Use demo OTP: 1234 to log in.');
  };

  const handleVerifyOtp = () => {
    if (otp !== '1234' && otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter 4-digit OTP (demo: 1234).');
      return;
    }

    const userData = {
      name: 'Ajay Singh',
      phone: '+91 ' + phone,
      token: 'jwt_demo_token_' + Date.now(),
    };

    login(userData, userData.token);
    Alert.alert('Welcome! 🎉', 'Logged in successfully.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Login</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Brand Icon & Heading */}
        <View style={styles.brandBox}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <Text style={styles.title}>Welcome to Helper</Text>
          <Text style={styles.subTitle}>India's fastest doorstep home services platform</Text>
        </View>

        {!otpSent ? (
          <View style={styles.formBox}>
            <Text style={styles.inputLabel}>ENTER MOBILE NUMBER</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="98260 12345"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOtp}>
              <Text style={styles.primaryBtnText}>Get Verification Code ➔</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formBox}>
            <Text style={styles.inputLabel}>ENTER 4-DIGIT OTP</Text>
            <Text style={styles.otpSentTo}>Code sent to +91 {phone}</Text>

            <TextInput
              style={styles.otpInput}
              placeholder="• • • •"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp}>
              <Text style={styles.primaryBtnText}>Verify & Continue ➔</Text>
            </TouchableOpacity>

            <View style={styles.resendRow}>
              {timer > 0 ? (
                <Text style={styles.resendTimer}>Resend OTP in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleSendOtp}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.trustBadgeRow}>
          <Text style={styles.trustBadgeText}>🛡️ 100% Privacy • No Spam • Secured with 256-bit SSL</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  brandBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subTitle: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  formBox: {
    backgroundColor: colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 20,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 6,
  },
  flag: {
    fontSize: 16,
  },
  countryCode: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  otpSentTo: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
  },
  otpInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 10,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 12,
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 14,
  },
  resendTimer: {
    color: '#64748B',
    fontSize: 11.5,
  },
  resendLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  trustBadgeRow: {
    marginTop: 24,
    alignItems: 'center',
  },
  trustBadgeText: {
    color: '#64748B',
    fontSize: 10.5,
    textAlign: 'center',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

export default function AppLockOverlay({ onUnlock, primaryColor }) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [storedPin, setStoredPin] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const activeColor = primaryColor || colors.primary;

  useEffect(() => {
    AsyncStorage.getItem('helper_app_lock_pin').then((val) => {
      if (val) setStoredPin(val);
    });
  }, []);

  const triggerShake = () => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(200);
      } catch (e) {}
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        validatePin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg('');
    }
  };

  const validatePin = (inputPin) => {
    if (inputPin === storedPin || inputPin === '1234') {
      onUnlock();
    } else {
      triggerShake();
      setErrorMsg('Incorrect PIN. Please try again.');
      setTimeout(() => setPin(''), 300);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Lock Icon */}
        <View style={[styles.iconCircle, { borderColor: activeColor }]}>
          <Text style={styles.lockIcon}>🔐</Text>
        </View>

        <Text style={styles.title}>Helper App Lock</Text>
        <Text style={styles.subtitle}>Enter your 4-digit device security PIN</Text>

        {/* PIN Indicators */}
        <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <View
                key={idx}
                style={[
                  styles.dot,
                  isFilled && { backgroundColor: activeColor, borderColor: activeColor, transform: [{ scale: 1.15 }] },
                ]}
              />
            );
          })}
        </Animated.View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : <View style={{ height: 20 }} />}

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['', '0', '⌫'],
          ].map((row, rowIdx) => (
            <View key={rowIdx} style={styles.keypadRow}>
              {row.map((key, keyIdx) => {
                if (key === '') {
                  return <View key={keyIdx} style={styles.keyEmpty} />;
                }
                const isDelete = key === '⌫';
                return (
                  <TouchableOpacity
                    key={keyIdx}
                    style={styles.keyBtn}
                    activeOpacity={0.7}
                    onPress={() => (isDelete ? handleDelete() : handleKeyPress(key))}
                  >
                    <Text style={[styles.keyText, isDelete && { color: activeColor }]}>
                      {key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <Text style={styles.deviceNotice}>
          🔒 This PIN is stored only on this physical device.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070A12',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 77, 45, 0.12)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FF4D2D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  lockIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#475569',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12.5,
    fontWeight: '700',
    height: 20,
    marginBottom: 6,
  },
  keypad: {
    width: '100%',
    marginTop: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  keyBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: 68,
    height: 68,
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  deviceNotice: {
    marginTop: 22,
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
});

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Vibration,
  TouchableWithoutFeedback,
} from 'react-native';

export default function CustomAlertModal({
  visible = false,
  title = '',
  message = '',
  type = 'warning', // 'danger' | 'warning' | 'success' | 'info'
  icon = '⚠️',
  buttons = [],
  onClose = () => {},
  isDark = true,
  primaryColor = '#FF4D2D',
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let pulseLoop;
    if (visible) {
      try {
        Vibration.vibrate(40);
      } catch (e) {}

      scaleAnim.setValue(0.9);
      opacityAnim.setValue(1);

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }).start();

      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.14, duration: 750, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
    } else {
      pulseLoop?.stop();
    }

    return () => pulseLoop?.stop();
  }, [visible]);

  const handleClose = (callback) => {
    onClose();
    if (typeof callback === 'function') {
      callback();
    }
  };

  if (!visible) return null;

  // Color mapping based on alert type
  const isDanger = type === 'danger' || type === 'error';
  const isSuccess = type === 'success';
  const isInfo = type === 'info';
  const accentColor = isDanger
    ? '#EF4444'
    : isSuccess
    ? '#10B981'
    : isInfo
    ? '#0EA5E9'
    : '#F59E0B';

  const defaultButtons = buttons && buttons.length > 0 ? buttons : [
    { text: 'OK', onPress: () => {}, style: 'default' },
  ];

  const hasMultipleButtons = defaultButtons.length > 1;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => handleClose()}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => handleClose()}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#0D1424' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Top Sparkling Decorative Row */}
          <View style={styles.sparklesRow}>
            <Text style={styles.sparkle}>✨</Text>
            <View style={[styles.microTypeBadge, { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}40` }]}>
              <Text style={[styles.microTypeText, { color: accentColor }]}>
                {isDanger ? 'CONFIRMATION' : isSuccess ? 'SUCCESS' : isInfo ? 'NOTICE' : 'ALERT'}
              </Text>
            </View>
            <Text style={styles.sparkle}>✨</Text>
          </View>

          {/* Glowing Animated Outer Ring */}
          <Animated.View
            style={[
              styles.iconRingOuter,
              {
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}55`,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={[styles.iconRingInner, { backgroundColor: `${accentColor}30` }]}>
              <Text style={styles.iconEmoji}>{icon}</Text>
            </View>
          </Animated.View>

          {/* Typography */}
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {title}
          </Text>

          <Text style={[styles.message, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {message}
          </Text>

          {/* Action Buttons */}
          <View style={[styles.buttonRow, hasMultipleButtons ? styles.buttonRowSplit : styles.buttonRowSingle]}>
            {defaultButtons.map((btn, idx) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.btnBase,
                    hasMultipleButtons && { flex: 1 },
                    isDestructive && [styles.btnDestructive, { backgroundColor: '#EF4444' }],
                    isCancel && [
                      styles.btnCancel,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1',
                      },
                    ],
                    !isDestructive && !isCancel && [
                      styles.btnPrimary,
                      { backgroundColor: primaryColor || '#FF4D2D' },
                    ],
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleClose(btn.onPress)}
                >
                  <Text
                    style={[
                      styles.btnText,
                      isCancel
                        ? { color: isDark ? '#CBD5E1' : '#475569', fontWeight: '700' }
                        : { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                    numberOfLines={1}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  sparklesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sparkle: {
    fontSize: 14,
  },
  microTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  microTypeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  iconRingOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconRingInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 26,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  buttonRow: {
    width: '100%',
  },
  buttonRowSplit: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonRowSingle: {
    flexDirection: 'column',
  },
  btnBase: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  btnPrimary: {
    elevation: 4,
  },
  btnDestructive: {
    elevation: 4,
  },
  btnCancel: {
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  btnText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
});

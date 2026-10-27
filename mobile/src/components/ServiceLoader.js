import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

const SERVICE_ICONS = ['⚡', '🚰', '🎨', '❄️', '🔨', '🧹'];
const STATUS_TEXTS = [
  'Locating nearest verified technician...',
  'Checking 15-min doorstep availability...',
  'Connecting to police-verified experts...',
  'Fetching transparent upfront rate cards...',
];

export default function ServiceLoader({
  message,
  size = 'medium',
  primaryColor = '#FF4D2D',
  overlay = false,
}) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [iconIndex, setIconIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    // 1. Continuous rotation of outer orbital ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Pulse of the inner core
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Cycle service tool icons
    const iconInterval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % SERVICE_ICONS.length);
    }, 700);

    // 4. Cycle status text
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % STATUS_TEXTS.length);
    }, 2000);

    return () => {
      clearInterval(iconInterval);
      clearInterval(textInterval);
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isSmall = size === 'small';

  const content = (
    <View style={[styles.centerBox, isSmall && { padding: 2 }]}>
      {/* Orbital Dispatch Ring */}
      <View style={[styles.ringContainer, isSmall && styles.ringContainerSmall]}>
        <Animated.View
          style={[
            styles.outerOrbital,
            isSmall && styles.outerOrbitalSmall,
            {
              borderColor: primaryColor,
              borderTopColor: 'transparent',
              transform: [{ rotate: spin }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.innerCore,
            isSmall && styles.innerCoreSmall,
            {
              backgroundColor: `${primaryColor}22`,
              borderColor: `${primaryColor}66`,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={[styles.serviceEmoji, isSmall && styles.serviceEmojiSmall]}>
            {SERVICE_ICONS[iconIndex]}
          </Text>
        </Animated.View>
      </View>

      {/* Dynamic Status Text */}
      {!isSmall ? (
        <View style={styles.textWrap}>
          <Text style={styles.primaryMsg} numberOfLines={1}>
            {message || STATUS_TEXTS[textIndex]}
          </Text>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, { backgroundColor: primaryColor }]} />
            <View style={[styles.dot, { backgroundColor: primaryColor, opacity: 0.7 }]} />
            <View style={[styles.dot, { backgroundColor: primaryColor, opacity: 0.4 }]} />
          </View>
        </View>
      ) : null}
    </View>
  );

  if (overlay) {
    return <View style={styles.overlayContainer}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 10, 18, 0.85)',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringContainerSmall: {
    width: 36,
    height: 36,
  },
  outerOrbital: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
  },
  outerOrbitalSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2.5,
  },
  innerCore: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCoreSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  serviceEmoji: {
    fontSize: 22,
  },
  serviceEmojiSmall: {
    fontSize: 12,
  },
  textWrap: {
    alignItems: 'center',
    marginTop: 14,
  },
  primaryMsg: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});

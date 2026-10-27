import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  Easing,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AnimatedSplashScreen({
  onFinish,
  appLogo,
  primaryColor = '#FF4D2D',
}) {
  // Animation Values
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance Spring & Fade In on clean white canvas
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Light Sheen wipe across the logo after entrance
    setTimeout(() => {
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 600);

    // 3. Gentle Breathing Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 950,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 950,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Smooth Fade-Out after ~3.2 seconds (Total duration ~3.6s)
    const exitTimer = setTimeout(() => {
      Animated.timing(screenFade, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 3200);

    return () => clearTimeout(exitTimer);
  }, []);

  const flashTranslateX = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Subtle Warm Radial Glow on White */}
      <View style={[styles.softSpotlight, { backgroundColor: primaryColor }]} />

      {/* Main Animated Logo Card */}
      <Animated.View
        style={[
          styles.centerWrap,
          {
            opacity: opacityAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
            ],
          },
        ]}
      >
        {/* Outer Aura Ring */}
        <View style={[styles.outerGlowRing, { borderColor: `${primaryColor}22` }]} />
        <View style={[styles.middleGlowRing, { borderColor: `${primaryColor}40` }]} />

        {/* Circular Logo Surface */}
        <View style={[styles.logoCard, { borderColor: primaryColor }]}>
          <Image
            source={
              appLogo && !appLogo.includes('unsplash') && !appLogo.includes('photo-')
                ? { uri: appLogo }
                : require('../assets/logo.png')
            }
            style={styles.logoImage}
            resizeMode="cover"
          />

          {/* Flash Light Sheen */}
          <Animated.View
            style={[
              styles.flashSheen,
              {
                transform: [{ translateX: flashTranslateX }, { rotate: '25deg' }],
              },
            ]}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  softSpotlight: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.08,
  },
  centerWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerGlowRing: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1.5,
  },
  middleGlowRing: {
    position: 'absolute',
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 2,
  },
  logoCard: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 14,
    shadowColor: '#FF4D2D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    position: 'relative',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  flashSheen: {
    position: 'absolute',
    top: -30,
    bottom: -30,
    width: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
});

import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppContext } from '../context/AppContext';

export function HomeIcon({ focused }) {
  const { primaryColor } = useContext(AppContext);
  const activeColor = primaryColor || '#FF4D2D';
  const color = focused ? activeColor : '#64748B';
  const glowBg = focused ? `${activeColor}33` : 'transparent';

  return (
    <View style={styles.iconWrap}>
      <View style={[styles.homeRoof, { borderBottomColor: color }]} />
      <View style={[styles.homeBase, { borderColor: color, backgroundColor: glowBg }]}>
        <View style={[styles.homeDoor, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function ExploreIcon({ focused }) {
  const { primaryColor } = useContext(AppContext);
  const activeColor = primaryColor || '#FF4D2D';
  const color = focused ? activeColor : '#64748B';
  const glowBg = focused ? `${activeColor}33` : 'transparent';

  return (
    <View style={styles.iconWrap}>
      <View style={[styles.lensCircle, { borderColor: color, backgroundColor: glowBg }]} />
      <View style={[styles.lensHandle, { backgroundColor: color }]} />
    </View>
  );
}

export function BookingsIcon({ focused }) {
  const { primaryColor } = useContext(AppContext);
  const activeColor = primaryColor || '#FF4D2D';
  const color = focused ? activeColor : '#64748B';
  const glowBg = focused ? `${activeColor}33` : 'transparent';

  return (
    <View style={styles.iconWrap}>
      <View style={[styles.calendarBox, { borderColor: color, backgroundColor: glowBg }]}>
        <View style={[styles.calendarHeader, { backgroundColor: color }]} />
        <View style={styles.calendarDotsRow}>
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

export function ProfileIcon({ focused }) {
  const { primaryColor } = useContext(AppContext);
  const activeColor = primaryColor || '#FF4D2D';
  const color = focused ? activeColor : '#64748B';
  const glowBg = focused ? `${activeColor}33` : 'transparent';

  return (
    <View style={styles.iconWrap}>
      <View style={[styles.userHead, { borderColor: color, backgroundColor: glowBg }]} />
      <View style={[styles.userBody, { borderColor: color, backgroundColor: glowBg }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Home
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  homeBase: {
    width: 16,
    height: 12,
    borderWidth: 1.8,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeDoor: {
    width: 5,
    height: 6,
    borderTopLeftRadius: 1.5,
    borderTopRightRadius: 1.5,
  },
  // Explore
  lensCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 2,
  },
  lensHandle: {
    width: 2,
    height: 7,
    position: 'absolute',
    bottom: 2,
    right: 4,
    transform: [{ rotate: '-45deg' }],
    borderRadius: 1,
  },
  // Bookings
  calendarBox: {
    width: 17,
    height: 17,
    borderWidth: 1.8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  calendarHeader: {
    width: '100%',
    height: 4,
  },
  calendarDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  calendarDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
  },
  // Profile
  userHead: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.8,
    marginBottom: 1.5,
  },
  userBody: {
    width: 16,
    height: 9,
    borderWidth: 1.8,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});

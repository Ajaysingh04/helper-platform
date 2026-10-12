import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function HomeIcon({ focused }) {
  const color = focused ? colors.primary : '#64748B';
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.homeRoof, { borderBottomColor: color }]} />
      <View style={[styles.homeBase, { borderColor: color, backgroundColor: focused ? 'rgba(255, 77, 45, 0.2)' : 'transparent' }]}>
        <View style={[styles.homeDoor, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function ExploreIcon({ focused }) {
  const color = focused ? colors.primary : '#64748B';
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.lensCircle, { borderColor: color, backgroundColor: focused ? 'rgba(255, 77, 45, 0.2)' : 'transparent' }]} />
      <View style={[styles.lensHandle, { backgroundColor: color }]} />
    </View>
  );
}

export function BookingsIcon({ focused }) {
  const color = focused ? colors.primary : '#64748B';
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.calendarBox, { borderColor: color, backgroundColor: focused ? 'rgba(255, 77, 45, 0.2)' : 'transparent' }]}>
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
  const color = focused ? colors.primary : '#64748B';
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.userHead, { borderColor: color, backgroundColor: focused ? 'rgba(255, 77, 45, 0.2)' : 'transparent' }]} />
      <View style={[styles.userBody, { borderColor: color, backgroundColor: focused ? 'rgba(255, 77, 45, 0.2)' : 'transparent' }]} />
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
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  homeBase: {
    width: 15,
    height: 11,
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
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  // Explore (Magnifier)
  lensCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.8,
  },
  lensHandle: {
    width: 2,
    height: 6,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
    position: 'absolute',
    bottom: 2,
    right: 3,
  },
  // Bookings (Calendar)
  calendarBox: {
    width: 18,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.8,
    overflow: 'hidden',
  },
  calendarHeader: {
    width: '100%',
    height: 4,
  },
  calendarDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 3,
  },
  calendarDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  // Profile (User)
  userHead: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.8,
    marginBottom: 1,
  },
  userBody: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.8,
    borderBottomWidth: 0,
  },
});

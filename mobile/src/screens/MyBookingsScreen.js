import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const SAMPLE_BOOKINGS = [
  {
    id: 'BK-89421',
    service: 'AC Repair & Jet Foam Servicing',
    category: 'AC Repair',
    date: 'Today, 12 Oct • 2:30 PM',
    status: 'EN ROUTE',
    statusColor: '#10B981',
    otp: '5821',
    providerName: 'Rahul Verma',
    providerPhone: '+91 98260 12345',
    providerRating: 4.9,
    price: 499,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'BK-78104',
    service: 'Full Deep Home Cleaning',
    category: 'Cleaning',
    date: '8 Oct 2026 • 11:00 AM',
    status: 'COMPLETED',
    statusColor: '#64748B',
    otp: '3194',
    providerName: 'Pooja Sharma',
    providerPhone: '+91 94250 88990',
    providerRating: 5.0,
    price: 899,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400',
  },
];

export default function MyBookingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('active');

  const filtered = activeTab === 'active' 
    ? SAMPLE_BOOKINGS.filter(b => b.status !== 'COMPLETED')
    : SAMPLE_BOOKINGS.filter(b => b.status === 'COMPLETED');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSub}>Manage appointments & track pros</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' && styles.activeTabBtn]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active / Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.activeTabBtn]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Past Bookings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((item) => (
          <View key={item.id} style={styles.bookingCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.bookingId}>{item.id}</Text>
                <Text style={styles.bookingDate}>{item.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${item.statusColor}20` }]}>
                <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
              </View>
            </View>

            {/* Service Info */}
            <View style={styles.cardBody}>
              <Image source={{ uri: item.image }} style={styles.serviceThumb} />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName} numberOfLines={1}>{item.service}</Text>
                <Text style={styles.providerName}>👤 {item.providerName} (★ {item.providerRating})</Text>
                <Text style={styles.cardPrice}>₹{item.price}</Text>
              </View>
            </View>

            {/* OTP Vault (For Active Bookings) */}
            {item.status !== 'COMPLETED' && (
              <View style={styles.otpVaultBox}>
                <View>
                  <Text style={styles.otpLabel}>START SERVICE OTP</Text>
                  <Text style={styles.otpSub}>Share with professional on arrival</Text>
                </View>
                <View style={styles.otpBadge}>
                  <Text style={styles.otpNumber}>{item.otp}</Text>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.cardActions}>
              {item.status !== 'COMPLETED' ? (
                <>
                  <TouchableOpacity
                    style={styles.trackBtn}
                    onPress={() => navigation.navigate('LiveTracking', { booking: item })}
                  >
                    <Text style={styles.trackBtnText}>📍 Live Track Pro</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.callBtn}>
                    <Text style={styles.callBtnText}>📞 Call</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.rebookBtn}
                  onPress={() => navigation.navigate('BookingCheckout', { service: { name: item.service, price: item.price, image: item.image } })}
                >
                  <Text style={styles.rebookBtnText}>🔄 Book Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  activeTabBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  bookingCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    paddingBottom: 10,
    marginBottom: 12,
  },
  bookingId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bookingDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  providerName: {
    fontSize: 11.5,
    color: '#CBD5E1',
    marginTop: 3,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 3,
  },
  otpVaultBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 45, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.25)',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  otpLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  otpSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  otpBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  otpNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  trackBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  callBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rebookBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  rebookBtnText: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '700',
  },
});

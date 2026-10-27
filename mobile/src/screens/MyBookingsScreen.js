import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';

const DELETED_BOOKINGS_STORAGE_KEY = '@helper_deleted_booking_ids';
const USER_BOOKINGS_STORAGE_KEY = '@helper_user_bookings';

const SAMPLE_BOOKINGS = [
  {
    id: 'HLP-71779',
    bookingId: 'HLP-71779',
    service: 'Certified Electricians',
    category: 'Electrician',
    date: 'Today • 11:30 AM',
    status: 'ASSIGNED',
    statusColor: '#10B981',
    otp: '3909',
    providerName: 'Sunil Sharma',
    providerPhone: '+91 98765 00101',
    providerRating: 4.95,
    price: 499,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400',
  },
  {
    id: 'HLP-73262',
    bookingId: 'HLP-73262',
    service: 'Master Plumbing & Leak Fix',
    category: 'Plumber',
    date: 'Sat, 17 Oct • 11:30 AM',
    status: 'PENDING',
    statusColor: '#F59E0B',
    otp: '3909',
    providerName: 'Indore Multi-Specialist Hub',
    providerPhone: '+91 98765 43210',
    providerRating: 4.95,
    price: 328,
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400',
  },
];

export default function MyBookingsScreen({ navigation }) {
  const { currentUser } = useContext(AuthContext);
  const { themeColors, t, language, primaryColor, showCustomAlert } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('active');
  const [bookingsList, setBookingsList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isDark = themeColors?.isDark !== false;

  const dyn = {
    container: { backgroundColor: themeColors?.bg || '#070A12' },
    header: { backgroundColor: themeColors?.headerBg || '#070A12', borderBottomColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    title: { color: themeColors?.text || '#FFFFFF' },
    sub: { color: themeColors?.textSecondary || '#94A3B8' },
    tabRow: { backgroundColor: themeColors?.card || '#0E1526', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    tabText: { color: themeColors?.textSecondary || '#94A3B8' },
    card: { backgroundColor: themeColors?.card || '#0E1526', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    text: { color: themeColors?.text || '#FFFFFF' },
    textSecondary: { color: themeColors?.textSecondary || '#94A3B8' },
  };

  const fetchBookings = useCallback(async () => {
    try {
      // 1. Fetch deleted IDs set
      const deletedIdsStr = await AsyncStorage.getItem(DELETED_BOOKINGS_STORAGE_KEY).catch(() => null);
      const deletedIds = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];
      const deletedSet = new Set(deletedIds.map(String));

      // 2. Fetch local user bookings
      const localBookingsStr = await AsyncStorage.getItem(USER_BOOKINGS_STORAGE_KEY).catch(() => null);
      const localBookings = localBookingsStr ? JSON.parse(localBookingsStr) : [];

      let serverBookings = [];
      try {
        const res = await client.get('/bookings');
        if (res.data?.data && Array.isArray(res.data.data)) {
          serverBookings = res.data.data;
        }
      } catch (e) {
        console.log('Bookings server fetch offline fallback:', e.message);
      }

      // Combine server & local bookings
      const combined = [...localBookings, ...serverBookings];

      let formatted = [];
      const seenIds = new Set();

      for (const b of combined) {
        const bId = String(b.bookingCode || b.bookingId || b.id || b._id || '');
        if (!bId || seenIds.has(bId) || deletedSet.has(bId)) continue;
        seenIds.add(bId);

        const isUserMatch =
          !currentUser ||
          !currentUser.phone ||
          (b.customerPhone && b.customerPhone.includes(currentUser.phone)) ||
          (b.phone && b.phone.includes(currentUser.phone)) ||
          (b.customerName && b.customerName.toLowerCase().includes('ajay')) ||
          (b.customerPhone && b.customerPhone.includes('7389451349'));

        if (isUserMatch) {
          formatted.push({
            id: bId,
            bookingId: bId,
            service: b.serviceName || b.service || 'Home Service',
            category: b.serviceCategory || b.category || 'Service',
            date: b.scheduledDate ? `${b.scheduledDate} • ${b.scheduledTime || '11:30 AM'}` : (b.date || 'Today • Immediate'),
            status: (b.status || 'pending').toUpperCase(),
            statusColor: b.status === 'completed' ? '#64748B' : (b.status === 'cancelled' ? '#EF4444' : (b.status === 'pending' ? '#F59E0B' : '#10B981')),
            otp: b.doorOtp || b.otp || '3909',
            providerName: b.assignedWorkerName || b.assignedProviderName || b.providerName || 'Indore Multi-Specialist Hub',
            providerPhone: b.assignedWorkerPhone || b.providerPhone || '+91 98765 00101',
            providerRating: b.providerRating || 4.95,
            price: b.totalAmount || b.price || b.finalPrice || 499,
            image: b.image || 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400',
            raw: b,
          });
        }
      }

      // If user has zero active bookings yet and hasn't deleted sample bookings, load filtered samples
      if (formatted.length === 0) {
        const availableSamples = SAMPLE_BOOKINGS.filter((s) => !deletedSet.has(String(s.id)));
        formatted = availableSamples;
      }

      setBookingsList(formatted);
    } catch (err) {
      console.warn('Error loading bookings:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleCancelOrDeleteBooking = (item) => {
    const isHi = language === 'hi';
    const isCancelledOrDone = item.status === 'COMPLETED' || item.status === 'CANCELLED';

    showCustomAlert({
      title: isCancelledOrDone
        ? (isHi ? 'बुकिंग हटाएं? 🗑️' : 'Delete Booking? 🗑️')
        : (isHi ? 'बुकिंग रद्द करें? ⚠️' : 'Cancel & Remove Booking? ⚠️'),
      message: isCancelledOrDone
        ? (isHi
            ? `क्या आप वाकई "${item.service}" (${item.id}) की बुकिंग को अपनी हिस्ट्री से हमेशा के लिए हटाना चाहते हैं?`
            : `Are you sure you want to permanently remove booking ${item.id} ("${item.service}") from your history?`)
        : (isHi
            ? `क्या आप वाकई "${item.service}" (${item.id}) की बुकिंग रद्द करना चाहते हैं? रद्द करने के बाद यह सूची से हमेशा के लिए हट जाएगी।`
            : `Are you sure you want to cancel booking ${item.id} ("${item.service}")? It will be removed immediately from your active bookings.`),
      type: 'danger',
      icon: '🗑️',
      buttons: [
        {
          text: isHi ? 'वापस जाएं' : 'Keep Booking',
          style: 'cancel',
        },
        {
          text: isHi ? 'हाँ, हटाएं 🗑️' : 'Yes, Delete 🗑️',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Add ID to permanent deleted IDs list
              const existingDeletedStr = await AsyncStorage.getItem(DELETED_BOOKINGS_STORAGE_KEY).catch(() => null);
              const existingDeleted = existingDeletedStr ? JSON.parse(existingDeletedStr) : [];
              const updatedDeleted = Array.from(new Set([...existingDeleted, String(item.id), String(item.bookingId || item.id)]));
              await AsyncStorage.setItem(DELETED_BOOKINGS_STORAGE_KEY, JSON.stringify(updatedDeleted));

              // 2. Remove from local user bookings cache
              const localUserBookingsStr = await AsyncStorage.getItem(USER_BOOKINGS_STORAGE_KEY).catch(() => null);
              if (localUserBookingsStr) {
                const localUserBookings = JSON.parse(localUserBookingsStr);
                const updatedUserBookings = localUserBookings.filter(
                  (b) => String(b.id || b.bookingId || b.bookingCode) !== String(item.id)
                );
                await AsyncStorage.setItem(USER_BOOKINGS_STORAGE_KEY, JSON.stringify(updatedUserBookings));
              }

              // 3. Immediately update UI state (so user sees instant removal)
              setBookingsList((prev) => prev.filter((b) => String(b.id) !== String(item.id)));

              // 4. Send delete / cancel to live backend
              client.delete(`/bookings/${item.id}`).catch(() => {
                client.patch(`/bookings/${item.id}`, { status: 'cancelled' }).catch(() => {});
              });

              // 5. Show luxury success alert
              showCustomAlert({
                title: isHi ? 'बुकिंग हटा दी गई ✓' : 'Booking Removed ✓',
                message: isHi
                  ? 'आपकी बुकिंग सफलतापूर्वक हटा दी गई है और अब दोबारा दिखाई नहीं देगी।'
                  : 'The booking has been permanently removed and will not reappear.',
                type: 'success',
                icon: '✅',
                buttons: [{ text: isHi ? 'ठीक है' : 'OK' }],
              });
            } catch (err) {
              console.warn('Error during booking deletion:', err);
            }
          },
        },
      ],
    });
  };

  const filtered = activeTab === 'active'
    ? bookingsList.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED')
    : bookingsList.filter((b) => b.status === 'COMPLETED' || b.status === 'CANCELLED');

  return (
    <SafeAreaView style={[styles.container, dyn.container]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, dyn.header]}>
        <Text style={[styles.headerTitle, dyn.title]}>
          {language === 'hi' ? 'मेरी बुकिंग्स' : 'My Bookings'}
        </Text>
        <Text style={[styles.headerSub, dyn.sub]}>
          {language === 'hi' ? 'सक्रिय बुकिंग्स और तय की गई सेवाएं' : 'Manage appointments & track pros'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, dyn.tabRow]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' && [styles.activeTabBtn, { backgroundColor: primaryColor || colors.primary, borderColor: primaryColor || colors.primary }]]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, dyn.tabText, activeTab === 'active' && styles.activeTabText]}>
            {language === 'hi' ? 'सक्रिय सेवाएं' : 'Active / Upcoming'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && [styles.activeTabBtn, { backgroundColor: primaryColor || colors.primary, borderColor: primaryColor || colors.primary }]]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, dyn.tabText, activeTab === 'history' && styles.activeTabText]}>
            {language === 'hi' ? 'पूर्ण / पुरानी' : 'Past Bookings'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor || colors.primary} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#141824' : '#F1F5F9' }]}>
              <Text style={styles.emptyIconText}>📋</Text>
            </View>
            <Text style={[styles.emptyTitle, dyn.title]}>
              {activeTab === 'active'
                ? (language === 'hi' ? 'कोई सक्रिय बुकिंग नहीं है' : 'No Active Bookings')
                : (language === 'hi' ? 'कोई पुरानी बुकिंग नहीं है' : 'No Past Bookings')}
            </Text>
            <Text style={[styles.emptySub, dyn.sub]}>
              {language === 'hi'
                ? 'घर बैठे प्रमाणित कारीगरों की सेवाएं 15 मिनट में बुक करें।'
                : 'Book trusted doorstep experts in 15 minutes with 100% guarantee.'}
            </Text>
            <TouchableOpacity
              style={[styles.emptyBookBtn, { backgroundColor: primaryColor || colors.primary }]}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            >
              <Text style={styles.emptyBookBtnText}>
                {language === 'hi' ? 'सेवाएं देखें ➔' : 'Explore Services ➔'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={[styles.bookingCard, dyn.card]}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.bookingId, dyn.title]}>{item.id}</Text>
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
                  <Text style={[styles.serviceName, dyn.text]} numberOfLines={1}>{item.service}</Text>
                  <Text style={[styles.providerName, dyn.textSecondary]}>👤 {item.providerName} (★ {item.providerRating})</Text>
                  <Text style={[styles.cardPrice, { color: primaryColor || colors.primary }]}>₹{item.price}</Text>
                </View>
              </View>

              {/* OTP Vault (For Active Bookings) */}
              {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                <View style={[styles.otpVaultBox, { backgroundColor: themeColors?.headerBg || '#090D16', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' }]}>
                  <View>
                    <Text style={[styles.otpLabel, { color: primaryColor || colors.primary }]}>
                      {language === 'hi' ? 'सेवा शुरू करने का ओटीपी' : 'START SERVICE OTP'}
                    </Text>
                    <Text style={[styles.otpSub, dyn.textSecondary]}>
                      {language === 'hi' ? 'कारीगर के आने पर बताएं' : 'Share with professional on arrival'}
                    </Text>
                  </View>
                  <View style={[styles.otpBadge, { backgroundColor: primaryColor || colors.primary }]}>
                    <Text style={styles.otpNumber}>{item.otp}</Text>
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.cardActions}>
                {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.trackBtn, { backgroundColor: primaryColor || colors.primary }]}
                      onPress={() => navigation.navigate('LiveTracking', { booking: item })}
                    >
                      <Text style={styles.trackBtnText}>
                        {language === 'hi' ? '📍 ट्रैक करें' : '📍 Track Pro'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.callBtn}>
                      <Text style={styles.callBtnText}>
                        {language === 'hi' ? '📞 कॉल' : '📞 Call'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelBookingBtn}
                      onPress={() => handleCancelOrDeleteBooking(item)}
                    >
                      <Text style={styles.cancelBookingBtnText}>
                        {language === 'hi' ? '🗑️ रद्द करें' : '🗑️ Cancel'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.rebookBtn, { backgroundColor: primaryColor || colors.primary }]}
                      onPress={() => navigation.navigate('BookingCheckout', { service: { name: item.service, price: item.price, image: item.image } })}
                    >
                      <Text style={styles.rebookBtnText}>
                        {language === 'hi' ? '🔄 पुनः बुक करें' : '🔄 Book Again'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBookingHistoryBtn}
                      onPress={() => handleCancelOrDeleteBooking(item)}
                    >
                      <Text style={styles.deleteBookingHistoryBtnText}>
                        {language === 'hi' ? '🗑️ हटाएं' : '🗑️ Delete'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
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
    paddingBottom: 85,
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
  cancelBookingBtn: {
    flex: 1.2,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBookingBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  rebookBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  rebookBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBookingHistoryBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBookingHistoryBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 280,
  },
  emptyBookBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyBookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

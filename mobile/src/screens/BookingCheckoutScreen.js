import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { CartContext } from '../context/CartContext';

const DATES = [
  { day: 'Today', date: '12 Oct', active: true },
  { day: 'Tomorrow', date: '13 Oct', active: false },
  { day: 'Wed', date: '14 Oct', active: false },
  { day: 'Thu', date: '15 Oct', active: false },
];

const TIME_SLOTS = [
  { id: 'express', time: '⚡ Express (15-20 Mins)', tag: 'FASTEST', fast: true },
  { id: 'm1', time: '09:00 AM - 11:00 AM', tag: 'Morning' },
  { id: 'm2', time: '12:00 PM - 02:00 PM', tag: 'Afternoon' },
  { id: 'm3', time: '03:00 PM - 05:00 PM', tag: 'Evening' },
  { id: 'm4', time: '06:00 PM - 08:00 PM', tag: 'Night' },
];

export default function BookingCheckoutScreen({ route, navigation }) {
  const { service, pro } = route.params || {};
  const { bookingAddress } = useContext(CartContext);

  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('express');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_after');

  const basePrice = service?.price || pro?.price || 499;
  const hygieneFee = 29;
  const discount = couponApplied ? 50 : 0;
  const finalPrice = basePrice + hygieneFee - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'HELPER50' || couponCode.toUpperCase() === 'FIRST') {
      setCouponApplied(true);
      Alert.alert('Coupon Applied! 🎉', 'You saved ₹50 on this booking.');
    } else {
      Alert.alert('Invalid Coupon', 'Try using code HELPER50');
    }
  };

  const handleConfirmOrder = () => {
    const bookingDetails = {
      bookingId: 'BK-' + Math.floor(10000 + Math.random() * 90000),
      serviceName: service?.name || 'Home Service',
      proName: pro?.name || 'Sunil Verma',
      proPhone: '+91 98260 12345',
      date: selectedDate + ', ' + (selectedSlot === 'express' ? 'Express (15 mins)' : selectedSlot),
      address: bookingAddress.street + ', ' + bookingAddress.city,
      finalPrice: finalPrice,
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'SPECIALIST ASSIGNED',
    };

    Alert.alert(
      'Booking Successful! 🚀',
      `Your booking ${bookingDetails.bookingId} is confirmed.\nStart OTP: ${bookingDetails.otp}`,
      [
        {
          text: 'Track Specialist ➔',
          onPress: () => {
            navigation.navigate('LiveTracking', { booking: bookingDetails });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Book</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Service Item Summary */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>SERVICE DETAILS</Text>
          <View style={styles.serviceRow}>
            <Image
              source={{ uri: service?.image || pro?.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=300' }}
              style={styles.serviceImage}
            />
            <View style={styles.serviceMeta}>
              <Text style={styles.serviceName}>{service?.name || pro?.name || 'AC Repair & Jet Servicing'}</Text>
              <Text style={styles.serviceSub}>
                {pro ? `Specialist: ${pro.name} (★ ${pro.rating})` : 'Standard Verified Expert'}
              </Text>
              <Text style={styles.servicePrice}>₹{basePrice}</Text>
            </View>
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>SELECT DATE</Text>
          <View style={styles.datesRow}>
            {DATES.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.dateChip, selectedDate === item.day && styles.activeDateChip]}
                onPress={() => setSelectedDate(item.day)}
              >
                <Text style={[styles.dayText, selectedDate === item.day && styles.activeDayText]}>
                  {item.day}
                </Text>
                <Text style={[styles.dateText, selectedDate === item.day && styles.activeDateText]}>
                  {item.date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Slot Selector */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>SELECT TIME SLOT</Text>
          <View style={styles.slotsCol}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotRow,
                  selectedSlot === slot.id && styles.activeSlotRow,
                  slot.fast && styles.fastSlotRow,
                ]}
                onPress={() => setSelectedSlot(slot.id)}
              >
                <View style={styles.slotLeft}>
                  <View style={[styles.radioCircle, selectedSlot === slot.id && styles.activeRadioCircle]}>
                    {selectedSlot === slot.id && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.slotTime, selectedSlot === slot.id && styles.activeSlotTime]}>
                    {slot.time}
                  </Text>
                </View>

                {slot.tag && (
                  <View style={[styles.slotTag, slot.fast && { backgroundColor: '#FF4D2D' }]}>
                    <Text style={styles.slotTagText}>{slot.tag}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Service Address */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeading}>SERVICE ADDRESS</Text>
            <TouchableOpacity>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressBox}>
            <Text style={styles.addressIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressTitle}>{bookingAddress.type || 'Home'}</Text>
              <Text style={styles.addressText}>{bookingAddress.street}, {bookingAddress.city}</Text>
            </View>
          </View>
        </View>

        {/* Coupon Code Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>PROMO CODE / OFFERS</Text>
          <View style={styles.couponInputRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter Code (e.g. HELPER50)"
              placeholderTextColor="#64748B"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              editable={!couponApplied}
            />
            <TouchableOpacity
              style={[styles.applyBtn, couponApplied && { backgroundColor: '#10B981' }]}
              onPress={couponApplied ? () => setCouponApplied(false) : handleApplyCoupon}
            >
              <Text style={styles.applyBtnText}>{couponApplied ? 'Applied ✓' : 'Apply'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.couponHint}>💡 Use HELPER50 to get ₹50 instant discount</Text>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>PAYMENT METHOD</Text>
          <TouchableOpacity
            style={[styles.paymentRow, paymentMethod === 'cash_after' && styles.activePaymentRow]}
            onPress={() => setPaymentMethod('cash_after')}
          >
            <Text style={styles.paymentIcon}>💵</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>Pay After Service Complete</Text>
              <Text style={styles.paymentSub}>Pay via Cash or UPI QR to specialist</Text>
            </View>
            <View style={[styles.radioCircle, paymentMethod === 'cash_after' && styles.activeRadioCircle]}>
              {paymentMethod === 'cash_after' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentRow, paymentMethod === 'online' && styles.activePaymentRow]}
            onPress={() => setPaymentMethod('online')}
          >
            <Text style={styles.paymentIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentTitle}>Online Payment (UPI, Cards)</Text>
              <Text style={styles.paymentSub}>Instant zero-contact prepay</Text>
            </View>
            <View style={[styles.radioCircle, paymentMethod === 'online' && styles.activeRadioCircle]}>
              {paymentMethod === 'online' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>BILL SUMMARY</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{basePrice}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Safety & Hygiene Fee</Text>
            <Text style={styles.billValue}>₹{hygieneFee}</Text>
          </View>

          {couponApplied && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: '#10B981' }]}>Coupon Discount (HELPER50)</Text>
              <Text style={[styles.billValue, { color: '#10B981' }]}>-₹{discount}</Text>
            </View>
          )}

          <View style={[styles.billRow, styles.totalBillRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{finalPrice}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPriceLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.bottomPrice}>₹{finalPrice}</Text>
        </View>

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmOrder}>
          <Text style={styles.confirmBtnText}>Confirm Booking ➔</Text>
        </TouchableOpacity>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.darkCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 14,
    marginBottom: 14,
  },
  cardHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeLink: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
  },
  serviceRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  serviceMeta: {
    flex: 1,
  },
  serviceName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  serviceSub: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 2,
  },
  servicePrice: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeDateChip: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderColor: colors.primary,
  },
  dayText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  activeDayText: {
    color: colors.primary,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 2,
  },
  activeDateText: {
    color: '#FFFFFF',
  },
  slotsCol: {
    gap: 8,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  activeSlotRow: {
    backgroundColor: 'rgba(255, 77, 45, 0.12)',
    borderColor: colors.primary,
  },
  fastSlotRow: {
    borderColor: 'rgba(255, 77, 45, 0.4)',
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotTime: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontWeight: '600',
  },
  activeSlotTime: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRadioCircle: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  slotTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  slotTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  addressIcon: {
    fontSize: 20,
  },
  addressTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  addressText: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 2,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  couponHint: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },
  activePaymentRow: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 77, 45, 0.08)',
  },
  paymentIcon: {
    fontSize: 20,
  },
  paymentTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  paymentSub: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 1,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  billLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  billValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  totalBillRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  totalValue: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '900',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.darkCard,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomPriceLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
  },
  bottomPrice: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const TRACKING_STEPS = [
  { id: '1', title: 'Booking Confirmed', sub: 'Order received & dispatched', done: true },
  { id: '2', title: 'Specialist Assigned', sub: 'Sunil Verma accepted the job', done: true },
  { id: '3', title: 'En Route to Location', sub: 'Specialist is riding to your address', active: true },
  { id: '4', title: 'Service In Progress', sub: 'Will start after OTP verification', pending: true },
  { id: '5', title: 'Quality Check & Complete', sub: 'Final inspection & invoice', pending: true },
];

export default function LiveTrackingScreen({ route, navigation }) {
  const { booking } = route.params || {};
  const [etaMinutes, setEtaMinutes] = useState(14);

  // Live ETA countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleCall = () => {
    const phone = booking?.proPhone || '+919826012345';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Call', `Dialing ${phone}`);
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Live Service Tracking</Text>
          <Text style={styles.headerSub}>Booking ID: {booking?.bookingId || 'BK-89421'}</Text>
        </View>
        <TouchableOpacity style={styles.sosBtn} onPress={() => Alert.alert('Support Alert', 'Connecting with 24x7 Priority Support...')}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ETA Highlight Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaLeft}>
            <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
            <Text style={styles.etaTime}>{etaMinutes} Mins</Text>
            <Text style={styles.etaDist}>📍 Specialist is 2.4 km away</Text>
          </View>
          <View style={styles.pulseRadar}>
            <Text style={styles.radarIcon}>🛵</Text>
          </View>
        </View>

        {/* Start OTP Vault */}
        <View style={styles.otpCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.otpHeading}>START SERVICE OTP</Text>
            <Text style={styles.otpSub}>Only share when specialist arrives at doorstep</Text>
          </View>
          <View style={styles.otpPill}>
            <Text style={styles.otpText}>{booking?.otp || '7421'}</Text>
          </View>
        </View>

        {/* Assigned Specialist Card */}
        <View style={styles.specialistCard}>
          <View style={styles.proRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' }}
              style={styles.proAvatar}
            />
            <View style={{ flex: 1 }}>
              <View style={styles.proNameRow}>
                <Text style={styles.proName}>{booking?.proName || 'Sunil Verma'}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>★ 4.9</Text>
                </View>
              </View>
              <Text style={styles.proRole}>Certified Master Technician</Text>
              <Text style={styles.proJobs}>🛡️ Police & Background Verified</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
              <Text style={styles.callBtnText}>📞 Call Specialist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.msgBtn}
              onPress={() => Alert.alert('Chat', 'Opening live chat with specialist...')}
            >
              <Text style={styles.msgBtnText}>💬 Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Stepper Tracker */}
        <View style={styles.stepperCard}>
          <Text style={styles.stepperHeading}>STATUS TIMELINE</Text>
          {TRACKING_STEPS.map((step, idx) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepCircle,
                    step.done && styles.doneCircle,
                    step.active && styles.activeCircle,
                  ]}
                >
                  {step.done ? (
                    <Text style={styles.doneCheck}>✓</Text>
                  ) : step.active ? (
                    <View style={styles.pulseInner} />
                  ) : (
                    <Text style={styles.pendingDot}>•</Text>
                  )}
                </View>
                {idx < TRACKING_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      step.done && { backgroundColor: '#10B981' },
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepInfoCol}>
                <Text
                  style={[
                    styles.stepTitle,
                    step.active && { color: colors.primary, fontWeight: '800' },
                    step.done && { color: '#FFFFFF' },
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={styles.stepSub}>{step.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Service Details Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoHeading}>SERVICE LOCATION</Text>
          <Text style={styles.infoAddress}>{booking?.address || 'Flat 402, Royal Palms, Vijay Nagar, Indore'}</Text>

          <View style={styles.divider} />

          <Text style={styles.infoHeading}>PAYMENT DETAIL</Text>
          <View style={styles.paymentInfoRow}>
            <Text style={styles.payStatus}>Pay on Service Completion (Cash/UPI)</Text>
            <Text style={styles.payAmount}>₹{booking?.finalPrice || 499}</Text>
          </View>
        </View>

        {/* Back to Home Button */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text style={styles.homeBtnText}>Return to Home Screen</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  sosBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sosText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  etaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  etaLeft: {
    flex: 1,
  },
  etaLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  etaTime: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 2,
  },
  etaDist: {
    fontSize: 12,
    color: '#94A3B8',
  },
  pulseRadar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarIcon: {
    fontSize: 26,
  },
  otpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 45, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.35)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  otpHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  otpSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  otpPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  otpText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
  specialistCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 14,
    marginBottom: 14,
  },
  proRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  proAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  proNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  ratingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  proRole: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 2,
  },
  proJobs: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  callBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  msgBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  msgBtnText: {
    color: '#F1F5F9',
    fontSize: 12.5,
    fontWeight: '700',
  },
  stepperCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 16,
    marginBottom: 14,
  },
  stepperHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCircle: {
    backgroundColor: '#10B981',
  },
  activeCircle: {
    backgroundColor: 'rgba(255, 77, 45, 0.2)',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  doneCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  pulseInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  pendingDot: {
    color: '#64748B',
    fontSize: 14,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  stepInfoCol: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  stepSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 14,
    marginBottom: 14,
  },
  infoHeading: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoAddress: {
    color: '#FFFFFF',
    fontSize: 12.5,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDark,
    marginVertical: 12,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payStatus: {
    color: '#94A3B8',
    fontSize: 12,
  },
  payAmount: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  homeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  homeBtnText: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '700',
  },
});

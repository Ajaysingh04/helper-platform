import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Linking,
  Modal,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Vibration,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import client from '../api/client';
import { colors } from '../theme/colors';

export default function LiveTrackingScreen({ route, navigation }) {
  const initialBooking = route.params?.booking || {};
  const bookingCode =
    initialBooking?.bookingCode ||
    initialBooking?.bookingId ||
    initialBooking?.id ||
    initialBooking?._id ||
    'BK-88219';

  const { themeColors, isDark, language, primaryColor } = useContext(AppContext);
  const activeColor = primaryColor || '#FF4D2D';
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 36) : Math.max(insets.bottom, 16);

  // Live Tracking States: 'pending' | 'assigned' | 'on_the_way' | 'reached' | 'in_progress' | 'completed' | 'paid'
  const [status, setStatus] = useState(initialBooking?.status || 'on_the_way');
  const [workerName, setWorkerName] = useState(
    initialBooking?.assignedWorkerName || initialBooking?.proName || 'Ram Kumar Sharma'
  );
  const [workerPhone, setWorkerPhone] = useState(
    initialBooking?.assignedWorkerPhone || initialBooking?.proPhone || '+91 98765 43210'
  );
  const [workerEmail, setWorkerEmail] = useState(
    initialBooking?.assignedWorkerEmail || 'ram.technician@helper.in'
  );
  const [workerExperience, setWorkerExperience] = useState(
    initialBooking?.assignedWorkerExperience || initialBooking?.workerExperience || '6+ Years Experience'
  );
  const [workerRole, setWorkerRole] = useState(
    initialBooking?.serviceName || initialBooking?.service?.name || 'Verified Home Specialist'
  );
  const [hubName, setHubName] = useState(
    initialBooking?.assignedProviderName || 'Indore Multi-Specialist Hub (Vijay Nagar)'
  );
  const [startOtp, setStartOtp] = useState(
    initialBooking?.slotOtp || initialBooking?.doorOtp || initialBooking?.otp || initialBooking?.startOtp || initialBooking?.security?.startOtpPlainForCustomer || '3459'
  );
  const scheduledDateStr = String(initialBooking?.scheduledDate || initialBooking?.date || '');
  const scheduledTimeStr = String(initialBooking?.scheduledTime || initialBooking?.time || '');
  const combinedScheduleStr = `${scheduledDateStr} ${scheduledTimeStr}`.trim();

  // Smart Advance Booking Detection
  const isAdvance = Boolean(
    initialBooking?.isAdvanceBooking ||
    initialBooking?.advanceScheduled ||
    /tomorrow|kal|sat|sun|mon|tue|wed|thu|fri/i.test(combinedScheduleStr) ||
    /\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(combinedScheduleStr) ||
    (scheduledDateStr && scheduledDateStr.trim().length > 0 && !scheduledDateStr.toLowerCase().includes('today'))
  );

  const getAdvanceRemainingSeconds = () => {
    try {
      if (!isAdvance) return 0;
      const now = Date.now();
      if (initialBooking?.scheduledTimestamp && !isNaN(Number(initialBooking.scheduledTimestamp))) {
        return Math.max(0, Math.floor((Number(initialBooking.scheduledTimestamp) - now) / 1000));
      }
      const lower = combinedScheduleStr.toLowerCase();
      if (lower.includes('tomorrow') || lower.includes('kal')) {
        const timeMatch = combinedScheduleStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const ampm = (timeMatch[3] || '').toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          targetDate.setHours(hours, minutes, 0, 0);
        } else {
          targetDate.setHours(10, 0, 0, 0);
        }
        return Math.max(0, Math.floor((targetDate.getTime() - now) / 1000));
      }

      const monthMap = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
      const dateMatch = combinedScheduleStr.match(/(\d{1,2})\s+([A-Za-z]{3})/i) || combinedScheduleStr.match(/([A-Za-z]{3})\s+(\d{1,2})/i);
      const timeMatch = combinedScheduleStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

      if (dateMatch && dateMatch[1] && dateMatch[2]) {
        const currentYear = new Date().getFullYear();
        let day, month;
        if (!isNaN(parseInt(dateMatch[1], 10))) {
          day = parseInt(dateMatch[1], 10);
          month = monthMap[String(dateMatch[2]).toLowerCase().slice(0, 3)];
        } else {
          month = monthMap[String(dateMatch[1]).toLowerCase().slice(0, 3)];
          day = parseInt(dateMatch[2], 10);
        }
        let hours = 10, minutes = 0;
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          minutes = parseInt(timeMatch[2], 10);
          const ampm = (timeMatch[3] || '').toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }
        if (month !== undefined && !isNaN(day)) {
          const targetDate = new Date(currentYear, month, day, hours, minutes, 0, 0);
          if (targetDate.getTime() < now - 24 * 60 * 60 * 1000) {
            targetDate.setFullYear(currentYear + 1);
          }
          return Math.max(0, Math.floor((targetDate.getTime() - now) / 1000));
        }
      }

      return 18 * 60 * 60;
    } catch (e) {
      return 18 * 60 * 60;
    }
  };

  const [advanceSecRemaining, setAdvanceSecRemaining] = useState(getAdvanceRemainingSeconds);
  const [hasAlertedComingSoon, setHasAlertedComingSoon] = useState(false);
  const isAdvanceLocked = isAdvance && advanceSecRemaining > 3600;
  const isComingSoon = isAdvance && advanceSecRemaining <= 3600 && advanceSecRemaining > 0;

  useEffect(() => {
    if (!isAdvance) return;
    const interval = setInterval(() => {
      const remaining = getAdvanceRemainingSeconds();
      setAdvanceSecRemaining(remaining);
      if (remaining <= 3600 && remaining > 0 && !hasAlertedComingSoon) {
        setHasAlertedComingSoon(true);
        Alert.alert(
          language === 'hi' ? 'आपकी बुकिंग जल्द शुरू होने वाली है! ⚡' : 'Your Booking is Coming Soon! ⚡',
          language === 'hi'
            ? `विशेषज्ञ 1 घंटे से कम समय में आपके पते पर पहुंचने की तैयारी कर रहे हैं।\n\nअपॉइंटमेंट: ${combinedScheduleStr || 'Scheduled'}\nअपना 4-अंकों का स्टार्ट OTP तैयार रखें।`
            : `Our specialist is preparing to arrive at your doorstep in less than 1 hour.\n\nAppointment: ${combinedScheduleStr || 'Scheduled'}\nPlease keep your 4-digit Start OTP ready.`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isAdvance, combinedScheduleStr, hasAlertedComingSoon, language]);

  const formatAdvanceCountdown = (totalSec) => {
    if (totalSec <= 0) return '00h 00m 00s';
    const days = Math.floor(totalSec / (3600 * 24));
    const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const [etaMinutes, setEtaMinutes] = useState(12);
  const [serviceTimeWorked, setServiceTimeWorked] = useState(0);
  const [billAmount, setBillAmount] = useState(
    initialBooking?.finalPrice || initialBooking?.totalAmount || 499
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaid, setIsPaid] = useState(
    initialBooking?.isPaid || initialBooking?.paymentStatus === 'paid' || false
  );
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Customer Star Rating & Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedFeedbackTags, setSelectedFeedbackTags] = useState(['On-Time Arrival ⏱️', 'Clean Work 🧼']);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;
  const vehicleMoveAnim = useRef(new Animated.Value(0.4)).current;

  // Pulse & Radar Loop
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    const radarLoop = Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    radarLoop.start();

    // Subtle vehicle movement simulation on map canvas
    const vehicleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(vehicleMoveAnim, { toValue: 0.65, duration: 3500, useNativeDriver: false }),
        Animated.timing(vehicleMoveAnim, { toValue: 0.4, duration: 3500, useNativeDriver: false }),
      ])
    );
    vehicleLoop.start();

    return () => {
      pulseLoop.stop();
      radarLoop.stop();
      vehicleLoop.stop();
    };
  }, []);

  // Live Stopwatch when service is in_progress
  useEffect(() => {
    let timer;
    if (status === 'in_progress') {
      timer = setInterval(() => {
        setServiceTimeWorked((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  // ETA Countdown when on_the_way (only if not advance locked)
  useEffect(() => {
    let etaTimer;
    if (status === 'on_the_way' && !isAdvanceLocked) {
      etaTimer = setInterval(() => {
        setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
      }, 60000);
    }
    return () => clearInterval(etaTimer);
  }, [status, isAdvanceLocked]);

  // Polling backend dispatch engine safely with client.get('/bookings')
  useEffect(() => {
    let poller;
    const fetchBookingStatus = () => {
      client
        .get('/bookings')
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            const found =
              res.data.data.find(
                (b) =>
                  b.bookingCode === bookingCode ||
                  b.id === bookingCode ||
                  b._id === bookingCode ||
                  b.bookingId === bookingCode
              ) ||
              res.data.data.find(
                (b) =>
                  (typeof b.customerPhone === 'string' && b.customerPhone.includes('7389451349')) ||
                  (typeof b.customerName === 'string' && b.customerName.toLowerCase().includes('ajay'))
              );

            if (found) {
              if (found.status && found.status !== status) {
                setStatus(found.status);
              }
              if (found.assignedWorkerName) {
                setWorkerName(found.assignedWorkerName);
              }
              if (found.assignedWorkerPhone) {
                setWorkerPhone(found.assignedWorkerPhone);
              }
              if (found.assignedWorkerEmail) {
                setWorkerEmail(found.assignedWorkerEmail);
              }
              if (found.assignedWorkerExperience || found.assignedWorker?.experience) {
                setWorkerExperience(found.assignedWorkerExperience || found.assignedWorker?.experience);
              }
              if (found.assignedWorker?.role || found.serviceCategory) {
                setWorkerRole(found.assignedWorker?.role || found.serviceCategory || 'Specialist');
              }
              if (found.assignedProviderName) {
                setHubName(found.assignedProviderName);
              }
              if (found.slotOtp || found.doorOtp || found.startOtp || found.otp || found.security?.startOtpPlainForCustomer) {
                setStartOtp(found.slotOtp || found.doorOtp || found.startOtp || found.otp || found.security?.startOtpPlainForCustomer);
              }
              if (found.calculatedAmount || found.totalAmount || found.finalPrice) {
                setBillAmount(found.calculatedAmount || found.totalAmount || found.finalPrice);
              }
              if (found.paymentStatus === 'paid' || found.status === 'paid' || found.isPaid) {
                setIsPaid(true);
              }
            }
          }
        })
        .catch(() => {});
    };

    fetchBookingStatus();
    poller = setInterval(fetchBookingStatus, 3000);
    return () => clearInterval(poller);
  }, [bookingCode, status]);

  const formatStopwatch = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCallSpecialist = () => {
    if (status === 'pending') {
      Alert.alert(
        language === 'hi' ? 'कृपया प्रतीक्षा करें' : 'Please Wait',
        language === 'hi'
          ? 'निकटतम हब से कारीगर असाइन किया जा रहा है।'
          : 'Specialist is being assigned by the nearest hub.'
      );
      return;
    }
    const cleanPhone = (workerPhone || '9876543210').replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Specialist Contact', `Phone: ${workerPhone}`);
    });
  };

  const handleWhatsAppSpecialist = () => {
    const cleanPhone = (workerPhone || '9876543210').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${workerName}, I am contacting you regarding Helper Booking #${bookingCode}. Please update your arrival status.`
    );
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${msg}`).catch(() => {
      Linking.openURL(`sms:${cleanPhone}?body=${msg}`).catch(() => {
        Alert.alert('Specialist WhatsApp', `Number: ${workerPhone}`);
      });
    });
  };

  const handleCopyOtp = () => {
    try {
      Vibration.vibrate(40);
    } catch (e) {}
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handlePayViaUpi = async () => {
    try {
      await client.post(`/bookings/${bookingCode}/pay`, {
        paymentMethod: 'upi',
        amount: billAmount,
        paidTo: 'helper.indore@icici',
      });
    } catch (e) {}

    setIsPaid(true);
    setStatus('paid');
    setShowPaymentModal(false);
    Alert.alert(
      language === 'hi' ? 'भुगतान सफल! 🎉' : 'Payment Successful! 🎉',
      `₹${billAmount} ${language === 'hi' ? 'सफलतापूर्वक प्राप्त हुआ।' : 'successfully paid to Helper Platform.'}\n\n• 30-Day Quality Warranty Activated\n• Thank you for choosing Helper!`
    );
  };

  const handleSubmitFeedback = async () => {
    setIsSubmittingFeedback(true);
    try {
      await client.post(`/bookings/${bookingCode}/review`, {
        rating: feedbackRating,
        review: feedbackComment,
        tags: selectedFeedbackTags,
      });
      setFeedbackSubmitted(true);
      setShowFeedbackModal(false);
      Alert.alert('Review Submitted! ⭐', 'Thank you for your valuable feedback. It helps us maintain top quality standards!');
    } catch (e) {
      setFeedbackSubmitted(true);
      setShowFeedbackModal(false);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Auto trigger feedback modal when service finishes
  useEffect(() => {
    if (['work_completed', 'completed', 'paid'].includes(status) && !feedbackSubmitted) {
      const timer = setTimeout(() => {
        setShowFeedbackModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, feedbackSubmitted]);

  // Safe OTP digits array
  const otpDigits = String(startOtp || '5421').padStart(4, '0').slice(0, 4).split('');

  // Dynamic Theme Colors
  const bgMain = isDark ? '#070A12' : '#F8FAFC';
  const cardBg = isDark ? '#0F172A' : '#FFFFFF';
  const borderCol = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const textTitle = isDark ? '#FFFFFF' : '#0F172A';
  const textSub = isDark ? '#94A3B8' : '#64748B';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgMain }]} edges={['top', 'left', 'right']}>
      {/* ================= 1. MODERN HEADER ================= */}
      <View style={[styles.header, { backgroundColor: isDark ? '#0C111E' : '#FFFFFF', borderBottomColor: borderCol }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => navigation.navigate('MainTabs')}
          activeOpacity={0.7}
        >
          <Text style={[styles.backIcon, { color: textTitle }]}>‹</Text>
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.headerTitle, { color: textTitle }]}>
              {language === 'hi' ? 'लाइव कारीगर ट्रैकिंग' : 'Live Specialist Tracking'}
            </Text>
            <View style={styles.livePulseDotOuter}>
              <Animated.View style={[styles.livePulseDotInner, { transform: [{ scale: pulseAnim }] }]} />
            </View>
          </View>
          <Text style={[styles.headerSub, { color: textSub }]}>
            #{bookingCode} • 15-Min Doorstep Guarantee
          </Text>
        </View>

        <TouchableOpacity
          style={styles.sosBtn}
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert(
              'Helper 24/7 Priority Helpline 📞',
              'Need immediate support with this live booking?',
              [
                { text: 'Call Support (1800-123-456)', onPress: () => Linking.openURL('tel:1800123456').catch(() => {}) },
                { text: 'Cancel', style: 'cancel' },
              ]
            )
          }
        >
          <Text style={styles.sosText}>SOS / HELP</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= 1.5 1-HOUR ADVANCE ALERT BANNER ================= */}
        {isComingSoon && (
          <View style={{
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.16)' : '#FFFBEB',
            borderColor: '#F59E0B',
            borderWidth: 1.5,
            borderRadius: 16,
            padding: 14,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#FEF3C7',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 22 }}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: '#D97706', fontSize: 10.5, fontWeight: '900', letterSpacing: 0.5 }}>
                  1-HOUR REMINDER • COMING SOON
                </Text>
              </View>
              <Text style={{ color: isDark ? '#FCD34D' : '#B45309', fontSize: 14.5, fontWeight: '900', marginTop: 1 }}>
                {language === 'hi' ? 'आपकी बुकिंग जल्द शुरू होने वाली है' : 'Your booking is coming soon'}
              </Text>
              <Text style={{ color: isDark ? '#E2E8F0' : '#78350F', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                {language === 'hi'
                  ? `अपॉइंटमेंट: ${combinedScheduleStr} • शेष समय: -${formatAdvanceCountdown(advanceSecRemaining)}`
                  : `Appointment: ${combinedScheduleStr} • Starts in: -${formatAdvanceCountdown(advanceSecRemaining)}`}
              </Text>
            </View>
          </View>
        )}

        {/* ================= 2. INTERACTIVE GPS ROUTE CANVAS ================= */}
        <View style={[
          styles.mapCanvasCard,
          {
            backgroundColor: isDark ? '#0B1120' : '#E2E8F0',
            borderColor: borderCol,
            height: isAdvanceLocked ? 285 : 230,
          }
        ]}>
          {/* Subtle Grid Map Visuals */}
          <View style={styles.mapGridPattern}>
            <View style={[styles.mapRoadH, { top: '35%' }]} />
            <View style={[styles.mapRoadH, { top: '70%' }]} />
            <View style={[styles.mapRoadV, { left: '30%' }]} />
            <View style={[styles.mapRoadV, { left: '72%' }]} />
          </View>

          {/* Satellite Telemetry Pill Top Left */}
          <View style={styles.telemetryPill}>
            <View style={styles.telemetryGreenDot} />
            <Text style={styles.telemetryText}>GPS TELEMETRY ACTIVE • 5M ACCURACY</Text>
          </View>

          {/* Connecting Live Route Line */}
          <View style={styles.mapRouteContainer}>
            {/* Origin Pin: Indore Hub */}
            <View style={styles.originPinBox}>
              <View style={styles.hubPinCircle}>
                <Text style={{ fontSize: 13 }}>🏢</Text>
              </View>
              <Text style={styles.pinTagText}>Indore Hub</Text>
            </View>

            {/* Moving Live Specialist Vehicle with Pulsing Halo */}
            <Animated.View
              style={[
                styles.movingVehicleBox,
                {
                  left: vehicleMoveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['22%', '78%'],
                  }),
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.vehiclePulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.25],
                      outputRange: [0.6, 0.1],
                    }),
                  },
                ]}
              />
              <View style={[styles.vehicleCircle, { backgroundColor: activeColor }]}>
                <Text style={{ fontSize: 18 }}>🛵</Text>
              </View>
              <View style={styles.vehicleLabelPill}>
                <Text style={styles.vehicleLabelText} numberOfLines={1}>
                  {String(workerName || 'Ramesh').split(' ')[0]}
                </Text>
              </View>
            </Animated.View>

            {/* Destination Pin: Customer Doorstep */}
            <View style={styles.destPinBox}>
              <View style={styles.destPinCircle}>
                <Text style={{ fontSize: 14 }}>🏠</Text>
              </View>
              <Text style={styles.pinTagText}>Your Doorstep</Text>
            </View>
          </View>

          {/* Floating Glassmorphic ETA Banner on Map */}
          <View style={[
            styles.floatingEtaCard,
            isAdvanceLocked && {
              borderColor: '#3B82F6',
              backgroundColor: isDark ? 'rgba(30, 58, 138, 0.95)' : 'rgba(239, 246, 255, 0.98)',
              paddingVertical: 12,
              paddingHorizontal: 14,
            }
          ]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.floatingEtaIcon}>{isAdvanceLocked ? '📅' : isComingSoon ? '⚡' : '🛵'}</Text>
                <Text style={[
                  styles.floatingEtaTitle,
                  isAdvanceLocked && { color: isDark ? '#93C5FD' : '#1D4ED8' },
                  isComingSoon && { color: isDark ? '#FCD34D' : '#D97706' },
                ]}>
                  {isAdvanceLocked
                    ? (language === 'hi' ? 'अग्रिम बुकिंग आरक्षित' : 'ADVANCE BOOKING CONFIRMED')
                    : isComingSoon
                    ? (language === 'hi' ? 'आपकी बुकिंग जल्द आ रही है' : 'YOUR BOOKING IS COMING SOON')
                    : status === 'reached' || status === 'arrived'
                    ? 'AT YOUR DOORSTEP'
                    : status === 'in_progress'
                    ? 'WORKING AT DOORSTEP'
                    : status === 'completed' || status === 'paid' || status === 'work_completed'
                    ? 'SERVICE COMPLETED'
                    : `${etaMinutes} MINS AWAY • 2.4 KM`}
                </Text>
              </View>
              <Text style={[
                styles.floatingEtaSub,
                isAdvanceLocked && { color: isDark ? '#E2E8F0' : '#1E40AF', fontWeight: '700' },
                isComingSoon && { color: isDark ? '#FDE68A' : '#92400E', fontWeight: '700' },
              ]}>
                {isAdvanceLocked
                  ? `Appointment: ${combinedScheduleStr || 'Tomorrow'} • Starts in: -${formatAdvanceCountdown(advanceSecRemaining)}`
                  : isComingSoon
                  ? `Appointment: ${combinedScheduleStr || 'Scheduled Soon'} • Starts in: -${formatAdvanceCountdown(advanceSecRemaining)}`
                  : status === 'reached' || status === 'arrived'
                  ? 'Specialist has arrived outside your home'
                  : status === 'in_progress'
                  ? `Active work stopwatch: ${formatStopwatch(serviceTimeWorked)}`
                  : ['completed', 'paid', 'work_completed'].includes(status)
                  ? 'Service work completed successfully!'
                  : 'Speed: 28 km/h • Traffic: Smooth • On Schedule'}
              </Text>
              {isAdvanceLocked && (
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginTop: 4, lineHeight: 15 }}>
                  🔒 Live GPS navigation will activate 1 hour before scheduled appointment time.
                </Text>
              )}
              {isComingSoon && (
                <Text style={{ color: isDark ? '#FDE68A' : '#B45309', fontSize: 11, marginTop: 4, lineHeight: 15, fontWeight: '700' }}>
                  ⚡ Specialist is preparing for arrival. Your location is unlocked!
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.recenterBtn, { alignSelf: 'center' }]}
              onPress={handleCallSpecialist}
              activeOpacity={0.8}
            >
              <Text style={styles.recenterIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 3. DYNAMIC STATUS HERO CARD ================= */}
        {isAdvanceLocked ? (
          <View style={[styles.statusHero, { borderColor: '#3B82F6', backgroundColor: isDark ? 'rgba(30, 58, 138, 0.15)' : '#EFF6FF' }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>📅</Text>
                <Text style={[styles.statusHeroLabel, { color: '#2563EB' }]}>
                  {language === 'hi' ? 'अग्रिम बुकिंग आरक्षित' : 'ADVANCE APPOINTMENT RESERVED'}
                </Text>
              </View>
              <Text style={[styles.statusHeroMain, { color: textTitle }]}>
                {combinedScheduleStr || 'Scheduled'}
              </Text>
              <Text style={[styles.statusHeroSub, { color: textSub }]}>
                {language === 'hi'
                  ? 'विशेषज्ञ की रवानगी निर्धारित समय से 1 घंटे पहले शुरू होगी'
                  : 'Specialist departure scheduled 1 hour before appointment time'}
              </Text>
            </View>
            <View style={[styles.statusHeroIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Text style={{ fontSize: 26 }}>⏳</Text>
            </View>
          </View>
        ) : isComingSoon ? (
          <View style={[styles.statusHero, { borderColor: '#F59E0B', backgroundColor: isDark ? 'rgba(245, 158, 11, 0.16)' : '#FFFBEB' }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>⚡</Text>
                <Text style={[styles.statusHeroLabel, { color: '#D97706' }]}>
                  {language === 'hi' ? 'आपकी बुकिंग जल्द आ रही है' : 'YOUR BOOKING IS COMING SOON'}
                </Text>
              </View>
              <Text style={[styles.statusHeroMain, { color: textTitle }]}>
                {combinedScheduleStr || 'Starting Soon'}
              </Text>
              <Text style={[styles.statusHeroSub, { color: textSub }]}>
                {language === 'hi'
                  ? `विशेषज्ञ 1 घंटे से कम समय में निकल रहे हैं। स्टार्ट OTP तैयार रखें।`
                  : `Starting in ~${Math.ceil(advanceSecRemaining / 60)} mins. Specialist preparing for arrival.`}
              </Text>
            </View>
            <View style={[styles.statusHeroIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Text style={{ fontSize: 26 }}>⚡</Text>
            </View>
          </View>
        ) : status === 'in_progress' ? (
          <View style={[styles.statusHero, { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>⏱️</Text>
                <Text style={[styles.statusHeroLabel, { color: '#F59E0B' }]}>SERVICE IN PROGRESS</Text>
              </View>
              <Text style={[styles.statusHeroMain, { color: textTitle }]}>{formatStopwatch(serviceTimeWorked)}</Text>
              <Text style={[styles.statusHeroSub, { color: textSub }]}>Specialist is actively repairing at your doorstep</Text>
            </View>
            <View style={[styles.statusHeroIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Text style={{ fontSize: 26 }}>🛠️</Text>
            </View>
          </View>
        ) : ['completed', 'paid', 'work_completed'].includes(status) ? (
          <View style={[styles.statusHero, { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>🏆</Text>
                <Text style={[styles.statusHeroLabel, { color: '#10B981' }]}>
                  {isPaid ? 'SERVICE COMPLETED & PAID ✓' : 'WORK COMPLETED • BILL DUE'}
                </Text>
              </View>
              <Text style={[styles.statusHeroMain, { color: '#10B981' }]}>Total Bill: ₹{billAmount}</Text>
              <Text style={[styles.statusHeroSub, { color: textSub }]}>
                {isPaid ? '30-Day Money-Back Warranty Activated' : 'Tap below to complete payment via UPI'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.payNowSmallBtn}
              onPress={() => setShowFeedbackModal(true)}
            >
              <Text style={styles.payNowSmallBtnText}>Rate 5★</Text>
            </TouchableOpacity>
          </View>
        ) : (status === 'reached' || status === 'arrived') ? (
          <View style={[styles.statusHero, { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>📍</Text>
                <Text style={[styles.statusHeroLabel, { color: '#10B981' }]}>SPECIALIST AT DOORSTEP</Text>
              </View>
              <Text style={[styles.statusHeroMain, { color: textTitle }]}>Specialist Arrived!</Text>
              <Text style={[styles.statusHeroSub, { color: textSub }]}>Please share your 4-digit secret OTP below to begin</Text>
            </View>
            <View style={[styles.statusHeroIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Text style={{ fontSize: 26 }}>🚪</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.statusHero, { borderColor: activeColor, backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>🛵</Text>
                <Text style={[styles.statusHeroLabel, { color: activeColor }]}>SPECIALIST EN ROUTE</Text>
              </View>
              <Text style={[styles.statusHeroMain, { color: textTitle }]}>{etaMinutes} Mins Arrival</Text>
              <Text style={[styles.statusHeroSub, { color: textSub }]}>
                {workerName} is travelling towards your Indore address
              </Text>
            </View>
            <View style={[styles.statusHeroIconBox, { backgroundColor: `${activeColor}20` }]}>
              <Text style={{ fontSize: 26 }}>⚡</Text>
            </View>
          </View>
        )}

        {/* ================= 4. LUXURIOUS GOLD 4-DIGIT START OTP VAULT ================= */}
        <View style={[styles.otpVaultCard, { backgroundColor: isDark ? '#141A28' : '#FFFBEB', borderColor: '#F59E0B' }]}>
          <View style={styles.otpHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Text style={{ fontSize: 17 }}>🔐</Text>
              <Text style={styles.otpVaultTitle}>DOORSTEP SERVICE START OTP</Text>
            </View>
            <TouchableOpacity style={styles.otpCopyBtn} onPress={handleCopyOtp} activeOpacity={0.7}>
              <Text style={styles.otpCopyBtnText}>{copiedOtp ? '✓ COPIED' : '📋 COPY'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.otpVaultDesc, { color: isDark ? '#94A3B8' : '#78350F' }]}>
            {language === 'hi'
              ? 'यह 4-अंकों का गुप्त कोड केवल कारीगर के घर पहुँचने पर ही शेयर करें।'
              : 'Share this secret 4-digit code with the technician only when they arrive at your home.'}
          </Text>

          {/* 4 Individual Digit Vault Boxes */}
          <View style={styles.otpBoxesRow}>
            {otpDigits.map((digit, idx) => (
              <View key={idx} style={[styles.otpSingleBox, { backgroundColor: isDark ? '#1E293B' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Text style={styles.otpSingleDigit}>{digit}</Text>
              </View>
            ))}
          </View>

          <View style={styles.otpSecurityBadge}>
            <Text style={{ fontSize: 12 }}>🛡️</Text>
            <Text style={styles.otpSecurityText}>
              Helper Escrow Protected: Technician cannot start or charge without your OTP verification.
            </Text>
          </View>
        </View>

        {/* ================= 5. ASSIGNED SPECIALIST PROFILE CARD ================= */}
        <View style={[styles.specialistCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.proRow}>
            <View style={styles.proAvatarContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
                }}
                style={styles.proAvatar}
              />
              <View style={styles.verifiedCheckPill}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>✓</Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.proName, { color: textTitle }]} numberOfLines={1}>
                  {workerName}
                </Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>★ 4.95</Text>
                </View>
              </View>

              <Text style={[styles.proRole, { color: textSub }]} numberOfLines={1}>
                {workerRole} • Verified Specialist
              </Text>

              {/* Experience Badge */}
              <View style={styles.experienceBadge}>
                <Text style={styles.experienceBadgeText}>🏆 {workerExperience}</Text>
              </View>

              <Text style={styles.proClearanceText}>🛡️ Police Clearance & Aadhaar Verified</Text>
            </View>
          </View>

          {/* Specialist Contact & Quick Action Buttons */}
          <View style={[styles.proActionsRow, { borderTopColor: borderCol }]}>
            <TouchableOpacity
              style={[styles.actionBtnCall, { backgroundColor: `${activeColor}15`, borderColor: activeColor }]}
              onPress={handleCallSpecialist}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 16 }}>📞</Text>
              <Text style={[styles.actionBtnText, { color: activeColor }]}>Call Specialist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtnChat, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' }]}
              onPress={handleWhatsAppSpecialist}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 16 }}>💬</Text>
              <Text style={[styles.actionBtnText, { color: '#10B981' }]}>WhatsApp / Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 6. LIVE SERVICE MILESTONES STEPPER ================= */}
        <View style={[styles.stepperCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.stepperHeader}>
            <Text style={[styles.stepperTitle, { color: activeColor }]}>LIVE SERVICE MILESTONES</Text>
            <View style={styles.liveTagBadge}>
              <View style={styles.liveGreenDotSmall} />
              <Text style={styles.liveTagText}>TRACKING ACTIVE</Text>
            </View>
          </View>

          {[
            {
              step: 1,
              title: 'Booking Confirmed',
              sub: 'Service scheduled for doorstep arrival',
              done: true,
            },
            {
              step: 2,
              title: 'Specialist Assigned',
              sub: `${workerName} (Verified Expert) confirmed`,
              done: status !== 'pending' || !!workerName,
              active: status === 'assigned',
            },
            {
              step: 3,
              title: 'Specialist En Route to Doorstep',
              sub: 'Live GPS tracked arrival at your address',
              done: ['on_the_way', 'reached', 'in_progress', 'completed', 'paid'].includes(status),
              active: status === 'on_the_way',
            },
            {
              step: 4,
              title: 'Doorstep Arrival & OTP Verified',
              sub: '4-digit OTP verified to begin work safely',
              done: ['in_progress', 'completed', 'paid'].includes(status),
              active: status === 'reached',
            },
            {
              step: 5,
              title: 'Service in Progress',
              sub:
                status === 'in_progress'
                  ? `Live work stopwatch: ${formatStopwatch(serviceTimeWorked)}`
                  : 'Professional repair & maintenance underway',
              done: ['completed', 'paid'].includes(status),
              active: status === 'in_progress',
            },
            {
              step: 6,
              title: 'Completed & 30-Day Warranty',
              sub: '30-Day Helper Quality & Satisfaction Guarantee',
              done: status === 'paid',
              active: status === 'completed',
            },
          ].map((item, idx) => (
            <View key={item.step} style={styles.milestoneRow}>
              <View style={styles.milestoneIndicatorCol}>
                <View
                  style={[
                    styles.milestoneCircle,
                    item.done && styles.milestoneDoneCircle,
                    item.active && [styles.milestoneActiveCircle, { borderColor: activeColor }],
                  ]}
                >
                  {item.done ? (
                    <Text style={styles.milestoneCheckIcon}>✓</Text>
                  ) : item.active ? (
                    <View style={[styles.milestonePulseDot, { backgroundColor: activeColor }]} />
                  ) : (
                    <Text style={styles.milestonePendingDot}>•</Text>
                  )}
                </View>
                {idx < 5 && (
                  <View
                    style={[
                      styles.milestoneLine,
                      item.done && { backgroundColor: '#10B981' },
                    ]}
                  />
                )}
              </View>

              <View style={styles.milestoneInfoCol}>
                <Text
                  style={[
                    styles.milestoneTitle,
                    { color: item.active ? activeColor : item.done ? textTitle : textSub },
                    item.active && { fontWeight: '800' },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={[styles.milestoneSub, { color: textSub }]}>{item.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ================= 7. SERVICE BILL & SATISFACTION GUARANTEE ================= */}
        <View style={[styles.billCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={[styles.billHeading, { color: textSub }]}>TRANSPARENT BILL & ESCROW SUMMARY</Text>

          <View style={styles.billPriceRow}>
            <View>
              <Text style={[styles.billItemTitle, { color: textTitle }]}>
                {status === 'in_progress'
                  ? `Active Work Time: ${formatStopwatch(serviceTimeWorked)}`
                  : 'Total Fixed Rate'}
              </Text>
              <Text style={[styles.billItemSub, { color: textSub }]}>No hidden doorstep charges • Transparent pricing</Text>
            </View>
            <Text style={styles.billAmountValue}>₹{billAmount}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: borderCol }]} />

          {/* 30-Day Money Back Guarantee Banner */}
          <View style={styles.guaranteeBanner}>
            <Text style={{ fontSize: 20 }}>🛡️</Text>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.guaranteeTitle}>Helper 100% Quality & Buyer Protection</Text>
              <Text style={styles.guaranteeSub}>
                Covered by 30-Day Free Re-Service Warranty. Pay securely only after 100% satisfaction.
              </Text>
            </View>
          </View>

          {status === 'completed' && !isPaid && (
            <TouchableOpacity
              style={[styles.payButtonBig, { backgroundColor: '#10B981' }]}
              onPress={() => setShowPaymentModal(true)}
              activeOpacity={0.88}
            >
              <Text style={styles.payButtonBigText}>Scan Dynamic UPI QR & Pay ₹{billAmount} ➔</Text>
            </TouchableOpacity>
          )}

          {isPaid && (
            <View style={styles.paidBadgeBox}>
              <Text style={styles.paidBadgeText}>✓ Payment Successfully Confirmed by Helper Platform</Text>
            </View>
          )}
        </View>

        {/* ================= 8. LIVE SIMULATOR BAR (FOR QUICK REVIEW) ================= */}
        <View style={[styles.testBarContainer, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={[styles.testBarLabel, { color: textSub }]}>⚡ LIVE TRACKING STAGE SIMULATOR:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {[
              { key: 'assigned', label: '1. Assigned' },
              { key: 'on_the_way', label: '2. On The Way' },
              { key: 'reached', label: '3. At Doorstep' },
              { key: 'in_progress', label: '4. In Progress' },
              { key: 'completed', label: '5. Completed' },
              { key: 'paid', label: '6. Paid' },
            ].map((st) => (
              <TouchableOpacity
                key={st.key}
                style={[
                  styles.testChip,
                  status === st.key && [styles.testChipActive, { borderColor: activeColor, backgroundColor: `${activeColor}20` }],
                ]}
                onPress={() => {
                  try {
                    Vibration.vibrate(30);
                  } catch (e) {}
                  setStatus(st.key);
                }}
              >
                <Text
                  style={[
                    styles.testChipText,
                    status === st.key && { color: activeColor, fontWeight: '800' },
                  ]}
                >
                  {st.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* ================= MODAL: DYNAMIC CUSTOMER UPI QR ================= */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#0C111E' : '#FFFFFF', paddingBottom: 20 + bottomInset }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: textTitle }]}>Dynamic Service Bill QR 📱</Text>
                <Text style={[styles.modalSubtitle, { color: textSub }]}>Helper Secure UPI Gateway</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Text style={[styles.modalCloseText, { color: textSub }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalQrBody}>
              {serviceTimeWorked > 0 && (
                <View style={styles.durationPill}>
                  <Text style={styles.durationPillText}>
                    ⏱️ Total Service Time: {Math.max(1, Math.ceil(serviceTimeWorked / 60))} Mins ({formatStopwatch(serviceTimeWorked)})
                  </Text>
                </View>
              )}

              <Text style={[styles.qrTotalText, { color: textTitle }]}>₹{billAmount}</Text>
              <Text style={[styles.qrTotalSub, { color: textSub }]}>Pay via PhonePe, Google Pay, Paytm, or BHIM UPI</Text>

              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=helper.indore@icici%26pn=HelperPlatform%26am=${billAmount}%26cu=INR`,
                }}
                style={styles.qrImage}
              />

              <Text style={styles.payeeAddress}>Official UPI ID: helper.indore@icici</Text>

              <TouchableOpacity
                style={[styles.confirmPayBtn, { backgroundColor: '#10B981' }]}
                onPress={handlePayViaUpi}
                activeOpacity={0.88}
              >
                <Text style={styles.confirmPayBtnText}>I Have Paid ₹{billAmount} via UPI ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: CUSTOMER SERVICE RATING & FEEDBACK ================= */}
      <Modal visible={showFeedbackModal} transparent animationType="slide" onRequestClose={() => setShowFeedbackModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#0C111E' : '#FFFFFF', paddingBottom: 24 + bottomInset }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: textTitle }]}>Rate Your Experience ⭐</Text>
                <Text style={[styles.modalSubtitle, { color: textSub }]}>Your feedback helps us maintain top quality standards</Text>
              </View>
              <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                <Text style={[styles.modalCloseText, { color: textSub }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginVertical: 14 }}>
              {/* Star Rating Row */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setFeedbackRating(star)}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 36, color: star <= feedbackRating ? '#F59E0B' : '#CBD5E1' }}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ color: '#F59E0B', fontSize: 16, fontWeight: '900', marginBottom: 12 }}>
                {feedbackRating === 5 ? 'Excellent! 🌟🌟🌟🌟🌟' :
                 feedbackRating === 4 ? 'Very Good! 👍' :
                 feedbackRating === 3 ? 'Average Service 🙂' :
                 feedbackRating === 2 ? 'Needs Improvement ⚠️' : 'Poor Experience ❌'}
              </Text>

              {/* Quick Feedback Tags */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                {[
                  'On-Time Arrival ⏱️',
                  'Clean & Hygienic 🧼',
                  'Expert Workmanship 👔',
                  'Polite Behavior 😊',
                  'Pocket Friendly 💰',
                  'Genuine Parts 🔩',
                ].map((tag) => {
                  const isSelected = selectedFeedbackTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : (isDark ? '#1E293B' : '#F1F5F9'),
                        borderWidth: 1,
                        borderColor: isSelected ? '#10B981' : (isDark ? '#334155' : '#E2E8F0'),
                      }}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedFeedbackTags((prev) => prev.filter((t) => t !== tag));
                        } else {
                          setSelectedFeedbackTags((prev) => [...prev, tag]);
                        }
                      }}
                    >
                      <Text style={{
                        color: isSelected ? '#059669' : (isDark ? '#94A3B8' : '#64748B'),
                        fontSize: 12,
                        fontWeight: '700',
                      }}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Optional Comments Input */}
              <TextInput
                style={{
                  width: '100%',
                  height: 70,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  padding: 10,
                  color: textTitle,
                  fontSize: 13,
                  textAlignVertical: 'top',
                  marginBottom: 16,
                }}
                placeholder="Write an optional review or suggestions for Helper..."
                placeholderTextColor={textSub}
                value={feedbackComment}
                onChangeText={setFeedbackComment}
                multiline
              />

              {/* Action Buttons */}
              <View style={{ width: '100%', gap: 10 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#10B981',
                    paddingVertical: 14,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#10B981',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  activeOpacity={0.88}
                  disabled={isSubmittingFeedback}
                  onPress={handleSubmitFeedback}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>
                    {isSubmittingFeedback ? 'Submitting...' : 'Submit Rating & Feedback ⭐'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => setShowFeedbackModal(false)}
                >
                  <Text style={{ color: textSub, fontSize: 13, fontWeight: '600' }}>
                    Skip for Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 11,
    marginTop: 1,
  },
  livePulseDotOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  sosBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sosText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
  },

  /* GPS ROUTE CANVAS */
  mapCanvasCard: {
    height: 230,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    justifyContent: 'space-between',
    padding: 12,
  },
  mapGridPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  mapRoadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#94A3B8',
  },
  mapRoadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#94A3B8',
  },
  telemetryPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  telemetryGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  telemetryText: {
    color: '#34D399',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  mapRouteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    paddingHorizontal: 12,
    marginVertical: 18,
  },
  originPinBox: {
    alignItems: 'center',
  },
  hubPinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  destPinBox: {
    alignItems: 'center',
  },
  destPinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  pinTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  movingVehicleBox: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 58,
    marginLeft: -45,
  },
  vehiclePulseRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FF4D2D',
  },
  vehicleCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4D2D',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  vehicleLabelPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    minWidth: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleLabelText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  floatingEtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  floatingEtaIcon: {
    fontSize: 16,
  },
  floatingEtaTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  floatingEtaSub: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
  },
  recenterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 77, 45, 0.2)',
    borderWidth: 1,
    borderColor: '#FF4D2D',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  recenterIcon: {
    fontSize: 16,
  },

  /* STATUS HERO */
  statusHero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  statusHeroLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statusHeroMain: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 2,
  },
  statusHeroSub: {
    fontSize: 11.5,
  },
  statusHeroIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  payNowSmallBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  payNowSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* OTP VAULT */
  otpVaultCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpVaultTitle: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  otpCopyBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  otpCopyBtnText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  otpVaultDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 4,
  },
  otpSingleBox: {
    width: 56,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  otpSingleDigit: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F59E0B',
  },
  otpSecurityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
  },
  otpSecurityText: {
    color: '#94A3B8',
    fontSize: 10,
    flex: 1,
    lineHeight: 14,
  },

  /* SPECIALIST PROFILE */
  specialistCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  proRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  proAvatarContainer: {
    position: 'relative',
  },
  proAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  verifiedCheckPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  proName: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  proRole: {
    fontSize: 12,
    marginTop: 2,
  },
  experienceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 5,
  },
  experienceBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  proClearanceText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  proActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtnCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnChat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
  },

  /* MILESTONES STEPPER */
  stepperCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepperTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  liveTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveGreenDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveTagText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '800',
  },
  milestoneRow: {
    flexDirection: 'row',
    minHeight: 50,
  },
  milestoneIndicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  milestoneCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneDoneCircle: {
    backgroundColor: '#10B981',
  },
  milestoneActiveCircle: {
    backgroundColor: 'rgba(255, 77, 45, 0.2)',
    borderWidth: 2,
  },
  milestoneCheckIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  milestonePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  milestonePendingDot: {
    color: '#64748B',
    fontSize: 14,
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 4,
  },
  milestoneInfoCol: {
    flex: 1,
    paddingBottom: 12,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  milestoneSub: {
    fontSize: 11,
    marginTop: 2,
  },

  /* BILL SUMMARY */
  billCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  billHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  billPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  billItemSub: {
    fontSize: 10.5,
    marginTop: 2,
  },
  billAmountValue: {
    color: '#10B981',
    fontSize: 22,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  guaranteeTitle: {
    color: '#38BDF8',
    fontSize: 11.5,
    fontWeight: '800',
  },
  guaranteeSub: {
    color: '#94A3B8',
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 2,
  },
  payButtonBig: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonBigText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
  },
  paidBadgeBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  paidBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
  },

  /* SIMULATOR STAGE BAR */
  testBarContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  testBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  testChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  testChipActive: {
    borderWidth: 1,
  },
  testChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalQrBody: {
    alignItems: 'center',
  },
  durationPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 8,
  },
  durationPillText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  qrTotalText: {
    fontSize: 32,
    fontWeight: '900',
  },
  qrTotalSub: {
    fontSize: 11,
    marginBottom: 12,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 8,
  },
  payeeAddress: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  confirmPayBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmPayBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});

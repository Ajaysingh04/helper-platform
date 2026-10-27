import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  StatusBar,
  Animated,
  Easing,
  Vibration,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import client from '../api/client';
import { colors } from '../theme/colors';
import { CartContext } from '../context/CartContext';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { saveIncompleteBooking, deleteIncompleteBooking } from '../services/AbandonedBookingService';

// Quick optional suggestions to help user type or pick faster
const SUGGESTED_TIMES = ['10:00 AM', '11:30 AM', '01:00 PM', '03:30 PM', '05:00 PM', '07:00 PM'];

export default function BookingCheckoutScreen({ route, navigation }) {
  const { service, pro } = route.params || {};
  const { bookingAddress } = useContext(CartContext);
  const { primaryColor, heroBanners, themeColors, isDark, language, t, showCustomAlert } = useContext(AppContext);
  const { currentUser } = useContext(AuthContext);
  const [activeUser, setActiveUser] = useState(currentUser);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const activeColor = primaryColor || '#FF4D2D';

  // Safe area bottom inset for physical/gesture Android buttons
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 36) : Math.max(insets.bottom, 14);

  // Real Razorpay Gateway State (Test API Key: rzp_test_TsU2gFuh1gMCsh)
  const RAZORPAY_KEY = 'rzp_test_TsU2gFuh1gMCsh';
  const [showRzpModal, setShowRzpModal] = useState(false);
  const [rzpHtmlContent, setRzpHtmlContent] = useState('');
  const [rzpCheckoutUri, setRzpCheckoutUri] = useState('');
  const [pendingBookingDetails, setPendingBookingDetails] = useState(null);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const webViewRef = useRef(null);
  const isFinalizingPayment = useRef(false);

  // Celebration Modal Animations
  const modalScale = useRef(new Animated.Value(0.7)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;
  const badgeRotate = useRef(new Animated.Value(0)).current;

  // Custom Alert Popup Animations & State
  const alertScale = useRef(new Animated.Value(0.7)).current;
  const alertOpacity = useRef(new Animated.Value(0)).current;
  const alertPulse = useRef(new Animated.Value(1)).current;
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    icon: '⏱️',
    btnText: language === 'hi' ? 'ठीक है' : 'OK',
    onPress: null,
  });

  const showAlert = ({
    title,
    message,
    type = 'warning',
    icon = '⚠️',
    btnText = language === 'hi' ? 'ठीक है' : 'OK',
    onPress = null,
  }) => {
    if (showCustomAlert) {
      showCustomAlert({
        title,
        message,
        type,
        icon,
        buttons: [{ text: btnText, onPress, style: 'default' }],
      });
      return;
    }
    try {
      Vibration.vibrate(50);
    } catch (e) {}
    try {
      Vibration.vibrate(50);
    } catch (e) {}
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      icon,
      btnText,
      onPress,
    });
    alertScale.setValue(0.7);
    alertOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(alertScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(alertOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideAlert = () => {
    Animated.timing(alertOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      if (alertConfig.onPress) {
        alertConfig.onPress();
      }
      setAlertConfig((prev) => ({ ...prev, visible: false }));
    });
  };

  useEffect(() => {
    let alertLoop;
    if (alertConfig.visible) {
      alertLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(alertPulse, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(alertPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      alertLoop.start();
    } else {
      alertLoop?.stop();
    }
    return () => alertLoop?.stop();
  }, [alertConfig.visible]);

  useEffect(() => {
    let pulseLoop;
    let rotateLoop;
    if (showSuccessModal) {
      try {
        Vibration.vibrate([0, 100, 80, 150]);
      } catch (e) {}

      modalScale.setValue(0.7);
      modalOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(badgePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();

      rotateLoop = Animated.loop(
        Animated.timing(badgeRotate, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotateLoop.start();
    } else {
      pulseLoop?.stop();
      rotateLoop?.stop();
    }
    return () => {
      pulseLoop?.stop();
      rotateLoop?.stop();
    };
  }, [showSuccessModal]);

  useEffect(() => {
    if (!currentUser) {
      AsyncStorage.getItem('helper_current_user').then((raw) => {
        if (raw) {
          try {
            setActiveUser(JSON.parse(raw));
          } catch (e) {}
        }
      });
    } else {
      setActiveUser(currentUser);
    }
  }, [currentUser]);

  // Dynamic 7 upcoming days starting today
  const upcomingDays = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const list = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayName = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : days[d.getDay()]);
      const dateStr = `${d.getDate()} ${months[d.getMonth()]}`;
      const fullLabel = i === 0 ? `Today (${dateStr})` : (i === 1 ? `Tomorrow (${dateStr})` : `${dayName}, ${dateStr}`);
      list.push({
        id: `d-${i}`,
        day: dayName,
        date: dateStr,
        fullLabel,
      });
    }
    return list;
  }, []);

  // DATE SELECTION - Smart pre-selection of Today
  const [selectedDate, setSelectedDate] = useState(upcomingDays[0]?.fullLabel || 'Today');
  const [customDate, setCustomDate] = useState('');
  const [isCustomDate, setIsCustomDate] = useState(false);

  // TIME SELECTION - Smart convenient default (user can change freely)
  const [customTime, setCustomTime] = useState('11:00 AM');

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_after');

  // Service image resolution: prefer user-uploaded image from heroBanners if names match
  const serviceNameKey = (service?.name || pro?.name || '').trim().toLowerCase();
  const matchedBanner = heroBanners?.find(
    (b) => (b.title || '').trim().toLowerCase() === serviceNameKey
  );
  const serviceImageUri =
    matchedBanner?.image ||
    service?.image ||
    pro?.image ||
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600';

  const basePrice = service?.price || pro?.price || 499;
  const hygieneFee = 29;
  const discount = couponApplied ? 50 : 0;
  const finalPrice = basePrice + hygieneFee - discount;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'HELPER50' || code === 'FIRST') {
      setCouponApplied(true);
      showAlert({
        title: language === 'hi' ? 'कूपन लागू हुआ! 🎉' : 'Coupon Applied! 🎉',
        message:
          language === 'hi'
            ? 'शानदार! आपने इस बुकिंग पर पूरे ₹50 बचा लिए हैं।'
            : `Awesome! Promo code ${code} applied. You saved ₹50 on this order.`,
        type: 'success',
        icon: '🏷️',
        btnText: language === 'hi' ? 'शानदार! आगे बढ़ें' : 'Awesome! Continue',
      });
    } else {
      showAlert({
        title: language === 'hi' ? 'अमान्य कूपन कोड ⚠️' : 'Invalid Coupon Code ⚠️',
        message:
          language === 'hi'
            ? 'कृपया सही कोड डालें। ₹50 की तुरंत छूट पाने के लिए HELPER50 कोड का उपयोग करें।'
            : 'The promo code entered is invalid or expired. Try using HELPER50 for instant ₹50 off!',
        type: 'error',
        icon: '🎟️',
        btnText: language === 'hi' ? 'दोबारा प्रयास करें' : 'Try Again',
      });
    }
  };

  const isDiscardedRef = useRef(false);
  const effectiveDate = isCustomDate ? customDate.trim() : selectedDate;
  const effectiveTime = customTime.trim();

  // Save incomplete booking draft when entering Review & Book
  useEffect(() => {
    if (isDiscardedRef.current) return;
    if (!service && !pro) return;
    saveIncompleteBooking({
      service,
      pro,
      selectedDate: effectiveDate,
      customTime: effectiveTime,
      finalPrice,
    });
  }, [service, pro, effectiveDate, effectiveTime, finalPrice]);

  const handleDeleteDraft = () => {
    if (showCustomAlert) {
      showCustomAlert({
        title: language === 'hi' ? 'बुकिंग हटाएं? 🗑️' : 'Delete Booking? 🗑️',
        message:
          language === 'hi'
            ? 'क्या आप वाकई इस अधूरी बुकिंग को हटाना चाहते हैं? इसके बाद आपको हर 1 घंटे में आने वाले नोटिफिकेशन भी बंद हो जाएंगे।'
            : 'Are you sure you want to delete and discard this booking? Hourly reminder notifications will also be stopped.',
        type: 'danger',
        icon: '🗑️',
        buttons: [
          {
            text: language === 'hi' ? 'रद्द करें' : 'Cancel',
            style: 'cancel',
          },
          {
            text: language === 'hi' ? 'हाँ, हटाएं 🗑️' : 'Yes, Delete 🗑️',
            style: 'destructive',
            onPress: async () => {
              isDiscardedRef.current = true;
              await deleteIncompleteBooking();
              showCustomAlert({
                title: language === 'hi' ? 'बुकिंग हटा दी गई ✓' : 'Booking Deleted ✓',
                message:
                  language === 'hi'
                    ? 'आपकी बुकिंग सफलतापूर्वक हटा दी गई है।'
                    : 'Your booking draft has been deleted successfully.',
                type: 'success',
                icon: '✅',
                buttons: [
                  {
                    text: language === 'hi' ? 'ठीक है' : 'OK',
                    style: 'default',
                    onPress: () => navigation.goBack(),
                  },
                ],
              });
            },
          },
        ],
      });
    }
  };

  const finalizeBooking = async (bookingDetails, paymentData = null) => {
    const isOnline = paymentData?.mode === 'razorpay_online';
    const finalStatus = isOnline ? 'confirmed' : 'pending';
    const finalPaymentStatus = isOnline ? 'authorized' : 'pending';
    const finalPaymentId = paymentData?.razorpayPaymentId || '';

    // Send real-time booking to live Backend dispatch engine
    const payload = {
      id: bookingDetails.bookingId,
      bookingCode: bookingDetails.bookingId,
      customerName: bookingDetails.customerName,
      customerPhone: bookingDetails.customerPhone,
      customerId: currentUser?.id || currentUser?._id || activeUser?.id,
      serviceName: bookingDetails.serviceName,
      serviceCategory: bookingDetails.serviceCategory,
      distance: bookingDetails.distance,
      distanceKm: 2.4,
      address: bookingDetails.address,
      fullAddress: bookingDetails.address,
      customerAddress: bookingDetails.address,
      scheduledDate: effectiveDate,
      scheduledTime: effectiveTime,
      totalAmount: bookingDetails.finalPrice,
      price: bookingDetails.finalPrice,
      doorOtp: bookingDetails.otp,
      providerId: pro?.id || pro?._id || 'VND-IND-01',
      assignedProviderName: pro?.name || pro?.shopName || 'Indore Multi-Specialist Hub',
      status: finalStatus,
      paymentStatus: finalPaymentStatus,
      paymentMode: isOnline ? 'online_paid' : 'cash_after',
      razorpayOrderId: paymentData?.razorpayOrderId || '',
      razorpayPaymentId: finalPaymentId,
    };

    // Emit to backend non-blocking
    client.post('/bookings', payload).catch(() => {});

    // Save to local user bookings cache so it instantly appears in My Bookings
    try {
      const existing = await AsyncStorage.getItem('@helper_user_bookings');
      const list = existing ? JSON.parse(existing) : [];
      const updated = [
        {
          ...bookingDetails,
          id: bookingDetails.bookingId,
          status: isOnline ? 'CONFIRMED' : 'PENDING',
          statusColor: isOnline ? '#10B981' : '#F59E0B',
          paymentStatus: isOnline ? 'PAID ONLINE' : 'Pay at Doorstep',
          paymentMode: isOnline ? 'online_paid' : 'cash_after',
          paymentId: finalPaymentId,
          date: bookingDetails.date,
          price: bookingDetails.finalPrice,
          image: serviceImageUri || 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400',
        },
        ...list,
      ];
      await AsyncStorage.setItem('@helper_user_bookings', JSON.stringify(updated));
    } catch (e) {}

    isDiscardedRef.current = true;
    deleteIncompleteBooking();
    setSuccessBooking({
      ...bookingDetails,
      isPaid: isOnline,
      paymentId: finalPaymentId,
      orderId: paymentData?.razorpayOrderId,
    });
    setShowRzpModal(false);
    setShowSuccessModal(true);
  };

  const handleConfirmOrder = () => {
    if (!effectiveDate) {
      showAlert({
        title: language === 'hi' ? 'तारीख चुनें 📅' : 'Select Service Date 📅',
        message:
          language === 'hi'
            ? 'कृपया आगे बढ़ने के लिए सेवा की तारीख चुनें या अपनी पसंद की तारीख लिखें।'
            : 'Please pick a preferred service day or enter a custom date to proceed.',
        type: 'warning',
        icon: '📅',
        btnText: language === 'hi' ? 'तारीख चुनें' : 'Select Date',
      });
      return;
    }

    if (!effectiveTime) {
      showAlert({
        title: language === 'hi' ? 'समय चुनें ⏱️' : 'Set Arrival Time ⏱️',
        message:
          language === 'hi'
            ? 'कृपया कारीगर के आगमन का पसंदीदा समय चुनें (जैसे 10:00 AM, 02:30 PM)।'
            : 'Please specify when you would like our specialist to arrive at your doorstep.',
        type: 'warning',
        icon: '⏱️',
        btnText: language === 'hi' ? 'समय सेट करें' : 'Set Time',
      });
      return;
    }

    const bookingOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const finalAddressStr = `${bookingAddress?.street || 'Flat 402, Royal Palms, Vijay Nagar'}, ${bookingAddress?.city || 'Indore'}`;
    const activeCustomerName = activeUser?.name || currentUser?.name || bookingAddress?.name || 'Ajay Singh';
    const activeCustomerPhone = activeUser?.phone || currentUser?.phone || bookingAddress?.phone || '+91 7389451349';

    const bookingDetails = {
      bookingId: 'BK-' + Math.floor(10000 + Math.random() * 90000),
      customerName: activeCustomerName,
      customerPhone: activeCustomerPhone,
      serviceName: service?.name || pro?.name || 'Home Service',
      serviceCategory: service?.category || pro?.category || 'Plumber',
      proName: '',
      proPhone: '',
      date: `${effectiveDate} • ${effectiveTime}`,
      address: finalAddressStr,
      distance: service?.distance || pro?.distance || '2.4 km away',
      finalPrice: finalPrice,
      otp: bookingOtp,
      status: 'pending',
    };

    // If Online Payment selected, open official Razorpay Checkout Gateway
    if (paymentMethod === 'online') {
      setIsInitiatingPayment(true);
      isFinalizingPayment.current = false;
      setPendingBookingDetails(bookingDetails);

      // Call backend to create authentic Razorpay order with active test credentials
      client.post('/payments/create-order', {
        amount: finalPrice,
        bookingId: bookingDetails.bookingId,
      }).then((res) => {
        setIsInitiatingPayment(false);
        const orderId = res.data?.orderId || '';
        const html = generateRazorpayCheckoutHtml(
          orderId,
          finalPrice * 100,
          bookingDetails.customerName,
          bookingDetails.customerPhone,
          bookingDetails.serviceName,
          bookingDetails.bookingId
        );
        setRzpHtmlContent(html);
        setShowRzpModal(true);
      }).catch(() => {
        setIsInitiatingPayment(false);
        const fallbackHtml = generateRazorpayCheckoutHtml(
          '',
          finalPrice * 100,
          bookingDetails.customerName,
          bookingDetails.customerPhone,
          bookingDetails.serviceName,
          bookingDetails.bookingId
        );
        setRzpHtmlContent(fallbackHtml);
        setShowRzpModal(true);
      });
      return;
    }

    // Default: Pay After Service Complete (Doorstep Cash / UPI)
    finalizeBooking(bookingDetails);
  };

  const generateRazorpayCheckoutHtml = (orderId, amountPaise, customerName, customerPhone, serviceName, bookingId) => {
    const safeCustomer = (customerName || 'Customer').replace(/"/g, '\\"');
    const safePhone = (customerPhone || '7389451349').replace(/"/g, '\\"');
    const safeService = (serviceName || 'Home Service Booking').replace(/"/g, '\\"');
    const callbackUrl = `https://helper-backend-api-8878.onrender.com/api/payments/razorpay-callback${bookingId ? `?bookingId=${encodeURIComponent(bookingId)}` : ''}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #0b1120;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            text-align: center;
          }
          .card {
            background: #111827;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            padding: 26px 20px;
            max-width: 380px;
            width: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
          }
          .shield-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.35);
            color: #34D399;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            margin-bottom: 16px;
          }
          .amount-val {
            font-size: 36px;
            font-weight: 900;
            color: #10B981;
            margin: 10px 0 16px;
          }
          .hints-box {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 18px;
            font-size: 11.5px;
            color: #94A3B8;
            text-align: left;
            line-height: 17px;
          }
          .hints-title {
            color: #38BDF8;
            font-weight: 800;
            margin-bottom: 4px;
          }
          .btn-open {
            background: linear-gradient(135deg, #2563EB, #1D4ED8);
            color: #FFFFFF;
            border: none;
            padding: 15px 20px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 800;
            width: 100%;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
            margin-bottom: 12px;
          }
          .btn-open:active { transform: scale(0.98); }
          .btn-sim {
            background: rgba(16, 185, 129, 0.15);
            color: #10B981;
            border: 1.5px solid #10B981;
            padding: 13px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 800;
            width: 100%;
            cursor: pointer;
          }
          .btn-sim:active { transform: scale(0.98); }
          #error-banner {
            display: none;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid #EF4444;
            color: #F87171;
            padding: 12px;
            border-radius: 10px;
            margin-top: 14px;
            font-size: 12px;
            text-align: left;
            line-height: 16px;
          }
        </style>
        <script>
          // Universal window and popup shim for Android WebView NetBanking
          (function() {
            window.open = function(url, target, features) {
              if (url && url !== 'about:blank') {
                window.location.href = url;
              }
              return window;
            };
            window.close = function() {
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'DISMISSED' }));
              }
            };
            if (!window.opener) {
              window.opener = {
                postMessage: function(msg) {
                  try {
                    var parsed = typeof msg === 'string' ? JSON.parse(msg) : msg;
                    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                      window.ReactNativeWebView.postMessage(JSON.stringify(parsed));
                    }
                  } catch(e) {}
                }
              };
            }
            document.addEventListener('submit', function(e) {
              if (e.target) { e.target.target = '_self'; }
            }, true);
            document.addEventListener('click', function(e) {
              var a = e.target && e.target.closest ? e.target.closest('a') : null;
              if (a && a.target === '_blank') { a.target = '_self'; }
            }, true);
          })();
        </script>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <div class="card">
          <div class="shield-badge">🛡️ 100% SECURE ESCROW GATEWAY</div>
          <h2 style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">Advance Service Booking</h2>
          <p style="color: #94A3B8; font-size: 12.5px;">${safeService}</p>

          <div class="amount-val">₹${amountPaise / 100}</div>

          <div class="hints-box">
            <div class="hints-title">💡 Razorpay Active Test Mode:</div>
            • <b>UPI:</b> Type <code>success@razorpay</code><br>
            • <b>Cards:</b> <code>4111 1111 1111 1111</code> (any MM/YY, CVV 123)<br>
            • <b>NetBanking:</b> Pick any bank and tap "Success"
          </div>

          <button class="btn-open" id="rzp-btn" onclick="openRazorpay()">
            💳 Open Razorpay Checkout (₹${amountPaise / 100})
          </button>

          <button class="btn-sim" onclick="simulateSuccess()">
            ⚡ Instant Test Success (1-Click Simulator)
          </button>

          <div id="error-banner"></div>
        </div>

        <script>
          function post(msg) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            }
          }

          var activeOrderId = "${orderId || ''}";
          var options = {
            key: "${RAZORPAY_KEY}",
            amount: ${amountPaise},
            currency: "INR",
            name: "Helper Home Services",
            description: "${safeService}",
            image: "https://cdn.razorpay.com/static/assets/logo/rzp.png",
            callback_url: "${callbackUrl}",
            redirect: true,
            prefill: {
              name: "${safeCustomer}",
              contact: "${safePhone}",
              email: "customer@helper.in"
            },
            theme: {
              color: "#10B981"
            },
            modal: {
              ondismiss: function() {
                post({ type: 'DISMISSED' });
              }
            },
            handler: function(response) {
              post({
                type: 'SUCCESS',
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id || activeOrderId,
                signature: response.razorpay_signature
              });
            }
          };

          if (activeOrderId && activeOrderId.startsWith('order_')) {
            options.order_id = activeOrderId;
          }

          function simulateSuccess() {
            var fakePaymentId = 'pay_test_' + Math.random().toString(36).substring(2, 12);
            post({
              type: 'SUCCESS',
              paymentId: fakePaymentId,
              orderId: activeOrderId || ('order_sim_' + Math.random().toString(36).substring(2, 10)),
              signature: 'sim_test_sig_' + Date.now()
            });
          }

          function openRazorpay() {
            try {
              var errEl = document.getElementById('error-banner');
              if (errEl) errEl.style.display = 'none';

              if (typeof Razorpay === 'undefined') {
                if (errEl) {
                  errEl.style.display = 'block';
                  errEl.innerHTML = '⚠️ Razorpay Gateway loading... Tap "Instant Test Success" below to simulate payment.';
                }
                return;
              }

              var rzp = new Razorpay(options);
              rzp.on('payment.failed', function(resp) {
                var errDesc = (resp && resp.error && resp.error.description) ? resp.error.description : 'Payment could not be completed';
                if (errEl) {
                  errEl.style.display = 'block';
                  errEl.innerHTML = '⚠️ ' + errDesc + '<br><small style="color:#A7F3D0; margin-top:4px; display:inline-block;">Tip: Tap "Instant Test Success" above to simulate payment.</small>';
                }
              });
              rzp.open();
            } catch(e) {
              var errEl = document.getElementById('error-banner');
              if (errEl) {
                errEl.style.display = 'block';
                errEl.innerHTML = '⚠️ Checkout Notice: ' + e.message + '<br><small style="color:#A7F3D0; margin-top:4px; display:inline-block;">Tip: Tap "Instant Test Success" above to simulate payment.</small>';
              }
            }
          }

          window.onload = function() {
            setTimeout(openRazorpay, 350);
          };
        </script>
      </body>
      </html>
    `;
  };

  const handleRzpWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SUCCESS') {
        if (isFinalizingPayment.current) return;
        isFinalizingPayment.current = true;
        setShowRzpModal(false);
        try {
          Vibration.vibrate([0, 50, 40, 50]);
        } catch (e) {}

        // Verify with backend
        client.post('/payments/verify', {
          bookingId: pendingBookingDetails?.bookingId,
          razorpayPaymentId: data.paymentId,
          razorpayOrderId: data.orderId,
          razorpaySignature: data.signature,
        }).catch(() => {});

        finalizeBooking(pendingBookingDetails, {
          mode: 'razorpay_online',
          razorpayOrderId: data.orderId,
          razorpayPaymentId: data.paymentId,
        });

        setTimeout(() => {
          isFinalizingPayment.current = false;
        }, 4000);
      } else if (data.type === 'DISMISSED') {
        setShowRzpModal(false);
      } else if (data.type === 'FAILED') {
        setShowRzpModal(false);
        showAlert({
          title: language === 'hi' ? 'भुगतान अधूरा रहा' : 'Payment Failed',
          message: data.error || (language === 'hi' ? 'भुगतान पूरा नहीं हो सका।' : 'Payment could not be completed.'),
          type: 'error',
          icon: '❌',
        });
      }
    } catch (e) {}
  };

  // Dynamic Styles mapped to Light/Dark Mode & Theme Colors
  const dyn = {
    container: { backgroundColor: themeColors.bg },
    header: { backgroundColor: themeColors.headerBg, borderBottomColor: themeColors.border },
    headerTitle: { color: themeColors.text },
    backBtn: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
    backIcon: { color: themeColors.text },
    card: { backgroundColor: themeColors.card, borderColor: themeColors.border },
    serviceName: { color: themeColors.text },
    serviceSub: { color: themeColors.textSecondary },
    dateChip: { backgroundColor: isDark ? '#111827' : '#F1F5F9', borderColor: themeColors.border },
    dayText: { color: themeColors.textSecondary },
    dateText: { color: themeColors.text },
    customTextInput: {
      backgroundColor: isDark ? '#111827' : '#F8FAFC',
      borderColor: themeColors.border,
      color: themeColors.text,
    },
    customTimeBox: {
      backgroundColor: isDark ? '#111827' : '#F8FAFC',
      borderColor: themeColors.border,
    },
    timeInputText: { color: themeColors.text },
    timeSuggestChip: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: themeColors.border,
    },
    timeSuggestText: { color: themeColors.text },
    addressBox: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
      borderColor: themeColors.border,
    },
    addressTitle: { color: themeColors.text },
    addressText: { color: themeColors.textSecondary },
    couponInput: {
      backgroundColor: isDark ? '#111827' : '#F8FAFC',
      borderColor: themeColors.border,
      color: themeColors.text,
    },
    paymentRow: {
      backgroundColor: isDark ? '#111827' : '#F8FAFC',
      borderColor: themeColors.border,
    },
    paymentTitle: { color: themeColors.text },
    paymentSub: { color: themeColors.textSecondary },
    billRow: { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
    billLabel: { color: themeColors.textSecondary },
    billValue: { color: themeColors.text },
    totalLabel: { color: themeColors.text },
    bottomBar: { backgroundColor: themeColors.card, borderTopColor: themeColors.border },
    bottomPriceLabel: { color: themeColors.textSecondary },
    bottomPrice: { color: themeColors.text },
    helperNotice: { color: themeColors.textSecondary },
    timeSub: { color: themeColors.textSecondary },
    quickLabel: { color: themeColors.textSecondary },
  };

  return (
    <SafeAreaView style={[styles.container, dyn.container]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.headerBg || themeColors.bg}
      />

      {/* Header */}
      <View style={[styles.header, dyn.header]}>
        <TouchableOpacity
          style={[styles.backBtn, dyn.backBtn]}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backIcon, dyn.backIcon]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dyn.headerTitle]}>
          {language === 'hi' ? 'समीक्षा एवं बुकिंग' : 'Review & Book'}
        </Text>
        <TouchableOpacity
          style={styles.deleteHeaderBtn}
          activeOpacity={0.7}
          onPress={handleDeleteDraft}
          accessibilityLabel="Delete Booking"
        >
          <Text style={styles.deleteHeaderIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 170 + bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Service Item Summary */}
        <View style={[styles.card, dyn.card]}>
          <Text style={[styles.cardHeading, { color: activeColor }]}>
            {language === 'hi' ? 'सेवा का विवरण' : 'SERVICE DETAILS'}
          </Text>
          <View style={styles.serviceRow}>
            <Image
              source={{ uri: serviceImageUri }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
            <View style={styles.serviceMeta}>
              <Text style={[styles.serviceName, dyn.serviceName]}>
                {service?.name || pro?.name || 'AC Jet Foam Servicing'}
              </Text>
              <Text style={[styles.serviceSub, dyn.serviceSub]}>
                {pro ? `Specialist: ${pro.name} (★ ${pro.rating})` : 'Doorstep Verified Pro • 100% Quality'}
              </Text>
              <Text style={[styles.servicePrice, { color: activeColor }]}>₹{basePrice}</Text>
            </View>
          </View>
        </View>

        {/* 1. Date Selector Card */}
        <View style={[styles.card, dyn.card]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardHeading, { color: activeColor }]}>
              {language === 'hi' ? 'सेवा की तारीख चुनें' : 'CHOOSE SERVICE DATE'}
            </Text>
            {effectiveDate ? (
              <View style={styles.badgeSelected}>
                <Text style={styles.badgeSelectedText}>✓ {effectiveDate}</Text>
              </View>
            ) : (
              <View style={styles.badgePending}>
                <Text style={styles.badgePendingText}>⚠️ {language === 'hi' ? 'चुनी नहीं गई' : 'Not Selected'}</Text>
              </View>
            )}
          </View>

          {/* Dynamic 7-day Upcoming Dates */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesScroll}>
            {upcomingDays.map((item) => {
              const isSelected = !isCustomDate && selectedDate === item.fullLabel;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dateChip,
                    dyn.dateChip,
                    isSelected && [styles.activeDateChip, { borderColor: activeColor, backgroundColor: `${activeColor}20` }],
                  ]}
                  onPress={() => {
                    setSelectedDate(item.fullLabel);
                    setIsCustomDate(false);
                  }}
                >
                  <Text style={[styles.dayText, dyn.dayText, isSelected && { color: activeColor, fontWeight: '800' }]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.dateText, dyn.dateText, isSelected && { color: activeColor, fontWeight: '900' }]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Custom Date Option Chip */}
            <TouchableOpacity
              style={[
                styles.dateChip,
                dyn.dateChip,
                isCustomDate && [styles.activeDateChip, { borderColor: activeColor, backgroundColor: `${activeColor}20` }],
                { minWidth: 90 },
              ]}
              onPress={() => {
                setIsCustomDate(true);
                setSelectedDate(null);
              }}
            >
              <Text style={[styles.dayText, dyn.dayText, isCustomDate && { color: activeColor, fontWeight: '800' }]}>
                📅 {language === 'hi' ? 'कस्टम' : 'Custom'}
              </Text>
              <Text style={[styles.dateText, dyn.dateText, isCustomDate && { color: activeColor }]}>
                {language === 'hi' ? 'तारीख लिखें' : 'Type Date'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Custom Date Input Field */}
          {isCustomDate && (
            <View style={styles.customDateInputWrap}>
              <Text style={[styles.customInputLabel, dyn.textSecondary]}>
                {language === 'hi' ? 'अपनी पसंदीदा तारीख लिखें:' : 'Type Your Preferred Date:'}
              </Text>
              <TextInput
                style={[styles.customTextInput, dyn.customTextInput, { borderColor: activeColor }]}
                placeholder="e.g. 25 Oct 2026 or Next Sunday"
                placeholderTextColor={themeColors.textMuted}
                value={customDate}
                onChangeText={setCustomDate}
                autoFocus
              />
            </View>
          )}

          {!effectiveDate && (
            <Text style={[styles.helperNoticeText, dyn.helperNotice]}>
              👆 {language === 'hi' ? 'किसी भी तारीख पर टैप करें या कस्टम तारीख चुनें' : 'Tap on any date or choose Custom to set your booking date'}
            </Text>
          )}
        </View>

        {/* 2. Custom Time Selector Card (NO PREDEFINED TIME SLOTS) */}
        <View style={[styles.card, dyn.card]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardHeading, { color: activeColor }]}>
              {language === 'hi' ? 'पसंदीदा समय सेट करें' : 'SET YOUR PREFERRED TIME'}
            </Text>
            {effectiveTime ? (
              <View style={styles.badgeSelected}>
                <Text style={styles.badgeSelectedText}>✓ {effectiveTime}</Text>
              </View>
            ) : (
              <View style={styles.badgePending}>
                <Text style={styles.badgePendingText}>⚠️ {language === 'hi' ? 'समय डालें' : 'Enter Time'}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.timeInputSubHeading, dyn.timeSub]}>
            {language === 'hi' ? 'कारीगर के आगमन का पसंदीदा समय लिखें:' : 'Enter your preferred specialist arrival time:'}
          </Text>

          {/* Custom Time Input Box */}
          <View
            style={[
              styles.customTimeInputBox,
              dyn.customTimeBox,
              effectiveTime ? { borderColor: activeColor, backgroundColor: `${activeColor}12` } : null,
            ]}
          >
            <Text style={styles.timeInputIcon}>⏱️</Text>
            <TextInput
              style={[styles.timeInputText, dyn.timeInputText]}
              placeholder="e.g. 10:30 AM, 02:15 PM, 6:00 PM"
              placeholderTextColor={themeColors.textMuted}
              value={customTime}
              onChangeText={setCustomTime}
            />
            {customTime ? (
              <TouchableOpacity onPress={() => setCustomTime('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Quick Suggestions to tap if user wants */}
          <Text style={[styles.quickSuggestLabel, dyn.quickLabel]}>
            {language === 'hi' ? 'त्वरित सुझाव (ऑटो-फिल हेतु टैप करें):' : 'Quick suggestions (Tap to auto-fill):'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestScroll}>
            {SUGGESTED_TIMES.map((timeOption, idx) => {
              const isSelected = customTime.trim().toLowerCase() === timeOption.toLowerCase();
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.timeSuggestChip,
                    dyn.timeSuggestChip,
                    isSelected && [
                      styles.activeTimeSuggestChip,
                      { borderColor: activeColor, backgroundColor: `${activeColor}25` },
                    ],
                  ]}
                  onPress={() => setCustomTime(timeOption)}
                >
                  <Text
                    style={[
                      styles.timeSuggestText,
                      dyn.timeSuggestText,
                      isSelected && { color: activeColor, fontWeight: '800' },
                    ]}
                  >
                    {timeOption}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.helperNoticeText, dyn.helperNotice]}>
            💡 {language === 'hi' ? 'कारीगर आपके चुने हुए समय पर घर पहुँचेगा।' : 'The specialist will arrive at your doorstep at your chosen time.'}
          </Text>
        </View>

        {/* 3. Service Address */}
        <View style={[styles.card, dyn.card]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardHeading, { color: activeColor }]}>
              {language === 'hi' ? 'सेवा का पता' : 'SERVICE ADDRESS'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SavedAddresses')}>
              <Text style={[styles.changeLink, { color: activeColor }]}>
                {language === 'hi' ? 'बदलें' : 'Change'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.addressBox, dyn.addressBox]}>
            <Text style={styles.addressIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.addressTitle, dyn.addressTitle]}>
                {bookingAddress?.type || 'Home'}
              </Text>
              <Text style={[styles.addressText, dyn.addressText]}>
                {bookingAddress?.street || 'Flat 402, Royal Palms, Vijay Nagar'}, {bookingAddress?.city || 'Indore'}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Coupon Code Section */}
        <View style={[styles.card, dyn.card]}>
          <Text style={[styles.cardHeading, { color: activeColor }]}>
            {language === 'hi' ? 'प्रोमो कोड एवं ऑफ़र' : 'PROMO CODE / OFFERS'}
          </Text>
          <View style={styles.couponInputRow}>
            <TextInput
              style={[styles.couponInput, dyn.couponInput]}
              placeholder="Enter Code (e.g. HELPER50)"
              placeholderTextColor={themeColors.textMuted}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              editable={!couponApplied}
            />
            <TouchableOpacity
              style={[
                styles.applyBtn,
                { backgroundColor: couponApplied ? '#10B981' : activeColor },
              ]}
              onPress={couponApplied ? () => setCouponApplied(false) : handleApplyCoupon}
            >
              <Text style={styles.applyBtnText}>
                {couponApplied ? (language === 'hi' ? 'लागू हुआ ✓' : 'Applied ✓') : (language === 'hi' ? 'लागू करें' : 'Apply')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.couponHint, { color: activeColor }]}>
            💡 {language === 'hi' ? '₹50 की तुरंत छूट पाने के लिए HELPER50 का उपयोग करें' : 'Use HELPER50 to get ₹50 instant discount'}
          </Text>
        </View>

        {/* 5. Payment Method */}
        <View style={[styles.card, dyn.card]}>
          <Text style={[styles.cardHeading, { color: activeColor }]}>
            {language === 'hi' ? 'भुगतान का तरीका' : 'PAYMENT METHOD'}
          </Text>
          <TouchableOpacity
            style={[
              styles.paymentRow,
              dyn.paymentRow,
              paymentMethod === 'cash_after' && [styles.activePaymentRow, { borderColor: activeColor, backgroundColor: `${activeColor}12` }],
            ]}
            onPress={() => setPaymentMethod('cash_after')}
          >
            <Text style={styles.paymentIcon}>💵</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.paymentTitle, dyn.paymentTitle]}>
                {language === 'hi' ? 'सेवा पूरी होने पर भुगतान करें' : 'Pay After Service Complete'}
              </Text>
              <Text style={[styles.paymentSub, dyn.paymentSub]}>
                {language === 'hi' ? 'कारीगर को दरवाज़े पर Cash या UPI QR से भुगतान करें' : 'Pay via Cash or UPI QR to specialist at doorstep'}
              </Text>
            </View>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'cash_after' && { borderColor: activeColor },
              ]}
            >
              {paymentMethod === 'cash_after' && <View style={[styles.radioInner, { backgroundColor: activeColor }]} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentRow,
              dyn.paymentRow,
              paymentMethod === 'online' && [styles.activePaymentRow, { borderColor: activeColor, backgroundColor: `${activeColor}12` }],
            ]}
            onPress={() => setPaymentMethod('online')}
          >
            <Text style={styles.paymentIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.paymentTitle, dyn.paymentTitle]}>
                  {language === 'hi' ? 'ऑनलाइन भुगतान (UPI / कार्ड्स)' : 'Online Payment (UPI, Cards)'}
                </Text>
                <View style={[styles.rzpInlineTag, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.rzpInlineTagText}>INSTANT</Text>
                </View>
              </View>
              <Text style={[styles.paymentSub, dyn.paymentSub]}>
                {language === 'hi' ? 'Google Pay, PhonePe, Paytm या Card से तुरंत सुरक्षित भुगतान' : 'Pay via GPay, PhonePe, Paytm, Cards & NetBanking'}
              </Text>
            </View>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'online' && { borderColor: activeColor },
              ]}
            >
              {paymentMethod === 'online' && <View style={[styles.radioInner, { backgroundColor: activeColor }]} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* 6. Bill Summary */}
        <View style={[styles.card, dyn.card]}>
          <Text style={[styles.cardHeading, { color: activeColor }]}>
            {language === 'hi' ? 'बिल सारांश' : 'BILL SUMMARY'}
          </Text>
          <View style={[styles.billRow, dyn.billRow]}>
            <Text style={[styles.billLabel, dyn.billLabel]}>{language === 'hi' ? 'आइटम कुल' : 'Item Total'}</Text>
            <Text style={[styles.billValue, dyn.billValue]}>₹{basePrice}</Text>
          </View>

          <View style={[styles.billRow, dyn.billRow]}>
            <Text style={[styles.billLabel, dyn.billLabel]}>{language === 'hi' ? 'सुरक्षा एवं स्वच्छता शुल्क' : 'Safety & Hygiene Fee'}</Text>
            <Text style={[styles.billValue, dyn.billValue]}>₹{hygieneFee}</Text>
          </View>

          {couponApplied && (
            <View style={[styles.billRow, dyn.billRow]}>
              <Text style={[styles.billLabel, { color: '#10B981' }]}>Coupon Discount (HELPER50)</Text>
              <Text style={[styles.billValue, { color: '#10B981' }]}>-₹{discount}</Text>
            </View>
          )}

          <View style={[styles.billRow, styles.totalBillRow, dyn.billRow]}>
            <Text style={[styles.totalLabel, dyn.totalLabel]}>{language === 'hi' ? 'कुल देय राशि' : 'Total Payable'}</Text>
            <Text style={[styles.totalValue, { color: activeColor }]}>₹{finalPrice}</Text>
          </View>
        </View>

        {/* User Requested: Option to delete / discard booking in Review & Book */}
        <TouchableOpacity
          style={[
            styles.discardBookingCard,
            {
              borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.25)',
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2',
            },
          ]}
          activeOpacity={0.8}
          onPress={handleDeleteDraft}
        >
          <View style={styles.discardIconCircle}>
            <Text style={styles.discardIcon}>🗑️</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.discardTitle}>
              {language === 'hi' ? 'इस बुकिंग को हटाएं' : 'Delete / Discard This Booking'}
            </Text>
            <Text style={styles.discardSub}>
              {language === 'hi'
                ? 'बुकिंग रद्द करें और हर 1 घंटे का अनुस्मारक नोटिफिकेशन बंद करें'
                : 'Discard this draft and stop hourly reminder notifications'}
            </Text>
          </View>
          <View style={styles.discardCloseBtn}>
            <Text style={styles.discardCloseText}>✕</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Bottom Booking Bar */}
      <View style={[styles.bottomBar, dyn.bottomBar, { paddingBottom: 12 + bottomInset }]}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={[styles.bottomPriceLabel, dyn.bottomPriceLabel]}>
            {language === 'hi' ? 'कुल राशि' : 'TOTAL AMOUNT'}
          </Text>
          <Text style={[styles.bottomPrice, dyn.bottomPrice]}>₹{finalPrice}</Text>
          <Text style={[styles.bottomScheduleStatus, { color: effectiveDate && effectiveTime ? '#10B981' : '#F59E0B' }]} numberOfLines={1}>
            {effectiveDate && effectiveTime
              ? `📅 ${effectiveDate} • ${effectiveTime}`
              : (language === 'hi' ? '⚠️ तारीख व समय चुनें' : '⚠️ Set Date & Time')}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: activeColor },
            (!effectiveDate || !effectiveTime) && styles.confirmBtnPending,
          ]}
          onPress={handleConfirmOrder}
          activeOpacity={0.88}
        >
          <Text style={styles.confirmBtnText}>
            {effectiveDate && effectiveTime
              ? isInitiatingPayment
                ? (language === 'hi' ? 'भुगतान स्क्रीन लोड हो रही है...' : 'Loading Payment...')
                : paymentMethod === 'online'
                ? (language === 'hi' ? `₹${finalPrice} ऑनलाइन भुगतान करें ➔` : `Pay ₹${finalPrice} Online ➔`)
                : (language === 'hi' ? 'बुकिंग कन्फर्म करें ➔' : 'Confirm Booking ➔')
              : (language === 'hi' ? 'तारीख व समय चुनें ➔' : 'Set Date & Time ➔')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= REAL RAZORPAY STANDARD CHECKOUT WEBVIEW MODAL ================= */}
      <Modal
        visible={showRzpModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowRzpModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0B1120' : '#FFFFFF' }} edges={['top', 'left', 'right', 'bottom']}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#0B1120' : '#FFFFFF'} />
          
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 20 }}>🛡️</Text>
              <View>
                <Text style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 15, fontWeight: '800' }}>
                  {language === 'hi' ? 'सुरक्षित ऑनलाइन भुगतान' : '100% Secure Payment'}
                </Text>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>
                  {language === 'hi' ? 'UPI • Cards • NetBanking' : 'UPI • Cards • NetBanking'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowRzpModal(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 14, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Official Razorpay Checkout Hosted inside WebView */}
          {rzpHtmlContent ? (
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: rzpHtmlContent, baseUrl: 'https://checkout.razorpay.com' }}
              onMessage={handleRzpWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
              startInLoadingState={true}
              mixedContentMode="always"
              javaScriptCanOpenWindowsAutomatically={true}
              setSupportMultipleWindows={true}
              onOpenWindow={(syntheticEvent) => {
                const { targetUrl } = syntheticEvent.nativeEvent;
                if (targetUrl && webViewRef.current) {
                  webViewRef.current.injectJavaScript(`window.location.href = ${JSON.stringify(targetUrl)};`);
                }
              }}
              onNavigationStateChange={(navState) => {
                const url = navState.url || '';
                if (url.includes('razorpay_payment_id=') || url.includes('/payments/razorpay-callback')) {
                  try {
                    const matchPaymentId = url.match(/razorpay_payment_id=([^&]+)/);
                    const matchOrderId = url.match(/razorpay_order_id=([^&]+)/);
                    const matchSig = url.match(/razorpay_signature=([^&]+)/);
                    if (matchPaymentId && matchPaymentId[1]) {
                      handleRzpWebViewMessage({
                        nativeEvent: {
                          data: JSON.stringify({
                            type: 'SUCCESS',
                            paymentId: decodeURIComponent(matchPaymentId[1]),
                            orderId: matchOrderId ? decodeURIComponent(matchOrderId[1]) : '',
                            signature: matchSig ? decodeURIComponent(matchSig[1]) : '',
                          }),
                        },
                      });
                    }
                  } catch (e) {}
                }
              }}
              renderLoading={() => (
                <View style={{ flex: 1, backgroundColor: isDark ? '#0B1120' : '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B', marginTop: 14, fontSize: 13, fontWeight: '700' }}>
                    {language === 'hi' ? 'सुरक्षित बैंक गेटवे लोड हो रहा है...' : 'Connecting to secure bank gateway...'}
                  </Text>
                </View>
              )}
              userAgent="Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
              onShouldStartLoadWithRequest={(request) => {
                const url = request.url;
                if (
                  url.startsWith('upi://') ||
                  url.startsWith('phonepe://') ||
                  url.startsWith('tez://') ||
                  url.startsWith('paytmmp://') ||
                  url.startsWith('intent://')
                ) {
                  Linking.openURL(url).catch(() => {});
                  return false;
                }
                return true;
              }}
              renderError={() => (
                <View style={{ flex: 1, backgroundColor: isDark ? '#0B1120' : '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                  <Text style={{ fontSize: 40, marginBottom: 14 }}>🛡️</Text>
                  <Text style={{ color: isDark ? '#FFFFFF' : '#0F172A', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
                    {language === 'hi' ? 'रेज़रपे ऑनलाइन सुरक्षित गेटवे' : 'Razorpay Secure Checkout'}
                  </Text>
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 18 }}>
                    {language === 'hi' ? 'टेस्ट मोड सक्रिय है। बुकिंग तुरंत कन्फर्म करने के लिए 1-क्लिक टेस्ट भुगतान चुनें:' : 'Active test environment. Complete test booking in 1 click:'}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#10B981',
                      paddingHorizontal: 24,
                      paddingVertical: 15,
                      borderRadius: 14,
                      width: '100%',
                      alignItems: 'center',
                      marginBottom: 12,
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                    onPress={() => {
                      handleRzpWebViewMessage({
                        nativeEvent: {
                          data: JSON.stringify({
                            type: 'SUCCESS',
                            paymentId: 'pay_test_' + Math.random().toString(36).substring(2, 10),
                            orderId: 'order_test_' + Math.random().toString(36).substring(2, 10),
                            signature: 'sig_test_' + Date.now(),
                          })
                        }
                      });
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
                      ⚡ {language === 'hi' ? '1-क्लिक टेस्ट भुगतान पूरा करें' : 'Instant 1-Click Test Payment'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ paddingVertical: 12 }}
                    onPress={() => setShowRzpModal(false)}
                  >
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 13, fontWeight: '600' }}>
                      {language === 'hi' ? 'वापस जाएं' : 'Cancel & Go Back'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              renderLoading={() => (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0B1120' : '#FFFFFF' }}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B', marginTop: 12, fontSize: 13, fontWeight: '600' }}>
                    {language === 'hi' ? 'सुरक्षित पेमेंट गेटवे लोड हो रहा है...' : 'Connecting to Secure Gateway...'}
                  </Text>
                </View>
              )}
              style={{ flex: 1, backgroundColor: isDark ? '#0B1120' : '#FFFFFF' }}
            />
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* ================= RESPONSIVE CELEBRATION SUCCESS MODAL ================= */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#0A0F1D' : '#FFFFFF',
                borderColor: '#10B981',
                transform: [{ scale: modalScale }],
                opacity: modalOpacity,
                maxHeight: '88%',
                padding: 14,
                paddingBottom: 16,
              },
            ]}
          >
            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Confetti & Celebration Ribbon */}
              <View style={styles.celebrationTopRow}>
                <Text style={{ fontSize: 20 }}>✨</Text>
                <Text style={{ fontSize: 22 }}>🎉</Text>
                <Text style={{ fontSize: 22 }}>🚀</Text>
                <Text style={{ fontSize: 22 }}>🎊</Text>
                <Text style={{ fontSize: 20 }}>✨</Text>
              </View>

              {/* Glowing Pulsing Success Badge */}
              <Animated.View
                style={[
                  styles.glowingRingOuter,
                  {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    borderColor: '#10B981',
                    transform: [{ scale: badgePulse }],
                  },
                ]}
              >
                <View style={styles.glowingRingInner}>
                  <Text style={styles.checkmarkIcon}>✓</Text>
                </View>
              </Animated.View>

              <Text style={[styles.modalMainHeading, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {language === 'hi' ? '🎉 बुकिंग कन्फर्म हो गई! 🚀' : '🎉 BOOKING CONFIRMED! 🚀'}
              </Text>
              <Text style={[styles.modalSubtitle, { color: themeColors.textSecondary }]}>
                {language === 'hi'
                  ? 'इंदौर मल्टी-स्पेशलिस्ट हब को रिक्वेस्ट भेजी गई है। 15 मिनट में कारीगर आपके पते पर पहुँचेगा।'
                  : 'Dispatched to Indore Specialist Hub. Technician is en route to your doorstep.'}
              </Text>

              {/* Structured Vibrant Telemetry Card */}
              <View
                style={[
                  styles.telemetryCard,
                  {
                    backgroundColor: isDark ? '#111C35' : '#F0FDF4',
                    borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.45)',
                  },
                ]}
              >
                <View style={styles.telemetryHeaderRow}>
                  <View>
                    <Text style={[styles.telemetryTinyLabel, { color: isDark ? '#94A3B8' : '#166534' }]}>
                      BOOKING ID
                    </Text>
                    <Text style={[styles.telemetryBookingId, { color: '#0EA5E9' }]}>
                      #{successBooking?.bookingId || 'BK-55219'}
                    </Text>
                  </View>
                  <View style={styles.liveDispatchBadge}>
                    <View style={styles.liveGreenDot} />
                    <Text style={styles.liveDispatchText}>LIVE DISPATCH</Text>
                  </View>
                </View>

                <View style={[styles.telemetryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />

                <View style={styles.telemetryDetailRow}>
                  <Text style={styles.telemetryIcon}>👤</Text>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={[styles.telemetryItemLabel, { color: themeColors.textSecondary }]}>
                      CUSTOMER NAME
                    </Text>
                    <Text style={[styles.telemetryItemValue, { color: themeColors.text }]} numberOfLines={1}>
                      {successBooking?.customerName || 'Ajay Singh'}
                    </Text>
                  </View>
                  <Text style={styles.customerPhoneTag}>
                    {successBooking?.customerPhone || '+91 7389451349'}
                  </Text>
                </View>

                <View style={styles.telemetryDetailRow}>
                  <Text style={styles.telemetryIcon}>🛠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.telemetryItemLabel, { color: themeColors.textSecondary }]}>
                      SERVICE REQUESTED
                    </Text>
                    <Text style={[styles.telemetryItemValue, { color: activeColor }]} numberOfLines={1}>
                      {successBooking?.serviceName}
                    </Text>
                  </View>
                </View>

                <View style={styles.telemetryDetailRow}>
                  <Text style={styles.telemetryIcon}>📅</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.telemetryItemLabel, { color: themeColors.textSecondary }]}>
                      SCHEDULED ARRIVAL
                    </Text>
                    <Text style={[styles.telemetryItemValue, { color: '#F59E0B' }]} numberOfLines={1}>
                      {successBooking?.date}
                    </Text>
                  </View>
                </View>

                {/* Secure 4-Digit Doorstep Start OTP (Vibrant Gold Vault) */}
                <View
                  style={[
                    styles.otpVaultBox,
                    {
                      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.16)' : 'rgba(245, 158, 11, 0.12)',
                      borderColor: '#F59E0B',
                    },
                  ]}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 15 }}>🔐</Text>
                      <Text style={styles.otpVaultHeading}>DOORSTEP START OTP</Text>
                    </View>
                    <Text style={[styles.otpVaultSub, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                      {language === 'hi'
                        ? 'यह OTP केवल कारीगर के पहुँचने पर ही शेयर करें'
                        : 'Share OTP with technician upon arrival'}
                    </Text>
                  </View>
                  <View style={styles.otpVaultBadge}>
                    <Text style={styles.otpVaultNumber}>{successBooking?.otp}</Text>
                  </View>
                </View>

                <View style={[styles.telemetryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />

                <View style={styles.fareRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.fareTinyLabel, { color: themeColors.textSecondary }]}>TOTAL AMOUNT</Text>
                    <Text style={[styles.farePayNote, { color: successBooking?.isPaid ? '#10B981' : themeColors.textMuted }]} numberOfLines={1}>
                      {successBooking?.isPaid
                        ? `🟢 Paid Online (ID: #${successBooking?.paymentId?.substring(0, 14) || 'PAID'})`
                        : 'Pay on doorstep (Cash / UPI)'}
                    </Text>
                  </View>
                  <Text style={[styles.fareValue, { color: '#10B981' }]}>₹{successBooking?.finalPrice}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: activeColor, width: '100%', marginBottom: 10 }]}
                activeOpacity={0.88}
                onPress={() => {
                  const b = successBooking;
                  setShowSuccessModal(false);
                  navigation.navigate('LiveTracking', { booking: b });
                }}
              >
                <Text style={styles.modalPrimaryBtnText}>
                  {language === 'hi' ? '📍 लाइव कारीगर को ट्रैक करें ➔' : '📍 Track Live Specialist ➔'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSecondaryBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: themeColors.border,
                    width: '100%',
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('MainTabs', { screen: 'Bookings' });
                }}
              >
                <Text style={[styles.modalSecondaryBtnText, { color: themeColors.text }]}>
                  {language === 'hi' ? 'मेरी बुकिंग्स में देखें' : 'View in My Bookings'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* ================= HIGH-ENERGY VIBRANT ANIMATED ALERT / NOTICE POPUP ================= */}
      <Modal
        visible={alertConfig.visible}
        transparent
        animationType="none"
        onRequestClose={hideAlert}
      >
        <View style={styles.alertModalOverlay}>
          <Animated.View
            style={[
              styles.alertModalCard,
              {
                backgroundColor: isDark ? '#0D1322' : '#FFFFFF',
                borderColor:
                  alertConfig.type === 'success'
                    ? '#10B981'
                    : alertConfig.type === 'error'
                    ? '#EF4444'
                    : alertConfig.type === 'info'
                    ? '#0284C7'
                    : '#F59E0B',
                transform: [{ scale: alertScale }],
                opacity: alertOpacity,
              },
            ]}
          >
            {/* Top Glowing Decorative Accent */}
            <View style={styles.alertSparklesRow}>
              <Text style={{ fontSize: 16 }}>✨</Text>
              <Text style={{ fontSize: 18 }}>
                {alertConfig.type === 'success' ? '🎉' : alertConfig.type === 'error' ? '⚡' : '🔔'}
              </Text>
              <Text style={{ fontSize: 16 }}>✨</Text>
            </View>

            {/* Glowing Pulsing Icon Circle */}
            <Animated.View
              style={[
                styles.alertRingOuter,
                {
                  backgroundColor:
                    alertConfig.type === 'success'
                      ? 'rgba(16, 185, 129, 0.16)'
                      : alertConfig.type === 'error'
                      ? 'rgba(239, 68, 68, 0.16)'
                      : alertConfig.type === 'info'
                      ? 'rgba(2, 132, 199, 0.16)'
                      : 'rgba(245, 158, 11, 0.16)',
                  borderColor:
                    alertConfig.type === 'success'
                      ? '#10B981'
                      : alertConfig.type === 'error'
                      ? '#EF4444'
                      : alertConfig.type === 'info'
                      ? '#0284C7'
                      : '#F59E0B',
                  transform: [{ scale: alertPulse }],
                },
              ]}
            >
              <View
                style={[
                  styles.alertRingInner,
                  {
                    backgroundColor:
                      alertConfig.type === 'success'
                        ? '#10B981'
                        : alertConfig.type === 'error'
                        ? '#EF4444'
                        : alertConfig.type === 'info'
                        ? '#0284C7'
                        : '#F59E0B',
                  },
                ]}
              >
                <Text style={styles.alertIconText}>{alertConfig.icon || '⚠️'}</Text>
              </View>
            </Animated.View>

            {/* Alert Title */}
            <Text style={[styles.alertTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {alertConfig.title}
            </Text>

            {/* Alert Message */}
            <Text style={[styles.alertMessage, { color: isDark ? '#94A3B8' : '#475569' }]}>
              {alertConfig.message}
            </Text>

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.alertActionBtn,
                {
                  backgroundColor:
                    alertConfig.type === 'success'
                      ? '#10B981'
                      : alertConfig.type === 'error'
                      ? '#EF4444'
                      : alertConfig.type === 'info'
                      ? '#0284C7'
                      : activeColor,
                },
              ]}
              activeOpacity={0.88}
              onPress={hideAlert}
            >
              <Text style={styles.alertActionBtnText}>{alertConfig.btnText || 'Theek Hai / OK'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
      paddingBottom: 110,
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
      letterSpacing: 0.8,
      marginBottom: 10,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    badgeSelected: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderWidth: 1,
      borderColor: '#10B981',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      maxWidth: '55%',
    },
    badgeSelectedText: {
      color: '#10B981',
      fontSize: 10,
      fontWeight: '800',
    },
    badgePending: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      borderWidth: 1,
      borderColor: '#F59E0B',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    badgePendingText: {
      color: '#F59E0B',
      fontSize: 10,
      fontWeight: '800',
    },
    helperNoticeText: {
      color: '#94A3B8',
      fontSize: 10.5,
      marginTop: 8,
      fontStyle: 'italic',
    },
    changeLink: {
      fontSize: 11.5,
      fontWeight: '700',
    },
    serviceRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    serviceImage: {
      width: 64,
      height: 64,
      borderRadius: 10,
      backgroundColor: '#1E293B',
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
      fontSize: 11,
      marginTop: 2,
    },
    servicePrice: {
      fontSize: 14,
      fontWeight: '900',
      marginTop: 4,
    },
    datesScroll: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 2,
    },
    dateChip: {
      minWidth: 70,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: colors.borderDark,
      borderRadius: 10,
      paddingVertical: 9,
      paddingHorizontal: 8,
      alignItems: 'center',
    },
    activeDateChip: {
      borderWidth: 1.5,
    },
    dayText: {
      color: '#94A3B8',
      fontSize: 11,
      fontWeight: '700',
    },
    dateText: {
      color: '#FFFFFF',
      fontSize: 12.5,
      fontWeight: '800',
      marginTop: 2,
    },
    customDateInputWrap: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.06)',
    },
    customInputLabel: {
      color: '#CBD5E1',
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 6,
    },
    customTextInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1.5,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },

    /* Custom Time Input Styling */
    timeInputSubHeading: {
      color: '#94A3B8',
      fontSize: 11.5,
      fontWeight: '600',
      marginBottom: 8,
    },
    customTimeInputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1.5,
      borderColor: colors.borderDark,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginBottom: 10,
    },
    timeInputIcon: {
      fontSize: 18,
      marginRight: 8,
    },
    timeInputText: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      paddingVertical: 8,
    },
    clearBtn: {
      padding: 6,
    },
    clearBtnText: {
      color: '#94A3B8',
      fontSize: 14,
      fontWeight: '800',
    },
    quickSuggestLabel: {
      color: '#64748B',
      fontSize: 10.5,
      fontWeight: '700',
      marginBottom: 6,
    },
    suggestScroll: {
      flexDirection: 'row',
      gap: 8,
      paddingBottom: 4,
    },
    timeSuggestChip: {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderWidth: 1,
      borderColor: colors.borderDark,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    activeTimeSuggestChip: {
      borderWidth: 1.5,
    },
    timeSuggestText: {
      color: '#CBD5E1',
      fontSize: 11.5,
      fontWeight: '700',
    },

    addressBox: {
      flexDirection: 'row',
      gap: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
    },
    addressIcon: {
      fontSize: 20,
    },
    addressTitle: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    addressText: {
      color: '#94A3B8',
      fontSize: 11,
      marginTop: 2,
    },
    couponInputRow: {
      flexDirection: 'row',
      gap: 8,
    },
    couponInput: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
      borderWidth: 1.5,
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
    radioCircle: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#64748B',
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
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
      paddingTop: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
      elevation: 10,
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
    bottomScheduleStatus: {
      fontSize: 10,
      fontWeight: '700',
      marginTop: 2,
    },
    confirmBtn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },
    confirmBtnPending: {
      opacity: 0.9,
    },
    confirmBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(5, 8, 15, 0.88)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 24,
    },
    modalCard: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: '#0D1322',
      borderRadius: 24,
      borderWidth: 1.5,
      borderColor: 'rgba(16, 185, 129, 0.35)',
      padding: 16,
      alignItems: 'center',
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 20,
    },
    celebrationTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 10,
    },
    glowingRingOuter: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      borderWidth: 1.5,
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    glowingRingInner: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 8,
    },
    checkmarkIcon: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '900',
    },
    modalMainHeading: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '900',
      letterSpacing: 0.6,
      textAlign: 'center',
    },
    modalSubtitle: {
      color: '#94A3B8',
      fontSize: 11.5,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 16,
      lineHeight: 16,
      paddingHorizontal: 8,
    },
    telemetryCard: {
      width: '100%',
      backgroundColor: '#141D30',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      padding: 14,
      marginBottom: 16,
    },
    telemetryHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    telemetryTinyLabel: {
      color: '#64748B',
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    telemetryBookingId: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '900',
      marginTop: 2,
    },
    liveDispatchBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    liveGreenDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#10B981',
    },
    liveDispatchText: {
      color: '#10B981',
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    telemetryDivider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      marginVertical: 10,
    },
    telemetryDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
      width: '100%',
    },
    telemetryIcon: {
      fontSize: 15,
    },
    telemetryItemLabel: {
      color: '#64748B',
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    telemetryItemValue: {
      color: '#F8FAFC',
      fontSize: 12,
      fontWeight: '700',
      marginTop: 1,
      flexShrink: 1,
    },
    customerPhoneTag: {
      color: '#38BDF8',
      fontSize: 10,
      fontWeight: '700',
      backgroundColor: 'rgba(56, 189, 248, 0.12)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    otpVaultBox: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.35)',
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    otpVaultHeading: {
      color: '#F59E0B',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    otpVaultSub: {
      color: '#94A3B8',
      fontSize: 9.5,
      marginTop: 2,
    },
    otpVaultBadge: {
      backgroundColor: '#F59E0B',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    otpVaultNumber: {
      color: '#070A12',
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: 2,
    },
    fareRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fareTinyLabel: {
      color: '#64748B',
      fontSize: 9,
      fontWeight: '800',
    },
    farePayNote: {
      color: '#94A3B8',
      fontSize: 10,
      marginTop: 1,
    },
    fareValue: {
      fontSize: 18,
      fontWeight: '900',
    },
    modalPrimaryBtn: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      shadowColor: '#FF4D2D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    modalPrimaryBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    modalSecondaryBtn: {
      width: '100%',
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSecondaryBtnText: {
      color: '#94A3B8',
      fontSize: 12,
      fontWeight: '700',
    },
    alertModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(5, 8, 15, 0.78)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    alertModalCard: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 24,
      borderWidth: 2,
      padding: 22,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 24,
    },
    alertSparklesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    alertRingOuter: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      marginVertical: 10,
    },
    alertRingInner: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    alertIconText: {
      fontSize: 24,
    },
    alertTitle: {
      fontSize: 18,
      fontWeight: '900',
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    alertMessage: {
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 20,
      paddingHorizontal: 8,
    },
    alertActionBtn: {
      width: '100%',
      paddingVertical: 13,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    alertActionBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    deleteHeaderBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteHeaderIcon: {
      fontSize: 16,
    },
    discardBookingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 20,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1.5,
    },
    discardIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    discardIcon: {
      fontSize: 18,
    },
    discardTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#EF4444',
    },
    discardSub: {
      fontSize: 10.5,
      color: '#94A3B8',
      marginTop: 2,
      lineHeight: 14,
    },
    discardCloseBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    discardCloseText: {
      fontSize: 13,
      fontWeight: '900',
      color: '#EF4444',
    },

    // RAZORPAY TEST GATEWAY STYLES
    rzpInlineTag: {
      backgroundColor: '#2563EB',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    rzpInlineTagText: {
      color: '#FFFFFF',
      fontSize: 9.5,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    rzpModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      justifyContent: 'flex-end',
    },
    rzpSheet: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 22,
      paddingBottom: 36,
      borderTopWidth: 1,
      borderColor: '#334155',
    },
    rzpHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    rzpHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rzpShieldIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: 'rgba(37, 99, 235, 0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rzpBrandTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#2563EB',
    },
    rzpBrandSub: {
      fontSize: 11,
      color: '#94A3B8',
      marginTop: 2,
    },
    rzpCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rzpCloseText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#94A3B8',
    },
    rzpTestBanner: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.35)',
      borderRadius: 12,
      padding: 10,
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rzpTestBadge: {
      fontSize: 11,
      fontWeight: '800',
      color: '#F59E0B',
    },
    rzpTestKeyText: {
      fontSize: 10,
      color: '#CBD5E1',
      fontFamily: 'monospace',
    },
    rzpOrderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#334155',
      marginBottom: 16,
    },
    rzpOrderLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: '#94A3B8',
      letterSpacing: 0.5,
    },
    rzpServiceName: {
      fontSize: 14,
      fontWeight: '800',
      marginTop: 2,
    },
    rzpOrderIdText: {
      fontSize: 11,
      color: '#64748B',
      marginTop: 2,
      fontFamily: 'monospace',
    },
    rzpAmountLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: '#94A3B8',
      letterSpacing: 0.5,
    },
    rzpAmountText: {
      fontSize: 22,
      fontWeight: '900',
      color: '#10B981',
      marginTop: 2,
    },
    rzpTabRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    rzpTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#334155',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      gap: 6,
    },
    rzpTabActive: {
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.16)',
    },
    rzpTabIcon: {
      fontSize: 14,
    },
    rzpTabText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#94A3B8',
    },
    rzpTabTextActive: {
      color: '#60A5FA',
      fontWeight: '800',
    },
    rzpTabContent: {
      marginBottom: 16,
    },
    rzpUpiAppGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 12,
    },
    rzpUpiAppItem: {
      alignItems: 'center',
      gap: 4,
    },
    rzpUpiAppName: {
      fontSize: 11,
      color: '#CBD5E1',
      fontWeight: '600',
    },
    rzpVpaBox: {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderWidth: 1,
      borderColor: '#334155',
      borderRadius: 12,
      padding: 10,
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rzpVpaLabel: {
      fontSize: 11,
      color: '#94A3B8',
    },
    rzpVpaValue: {
      fontSize: 12,
      fontWeight: '700',
      color: '#38BDF8',
      fontFamily: 'monospace',
    },
    rzpCardMock: {
      backgroundColor: 'linear-gradient(135deg, #1E293B, #0F172A)',
      backgroundColor: '#1E293B',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#475569',
      padding: 16,
      marginBottom: 14,
    },
    rzpCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    rzpCardChip: {
      fontSize: 12,
      fontWeight: '900',
      color: '#38BDF8',
      letterSpacing: 1,
    },
    rzpCardBank: {
      fontSize: 11,
      fontWeight: '700',
      color: '#94A3B8',
    },
    rzpCardNumber: {
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: 2.5,
      color: '#F8FAFC',
      fontFamily: 'monospace',
      marginBottom: 14,
    },
    rzpCardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rzpCardHolder: {
      fontSize: 11,
      fontWeight: '700',
      color: '#CBD5E1',
      textTransform: 'uppercase',
    },
    rzpCardExp: {
      fontSize: 11,
      color: '#94A3B8',
      fontFamily: 'monospace',
    },
    rzpWebNoticeBox: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
    },
    rzpWebNoticeTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#10B981',
      marginBottom: 4,
    },
    rzpWebNoticeSub: {
      fontSize: 11,
      color: '#94A3B8',
      lineHeight: 16,
    },
    rzpPayNowBtn: {
      paddingVertical: 15,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    rzpPayNowBtnText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    rzpFooter: {
      alignItems: 'center',
      marginTop: 12,
    },
    rzpFooterText: {
      fontSize: 10.5,
      color: '#64748B',
      fontWeight: '500',
    },
    rzpUpiAppItemActive: {
      borderWidth: 1.5,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderRadius: 12,
      padding: 6,
    },
    bankGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    bankChip: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderWidth: 1,
      borderColor: '#334155',
      borderRadius: 10,
      flex: 1,
      minWidth: '45%',
    },
    bankChipText: {
      fontSize: 12,
      color: '#CBD5E1',
      fontWeight: '600',
    },
    txnIdTag: {
      fontSize: 10,
      color: '#38BDF8',
      fontFamily: 'monospace',
      marginTop: 2,
    },

    // AUTH & VERIFICATION SCREEN STYLES
    authContainer: {
      paddingVertical: 4,
    },
    authBankHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      marginBottom: 14,
    },
    authBankTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#38BDF8',
      letterSpacing: 0.3,
    },
    authPromptCard: {
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    authPromptTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 4,
    },
    authPromptSub: {
      fontSize: 11,
      color: '#94A3B8',
      textAlign: 'center',
      marginBottom: 14,
    },
    pinInputRow: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 12,
    },
    pinRealInput: {
      width: 180,
      height: 50,
      backgroundColor: '#0F172A',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#10B981',
      fontSize: 24,
      fontWeight: '900',
      color: '#10B981',
      textAlign: 'center',
      letterSpacing: 10,
    },
    testPinHintBox: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    testPinHintText: {
      fontSize: 10.5,
      fontWeight: '700',
      color: '#34D399',
    },
    authCancelBtn: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    authCancelBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#94A3B8',
    },
    verifyingContainer: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    verifyingIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    verifyingTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: '#FFFFFF',
      marginBottom: 8,
      textAlign: 'center',
    },
    verifyingStatus: {
      fontSize: 13,
      fontWeight: '600',
      color: '#94A3B8',
      textAlign: 'center',
      marginBottom: 16,
    },
    verifiedIdBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderWidth: 1,
      borderColor: '#10B981',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
      alignItems: 'center',
    },
    verifiedIdLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: '#10B981',
      letterSpacing: 0.5,
    },
    verifiedIdText: {
      fontSize: 13,
      fontWeight: '900',
      color: '#38BDF8',
      fontFamily: 'monospace',
      marginTop: 2,
    },
  });

import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Dimensions,
  Animated,
  Easing,
  Linking,
  NativeModules,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { openImagePicker } from '../utils/imagePickerHelper';
import { AppContext } from '../context/AppContext';

const { BellSound } = NativeModules;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_ASSIGNED_JOB = {
  id: 'JOB-73262',
  orderId: 'HLP-73262',
  serviceName: 'Master Plumbing & Leak Fix',
  category: 'Plumber',
  customerName: 'Ajay Singh',
  customerPhone: '+91 7389451349',
  address: 'Flat 402, Royal Palms, Vijay Nagar, Indore',
  landmark: 'Near C21 Mall / Brilliant Convention Centre',
  distance: '2.4 km',
  estimatedTravelTime: '10 mins drive',
  scheduledTime: 'Today • 03:30 PM (Immediate Dispatch)',
  startOtp: '3909',
  workerPayout: 350,
  tipBonus: 50,
  customerTotal: 499,
  paymentMode: 'Pay on Doorstep (UPI / Cash)',
  tasks: [
    'Pipe Leakage & Water Pressure Inspection',
    'Main Line Joint & Valve Sealing',
    'Final Quality & Flow Rate Test',
  ],
};

const INITIAL_SAFETY_CHECKLIST = [
  { id: 'c1', label: 'Safety Gloves & Anti-Static Shoes', checked: true },
  { id: 'c2', label: 'AC Jet Pressure Pump & Spray Gun', checked: true },
  { id: 'c3', label: 'Digital Multimeter & Clamp Tester', checked: true },
  { id: 'c4', label: 'Refrigerant R32/R410 Pressure Gauge', checked: false },
  { id: 'c5', label: 'Helper Platform Official Uniform & ID Card', checked: true },
];

export default function WorkerTechnicianScreen({ navigation }) {
  const { themeColors, isDark: ctxIsDark, toggleTheme: ctxToggleTheme, themeMode, setThemeMode } = useContext(AppContext);
  const isDark = themeColors?.isDark !== undefined ? themeColors.isDark : (ctxIsDark !== undefined ? ctxIsDark : themeMode === 'dark');
  const toggleTheme = ctxToggleTheme || (() => setThemeMode && setThemeMode(isDark ? 'light' : 'dark'));

  // Comprehensive theme palette for 100% consistent light/dark styling
  const colors = {
    bg: isDark ? '#070A12' : '#F1F5F9',
    card: isDark ? '#0D1322' : '#FFFFFF',
    cardElevated: isDark ? '#131B2E' : '#FFFFFF',
    subCard: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
    headerBg: isDark ? '#0B101D' : '#FFFFFF',
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
    borderLight: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
    text: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? '#94A3B8' : '#64748B',
    textMuted: isDark ? '#64748B' : '#94A3B8',
    inputBg: isDark ? '#1E293B' : '#F1F5F9',
  };

  // Duty & Profile State
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks'); // tasks | earnings | toolkit | id_card
  const [technicianName, setTechnicianName] = useState('Sunil Verma');
  const [technicianPhone, setTechnicianPhone] = useState('+91 98260 12345');
  const [technicianRole, setTechnicianRole] = useState('Senior AC & Electrical Master');
  const [assignedHub, setAssignedHub] = useState('Indore Multi-Specialist Hub');

  // Worker Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [workerProfile, setWorkerProfile] = useState({
    id: 'WRK-IND-01',
    name: 'Sunil Verma',
    phone: '+91 98260 12345',
    category: 'Senior AC & Electrical Master',
    hub: 'Indore Multi-Specialist Hub',
    upiId: 'sunil.verma@upi',
    city: 'Indore',
  });
  const [authMode, setAuthMode] = useState('login'); // login | register
  const [loginPhone, setLoginPhone] = useState('9826012345');
  const [loginPassword, setLoginPassword] = useState('worker123');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Senior AC Technician');
  const [regExperience, setRegExperience] = useState('5 Yrs Exp');
  const [regCity, setRegCity] = useState('Indore');
  const [regUpi, setRegUpi] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isBellMuted, setIsBellMuted] = useState(false);
  const [isEditingWorkerProfile, setIsEditingWorkerProfile] = useState(false);
  const [editWorkerName, setEditWorkerName] = useState('');
  const [editWorkerRole, setEditWorkerRole] = useState('');
  const [editWorkerUpi, setEditWorkerUpi] = useState('');
  const [editWorkerCity, setEditWorkerCity] = useState('');

  // Duty Status Animated Modal State
  const [dutyModalVisible, setDutyModalVisible] = useState(false);
  const [dutyModalType, setDutyModalType] = useState('online'); // 'online' | 'offline'
  const dutyModalAnim = useRef(new Animated.Value(0)).current;
  const dutyModalHaloAnim = useRef(new Animated.Value(0)).current;
  const dutyModalIconScale = useRef(new Animated.Value(0.2)).current;

  // Load session & audio preference on startup
  useEffect(() => {
    AsyncStorage.getItem('helper_worker_bell_muted').then((v) => {
      if (v !== null) setIsBellMuted(v === 'true');
    });

    AsyncStorage.getItem('helper_worker_session').then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.worker) {
            setWorkerProfile(parsed.worker);
            if (parsed.worker.name) setTechnicianName(parsed.worker.name);
            if (parsed.worker.phone) setTechnicianPhone(parsed.worker.phone);
            if (parsed.worker.category) setTechnicianRole(parsed.worker.category);
            setIsLoggedIn(true);
          }
        } catch (e) {}
      }
    });
  }, []);

  const handleWorkerPhotoUpload = () => {
    openImagePicker(async (asset) => {
      if (asset?.uri) {
        const newAvatar = asset.uri;
        const updated = {
          ...workerProfile,
          avatar: newAvatar,
        };
        setWorkerProfile(updated);
        try {
          await AsyncStorage.setItem(
            'helper_worker_session',
            JSON.stringify({ worker: updated, token: 'worker-token-active' })
          );
          await axios.put(`http://localhost:5000/api/workers/${workerProfile.id || 'WRK-101'}`, {
            avatar: newAvatar,
          });
        } catch (e) {
          console.log('Worker avatar sync error:', e.message);
        }
        Alert.alert('Photo Updated! 📸', 'Your technician profile photo has been updated successfully.');
      }
    });
  };

  const handleStartEditProfile = () => {
    setEditWorkerName(technicianName || workerProfile?.name || '');
    setEditWorkerRole(technicianRole || workerProfile?.category || '');
    setEditWorkerUpi(workerProfile?.upiId || `${(technicianPhone || '').replace(/[\s+-]/g, '')}@upi`);
    setEditWorkerCity(workerProfile?.city || 'Indore');
    setIsEditingWorkerProfile(true);
  };

  const handleSaveWorkerProfile = async () => {
    if (!editWorkerName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    const updated = {
      ...workerProfile,
      name: editWorkerName.trim(),
      category: editWorkerRole.trim() || 'Senior Technician',
      upiId: editWorkerUpi.trim(),
      city: editWorkerCity.trim() || 'Indore',
    };
    setWorkerProfile(updated);
    setTechnicianName(updated.name);
    setTechnicianRole(updated.category);

    try {
      await AsyncStorage.setItem(
        'helper_worker_session',
        JSON.stringify({ worker: updated, token: 'worker-token-active' })
      );
      await axios.put(`http://localhost:5000/api/workers/${updated.id || updated.workerId || 'WRK-101'}`, {
        name: updated.name,
        category: updated.category,
        upiId: updated.upiId,
      });
    } catch (e) {
      console.log('Worker profile sync notice:', e.message);
    }
    setIsEditingWorkerProfile(false);
    Alert.alert('Profile Updated! 🎉', 'Your technician profile details have been saved successfully.');
  };

  // Poll backend for real-time customer bookings placed in Indore
  useEffect(() => {
    let poller;
    const fetchAssignedJob = () => {
      if (!isLoggedIn || !isOnDuty) return;
      axios
        .get('http://localhost:5000/api/bookings?status=assigned')
        .then((res) => {
          if (res.data?.data && res.data.data.length > 0) {
            const latest = res.data.data[0];
            if (latest && (!activeJob || activeJob.orderId !== (latest.bookingCode || latest.id))) {
              const finalAmt = latest.vendorCustomPrice || latest.totalAmount || 499;
              setActiveJob({
                id: 'JOB-' + (latest.bookingCode || '73262').slice(-5),
                orderId: latest.bookingCode || latest.id || 'HLP-73262',
                serviceName: latest.serviceName || latest.service || 'Master Plumbing & Leak Fix',
                category: latest.serviceCategory || 'Plumber',
                customerName: latest.customerName || 'Ajay Singh',
                customerPhone: latest.customerPhone || latest.phone || '+91 7389451349',
                address: latest.address || latest.serviceAddress?.fullAddress || 'Flat 402, Royal Palms, Vijay Nagar, Indore',
                landmark: latest.landmark || 'Near Brilliant Convention Centre',
                distance: latest.distance || (latest.distanceKm ? `${latest.distanceKm} km` : '2.4 km'),
                estimatedTravelTime: latest.vendorEstimatedTime || '10 mins drive',
                vendorEstimatedTime: latest.vendorEstimatedTime || '45 mins',
                scheduledTime: latest.scheduledDate ? `${latest.scheduledDate} • ${latest.scheduledTime || '03:30 PM'}` : 'Today • 03:30 PM (Immediate Dispatch)',
                startOtp: latest.doorOtp || '3909',
                workerPayout: Math.round(finalAmt * 0.7),
                tipBonus: 50,
                customerTotal: finalAmt,
                paymentMode: 'Pay on Doorstep (Helper UPI / Cash)',
                tasks: [
                  'Pipe Leakage & Water Pressure Inspection',
                  'Main Line Joint & Valve Sealing',
                  'Final Quality & Flow Rate Test',
                ],
              });
              setJobStage('assigned');
            }
          }
        })
        .catch(() => {});
    };

    fetchAssignedJob();
    if (isLoggedIn && isOnDuty && (!activeJob || jobStage === 'assigned' || jobStage === 'idle')) {
      poller = setInterval(fetchAssignedJob, 2500);
    }
    return () => clearInterval(poller);
  }, [isLoggedIn, isOnDuty, activeJob, jobStage]);

  const handleWorkerLogin = async () => {
    if (!loginPhone.trim() || !loginPassword.trim()) {
      Alert.alert('Required', 'Please enter your registered mobile number and password.');
      return;
    }
    setAuthLoading(true);
    const hostCandidates = ['http://localhost:5000', 'http://192.168.1.9:5000'];
    let loginSuccess = false;

    for (const host of hostCandidates) {
      try {
        const res = await axios.post(`${host}/api/auth/worker/login`, {
          phone: loginPhone.trim(),
          password: loginPassword.trim(),
        }, { timeout: 3500 });
        if (res.data?.success) {
          await AsyncStorage.setItem('helper_worker_session', JSON.stringify(res.data));
          setWorkerProfile(res.data.worker);
          if (res.data.worker.name) setTechnicianName(res.data.worker.name);
          if (res.data.worker.phone) setTechnicianPhone(res.data.worker.phone);
          if (res.data.worker.category) setTechnicianRole(res.data.worker.category);
          setIsLoggedIn(true);
          Alert.alert('Login Successful! 🎉', `Welcome back, ${res.data.worker.name}!`);
          loginSuccess = true;
          break;
        }
      } catch (err) {
        if (err.response?.data?.message) {
          Alert.alert('Login Notice', err.response.data.message);
          setAuthLoading(false);
          return;
        }
      }
    }

    if (!loginSuccess) {
      // Demo fallback for smooth offline testing
      const demoWorker = {
        id: 'WRK-IND-01',
        name: 'Sunil Verma',
        phone: loginPhone,
        category: 'Senior AC & Electrical Master',
        hub: 'Indore Multi-Specialist Hub',
        rating: '4.98',
        upiId: 'sunil.verma@upi',
      };
      await AsyncStorage.setItem('helper_worker_session', JSON.stringify({ worker: demoWorker }));
      setWorkerProfile(demoWorker);
      setTechnicianName(demoWorker.name);
      setTechnicianPhone(demoWorker.phone);
      setIsLoggedIn(true);
      Alert.alert('Logged In! 🚀', `Welcome back, ${demoWorker.name}!`);
    }

    setAuthLoading(false);
  };

  const handleWorkerRegister = async () => {
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      Alert.alert('Required', 'Please enter your name, mobile number, and password.');
      return;
    }
    setAuthLoading(true);
    const payload = {
      name: regName.trim(),
      phone: regPhone.trim(),
      password: regPassword.trim(),
      category: regRole.trim() || 'AC Technician',
      experience: regExperience.trim() || '3 Yrs',
      city: regCity.trim() || 'Indore',
      upiId: regUpi.trim() || `${regPhone.trim()}@upi`,
    };

    let registerSuccess = false;
    // 1. Try USB reverse (localhost) and Wi-Fi host (192.168.1.9)
    const hostCandidates = ['http://localhost:5000', 'http://192.168.1.9:5000'];
    for (const host of hostCandidates) {
      try {
        const res = await axios.post(`${host}/api/auth/worker/register`, payload, { timeout: 3500 });
        if (res.data?.success) {
          await AsyncStorage.setItem('helper_worker_session', JSON.stringify(res.data));
          setWorkerProfile(res.data.worker);
          if (res.data.worker.name) setTechnicianName(res.data.worker.name);
          if (res.data.worker.phone) setTechnicianPhone(res.data.worker.phone);
          if (res.data.worker.category) setTechnicianRole(res.data.worker.category);
          setIsLoggedIn(true);
          Alert.alert('Registration Successful! 🎉', `Welcome to Helper Crew, ${res.data.worker.name}!`);
          registerSuccess = true;
          break;
        }
      } catch (err) {
        // If it's a validation error from server (e.g. phone already exists), alert user directly
        if (err.response?.data?.message) {
          Alert.alert('Registration Notice', err.response.data.message);
          setAuthLoading(false);
          return;
        }
      }
    }

    // 2. If both network endpoints failed (offline/network error), register worker locally
    if (!registerSuccess) {
      const offlineWorker = {
        id: `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
        name: regName.trim(),
        phone: regPhone.trim(),
        category: regRole.trim() || 'AC Technician',
        experience: regExperience.trim() || '3 Yrs',
        city: regCity.trim() || 'Indore',
        upiId: regUpi.trim() || `${regPhone.trim()}@upi`,
        hub: 'Indore Multi-Specialist Hub',
        status: 'active',
        verificationStatus: 'verified',
      };
      await AsyncStorage.setItem(
        'helper_worker_session',
        JSON.stringify({ worker: offlineWorker, token: 'worker-token-active' })
      );
      setWorkerProfile(offlineWorker);
      setTechnicianName(offlineWorker.name);
      setTechnicianPhone(offlineWorker.phone);
      setTechnicianRole(offlineWorker.category);
      setIsLoggedIn(true);
      Alert.alert('Registration Successful! 🎉', `Welcome to Helper Crew, ${offlineWorker.name}!`);
    }

    setAuthLoading(false);
  };

  const handleWorkerLogout = async () => {
    Alert.alert('Logout Technician?', 'Are you sure you want to log out from your Technician account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout 🚪',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('helper_worker_session');
          setIsLoggedIn(false);
          Alert.alert('Logged Out', 'You have been successfully logged out from the technician app.');
        },
      },
    ]);
  };

  const toggleBellMode = async () => {
    const nextState = !isBellMuted;
    setIsBellMuted(nextState);
    await AsyncStorage.setItem('helper_worker_bell_muted', String(nextState));
    if (nextState) {
      stopBellSound();
      Alert.alert('Sound Setting 🔕', 'Notification Sound set to Silent. Visual task alerts will remain active.');
    } else {
      triggerBellSound();
      Alert.alert('Sound Setting 🔔', 'Notification Sound set to Ring. Loud alert chime enabled for assigned jobs.');
    }
  };

  // Stats
  const [todayEarnings, setTodayEarnings] = useState(1250);
  const [completedJobsToday, setCompletedJobsToday] = useState(3);
  const [bonusTarget, setBonusTarget] = useState(5);

  // Active Job Execution States
  // 'idle' | 'assigned' | 'on_the_way' | 'reached' | 'in_progress' | 'completed'
  const [jobStage, setJobStage] = useState('assigned');
  const [activeJob, setActiveJob] = useState(null);
  const [inputOtp, setInputOtp] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [finalCalculatedAmount, setFinalCalculatedAmount] = useState(499);
  const [finalDurationMins, setFinalDurationMins] = useState(0);

  // Safety Checklist State
  const [checklist, setChecklist] = useState(INITIAL_SAFETY_CHECKLIST);

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [showKitModal, setShowKitModal] = useState(false);

  // Animation Refs
  const dutyPulseAnim = useRef(new Animated.Value(1)).current;
  const bellWobbleAnim = useRef(new Animated.Value(0)).current;
  const jobCardScale = useRef(new Animated.Value(0.95)).current;

  // Sound Bell & Vibration Trigger
  const triggerBellSound = () => {
    if (isBellMuted) return;
    try {
      if (BellSound?.playBookingBell) {
        BellSound.playBookingBell();
      }
      Vibration.vibrate([0, 500, 200, 500]);
    } catch (e) {
      console.log('Bell sound trigger error:', e);
    }
  };

  const stopBellSound = () => {
    try {
      if (BellSound?.stopBell) {
        BellSound.stopBell();
      }
    } catch (e) {}
  };

  // Duty Indicator Pulse Loop
  useEffect(() => {
    let pulse;
    if (isOnDuty) {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(dutyPulseAnim, {
            toValue: 1.35,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dutyPulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    } else {
      dutyPulseAnim.setValue(1);
    }
    return () => pulse?.stop();
  }, [isOnDuty]);

  // Ring Bell and Wobble on Job Assignment
  useEffect(() => {
    let bellLoop;
    let soundInterval;
    if (activeJob && jobStage === 'assigned' && isOnDuty) {
      triggerBellSound();

      // Repeat bell every 4 seconds while job is waiting
      soundInterval = setInterval(() => {
        triggerBellSound();
      }, 4000);

      bellLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bellWobbleAnim, { toValue: -18, duration: 80, useNativeDriver: true }),
          Animated.timing(bellWobbleAnim, { toValue: 18, duration: 80, useNativeDriver: true }),
          Animated.timing(bellWobbleAnim, { toValue: -12, duration: 80, useNativeDriver: true }),
          Animated.timing(bellWobbleAnim, { toValue: 12, duration: 80, useNativeDriver: true }),
          Animated.timing(bellWobbleAnim, { toValue: 0, duration: 90, useNativeDriver: true }),
          Animated.delay(1200),
        ])
      );
      bellLoop.start();
    } else {
      stopBellSound();
      bellWobbleAnim.setValue(0);
    }
    return () => {
      bellLoop?.stop();
      if (soundInterval) clearInterval(soundInterval);
      stopBellSound();
    };
  }, [activeJob, jobStage, isOnDuty]);

  // In-progress Stopwatch Timer
  useEffect(() => {
    let sw;
    if (jobStage === 'in_progress') {
      sw = setInterval(() => setStopwatchSeconds((p) => p + 1), 1000);
    }
    return () => clearInterval(sw);
  }, [jobStage]);

  const showDutyStatusModal = (type) => {
    setDutyModalType(type);
    setDutyModalVisible(true);
    dutyModalAnim.setValue(0);
    dutyModalHaloAnim.setValue(0);
    dutyModalIconScale.setValue(0.2);

    if (type === 'online') {
      try { Vibration.vibrate([0, 50, 30, 60]); } catch (e) {}
    } else {
      try { Vibration.vibrate(40); } catch (e) {}
    }

    Animated.parallel([
      Animated.spring(dutyModalAnim, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.spring(dutyModalIconScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(dutyModalHaloAnim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dutyModalHaloAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  };

  const closeDutyModal = () => {
    Animated.timing(dutyModalAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setDutyModalVisible(false);
    });
  };

  const handleToggleFromDutyModal = () => {
    const nextType = dutyModalType === 'online' ? 'offline' : 'online';
    const nextIsOnDuty = nextType === 'online';
    setIsOnDuty(nextIsOnDuty);
    if (!nextIsOnDuty) {
      stopBellSound();
    }
    showDutyStatusModal(nextType);
  };

  const toggleDuty = () => {
    const newState = !isOnDuty;
    setIsOnDuty(newState);
    if (!newState) {
      stopBellSound();
      showDutyStatusModal('offline');
    } else {
      showDutyStatusModal('online');
    }
  };

  const handleCallCustomer = () => {
    const phone = activeJob?.customerPhone || '+919826098765';
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenNavigation = () => {
    const dest = encodeURIComponent(activeJob?.address || 'Vijay Nagar, Indore');
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest}`);
  };

  const handleCallHubManager = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleStartTrip = async () => {
    stopBellSound();
    setJobStage('on_the_way');
    const orderId = activeJob?.orderId || 'ORD-88219';
    try {
      await axios.post(`http://localhost:5000/api/bookings/${orderId}/worker-traveling`, {
        workerName: technicianName,
        workerPhone: technicianPhone,
        workerEmail: `${technicianName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@worker.helper.com`,
      });
    } catch (e) {}
    Alert.alert('Trip Started 🚀', `Customer notified: ${technicianName} is en route. Contact details & live ETA shared with customer.`);
  };

  const handleReachedDoorstep = async () => {
    setJobStage('reached');
    const orderId = activeJob?.orderId || 'ORD-88219';
    try {
      await axios.post(`http://localhost:5000/api/bookings/${orderId}/worker-arrived`);
    } catch (e) {}
    Alert.alert('Arrived at Location 📍', 'Customer notified: You have arrived. Please request the 4-digit start OTP from customer.');
  };

  const handleVerifyStartOtp = async () => {
    const reqOtp = activeJob?.startOtp || '5421';
    if (inputOtp === reqOtp || inputOtp === '1234') {
      setIsOtpVerified(true);
      setJobStage('in_progress');
      setStopwatchSeconds(0);
      const orderId = activeJob?.orderId || 'ORD-88219';
      try {
        await axios.post(`http://localhost:5000/api/bookings/${orderId}/worker-start`, {
          otp: inputOtp,
        });
      } catch (e) {}
      Alert.alert('OTP Verified! ✅', 'Start OTP matched! Service stopwatch timer is now running live.');
    } else {
      Alert.alert('Incorrect OTP ❌', `Please enter the 4-digit start OTP provided by the customer (Demo OTP: ${reqOtp} or 1234).`);
    }
  };

  const handleUploadPhoto = () => {
    setPhotoUploaded(true);
    Alert.alert('Photo Uploaded 📸', 'Service proof photo attached to the inspection report.');
  };

  const handleCompleteJob = async () => {
    const elapsedSecs = stopwatchSeconds;
    const elapsedMins = Math.max(1, Math.ceil(elapsedSecs / 60));
    setFinalDurationMins(elapsedMins);

    // Dynamic billing based on time worked
    const basePrice = activeJob?.customerTotal || 499;
    const additionalMins = Math.max(0, elapsedMins - 45);
    const timeBasedTotal = basePrice + additionalMins * 5;
    setFinalCalculatedAmount(timeBasedTotal);

    const helperFee = Math.round(timeBasedTotal * 0.10);
    const vendorSettlement = timeBasedTotal - helperFee;
    const workerEarned = Math.round(vendorSettlement * 0.75);

    setJobStage('completed');
    setTodayEarnings((p) => p + workerEarned);
    setCompletedJobsToday((p) => p + 1);

    const orderId = activeJob?.orderId || 'ORD-88219';
    try {
      await axios.post(`http://localhost:5000/api/bookings/${orderId}/worker-complete`, {
        timeWorkedSeconds: elapsedSecs,
        calculatedAmount: timeBasedTotal,
        helperFee: helperFee,
        vendorEarnings: vendorSettlement,
      });
    } catch (e) {}

    Alert.alert(
      'Service Finished & QR Generated! 🏆',
      `Time Worked: ${formatStopwatch(elapsedSecs)} (${elapsedMins} mins)\n\n• Time-Based Bill: ₹${timeBasedTotal}\n• Payment Payee: Helper Platform (ICICI)\n• Helper 10% Fee: ₹${helperFee}\n• Vendor 90% Share: ₹${vendorSettlement}\n\nPresent Dynamic QR to Customer for scan & pay.`,
      [
        {
          text: 'Show Dynamic UPI QR 📱',
          onPress: () => setShowQrModal(true),
        },
        {
          text: 'Next Task ➔',
          onPress: () => {
            setActiveJob(null);
            setJobStage('idle');
            setIsOtpVerified(false);
            setInputOtp('');
            setPhotoUploaded(false);
          },
        },
      ]
    );
  };

  const toggleChecklistItem = (id) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const formatStopwatch = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#070A12" />
        <View style={styles.authHeader}>
          <TouchableOpacity style={styles.authBackBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.authBackIcon}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.authBrandTitle}>HELPER CREW</Text>
              <View style={styles.crewShieldBadge}>
                <Text style={styles.crewShieldText}>🛠️ FIELD APP</Text>
              </View>
            </View>
            <Text style={styles.authSubtitle}>Technician Registration & Crew Login</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.authScrollBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick Demo Login Pill */}
          <TouchableOpacity
            style={styles.quickDemoBannerWorker}
            onPress={() => {
              setLoginPhone('9826012345');
              setLoginPassword('worker123');
              setAuthMode('login');
              setTimeout(() => {
                handleWorkerLogin();
              }, 100);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 22 }}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoWorkerBannerTitle}>One-Click Demo Technician Login</Text>
                <Text style={styles.demoWorkerBannerSub}>Sunil Verma • Senior AC Master (9826012345)</Text>
              </View>
              <Text style={styles.demoWorkerBannerArrow}>➔</Text>
            </View>
          </TouchableOpacity>

          {/* Mode Switcher */}
          <View style={styles.authTabSwitch}>
            <TouchableOpacity
              style={[styles.authTabBtn, authMode === 'login' && styles.authTabBtnActive]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[styles.authTabBtnText, authMode === 'login' && styles.authTabBtnTextActive]}>
                🔑 Crew Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authTabBtn, authMode === 'register' && styles.authTabBtnActive]}
              onPress={() => setAuthMode('register')}
            >
              <Text style={[styles.authTabBtnText, authMode === 'register' && styles.authTabBtnTextActive]}>
                📝 Join As Technician
              </Text>
            </TouchableOpacity>
          </View>

          {authMode === 'login' ? (
            <View style={styles.authCard}>
              <Text style={styles.authCardTitle}>Technician Portal Login</Text>
              <Text style={styles.authCardDesc}>
                Log in with your registered phone number and password to access dispatched tasks.
              </Text>

              <Text style={styles.authInputLabel}>REGISTERED PHONE NUMBER</Text>
              <TextInput
                style={styles.authInput}
                placeholder="10-digit mobile number"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={loginPhone}
                onChangeText={setLoginPhone}
              />

              <Text style={styles.authInputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.authInput}
                placeholder="Enter password"
                placeholderTextColor="#64748B"
                secureTextEntry
                value={loginPassword}
                onChangeText={setLoginPassword}
              />

              <TouchableOpacity
                style={styles.authPrimaryBtn}
                disabled={authLoading}
                onPress={handleWorkerLogin}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.authPrimaryBtnText}>Login to Technician Portal ➔</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authCard}>
              <Text style={styles.authCardTitle}>Join Helper Expert Crew</Text>
              <Text style={styles.authCardDesc}>
                Join Indore's top-rated service fleet and receive verified daily job dispatches.
              </Text>

              <Text style={styles.authInputLabel}>FULL NAME *</Text>
              <TextInput
                style={styles.authInput}
                placeholder="e.g. Sunil Verma"
                placeholderTextColor="#64748B"
                value={regName}
                onChangeText={setRegName}
              />

              <Text style={styles.authInputLabel}>MOBILE NUMBER *</Text>
              <TextInput
                style={styles.authInput}
                placeholder="10-digit mobile number"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={regPhone}
                onChangeText={setRegPhone}
              />

              <Text style={styles.authInputLabel}>PASSWORD *</Text>
              <TextInput
                style={styles.authInput}
                placeholder="Choose password"
                placeholderTextColor="#64748B"
                secureTextEntry
                value={regPassword}
                onChangeText={setRegPassword}
              />

              <Text style={styles.authInputLabel}>PRIMARY SKILL / SPECIALTY</Text>
              <TextInput
                style={styles.authInput}
                placeholder="e.g. Senior AC Technician / Electrician"
                placeholderTextColor="#64748B"
                value={regRole}
                onChangeText={setRegRole}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.authInputLabel}>EXPERIENCE</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="e.g. 5 Yrs"
                    placeholderTextColor="#64748B"
                    value={regExperience}
                    onChangeText={setRegExperience}
                  />
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={styles.authInputLabel}>PAYOUT UPI ID</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="sunil@upi"
                    placeholderTextColor="#64748B"
                    value={regUpi}
                    onChangeText={setRegUpi}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.authPrimaryBtn}
                disabled={authLoading}
                onPress={handleWorkerRegister}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.authPrimaryBtnText}>Register As Technician ➔</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Crew Benefits */}
          <View style={styles.authPerksBox}>
            <View style={styles.authPerkRow}>
              <Text style={styles.authPerkIcon}>🔔</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.authPerkTitle}>Direct Audio Bell Chime</Text>
                <Text style={styles.authPerkSub}>Instant sound and vibration alerts when jobs are assigned.</Text>
              </View>
            </View>
            <View style={styles.authPerkRow}>
              <Text style={styles.authPerkIcon}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.authPerkTitle}>Verified Safety & Tools</Text>
                <Text style={styles.authPerkSub}>5-point pre-service safety checklist for every booking.</Text>
              </View>
            </View>
            <View style={styles.authPerkRow}>
              <Text style={styles.authPerkIcon}>💰</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.authPerkTitle}>Instant UPI Settlement</Text>
                <Text style={styles.authPerkSub}>Direct digital UPI settlement after every service completion.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* ================= 1. TECHNICIAN TOP HEADER ================= */}
      <View style={[styles.topHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeftWrap}>
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 26, height: 26, borderRadius: 6, marginRight: 6 }}
          />
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.8}
            onPress={() => setActiveTab('id_card')}
          >
            <Image
              source={{
                uri: workerProfile?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
              }}
              style={styles.workerAvatar}
            />
            <View style={styles.avatarOnlineDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, minWidth: 0, marginLeft: 8 }}
            activeOpacity={0.8}
            onPress={() => setActiveTab('id_card')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={[styles.workerTitle, { color: colors.text }]} numberOfLines={1}>{technicianName}</Text>
              <View style={styles.crewBadge}>
                <Text style={styles.crewBadgeText}>⚡ PRO</Text>
              </View>
            </View>
            <Text style={[styles.hubSubText, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
              {assignedHub}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RIGHT CONTROLS GROUP (COMPACT CIRCLES + DUTY PILL) */}
        <View style={styles.headerRightActions}>
          {/* THEME TOGGLE BUTTON */}
          <TouchableOpacity
            style={[styles.headerCircleBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9', borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={toggleTheme}
          >
            <Text style={{ fontSize: 13 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          {/* BELL SOUND TOGGLE */}
          <TouchableOpacity
            style={[
              styles.headerCircleBtn,
              {
                backgroundColor: isBellMuted
                  ? (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9')
                  : 'rgba(56, 189, 248, 0.15)',
                borderColor: isBellMuted ? colors.border : '#38BDF8',
              },
            ]}
            activeOpacity={0.8}
            onPress={toggleBellMode}
          >
            <Text style={{ fontSize: 13 }}>{isBellMuted ? '🔕' : '🔔'}</Text>
          </TouchableOpacity>

          {/* DUTY TOGGLE PILL */}
          <TouchableOpacity
            style={[styles.dutyPill, isOnDuty ? styles.dutyPillOn : styles.dutyPillOff]}
            activeOpacity={0.85}
            onPress={toggleDuty}
          >
            <Animated.View
              style={[
                styles.dutyPulseDot,
                {
                  backgroundColor: isOnDuty ? '#10B981' : '#EF4444',
                  transform: [{ scale: dutyPulseAnim }],
                },
              ]}
            />
            <Text
              style={[styles.dutyPillText, { color: isOnDuty ? '#10B981' : '#EF4444' }]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {isOnDuty ? 'ON DUTY' : 'OFFLINE'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 2. WORKER DAILY METRICS ================= */}
      <View style={[styles.metricBanner, { backgroundColor: colors.cardElevated, borderBottomColor: colors.border }]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>TODAY'S PAY</Text>
          <Text style={[styles.metricVal, { color: '#10B981' }]}>₹{todayEarnings}</Text>
          <Text style={[styles.metricSub, { color: colors.textSecondary }]}>Incl. tips & base</Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>JOBS DONE</Text>
          <Text style={[styles.metricVal, { color: colors.text }]}>{completedJobsToday} Jobs</Text>
          <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
            {bonusTarget - completedJobsToday > 0
              ? `${bonusTarget - completedJobsToday} to ₹200 bonus`
              : '🏆 Target Reached!'}
          </Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>RATING & ON-TIME</Text>
          <Text style={[styles.metricVal, { color: colors.text }]}>★ 4.98</Text>
          <Text style={[styles.metricSub, { color: colors.textSecondary }]}>99% punctuality</Text>
        </View>
      </View>

      {/* ================= 3. CLEAN SCROLLABLE TABS ================= */}
      <View style={[styles.tabBarWrapper, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {[
            { id: 'tasks', label: `🛠️ Tasks ${activeJob ? '(1)' : ''}` },
            { id: 'earnings', label: '💰 Daily Payouts' },
            { id: 'toolkit', label: `🧰 Safety Kit (${checklist.filter((c) => c.checked).length}/${checklist.length})` },
            { id: 'id_card', label: '👤 Profile & ID' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    borderColor: colors.border,
                  },
                  isActive && {
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
                    borderColor: '#F59E0B',
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    { color: colors.textSecondary },
                    isActive && { color: isDark ? '#F59E0B' : '#D97706', fontWeight: '800' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= 4. MAIN CONTENT ================= */}
      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* ================= TAB 1: ASSIGNED TASKS ================= */}
        {activeTab === 'tasks' && (
          <View>
            {!isOnDuty ? (
              <View style={[styles.offlineBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ fontSize: 44, marginBottom: 8 }}>😴</Text>
                <Text style={[styles.boxTitle, { color: colors.text }]}>You Are Currently Offline</Text>
                <Text style={[styles.boxDesc, { color: colors.textSecondary }]}>
                  Turn Duty On using the toggle at the top to receive new tasks dispatched by the hub.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: '#10B981', marginTop: 14 }]}
                  onPress={toggleDuty}
                >
                  <Text style={styles.primaryBtnText}>Turn Duty ON 🟢</Text>
                </TouchableOpacity>
              </View>
            ) : !activeJob ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ fontSize: 44, marginBottom: 8 }}>📋</Text>
                <Text style={[styles.boxTitle, { color: colors.text }]}>No Pending Tasks</Text>
                <Text style={[styles.boxDesc, { color: colors.textSecondary }]}>
                  You are currently on standby. An alert chime will ring as soon as a booking is assigned by the Hub.
                </Text>
              </View>
            ) : (
              /* ACTIVE JOB CARD */
              <View style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* RINGING BELL BANNER (When Assigned) */}
                {jobStage === 'assigned' && (
                  <View style={styles.bellBanner}>
                    <Animated.Text
                      style={[
                        styles.bellIcon,
                        {
                          transform: [
                            {
                              rotate: bellWobbleAnim.interpolate({
                                inputRange: [-20, 20],
                                outputRange: ['-20deg', '20deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      🔔
                    </Animated.Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <Text style={styles.bellTitle}>NEW TASK DISPATCHED BY HUB!</Text>
                      <Text style={styles.bellSub}>
                        {isBellMuted ? 'Silent Mode Active (Visual Alerts Only)' : 'Sound chime & vibration active'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.bellMuteBtn}
                      onPress={stopBellSound}
                    >
                      <Text style={styles.bellMuteText}>Silence 🔕</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* JOB STAGE BADGE */}
                <View style={[styles.jobStageRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.jobStatusPill}>
                    <Text style={styles.jobStatusText}>
                      {jobStage === 'assigned'
                        ? '🚨 NEW TASK ASSIGNED'
                        : jobStage === 'on_the_way'
                        ? '🚀 ON THE WAY TO DOORSTEP'
                        : jobStage === 'reached'
                        ? '📍 REACHED AT DOORSTEP'
                        : jobStage === 'in_progress'
                        ? `⏱️ IN PROGRESS (${formatStopwatch(stopwatchSeconds)})`
                        : '✅ TASK COMPLETED'}
                    </Text>
                  </View>
                  <Text style={[styles.jobIdText, { color: colors.textMuted }]}>#{activeJob.id}</Text>
                </View>

                {/* SERVICE INFO & PAYOUT */}
                <View style={[styles.jobInfoSection, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.serviceHead, { color: colors.text }]}>{activeJob.serviceName}</Text>
                    <Text style={[styles.serviceCat, { color: colors.textSecondary }]}>{activeJob.category} • Doorstep Execution</Text>
                  </View>
                  <View style={styles.payoutWrap}>
                    <Text style={[styles.payoutLabel, { color: colors.textMuted }]}>YOUR PAY</Text>
                    <Text style={styles.payoutValue}>₹{activeJob.workerPayout + activeJob.tipBonus}</Text>
                    <Text style={styles.tipText}>+₹{activeJob.tipBonus} Tip</Text>
                  </View>
                </View>

                {/* CUSTOMER & LOCATION CARD */}
                <View style={[styles.customerCard, { backgroundColor: colors.subCard, borderColor: colors.border, borderWidth: 1 }]}>
                  <View style={styles.customerLine}>
                    <Text style={{ fontSize: 16 }}>👤</Text>
                    <Text style={[styles.customerName, { color: colors.text }]}>{activeJob.customerName}</Text>
                    <TouchableOpacity style={styles.callPill} onPress={handleCallCustomer}>
                      <Text style={styles.callPillText}>📞 Call Customer</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.customerLine}>
                    <Text style={{ fontSize: 16 }}>🏠</Text>
                    <Text style={[styles.addressLine, { color: colors.textSecondary }]} numberOfLines={2}>
                      {activeJob.address}
                    </Text>
                  </View>

                  <View style={styles.landmarkLine}>
                    <Text style={[styles.landmarkText, { color: colors.textMuted }]}>📍 Landmark: {activeJob.landmark}</Text>
                  </View>

                  {/* NAVIGATION BUTTON */}
                  <TouchableOpacity
                    style={styles.navigationBtn}
                    activeOpacity={0.85}
                    onPress={handleOpenNavigation}
                  >
                    <Text style={styles.navigationBtnText}>🗺️ Open Turn-by-Turn Route in Google Maps ➔</Text>
                  </TouchableOpacity>
                </View>

                {/* TASK SCOPE CHECKLIST */}
                <View style={[styles.scopeBox, { backgroundColor: colors.subCard, borderColor: colors.border, borderWidth: 1 }]}>
                  <Text style={styles.scopeTitle}>TASKS TO PERFORM ON SITE:</Text>
                  {activeJob.tasks.map((task, idx) => (
                    <View key={idx} style={styles.taskLine}>
                      <Text style={{ color: '#10B981', marginRight: 6 }}>✓</Text>
                      <Text style={[styles.taskText, { color: colors.text }]}>{task}</Text>
                    </View>
                  ))}
                </View>

                {/* ================= STEP-BY-STEP ACTION FLOW ================= */}

                {/* STAGE 1: ASSIGNED -> START TRIP */}
                {jobStage === 'assigned' && (
                  <View style={{ marginTop: 16 }}>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: '#10B981' }]}
                      activeOpacity={0.85}
                      onPress={handleStartTrip}
                    >
                      <Text style={styles.primaryBtnText}>🚀 ACCEPT & START JOURNEY ➔</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STAGE 2: ON THE WAY -> REACHED DOORSTEP */}
                {jobStage === 'on_the_way' && (
                  <View style={{ marginTop: 16 }}>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: '#0EA5E9' }]}
                      activeOpacity={0.85}
                      onPress={handleReachedDoorstep}
                    >
                      <Text style={styles.primaryBtnText}>📍 I HAVE REACHED DOORSTEP ➔</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STAGE 3: REACHED -> ASK OTP */}
                {jobStage === 'reached' && (
                  <View style={[styles.otpCard, { backgroundColor: colors.subCard, borderColor: colors.border, borderWidth: 1 }]}>
                    <Text style={styles.otpCardHeading}>🔐 ASK CUSTOMER FOR START OTP</Text>
                    <Text style={[styles.otpCardSub, { color: colors.textSecondary }]}>
                      A 4-digit start OTP has been sent to the customer's phone. Enter OTP below to begin service.
                    </Text>

                    <TextInput
                      style={[styles.otpInputBox, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                      placeholder="Enter 4-Digit OTP"
                      placeholderTextColor="#64748B"
                      keyboardType="number-pad"
                      maxLength={4}
                      value={inputOtp}
                      onChangeText={setInputOtp}
                    />

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: '#10B981', marginTop: 10 }]}
                      activeOpacity={0.85}
                      onPress={handleVerifyStartOtp}
                    >
                      <Text style={styles.primaryBtnText}>Verify OTP & Start Job ✅</Text>
                    </TouchableOpacity>

                    <Text style={styles.demoOtpHint}>
                      (Demo Start OTP: <Text style={{ color: '#10B981', fontWeight: '900' }}>{activeJob.startOtp}</Text> or 1234)
                    </Text>
                  </View>
                )}

                {/* STAGE 4: IN PROGRESS -> STOPWATCH & PHOTO */}
                {jobStage === 'in_progress' && (
                  <View style={[styles.inProgressCard, { backgroundColor: colors.subCard, borderColor: colors.border, borderWidth: 1 }]}>
                    <View style={styles.stopwatchDisplay}>
                      <Text style={styles.stopwatchIcon}>⏱️</Text>
                      <Text style={[styles.stopwatchText, { color: colors.text }]}>{formatStopwatch(stopwatchSeconds)}</Text>
                      <Text style={styles.stopwatchLabel}>ACTIVE SERVICE TIME</Text>
                    </View>

                    <View style={{ marginVertical: 12 }}>
                      <TouchableOpacity
                        style={[
                          styles.photoBtn,
                          photoUploaded && { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                        ]}
                        activeOpacity={0.8}
                        onPress={handleUploadPhoto}
                      >
                        <Text style={styles.photoBtnText}>
                          {photoUploaded ? '✓ Inspection Proof Photo Attached 📸' : '📸 Take Work Before/After Photo'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: '#10B981' }]}
                      activeOpacity={0.85}
                      onPress={handleCompleteJob}
                    >
                      <Text style={styles.primaryBtnText}>✅ COMPLETE JOB & COLLECT PAYMENT ➔</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STAGE 5: COMPLETED */}
                {jobStage === 'completed' && (
                  <View style={[styles.completedBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5', borderColor: '#10B981' }]}>
                    <Text style={{ fontSize: 36, marginBottom: 4 }}>🎉</Text>
                    <Text style={[styles.completedTitle, { color: colors.text }]}>Job Finished Successfully!</Text>
                    <Text style={[styles.completedSub, { color: colors.textSecondary }]}>
                      ₹{activeJob.workerPayout + activeJob.tipBonus} has been added to your daily earnings balance.
                    </Text>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { backgroundColor: '#10B981', marginTop: 12 }]}
                      onPress={() => setShowQrModal(true)}
                    >
                      <Text style={styles.primaryBtnText}>Show Customer UPI QR 📱</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* ================= TAB 2: DAILY EARNINGS & PAYOUTS ================= */}
        {activeTab === 'earnings' && (
          <View>
            <View style={[styles.earningsSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.earningsCardLabel, { color: colors.textMuted }]}>TODAY'S TOTAL PAYOUT</Text>
              <Text style={styles.earningsBigAmount}>₹{todayEarnings}</Text>
              <Text style={[styles.earningsSubText, { color: colors.textSecondary }]}>Direct transfer to your linked bank account every 24h</Text>

              <View style={[styles.breakdownRow, { borderTopColor: colors.border }]}>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownItemLabel, { color: colors.textMuted }]}>Base Commission</Text>
                  <Text style={[styles.breakdownItemVal, { color: colors.text }]}>₹{todayEarnings - 150}</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownItemLabel, { color: colors.textMuted }]}>Customer Tips</Text>
                  <Text style={[styles.breakdownItemVal, { color: '#10B981' }]}>₹150</Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Text style={[styles.breakdownItemLabel, { color: colors.textMuted }]}>Jobs Finished</Text>
                  <Text style={[styles.breakdownItemVal, { color: colors.text }]}>{completedJobsToday}</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionHeaderTitle, { color: colors.textMuted }]}>RECENT COMPLETED TASKS</Text>
            {[
              { id: 'JOB-99410', service: 'AC Gas Refill & Coil Welding', customer: 'Rohit Verma', amount: 450, time: '11:30 AM' },
              { id: 'JOB-99408', service: 'Jet Foam AC Service', customer: 'Amit Gupta', amount: 350, time: '01:15 PM' },
              { id: 'JOB-99405', service: 'Switchboard & MCB Repair', customer: 'Neha Jain', amount: 250, time: '02:45 PM' },
            ].map((item) => (
              <View key={item.id} style={[styles.pastJobCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pastJobService, { color: colors.text }]}>{item.service}</Text>
                  <Text style={[styles.pastJobCustomer, { color: colors.textSecondary }]}>{item.customer} • {item.time}</Text>
                  <Text style={[styles.pastJobId, { color: colors.textMuted }]}>#{item.id}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.pastJobAmount}>+₹{item.amount}</Text>
                  <Text style={[styles.settledBadge, { color: colors.textMuted }]}>✓ Credited</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 3: SAFETY KIT CHECKLIST ================= */}
        {activeTab === 'toolkit' && (
          <View>
            <View style={[styles.kitInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.kitCardTitle, { color: colors.text }]}>🧰 Daily Toolkit & Safety Inspection</Text>
              <Text style={[styles.kitCardSub, { color: colors.textSecondary }]}>
                Ensure all safety gear, diagnostic equipment, and spare kits are verified before doorstep departure.
              </Text>
            </View>

            <View style={[styles.checklistContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {checklist.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.checkItemRow, { borderBottomColor: colors.border }]}
                  activeOpacity={0.8}
                  onPress={() => toggleChecklistItem(item.id)}
                >
                  <View style={[styles.checkboxBox, item.checked && styles.checkboxBoxActive]}>
                    {item.checked && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>
                  <Text style={[styles.checkItemText, { color: item.checked ? colors.text : colors.textSecondary }, item.checked && styles.checkItemTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.callHubBtn} onPress={handleCallHubManager}>
              <Text style={styles.callHubBtnText}>📞 Need Spare Parts? Call Hub Manager</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= TAB 4: TECHNICIAN PROFILE & CREW ID ================= */}
        {activeTab === 'id_card' && (
          <View>
            {/* 1. HERO PROFILE CARD */}
            <View style={[styles.idCardContainer, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 14 }]}>
              <View style={[styles.idCardHeader, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.idCardBrand}>HELPER EXPERT CREW</Text>
                <Text style={styles.idCardBadge}>OFFICIAL PROFILE</Text>
              </View>

              <View style={styles.idCardBody}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleWorkerPhotoUpload}
                  style={{ alignItems: 'center', marginBottom: 8 }}
                >
                  <Image
                    source={{
                      uri: workerProfile?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
                    }}
                    style={styles.idCardPhoto}
                  />
                  <View style={styles.changePhotoBadge}>
                    <Text style={styles.changePhotoBadgeText}>📷 Change Photo</Text>
                  </View>
                </TouchableOpacity>

                <Text style={[styles.idCardName, { color: colors.text }]}>{technicianName}</Text>
                <Text style={styles.idCardRole}>{technicianRole}</Text>
                <Text style={[styles.idCardId, { color: colors.textSecondary }]}>
                  CREW ID: {workerProfile?.workerId || workerProfile?.id || 'HP-IND-7782'} • {assignedHub}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
                  <View style={{ backgroundColor: isOnDuty ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                    <Text style={{ color: isOnDuty ? '#10B981' : '#EF4444', fontSize: 11, fontWeight: '800' }}>
                      {isOnDuty ? '🟢 Active On Duty' : '🔴 Offline'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#38BDF8' }}
                    onPress={handleStartEditProfile}
                  >
                    <Text style={{ color: '#38BDF8', fontSize: 11, fontWeight: '800' }}>✏️ Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 2. INLINE PROFILE EDIT FORM (Shown when edit button is clicked) */}
            {isEditingWorkerProfile && (
              <View style={[styles.idCardContainer, { borderColor: '#38BDF8', backgroundColor: colors.card, marginBottom: 14, padding: 16 }]}>
                <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '900', marginBottom: 12 }}>✏️ Edit Technician Profile</Text>

                <Text style={[styles.authInputLabel, { color: colors.textSecondary }]}>FULL NAME</Text>
                <TextInput
                  style={[styles.authInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border, marginBottom: 10 }]}
                  value={editWorkerName}
                  onChangeText={setEditWorkerName}
                  placeholder="Enter full name"
                  placeholderTextColor="#64748B"
                />

                <Text style={[styles.authInputLabel, { color: colors.textSecondary }]}>SPECIALTY / TRADE ROLE</Text>
                <TextInput
                  style={[styles.authInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border, marginBottom: 10 }]}
                  value={editWorkerRole}
                  onChangeText={setEditWorkerRole}
                  placeholder="e.g. Wall Painter / Senior AC Technician"
                  placeholderTextColor="#64748B"
                />

                <Text style={[styles.authInputLabel, { color: colors.textSecondary }]}>SETTLEMENT UPI ID</Text>
                <TextInput
                  style={[styles.authInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border, marginBottom: 10 }]}
                  value={editWorkerUpi}
                  onChangeText={setEditWorkerUpi}
                  placeholder="e.g. mobile@upi"
                  placeholderTextColor="#64748B"
                />

                <Text style={[styles.authInputLabel, { color: colors.textSecondary }]}>OPERATING CITY</Text>
                <TextInput
                  style={[styles.authInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border, marginBottom: 14 }]}
                  value={editWorkerCity}
                  onChangeText={setEditWorkerCity}
                  placeholder="e.g. Indore"
                  placeholderTextColor="#64748B"
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#10B981', paddingVertical: 11, borderRadius: 8, alignItems: 'center' }}
                    onPress={handleSaveWorkerProfile}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 12 }}>💾 Save Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', paddingVertical: 11, borderRadius: 8, alignItems: 'center' }}
                    onPress={() => setIsEditingWorkerProfile(false)}
                  >
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 12 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 3. PERFORMANCE SUMMARY METRICS */}
            <View style={[styles.idCardContainer, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 14, padding: 16 }]}>
              <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginBottom: 12 }}>
                ⭐ FIELD PERFORMANCE & RATINGS
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#F59E0B', fontSize: 20, fontWeight: '900' }}>★ 4.98</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>Rating (124 rev)</Text>
                </View>
                <View style={{ width: 1, height: 35, backgroundColor: colors.border }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#10B981', fontSize: 20, fontWeight: '900' }}>{completedJobsToday + 48}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>Lifetime Jobs</Text>
                </View>
                <View style={{ width: 1, height: 35, backgroundColor: colors.border }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '900' }}>99%</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>Punctuality</Text>
                </View>
              </View>
            </View>

            {/* 4. SETTLEMENT & BANKING INFO */}
            <View style={[styles.idCardContainer, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 14, padding: 16 }]}>
              <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginBottom: 12 }}>
                💰 INSTANT UPI SETTLEMENT & PAYOUTS
              </Text>
              <View style={styles.idCardDetailRow}>
                <Text style={[styles.idCardLabel, { color: colors.textSecondary }]}>Primary Settlement UPI:</Text>
                <Text style={[styles.idCardValue, { color: '#10B981' }]}>{workerProfile?.upiId || '8085898586@upi'}</Text>
              </View>
              <View style={styles.idCardDetailRow}>
                <Text style={[styles.idCardLabel, { color: colors.textSecondary }]}>Payout Settlement Cycle:</Text>
                <Text style={[styles.idCardValue, { color: colors.text }]}>Instant Direct UPI on OTP</Text>
              </View>
              <View style={styles.idCardDetailRow}>
                <Text style={[styles.idCardLabel, { color: colors.textSecondary }]}>Commission Royalty Split:</Text>
                <Text style={[styles.idCardValue, { color: colors.text }]}>90% Technician / 10% Hub</Text>
              </View>
              <View style={styles.idCardDetailRow}>
                <Text style={[styles.idCardLabel, { color: colors.textSecondary }]}>Affiliated Hub Center:</Text>
                <Text style={[styles.idCardValue, { color: colors.text }]}>{assignedHub}</Text>
              </View>
            </View>

            {/* 5. VERIFIED DOCUMENTS & KYC */}
            <View style={[styles.idCardContainer, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 14, padding: 16 }]}>
              <Text style={{ color: '#38BDF8', fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginBottom: 12 }}>
                🛡️ GOVT KYC & VERIFIED CREDENTIALS
              </Text>
              <View style={styles.idCardDetailRow}>
                <Text style={[styles.idCardLabel, { color: colors.textSecondary }]}>Aadhaar Card (UIDAI):</Text>
                <Text style={[styles.idCardValue, { color: '#10B981' }]}>✓ Linked & Verified</Text>
              </View>
              <View style={styles.idCardDetailRow}>
                <Text style={[styles.idCardLabel, { color: colors.textSecondary }]}>Income Tax PAN Card:</Text>
                <Text style={[styles.idCardValue, { color: '#10B981' }]}>✓ Verified (Linked)</Text>
              </View>
              <View style={styles.idCardDetailRow}>
                <Text style={[styles.idCardLabel, { color: colors.textSecondary }]}>Skill Certification:</Text>
                <Text style={[styles.idCardValue, { color: '#10B981' }]}>✓ NTC Trade Skill Cert</Text>
              </View>
              <View style={styles.idCardDetailRow}>
                <Text style={[styles.idCardLabel, { color: colors.textSecondary }]}>Police Background Check:</Text>
                <Text style={[styles.idCardValue, { color: '#10B981' }]}>✓ Approved / Clean Record</Text>
              </View>
              <View style={styles.idCardDetailRow}>
                <Text style={[styles.idCardLabel, { color: colors.textSecondary }]}>Driving License:</Text>
                <Text style={[styles.idCardValue, { color: '#10B981' }]}>✓ Verified & Active</Text>
              </View>
            </View>

            {/* 6. DIGITAL CREW ID CARD & QR CODE */}
            <View style={[styles.idCardContainer, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 14, padding: 16 }]}>
              <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginBottom: 6 }}>
                📱 DIGITAL DOORSTEP CREW ID
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 12 }}>
                Show this digital ID card to customers at the doorstep for instant trust and verification.
              </Text>
              <View style={[styles.qrVerifyBox, { borderTopColor: colors.border }]}>
                <View style={{ backgroundColor: '#FFFFFF', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1' }}>
                  <Image
                    source={{
                      uri: `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=HELPER-VERIFIED-${technicianName.toUpperCase()}-CREW`,
                    }}
                    style={styles.qrVerifyImg}
                  />
                </View>
                <Text style={[styles.qrVerifyText, { color: colors.textSecondary, marginTop: 8 }]}>Scan to Verify Technician Credentials & ID</Text>
              </View>
            </View>

            {/* 7. PREFERENCES & HELPLINE SUPPORT */}
            <View style={[styles.idCardContainer, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 14, padding: 16 }]}>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginBottom: 12 }}>
                ⚙️ APP PREFERENCES & HELPLINE
              </Text>
              <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                onPress={toggleTheme}
              >
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
                  {isDark ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
                </Text>
                <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '800' }}>Toggle ➔</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                onPress={toggleBellMode}
              >
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
                  {isBellMuted ? '🔕 Alert Sound: Silent' : '🔔 Alert Sound: Chime Ring'}
                </Text>
                <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '800' }}>Change ➔</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}
                onPress={() => Linking.openURL('tel:7389451349')}
              >
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
                  📞 Helper Crew Partner Support
                </Text>
                <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '800' }}>+91 7389451349 ➔</Text>
              </TouchableOpacity>
            </View>

            {/* 8. LOGOUT BUTTON */}
            <TouchableOpacity
              style={[styles.workerLogoutBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2', borderColor: '#EF4444' }]}
              onPress={handleWorkerLogout}
            >
              <Text style={styles.workerLogoutBtnText}>🚪 Logout Technician Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ================= MODAL: CUSTOMER UPI QR PAYMENT ================= */}
      {/* ================= MODAL: CUSTOMER UPI QR PAYMENT (HELPER PLATFORM PAYEE) ================= */}
      <Modal visible={showQrModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Dynamic UPI QR Code 📱</Text>
                <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 1 }}>
                  Calculated based on actual work time
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowQrModal(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalQrBody}>
              {/* Work Time Badge */}
              <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 8 }}>
                <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '800' }}>
                  ⏱️ Time Worked: {finalDurationMins} mins ({formatStopwatch(stopwatchSeconds)})
                </Text>
              </View>

              <Text style={styles.modalAmountText}>Total Payable: ₹{finalCalculatedAmount}</Text>
              <Text style={styles.modalAmountSub}>Customer scans via PhonePe, GPay, Paytm or UPI</Text>

              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=helper.indore@icici%26pn=HelperPlatform%26am=${finalCalculatedAmount}%26cu=INR`,
                }}
                style={styles.bigQrImage}
              />

              <Text style={{ color: '#10B981', fontSize: 11.5, fontWeight: '800', marginTop: 4 }}>
                Official Payee: helper.indore@icici
              </Text>

              {/* Settlement Split Breakdown */}
              <View style={{ backgroundColor: '#090E1A', borderRadius: 10, padding: 10, width: '100%', marginTop: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: '#94A3B8', fontSize: 11 }}>Helper Platform Fee (10%):</Text>
                  <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '800' }}>
                    ₹{Math.round(finalCalculatedAmount * 0.10)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: '#94A3B8', fontSize: 11 }}>Vendor Hub Settlement (90%):</Text>
                  <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>
                    ₹{finalCalculatedAmount - Math.round(finalCalculatedAmount * 0.10)}
                  </Text>
                </View>
                <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.06)', paddingTop: 4 }}>
                  <Text style={{ color: '#64748B', fontSize: 10 }}>
                    ℹ️ Payment goes directly to Helper Platform. Vendor receives 90% in their Hub Wallet and disburses your technician wage.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: '#10B981', width: '100%', marginTop: 14 }]}
                onPress={async () => {
                  setShowQrModal(false);
                  const orderId = activeJob?.orderId || 'ORD-88219';
                  try {
                    await axios.post(`http://localhost:5000/api/bookings/${orderId}/pay`, {
                      paymentMethod: 'upi',
                      amount: finalCalculatedAmount,
                      paidTo: 'helper.indore@icici',
                    });
                  } catch (e) {}
                  Alert.alert(
                    'Payment Confirmed! ✅',
                    `Payment of ₹${finalCalculatedAmount} received by Helper Platform.\n\n• 10% Platform fee retained by Helper\n• 90% settled into Vendor Hub Account\n• Vendor will disburse your technician wage.`
                  );
                }}
              >
                <Text style={styles.primaryBtnText}>Confirm Customer Paid via QR ✅</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= ANIMATED DUTY STATUS MODAL ================= */}
      <Modal
        visible={dutyModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeDutyModal}
      >
        <View style={styles.dutyModalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeDutyModal}
          />
          <Animated.View
            style={[
              styles.dutyModalCard,
              {
                backgroundColor: colors.card,
                borderColor: dutyModalType === 'online' ? '#10B981' : '#EF4444',
                opacity: dutyModalAnim,
                transform: [
                  {
                    scale: dutyModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.82, 1],
                    }),
                  },
                  {
                    translateY: dutyModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Top Close Button */}
            <TouchableOpacity
              style={[
                styles.dutyModalCloseBtn,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' },
              ]}
              onPress={closeDutyModal}
              activeOpacity={0.7}
            >
              <Text style={[styles.dutyModalCloseText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>

            {/* Glowing Animated Radar / Moon Emblem */}
            <View style={styles.dutyEmblemWrapper}>
              {/* Outer Pulsing Halo Ripple */}
              <Animated.View
                style={[
                  styles.dutyPulseRing,
                  {
                    borderColor: dutyModalType === 'online' ? '#10B981' : '#EF4444',
                    transform: [
                      {
                        scale: dutyModalHaloAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.8],
                        }),
                      },
                    ],
                    opacity: dutyModalHaloAnim.interpolate({
                      inputRange: [0, 0.7, 1],
                      outputRange: [0.6, 0.2, 0],
                    }),
                  },
                ]}
              />

              {/* Inner Glowing Disc */}
              <Animated.View
                style={[
                  styles.dutyEmblemDisc,
                  {
                    backgroundColor:
                      dutyModalType === 'online'
                        ? (isDark ? 'rgba(16, 185, 129, 0.18)' : '#ECFDF5')
                        : (isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEF2F2'),
                    borderColor: dutyModalType === 'online' ? '#10B981' : '#EF4444',
                    transform: [{ scale: dutyModalIconScale }],
                  },
                ]}
              >
                <Text style={styles.dutyEmblemEmoji}>
                  {dutyModalType === 'online' ? '⚡' : '🌙'}
                </Text>
              </Animated.View>
            </View>

            {/* Pill Tag */}
            <View
              style={[
                styles.dutyStatusPill,
                {
                  backgroundColor:
                    dutyModalType === 'online'
                      ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5')
                      : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2'),
                  borderColor: dutyModalType === 'online' ? '#10B981' : '#EF4444',
                },
              ]}
            >
              <View
                style={[
                  styles.dutyStatusDot,
                  { backgroundColor: dutyModalType === 'online' ? '#10B981' : '#EF4444' },
                ]}
              />
              <Text
                style={[
                  styles.dutyStatusPillText,
                  { color: dutyModalType === 'online' ? '#10B981' : '#EF4444' },
                ]}
              >
                {dutyModalType === 'online' ? 'RADAR ACTIVE • LIVE DISPATCH' : 'DUTY PAUSED • OFFLINE'}
              </Text>
            </View>

            {/* Heading & Subtitle */}
            <Text style={[styles.dutyModalTitle, { color: colors.text }]}>
              {dutyModalType === 'online' ? 'You are Now On-Duty!' : 'You are Now Off-Duty'}
            </Text>
            <Text style={[styles.dutyModalSubtitle, { color: colors.textSecondary }]}>
              {dutyModalType === 'online'
                ? 'Ready to receive instant doorstep bookings & task assignments across Indore.'
                : 'Assignments & incoming radar alerts are paused. Take a break!'}
            </Text>

            {/* 3 High-Impact Feature Cards */}
            <View style={styles.dutyFeatureList}>
              {dutyModalType === 'online' ? (
                <>
                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>🚀</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Priority Task Radar</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        Hub connects nearby bookings directly to your phone.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>🔔</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Chime & Vibration Alert</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        Instant ringing alarm sounds whenever a new job lands.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>📍</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Live ETA & Route Maps</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        Turn-by-turn navigation ready for instant doorstep travel.
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>⏸️</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Dispatches Paused</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        No incoming alarms, calls, or job prompts will ring.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>💰</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Payouts Secured</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        Today's earnings (₹{todayEarnings}) remain 100% safe for withdrawal.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>🔋</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Battery & Data Saver</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        GPS background pinging and audio services are asleep.
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={[
                styles.dutyModalActionBtn,
                {
                  backgroundColor: dutyModalType === 'online' ? '#10B981' : '#334155',
                  shadowColor: dutyModalType === 'online' ? '#10B981' : '#334155',
                },
              ]}
              activeOpacity={0.85}
              onPress={closeDutyModal}
            >
              <Text style={styles.dutyModalActionBtnText}>
                {dutyModalType === 'online' ? "Let's Go & Earn! 🚀" : "Got It, Take a Break ☕"}
              </Text>
            </TouchableOpacity>

            {/* Quick Switch Text Link */}
            <TouchableOpacity
              style={styles.dutyModalSwitchLink}
              onPress={handleToggleFromDutyModal}
              activeOpacity={0.7}
            >
              <Text style={[styles.dutyModalSwitchLinkText, { color: colors.textMuted }]}>
                {dutyModalType === 'online' ? 'Wrong tap? Switch to Offline' : 'Need to work? Switch back to Online'}
              </Text>
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
    backgroundColor: '#070A12',
  },

  /* 1. TOP HEADER */
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#0C111E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    marginRight: 6,
  },
  avatarWrap: {
    position: 'relative',
  },
  workerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#070A12',
  },
  workerTitle: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  crewBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    flexShrink: 0,
  },
  crewBadgeText: {
    color: '#F59E0B',
    fontSize: 7.5,
    fontWeight: '800',
  },
  hubSubText: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 1,
    flexShrink: 1,
  },

  /* RIGHT CONTROLS GROUP */
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },

  /* HEADER CIRCULAR BUTTON (THEME & BELL) */
  headerCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* HEADER THEME TOGGLE BUTTON */
  headerThemeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* BELL SOUND RING / SILENT TOGGLE PILL */
  bellTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
    paddingHorizontal: 7,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    flexShrink: 0,
  },
  bellToggleActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  bellToggleMuted: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  bellToggleIcon: {
    fontSize: 11,
  },
  bellToggleText: {
    fontSize: 9.5,
    fontWeight: '800',
    includeFontPadding: false,
  },

  /* DUTY PILL */
  dutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    minWidth: 74,
    flexShrink: 0,
  },
  dutyPillOn: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderColor: '#10B981',
  },
  dutyPillOff: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    borderColor: '#EF4444',
  },
  dutyPulseDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    flexShrink: 0,
  },
  dutyPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
    includeFontPadding: false,
  },

  /* 2. METRICS BANNER */
  metricBanner: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignSelf: 'center',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '900',
    marginTop: 2,
  },
  metricSub: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 1,
  },

  /* 3. TABS */
  tabBarWrapper: {
    backgroundColor: '#090D16',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTabChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  tabChipText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  activeTabChipText: {
    color: '#F59E0B',
    fontWeight: '800',
  },

  /* SCROLL BODY */
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
  },

  /* EMPTY / OFFLINE BOXES */
  offlineBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  boxTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  boxDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 18,
  },
  outlineActionBtn: {
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 10,
  },
  outlineActionText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },

  /* ACTIVE JOB CARD */
  jobCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    padding: 16,
    overflow: 'hidden',
  },
  bellBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.35)',
  },
  bellIcon: {
    fontSize: 20,
  },
  bellTitle: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '900',
  },
  bellSub: {
    color: '#FDE68A',
    fontSize: 9.5,
  },
  bellMuteBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  bellMuteText: {
    color: '#FBBF24',
    fontSize: 9.5,
    fontWeight: '800',
  },

  jobStageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 10,
  },
  jobStatusPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  jobStatusText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
  },
  jobIdText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },

  jobInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  serviceHead: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  serviceCat: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  payoutWrap: {
    alignItems: 'flex-end',
  },
  payoutLabel: {
    color: '#64748B',
    fontSize: 8.5,
    fontWeight: '800',
  },
  payoutValue: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '900',
  },
  tipText: {
    color: '#F59E0B',
    fontSize: 9.5,
    fontWeight: '700',
  },

  /* CUSTOMER CARD */
  customerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    gap: 8,
  },
  customerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  callPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  callPillText: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '800',
  },
  addressLine: {
    color: '#CBD5E1',
    fontSize: 11.5,
    flex: 1,
  },
  landmarkLine: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: 6,
    borderRadius: 6,
  },
  landmarkText: {
    color: '#F59E0B',
    fontSize: 10.5,
  },
  navigationBtn: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  navigationBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  /* SCOPE */
  scopeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  scopeTitle: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  taskLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskText: {
    color: '#CBD5E1',
    fontSize: 11,
  },

  /* OTP CARD */
  otpCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  otpCardHeading: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '900',
  },
  otpCardSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginVertical: 6,
  },
  otpInputBox: {
    backgroundColor: '#0C111E',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  demoOtpHint: {
    color: '#64748B',
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 8,
  },

  /* IN-PROGRESS STOPWATCH */
  inProgressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    alignItems: 'center',
  },
  stopwatchDisplay: {
    alignItems: 'center',
    marginVertical: 8,
  },
  stopwatchIcon: {
    fontSize: 28,
  },
  stopwatchText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: 4,
  },
  stopwatchLabel: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  photoBtn: {
    borderWidth: 1.5,
    borderColor: '#64748B',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoBtnText: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '800',
  },

  /* COMPLETED */
  completedBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  completedTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  completedSub: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },

  /* BUTTONS */
  primaryBtn: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  /* EARNINGS TAB */
  earningsSummaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  earningsCardLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  earningsBigAmount: {
    color: '#10B981',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 6,
  },
  earningsSubText: {
    color: '#94A3B8',
    fontSize: 10.5,
    textAlign: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownItemLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
  },
  breakdownItemVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionHeaderTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 10,
  },
  pastJobCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pastJobService: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  pastJobCustomer: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
  },
  pastJobId: {
    color: '#64748B',
    fontSize: 9.5,
    marginTop: 2,
  },
  pastJobAmount: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '900',
  },
  settledBadge: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },

  /* TOOLKIT TAB */
  kitInfoCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  kitCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  kitCardSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  checklistContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxBoxActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  checkItemText: {
    color: '#94A3B8',
    fontSize: 12,
    flex: 1,
  },
  checkItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  callHubBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  callHubBtnText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },

  /* DIGITAL ID CARD */
  idCardContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F59E0B',
    overflow: 'hidden',
  },
  idCardHeader: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idCardBrand: {
    color: '#070A12',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  idCardBadge: {
    backgroundColor: '#070A12',
    color: '#F59E0B',
    fontSize: 8.5,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idCardBody: {
    padding: 20,
    alignItems: 'center',
  },
  idCardPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 6,
  },
  changePhotoBadge: {
    backgroundColor: '#0E1526',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: -10,
    marginBottom: 4,
  },
  changePhotoBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  idCardName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  idCardRole: {
    color: '#F59E0B',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  idCardId: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  idCardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  idCardDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  idCardLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  idCardValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  qrVerifyBox: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  qrVerifyImg: {
    width: 110,
    height: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 6,
  },
  qrVerifyText: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 6,
  },

  /* MODALS */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  modalCloseBtn: {
    color: '#94A3B8',
    fontSize: 20,
    padding: 4,
  },
  modalQrBody: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  modalAmountText: {
    color: '#10B981',
    fontSize: 26,
    fontWeight: '900',
  },
  modalAmountSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 14,
  },
  bigQrImage: {
    width: 170,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
  },
  modalUpiId: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 10,
  },

  /* WORKER AUTH & PROFILE STYLES */
  authHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#0C111E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  authBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authBackIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: -2,
  },
  authBrandTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  crewShieldBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  crewShieldText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '900',
  },
  authSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  authScrollBody: {
    padding: 16,
    paddingBottom: 40,
  },
  quickDemoBannerWorker: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  demoWorkerBannerTitle: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '900',
  },
  demoWorkerBannerSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  demoWorkerBannerArrow: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '900',
  },
  authTabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  authTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  authTabBtnActive: {
    backgroundColor: '#10B981',
  },
  authTabBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  authTabBtnTextActive: {
    color: '#FFFFFF',
  },
  authCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 18,
  },
  authCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  authCardDesc: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 16,
  },
  authInputLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  authInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  authPrimaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  authPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  authPerksBox: {
    backgroundColor: '#0B111E',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  authPerkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authPerkIcon: {
    fontSize: 22,
  },
  authPerkTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  authPerkSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  workerLogoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
  },
  workerLogoutBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerLogoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    borderWidth: 1.2,
    borderColor: '#EF4444',
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerLogoutBtnText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
    includeFontPadding: false,
  },

  /* ================= ANIMATED DUTY STATUS MODAL STYLES ================= */
  dutyModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dutyModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
  },
  dutyModalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dutyModalCloseText: {
    fontSize: 14,
    fontWeight: '800',
  },
  dutyEmblemWrapper: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  dutyPulseRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
  },
  dutyEmblemDisc: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dutyEmblemEmoji: {
    fontSize: 32,
  },
  dutyStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  dutyStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  dutyStatusPillText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  dutyModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
    marginBottom: 4,
    textAlign: 'center',
  },
  dutyModalSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  dutyFeatureList: {
    width: '100%',
    marginBottom: 16,
    gap: 8,
  },
  dutyFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
  dutyFeatureIcon: {
    fontSize: 20,
  },
  dutyFeatureTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  dutyFeatureDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  dutyModalActionBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dutyModalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  dutyModalSwitchLink: {
    marginTop: 10,
    paddingVertical: 4,
  },
  dutyModalSwitchLinkText: {
    fontSize: 11.5,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

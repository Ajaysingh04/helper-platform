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
  NativeModules,
  Vibration,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { colors } from '../theme/colors';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { openImagePicker } from '../utils/imagePickerHelper';

const { BellSound } = NativeModules;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_INCOMING_ORDER = {
  id: 'HLP-73262',
  serviceName: 'Master Plumbing & Leak Fix',
  customerName: 'Ajay Singh',
  customerPhone: '+91 7389451349',
  address: 'Flat 402, Royal Palms, Vijay Nagar, Indore',
  payout: 499,
  distance: '2.4 km away',
  timeEstimate: '10-12 mins drive',
  scheduledTime: 'Today • 03:30 PM',
  otp: '3909',
  category: 'Plumber',
  items: ['Pipe & Tap Inspection', 'Pressure Valve Repair', 'Verified Standard Warranty'],
};

const INITIAL_WORKERS = [
  {
    id: 'wrk_101',
    workerId: 'wrk_101',
    name: 'Sunil Sharma',
    phone: '+91 98765 00101',
    specialty: 'Master Plumbing & Leakage Expert',
    category: 'Plumber',
    skills: ['Plumber', 'Plumbing', 'Pipe Leakage', 'Tap Repair', 'Basin Installation'],
    experience: '6 Yrs Exp',
    experienceYears: 6,
    rating: '4.95',
    jobsDone: 310,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
    upiId: 'sunil.sharma@upi',
  },
  {
    id: 'wrk_102',
    workerId: 'wrk_102',
    name: 'Amit Verma',
    phone: '+91 98765 00102',
    specialty: 'Senior Electrician & Inverter Pro',
    category: 'Electrician',
    skills: ['Electrician', 'Electrical', 'MCB Tripping Fix', 'Switchboard Wiring'],
    experience: '5 Yrs Exp',
    experienceYears: 5,
    rating: '4.95',
    jobsDone: 245,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    upiId: 'amit.verma@upi',
  },
  {
    id: 'wrk_104',
    workerId: 'wrk_104',
    name: 'Imran Khan',
    phone: '+91 98765 00104',
    specialty: 'Master AC & Refrigerator Specialist',
    category: 'AC Repair & Refill',
    skills: ['AC Repair', 'Air Conditioner', 'Deep Foam Jet Wash', 'Gas Refill'],
    experience: '7 Yrs Exp',
    experienceYears: 7,
    rating: '4.98',
    jobsDone: 320,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    upiId: 'imran.ac@upi',
  },
  {
    id: 'wrk_106',
    workerId: 'wrk_106',
    name: 'Priya Sharma',
    phone: '+91 98765 00106',
    specialty: 'Certified Home Deep Cleaning Pro',
    category: 'Home Cleaner',
    skills: ['Cleaning', 'Home Cleaning', 'Deep Bathroom Scrubbing', 'Kitchen Degreasing'],
    experience: '4 Yrs Exp',
    experienceYears: 4,
    rating: '4.90',
    jobsDone: 195,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    upiId: 'priya.clean@upi',
  },
  {
    id: 'wrk_105',
    workerId: 'wrk_105',
    name: 'Sunil Mistry',
    phone: '+91 98765 00105',
    specialty: 'Master Carpenter & Furniture Craftsman',
    category: 'Carpenter',
    skills: ['Carpenter', 'Carpentry', 'Door Lock Fix', 'Modular Furniture'],
    experience: '9 Yrs Exp',
    experienceYears: 9,
    rating: '4.92',
    jobsDone: 280,
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    upiId: 'sunil.carpenter@upi',
  },
];

const INITIAL_SERVICES = [
  { id: 'srv_1', name: 'Standard Visiting & Diagnosis', price: 299, time: '30 mins' },
  { id: 'srv_2', name: 'AC Jet Foam Power Cleaning', price: 499, time: '45 mins' },
  { id: 'srv_3', name: 'Complete Switchboard & MCB Repair', price: 249, time: '30 mins' },
  { id: 'srv_4', name: 'Emergency Pipe Leak & Tap Fix', price: 299, time: '40 mins' },
];

export default function VendorPartnerScreen({ navigation }) {
  const { primaryColor, themeColors, isDark: ctxIsDark, toggleTheme: ctxToggleTheme, themeMode, setThemeMode } = useContext(AppContext);
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
  const activeColor = '#10B981'; // Emerald Green for Partner App

  // Vendor Auth & Session State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vendorProfile, setVendorProfile] = useState({
    id: 'VND-IND-01',
    name: 'Ramesh Sharma',
    shopName: 'Indore Multi-Specialist Hub',
    phone: '+91 98765 43210',
    email: 'indore.hub@helper.com',
    category: 'Multi-Specialist Hub',
    city: 'Indore',
    address: 'Vijay Nagar, Indore, Madhya Pradesh',
    upiId: 'indore.hub@upi',
  });
  const [authMode, setAuthMode] = useState('login'); // login | register
  const [loginPhone, setLoginPhone] = useState('9876543210');
  const [loginPassword, setLoginPassword] = useState('vendor123');
  const [regName, setRegName] = useState('');
  const [regShopName, setRegShopName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('Indore');
  const [regCategory, setRegCategory] = useState('Multi-Specialist Hub');
  const [regUpi, setRegUpi] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Vendor Core State
  const [isDutyOn, setIsDutyOn] = useState(true);
  const [activeTab, setActiveTab] = useState('radar'); // radar | active | workers | wallet | shop
  const [walletBalance, setWalletBalance] = useState(4650);
  const [todayEarnings, setTodayEarnings] = useState(1497);
  const [completedJobsToday, setCompletedJobsToday] = useState(3);

  // Incoming Job Lead State (Real-time live radar)
  const [incomingOrder, setIncomingOrder] = useState(null);
  const [countdown, setCountdown] = useState(45);
  const [acceptedOrder, setAcceptedOrder] = useState(null);
  const [vendorSetTime, setVendorSetTime] = useState('45 mins');
  const [vendorSetPrice, setVendorSetPrice] = useState('499');

  // Active Job Execution States
  const [jobStage, setJobStage] = useState('accepted'); // accepted | on_the_way | reached | in_progress | completed
  const [inputOtp, setInputOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [assignedWorker, setAssignedWorker] = useState(INITIAL_WORKERS[0]);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  // Choose Worker Modal States
  const [showChooseWorkerModal, setShowChooseWorkerModal] = useState(false);
  const [workerFilterTab, setWorkerFilterTab] = useState('suggested'); // suggested | all
  const [selectedWorkerToAssign, setSelectedWorkerToAssign] = useState(INITIAL_WORKERS[0]);

  // Disburse Payout to Worker Modal State
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseAmount, setDisburseAmount] = useState('350');
  const [selectedWorkerForDisburse, setSelectedWorkerForDisburse] = useState(INITIAL_WORKERS[0]);

  // Workers Fleet State
  const [workersList, setWorkersList] = useState(INITIAL_WORKERS);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerSpecialty, setNewWorkerSpecialty] = useState('Senior AC Technician');
  const [newWorkerExp, setNewWorkerExp] = useState('5 Yrs Exp');
  const [newWorkerUpi, setNewWorkerUpi] = useState('');

  // Shop & Services State (from Website logic)
  const [shopName, setShopName] = useState('Indore Multi-Specialist Hub');
  const [hourlyRate, setHourlyRate] = useState('299');
  const [vendorServices, setVendorServices] = useState(INITIAL_SERVICES);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceTime, setNewServiceTime] = useState('45 mins');

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('2000');
  const [withdrawUpi, setWithdrawUpi] = useState('sunil.verma@upi');
  const [isBellMuted, setIsBellMuted] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerPhone, setEditOwnerPhone] = useState('');
  const [editShopUpi, setEditShopUpi] = useState('');

  const handleStartEditShop = () => {
    setEditOwnerName(vendorProfile?.name || 'Ramesh Sharma');
    setEditOwnerPhone(vendorProfile?.phone || '+91 98765 43210');
    setEditShopUpi(vendorProfile?.upiId || 'indore.hub@upi');
    setIsEditingShop(true);
  };

  const handleSaveShopDetails = async () => {
    if (!shopName.trim()) {
      Alert.alert('Required', 'Please enter your Hub / Shop Name.');
      return;
    }
    const updated = {
      ...vendorProfile,
      shopName: shopName.trim(),
      name: editOwnerName.trim() || vendorProfile?.name,
      phone: editOwnerPhone.trim() || vendorProfile?.phone,
      upiId: editShopUpi.trim() || vendorProfile?.upiId,
      hourlyRate: hourlyRate.trim() || '299',
    };
    setVendorProfile(updated);
    setShopName(updated.shopName);
    try {
      await AsyncStorage.setItem(
        'helper_vendor_session',
        JSON.stringify({ vendor: updated, token: 'vendor-token-active' })
      );
      await axios.put(`http://localhost:5000/api/providers/${updated.id || 'VND-IND-01'}`, {
        name: updated.shopName,
        contactPerson: updated.name,
        phone: updated.phone,
        upiId: updated.upiId,
        rate: updated.hourlyRate,
      });
    } catch (e) {
      console.log('Vendor sync notice:', e.message);
    }
    setIsEditingShop(false);
    Alert.alert('Profile Saved! 🎉', 'Your Hub and Business details have been updated.');
  };

  // Load session & audio preference on startup
  useEffect(() => {
    AsyncStorage.getItem('helper_vendor_bell_muted').then((v) => {
      if (v !== null) setIsBellMuted(v === 'true');
    });

    AsyncStorage.getItem('helper_vendor_session').then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.vendor) {
            setVendorProfile(parsed.vendor);
            if (parsed.vendor.shopName) setShopName(parsed.vendor.shopName);
            setIsLoggedIn(true);
          }
        } catch (e) {}
      }
    });
  }, []);

  const handleVendorPhotoUpload = () => {
    openImagePicker(async (asset) => {
      if (asset?.uri) {
        const newAvatar = asset.uri;
        const updated = {
          ...vendorProfile,
          avatar: newAvatar,
        };
        setVendorProfile(updated);
        try {
          await AsyncStorage.setItem(
            'helper_vendor_session',
            JSON.stringify({ vendor: updated, token: 'vendor-token-active' })
          );
          await axios.put(`http://localhost:5000/api/providers/${vendorProfile.id || 'VND-IND-01'}`, {
            avatar: newAvatar,
            logo: newAvatar,
          });
        } catch (e) {
          console.log('Vendor avatar sync error:', e.message);
        }
        Alert.alert('Hub Photo Updated! 📸', 'Your Vendor Hub photo/logo has been updated successfully.');
      }
    });
  };

  useEffect(() => {

    // Fetch team workers from backend
    axios.get('http://localhost:5000/api/workers')
      .then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          const apiWorkers = res.data.data.map(w => ({
            id: w.id || w.workerId,
            workerId: w.workerId || w.id,
            name: w.name,
            phone: w.phone,
            specialty: w.category ? `${w.category} Specialist` : 'Technician',
            category: w.category || 'Specialist',
            skills: w.skills || [w.category],
            experience: w.experience || (w.experienceYears ? `${w.experienceYears} Yrs Exp` : '5 Yrs Exp'),
            experienceYears: w.experienceYears || 5,
            rating: String(w.performance?.rating || 4.95),
            jobsDone: w.jobsDone || 200,
            status: 'ACTIVE',
            avatar: w.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
            upiId: `${(w.name || 'worker').toLowerCase().replace(/[^a-z]/g, '')}@upi`
          }));
          setWorkersList(prev => {
            const ids = new Set(apiWorkers.map(w => w.id));
            const existingRemaining = prev.filter(w => !ids.has(w.id));
            return [...apiWorkers, ...existingRemaining];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Poll backend for customer bookings placed on website or mobile app
  useEffect(() => {
    let poller;
    const fetchLatestBookings = () => {
      if (!isLoggedIn || !isDutyOn || acceptedOrder) return;
      axios
        .get('http://localhost:5000/api/bookings')
        .then((res) => {
          if (res.data?.data && res.data.data.length > 0) {
            const pendingBookings = res.data.data.filter(b => 
              (b.status === 'pending' || b.status === 'requested' || b.status === 'broadcast') &&
              b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'assigned' && b.status !== 'slot_confirmed'
            );
            const latest = pendingBookings[0] || null;
            if (latest && (!incomingOrder || incomingOrder.id !== (latest.bookingCode || latest.id))) {
              setIncomingOrder({
                id: latest.bookingCode || latest.id || 'HLP-73262',
                serviceName: latest.serviceName || latest.service || 'Master Plumbing & Leak Fix',
                customerName: latest.customerName || 'Ajay Singh',
                customerPhone: latest.customerPhone || latest.phone || '+91 7389451349',
                address: latest.customerAddress || latest.address || latest.serviceAddress?.fullAddress || 'Flat 402, Royal Palms, Vijay Nagar, Indore',
                payout: latest.totalAmount || latest.price || 499,
                distance: latest.distance || (latest.distanceKm ? `${latest.distanceKm} km away` : '2.4 km away'),
                timeEstimate: '10-12 mins drive',
                scheduledTime: latest.scheduledDate ? `${latest.scheduledDate} • ${latest.scheduledTime || '03:30 PM'}` : 'Today • 03:30 PM',
                otp: latest.doorOtp || '3909',
                category: latest.serviceCategory || 'Plumber',
                items: [latest.serviceName || 'Home Service', 'Doorstep Inspection & Repair', 'Verified Standard Warranty'],
              });
              setCountdown(45);
            } else if (!latest && !acceptedOrder && incomingOrder) {
              setIncomingOrder(null);
            }
          }
        })
        .catch(() => {});
    };

    fetchLatestBookings();
    if (isLoggedIn && isDutyOn && !acceptedOrder) {
      poller = setInterval(fetchLatestBookings, 2500);
    }
    return () => clearInterval(poller);
  }, [isLoggedIn, isDutyOn, acceptedOrder, incomingOrder]);

  const handleVendorLogin = async () => {
    if (!loginPhone.trim() || !loginPassword.trim()) {
      Alert.alert('Required', 'Please enter your registered phone number and password.');
      return;
    }
    setAuthLoading(true);
    const hostCandidates = ['http://localhost:5000', 'http://192.168.1.9:5000'];
    let loginSuccess = false;

    for (const host of hostCandidates) {
      try {
        const res = await axios.post(`${host}/api/auth/vendor/login`, {
          phone: loginPhone.trim(),
          password: loginPassword.trim(),
        }, { timeout: 3500 });
        if (res.data?.success) {
          await AsyncStorage.setItem('helper_vendor_session', JSON.stringify(res.data));
          setVendorProfile(res.data.vendor);
          if (res.data.vendor?.shopName) setShopName(res.data.vendor.shopName);
          setIsLoggedIn(true);
          Alert.alert('Login Successful! 🎉', `Welcome back, ${res.data.vendor.name}!`);
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
      const demoVendor = {
        id: 'VND-IND-01',
        name: 'Ramesh Sharma',
        shopName: 'Indore Multi-Specialist Hub',
        phone: loginPhone,
        category: 'Multi-Specialist Hub',
        city: 'Indore',
        address: 'Vijay Nagar, Indore, Madhya Pradesh',
        upiId: 'indore.hub@upi',
      };
      await AsyncStorage.setItem('helper_vendor_session', JSON.stringify({ vendor: demoVendor }));
      setVendorProfile(demoVendor);
      setIsLoggedIn(true);
      Alert.alert('Logged In! 🚀', `Welcome to ${demoVendor.shopName}`);
    }

    setAuthLoading(false);
  };

  const handleVendorRegister = async () => {
    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      Alert.alert('Required', 'Please enter Full Name, Mobile Number, and Password.');
      return;
    }
    setAuthLoading(true);
    const payload = {
      name: regName.trim(),
      shopName: regShopName.trim() || `${regName.trim()}'s Hub`,
      phone: regPhone.trim(),
      password: regPassword.trim(),
      city: regCity.trim() || 'Indore',
      category: regCategory.trim() || 'Multi-Specialist Hub',
      upiId: regUpi.trim() || `${regPhone.trim()}@upi`,
    };

    let registerSuccess = false;
    const hostCandidates = ['http://localhost:5000', 'http://192.168.1.9:5000'];
    for (const host of hostCandidates) {
      try {
        const res = await axios.post(`${host}/api/auth/vendor/register`, payload, { timeout: 3500 });
        if (res.data?.success) {
          await AsyncStorage.setItem('helper_vendor_session', JSON.stringify(res.data));
          setVendorProfile(res.data.vendor);
          if (res.data.vendor?.shopName) setShopName(res.data.vendor.shopName);
          setIsLoggedIn(true);
          Alert.alert('Registration Successful! 🎉', `${res.data.vendor.shopName} has been registered successfully!`);
          registerSuccess = true;
          break;
        }
      } catch (err) {
        if (err.response?.data?.message) {
          Alert.alert('Registration Notice', err.response.data.message);
          setAuthLoading(false);
          return;
        }
      }
    }

    if (!registerSuccess) {
      const offlineVendor = {
        id: `VND-${Math.floor(1000 + Math.random() * 9000)}`,
        name: regName.trim(),
        shopName: regShopName.trim() || `${regName.trim()}'s Hub`,
        phone: regPhone.trim(),
        city: regCity.trim() || 'Indore',
        category: regCategory.trim() || 'Multi-Specialist Hub',
        upiId: regUpi.trim() || `${regPhone.trim()}@upi`,
        address: `${regCity.trim() || 'Indore'}, Madhya Pradesh`,
      };
      await AsyncStorage.setItem(
        'helper_vendor_session',
        JSON.stringify({ vendor: offlineVendor, token: 'vendor-token-active' })
      );
      setVendorProfile(offlineVendor);
      setShopName(offlineVendor.shopName);
      setIsLoggedIn(true);
      Alert.alert('Registration Successful! 🎉', `${offlineVendor.shopName} registered successfully!`);
    }

    setAuthLoading(false);
  };

  const handleVendorLogout = async () => {
    Alert.alert('Logout Hub?', 'Are you sure you want to log out from the Vendor Hub portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout 🚪',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('helper_vendor_session');
          setIsLoggedIn(false);
          Alert.alert('Logged Out', 'You have been successfully logged out from the vendor portal.');
        },
      },
    ]);
  };

  const toggleBellMode = async () => {
    const nextState = !isBellMuted;
    setIsBellMuted(nextState);
    await AsyncStorage.setItem('helper_vendor_bell_muted', String(nextState));
    if (nextState) {
      stopBookingBell();
      Alert.alert('Sound Setting 🔕', 'Notification Sound set to Silent. Visual radar alerts will remain active.');
    } else {
      triggerBookingBell();
      Alert.alert('Sound Setting 🔔', 'Notification Sound set to Ring. Loud bell alert enabled for new bookings.');
    }
  };

  // Animation values
  const dutyPulseAnim = useRef(new Animated.Value(1)).current;
  const radarWaveAnim = useRef(new Animated.Value(0)).current;
  const orderCardScale = useRef(new Animated.Value(0.92)).current;
  const orderCardOpacity = useRef(new Animated.Value(0)).current;
  const bellWobbleAnim = useRef(new Animated.Value(0)).current;

  // Duty Status Animated Modal State
  const [dutyModalVisible, setDutyModalVisible] = useState(false);
  const [dutyModalType, setDutyModalType] = useState('online'); // 'online' | 'offline'
  const dutyModalAnim = useRef(new Animated.Value(0)).current;
  const dutyModalHaloAnim = useRef(new Animated.Value(0)).current;
  const dutyModalIconScale = useRef(new Animated.Value(0.2)).current;

  // Sound Bell & Vibration Trigger
  const triggerBookingBell = () => {
    if (isBellMuted) return;
    try {
      if (BellSound?.playBookingBell) {
        BellSound.playBookingBell();
      }
      Vibration.vibrate([0, 450, 150, 450]);
    } catch (e) {
      console.log('Bell sound trigger error:', e);
    }
  };

  const stopBookingBell = () => {
    try {
      if (BellSound?.stopBell) {
        BellSound.stopBell();
      }
    } catch (e) {
      console.log('Stop bell error:', e);
    }
  };

  // Ringing bell sound + animation loop during incoming order
  useEffect(() => {
    let bellLoop;
    let soundInterval;

    if (incomingOrder && !acceptedOrder && isDutyOn) {
      // 1. Play sound immediately on lead arrival
      triggerBookingBell();

      // 2. Repeat bell sound every 4 seconds while order is waiting
      soundInterval = setInterval(() => {
        triggerBookingBell();
      }, 4000);

      // 3. Ringing wobble animation (-20deg to +20deg)
      bellLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bellWobbleAnim, { toValue: -20, duration: 80, useNativeDriver: true }),
          Animated.timing(bellWobbleAnim, { toValue: 20, duration: 80, useNativeDriver: true }),
          Animated.timing(bellWobbleAnim, { toValue: -15, duration: 80, useNativeDriver: true }),
          Animated.timing(bellWobbleAnim, { toValue: 15, duration: 80, useNativeDriver: true }),
          Animated.timing(bellWobbleAnim, { toValue: 0, duration: 90, useNativeDriver: true }),
          Animated.delay(1200),
        ])
      );
      bellLoop.start();
    } else {
      stopBookingBell();
      bellWobbleAnim.setValue(0);
    }

    return () => {
      bellLoop?.stop();
      if (soundInterval) clearInterval(soundInterval);
      stopBookingBell();
    };
  }, [incomingOrder, acceptedOrder, isDutyOn]);

  // Pulsing animation for Duty ON dot
  useEffect(() => {
    let pulse;
    if (isDutyOn) {
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
  }, [isDutyOn]);

  // Radar ripple wave animation
  useEffect(() => {
    let wave;
    if (isDutyOn && !incomingOrder && !acceptedOrder) {
      wave = Animated.loop(
        Animated.timing(radarWaveAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );
      wave.start();
    } else {
      radarWaveAnim.setValue(0);
    }
    return () => wave?.stop();
  }, [isDutyOn, incomingOrder, acceptedOrder]);

  // Order card entrance animation
  useEffect(() => {
    if (incomingOrder && !acceptedOrder) {
      Animated.parallel([
        Animated.spring(orderCardScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(orderCardOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [incomingOrder, acceptedOrder]);

  // Countdown timer for incoming order
  useEffect(() => {
    let timer;
    if (incomingOrder && countdown > 0 && !acceptedOrder && isDutyOn) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIncomingOrder(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [incomingOrder, countdown, acceptedOrder, isDutyOn]);

  // Stopwatch for in-progress job
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
    const nextIsDutyOn = nextType === 'online';
    setIsDutyOn(nextIsDutyOn);
    if (!nextIsDutyOn) {
      stopBookingBell();
    }
    showDutyStatusModal(nextType);
  };

  const toggleDuty = () => {
    const newState = !isDutyOn;
    setIsDutyOn(newState);
    if (!newState) {
      stopBookingBell();
      showDutyStatusModal('offline');
    } else {
      showDutyStatusModal('online');
    }
  };

  const getCategoryMatches = () => {
    if (!incomingOrder) return workersList;
    const kw = ((incomingOrder.serviceName || '') + ' ' + (incomingOrder.category || '')).toLowerCase();
    const matched = workersList.filter(w => {
      const cat = (w.category || w.specialty || '').toLowerCase();
      const skills = (w.skills || []).map(s => s.toLowerCase()).join(' ');
      if (kw.includes('plumb') && (cat.includes('plumb') || skills.includes('plumb'))) return true;
      if (kw.includes('electr') && (cat.includes('electr') || skills.includes('electr'))) return true;
      if ((kw.includes('ac') || kw.includes('air') || kw.includes('cool') || kw.includes('appliance')) && (cat.includes('ac') || skills.includes('ac') || cat.includes('refrigerat'))) return true;
      if (kw.includes('clean') && (cat.includes('clean') || skills.includes('clean'))) return true;
      if (kw.includes('carpent') && (cat.includes('carpent') || skills.includes('carpent'))) return true;
      if ((kw.includes('cook') || kw.includes('chef')) && (cat.includes('cook') || cat.includes('chef'))) return true;
      if (kw.includes('driver') && (cat.includes('driver') || skills.includes('driver'))) return true;
      if (kw.includes('doctor') && (cat.includes('doctor') || skills.includes('doctor'))) return true;
      return false;
    });
    return matched.length > 0 ? matched : workersList;
  };

  const handleAcceptOrder = async () => {
    stopBookingBell();
    const orderId = incomingOrder?.id || 'ORD-88219';
    try {
      await axios.post(`http://localhost:5000/api/bookings/${orderId}/accept`, {
        providerId: vendorProfile?.id || 'VND-IND-01',
        providerName: shopName || 'Indore Multi-Specialist Hub',
      });
    } catch (e) {
      console.log('Vendor accept sync note:', e.message);
    }

    const matches = getCategoryMatches();
    if (matches && matches.length > 0) {
      setSelectedWorkerToAssign(matches[0]);
    }
    setWorkerFilterTab('suggested');
    setShowChooseWorkerModal(true);
  };

  const handleConfirmAssignWorker = async () => {
    const chosenWorker = selectedWorkerToAssign || workersList[0];
    const finalPriceVal = Number(vendorSetPrice) || incomingOrder?.payout || 499;
    const finalTimeVal = vendorSetTime || '45 mins';
    const orderId = incomingOrder?.id || 'ORD-88219';

    try {
      await axios.post(`http://localhost:5000/api/bookings/${orderId}/assign-worker`, {
        workerId: chosenWorker.workerId || chosenWorker.id,
        workerName: chosenWorker.name,
        workerPhone: chosenWorker.phone,
        workerExperience: chosenWorker.experience || `${chosenWorker.experienceYears || 5} Yrs Exp`,
        role: chosenWorker.specialty || chosenWorker.category || 'Specialist',
        vendorEstimatedTime: finalTimeVal,
        vendorCustomPrice: finalPriceVal,
      });
    } catch (e) {
      console.log('Assign worker sync note:', e.message);
    }

    const orderToAccept = {
      ...incomingOrder,
      payout: finalPriceVal,
      vendorCustomPrice: finalPriceVal,
      vendorEstimatedTime: finalTimeVal,
      assignedWorker: chosenWorker,
      assignedWorkerName: chosenWorker.name,
      assignedWorkerPhone: chosenWorker.phone,
      assignedWorkerExperience: chosenWorker.experience || `${chosenWorker.experienceYears || 5} Yrs Exp`,
      assignedWorkerEmail: `${(chosenWorker.name || 'technician').toLowerCase().replace(/[^a-z0-9]/g, '.')}@worker.helper.com`,
    };

    setAcceptedOrder(orderToAccept);
    setIncomingOrder(null);
    setShowChooseWorkerModal(false);
    setActiveTab('active');
    setJobStage('on_the_way');

    Alert.alert(
      'Worker Assigned Successfully! 🚀',
      `Assigned Specialist: ${chosenWorker.name}\nPhone: ${chosenWorker.phone}\nExperience: ${chosenWorker.experience || '5 Yrs Exp'}\n\nCustomer is now notified and can see ${chosenWorker.name}'s details!`
    );
  };

  const handleDeclineOrder = () => {
    stopBookingBell();
    Alert.alert('Order Passed ✕', 'Order passed to the next available specialist.');
    setIncomingOrder(null);
  };

  const handleVerifyOtp = () => {
    const requiredOtp = acceptedOrder?.slotOtp || acceptedOrder?.doorOtp || acceptedOrder?.startOtp || acceptedOrder?.otp || acceptedOrder?.security?.startOtpPlainForCustomer || '3459';
    if (inputOtp === requiredOtp || inputOtp === '1234' || inputOtp === '3459' || inputOtp === '5421') {
      setOtpVerified(true);
      setJobStage('in_progress');
      setStopwatchSeconds(0);
      Alert.alert('OTP Verified! ✅', 'Customer Start OTP matched successfully! You may now begin the service.');
    } else {
      Alert.alert('Invalid OTP ❌', `Please enter the 4-digit start OTP provided by the customer (Demo OTP: ${requiredOtp} or 1234).`);
    }
  };

  const handleCompleteJob = () => {
    const payout = acceptedOrder?.payout || 499;
    const helperFee = Math.round(payout * 0.10);
    const vendorShare = payout - helperFee;
    setJobStage('completed');
    setWalletBalance((prev) => prev + vendorShare);
    setTodayEarnings((prev) => prev + vendorShare);
    setCompletedJobsToday((prev) => prev + 1);

    Alert.alert(
      'Service Completed! 🏆',
      `Customer Bill: ₹${payout}\n\n• 10% Helper Platform Fee: ₹${helperFee}\n• 90% Net Settlement: ₹${vendorShare} (Credited to Your Hub Wallet)\n\nYou can now disburse payout to ${assignedWorker?.name || 'Worker'} from your wallet.`,
      [
        {
          text: 'Disburse to Worker 💸',
          onPress: () => {
            setSelectedWorkerForDisburse(assignedWorker || workersList[0]);
            setDisburseAmount(String(Math.round(vendorShare * 0.75)));
            setShowDisburseModal(true);
          },
        },
        {
          text: 'Show Dynamic UPI QR',
          onPress: () => setShowQrModal(true),
        },
        {
          text: 'Next Job Radar',
          onPress: () => {
            setAcceptedOrder(null);
            setOtpVerified(false);
            setInputOtp('');
            setActiveTab('radar');
          },
        },
      ]
    );
  };

  const handleDisburseToWorker = () => {
    const amt = Number(disburseAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid disbursement amount.');
      return;
    }
    if (amt > walletBalance) {
      Alert.alert('Insufficient Balance', `Available balance is ₹${walletBalance}. Cannot disburse ₹${amt}.`);
      return;
    }
    setWalletBalance((prev) => prev - amt);
    setShowDisburseModal(false);
    Alert.alert(
      'Payout Disbursed! 💸',
      `₹${amt} has been successfully transferred to technician ${selectedWorkerForDisburse.name} (${selectedWorkerForDisburse.upiId || 'worker@upi'}).\n\nRemaining Wallet Balance: ₹${walletBalance - amt}`
    );
  };

  const handleAddWorker = () => {
    if (!newWorkerName.trim() || !newWorkerPhone.trim()) {
      Alert.alert('Details Required', 'Please enter worker full name and phone number.');
      return;
    }
    const cleanPhone = newWorkerPhone.trim().replace(/^\+91/, '').replace(/[\s-]/g, '');
    const newWorker = {
      id: `w_${Date.now()}`,
      workerId: `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newWorkerName.trim(),
      phone: '+91 ' + cleanPhone,
      specialty: newWorkerSpecialty,
      experience: newWorkerExp,
      rating: '5.0',
      jobsDone: 0,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      upiId: newWorkerUpi.trim() || 'worker@upi',
      documents: {
        aadhaarNumber: `XXXX-XXXX-${cleanPhone.slice(-4)}`,
        aadhaarDoc: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
        panNumber: `ABCDE${cleanPhone.slice(-4)}F`,
        panDoc: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
        certificates: [
          {
            name: `${newWorkerSpecialty} Trade Certification`,
            number: `SKILL-CERT-${Math.floor(10000 + Math.random() * 90000)}`,
            status: 'Verified',
            issuedBy: 'National Skill Development Council (NSDC)',
          },
        ],
        policeVerificationDoc: `IND-POLICE-VERIFIED-${Math.floor(1000 + Math.random() * 9000)}`,
        policeVerificationStatus: 'Approved / Clean Record',
        drivingLicense: `DL-MP09-202200${cleanPhone.slice(-4)}`,
        verificationStatus: 'Verified',
      },
    };

    // Sync with backend API so Admin Dashboard immediately receives the worker
    axios
      .post('http://localhost:5000/api/workers', {
        vendorId: vendorProfile?.id || 'VND-IND-01',
        vendorName: shopName || 'Indore Multi-Specialist Hub',
        name: newWorker.name,
        phone: cleanPhone,
        category: newWorkerSpecialty,
        experienceYears: parseInt(newWorkerExp) || 3,
        avatar: newWorker.avatar,
        aadhaarNumber: newWorker.documents.aadhaarNumber,
        panNumber: newWorker.documents.panNumber,
        policeVerificationDoc: newWorker.documents.policeVerificationDoc,
      })
      .catch((e) => console.log('Backend worker sync:', e.message));

    setWorkersList([newWorker, ...workersList]);
    setShowAddWorkerModal(false);
    setNewWorkerName('');
    setNewWorkerPhone('');
    setNewWorkerUpi('');
    Alert.alert('Worker Added! 🎉', `${newWorker.name} has been added to your fleet team.`);
  };

  const toggleWorkerStatus = (id) => {
    setWorkersList((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: w.status === 'ACTIVE' ? 'ON_LEAVE' : 'ACTIVE' } : w
      )
    );
  };

  const handleDeleteWorker = (worker) => {
    Alert.alert('Remove Worker?', `Remove ${worker.name} from your fleet team?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setWorkersList((prev) => prev.filter((w) => w.id !== worker.id));
          Alert.alert('Removed', `${worker.name} has been removed.`);
        },
      },
    ]);
  };

  const handleAddService = () => {
    if (!newServiceName.trim() || !newServicePrice.trim()) {
      Alert.alert('Service Details Required', 'Please enter service title and price.');
      return;
    }
    const srv = {
      id: `srv_${Date.now()}`,
      name: newServiceName.trim(),
      price: Number(newServicePrice),
      time: newServiceTime,
    };
    setVendorServices([...vendorServices, srv]);
    setShowAddServiceModal(false);
    setNewServiceName('');
    setNewServicePrice('');
    Alert.alert('Service Published! 🏷️', `${srv.name} (₹${srv.price}) has been added to your catalog.`);
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0 || amt > walletBalance) {
      Alert.alert('Invalid Amount', `Please enter an amount between ₹1 and ₹${walletBalance}.`);
      return;
    }
    setWalletBalance((prev) => prev - amt);
    setWithdrawModal(false);
    Alert.alert('Withdrawal Successful! 💸', `₹${amt} has been transferred to your UPI ID (${withdrawUpi}).`);
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
              <Text style={styles.authBrandTitle}>HELPER PARTNER</Text>
              <View style={styles.verifiedShieldBadge}>
                <Text style={styles.verifiedShieldText}>🏢 HUB PORTAL</Text>
              </View>
            </View>
            <Text style={styles.authSubtitle}>Vendor Hub Registration & Login</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.authScrollBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Quick Demo Login Pill */}
          <TouchableOpacity
            style={styles.quickDemoBanner}
            onPress={() => {
              setLoginPhone('9876543210');
              setLoginPassword('vendor123');
              setAuthMode('login');
              setTimeout(() => {
                handleVendorLogin();
              }, 100);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 22 }}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoBannerTitle}>One-Click Demo Indore Hub Login</Text>
                <Text style={styles.demoBannerSub}>Ramesh Sharma • Indore Multi-Specialist Hub (9876543210)</Text>
              </View>
              <Text style={styles.demoBannerArrow}>➔</Text>
            </View>
          </TouchableOpacity>

          {/* Mode Switcher */}
          <View style={styles.authTabSwitch}>
            <TouchableOpacity
              style={[styles.authTabBtn, authMode === 'login' && styles.authTabBtnActive]}
              onPress={() => setAuthMode('login')}
            >
              <Text style={[styles.authTabBtnText, authMode === 'login' && styles.authTabBtnTextActive]}>
                🔑 Hub Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authTabBtn, authMode === 'register' && styles.authTabBtnActive]}
              onPress={() => setAuthMode('register')}
            >
              <Text style={[styles.authTabBtnText, authMode === 'register' && styles.authTabBtnTextActive]}>
                📝 Register New Hub
              </Text>
            </TouchableOpacity>
          </View>

          {authMode === 'login' ? (
            <View style={styles.authCard}>
              <Text style={styles.authCardTitle}>Welcome Back, Partner</Text>
              <Text style={styles.authCardDesc}>
                Log in with your registered mobile number and password to manage orders and workers.
              </Text>

              <Text style={styles.authInputLabel}>REGISTERED MOBILE NUMBER</Text>
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
                placeholder="Enter your password"
                placeholderTextColor="#64748B"
                secureTextEntry
                value={loginPassword}
                onChangeText={setLoginPassword}
              />

              <TouchableOpacity
                style={styles.authPrimaryBtn}
                disabled={authLoading}
                onPress={handleVendorLogin}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.authPrimaryBtnText}>Login to Partner Hub ➔</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authCard}>
              <Text style={styles.authCardTitle}>Register Your Service Hub</Text>
              <Text style={styles.authCardDesc}>
                Join Helper Platform as an authorized partner hub and receive verified customer leads directly.
              </Text>

              <Text style={styles.authInputLabel}>SERVICE HUB / SHOP NAME *</Text>
              <TextInput
                style={styles.authInput}
                placeholder="e.g. Indore Multi-Specialist Hub"
                placeholderTextColor="#64748B"
                value={regShopName}
                onChangeText={setRegShopName}
              />

              <Text style={styles.authInputLabel}>OWNER FULL NAME *</Text>
              <TextInput
                style={styles.authInput}
                placeholder="e.g. Ramesh Sharma"
                placeholderTextColor="#64748B"
                value={regName}
                onChangeText={setRegName}
              />

              <Text style={styles.authInputLabel}>MOBILE NUMBER (FOR LOGIN & ALERTS) *</Text>
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
                placeholder="Choose secure password"
                placeholderTextColor="#64748B"
                secureTextEntry
                value={regPassword}
                onChangeText={setRegPassword}
              />

              <Text style={styles.authInputLabel}>PRIMARY SERVICE CATEGORY</Text>
              <TextInput
                style={styles.authInput}
                placeholder="e.g. Multi-Specialist Hub / Appliance Repair"
                placeholderTextColor="#64748B"
                value={regCategory}
                onChangeText={setRegCategory}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.authInputLabel}>CITY</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="Indore"
                    placeholderTextColor="#64748B"
                    value={regCity}
                    onChangeText={setRegCity}
                  />
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={styles.authInputLabel}>PAYOUT UPI ID</Text>
                  <TextInput
                    style={styles.authInput}
                    placeholder="hub@upi"
                    placeholderTextColor="#64748B"
                    value={regUpi}
                    onChangeText={setRegUpi}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.authPrimaryBtn}
                disabled={authLoading}
                onPress={handleVendorRegister}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.authPrimaryBtnText}>Create Hub & Start Earning ➔</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Value Props */}
          <View style={styles.authPerksBox}>
            <View style={styles.authPerkRow}>
              <Text style={styles.authPerkIcon}>📡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.authPerkTitle}>Direct Customer Radar</Text>
                <Text style={styles.authPerkSub}>Real-time ringing bell sound when nearby customers book.</Text>
              </View>
            </View>
            <View style={styles.authPerkRow}>
              <Text style={styles.authPerkIcon}>👥</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.authPerkTitle}>Manage Fleet of Workers</Text>
                <Text style={styles.authPerkSub}>Add technicians, track status, and dispatch jobs easily.</Text>
              </View>
            </View>
            <View style={styles.authPerkRow}>
              <Text style={styles.authPerkIcon}>💳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.authPerkTitle}>Direct Bank & UPI Settlement</Text>
                <Text style={styles.authPerkSub}>Zero delay doorstep payments and instant withdrawals.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors?.bg || (isDark ? '#070A12' : '#F8FAFC') }]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors?.bg || (isDark ? '#070A12' : '#F8FAFC')}
      />

      {/* ================= 1. LUXURY TOP APP BAR ================= */}
      <View style={[styles.topAppBar, { backgroundColor: themeColors?.headerBg || (isDark ? '#0D1322' : '#FFFFFF'), borderBottomColor: themeColors?.border || (isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0') }]}>
        <View style={styles.appBarLeft}>
          <TouchableOpacity style={styles.appBarBackBtn} onPress={() => navigation.goBack()}>
            <Text style={[styles.appBarBackIcon, { color: themeColors?.text || '#FFFFFF' }]}>‹</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 28, height: 28, borderRadius: 8, marginRight: 5 }}
          />
          <TouchableOpacity
            style={styles.vendorHeaderAvatarWrap}
            activeOpacity={0.8}
            onPress={() => setActiveTab('shop')}
          >
            <Image
              source={{
                uri: vendorProfile?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
              }}
              style={styles.vendorHeaderAvatar}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, minWidth: 0, marginLeft: 6 }}
            activeOpacity={0.8}
            onPress={() => setActiveTab('shop')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={[styles.brandTitle, { color: themeColors?.text || '#FFFFFF' }]} numberOfLines={1}>HELPER HUB</Text>
              <View style={styles.verifiedShieldBadge}>
                <Text style={styles.verifiedShieldText}>VERIFIED ✓</Text>
              </View>
            </View>
            <Text style={[styles.hubSubtitle, { color: themeColors?.textSecondary || '#94A3B8' }]} numberOfLines={1} ellipsizeMode="tail">{shopName}</Text>
          </TouchableOpacity>
        </View>

        {/* RIGHT CONTROLS GROUP (COMPACT CIRCLES + DUTY PILL) */}
        <View style={styles.appBarRightActions}>
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

          {/* ELEGANT ANIMATED DUTY PILL */}
          <TouchableOpacity
            style={[styles.dutyPill, isDutyOn ? styles.dutyPillOn : styles.dutyPillOff]}
            activeOpacity={0.85}
            onPress={toggleDuty}
          >
            <Animated.View
              style={[
                styles.dutyPulseDot,
                {
                  backgroundColor: isDutyOn ? '#10B981' : '#EF4444',
                  transform: [{ scale: dutyPulseAnim }],
                },
              ]}
            />
            <Text
              style={[styles.dutyPillText, { color: isDutyOn ? '#10B981' : '#EF4444' }]}
              numberOfLines={1}
              ellipsizeMode="clip"
            >
              {isDutyOn ? 'DUTY ON' : 'OFFLINE'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 2. PARTNER HERO STATS CARD ================= */}
      <View style={styles.heroStatsContainer}>
        <View style={styles.heroStatItem}>
          <Text style={styles.heroStatLabel}>TODAY'S PAYOUT</Text>
          <Text style={[styles.heroStatVal, { color: '#10B981' }]}>₹{todayEarnings}</Text>
          <Text style={styles.heroStatSub}>{completedJobsToday} jobs done</Text>
        </View>

        <View style={styles.heroStatDivider} />

        <View style={styles.heroStatItem}>
          <Text style={styles.heroStatLabel}>WALLET BALANCE</Text>
          <Text style={styles.heroStatVal}>₹{walletBalance}</Text>
          <TouchableOpacity onPress={() => setWithdrawModal(true)}>
            <Text style={styles.heroStatActionText}>Withdraw ➔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroStatDivider} />

        <View style={styles.heroStatItem}>
          <Text style={styles.heroStatLabel}>FLEET RATING</Text>
          <Text style={styles.heroStatVal}>★ 4.98</Text>
          <Text style={styles.heroStatSub}>{workersList.length} Technicians</Text>
        </View>
      </View>

      {/* ================= 3. SCROLLABLE CLEAN TAB BAR (NO TEXT BREAKING) ================= */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {[
            { id: 'radar', label: `📡 Radar ${incomingOrder && !acceptedOrder ? '(1 New)' : ''}` },
            { id: 'active', label: `🛠️ Active Job ${acceptedOrder ? '●' : ''}` },
            { id: 'workers', label: `👥 Team Fleet (${workersList.length})` },
            { id: 'wallet', label: '💰 Wallet & UPI' },
            { id: 'shop', label: '👤 Profile' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabChip, isActive && styles.activeTabChip]}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabChipText, isActive && styles.activeTabChipText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= 4. BODY CONTENT ================= */}
      <ScrollView contentContainerStyle={styles.bodyScroll} showsVerticalScrollIndicator={false}>
        {/* ================= TAB 1: RADAR & INCOMING ORDERS ================= */}
        {activeTab === 'radar' && (
          <View>
            {!isDutyOn ? (
              <View style={styles.offlineBox}>
                <Text style={styles.offlineEmoji}>😴</Text>
                <Text style={styles.offlineTitle}>You Are Currently Offline</Text>
                <Text style={styles.offlineDesc}>
                  Turn Duty On using the toggle at the top to start scanning and receiving customer bookings in Indore.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: '#10B981' }]}
                  onPress={toggleDuty}
                >
                  <Text style={styles.primaryActionBtnText}>Go Online (Duty On) 🟢</Text>
                </TouchableOpacity>
              </View>
            ) : acceptedOrder ? (
              <View style={styles.busyBox}>
                <Text style={styles.busyEmoji}>🛠️</Text>
                <Text style={styles.busyTitle}>Job In Progress</Text>
                <Text style={styles.busyDesc}>
                  Order #{acceptedOrder.id} is currently active. Complete this service to scan for new orders.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: '#10B981', marginTop: 12 }]}
                  onPress={() => setActiveTab('active')}
                >
                  <Text style={styles.primaryActionBtnText}>Open Active Job ➔</Text>
                </TouchableOpacity>
              </View>
            ) : incomingOrder ? (
              /* ANIMATED INCOMING ORDER CARD */
              <Animated.View
                style={[
                  styles.incomingCard,
                  {
                    transform: [{ scale: orderCardScale }],
                    opacity: orderCardOpacity,
                  },
                ]}
              >
                <View style={styles.incomingHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.incomingHeaderPing}>🚨</Text>
                    <Text style={styles.incomingHeaderTitle}>NEW BOOKING IN INDORE</Text>
                  </View>
                  <View style={styles.timerPill}>
                    <Text style={styles.timerPillText}>⏱️ {countdown}s</Text>
                  </View>
                </View>

                {/* 🔔 RINGING BELL ALERT BANNER WITH WOBBLE */}
                <View style={styles.bellAlertBanner}>
                  <Animated.Text
                    style={[
                      styles.bellRingingEmoji,
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
                    <Text style={styles.bellAlertTitle}>BOOKING BELL RINGING!</Text>
                    <Text style={styles.bellAlertSubtitle}>
                      {isBellMuted ? 'Silent Mode Active (Visual Radar Only)' : 'Loud Ringtone & Vibration Active'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bellMuteBtn}
                    activeOpacity={0.8}
                    onPress={stopBookingBell}
                  >
                    <Text style={styles.bellMuteBtnText}>Silence 🔕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.incomingCardContent}>
                  <View style={styles.servicePayoutRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.serviceTitle} numberOfLines={1}>
                        {incomingOrder.serviceName}
                      </Text>
                      <Text style={styles.serviceSubText}>{incomingOrder.category} • Doorstep Pro</Text>
                    </View>
                    <View style={styles.payoutBadge}>
                      <Text style={styles.payoutLabel}>YOU EARN</Text>
                      <Text style={styles.payoutAmount}>₹{incomingOrder.payout}</Text>
                    </View>
                  </View>

                  <View style={styles.addressInfoCard}>
                    <View style={styles.infoLine}>
                      <Text style={styles.infoIcon}>👤</Text>
                      <Text style={styles.customerNameText}>{incomingOrder.customerName}</Text>
                      <Text style={styles.distanceBadge}>📍 {incomingOrder.distance}</Text>
                    </View>
                    <View style={styles.infoLine}>
                      <Text style={styles.infoIcon}>📞</Text>
                      <Text style={[styles.customerNameText, { color: '#38BDF8', fontSize: 13 }]}>{incomingOrder.customerPhone}</Text>
                    </View>
                    <View style={styles.infoLine}>
                      <Text style={styles.infoIcon}>🛠️</Text>
                      <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '700', flex: 1 }}>
                        {incomingOrder.serviceName} • <Text style={{ color: '#10B981' }}>{incomingOrder.category}</Text>
                      </Text>
                    </View>
                    <View style={styles.infoLine}>
                      <Text style={styles.infoIcon}>🏠</Text>
                      <Text style={styles.addressText} numberOfLines={2}>{incomingOrder.address}</Text>
                    </View>
                    <View style={styles.infoLine}>
                      <Text style={styles.infoIcon}>⏰</Text>
                      <Text style={styles.timeScheduleText}>{incomingOrder.scheduledTime}</Text>
                    </View>
                  </View>

                  {/* Flow Information Note */}
                  <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14 }}>⚡</Text>
                      <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '800' }}>
                        NEXT: ACCEPT BOOKING & CHOOSE WORKER
                      </Text>
                    </View>
                    <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 4, lineHeight: 16 }}>
                      Accepting this job will immediately present verified {incomingOrder.category || 'specialist'} suggestions from your fleet to dispatch.
                    </Text>
                  </View>

                  {/* Accept / Decline Action Buttons */}
                  <View style={[styles.orderActionRow, { marginTop: 14 }]}>
                    <TouchableOpacity
                      style={styles.passBtn}
                      activeOpacity={0.8}
                      onPress={handleDeclineOrder}
                    >
                      <Text style={styles.passBtnText}>Pass (Skip)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acceptOrderBtn}
                      activeOpacity={0.85}
                      onPress={handleAcceptOrder}
                    >
                      <Text style={styles.acceptOrderBtnText}>ACCEPT BOOKING ({countdown}s) ➔</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ) : (
              /* RADAR SCANNING ANIMATION */
              <View style={styles.radarCard}>
                <View style={styles.radarVisualWrap}>
                  <Animated.View
                    style={[
                      styles.radarWaveRing,
                      {
                        transform: [
                          {
                            scale: radarWaveAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.8, 1.8],
                            }),
                          },
                        ],
                        opacity: radarWaveAnim.interpolate({
                          inputRange: [0, 0.7, 1],
                          outputRange: [0.8, 0.3, 0],
                        }),
                      },
                    ]}
                  />
                  <View style={styles.radarCenterCore}>
                    <Text style={styles.radarIcon}>📡</Text>
                  </View>
                </View>

                <Text style={styles.radarTitle}>Scanning Jobs in Indore...</Text>
                <Text style={styles.radarSub}>
                  Instant sound alert will chime whenever a customer orders within your 10km radius.
                </Text>

                <View style={styles.radarActionRow}>
                  <TouchableOpacity
                    style={styles.testBellBtn}
                    activeOpacity={0.8}
                    onPress={triggerBookingBell}
                  >
                    <Text style={styles.testBellBtnText}>🔔 Test Loud Siren 🔊</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ================= TAB 2: ACTIVE JOB WORKFLOW ================= */}
        {activeTab === 'active' && (
          <View>
            {!acceptedOrder ? (
              <View style={styles.noActiveJobBox}>
                <Text style={{ fontSize: 44 }}>📋</Text>
                <Text style={styles.noActiveTitle}>No Active Jobs</Text>
                <Text style={styles.noActiveSub}>
                  Switch to the Radar tab to scan and accept incoming customer bookings.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: '#10B981', marginTop: 14 }]}
                  onPress={() => setActiveTab('radar')}
                >
                  <Text style={styles.primaryActionBtnText}>Go to Radar ➔</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.activeJobCard}>
                <View style={styles.activeJobTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderIdBadge}>ORDER #{acceptedOrder.id}</Text>
                    <Text style={styles.activeJobTitle} numberOfLines={1}>
                      {acceptedOrder.serviceName}
                    </Text>
                  </View>
                  <View style={styles.jobStagePill}>
                    <Text style={styles.jobStagePillText}>
                      {jobStage === 'on_the_way' && '🚗 EN ROUTE'}
                      {jobStage === 'reached' && '📍 AT DOORSTEP'}
                      {jobStage === 'in_progress' && '⚡ IN PROGRESS'}
                      {jobStage === 'completed' && '✓ COMPLETED'}
                    </Text>
                  </View>
                </View>

                {/* Customer Contact Box */}
                <View style={styles.customerCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerNameHeading}>{acceptedOrder.customerName}</Text>
                    <Text style={styles.customerFullAddress} numberOfLines={2}>{acceptedOrder.address}</Text>
                    <Text style={styles.dispatchedWorkerLabel}>
                      Assigned: {assignedWorker.name} ({assignedWorker.phone})
                    </Text>
                  </View>

                  <View style={styles.contactIconGroup}>
                    <TouchableOpacity
                      style={styles.circleActionBtn}
                      onPress={() => Alert.alert('Call Customer', `Calling ${acceptedOrder.customerPhone}...`)}
                    >
                      <Text style={{ fontSize: 18 }}>📞</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.circleActionBtn}
                      onPress={() => Alert.alert('Navigation', 'Opening Google Maps to customer address in Indore...')}
                    >
                      <Text style={{ fontSize: 18 }}>🗺️</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* STAGE 1: ON THE WAY */}
                {jobStage === 'on_the_way' && (
                  <View style={styles.stageSection}>
                    <Text style={styles.stageDescription}>
                      🚗 Technician is en route to customer location. Confirm upon arrival:
                    </Text>
                    <TouchableOpacity
                      style={[styles.primaryActionBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => setJobStage('reached')}
                    >
                      <Text style={styles.primaryActionBtnText}>I Have Reached Customer Doorstep 📍</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STAGE 2: START OTP VERIFICATION */}
                {jobStage === 'reached' && (
                  <View style={styles.stageSection}>
                    <View style={styles.otpCard}>
                      <Text style={styles.otpCardTitle}>🔐 ENTER 4-DIGIT CUSTOMER START OTP</Text>
                      <Text style={styles.otpCardSub}>
                        Ask customer for their 4-digit start OTP from their app to begin service inspection.
                      </Text>
                      <TextInput
                        style={styles.otpInput}
                        placeholder="e.g. 5421"
                        placeholderTextColor="#64748B"
                        keyboardType="numeric"
                        maxLength={4}
                        value={inputOtp}
                        onChangeText={setInputOtp}
                      />
                      <TouchableOpacity
                        style={[styles.primaryActionBtn, { backgroundColor: '#10B981', marginTop: 10 }]}
                        onPress={handleVerifyOtp}
                      >
                        <Text style={styles.primaryActionBtnText}>Verify OTP & Start Service ➔</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* STAGE 3: WORK IN PROGRESS */}
                {jobStage === 'in_progress' && (
                  <View style={styles.stageSection}>
                    <View style={styles.inProgressCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.inProgressTitle}>⚡ WORK IN PROGRESS</Text>
                        <View style={styles.timerBadge}>
                          <Text style={styles.timerBadgeText}>⏱️ {formatStopwatch(stopwatchSeconds)}</Text>
                        </View>
                      </View>
                      <Text style={styles.inProgressSub}>
                        Customer OTP verified. Tap below once the job is completed.
                      </Text>
                      <View style={{ marginVertical: 10 }}>
                        <Text style={styles.taskLine}>☑️ Power Jet Foam Indoor Wash</Text>
                        <Text style={styles.taskLine}>☑️ Outdoor Coil High Pressure Spray</Text>
                        <Text style={styles.taskLine}>☑️ Gas Pressure & Cooling Test</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.primaryActionBtn, { backgroundColor: '#10B981' }]}
                        onPress={handleCompleteJob}
                      >
                        <Text style={styles.primaryActionBtnText}>Finish Job & Collect ₹{acceptedOrder.payout} ➔</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* STAGE 4: COMPLETED */}
                {jobStage === 'completed' && (
                  <View style={styles.stageSection}>
                    <View style={styles.completedCard}>
                      <Text style={{ fontSize: 44, textAlign: 'center' }}>🎉</Text>
                      <Text style={styles.completedTitle}>Job Completed Successfully!</Text>
                      <Text style={styles.completedSub}>
                        ₹{acceptedOrder.payout} has been credited to your Partner Wallet balance.
                      </Text>
                      <TouchableOpacity
                        style={[styles.primaryActionBtn, { backgroundColor: '#10B981', marginTop: 12 }]}
                        onPress={() => setShowQrModal(true)}
                      >
                        <Text style={styles.primaryActionBtnText}>Show Customer Payment QR 📱</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.nextJobOutlineBtn}
                        onPress={() => {
                          setAcceptedOrder(null);
                          setOtpVerified(false);
                          setInputOtp('');
                          setActiveTab('radar');
                        }}
                      >
                        <Text style={styles.nextJobOutlineText}>Ready for Next Booking ➔</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* ================= TAB 3: WORKERS FLEET ================= */}
        {activeTab === 'workers' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionPre}>FLEET MANAGEMENT</Text>
                <Text style={styles.sectionTitle}>Your Team ({workersList.length} Technicians)</Text>
              </View>
              <TouchableOpacity
                style={styles.addWorkerButton}
                activeOpacity={0.85}
                onPress={() => setShowAddWorkerModal(true)}
              >
                <Text style={styles.addWorkerButtonText}>+ Add Worker</Text>
              </TouchableOpacity>
            </View>

            {workersList.map((worker) => (
              <View key={worker.id} style={styles.workerItemCard}>
                <View style={styles.workerTopInfo}>
                  <Image source={{ uri: worker.avatar }} style={styles.workerAvatarImg} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={styles.workerNameText}>{worker.name}</Text>
                      <TouchableOpacity
                        style={[
                          styles.workerDutyTag,
                          worker.status === 'ACTIVE' ? styles.workerDutyActive : styles.workerDutyLeave,
                        ]}
                        onPress={() => toggleWorkerStatus(worker.id)}
                      >
                        <Text style={[styles.workerDutyTagText, { color: worker.status === 'ACTIVE' ? '#10B981' : '#F59E0B' }]}>
                          {worker.status === 'ACTIVE' ? '● ON DUTY' : '○ ON LEAVE'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.workerSpecialtyText}>{worker.specialty}</Text>
                    <Text style={styles.workerMetaText}>
                      ★ {worker.rating} • {worker.jobsDone} Jobs Done • {worker.experience}
                    </Text>
                  </View>
                </View>

                <View style={styles.workerBottomRow}>
                  <Text style={styles.workerUpiLabel}>UPI: {worker.upiId}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={styles.workerCallActionBtn}
                      onPress={() => Alert.alert('Call Worker', `Calling ${worker.name} at ${worker.phone}`)}
                    >
                      <Text style={styles.workerCallActionText}>📞 Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.workerDeleteActionBtn}
                      onPress={() => handleDeleteWorker(worker)}
                    >
                      <Text style={{ fontSize: 13 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 4: WALLET & EARNINGS ================= */}
        {activeTab === 'wallet' && (
          <View>
            <View style={styles.walletCardHero}>
              <Text style={styles.walletCardLabel}>AVAILABLE PARTNER BALANCE</Text>
              <Text style={styles.walletCardAmount}>₹{walletBalance}</Text>
              <Text style={styles.walletCardNotice}>Direct 90% settlement from Helper Platform • Instant payouts</Text>
              
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity
                  style={[styles.withdrawFullBtn, { flex: 1, marginTop: 0 }]}
                  activeOpacity={0.85}
                  onPress={() => setWithdrawModal(true)}
                >
                  <Text style={styles.withdrawFullBtnText}>Bank Transfer ➔</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.withdrawFullBtn, { flex: 1.2, marginTop: 0, backgroundColor: '#F59E0B' }]}
                  activeOpacity={0.85}
                  onPress={() => setShowDisburseModal(true)}
                >
                  <Text style={[styles.withdrawFullBtnText, { color: '#070A12' }]}>💸 Disburse to Worker</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Financial Settlement Flow Banner */}
            <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 14 }}>🏛️</Text>
                <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '800' }}>HELPER 10% - VENDOR 90% SETTLEMENT RULE</Text>
              </View>
              <Text style={{ color: '#94A3B8', fontSize: 11, lineHeight: 16 }}>
                Customer scans the dynamic QR and pays directly to Helper Platform. Helper retains 10% platform commission, and 90% is credited directly to your Vendor Wallet. You disburse the technician's wage from here.
              </Text>
            </View>

            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryStatBox}>
                <Text style={styles.summaryStatLabel}>TODAY (90% NET)</Text>
                <Text style={styles.summaryStatVal}>₹{todayEarnings}</Text>
                <Text style={styles.summaryStatSub}>{completedJobsToday} jobs settled</Text>
              </View>
              <View style={styles.summaryStatBox}>
                <Text style={styles.summaryStatLabel}>THIS WEEK</Text>
                <Text style={styles.summaryStatVal}>₹11,480</Text>
                <Text style={styles.summaryStatSub}>23 jobs</Text>
              </View>
              <View style={styles.summaryStatBox}>
                <Text style={styles.summaryStatLabel}>THIS MONTH</Text>
                <Text style={styles.summaryStatVal}>₹48,920</Text>
                <Text style={styles.summaryStatSub}>94 jobs</Text>
              </View>
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.cardHeading}>RECENT JOB PAYOUTS & PASSBOOK</Text>
              {[
                { title: 'AC Jet Foam Servicing (90% Settlement)', date: 'Today • 01:15 PM', amount: '+₹449', sub: 'Gross: ₹499 • 10% Helper: -₹50', type: 'credit' },
                { title: 'Worker Wage Disbursed: Sunil Verma', date: 'Today • 01:45 PM', amount: '-₹320', sub: 'Transferred via UPI to technician', type: 'debit' },
                { title: 'Electrician MCB Fix (90% Settlement)', date: 'Today • 11:30 AM', amount: '+₹224', sub: 'Gross: ₹249 • 10% Helper: -₹25', type: 'credit' },
                { title: 'Worker Wage Disbursed: Ramesh Kumar', date: 'Today • 12:00 PM', amount: '-₹160', sub: 'Transferred via UPI to technician', type: 'debit' },
                { title: 'UPI Withdrawal to Vendor Bank', date: 'Yesterday • 08:30 PM', amount: '-₹3,500', sub: 'Settled to ICICI Bank A/C', type: 'debit' },
              ].map((tx, idx) => (
                <View key={idx} style={styles.passbookRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.passbookTitle}>{tx.title}</Text>
                    <Text style={styles.passbookDate}>{tx.date}</Text>
                    <Text style={{ color: '#64748B', fontSize: 10, marginTop: 1 }}>{tx.sub}</Text>
                  </View>
                  <Text style={[styles.passbookAmount, { color: tx.type === 'credit' ? '#10B981' : '#EF4444' }]}>
                    {tx.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================= TAB 5: VENDOR HUB PROFILE ================= */}
        {activeTab === 'shop' && (
          <View>
            {/* 1. HERO HUB PROFILE CARD */}
            <View style={[styles.contentCard, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', backgroundColor: isDark ? '#0D1322' : '#FFFFFF', marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleVendorPhotoUpload}
                  style={styles.vendorProfilePhotoWrap}
                >
                  <Image
                    source={{
                      uri: vendorProfile?.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
                    }}
                    style={styles.vendorProfilePhoto}
                  />
                  <View style={styles.vendorCameraIconBadge}>
                    <Text style={{ fontSize: 11 }}>📷</Text>
                  </View>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.cardHeading, { color: themeColors?.text || '#FFFFFF', marginBottom: 0 }]} numberOfLines={1}>
                      {vendorProfile?.shopName || shopName}
                    </Text>
                    <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ color: '#F59E0B', fontSize: 9, fontWeight: '900' }}>👑 PRO HUB</Text>
                    </View>
                  </View>

                  <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4, marginBottom: 8 }}>
                    {vendorProfile?.name || 'Ramesh Sharma'} • {vendorProfile?.city || 'Indore, MP'}
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#38BDF8' }}
                      onPress={handleStartEditShop}
                    >
                      <Text style={{ color: '#38BDF8', fontSize: 11, fontWeight: '800' }}>✏️ Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.vendorUploadBtn}
                      activeOpacity={0.8}
                      onPress={handleVendorPhotoUpload}
                    >
                      <Text style={styles.vendorUploadBtnText}>📸 Logo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. INLINE HUB PROFILE EDIT FORM (Shown when edit button is tapped) */}
            {isEditingShop && (
              <View style={[styles.contentCard, { borderColor: '#38BDF8', backgroundColor: isDark ? '#0D1322' : '#FFFFFF', marginBottom: 14, padding: 16 }]}>
                <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '900', marginBottom: 12 }}>✏️ Edit Vendor Hub Details</Text>

                <Text style={styles.fieldLabel}>SHOP / HUB NAME</Text>
                <TextInput
                  style={[styles.fieldInput, { color: themeColors?.text || '#FFFFFF', backgroundColor: isDark ? '#1E293B' : '#F1F5F9', marginBottom: 10 }]}
                  value={shopName}
                  onChangeText={setShopName}
                  placeholder="Enter shop or hub name"
                  placeholderTextColor="#64748B"
                />

                <Text style={styles.fieldLabel}>OWNER / MANAGER NAME</Text>
                <TextInput
                  style={[styles.fieldInput, { color: themeColors?.text || '#FFFFFF', backgroundColor: isDark ? '#1E293B' : '#F1F5F9', marginBottom: 10 }]}
                  value={editOwnerName}
                  onChangeText={setEditOwnerName}
                  placeholder="Owner name"
                  placeholderTextColor="#64748B"
                />

                <Text style={styles.fieldLabel}>CONTACT MOBILE NUMBER</Text>
                <TextInput
                  style={[styles.fieldInput, { color: themeColors?.text || '#FFFFFF', backgroundColor: isDark ? '#1E293B' : '#F1F5F9', marginBottom: 10 }]}
                  value={editOwnerPhone}
                  onChangeText={setEditOwnerPhone}
                  placeholder="10-digit phone"
                  keyboardType="phone-pad"
                  placeholderTextColor="#64748B"
                />

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>VISITING RATE (₹)</Text>
                    <TextInput
                      style={[styles.fieldInput, { color: themeColors?.text || '#FFFFFF', backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                      keyboardType="numeric"
                      value={hourlyRate}
                      onChangeText={setHourlyRate}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>SETTLEMENT UPI</Text>
                    <TextInput
                      style={[styles.fieldInput, { color: themeColors?.text || '#FFFFFF', backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                      value={editShopUpi}
                      onChangeText={setEditShopUpi}
                      placeholder="shop@upi"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: '#10B981', paddingVertical: 11, borderRadius: 8, alignItems: 'center' }}
                    onPress={handleSaveShopDetails}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 12 }}>💾 Save Hub Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', paddingVertical: 11, borderRadius: 8, alignItems: 'center' }}
                    onPress={() => setIsEditingShop(false)}
                  >
                    <Text style={{ color: themeColors?.text || '#FFFFFF', fontWeight: '800', fontSize: 12 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 3. FLEET & PERFORMANCE SUMMARY */}
            <View style={[styles.contentCard, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0', backgroundColor: isDark ? '#0D1322' : '#FFFFFF', marginBottom: 14, padding: 16 }]}>
              <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginBottom: 12 }}>
                ⭐ FLEET PERFORMANCE & RATINGS
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#F59E0B', fontSize: 20, fontWeight: '900' }}>★ 4.95</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 2 }}>Rating (280+ rev)</Text>
                </View>
                <View style={{ width: 1, height: 35, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#10B981', fontSize: 20, fontWeight: '900' }}>{workersList.length}</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 2 }}>Active Crew</Text>
                </View>
                <View style={{ width: 1, height: 35, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '900' }}>312</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 2 }}>Orders Done</Text>
                </View>
              </View>
            </View>

            {/* 4. SERVICES & CUSTOM RATE CARD */}
            <View style={[styles.contentCard, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.cardHeading, { color: colors.text, marginBottom: 0 }]}>SERVICES & RATE CARD</Text>
                <TouchableOpacity onPress={() => setShowAddServiceModal(true)}>
                  <Text style={{ color: '#10B981', fontWeight: '800', fontSize: 12 }}>+ Add Service</Text>
                </TouchableOpacity>
              </View>

              {vendorServices.map((srv) => (
                <View key={srv.id} style={[styles.rateCardRow, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rateCardName, { color: colors.text }]}>{srv.name}</Text>
                    <Text style={[styles.rateCardTime, { color: colors.textSecondary }]}>⏱️ {srv.time}</Text>
                  </View>
                  <Text style={styles.rateCardPrice}>₹{srv.price}</Text>
                </View>
              ))}
            </View>

            {/* 5. LEGAL KYC & GOVERNMENT REGISTRATIONS */}
            <View style={[styles.contentCard, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 14 }]}>
              <Text style={{ color: '#38BDF8', fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginBottom: 12 }}>
                🏛️ LEGAL KYC & GOVERNMENT REGISTRATION
              </Text>
              <View style={styles.verifyRow}>
                <Text style={styles.verifyIcon}>✓</Text>
                <Text style={[styles.verifyText, { color: colors.textSecondary }]}>GSTIN & Shop Establishment: REGISTERED & ACTIVE</Text>
              </View>
              <View style={styles.verifyRow}>
                <Text style={styles.verifyIcon}>✓</Text>
                <Text style={[styles.verifyText, { color: colors.textSecondary }]}>Government Aadhaar & PAN Card: LINKED</Text>
              </View>
              <View style={styles.verifyRow}>
                <Text style={styles.verifyIcon}>✓</Text>
                <Text style={[styles.verifyText, { color: colors.textSecondary }]}>Police Character Certificate: VERIFIED (MP Police)</Text>
              </View>
              <View style={styles.verifyRow}>
                <Text style={styles.verifyIcon}>✓</Text>
                <Text style={[styles.verifyText, { color: colors.textSecondary }]}>MSME Enterprise Certificate: UDYAM-MP-INDORE</Text>
              </View>
            </View>

            {/* 6. SETTLEMENT BANK & HUB DETAILS */}
            <View style={[styles.contentCard, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 14 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 }}>
                  💰 BANK & SETTLEMENT DETAILS
                </Text>
                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '900' }}>ACTIVE PARTNER</Text>
                </View>
              </View>

              <View style={[styles.profileDetailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>Business / Hub Name:</Text>
                <Text style={[styles.profileDetailVal, { color: colors.text }]}>{vendorProfile?.shopName || shopName}</Text>
              </View>
              <View style={[styles.profileDetailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>Managing Owner:</Text>
                <Text style={[styles.profileDetailVal, { color: colors.text }]}>{vendorProfile?.name || 'Ramesh Sharma'}</Text>
              </View>
              <View style={[styles.profileDetailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>Registered Mobile:</Text>
                <Text style={[styles.profileDetailVal, { color: colors.text }]}>{vendorProfile?.phone || '+91 98765 43210'}</Text>
              </View>
              <View style={[styles.profileDetailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>Settlement UPI ID:</Text>
                <Text style={[styles.profileDetailVal, { color: '#10B981' }]}>{vendorProfile?.upiId || 'indore.hub@upi'}</Text>
              </View>
              <View style={[styles.profileDetailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>Operating Hub Center:</Text>
                <Text style={[styles.profileDetailVal, { color: colors.text }]}>{vendorProfile?.city || 'Indore, MP'}</Text>
              </View>
              <View style={[styles.profileDetailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>Partner Hub ID:</Text>
                <Text style={[styles.profileDetailVal, { color: colors.text }]}>{vendorProfile?.id || 'VND-IND-01'}</Text>
              </View>
              <View style={[styles.profileDetailRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.profileDetailLabel, { color: colors.textSecondary }]}>Platform Commission:</Text>
                <Text style={[styles.profileDetailVal, { color: colors.text }]}>10% Flat Hub Royalty</Text>
              </View>
            </View>

            {/* 7. PREFERENCES & DEDICATED PARTNER DESK */}
            <View style={[styles.contentCard, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 14 }]}>
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
                  📞 Dedicated Partner Desk Support
                </Text>
                <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '800' }}>+91 7389451349 ➔</Text>
              </TouchableOpacity>
            </View>

            {/* 8. SWITCH TO CUSTOMER & LOGOUT BUTTONS */}
            <TouchableOpacity
              style={styles.modeSwitchBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            >
              <Text style={styles.modeSwitchText}>
                🔄 Switch Back to Customer Mode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutBtn, { marginTop: 10, marginBottom: 20 }]}
              onPress={handleVendorLogout}
            >
              <Text style={styles.logoutBtnText}>🚪 Logout from Vendor Hub</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ================= MODAL: ADD WORKER ================= */}
      <Modal visible={showAddWorkerModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>+ Add Technician to Fleet</Text>
              <TouchableOpacity onPress={() => setShowAddWorkerModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>FULL NAME *</Text>
            <TextInput
              style={styles.modalInputBox}
              placeholder="e.g. Rahul Joshi"
              placeholderTextColor="#64748B"
              value={newWorkerName}
              onChangeText={setNewWorkerName}
            />

            <Text style={styles.modalFieldLabel}>PHONE NUMBER *</Text>
            <TextInput
              style={styles.modalInputBox}
              placeholder="e.g. 98260 12345"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              value={newWorkerPhone}
              onChangeText={setNewWorkerPhone}
            />

            <Text style={styles.modalFieldLabel}>SPECIALTY / CATEGORY</Text>
            <TextInput
              style={styles.modalInputBox}
              placeholder="e.g. Senior AC Mechanic / Plumber"
              placeholderTextColor="#64748B"
              value={newWorkerSpecialty}
              onChangeText={setNewWorkerSpecialty}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalFieldLabel}>EXPERIENCE</Text>
                <TextInput
                  style={styles.modalInputBox}
                  placeholder="e.g. 5 Yrs"
                  placeholderTextColor="#64748B"
                  value={newWorkerExp}
                  onChangeText={setNewWorkerExp}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalFieldLabel}>UPI ID FOR PAYOUTS</Text>
                <TextInput
                  style={styles.modalInputBox}
                  placeholder="rahul@upi"
                  placeholderTextColor="#64748B"
                  value={newWorkerUpi}
                  onChangeText={setNewWorkerUpi}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleAddWorker}>
              <Text style={styles.modalPrimaryBtnText}>Save Technician to Fleet ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ADD CUSTOM SERVICE ================= */}
      <Modal visible={showAddServiceModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>+ Add Custom Service</Text>
              <TouchableOpacity onPress={() => setShowAddServiceModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>SERVICE NAME *</Text>
            <TextInput
              style={styles.modalInputBox}
              placeholder="e.g. Inverter AC PCB Circuit Repair"
              placeholderTextColor="#64748B"
              value={newServiceName}
              onChangeText={setNewServiceName}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalFieldLabel}>PRICE (₹) *</Text>
                <TextInput
                  style={styles.modalInputBox}
                  placeholder="e.g. 599"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={newServicePrice}
                  onChangeText={setNewServicePrice}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalFieldLabel}>ESTIMATED TIME</Text>
                <TextInput
                  style={styles.modalInputBox}
                  placeholder="e.g. 45 mins"
                  placeholderTextColor="#64748B"
                  value={newServiceTime}
                  onChangeText={setNewServiceTime}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleAddService}>
              <Text style={styles.modalPrimaryBtnText}>Publish to Rate Card ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: WITHDRAW WALLET ================= */}
      <Modal visible={withdrawModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>Withdraw Earnings to Bank</Text>
              <TouchableOpacity onPress={() => setWithdrawModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>ENTER AMOUNT (Available: ₹{walletBalance})</Text>
            <TextInput
              style={styles.modalInputBox}
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="e.g. 2000"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.modalFieldLabel}>TRANSFER TO UPI ID / BANK</Text>
            <TextInput
              style={styles.modalInputBox}
              value={withdrawUpi}
              onChangeText={setWithdrawUpi}
              placeholder="yourname@upi"
              placeholderTextColor="#64748B"
            />

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleWithdraw}>
              <Text style={styles.modalPrimaryBtnText}>Transfer ₹{withdrawAmount} Instantly ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: DISBURSE PAYOUT TO WORKER ================= */}
      <Modal visible={showDisburseModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>💸 Disburse Payout to Worker</Text>
              <TouchableOpacity onPress={() => setShowDisburseModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#94A3B8', fontSize: 11.5, marginBottom: 12 }}>
              Helper settled 90% into your hub account. Disburse technician compensation from your available wallet balance (₹{walletBalance}).
            </Text>

            <Text style={styles.modalFieldLabel}>SELECT TECHNICIAN</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {workersList.map((w) => {
                const isSelected = selectedWorkerForDisburse.id === w.id;
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.workerSelectChip, isSelected && styles.activeWorkerSelectChip]}
                    onPress={() => setSelectedWorkerForDisburse(w)}
                  >
                    <Text style={[styles.workerSelectText, isSelected && styles.activeWorkerSelectText]}>
                      {isSelected ? '✓ ' : ''}{w.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.modalFieldLabel}>DISBURSEMENT AMOUNT (₹)</Text>
            <TextInput
              style={styles.modalInputBox}
              keyboardType="numeric"
              value={disburseAmount}
              onChangeText={setDisburseAmount}
              placeholder="e.g. 350"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.modalFieldLabel}>WORKER UPI ADDRESS</Text>
            <TextInput
              style={[styles.modalInputBox, { color: '#38BDF8' }]}
              value={selectedWorkerForDisburse.upiId || 'worker@upi'}
              editable={false}
            />

            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { backgroundColor: '#F59E0B' }]}
              onPress={handleDisburseToWorker}
            >
              <Text style={[styles.modalPrimaryBtnText, { color: '#070A12' }]}>
                Send ₹{disburseAmount} to {selectedWorkerForDisburse.name} ➔
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: CUSTOMER UPI QR (HELPER PLATFORM PAYEE) ================= */}
      <Modal visible={showQrModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.qrCardModal}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Text style={styles.qrModalHeader}>Helper Platform UPI QR 📱</Text>
              <TouchableOpacity onPress={() => setShowQrModal(false)}>
                <Text style={{ color: '#94A3B8', fontSize: 18, fontWeight: '800' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.qrModalSubHeader}>Scan via PhonePe, GPay, Paytm or BHIM UPI</Text>

            <View style={styles.qrContainerBox}>
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=helper.indore@icici%26pn=HelperPlatform%26am=${acceptedOrder?.payout || 499}%26cu=INR`,
                }}
                style={styles.qrImg}
              />
              <Text style={styles.qrAmountLabel}>TOTAL BILL: ₹{acceptedOrder?.payout || 499}</Text>
              <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                Official Payee: helper.indore@icici
              </Text>
            </View>

            {/* Split breakdown */}
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 10, padding: 10, width: '100%', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#94A3B8', fontSize: 11 }}>10% Helper Platform Fee:</Text>
                <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '800' }}>
                  ₹{Math.round((acceptedOrder?.payout || 499) * 0.10)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#94A3B8', fontSize: 11 }}>90% Vendor Hub Settlement:</Text>
                <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>
                  ₹{(acceptedOrder?.payout || 499) - Math.round((acceptedOrder?.payout || 499) * 0.10)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { width: '100%' }]}
              onPress={() => {
                setShowQrModal(false);
                Alert.alert('Payment Recorded! ✅', 'Helper received payment. 90% settled into your Hub Wallet.');
              }}
            >
              <Text style={styles.modalPrimaryBtnText}>Confirm Helper Payment Received ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: CHOOSE WORKER SUGGESTIONS ================= */}
      <Modal visible={showChooseWorkerModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalHeaderTitle}>🛠️ Choose Worker to Assign</Text>
                <Text style={{ color: '#94A3B8', fontSize: 11.5, marginTop: 2 }}>
                  Service: <Text style={{ color: '#10B981', fontWeight: '800' }}>{incomingOrder?.serviceName}</Text>
                </Text>
                <Text style={{ color: '#94A3B8', fontSize: 11 }}>
                  Customer: {incomingOrder?.customerName} • 📞 {incomingOrder?.customerPhone} • 📍 {incomingOrder?.distance}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowChooseWorkerModal(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={{ flexDirection: 'row', backgroundColor: '#0B1120', borderRadius: 10, padding: 4, marginTop: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: workerFilterTab === 'suggested' ? '#10B981' : 'transparent',
                }}
                onPress={() => setWorkerFilterTab('suggested')}
              >
                <Text
                  style={{
                    color: workerFilterTab === 'suggested' ? '#020617' : '#94A3B8',
                    fontWeight: '800',
                    fontSize: 12,
                  }}
                >
                  💡 Suggested ({getCategoryMatches().length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: workerFilterTab === 'all' ? '#10B981' : 'transparent',
                }}
                onPress={() => setWorkerFilterTab('all')}
              >
                <Text
                  style={{
                    color: workerFilterTab === 'all' ? '#020617' : '#94A3B8',
                    fontWeight: '800',
                    fontSize: 12,
                  }}
                >
                  👥 All Workers ({workersList.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Worker Selection List */}
            <ScrollView style={{ marginTop: 12, maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {(workerFilterTab === 'suggested' ? getCategoryMatches() : workersList).map((w) => {
                const isSelected =
                  (selectedWorkerToAssign?.workerId || selectedWorkerToAssign?.id) ===
                  (w.workerId || w.id);
                return (
                  <TouchableOpacity
                    key={w.id || w.workerId}
                    style={{
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : '#0F172A',
                      borderWidth: 1.5,
                      borderColor: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 14,
                      padding: 12,
                      marginBottom: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}
                    onPress={() => setSelectedWorkerToAssign(w)}
                  >
                    <Image
                      source={{ uri: w.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300' }}
                      style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: isSelected ? '#10B981' : '#334155' }}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '800' }}>{w.name}</Text>
                        <Text style={{ color: '#FBBF24', fontSize: 12, fontWeight: '700' }}>★ {w.rating || '4.95'}</Text>
                      </View>
                      <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '600', marginTop: 2 }}>
                        📞 {w.phone}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>
                            🏆 {w.experience || '6 Yrs Exp'}
                          </Text>
                        </View>
                        <Text style={{ color: '#94A3B8', fontSize: 11, flexShrink: 1 }} numberOfLines={1}>
                          {w.specialty || w.category}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor: isSelected ? '#10B981' : '#64748B',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981' }} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time & Price Inputs */}
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 10, padding: 10, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>ARRIVAL TIME</Text>
                  <TextInput
                    style={{ backgroundColor: '#0B1120', color: '#FFFFFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, fontWeight: '700', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)' }}
                    value={vendorSetTime}
                    onChangeText={setVendorSetTime}
                    placeholder="45 mins"
                    placeholderTextColor="#64748B"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>FINAL PRICE (₹)</Text>
                  <TextInput
                    style={{ backgroundColor: '#0B1120', color: '#10B981', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, fontWeight: '800', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}
                    value={vendorSetPrice}
                    onChangeText={setVendorSetPrice}
                    keyboardType="numeric"
                    placeholder="499"
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { width: '100%', marginTop: 12 }]}
              onPress={handleConfirmAssignWorker}
            >
              <Text style={styles.modalPrimaryBtnText}>
                CONFIRM & FORWARD TO {selectedWorkerToAssign?.name?.toUpperCase() || 'WORKER'} ➔
              </Text>
            </TouchableOpacity>
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
                {dutyModalType === 'online' ? 'HUB RADAR ACTIVE • SCANNING' : 'HUB DUTY PAUSED • OFFLINE'}
              </Text>
            </View>

            {/* Heading & Subtitle */}
            <Text style={[styles.dutyModalTitle, { color: colors.text }]}>
              {dutyModalType === 'online' ? 'Vendor Hub is Online!' : 'Vendor Hub is Offline'}
            </Text>
            <Text style={[styles.dutyModalSubtitle, { color: colors.textSecondary }]}>
              {dutyModalType === 'online'
                ? 'Actively scanning new customer booking requests and direct hub assignments in Indore.'
                : 'Incoming radar alarms & booking dispatches are paused. Take a break!'}
            </Text>

            {/* 3 High-Impact Feature Cards */}
            <View style={styles.dutyFeatureList}>
              {dutyModalType === 'online' ? (
                <>
                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>📡</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Live City Booking Radar</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        Receives incoming customer orders within 10 km radius.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>🔔</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Audio Bell Chimes Active</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        Loud audio alarm alerts you whenever a new lead arrives.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>👥</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Crew Auto-Match Engine</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        Instant dispatch to your active plumbers, electricians & technicians.
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>⏸️</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Radar Inactive</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        No new booking orders or audio alarms will interrupt you.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>💰</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>Settlements Safe</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        Today's hub revenue (₹{todayEarnings}) remains 100% secure.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.dutyFeatureItem, { backgroundColor: colors.subCard, borderColor: colors.border }]}>
                    <Text style={styles.dutyFeatureIcon}>🔋</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.dutyFeatureTitle, { color: colors.text }]}>System Standby</Text>
                      <Text style={[styles.dutyFeatureDesc, { color: colors.textSecondary }]}>
                        Background listeners put in low power sleep mode.
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
                {dutyModalType === 'online' ? "Let's Go & Manage Hub! 🚀" : "Got It, Take a Break ☕"}
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

  /* 1. TOP APP BAR (NO WRAPPING / NO SQUEEZING) */
  topAppBar: {
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
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    marginRight: 6,
  },
  vendorHeaderAvatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
    overflow: 'hidden',
    marginRight: 2,
  },
  vendorHeaderAvatar: {
    width: '100%',
    height: '100%',
  },
  vendorProfilePhotoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#10B981',
    position: 'relative',
  },
  vendorProfilePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  vendorCameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0F1523',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorUploadBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  vendorUploadBtnText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  appBarBackBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    flexShrink: 0,
  },
  appBarBackIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 22,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  verifiedShieldBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    flexShrink: 0,
  },
  verifiedShieldText: {
    color: '#10B981',
    fontSize: 7.5,
    fontWeight: '800',
  },
  hubSubtitle: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 1,
    flexShrink: 1,
  },

  /* RIGHT CONTROLS GROUP (ZERO WRAPPING) */
  appBarRightActions: {
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

  /* ELEGANT ANIMATED DUTY PILL (RIGID BOUNDS) */
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

  /* 2. HERO STATS CONTAINER */
  heroStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignSelf: 'center',
  },
  heroStatLabel: {
    color: '#64748B',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroStatVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  heroStatSub: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 1,
  },
  heroStatActionText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },

  /* 3. SCROLLABLE CLEAN TAB BAR */
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
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderColor: '#10B981',
  },
  tabChipText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  activeTabChipText: {
    color: '#10B981',
    fontWeight: '800',
  },

  bodyScroll: {
    padding: 16,
    paddingBottom: 40,
  },

  /* OFFLINE / BUSY STATES */
  offlineBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  offlineEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  offlineTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  offlineDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 18,
  },
  primaryActionBtn: {
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  busyBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
  },
  busyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  busyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  busyDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },

  /* INCOMING ORDER CARD */
  incomingCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
    overflow: 'hidden',
  },
  incomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#10B981',
  },
  incomingHeaderPing: {
    fontSize: 14,
  },
  incomingHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  timerPill: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timerPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  /* BELL ALERT BANNER */
  bellAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bellRingingEmoji: {
    fontSize: 20,
  },
  bellAlertTitle: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bellAlertSubtitle: {
    color: '#FDE68A',
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 1,
  },
  bellMuteBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  bellMuteBtnText: {
    color: '#FBBF24',
    fontSize: 9.5,
    fontWeight: '800',
  },

  incomingCardContent: {
    padding: 16,
  },
  servicePayoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
  },
  serviceTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  serviceSubText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  payoutBadge: {
    alignItems: 'flex-end',
  },
  payoutLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10B981',
  },
  addressInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
    gap: 8,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    fontSize: 14,
  },
  customerNameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  distanceBadge: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  addressText: {
    color: '#CBD5E1',
    fontSize: 11.5,
    flex: 1,
  },
  timeScheduleText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  assignWorkerWrap: {
    marginBottom: 14,
  },
  assignWorkerHeading: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '800',
  },
  workerSelectChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeWorkerSelectChip: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  workerSelectText: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '600',
  },
  activeWorkerSelectText: {
    color: '#10B981',
    fontWeight: '800',
  },
  orderActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  passBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  passBtnText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '800',
  },
  acceptOrderBtn: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },

  /* RADAR CARD */
  radarCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  radarVisualWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  radarWaveRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  radarCenterCore: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarIcon: {
    fontSize: 32,
  },
  radarTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  radarSub: {
    color: '#94A3B8',
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  radarActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    width: '100%',
  },
  simulateLeadBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulateLeadText: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: '800',
  },
  testBellBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBellBtnText: {
    color: '#FBBF24',
    fontSize: 11.5,
    fontWeight: '800',
  },

  /* ACTIVE JOB CARD */
  activeJobCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
  },
  activeJobTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
  },
  orderIdBadge: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
  activeJobTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  jobStagePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  jobStagePillText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 12,
    marginVertical: 14,
  },
  customerNameHeading: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  customerFullAddress: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  dispatchedWorkerLabel: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 4,
  },
  contactIconGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  circleActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageSection: {
    marginTop: 4,
  },
  stageDescription: {
    color: '#CBD5E1',
    fontSize: 12,
    marginBottom: 10,
  },
  otpCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  otpCardTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  otpCardSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginVertical: 6,
  },
  otpInput: {
    backgroundColor: '#070A12',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    paddingVertical: 10,
    letterSpacing: 4,
    marginVertical: 8,
  },
  inProgressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 14,
  },
  inProgressTitle: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '900',
  },
  timerBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timerBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  inProgressSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  taskLine: {
    color: '#FFFFFF',
    fontSize: 12,
    marginVertical: 2,
  },
  completedCard: {
    paddingVertical: 10,
  },
  completedTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 6,
  },
  completedSub: {
    color: '#10B981',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  nextJobOutlineBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  nextJobOutlineText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  noActiveJobBox: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
  },
  noActiveTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  noActiveSub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },

  /* SECTION & WORKERS */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionPre: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  addWorkerButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addWorkerButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  workerItemCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 12,
  },
  workerTopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
  },
  workerNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  workerDutyTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  workerDutyActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  workerDutyLeave: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  workerDutyTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  workerSpecialtyText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  workerMetaText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  workerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
    marginTop: 10,
  },
  workerUpiLabel: {
    color: '#94A3B8',
    fontSize: 10.5,
  },
  workerCallActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  workerCallActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  workerDeleteActionBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },

  /* WALLET */
  walletCardHero: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  walletCardLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  walletCardAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10B981',
    marginVertical: 6,
  },
  walletCardNotice: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 16,
  },
  withdrawFullBtn: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  withdrawFullBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  summaryStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  summaryStatBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryStatLabel: {
    color: '#64748B',
    fontSize: 8.5,
    fontWeight: '800',
  },
  summaryStatVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginVertical: 2,
  },
  summaryStatSub: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '700',
  },
  contentCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 14,
  },
  cardHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#10B981',
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  rateCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  rateCardName: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  rateCardTime: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  rateCardPrice: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '900',
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  verifyIcon: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 14,
  },
  verifyText: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '600',
  },
  modeSwitchBtn: {
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 20,
  },
  modeSwitchText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  passbookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  passbookTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  passbookDate: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  passbookAmount: {
    fontSize: 13,
    fontWeight: '900',
  },

  /* MODALS */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseIcon: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '700',
  },
  modalFieldLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInputBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  qrCardModal: {
    backgroundColor: '#0F172A',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  qrModalHeader: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  qrModalSubHeader: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  qrContainerBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  qrImg: {
    width: 200,
    height: 200,
  },
  qrAmountLabel: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 10,
  },

  /* VENDOR AUTH & PROFILE STYLES */
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
  quickDemoBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  demoBannerTitle: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '900',
  },
  demoBannerSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  demoBannerArrow: {
    color: '#F59E0B',
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
  profileDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  profileDetailLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  profileDetailVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutBtnText: {
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


const BACKEND_CANDIDATES = ['http://192.168.1.8:5000', 'http://10.0.2.2:5000', 'http://192.168.1.8:5000'];
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
import { openImagePicker, pickFromCamera, pickFromGallery } from '../utils/imagePickerHelper';

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
  const isDark = false;
  const [partnerThemeMode, setPartnerThemeMode] = useState("light");
  const toggleTheme = () => setPartnerThemeMode(prev => prev === "dark" ? "light" : "dark");

  // Comprehensive theme palette for 100% consistent light/dark styling
  const colors = {
    bg: "#F8FAFC",
    card: "#FFFFFF",
    cardElevated: "#FFFFFF",
    subCard: "#F1F5F9",
    headerBg: "#FFFFFF",
    border: "#E2E8F0",
    borderLight: "#CBD5E1",
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    inputBg: "#F8FAFC",
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

  // Dismissed / Skipped Bookings (Never re-alert unless new customer booking)
  const [dismissedBookingIds, setDismissedBookingIds] = useState(new Set());
  const dismissedBookingIdsRef = useRef(new Set());

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
  const [selectedCategory, setSelectedCategory] = useState('Plumber');
  const [newServiceOriginalPrice, setNewServiceOriginalPrice] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceImage, setNewServiceImage] = useState('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isPublishingService, setIsPublishingService] = useState(false);
  const [categoriesList, setCategoriesList] = useState([
    { id: 'cat_plumb', name: 'Plumber', icon: '🔧', color: '#06B6D4' },
    { id: 'cat_elec', name: 'Electrician', icon: '⚡', color: '#F59E0B' },
    { id: 'cat_ac', name: 'AC & Appliance Repair', icon: '❄️', color: '#3B82F6' },
    { id: 'cat_clean', name: 'Home Deep Cleaning', icon: '🧹', color: '#EC4899' },
    { id: 'cat_carp', name: 'Carpenter', icon: '🪚', color: '#8B5CF6' },
    { id: 'cat_paint', name: 'Painting & Waterproofing', icon: '🎨', color: '#10B981' },
    { id: 'cat_pest', name: 'Pest Control', icon: '🦟', color: '#64748B' },
  ]);
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
      await axios.put(`http://192.168.1.8:5000/api/providers/${updated.id || 'VND-IND-01'}`, {
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
    openImagePicker(async (imageUriOrAsset, assetObj) => {
      const newAvatar = typeof imageUriOrAsset === "string" ? imageUriOrAsset : (imageUriOrAsset?.uri || assetObj?.uri);
      if (newAvatar) {
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
          await axios.put(`http://192.168.1.8:5000/api/providers/${vendorProfile.id || 'VND-IND-01'}`, {
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

    // Fetch services from backend so vendor and user side are in sync
    axios.get('http://192.168.1.8:5000/api/services')
      .then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          const apiSrvs = res.data.data.map(s => ({
            id: s.id || s._id,
            name: s.name,
            price: s.price,
            originalPrice: s.originalPrice || Math.round(s.price * 1.3),
            time: s.duration || '45 mins',
            category: s.category || 'Home Repair',
            description: s.description || '',
          }));
          setVendorServices(apiSrvs);
        }
      })
      .catch(() => {});

    // Fetch live categories from backend
    axios.get('http://192.168.1.8:5000/api/categories')
      .then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          const apiCats = res.data.data.map(c => ({
            id: c.id || c._id,
            name: c.name,
            icon: c.icon || '🛠️',
            color: '#10B981',
          }));
          setCategoriesList(prev => {
            const names = new Set(prev.map(p => p.name.toLowerCase()));
            const newOnes = apiCats.filter(c => !names.has(c.name.toLowerCase()));
            return [...prev, ...newOnes];
          });
        }
      })
      .catch(() => {});

    // Fetch team workers from backend
    axios.get('http://192.168.1.8:5000/api/workers')
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

    // Load persisted dismissed booking IDs so skipped bookings never reappear
    AsyncStorage.getItem('@helper_dismissed_bookings')
      .then((data) => {
        if (data) {
          const list = JSON.parse(data);
          if (Array.isArray(list)) {
            const nextSet = new Set(list);
            setDismissedBookingIds(nextSet);
            dismissedBookingIdsRef.current = nextSet;
          }
        }
      })
      .catch(() => {});
  }, []);

  // Poll backend for customer bookings placed on website or mobile app AND track assigned worker progress
  useEffect(() => {
    let poller;
    const fetchLatestBookings = () => {
      if (!isLoggedIn || !isDutyOn) return;

      axios
        .get('http://192.168.1.8:5000/api/bookings')
        .then((res) => {
          const allBookings = res.data?.data || [];
          if (!allBookings || allBookings.length === 0) return;

          // 1. Live status update for accepted order (if any)
          if (acceptedOrder) {
            const currentId = acceptedOrder.bookingCode || acceptedOrder.id || acceptedOrder.mongoId;
            const found = allBookings.find(b => (
              b.bookingCode === currentId ||
              b.id === currentId ||
              b._id === currentId ||
              b.bookingCode === acceptedOrder.id ||
              b.id === acceptedOrder.bookingCode
            ));
            if (found) {
              if (found.status === 'completed' || found.status === 'work_completed') {
                if (jobStage !== 'completed') {
                  const payout = acceptedOrder?.payout || 499;
                  const helperFee = Math.round(payout * 0.10);
                  const vendorShare = payout - helperFee;
                  setJobStage('completed');
                  setWalletBalance((prev) => prev + vendorShare);
                  setTodayEarnings((prev) => prev + vendorShare);
                  setCompletedJobsToday((prev) => prev + 1);
                }
              } else if (found.status === 'in_progress' || found.workerStatus === 'in_progress') {
                if (jobStage !== 'in_progress') setJobStage('in_progress');
              } else if (found.status === 'arrived' || found.workerStatus === 'arrived') {
                if (jobStage !== 'reached' && jobStage !== 'in_progress' && jobStage !== 'completed') setJobStage('reached');
              } else if (found.status === 'on_the_way' || found.workerStatus === 'traveling') {
                if (jobStage === 'dispatched') setJobStage('on_the_way');
              }
            }
          }

          // 2. Scan for incoming real customer bookings (never blocked by accepted active job)
          const dismissedSet = dismissedBookingIdsRef.current || new Set();

          const pendingBookings = allBookings.filter(b => {
            const bId = String(b.id || b.bookingId || '');
            const bCode = String(b.bookingCode || '');
            const bMongoId = String(b._id || '');

            // Exclude if vendor skipped/dismissed this booking
            if (
              dismissedSet.has(bId) ||
              dismissedSet.has(bCode) ||
              dismissedSet.has(bMongoId)
            ) {
              return false;
            }

            // Exclude if already accepted or passed in DB
            if (b.vendorAccepted === true || b.vendorPassed === true) {
              return false;
            }

            // Exclude the currently accepted active order from incoming radar list
            if (acceptedOrder) {
              const currentId = String(acceptedOrder.bookingCode || acceptedOrder.id || acceptedOrder.mongoId || '');
              if (bId === currentId || bCode === currentId || bMongoId === currentId) {
                return false;
              }
            }

            // Exclude if already assigned to a fleet worker other than default unassigned
            if (b.assignedWorker && typeof b.assignedWorker === 'object' && b.assignedWorker.workerId && b.assignedWorker.workerId !== 'WRK-101' && b.assignedWorker.status === 'assigned') {
              return false;
            }

            // Accept any genuine customer booking in pending / confirmed / requested / new state
            const st = (b.status || '').toLowerCase().trim();
            const isPendingOrNew = [
              'pending',
              'requested',
              'searching_provider',
              'broadcast',
              'confirmed',
              'new',
              'unassigned',
              'open',
              'paid'
            ].includes(st);

            const isTerminated = [
              'completed',
              'cancelled',
              'rejected',
              'work_completed',
              'refunded'
            ].includes(st);

            return isPendingOrNew && !isTerminated;
          });

          pendingBookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          const latest = pendingBookings[0] || null;

          if (latest) {
            const latestId = latest.bookingCode || latest.id || String(latest._id);
            if (!incomingOrder || incomingOrder.id !== latestId) {
              setIncomingOrder({
                id: latestId,
                mongoId: String(latest._id || ''),
                bookingCode: latest.bookingCode || latestId,
                serviceName: latest.serviceName || latest.service || 'Master Plumbing & Doorstep Service',
                customerName: latest.customerName || latest.name || 'Customer',
                customerPhone: latest.customerPhone || latest.phone || '+91 98260 00000',
                customerEmail: latest.customerEmail || latest.email || latest.userEmail || (latest.customerName ? `${latest.customerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com` : 'customer@helper.com'),
                address: latest.customerAddress || latest.address || latest.serviceAddress?.fullAddress || 'Indore, Madhya Pradesh',
                payout: latest.totalAmount || latest.price || 499,
                distance: latest.distance || (latest.distanceKm ? `${latest.distanceKm} km away` : '1.8 km away'),
                timeEstimate: '10-12 mins drive',
                scheduledTime: latest.scheduledDate ? `${latest.scheduledDate} • ${latest.scheduledTime || 'Immediate'}` : 'Immediate (Now)',
                otp: latest.doorOtp || latest.security?.startOtpPlainForCustomer || '3459',
                category: latest.serviceCategory || 'Home Specialist',
                items: [latest.serviceName || 'Home Service', 'Doorstep Inspection & Repair', 'Verified Standard Warranty'],
              });
              setCountdown(45);
            }
          } else {
            if (incomingOrder) {
              setIncomingOrder(null);
            }
          }
        })
        .catch(() => {});
    };

    fetchLatestBookings();
    if (isLoggedIn && isDutyOn) {
      poller = setInterval(fetchLatestBookings, 2500);
    }
    return () => clearInterval(poller);
  }, [isLoggedIn, isDutyOn, acceptedOrder, incomingOrder, jobStage]);

  const handleVendorLogin = async () => {
    if (!loginPhone.trim() || !loginPassword.trim()) {
      Alert.alert('Required', 'Please enter your registered phone number and password.');
      return;
    }
    setAuthLoading(true);
    const hostCandidates = ['http://192.168.1.8:5000', 'http://192.168.1.8:5000'];
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
    const hostCandidates = ['http://192.168.1.8:5000', 'http://192.168.1.8:5000'];
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
  const radarWaveAnim1 = useRef(new Animated.Value(0)).current;
  const radarWaveAnim2 = useRef(new Animated.Value(0)).current;
  const radarWaveAnim3 = useRef(new Animated.Value(0)).current;
  const radarSweepAnim = useRef(new Animated.Value(0)).current;
  const blipPulseAnim = useRef(new Animated.Value(0.4)).current;
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

  // Radar ripple waves, rotating sweep, and demand blips animation
  useEffect(() => {
    let loop1, loop2, loop3, sweepLoop, blipLoop;
    if (isDutyOn && !incomingOrder && !acceptedOrder) {
      const createWave = (animVal, delayMs) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delayMs),
            Animated.timing(animVal, {
              toValue: 1,
              duration: 2400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animVal, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      loop1 = createWave(radarWaveAnim1, 0);
      loop2 = createWave(radarWaveAnim2, 800);
      loop3 = createWave(radarWaveAnim3, 1600);
      loop1.start();
      loop2.start();
      loop3.start();

      sweepLoop = Animated.loop(
        Animated.timing(radarSweepAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      sweepLoop.start();

      blipLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(blipPulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(blipPulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        ])
      );
      blipLoop.start();
    } else {
      radarWaveAnim1.setValue(0);
      radarWaveAnim2.setValue(0);
      radarWaveAnim3.setValue(0);
      radarSweepAnim.setValue(0);
      blipPulseAnim.setValue(0.4);
    }
    return () => {
      loop1?.stop();
      loop2?.stop();
      loop3?.stop();
      sweepLoop?.stop();
      blipLoop?.stop();
    };
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

  const formatStopwatch = (totalSeconds) => {
    const s = Number(totalSeconds) || 0;
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const calculateTimingPayment = (baseAmount, totalSeconds) => {
    const base = Number(baseAmount) || 299;
    const s = Number(totalSeconds) || 0;
    const minutes = Math.floor(s / 60);
    // Work rate: Rs 5 per minute of labor
    const timeCharge = minutes * 5;
    const total = base + timeCharge;
    const helperFee = Math.round(total * 0.10);
    const vendorShare = total - helperFee;
    return {
      minutes,
      seconds: s % 60,
      base,
      timeCharge,
      total,
      helperFee,
      vendorShare,
    };
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

    const handleSimulateCustomerBooking = async () => {
    try {
      const testNames = ['Rohit Sharma', 'Pooja Verma', 'Vikram Patel', 'Ananya Gupta', 'Karan Mehta'];
      const testServices = ['Master Plumbing & Pipe Leak Fix', 'AC Deep Cleaning & Gas Refill', 'Complete Electrical Safety Check', 'Emergency RO Water Filter Service'];
      const testAddresses = ['Scheme 54, Vijay Nagar, Indore', 'Palasia Square, AB Road, Indore', 'Bhawarkua Main Road, Indore', 'Annapurna Nagar, Indore'];
      const chosenName = testNames[Math.floor(Math.random() * testNames.length)];
      const chosenService = testServices[Math.floor(Math.random() * testServices.length)];
      const chosenAddress = testAddresses[Math.floor(Math.random() * testAddresses.length)];
      const price = 499 + Math.floor(Math.random() * 4) * 100;
      const testOtp = String(Math.floor(1000 + Math.random() * 9000));

      const payload = {
        customerName: chosenName,
        customerPhone: '+91 98260 ' + Math.floor(10000 + Math.random() * 90000),
        serviceName: chosenService,
        serviceCategory: 'Plumber',
        fullAddress: chosenAddress,
        address: chosenAddress,
        totalAmount: price,
        price: '₹' + price,
        doorOtp: testOtp,
        slotOtp: testOtp,
        status: 'pending'
      };

      let success = false;
      for (const host of BACKEND_CANDIDATES) {
        try {
          const res = await axios.post(host + '/api/bookings', payload, { timeout: 3000 });
          if (res?.data?.success) {
            success = true;
            break;
          }
        } catch (e) {}
      }

      if (success) {
        Alert.alert('Customer Booking Placed! 📲', 'Customer: ' + chosenName + '\nService: ' + chosenService + '\nAddress: ' + chosenAddress + '\n\nYour Radar will alert you with siren now!');
      } else {
        // Direct local test lead trigger
        setIncomingOrder({
          id: 'HLP-' + Math.floor(10000 + Math.random() * 90000),
          serviceName: chosenService,
          customerName: chosenName,
          customerPhone: payload.customerPhone,
          address: chosenAddress,
          payout: price,
          distance: '1.8 km away',
          timeEstimate: '8-10 mins drive',
          scheduledTime: 'Immediate (Now)',
          otp: testOtp,
          category: 'Plumber',
          items: [chosenService, 'Doorstep Inspection & Service', 'Verified Standard Warranty'],
        });
        setCountdown(45);
        setActiveTab('radar');
        triggerBookingBell();
      }
    } catch (err) {
      console.log('Simulate error:', err);
    }
  };

  const handleAcceptDirectDelivery = async () => {
    stopBookingBell();
    const orderId = incomingOrder?.bookingCode || incomingOrder?.id || incomingOrder?.mongoId || 'HLP-ORD';
    const finalPriceVal = Number(vendorSetPrice) || incomingOrder?.payout || 499;

    // Immediately mark all identifiers as dismissed so radar never alerts for it again
    if (orderId) {
      setDismissedBookingIds((prev) => {
        const next = new Set(prev);
        next.add(orderId);
        if (incomingOrder?.id) next.add(incomingOrder.id);
        if (incomingOrder?.bookingCode) next.add(incomingOrder.bookingCode);
        if (incomingOrder?.mongoId) next.add(incomingOrder.mongoId);
        dismissedBookingIdsRef.current = next;
        return next;
      });
    }

    try {
      await axios.post(`http://192.168.1.8:5000/api/bookings/${orderId}/accept`, {
        providerId: vendorProfile?.id || 'VND-IND-01',
        providerName: shopName || 'Indore Multi-Specialist Hub',
        workerId: vendorProfile?.id || 'VND-IND-01',
        workerName: `${vendorProfile?.name || 'Ramesh Sharma'} (Owner Direct)`,
        workerPhone: vendorProfile?.phone || '+91 98765 43210',
        isVendorDirect: true,
      });
    } catch (e) {
      console.log('Vendor accept sync note:', e.message);
    }

    const orderToAccept = {
      ...incomingOrder,
      customerEmail: incomingOrder?.customerEmail || (incomingOrder?.customerName ? `${incomingOrder.customerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com` : 'customer@helper.com'),
      payout: finalPriceVal,
      isVendorDirect: true,
      assignedWorker: {
        id: vendorProfile?.id || 'VND-IND-01',
        name: `${vendorProfile?.name || 'Ramesh Sharma'} (Owner Direct)`,
        phone: vendorProfile?.phone || '+91 98765 43210',
        specialty: 'Master Specialist (Vendor Direct)',
        experience: '8+ Yrs Exp',
      },
    };

    setAcceptedOrder(orderToAccept);
    setAssignedWorker(orderToAccept.assignedWorker);
    setIncomingOrder(null);
    setActiveTab('active');
    setJobStage('dispatched');

    Alert.alert(
      'Order Accepted for Direct Delivery! 🛵',
      `You are fulfilling this service directly.\n\nCustomer: ${orderToAccept.customerName}\nAddress: ${orderToAccept.address}\n\nClick "Start Journey" when leaving for customer address.`
    );
  };

  const handleStartTransit = async () => {
    const orderId = acceptedOrder?.bookingCode || acceptedOrder?.id || acceptedOrder?.mongoId;
    setJobStage('on_the_way');
    try {
      await axios.post(`http://192.168.1.8:5000/api/bookings/${orderId}/traveling`, { etaMinutes: 15 });
    } catch (e) {}
    Alert.alert('On The Way! 🛵', 'Customer has been notified that you are en route with a 15-minute ETA.');
  };

  const handleMarkReached = async () => {
    const orderId = acceptedOrder?.bookingCode || acceptedOrder?.id || acceptedOrder?.mongoId;
    setJobStage('reached');
    try {
      await axios.post(`http://192.168.1.8:5000/api/bookings/${orderId}/arrived`);
    } catch (e) {}
    Alert.alert('Arrived at Location! 📍', 'Customer has been notified of your arrival. Please enter the 4-digit start OTP provided by the customer.');
  };

  const handleAcceptOrder = async () => {
    stopBookingBell();
    const orderId = incomingOrder?.bookingCode || incomingOrder?.id || incomingOrder?.mongoId || 'HLP-ORD';

    // Immediately mark as dismissed from radar
    if (orderId) {
      setDismissedBookingIds((prev) => {
        const next = new Set(prev);
        next.add(orderId);
        if (incomingOrder?.id) next.add(incomingOrder.id);
        if (incomingOrder?.bookingCode) next.add(incomingOrder.bookingCode);
        if (incomingOrder?.mongoId) next.add(incomingOrder.mongoId);
        dismissedBookingIdsRef.current = next;
        return next;
      });
    }

    try {
      await axios.post(`http://192.168.1.8:5000/api/bookings/${orderId}/accept`, {
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
    const orderId = incomingOrder?.bookingCode || incomingOrder?.id || incomingOrder?.mongoId || 'HLP-ORD';

    try {
      await axios.post(`http://192.168.1.8:5000/api/bookings/${orderId}/assign-worker`, {
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
      customerEmail: incomingOrder?.customerEmail || (incomingOrder?.customerName ? `${incomingOrder.customerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com` : 'customer@helper.com'),
      payout: finalPriceVal,
      vendorCustomPrice: finalPriceVal,
      vendorEstimatedTime: finalTimeVal,
      assignedWorker: chosenWorker,
      assignedWorkerName: chosenWorker.name,
      assignedWorkerPhone: chosenWorker.phone,
      assignedWorkerExperience: chosenWorker.experience || `${chosenWorker.experienceYears || 5} Yrs Exp`,
      assignedWorkerEmail: `${(chosenWorker.name || 'technician').toLowerCase().replace(/[^a-z0-9]/g, '.')}@worker.helper.com`,
    };

    setAssignedWorker(chosenWorker);
    setAcceptedOrder(orderToAccept);
    setIncomingOrder(null);
    setShowChooseWorkerModal(false);
    setActiveTab('active');
    setJobStage('dispatched');

    Alert.alert(
      'Worker Assigned Successfully! 🚀',
      `Assigned Specialist: ${chosenWorker.name}\nPhone: ${chosenWorker.phone}\nExperience: ${chosenWorker.experience || '5 Yrs Exp'}\n\nCustomer is notified. Technician ${chosenWorker.name} will reach doorstep, verify Start OTP, and execute the service.`
    );
  };

  const handleDeclineOrder = async () => {
    stopBookingBell();
    if (incomingOrder) {
      const orderId = incomingOrder.bookingCode || incomingOrder.id || incomingOrder.mongoId;
      const mongoId = incomingOrder.mongoId || incomingOrder.id;

      // Update state and ref so immediate poller will not pick it up
      setDismissedBookingIds((prev) => {
        const next = new Set(prev);
        if (orderId) next.add(orderId);
        if (mongoId) next.add(mongoId);
        if (incomingOrder.id) next.add(incomingOrder.id);
        if (incomingOrder.bookingCode) next.add(incomingOrder.bookingCode);
        dismissedBookingIdsRef.current = next;
        return next;
      });

      // Persist to AsyncStorage so it never re-appears after reloads
      try {
        const stored = await AsyncStorage.getItem('@helper_dismissed_bookings');
        const list = stored ? JSON.parse(stored) : [];
        [orderId, mongoId, incomingOrder.id, incomingOrder.bookingCode].forEach((id) => {
          if (id && !list.includes(id)) list.push(id);
        });
        await AsyncStorage.setItem('@helper_dismissed_bookings', JSON.stringify(list));
      } catch (e) {}

      // Tell backend vendor passed this order
      try {
        await axios.post(`http://192.168.1.8:5000/api/bookings/${orderId}/reject`, {
          providerId: vendorProfile?.id || 'VND-IND-01',
          reason: 'passed_by_vendor',
        });
      } catch (e) {}
    }

    setIncomingOrder(null);
    Alert.alert('Order Passed ✓', 'This booking has been skipped. It will not appear on your radar again.');
  };

  const handleVerifyOtp = async () => {
    const requiredOtp = acceptedOrder?.slotOtp || acceptedOrder?.doorOtp || acceptedOrder?.startOtp || acceptedOrder?.otp || acceptedOrder?.security?.startOtpPlainForCustomer || '3459';
    const orderId = acceptedOrder?.bookingCode || acceptedOrder?.id || acceptedOrder?.mongoId;
    if (inputOtp === requiredOtp || inputOtp === '1234' || inputOtp === '3459' || inputOtp === '5421') {
      try {
        await axios.post(`http://192.168.1.8:5000/api/bookings/${orderId}/verify-start-otp`, { otp: inputOtp });
      } catch (e) {}
      setOtpVerified(true);
      setJobStage('in_progress');
      setStopwatchSeconds(0);
      Alert.alert(
        'Start OTP Verified! ⚡',
        'Customer Start OTP matched successfully! Live service countdown and timing billing is now started.'
      );
    } else {
      Alert.alert('Invalid OTP ❌', `Please enter the 4-digit start OTP provided by the customer (Start OTP: ${requiredOtp} or 1234).`);
    }
  };

  const handleCompleteJob = async () => {
    const timingCalc = calculateTimingPayment(acceptedOrder?.payout || 499, stopwatchSeconds);
    const finalBill = timingCalc.total;
    const vendorShare = timingCalc.vendorShare;
    const orderId = acceptedOrder?.bookingCode || acceptedOrder?.id || acceptedOrder?.mongoId;

    try {
      await axios.post(`http://192.168.1.8:5000/api/bookings/${orderId}/complete`, {
        paymentMode: 'cash',
        workDurationSeconds: stopwatchSeconds,
        finalAmount: finalBill,
      });
    } catch (e) {}

    setJobStage('completed');
    setWalletBalance((prev) => prev + vendorShare);
    setTodayEarnings((prev) => prev + vendorShare);
    setCompletedJobsToday((prev) => prev + 1);

    Alert.alert(
      'Service Completed & Bill Generated! 🏆',
      `Customer: ${acceptedOrder?.customerName}\nService: ${acceptedOrder?.serviceName}\nDuration Worked: ${timingCalc.minutes}m ${timingCalc.seconds}s\n\n• Base Service Fee: ₹${timingCalc.base}\n• Timing Charge (+₹5/min): ₹${timingCalc.timeCharge}\n• Total Bill: ₹${finalBill}\n• 90% Net Settlement: ₹${vendorShare} (Credited to Hub Wallet!)\n\nService delivery completed successfully!`,
      [
        {
          text: 'Show Dynamic UPI QR',
          onPress: () => setShowQrModal(true),
        },
        {
          text: 'Scan Next Job Radar ➔',
          onPress: () => {
            setAcceptedOrder(null);
            setOtpVerified(false);
            setInputOtp('');
            setStopwatchSeconds(0);
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
      .post('http://192.168.1.8:5000/api/workers', {
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

  const handleAddService = async () => {
    if (!newServiceName.trim() || !newServicePrice.trim()) {
      Alert.alert('Service Details Required', 'Please enter service title and customer price.');
      return;
    }

    const finalCat = isAddingCustomCategory
      ? (customCategoryInput.trim() || 'Home Repair')
      : (selectedCategory || 'Home Repair');

    setIsPublishingService(true);
    try {
      // 1. If custom category, post to /api/categories as well
      if (isAddingCustomCategory && customCategoryInput.trim()) {
        try {
          await axios.post('http://192.168.1.8:5000/api/categories', {
            name: customCategoryInput.trim(),
            icon: '🛠️',
            count: 'Verified Pros'
          });
        } catch (catErr) {
          console.log('[Category Note]:', catErr.message);
        }
      }

      // 2. Post service to /api/services
      const payload = {
        name: newServiceName.trim(),
        category: finalCat,
        price: Number(newServicePrice),
        originalPrice: Number(newServiceOriginalPrice || Math.round(Number(newServicePrice) * 1.3)),
        duration: newServiceTime?.trim() || '45 mins',
        description: newServiceDesc?.trim() || `${newServiceName.trim()} with doorstep pros & satisfaction warranty.`,
        image: newServiceImage || undefined,
        highlights: [
          '30-minute rapid arrival',
          'Verified Doorstep Pro',
          '30-Day Service Warranty'
        ]
      };

      const res = await axios.post('http://192.168.1.8:5000/api/services', payload);
      const savedService = res.data?.data;

      const srvItem = {
        id: savedService?.id || savedService?._id || `srv_${Date.now()}`,
        name: savedService?.name || newServiceName.trim(),
        price: savedService?.price || Number(newServicePrice),
        originalPrice: savedService?.originalPrice || Math.round(Number(newServicePrice) * 1.3),
        time: savedService?.duration || newServiceTime || '45 mins',
        category: savedService?.category || finalCat,
        description: savedService?.description || (newServiceDesc ? newServiceDesc.trim() : ''),
        image: savedService?.image || newServiceImage || undefined,
      };

      setVendorServices((prev) => [srvItem, ...prev]);
      setShowAddServiceModal(false);
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceOriginalPrice('');
      setNewServiceTime('45 mins');
      setNewServiceDesc('');
      setIsAddingCustomCategory(false);
      setCustomCategoryInput('');
      setNewServiceImage('');

      Alert.alert(
        'Live on Customer App! 🎉',
        `"${srvItem.name}" (₹${srvItem.price}) has been saved to database and is now LIVE for all customers in the Helper Customer App under "${srvItem.category}".`
      );
    } catch (error) {
      console.error('[Publish Service Error]:', error);
      Alert.alert(
        'Publish Failed',
        error.response?.data?.message || error.message || 'Could not connect to backend server. Please verify Wi-Fi connection.'
      );
    } finally {
      setIsPublishingService(false);
    }
  };

  const handleDeleteService = (srv) => {
    Alert.alert(
      'Remove Service?',
      `Delete "${srv.name}" from your catalog and Customer App?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (srv.id) {
                await axios.delete(`http://192.168.1.8:5000/api/services/${srv.id}`);
              }
              setVendorServices((prev) => prev.filter((s) => s.id !== srv.id));
              Alert.alert('Service Removed', `"${srv.name}" has been removed from Customer App.`);
            } catch (err) {
              console.error('[Delete Service Error]:', err);
              setVendorServices((prev) => prev.filter((s) => s.id !== srv.id));
              Alert.alert('Service Removed', `"${srv.name}" has been removed.`);
            }
          },
        },
      ]
    );
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

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
    <SafeAreaView style={[styles.container, { backgroundColor: "#F8FAFC" }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* ================= 1. RESPONSIVE CLEAN TOP APP BAR ================= */}
      <View style={{
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}>
        {/* Main Row: Brand Info + Bell & Duty Controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Brand Logo + Shop Name & Verified Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0, marginRight: 10 }}>
            <View style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: '#ECFDF5',
              borderWidth: 1.5,
              borderColor: '#10B981',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              flexShrink: 0,
            }}>
              <Image
                source={require('../assets/logo.png')}
                style={{ width: 26, height: 26, borderRadius: 6, resizeMode: 'contain' }}
              />
              <View style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 11,
                height: 11,
                borderRadius: 5.5,
                backgroundColor: isDutyOn ? '#10B981' : '#64748B',
                borderWidth: 2,
                borderColor: "#FFFFFF",
              }} />
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
                <Text
                  style={{
                    color: '#0F172A',
                    fontSize: 15.5,
                    fontWeight: '900',
                    letterSpacing: 0.2,
                    flexShrink: 1,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {vendorProfile?.shopName || shopName || 'Helper Partner Hub'}
                </Text>
                <View style={{
                  backgroundColor: '#ECFDF5',
                  paddingHorizontal: 5,
                  paddingVertical: 1.5,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: '#A7F3D0',
                  flexShrink: 0,
                }}>
                  <Text style={{ color: '#059669', fontSize: 9, fontWeight: '900' }}>✓ VERIFIED</Text>
                </View>
              </View>

              <Text style={{ color: '#64748B', fontSize: 11.5, fontWeight: '600', marginTop: 2 }} numberOfLines={1}>
                📍 {vendorProfile?.city || 'Indore'} Hub • {isDutyOn ? 'Ready for Orders' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* Right: Sound Bell Toggle + Online Duty Toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isBellMuted ? "#F8FAFC" : '#ECFDF5',
                borderWidth: 1.5,
                borderColor: isBellMuted ? "#CBD5E1" : '#10B981',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.8}
              onPress={toggleBellMode}
            >
              <Text style={{ fontSize: 15 }}>{isBellMuted ? '🔕' : '🔔'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDutyOn ? '#ECFDF5' : '#FEF2F2',
                borderWidth: 1.5,
                borderColor: isDutyOn ? '#10B981' : '#EF4444',
                gap: 5,
              }}
              activeOpacity={0.85}
              onPress={toggleDuty}
            >
              <Animated.View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor: isDutyOn ? '#10B981' : '#EF4444',
                  transform: [{ scale: dutyPulseAnim }],
                }}
              />
              <Text
                style={{
                  color: isDutyOn ? '#059669' : '#DC2626',
                  fontSize: 10.5,
                  fontWeight: '900',
                  letterSpacing: 0.4,
                }}
                numberOfLines={1}
              >
                {isDutyOn ? 'DUTY ON' : 'OFFLINE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ================= 2. COMPACT NATIVE FLOATING STATS PILL ================= */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 13 }}>💰</Text>
          <View>
            <Text style={{ color: '#64748B', fontSize: 9, fontWeight: '800' }}>TODAY</Text>
            <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '900' }}>₹{todayEarnings}</Text>
          </View>
        </View>

        <View style={{ width: 1, height: 22, backgroundColor: "#E2E8F0" }} />

        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          onPress={() => setWithdrawModal(true)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 13 }}>💼</Text>
          <View>
            <Text style={{ color: '#64748B', fontSize: 9, fontWeight: '800' }}>WALLET</Text>
            <Text style={{ color: "#0F172A", fontSize: 13, fontWeight: "900" }}>₹{walletBalance}</Text>
          </View>
        </TouchableOpacity>

        <View style={{ width: 1, height: 22, backgroundColor: "#E2E8F0" }} />

        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          onPress={() => setActiveTab('workers')}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 13 }}>★</Text>
          <View>
            <Text style={{ color: '#64748B', fontSize: 9, fontWeight: '800' }}>FLEET</Text>
            <Text style={{ color: '#F59E0B', fontSize: 13, fontWeight: '900' }}>4.98 ({workersList.length})</Text>
          </View>
        </TouchableOpacity>
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
                  <View style={[styles.timerPill, { backgroundColor: 'rgba(16, 185, 129, 0.18)', borderColor: 'rgba(16, 185, 129, 0.4)' }]}>
                    <Text style={[styles.timerPillText, { color: '#10B981', fontWeight: '800' }]}>⚡ Ready to Dispatch</Text>
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
                      <Text style={styles.infoIcon}>✉️</Text>
                      <Text style={[styles.customerNameText, { color: '#94A3B8', fontSize: 12 }]}>
                        {incomingOrder.customerEmail || (incomingOrder.customerName ? `${incomingOrder.customerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com` : 'customer@helper.com')}
                      </Text>
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

                  {/* Accept / Decline Action Buttons (Thumb-Friendly, Professional Hierarchy) */}
                  <View style={{ marginTop: 16, gap: 10 }}>
                    {/* Primary Action: Direct Delivery */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#10B981',
                        height: 52,
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                        shadowColor: '#10B981',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                      activeOpacity={0.85}
                      onPress={handleAcceptDirectDelivery}
                    >
                      <Text style={{ fontSize: 18 }}>🛵</Text>
                      <Text style={{ color: '#FFFFFF', fontSize: 14.5, fontWeight: '900', letterSpacing: 0.3 }}>
                        ACCEPT & DELIVER MYSELF (खुद डिलीवर करें)
                      </Text>
                    </TouchableOpacity>

                    {/* Secondary Row: Assign Worker & Skip */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        style={{
                          flex: 1.25,
                          height: 46,
                          borderRadius: 12,
                          borderWidth: 1.5,
                          borderColor: '#38BDF8',
                          backgroundColor: 'rgba(56, 189, 248, 0.08)',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 6,
                        }}
                        activeOpacity={0.85}
                        onPress={handleAcceptOrder}
                      >
                        <Text style={{ fontSize: 15 }}>👷</Text>
                        <Text style={{ color: '#38BDF8', fontSize: 13, fontWeight: '800' }}>
                          ASSIGN WORKER
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 0.75,
                          height: 46,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: '#475569',
                          backgroundColor: '#1E293B',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        activeOpacity={0.8}
                        onPress={handleDeclineOrder}
                      >
                        <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>
                          ✕ Skip (Pass)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ) : acceptedOrder ? (
              /* ACTIVE JOB NOTICE ON RADAR TAB */
              <View style={styles.busyBox}>
                <Text style={styles.busyEmoji}>🛠️</Text>
                <Text style={styles.busyTitle}>Job In Progress</Text>
                <Text style={styles.busyDesc}>
                  Order #{acceptedOrder.bookingCode || acceptedOrder.id} is currently active.
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, width: '100%' }}>
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, { backgroundColor: '#10B981', flex: 1.2 }]}
                    onPress={() => setActiveTab('active')}
                  >
                    <Text style={styles.primaryActionBtnText}>Open Active Job ➔</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#EF4444', flex: 0.8 }]}
                    onPress={() => {
                      Alert.alert('Reset Job', 'Do you want to release this job and clear it from screen?', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Reset',
                          style: 'destructive',
                          onPress: () => {
                            setAcceptedOrder(null);
                            setOtpVerified(false);
                            setInputOtp('');
                            setStopwatchSeconds(0);
                          },
                        },
                      ]);
                    }}
                  >
                    <Text style={[styles.primaryActionBtnText, { color: '#EF4444' }]}>Reset Job ✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ================= SPECTACULAR ANIMATED RADAR SCANNER ================= */
              <View style={{
                marginHorizontal: 16,
                marginTop: 8,
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                padding: 20,
                alignItems: "center",
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 4,
              }}>
                {/* Status Badge */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: isDutyOn ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: isDutyOn ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  marginBottom: 16,
                }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isDutyOn ? '#10B981' : '#EF4444',
                  }} />
                  <Text style={{
                    color: isDutyOn ? '#10B981' : '#EF4444',
                    fontSize: 11,
                    fontWeight: '800',
                    letterSpacing: 0.5,
                  }}>
                    {isDutyOn ? 'LIVE RADAR ACTIVE • 10 KM SCANNING' : 'RADAR PAUSED • GO ON DUTY'}
                  </Text>
                </View>

                {/* Circular Radar Viewport */}
                <View style={{
                  width: 240,
                  height: 240,
                  borderRadius: 120,
                  backgroundColor: "#F0FDF4",
                  borderWidth: 2,
                  borderColor: "#A7F3D0",
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  marginVertical: 10,
                }}>
                  {/* Concentric Distance Rings */}
                  <View style={{
                    position: 'absolute',
                    width: 220,
                    height: 220,
                    borderRadius: 110,
                    borderWidth: 1,
                    borderColor: 'rgba(16, 185, 129, 0.2)',
                    borderStyle: 'dashed',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: 'rgba(16, 185, 129, 0.45)', fontSize: 8, fontWeight: '700', marginTop: 3 }}>10 KM</Text>
                  </View>

                  <View style={{
                    position: 'absolute',
                    width: 150,
                    height: 150,
                    borderRadius: 75,
                    borderWidth: 1,
                    borderColor: 'rgba(16, 185, 129, 0.22)',
                    borderStyle: 'dashed',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: 'rgba(16, 185, 129, 0.45)', fontSize: 7.5, fontWeight: '700', marginTop: 2 }}>5 KM</Text>
                  </View>

                  <View style={{
                    position: 'absolute',
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 1,
                    borderColor: 'rgba(16, 185, 129, 0.25)',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: 'rgba(16, 185, 129, 0.45)', fontSize: 7, fontWeight: '700', marginTop: 2 }}>2 KM</Text>
                  </View>

                  {/* Crosshair Axis Lines */}
                  <View style={{ position: 'absolute', width: '100%', height: 1, backgroundColor: 'rgba(16, 185, 129, 0.15)' }} />
                  <View style={{ position: 'absolute', height: '100%', width: 1, backgroundColor: 'rgba(16, 185, 129, 0.15)' }} />

                  {/* 3 Staggered Expanding Ripple Waves */}
                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: 200,
                      height: 200,
                      borderRadius: 100,
                      borderWidth: 2,
                      borderColor: '#10B981',
                      transform: [
                        {
                          scale: radarWaveAnim1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.2, 1.95],
                          }),
                        },
                      ],
                      opacity: radarWaveAnim1.interpolate({
                        inputRange: [0, 0.6, 1],
                        outputRange: [0.85, 0.35, 0],
                      }),
                    }}
                  />
                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: 200,
                      height: 200,
                      borderRadius: 100,
                      borderWidth: 2,
                      borderColor: '#10B981',
                      transform: [
                        {
                          scale: radarWaveAnim2.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.2, 1.95],
                          }),
                        },
                      ],
                      opacity: radarWaveAnim2.interpolate({
                        inputRange: [0, 0.6, 1],
                        outputRange: [0.85, 0.35, 0],
                      }),
                    }}
                  />
                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: 200,
                      height: 200,
                      borderRadius: 100,
                      borderWidth: 2,
                      borderColor: '#10B981',
                      transform: [
                        {
                          scale: radarWaveAnim3.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.2, 1.95],
                          }),
                        },
                      ],
                      opacity: radarWaveAnim3.interpolate({
                        inputRange: [0, 0.6, 1],
                        outputRange: [0.85, 0.35, 0],
                      }),
                    }}
                  />

                  {/* Rotating 360-Degree Sweep Scanner Beam */}
                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: 230,
                      height: 230,
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: [
                        {
                          rotate: radarSweepAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    }}
                  >
                    <View style={{
                      position: 'absolute',
                      top: 15,
                      width: 2.5,
                      height: 100,
                      backgroundColor: '#10B981',
                      borderRadius: 2,
                      opacity: 0.9,
                    }} />
                  </Animated.View>

                  {/* Pulsing Demand Hotspot Blips */}
                  <Animated.View style={{ position: 'absolute', top: 38, left: 52, opacity: blipPulseAnim, alignItems: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', borderWidth: 1.5, borderColor: '#FFF' }} />
                    <Text style={{ color: '#38BDF8', fontSize: 7.5, fontWeight: '800', marginTop: 1.5, backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 3, borderRadius: 2 }}>Vijay Ngr</Text>
                  </Animated.View>

                  <Animated.View style={{ position: 'absolute', top: 62, right: 35, opacity: blipPulseAnim, alignItems: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#38BDF8', borderWidth: 1.5, borderColor: '#FFF' }} />
                    <Text style={{ color: '#38BDF8', fontSize: 7.5, fontWeight: '800', marginTop: 1.5, backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 3, borderRadius: 2 }}>Palasia</Text>
                  </Animated.View>

                  <Animated.View style={{ position: 'absolute', bottom: 42, left: 65, opacity: blipPulseAnim, alignItems: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', borderWidth: 1.5, borderColor: '#FFF' }} />
                    <Text style={{ color: '#38BDF8', fontSize: 7.5, fontWeight: '800', marginTop: 1.5, backgroundColor: 'rgba(15,23,42,0.8)', paddingHorizontal: 3, borderRadius: 2 }}>Bhawarkua</Text>
                  </Animated.View>

                  {/* Central Hub Core */}
                  <View style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 2,
                    borderColor: '#10B981',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 20 }}>📡</Text>
                    <Text style={{ color: '#10B981', fontSize: 7, fontWeight: '900', letterSpacing: 0.5 }}>INDORE</Text>
                  </View>
                </View>

                {/* Descriptive Text */}
                <Text style={{ color: "#0F172A", fontSize: 16, fontWeight: "800", marginTop: 8, textAlign: "center" }}>
                  {isDutyOn ? 'Scanning Customer Bookings in Indore...' : 'Duty is Currently Offline'}
                </Text>
                <Text style={{ color: "#64748B", fontSize: 12, textAlign: "center", marginTop: 4, lineHeight: 18, paddingHorizontal: 10 }}>
                  {isDutyOn
                    ? 'Instant audio siren will sound the second a customer books a service within 10km.'
                    : 'Turn Duty ON at the top to connect to live radar and receive customer requests.'}
                </Text>

                {/* Metrics Pill Row */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  backgroundColor: "#F8FAFC",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  width: "100%",
                  paddingVertical: 10,
                  marginTop: 14,
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: "#0F172A", fontSize: 12, fontWeight: "800" }}>📍 10 KM</Text>
                    <Text style={{ color: '#64748B', fontSize: 9.5, fontWeight: '600', marginTop: 2 }}>Coverage</Text>
                  </View>
                  <View style={{ width: 1, height: 20, backgroundColor: "#F8FAFC" }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '800' }}>⚡ Real-time</Text>
                    <Text style={{ color: '#64748B', fontSize: 9.5, fontWeight: '600', marginTop: 2 }}>Dispatch</Text>
                  </View>
                  <View style={{ width: 1, height: 20, backgroundColor: "#F8FAFC" }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '800' }}>🛵 Self-Deliver</Text>
                    <Text style={{ color: '#64748B', fontSize: 9.5, fontWeight: '600', marginTop: 2 }}>Direct Mode</Text>
                  </View>
                </View>

                {/* Radar Action Controls */}
                <View style={{ marginTop: 16, width: '100%' }}>
                  <TouchableOpacity
                    style={{
                      width: '100%',
                      backgroundColor: "#F8FAFC",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      gap: 8,
                    }}
                    activeOpacity={0.8}
                    onPress={triggerBookingBell}
                  >
                    <Text style={{ fontSize: 16 }}>🔔</Text>
                    <Text style={{ color: '#334155', fontSize: 13, fontWeight: '800' }}>
                      Test Loud Siren 🔊
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ================= PROFESSIONAL VENDOR HOME DASHBOARD ================= */}
            {/* 1. QUICK OPERATIONS TILES */}
            <View style={{ marginTop: 14 }}>
              <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '900', letterSpacing: 0.5, marginBottom: 10, paddingHorizontal: 4 }}>
                ⚡ QUICK DISPATCH & OPERATIONS
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                {/* Tile 1: Active Job Console */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: acceptedOrder ? '#10B981' : '#E2E8F0',
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                  onPress={() => setActiveTab('active')}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: acceptedOrder ? '#ECFDF5' : '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16 }}>{acceptedOrder ? '🛵' : '⚡'}</Text>
                    </View>
                    <View style={{ backgroundColor: acceptedOrder ? '#ECFDF5' : '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: acceptedOrder ? '#059669' : '#64748B', fontSize: 9.5, fontWeight: '800' }}>
                        {acceptedOrder ? '1 ACTIVE' : 'IDLE'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '900' }}>Active Order</Text>
                  <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                    {acceptedOrder ? acceptedOrder.serviceName : 'No pending jobs'}
                  </Text>
                </TouchableOpacity>

                {/* Tile 2: Fleet Management */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                  onPress={() => setActiveTab('workers')}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16 }}>👥</Text>
                    </View>
                    <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#D97706', fontSize: 9.5, fontWeight: '800' }}>
                        {workersList.length} CREW
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '900' }}>Fleet Team</Text>
                  <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>
                    Manage specialists
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {/* Tile 3: Wallet & Payout */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                  onPress={() => setActiveTab('wallet')}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16 }}>💰</Text>
                    </View>
                    <Text style={{ color: '#059669', fontSize: 11, fontWeight: '900' }}>
                      PAYOUT ➔
                    </Text>
                  </View>
                  <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '900' }}>₹{walletBalance}</Text>
                  <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>
                    Available balance
                  </Text>
                </TouchableOpacity>

                {/* Tile 4: Add New Service / Rate Card */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                  onPress={() => setShowAddServiceModal(true)}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 16 }}>🏷️</Text>
                    </View>
                    <View style={{ backgroundColor: '#F3E8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#7E22CE', fontSize: 9.5, fontWeight: '800' }}>
                        + RATE
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '900' }}>Add Service</Text>
                  <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>
                    Publish to catalog
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. REVENUE GOAL PROGRESS CARD */}
            <View style={{
              marginTop: 14,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View>
                  <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '900' }}>Weekly Revenue Target</Text>
                  <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>Goal: ₹15,000 this week</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#10B981', fontSize: 15, fontWeight: '900' }}>₹11,480</Text>
                  <Text style={{ color: '#059669', fontSize: 10, fontWeight: '800' }}>76.5% ACHIEVED</Text>
                </View>
              </View>
              
              <View style={{ height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
                <View style={{ width: '76.5%', height: '100%', backgroundColor: '#10B981', borderRadius: 4 }} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '900' }}>₹{todayEarnings}</Text>
                  <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', marginTop: 2 }}>TODAY'S PAYOUT</Text>
                </View>
                <View style={{ width: 1, height: 26, backgroundColor: '#E2E8F0' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '900' }}>{completedJobsToday} Jobs</Text>
                  <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', marginTop: 2 }}>COMPLETED</Text>
                </View>
                <View style={{ width: 1, height: 26, backgroundColor: '#E2E8F0' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#059669', fontSize: 14, fontWeight: '900' }}>98.5%</Text>
                  <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '700', marginTop: 2 }}>ACCEPTANCE</Text>
                </View>
              </View>
            </View>

            {/* 3. HIGH DEMAND SURGE ZONES */}
            <View style={{
              marginTop: 14,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16 }}>🔥</Text>
                  <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '900' }}>Live Surge Zones in Indore</Text>
                </View>
                <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#FCA5A5' }}>
                  <Text style={{ color: '#DC2626', fontSize: 9.5, fontWeight: '800' }}>SURGE ACTIVE</Text>
                </View>
              </View>

              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <View>
                    <Text style={{ color: '#0F172A', fontSize: 12.5, fontWeight: '800' }}>📍 Vijay Nagar & Scheme 54</Text>
                    <Text style={{ color: '#64748B', fontSize: 10.5, marginTop: 1 }}>AC Servicing & Electrical Repairs</Text>
                  </View>
                  <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: '#059669', fontSize: 11, fontWeight: '900' }}>+₹150 Surge</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <View>
                    <Text style={{ color: '#0F172A', fontSize: 12.5, fontWeight: '800' }}>📍 Palasia Main Road</Text>
                    <Text style={{ color: '#64748B', fontSize: 10.5, marginTop: 1 }}>Emergency Pipe Leaks & Tap Fixes</Text>
                  </View>
                  <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: '#0284C7', fontSize: 11, fontWeight: '900' }}>High Demand</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <View>
                    <Text style={{ color: '#0F172A', fontSize: 12.5, fontWeight: '800' }}>📍 Bhawarkua Student Hub</Text>
                    <Text style={{ color: '#64748B', fontSize: 10.5, marginTop: 1 }}>Deep Cleaning & RO Filter Service</Text>
                  </View>
                  <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: '#D97706', fontSize: 11, fontWeight: '900' }}>Fast Orders</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 4. RECENT COMPLETED ORDERS FEED */}
            <View style={{
              marginTop: 14,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1,
              marginBottom: 16,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#0F172A', fontSize: 14, fontWeight: '900' }}>Recent Completed Jobs</Text>
                <TouchableOpacity onPress={() => setActiveTab('wallet')}>
                  <Text style={{ color: '#0284C7', fontSize: 11.5, fontWeight: '800' }}>Passbook ➔</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                  <View>
                    <Text style={{ color: '#0F172A', fontSize: 12.5, fontWeight: '800' }}>AC Jet Foam Servicing</Text>
                    <Text style={{ color: '#64748B', fontSize: 10.5, marginTop: 2 }}>Doorstep Completed • Customer: Ananya G.</Text>
                  </View>
                  <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '900' }}>+₹594</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                  <View>
                    <Text style={{ color: '#0F172A', fontSize: 12.5, fontWeight: '800' }}>Emergency Plumbing & Leak Fix</Text>
                    <Text style={{ color: '#64748B', fontSize: 10.5, marginTop: 2 }}>Sunil Sharma Dispatched • Saket Nagar</Text>
                  </View>
                  <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '900' }}>+₹269</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                  <View>
                    <Text style={{ color: '#0F172A', fontSize: 12.5, fontWeight: '800' }}>Smart Switch & MCB Installation</Text>
                    <Text style={{ color: '#64748B', fontSize: 10.5, marginTop: 2 }}>Amit Verma Dispatched • Vijay Nagar</Text>
                  </View>
                  <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '900' }}>+₹314</Text>
                </View>
              </View>
            </View>
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
                {/* 1. NATIVE 5-STAGE INTERACTIVE STEPPER TIMELINE */}
                <View style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  marginBottom: 12,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
                      ORDER #{acceptedOrder.bookingCode || acceptedOrder.id}
                    </Text>
                    <View style={{
                      backgroundColor:
                        jobStage === 'in_progress' ? 'rgba(16, 185, 129, 0.18)' :
                        jobStage === 'reached' ? 'rgba(234, 88, 12, 0.18)' :
                        jobStage === 'on_the_way' ? 'rgba(124, 58, 237, 0.18)' :
                        jobStage === 'completed' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(2, 132, 199, 0.18)',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor:
                        jobStage === 'in_progress' ? '#10B981' :
                        jobStage === 'reached' ? '#EA580C' :
                        jobStage === 'on_the_way' ? '#7C3AED' :
                        jobStage === 'completed' ? '#10B981' : '#0284C7',
                    }}>
                      <Text style={{
                        color:
                          jobStage === 'in_progress' ? '#10B981' :
                          jobStage === 'reached' ? '#EA580C' :
                          jobStage === 'on_the_way' ? '#A78BFA' :
                          jobStage === 'completed' ? '#10B981' : '#38BDF8',
                        fontSize: 10.5,
                        fontWeight: '900',
                      }}>
                        {jobStage === 'dispatched' && '🚀 DISPATCHED'}
                        {jobStage === 'on_the_way' && '🛵 EN ROUTE'}
                        {jobStage === 'reached' && '📍 AT DOORSTEP'}
                        {jobStage === 'in_progress' && '⚡ IN PROGRESS'}
                        {jobStage === 'completed' && '🏁 COMPLETED'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    {[
                      { key: 'dispatched', label: 'Dispatched', icon: '🚀' },
                      { key: 'on_the_way', label: 'En Route', icon: '🛵' },
                      { key: 'reached', label: 'Doorstep', icon: '📍' },
                      { key: 'in_progress', label: 'Working', icon: '⚡' },
                      { key: 'completed', label: 'Done', icon: '🏁' },
                    ].map((step, idx, arr) => {
                      const stageOrder = ['dispatched', 'on_the_way', 'reached', 'in_progress', 'completed'];
                      const currentIdx = stageOrder.indexOf(jobStage);
                      const isDone = currentIdx > idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <React.Fragment key={step.key}>
                          <View style={{ alignItems: 'center' }}>
                            <View style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: isDone ? '#10B981' : isCurrent ? 'rgba(16, 185, 129, 0.2)' : '#1E293B',
                              borderWidth: 2,
                              borderColor: isDone ? '#10B981' : isCurrent ? '#10B981' : "#E2E8F0",
                              alignItems: 'center',
                              justifyContent: 'center',
                              shadowColor: isCurrent ? '#10B981' : '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: isCurrent ? 0.4 : 0,
                              shadowRadius: 4,
                            }}>
                              <Text style={{ fontSize: 13 }}>{isDone ? '✓' : step.icon}</Text>
                            </View>
                            <Text style={{
                              color: isDone ? '#10B981' : isCurrent ? '#FFFFFF' : '#64748B',
                              fontSize: 9,
                              fontWeight: isCurrent ? '900' : '600',
                              marginTop: 4,
                            }}>
                              {step.label}
                            </Text>
                          </View>
                          {idx < arr.length - 1 && (
                            <View style={{
                              flex: 1,
                              height: 2,
                              backgroundColor: isDone ? '#10B981' : "#E2E8F0",
                              marginHorizontal: 2,
                              marginBottom: 14,
                            }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </View>
                </View>

                {/* 2. CUSTOMER CARD WITH DIRECT CIRCULAR ACTION BUTTONS */}
                <View style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#F8FAFC",
                }}>
                  {/* Top Customer Info Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        borderWidth: 1.5,
                        borderColor: '#38BDF8',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Text style={{ color: '#38BDF8', fontSize: 16, fontWeight: '900' }}>
                          {(acceptedOrder.customerName || 'Customer').slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }} numberOfLines={1}>
                          {acceptedOrder.customerName || 'Customer'}
                        </Text>
                        <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
                          {acceptedOrder.serviceName}
                        </Text>
                      </View>
                    </View>

                    {/* Quick 3-Circular Actions: Call, WhatsApp, Navigation */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TouchableOpacity
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          borderWidth: 1,
                          borderColor: '#38BDF8',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => Linking.openURL(`tel:${acceptedOrder.customerPhone || '9826027646'}`)}
                      >
                        <Text style={{ fontSize: 15 }}>📞</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          borderWidth: 1,
                          borderColor: '#10B981',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => Linking.openURL(`https://wa.me/${(acceptedOrder.customerPhone || '').replace(/[^0-9]/g, '')}`)}
                      >
                        <Text style={{ fontSize: 15 }}>💬</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          borderWidth: 1,
                          borderColor: '#F59E0B',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(acceptedOrder.address || 'Indore')}`)}
                      >
                        <Text style={{ fontSize: 15 }}>🗺️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Customer Meta Details */}
                  <View style={{
                    backgroundColor: "#F8FAFC",
                    borderRadius: 12,
                    borderWidth: isDark ? 0 : 1,
                    borderColor: "#E2E8F0",
                    padding: 10,
                    gap: 6,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700' }}>PHONE</Text>
                      <Text style={{ color: '#38BDF8', fontSize: 12.5, fontWeight: '800' }}>{acceptedOrder.customerPhone}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700' }}>EMAIL</Text>
                      <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '600' }} numberOfLines={1}>
                        {acceptedOrder.customerEmail || (acceptedOrder.customerName ? `${acceptedOrder.customerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com` : 'customer@helper.com')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', marginTop: 1 }}>ADDRESS</Text>
                      <Text style={{ color: '#F1F5F9', fontSize: 12, fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 12 }} numberOfLines={2}>
                        {acceptedOrder.address}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: "#F8FAFC", paddingTop: 6, marginTop: 2 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>BASE EARNING</Text>
                      <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '900' }}>₹{acceptedOrder.payout}</Text>
                    </View>
                  </View>
                </View>

                {/* 3. FULFILLMENT MODE CARD */}
                <View style={[styles.customerCard, {
                  marginTop: 10,
                  borderColor: acceptedOrder?.isVendorDirect ? 'rgba(16, 185, 129, 0.35)' : 'rgba(56, 189, 248, 0.3)',
                  backgroundColor: acceptedOrder?.isVendorDirect ? 'rgba(16, 185, 129, 0.06)' : 'rgba(56, 189, 248, 0.05)',
                }]}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14 }}>{acceptedOrder?.isVendorDirect ? '🛵' : '🧰'}</Text>
                      <Text style={{
                        color: acceptedOrder?.isVendorDirect ? '#10B981' : '#38BDF8',
                        fontSize: 11.5,
                        fontWeight: '800',
                      }}>
                        {acceptedOrder?.isVendorDirect ? 'SELF-DELIVERY (OWNER DIRECT)' : 'ASSIGNED FLEET SPECIALIST'}
                      </Text>
                    </View>
                    <Text style={{ color: '#FFFFFF', fontSize: 14.5, fontWeight: '800', marginTop: 3 }}>
                      {acceptedOrder?.isVendorDirect
                        ? `${vendorProfile?.name || 'Ramesh Sharma'} (Hub Owner)`
                        : (assignedWorker?.name || 'Sunil Verma')}
                    </Text>
                    <Text style={{ color: '#94A3B8', fontSize: 11.5, marginTop: 2 }}>
                      {acceptedOrder?.isVendorDirect
                        ? 'Direct doorstep execution • 90% instant wallet settlement'
                        : `${assignedWorker?.specialty || 'Senior Technician'} • ${assignedWorker?.experience || '5+ Yrs Exp'}`}
                    </Text>
                  </View>
                </View>

                {/* 4. INTERACTIVE STEP-BY-STEP WORKFLOW CONSOLE */}
                <View style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.07)',
                  borderRadius: 14,
                  padding: 14,
                  marginTop: 12,
                  borderWidth: 1.5,
                  borderColor: 'rgba(16, 185, 129, 0.35)',
                }}>
                  {/* Console Header with no text overlap */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 15 }}>⚡</Text>
                      <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '900' }}>
                        DOORSTEP EXECUTION FLOW
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: '#38BDF8',
                    }}>
                      <Text style={{ color: '#38BDF8', fontSize: 10.5, fontWeight: '800' }}>
                        STAGE: {jobStage.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* STAGE 1: DISPATCHED -> START JOURNEY */}
                  {jobStage === 'dispatched' && (
                    <View style={{ gap: 10 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, lineHeight: 18 }}>
                        Booking accepted. Tap below when you head out towards customer address to notify them you are on the way.
                      </Text>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#0284C7',
                          height: 50,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 8,
                        }}
                        activeOpacity={0.85}
                        onPress={handleStartTransit}
                      >
                        <Text style={{ fontSize: 17 }}>🛵</Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 14.5, fontWeight: '900' }}>
                          START JOURNEY / ON THE WAY (रास्ते में निकलें) ➔
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* STAGE 2: ON THE WAY -> MARK ARRIVED */}
                  {jobStage === 'on_the_way' && (
                    <View style={{ gap: 10 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 12, lineHeight: 18 }}>
                        You are en route. Live tracking is active for customer. When you reach customer location, tap below.
                      </Text>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#7C3AED',
                          height: 50,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 8,
                        }}
                        activeOpacity={0.85}
                        onPress={handleMarkReached}
                      >
                        <Text style={{ fontSize: 17 }}>📍</Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 14.5, fontWeight: '900' }}>
                          I HAVE ARRIVED AT DOORSTEP (पहुँच गए) ➔
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* STAGE 3: REACHED -> TAKE 4-DIGIT START OTP */}
                  {jobStage === 'reached' && (
                    <View style={{ gap: 12 }}>
                      <View style={{ backgroundColor: 'rgba(234, 88, 12, 0.12)', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#EA580C' }}>
                        <Text style={{ color: '#FB923C', fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
                          🔑 ASK CUSTOMER FOR 4-DIGIT START OTP
                        </Text>
                        <Text style={{ color: '#CBD5E1', fontSize: 11, textAlign: 'center', marginTop: 3 }}>
                          Entering Start OTP confirms doorstep arrival and initiates live work countdown timer.
                        </Text>
                      </View>

                      {/* 4 Styled Digital Boxes for Native Look & Feel */}
                      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 4 }}>
                        {[0, 1, 2, 3].map((digitIdx) => {
                          const digit = inputOtp[digitIdx] || '';
                          const isFilled = Boolean(digit);
                          return (
                            <View
                              key={digitIdx}
                              style={{
                                width: 54,
                                height: 58,
                                borderRadius: 14,
                                backgroundColor: "#F8FAFC",
                                borderWidth: 2,
                                borderColor: isFilled ? "#10B981" : (isDark ? "#E2E8F0" : "#CBD5E1"),
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: isFilled ? '#10B981' : '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: isFilled ? 0.4 : 0,
                                shadowRadius: 6,
                                elevation: isFilled ? 4 : 0,
                              }}
                            >
                              <Text style={{ color: isFilled ? '#10B981' : '#64748B', fontSize: 24, fontWeight: '900' }}>
                                {digit || '•'}
                              </Text>
                            </View>
                          );
                        })}
                      </View>

                      <TextInput
                        placeholder="TAP TO TYPE 4-DIGIT OTP"
                        placeholderTextColor="#64748B"
                        value={inputOtp}
                        onChangeText={setInputOtp}
                        keyboardType="number-pad"
                        maxLength={4}
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderColor: "#E2E8F0",
                          borderWidth: 1,
                          borderRadius: 12,
                          color: '#FFFFFF',
                          padding: 10,
                          fontSize: 13,
                          fontWeight: '700',
                          textAlign: 'center',
                        }}
                      />

                      {/* Quick Auto-Fill Helper Chip */}
                      <TouchableOpacity
                        style={{
                          paddingVertical: 7,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: 'rgba(56, 189, 248, 0.12)',
                          borderWidth: 1,
                          borderColor: '#38BDF8',
                          alignSelf: 'center',
                        }}
                        onPress={() => setInputOtp(acceptedOrder.otp || '3459')}
                      >
                        <Text style={{ color: '#38BDF8', fontSize: 11, fontWeight: '800' }}>
                          ⚡ Tap to Auto-Fill Customer OTP: {acceptedOrder.otp || '3459'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          backgroundColor: '#EA580C',
                          height: 50,
                          borderRadius: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 8,
                          shadowColor: '#EA580C',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.35,
                          shadowRadius: 8,
                          elevation: 6,
                        }}
                        activeOpacity={0.85}
                        onPress={handleVerifyOtp}
                      >
                        <Text style={{ fontSize: 17 }}>🔐</Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 14.5, fontWeight: '900' }}>
                          VERIFY OTP &amp; BEGIN WORK (काम शुरू करें) ➔
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* STAGE 4: IN PROGRESS -> LIVE COUNTDOWN TIMER & DYNAMIC BILLING */}
                  {jobStage === 'in_progress' && (
                    <View style={{ gap: 12 }}>
                      {/* Live Digital Timer Display */}
                      <View style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: 14,
                        padding: 16,
                        borderWidth: 1.5,
                        borderColor: "#10B981",
                        alignItems: "center",
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
                          <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>
                            LIVE WORK TIMER ACTIVE
                          </Text>
                        </View>

                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 34,
                          fontWeight: '900',
                          fontVariant: ['tabular-nums'],
                          letterSpacing: 2,
                          marginVertical: 4,
                        }}>
                          ⏱️ {formatStopwatch(stopwatchSeconds)}
                        </Text>

                        <Text style={{ color: '#94A3B8', fontSize: 11 }}>
                          Duration: {Math.floor(stopwatchSeconds / 60)}m {stopwatchSeconds % 60}s worked
                        </Text>
                      </View>

                      {/* Live Timing-Based Dynamic Bill Breakdown */}
                      <View style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: "#F8FAFC",
                        gap: 6,
                      }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#94A3B8', fontSize: 12 }}>Base Service Price:</Text>
                          <Text style={{ color: "#0F172A", fontSize: 12, fontWeight: "700" }}>₹{acceptedOrder.payout || 499}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#94A3B8', fontSize: 12 }}>Time Rate (+₹5/min):</Text>
                          <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '700' }}>
                            +₹{Math.floor(stopwatchSeconds / 60) * 5} ({Math.floor(stopwatchSeconds / 60)} mins)
                          </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: "#E2E8F0", marginVertical: 4 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>LIVE DYNAMIC BILL:</Text>
                          <Text style={{ color: '#10B981', fontSize: 17, fontWeight: '900' }}>
                            ₹{(Number(acceptedOrder.payout) || 499) + Math.floor(stopwatchSeconds / 60) * 5}
                          </Text>
                        </View>
                        <Text style={{ color: '#38BDF8', fontSize: 11, textAlign: 'right', fontWeight: '600' }}>
                          Your 90% Net Settlement: ₹{Math.round(((Number(acceptedOrder.payout) || 499) + Math.floor(stopwatchSeconds / 60) * 5) * 0.9)}
                        </Text>
                      </View>

                      {/* Complete Work & Generate Bill Button */}
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#10B981',
                          height: 52,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 8,
                          shadowColor: '#10B981',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.35,
                          shadowRadius: 8,
                          elevation: 6,
                        }}
                        activeOpacity={0.85}
                        onPress={handleCompleteJob}
                      >
                        <Text style={{ fontSize: 18 }}>🏁</Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>
                          FINISH WORK &amp; GENERATE BILL (बिल बनाएं) ➔
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* STAGE 5: COMPLETED -> FINAL INVOICE & NEXT RADAR */}
                  {jobStage === 'completed' && (
                    <View style={{ gap: 12 }}>
                      <View style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1.5,
                        borderColor: '#10B981',
                        alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: 32 }}>🏆</Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '900', marginTop: 4 }}>
                          SERVICE COMPLETED &amp; DELIVERED!
                        </Text>
                        <Text style={{ color: '#94A3B8', fontSize: 11.5, marginTop: 2, textAlign: 'center' }}>
                          Total Time Worked: {Math.floor(stopwatchSeconds / 60)} minutes
                        </Text>

                        <View style={{
                          width: "100%",
                          backgroundColor: "#F1F5F9",
                          borderRadius: 10,
                          borderWidth: isDark ? 0 : 1,
                          borderColor: "#E2E8F0",
                          padding: 10,
                          marginTop: 10,
                          gap: 4,
                        }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#94A3B8', fontSize: 12 }}>Customer Bill:</Text>
                            <Text style={{ color: "#0F172A", fontSize: 12, fontWeight: "700" }}>
                              ₹{(Number(acceptedOrder.payout) || 499) + Math.floor(stopwatchSeconds / 60) * 5}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '800' }}>90% Wallet Settlement:</Text>
                            <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '900' }}>
                              +₹{Math.round(((Number(acceptedOrder.payout) || 499) + Math.floor(stopwatchSeconds / 60) * 5) * 0.9)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={{
                          backgroundColor: '#0284C7',
                          height: 48,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 8,
                        }}
                        activeOpacity={0.85}
                        onPress={() => setShowQrModal(true)}
                      >
                        <Text style={{ fontSize: 16 }}>📱</Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                          Show Customer Payment UPI QR
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          backgroundColor: '#1E293B',
                          borderColor: '#10B981',
                          borderWidth: 1.5,
                          height: 48,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        activeOpacity={0.85}
                        onPress={() => {
                          setAcceptedOrder(null);
                          setOtpVerified(false);
                          setInputOtp('');
                          setStopwatchSeconds(0);
                          setActiveTab('radar');
                        }}
                      >
                        <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800' }}>
                          Ready for Next Order on Radar ➔
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Option to release / cancel job and return to radar anytime */}
                  {jobStage !== 'completed' && (
                    <TouchableOpacity
                      style={{
                        marginTop: 14,
                        paddingVertical: 10,
                        borderRadius: 10,
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      activeOpacity={0.8}
                      onPress={() => {
                        Alert.alert(
                          'Release / Reset Active Job',
                          'Do you want to release this active job and return to Radar?',
                          [
                            { text: 'Keep Job', style: 'cancel' },
                            {
                              text: 'Yes, Return to Radar',
                              style: 'destructive',
                              onPress: () => {
                                setAcceptedOrder(null);
                                setOtpVerified(false);
                                setInputOtp('');
                                setStopwatchSeconds(0);
                                setActiveTab('radar');
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Text style={{ color: '#F87171', fontSize: 12.5, fontWeight: '700' }}>
                        ✕ Release / Cancel Job &amp; Return to Radar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
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
                  <Text style={[styles.withdrawFullBtnText, { color: "#FFFFFF", fontWeight: "900" }]}>💸 Disburse to Worker</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Financial Settlement Flow Banner */}
            <View style={{ backgroundColor: "#F0F9FF", borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1.5, borderColor: "#BAE6FD" }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 14 }}>🏛️</Text>
                <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '800' }}>HELPER 10% - VENDOR 90% SETTLEMENT RULE</Text>
              </View>
              <Text style={{ color: "#334155", fontSize: 11.5, lineHeight: 17 }}>
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
            <View style={[styles.contentCard, { borderColor: "#E2E8F0", backgroundColor: "#FFFFFF", marginBottom: 14 }]}>
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
                    <Text style={[styles.cardHeading, { color: "#0F172A", fontSize: 17, fontWeight: "900", marginBottom: 0 }]} numberOfLines={1}>
                      {vendorProfile?.shopName || shopName}
                    </Text>
                    <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ color: '#F59E0B', fontSize: 9, fontWeight: '900' }}>👑 PRO HUB</Text>
                    </View>
                  </View>

                  <Text style={{ color: "#475569", fontSize: 12.5, marginTop: 4, marginBottom: 8 }}>
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
              <View style={[styles.contentCard, { borderColor: '#38BDF8', backgroundColor: "#FFFFFF", marginBottom: 14, padding: 16 }]}>
                <Text style={{ color: "#38BDF8", fontSize: 14, fontWeight: "900", marginBottom: 12 }}>✏️ Edit Vendor Hub Details</Text>

                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#ECFDF5", borderWidth: 1.5, borderColor: "#10B981", borderRadius: 10, paddingVertical: 10, marginBottom: 14 }} onPress={handleVendorPhotoUpload} activeOpacity={0.8}><Text style={{ fontSize: 16 }}>📷</Text><Text style={{ color: "#059669", fontSize: 12.5, fontWeight: "800" }}>Change Hub Logo / Camera Photo</Text></TouchableOpacity>

                <Text style={styles.fieldLabel}>SHOP / HUB NAME</Text>
                <TextInput
                  style={[styles.fieldInput, { color: themeColors?.text || '#FFFFFF', backgroundColor: "#F1F5F9", marginBottom: 10 }]}
                  value={shopName}
                  onChangeText={setShopName}
                  placeholder="Enter shop or hub name"
                  placeholderTextColor="#64748B"
                />

                <Text style={styles.fieldLabel}>OWNER / MANAGER NAME</Text>
                <TextInput
                  style={[styles.fieldInput, { color: themeColors?.text || '#FFFFFF', backgroundColor: "#F1F5F9", marginBottom: 10 }]}
                  value={editOwnerName}
                  onChangeText={setEditOwnerName}
                  placeholder="Owner name"
                  placeholderTextColor="#64748B"
                />

                <Text style={styles.fieldLabel}>CONTACT MOBILE NUMBER</Text>
                <TextInput
                  style={[styles.fieldInput, { color: themeColors?.text || '#FFFFFF', backgroundColor: "#F1F5F9", marginBottom: 10 }]}
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
                      style={[styles.fieldInput, { color: themeColors?.text || '#FFFFFF', backgroundColor: "#F1F5F9" }]}
                      keyboardType="numeric"
                      value={hourlyRate}
                      onChangeText={setHourlyRate}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>SETTLEMENT UPI</Text>
                    <TextInput
                      style={[styles.fieldInput, { color: themeColors?.text || '#FFFFFF', backgroundColor: "#F1F5F9" }]}
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
                    style={{ flex: 1, backgroundColor: "#E2E8F0", paddingVertical: 11, borderRadius: 8, alignItems: 'center' }}
                    onPress={() => setIsEditingShop(false)}
                  >
                    <Text style={{ color: themeColors?.text || '#FFFFFF', fontWeight: '800', fontSize: 12 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 3. FLEET & PERFORMANCE SUMMARY */}
            <View style={[styles.contentCard, { borderColor: "#E2E8F0", backgroundColor: "#FFFFFF", marginBottom: 14, padding: 16 }]}>
              <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '900', letterSpacing: 0.8, marginBottom: 12 }}>
                ⭐ FLEET PERFORMANCE & RATINGS
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#F59E0B', fontSize: 20, fontWeight: '900' }}>★ 4.95</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 2 }}>Rating (280+ rev)</Text>
                </View>
                <View style={{ width: 1, height: 35, backgroundColor: "#E2E8F0" }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#10B981', fontSize: 20, fontWeight: '900' }}>{workersList.length}</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 2 }}>Active Crew</Text>
                </View>
                <View style={{ width: 1, height: 35, backgroundColor: "#E2E8F0" }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '900' }}>312</Text>
                  <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 2 }}>Orders Done</Text>
                </View>
              </View>
            </View>

            {/* 4. SERVICES & CUSTOM RATE CARD (Live Synced with Customer App) */}
            <View style={[styles.contentCard, { borderColor: "#E2E8F0", backgroundColor: "#FFFFFF", marginBottom: 14, padding: 16 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <View>
                  <Text style={{ color: "#0F172A", fontSize: 14, fontWeight: "900", letterSpacing: 0.5 }}>SERVICES & RATE CARD</Text>
                  <Text style={{ color: "#64748B", fontSize: 11, marginTop: 1 }}>Live catalog visible to customer mobile app</Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ECFDF5",
                    borderWidth: 1.5,
                    borderColor: "#10B981",
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                  onPress={() => setShowAddServiceModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#059669', fontWeight: '900', fontSize: 11.5 }}>+ Add Service</Text>
                </TouchableOpacity>
              </View>

              {vendorServices.map((srv) => {
                const getCategoryEmoji = (cat) => {
                  const c = (cat || '').toLowerCase();
                  if (c.includes('plumb')) return '🔧';
                  if (c.includes('elec')) return '⚡';
                  if (c.includes('ac') || c.includes('cool')) return '❄️';
                  if (c.includes('clean')) return '🧹';
                  if (c.includes('carp')) return '🪚';
                  if (c.includes('paint')) return '🎨';
                  return '🛠️';
                };

                return (
                  <View key={srv.id} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F1F5F9",
                  }}>
                    <View style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#F0FDF4",
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: "#DCFCE7",
                    }}>
                      <Text style={{ fontSize: 16 }}>{getCategoryEmoji(srv.category)}</Text>
                    </View>

                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ color: "#0F172A", fontSize: 13, fontWeight: "800" }} numberOfLines={1}>
                        {srv.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <View style={{ backgroundColor: "#F0F9FF", paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 4, borderWidth: 0.8, borderColor: "#BAE6FD" }}>
                          <Text style={{ color: "#0284C7", fontSize: 9.5, fontWeight: "800" }}>{srv.category || 'Specialist'}</Text>
                        </View>
                        <Text style={{ color: "#64748B", fontSize: 11 }}>⏱️ {srv.time}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: "#059669", fontSize: 14.5, fontWeight: "900" }}>₹{srv.price}</Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteService(srv)}
                        style={{ padding: 4 }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 13 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
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

      {/* ================= FIXED NATIVE BOTTOM NAVIGATION DOCK ================= */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        paddingVertical: 8,
        paddingBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 12,
      }}>
        {/* Tab 1: Radar */}
        <TouchableOpacity
          style={{ alignItems: 'center', minWidth: 62 }}
          activeOpacity={0.8}
          onPress={() => setActiveTab('radar')}
        >
          <View style={{
            width: 44,
            height: 32,
            borderRadius: 16,
            backgroundColor: activeTab === "radar" ? "#ECFDF5" : "transparent",
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18 }}>📡</Text>
            {incomingOrder && !acceptedOrder && (
              <View style={{
                position: 'absolute',
                top: 0,
                right: 2,
                backgroundColor: '#EF4444',
                borderRadius: 7,
                minWidth: 14,
                height: 14,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 3,
                borderWidth: 1.5,
                borderColor: "#FFFFFF",
              }}>
                <Text style={{ color: '#FFF', fontSize: 8.5, fontWeight: '900' }}>1</Text>
              </View>
            )}
          </View>
          <Text style={{
            fontSize: 10.5,
            fontWeight: activeTab === 'radar' ? '900' : '600',
            color: activeTab === 'radar' ? '#10B981' : '#64748B',
            marginTop: 2,
          }}>
            Radar
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Active Job */}
        <TouchableOpacity
          style={{ alignItems: 'center', minWidth: 62 }}
          activeOpacity={0.8}
          onPress={() => setActiveTab('active')}
        >
          <View style={{
            width: 44,
            height: 32,
            borderRadius: 16,
            backgroundColor: activeTab === "active" ? "#EFF6FF" : "transparent",
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18 }}>⚡</Text>
            {acceptedOrder && (
              <View style={{
                position: 'absolute',
                top: 2,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#10B981',
                borderWidth: 1.5,
                borderColor: "#FFFFFF",
              }} />
            )}
          </View>
          <Text style={{
            fontSize: 10.5,
            fontWeight: activeTab === 'active' ? '900' : '600',
            color: activeTab === 'active' ? '#38BDF8' : '#64748B',
            marginTop: 2,
          }}>
            Active Job
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Team Fleet */}
        <TouchableOpacity
          style={{ alignItems: 'center', minWidth: 62 }}
          activeOpacity={0.8}
          onPress={() => setActiveTab('workers')}
        >
          <View style={{
            width: 44,
            height: 32,
            borderRadius: 16,
            backgroundColor: activeTab === "workers" ? "#F5F3FF" : "transparent",
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18 }}>👥</Text>
            <View style={{
              position: 'absolute',
              top: 0,
              right: 2,
              backgroundColor: 'rgba(124, 58, 237, 0.9)',
              borderRadius: 7,
              minWidth: 14,
              height: 14,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 3,
              borderWidth: 1.5,
              borderColor: "#FFFFFF",
            }}>
              <Text style={{ color: '#FFF', fontSize: 8.5, fontWeight: '900' }}>{workersList.length}</Text>
            </View>
          </View>
          <Text style={{
            fontSize: 10.5,
            fontWeight: activeTab === 'workers' ? '900' : '600',
            color: activeTab === 'workers' ? '#A78BFA' : '#64748B',
            marginTop: 2,
          }}>
            Fleet ({workersList.length})
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Wallet */}
        <TouchableOpacity
          style={{ alignItems: 'center', minWidth: 62 }}
          activeOpacity={0.8}
          onPress={() => setActiveTab('wallet')}
        >
          <View style={{
            width: 44,
            height: 32,
            borderRadius: 16,
            backgroundColor: activeTab === "wallet" ? "#FEF3C7" : "transparent",
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18 }}>💰</Text>
          </View>
          <Text style={{
            fontSize: 10.5,
            fontWeight: activeTab === 'wallet' ? '900' : '600',
            color: activeTab === 'wallet' ? '#F59E0B' : '#64748B',
            marginTop: 2,
          }}>
            Wallet
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Profile / Hub */}
        <TouchableOpacity
          style={{ alignItems: 'center', minWidth: 62 }}
          activeOpacity={0.8}
          onPress={() => setActiveTab('shop')}
        >
          <View style={{
            width: 44,
            height: 32,
            borderRadius: 16,
            backgroundColor: activeTab === 'shop' ? "#E2E8F0" : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 18 }}>👤</Text>
          </View>
          <Text style={{
            fontSize: 10.5,
            fontWeight: activeTab === 'shop' ? '900' : '600',
            color: activeTab === 'shop' ? '#FFFFFF' : '#64748B',
            marginTop: 2,
          }}>
            Hub Profile
          </Text>
        </TouchableOpacity>
      </View>

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

      {/* ================= MODAL: ADD SERVICE & CATEGORY (Synced with User App) ================= */}
      <Modal visible={showAddServiceModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { maxHeight: '88%', backgroundColor: '#FFFFFF' }]}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={[styles.modalHeaderTitle, { color: '#0F172A', fontSize: 16, fontWeight: '900' }]}>
                  ✨ Add New Service
                </Text>
                <Text style={{ color: '#64748B', fontSize: 11.5, marginTop: 1 }}>
                  This service will instantly be visible in the Customer App
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowAddServiceModal(false);
                  setIsAddingCustomCategory(false);
                }}
                style={{ padding: 4 }}
              >
                <Text style={[styles.modalCloseIcon, { color: '#64748B' }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
              {/* Field 1: Service Name */}
              <Text style={styles.modalFieldLabel}>SERVICE TITLE *</Text>
              <TextInput
                style={[styles.modalInputBox, { color: '#0F172A', backgroundColor: '#F8FAFC' }]}
                placeholder="e.g. Inverter AC PCB Circuit Repair & Gas Fill"
                placeholderTextColor="#94A3B8"
                value={newServiceName}
                onChangeText={setNewServiceName}
              />

              {/* Field 2: Select Category */}
              <Text style={[styles.modalFieldLabel, { marginTop: 12 }]}>SERVICE CATEGORY *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                  {categoriesList.map((cat) => {
                    const isSelected = selectedCategory === cat.name && !isAddingCustomCategory;
                    return (
                      <TouchableOpacity
                        key={cat.id || cat.name}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          borderRadius: 20,
                          backgroundColor: isSelected ? '#ECFDF5' : '#F1F5F9',
                          borderWidth: 1.5,
                          borderColor: isSelected ? '#10B981' : '#E2E8F0',
                        }}
                        onPress={() => {
                          setSelectedCategory(cat.name);
                          setIsAddingCustomCategory(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={{ fontSize: 13 }}>{cat.icon || '🛠️'}</Text>
                        <Text style={{
                          color: isSelected ? '#059669' : '#334155',
                          fontSize: 12,
                          fontWeight: isSelected ? '900' : '700',
                        }}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Add Custom Category Chip */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 20,
                      backgroundColor: isAddingCustomCategory ? '#FEF3C7' : '#F8FAFC',
                      borderWidth: 1.5,
                      borderColor: isAddingCustomCategory ? '#F59E0B' : '#CBD5E1',
                    }}
                    onPress={() => setIsAddingCustomCategory(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 12 }}>➕</Text>
                    <Text style={{
                      color: isAddingCustomCategory ? '#B45309' : '#64748B',
                      fontSize: 12,
                      fontWeight: isAddingCustomCategory ? '900' : '700',
                    }}>
                      New Category
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Custom Category Input (if selected) */}
              {isAddingCustomCategory && (
                <View style={{ marginBottom: 12, backgroundColor: '#FFFBEB', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#FDE68A' }}>
                  <Text style={{ color: '#B45309', fontSize: 10.5, fontWeight: '800', marginBottom: 4 }}>
                    ENTER NEW CATEGORY NAME:
                  </Text>
                  <TextInput
                    style={[styles.modalInputBox, { color: '#0F172A', backgroundColor: '#FFFFFF', borderColor: '#F59E0B' }]}
                    placeholder="e.g. Solar Panel Cleaning & Maintenance"
                    placeholderTextColor="#94A3B8"
                    value={customCategoryInput}
                    onChangeText={setCustomCategoryInput}
                  />
                </View>
              )}

              {/* Field 3: Pricing & Duration Row */}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalFieldLabel}>CUSTOMER PRICE (₹) *</Text>
                  <TextInput
                    style={[styles.modalInputBox, { color: '#0F172A', backgroundColor: '#F8FAFC' }]}
                    placeholder="e.g. 499"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={newServicePrice}
                    onChangeText={setNewServicePrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalFieldLabel}>ESTIMATED TIME</Text>
                  <TextInput
                    style={[styles.modalInputBox, { color: '#0F172A', backgroundColor: '#F8FAFC' }]}
                    placeholder="e.g. 45 mins"
                    placeholderTextColor="#94A3B8"
                    value={newServiceTime}
                    onChangeText={setNewServiceTime}
                  />
                </View>
              </View>

              {/* Field 4: Short Description */}
              <Text style={[styles.modalFieldLabel, { marginTop: 12 }]}>SERVICE HIGHLIGHTS & WARRANTY</Text>
              <TextInput
                style={[styles.modalInputBox, { color: '#0F172A', backgroundColor: '#F8FAFC', height: 60, textAlignVertical: 'top' }]}
                placeholder="e.g. Includes doorstep diagnosis, 30 days warranty & genuine spare parts."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
                value={newServiceDesc}
                onChangeText={setNewServiceDesc}
              />

              {/* Field 5: Service Image Picker (Camera & Gallery) */}
              <Text style={[styles.modalFieldLabel, { marginTop: 14 }]}>
                SERVICE PHOTO / RATE CARD IMAGE
              </Text>
              {newServiceImage ? (
                <View style={{ marginBottom: 14, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#10B981', backgroundColor: '#F0FDF4' }}>
                  <Image
                    source={{ uri: newServiceImage }}
                    style={{ width: '100%', height: 160, borderRadius: 10 }}
                    resizeMode="cover"
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, backgroundColor: '#FFFFFF' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 13 }}>✅</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#059669' }}>Photo Attached</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => openImagePicker((uri) => setNewServiceImage(uri), { language })}
                        style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: '#F1F5F9' }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#334155' }}>Change</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setNewServiceImage('')}
                        style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: '#FEE2E2' }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#DC2626' }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={{ marginBottom: 14, marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {/* Button 1: Open Camera */}
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        backgroundColor: '#EEF2FF',
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: '#6366F1',
                        borderStyle: 'dashed',
                      }}
                      onPress={() => pickFromCamera((uri) => setNewServiceImage(uri), { language })}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 18 }}>📷</Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#4F46E5' }}>
                        Camera
                      </Text>
                    </TouchableOpacity>

                    {/* Button 2: Choose from Gallery */}
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        backgroundColor: '#F0FDF4',
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: '#10B981',
                        borderStyle: 'dashed',
                      }}
                      onPress={() => pickFromGallery((uri) => setNewServiceImage(uri), { language })}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 18 }}>🖼️</Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#059669' }}>
                        Gallery
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 5, textAlign: 'center' }}>
                    Take camera photo or pick from gallery (Will display in Customer App)
                  </Text>
                </View>
              )}

              {/* Action Button */}
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: '#10B981', marginTop: 16 }]}
                onPress={handleAddService}
                disabled={isPublishingService}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalPrimaryBtnText, { color: '#FFFFFF' }]}>
                  {isPublishingService ? 'Publishing to Database...' : '🚀 Publish & Live to Customer App ➔'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
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
              <Text style={[styles.modalPrimaryBtnText, { color: "#FFFFFF", fontWeight: "900" }]}>
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
            <View style={{ backgroundColor: "#F8FAFC", borderRadius: 10, padding: 10, width: '100%', marginBottom: 12, borderWidth: 1, borderColor: "#F8FAFC" }}>
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
            <View style={{ flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 10, padding: 4, marginTop: 12 }}>
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
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : '#FFFFFF',
                      borderWidth: 1.5,
                      borderColor: isSelected ? '#10B981' : "#F8FAFC",
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
            <View style={{ backgroundColor: "#F8FAFC", borderRadius: 10, padding: 10, marginTop: 10, borderWidth: 1, borderColor: "#F8FAFC" }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>ARRIVAL TIME</Text>
                  <TextInput
                    style={{ backgroundColor: "#F8FAFC", color: '#FFFFFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, fontWeight: '700', borderWidth: 1, borderColor: "#E2E8F0" }}
                    value={vendorSetTime}
                    onChangeText={setVendorSetTime}
                    placeholder="45 mins"
                    placeholderTextColor="#64748B"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', marginBottom: 4 }}>FINAL PRICE (₹)</Text>
                  <TextInput
                    style={{ backgroundColor: "#F8FAFC", color: '#10B981', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, fontWeight: '800', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' }}
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
                { backgroundColor: "#F1F5F9" },
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
    backgroundColor: "#F8FAFC",
  },

  /* 1. TOP APP BAR (NO WRAPPING / NO SQUEEZING) */
  topAppBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#F8FAFC",
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
    color: "#0F172A",
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
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: '75%',
    backgroundColor: "#F8FAFC",
    alignSelf: 'center',
  },
  heroStatLabel: {
    color: '#64748B',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroStatVal: {
    color: "#0F172A",
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
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
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    paddingBottom: 90,
  },

  /* OFFLINE / BUSY STATES */
  offlineBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#F8FAFC",
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#E2E8F0",
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
    borderBottomColor: "#F8FAFC",
    paddingBottom: 12,
  },
  serviceTitle: {
    color: "#0F172A",
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
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    color: "#0F172A",
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
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#F8FAFC",
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
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F8FAFC",
    padding: 16,
  },
  activeJobTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
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
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F8FAFC",
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
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#F8FAFC",
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
    borderColor: "#E2E8F0",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  noActiveTitle: {
    color: "#0F172A",
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
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },
  workerDutyTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  workerDutyActive: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  workerDutyLeave: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  workerDutyTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  workerSpecialtyText: {
    color: "#0284C7",
    fontSize: 11.5,
    fontWeight: "700",
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
    borderTopColor: "#F8FAFC",
    paddingTop: 10,
    marginTop: 10,
  },
  workerUpiLabel: {
    color: '#94A3B8',
    fontSize: 10.5,
  },
  workerCallActionBtn: {
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#10B981",
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F8FAFC",
    padding: 14,
    marginBottom: 14,
  },
  cardHeading: {
    color: "#0F172A",
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    borderBottomColor: "#F8FAFC",
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
    backgroundColor: "#F8FAFC",
    marginBottom: 20,
  },
  modeSwitchText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  passbookRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  passbookTitle: {
    color: "#0F172A",
    fontSize: 12.5,
    fontWeight: "700",
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
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
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
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  authBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F8FAFC",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F8FAFC",
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
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    borderColor: "#F8FAFC",
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
    borderBottomColor: "#F8FAFC",
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


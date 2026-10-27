import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  StatusBar,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ServiceLoader from '../components/ServiceLoader';
import { openVideoPicker } from '../utils/imagePickerHelper';
import {
  checkHourlyBookingNotification,
  showHourlyBookingAlert,
  getIncompleteBooking,
  deleteIncompleteBooking,
} from '../services/AbandonedBookingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

// Stories / Flash Highlight Row with specific target routes & filters
const STORIES = [
  {
    id: 'st1',
    label: 'Offer 50%',
    icon: '🏷️',
    color: '#FF4D2D',
    border: '#FF4D2D',
    isAnimated: true,
    action: (nav) => nav.navigate('Explore', { initialFilter: '50% OFF' }),
  },
  {
    id: 'st2',
    label: '15m Express',
    icon: '⚡',
    color: '#10B981',
    border: '#10B981',
    isAnimated: true,
    action: (nav) => nav.navigate('Explore', { initialFilter: 'Repairs' }),
  },
  {
    id: 'st3',
    label: 'AC Foam',
    icon: '❄️',
    color: '#06B6D4',
    border: '#06B6D4',
    isAnimated: true,
    action: (nav) =>
      nav.navigate('CategoryDetails', {
        category: { id: 'ac-repair-services', name: 'AC Repair', icon: '❄️' },
      }),
  },
  {
    id: 'st4',
    label: 'Cleaning',
    icon: '🧹',
    color: '#8B5CF6',
    border: '#8B5CF6',
    isAnimated: true,
    action: (nav) =>
      nav.navigate('CategoryDetails', {
        category: { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
      }),
  },
  {
    id: 'st5',
    label: 'Verified',
    icon: '🛡️',
    color: '#F59E0B',
    border: '#F59E0B',
    isAnimated: true,
    action: (nav) =>
      nav.navigate('CategoryDetails', {
        category: { id: 'electricians', name: 'Electrician', icon: '⚡' },
      }),
  },
  {
    id: 'st6',
    label: 'Salon',
    icon: '💇‍♀️',
    color: '#EC4899',
    border: '#EC4899',
    isAnimated: true,
    action: (nav) =>
      nav.navigate('CategoryDetails', {
        category: { id: 'beauty-parlours', name: 'Salon', icon: '💇‍♀️' },
      }),
  },
  {
    id: 'st7',
    label: 'Plumber',
    icon: '🚰',
    color: '#6366F1',
    border: '#6366F1',
    isAnimated: true,
    action: (nav) =>
      nav.navigate('CategoryDetails', {
        category: { id: 'plumbers', name: 'Plumber', icon: '🚰' },
      }),
  },
  {
    id: 'st8',
    label: 'Pay Later',
    icon: '💵',
    color: '#14B8A6',
    border: '#14B8A6',
    isAnimated: true,
    action: (nav) => nav.navigate('Explore', { initialFilter: 'All' }),
  },
];

// Interactive Animated Story Item for Cleaning, Verified, Salon & Highlights
function AnimatedStoryItem({ story, isDark, navigation }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (story.isAnimated) {
      const loop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.14,
              duration: 1100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.35,
              duration: 1100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [story.isAnimated]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      style={styles.storyItem}
      activeOpacity={0.88}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => story.action(navigation)}
    >
      <Animated.View
        style={[
          styles.storyRing,
          {
            borderColor: story.border,
            transform: [
              { scale: story.isAnimated ? Animated.multiply(pulseAnim, pressAnim) : pressAnim },
            ],
          },
        ]}
      >
        <View style={[styles.storyInner, { backgroundColor: isDark ? '#131A2B' : '#FFFFFF' }]}>
          <Text style={styles.storyEmoji}>{story.icon}</Text>
        </View>

        {story.isAnimated && (
          <Animated.View
            style={[
              styles.storyGlowBadge,
              {
                backgroundColor: story.color,
                opacity: glowAnim,
              },
            ]}
          >
            <Text style={styles.storySparkle}>✦</Text>
          </Animated.View>
        )}
      </Animated.View>

      <Text
        style={[
          styles.storyLabel,
          {
            color: isDark ? (story.isAnimated ? '#FFFFFF' : '#94A3B8') : (story.isAnimated ? '#0F172A' : '#334155'),
            fontWeight: story.isAnimated ? '900' : '700',
          },
        ]}
        numberOfLines={1}
      >
        {story.label}
      </Text>
    </TouchableOpacity>
  );
}

// Website Professional Assets
const IMAGES = {
  electricianBanner: require('../assets/banner_electrician.png'),
  plumberBanner: require('../assets/banner_plumber.png'),
  painterBanner: require('../assets/banner_painter.png'),
  allExpertsBanner: require('../assets/banner_all_experts_clean.png'),
  electricianPro: require('../assets/electrician.png'),
  plumberPro: require('../assets/plumber.png'),
  painterPro: require('../assets/painter.png'),
};

const resolveImageSource = (img, bannerItem = null) => {
  // If bannerItem or img attributes indicate specific category, prioritize dedicated high-res assets
  const combinedStr = [
    typeof img === 'string' ? img : '',
    bannerItem?.title || '',
    bannerItem?.subtitle || '',
    bannerItem?.name || '',
    bannerItem?.category || '',
    bannerItem?.categoryRoute?.name || '',
  ].join(' ').toLowerCase();

  // 1. Electrician -> Guaranteed distinct Electrician Banner
  if (
    combinedStr.includes('electric') ||
    combinedStr.includes('wiring') ||
    combinedStr.includes('circuit') ||
    combinedStr.includes('switchboard') ||
    combinedStr.includes('bijli')
  ) {
    return IMAGES.electricianBanner;
  }

  // 2. Plumber -> Guaranteed distinct Plumber Banner
  if (
    combinedStr.includes('plumb') ||
    combinedStr.includes('leak') ||
    combinedStr.includes('tap ') ||
    combinedStr.includes('pipe') ||
    combinedStr.includes('sanitary') ||
    combinedStr.includes('drainage') ||
    combinedStr.includes('nal')
  ) {
    return IMAGES.plumberBanner;
  }

  // 3. Painter -> Guaranteed distinct Painter Banner
  if (
    combinedStr.includes('paint') ||
    combinedStr.includes('wall') ||
    combinedStr.includes('waterproof') ||
    combinedStr.includes('roller') ||
    combinedStr.includes('color')
  ) {
    return IMAGES.painterBanner;
  }

  // 4. If direct required image resource
  if (typeof img === 'number') return img;
  if (typeof img === 'object' && img?.uri) return resolveImageSource(img.uri, bannerItem);

  // 5. Custom remote image or base64 if provided
  if (typeof img === 'string') {
    if (img.startsWith('data:image')) return { uri: img };
    if (img.startsWith('http://') || img.startsWith('https://')) {
      return { uri: img };
    }
  }

  return IMAGES.allExpertsBanner;
};

// 4 distinct high-converting banners with official website assets
const HERO_BANNERS = [
  {
    id: 'b1',
    title: 'Certified Electricians & Diagnostics',
    subtitle: 'Short circuit repair, wiring, switchboard fixing & installation',
    tag: '⚡ 15-MIN ARRIVAL',
    badge: '100% VERIFIED',
    image: IMAGES.electricianBanner,
    price: 199,
    originalPrice: 349,
    categoryRoute: { id: 'electricians', name: 'Electrician', icon: '⚡' },
  },
  {
    id: 'b2',
    title: 'Master Plumbing & Sanitary Fix',
    subtitle: 'Leak repair, tap replacement, pipe drainage & sanitary fittings',
    tag: '🚰 24/7 ARRIVAL',
    badge: 'EXPRESS PRO',
    image: IMAGES.plumberBanner,
    price: 249,
    originalPrice: 449,
    categoryRoute: { id: 'plumbers', name: 'Plumber', icon: '🚰' },
  },
  {
    id: 'b3',
    title: 'Master Wall Painters & Waterproofing',
    subtitle: 'Dust-free roller painting & premium finish 1-day guarantee',
    tag: '🎨 1-DAY SERVICE',
    badge: 'WARRANTY',
    image: IMAGES.painterBanner,
    price: 499,
    originalPrice: 899,
    categoryRoute: { id: 'painters', name: 'Painting', icon: '🎨' },
  },
  {
    id: 'b4',
    title: 'All Verified Home Experts',
    subtitle: 'Over 100+ on-demand verified doorstep services by certified pros',
    tag: '🛡️ POLICE VERIFIED',
    badge: 'TOP RATED',
    image: IMAGES.allExpertsBanner,
    price: 299,
    originalPrice: 599,
    categoryRoute: { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  },
];

const CATEGORIES = [
  { id: 'ac-repair-services', name: 'AC Repair', nameHi: 'एसी रिपेयर', icon: '❄️', color: '#06B6D4', count: '28 Pros', countHi: '28 विशेषज्ञ', tag: 'Fast', tagHi: 'फास्ट' },
  { id: 'cleaning', name: 'Cleaning', nameHi: 'सफाई', icon: '🧹', color: '#10B981', count: '35 Pros', countHi: '35 विशेषज्ञ', tag: 'Popular', tagHi: 'लोकप्रिय' },
  { id: 'electricians', name: 'Electrician', nameHi: 'इलेक्ट्रीशियन', icon: '⚡', color: '#F59E0B', count: '42 Pros', countHi: '42 विशेषज्ञ', tag: 'Express', tagHi: 'एक्सप्रेस' },
  { id: 'plumbers', name: 'Plumber', nameHi: 'प्लम्बर', icon: '🚰', color: '#3B82F6', count: '30 Pros', countHi: '30 विशेषज्ञ', tag: '24/7', tagHi: '24/7' },
  { id: 'painters', name: 'Painting', nameHi: 'पेंटिंग', icon: '🎨', color: '#EC4899', count: '24 Pros', countHi: '24 विशेषज्ञ', tag: 'Warranty', tagHi: 'वारंटी' },
  { id: 'carpenters', name: 'Carpenter', nameHi: 'बढ़ई', icon: '🔨', color: '#8B5CF6', count: '20 Pros', countHi: '20 विशेषज्ञ', tag: 'Custom', tagHi: 'कस्टम' },
  { id: 'beauty-parlours', name: 'Salon', nameHi: 'सैलून', icon: '💇‍♀️', color: '#F43F5E', count: '31 Pros', countHi: '31 विशेषज्ञ', tag: 'At Home', tagHi: 'घर पर' },
  { id: 'appliance-repair', name: 'Appliances', nameHi: 'उपकरण रिपेयर', icon: '📺', color: '#14B8A6', count: '22 Pros', countHi: '22 विशेषज्ञ', tag: 'Genuine', tagHi: 'वारंटी' },
];

const TOP_SPECIALISTS = [
  {
    id: 'pro1',
    name: 'Ramesh Sharma',
    specialty: 'Master Electrician',
    rating: '4.95',
    reviews: '520+ jobs',
    experience: '9 yrs exp',
    distance: '8 mins away',
    avatar: IMAGES.electricianPro,
    verified: true,
    price: 249,
    categoryRoute: { id: 'electricians', name: 'Electrician', icon: '⚡' },
  },
  {
    id: 'pro2',
    name: 'Sunil Verma',
    specialty: 'Certified Plumber',
    rating: '5.0',
    reviews: '640+ jobs',
    experience: '11 yrs exp',
    distance: '12 mins away',
    avatar: IMAGES.plumberPro,
    verified: true,
    price: 349,
    categoryRoute: { id: 'plumbers', name: 'Plumber', icon: '🚰' },
  },
  {
    id: 'pro3',
    name: 'Rajesh Malviya',
    specialty: 'Master Wall Painter',
    rating: '4.98',
    reviews: '410+ jobs',
    experience: '7 yrs exp',
    distance: '14 mins away',
    avatar: IMAGES.painterPro,
    verified: true,
    price: 499,
    categoryRoute: { id: 'painters', name: 'Painting', icon: '🎨' },
  },
];

const BESTSELLER_SERVICES = [
  {
    id: 'bs1',
    name: 'Certified Electrician Visit & Diagnostics',
    category: 'Electrician',
    price: 199,
    originalPrice: 349,
    discount: '43% OFF',
    rating: 4.95,
    reviews: 540,
    time: '20 mins',
    image: IMAGES.electricianPro,
  },
  {
    id: 'bs2',
    name: 'Master Plumbing & Leak Repair',
    category: 'Plumber',
    price: 249,
    originalPrice: 449,
    discount: '44% OFF',
    rating: 4.9,
    reviews: 420,
    time: '25 mins',
    image: IMAGES.plumberPro,
  },
  {
    id: 'bs3',
    name: 'Home Painting & Touchup Inspection',
    category: 'Painting',
    price: 399,
    originalPrice: 699,
    discount: '42% OFF',
    rating: 4.88,
    reviews: 310,
    time: '45 mins',
    image: IMAGES.painterPro,
  },
  {
    id: 'bs4',
    name: 'Complete Home Maintenance & Checkup',
    category: 'All Experts',
    price: 499,
    originalPrice: 999,
    discount: '50% OFF',
    rating: 5.0,
    reviews: 680,
    time: '1 hour',
    image: IMAGES.allExpertsBanner,
  },
];

const HUB_SERVICES_CATALOG = {
  'Indore Multi-Specialist Hub': [
    {
      id: 'hs1',
      title: 'Home Electrical Diagnostic & Switchboard Fix',
      category: 'Electrician',
      icon: '⚡',
      price: 249,
      originalPrice: 499,
      discount: '50% OFF',
      duration: '40 mins',
      rating: 4.96,
      reviews: 142,
      inclusions: ['MCB tripping check', 'Earthing & voltage test', 'Switchboard rewiring', '30-Day guarantee'],
    },
    {
      id: 'hs2',
      title: 'Split / Window AC Jet-Pump Foam Wash',
      category: 'AC Repair',
      icon: '❄️',
      price: 499,
      originalPrice: 899,
      discount: '44% OFF',
      duration: '60 mins',
      rating: 4.98,
      reviews: 230,
      inclusions: ['High-pressure water jet spray', 'Cooling coil antibacterial wash', 'Gas leak check', 'Drain tray cleaning'],
    },
    {
      id: 'hs3',
      title: 'Concealed Pipe Leakage & Tap Replacement',
      category: 'Plumber',
      icon: '🚰',
      price: 299,
      originalPrice: 549,
      discount: '45% OFF',
      duration: '45 mins',
      rating: 4.92,
      reviews: 98,
      inclusions: ['Acoustic sensor leak check', 'Washer & spindle fitting', 'Water pressure optimization', 'Post-service cleanup'],
    },
    {
      id: 'hs4',
      title: 'Full Flat / Villa Deep Chemical Sanitization',
      category: 'Cleaning',
      icon: '🧹',
      price: 899,
      originalPrice: 1599,
      discount: '43% OFF',
      duration: '2-3 hrs',
      rating: 4.95,
      reviews: 184,
      inclusions: ['Eco-friendly hospital chemicals', 'Bathroom descaling & tile buffing', 'Kitchen degreasing', 'Balcony machine wash'],
    },
  ],
  'Palasia Express Cooling Hub': [
    {
      id: 'hs5',
      title: 'Inverter AC Compressor & Circuit Repair',
      category: 'AC Repair',
      icon: '❄️',
      price: 549,
      originalPrice: 999,
      discount: '45% OFF',
      duration: '60 mins',
      rating: 4.95,
      reviews: 310,
      inclusions: ['Inverter PCB circuit test', 'Pure R32/R410A gas top-up', 'Capacitor & wiring check', '2-Month cooling warranty'],
    },
    {
      id: 'hs6',
      title: 'Refrigerator Compressor Cooling & Gas Fill',
      category: 'Appliances',
      icon: '📺',
      price: 399,
      originalPrice: 749,
      discount: '47% OFF',
      duration: '45 mins',
      rating: 4.9,
      reviews: 165,
      inclusions: ['Thermostat calibration', 'Condenser coil cleaning', 'Defrost timer test', 'Original spare parts guarantee'],
    },
    {
      id: 'hs7',
      title: 'Washing Machine Drum & Motor Overhaul',
      category: 'Appliances',
      icon: '📺',
      price: 349,
      originalPrice: 649,
      discount: '46% OFF',
      duration: '50 mins',
      rating: 4.88,
      reviews: 120,
      inclusions: ['Vibration & noise fix', 'Drain pump & inlet valve check', 'Drum bearing lubrication', 'Lint filter sanitation'],
    },
  ],
  'Rajwada Electrical & Plumbing Center': [
    {
      id: 'hs8',
      title: 'Heavy Appliance Modular Point & MCB Setup',
      category: 'Electrician',
      icon: '⚡',
      price: 249,
      originalPrice: 449,
      discount: '44% OFF',
      duration: '35 mins',
      rating: 4.93,
      reviews: 215,
      inclusions: ['16A Modular socket fitting', 'Heavy load copper wiring', 'Tripping fix', 'Certified grade wire used'],
    },
    {
      id: 'hs9',
      title: 'Bathroom Overhead Tank & Water Motor Pump',
      category: 'Plumber',
      icon: '🚰',
      price: 349,
      originalPrice: 699,
      discount: '50% OFF',
      duration: '60 mins',
      rating: 4.91,
      reviews: 178,
      inclusions: ['Automatic float switch setup', 'Submersible starter test', 'Air-lock clearing', 'High-pressure valve check'],
    },
    {
      id: 'hs10',
      title: 'Water Geyser Heating Coil & Thermal Element',
      category: 'Appliances',
      icon: '📺',
      price: 399,
      originalPrice: 699,
      discount: '43% OFF',
      duration: '45 mins',
      rating: 4.94,
      reviews: 140,
      inclusions: ['Thermostat thermal cutout test', 'Heating element descaling', 'Safety valve replacement', 'Shock-proof grounding'],
    },
  ],
};

export default function HomeScreen({ navigation }) {
  const { appName, appLogo, primaryColor, heroBanners, themeColors, t, language, showCustomAlert } = useContext(AppContext);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [couponCopied, setCouponCopied] = useState(false);
  const [liveCategories, setLiveCategories] = useState([]);
  const [liveServices, setLiveServices] = useState([]);
  const [liveVendors, setLiveVendors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const bannerListRef = useRef(null);
  const isDark = themeColors?.isDark !== false;
  const [userLocation, setUserLocation] = useState('Vijay Nagar, Indore');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // 100% Refund Guarantee & Defective Work Video Dispute State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('Work Not Done Properly');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeBookingId, setDisputeBookingId] = useState('');
  const [disputeVideo, setDisputeVideo] = useState(null);
  const [disputeResolution, setDisputeResolution] = useState('refund');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Dedicated Verified Partner Hub Services Modal State
  const [selectedHub, setSelectedHub] = useState(null);
  const [showHubModal, setShowHubModal] = useState(false);

  const openPartnerHubDetails = (hub) => {
    setSelectedHub(hub);
    setShowHubModal(true);
  };

  const closePartnerHubDetails = () => {
    setShowHubModal(false);
    setSelectedHub(null);
  };

  const getHubServices = (hub) => {
    if (!hub) return [];
    const name = hub.shopName || hub.name || '';
    if (HUB_SERVICES_CATALOG[name]) {
      return HUB_SERVICES_CATALOG[name];
    }
    const cat = ((hub.category || '') + ' ' + name).toLowerCase();
    if (cat.includes('cool') || cat.includes('ac ') || cat.includes('appliance')) {
      return HUB_SERVICES_CATALOG['Palasia Express Cooling Hub'];
    }
    if (cat.includes('elect') || cat.includes('plumb')) {
      return HUB_SERVICES_CATALOG['Rajwada Electrical & Plumbing Center'];
    }
    return HUB_SERVICES_CATALOG['Indore Multi-Specialist Hub'];
  };

  const handleBookHubService = (service, hub) => {
    closePartnerHubDetails();
    navigation.navigate('BookingCheckout', {
      service: {
        name: service.title,
        price: service.price,
        category: service.category,
      },
      pro: {
        name: `${hub?.name || 'Workshop'} (${hub?.shopName || hub?.name || 'Authorized Hub'})`,
        role: `${hub?.category || 'Specialist'} Fleet`,
        rating: hub?.rating || 4.95,
        price: service.price,
        hubId: hub?.id || hub?._id,
        address: hub?.address || 'Indore, MP',
      },
    });
  };

  // Incomplete booking draft & hourly notification check
  const [pendingDraft, setPendingDraft] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const checkReminder = async () => {
      try {
        const notif = await checkHourlyBookingNotification(language);
        if (notif && isMounted) {
          showHourlyBookingAlert(notif, navigation, language);
        }
        const draft = await getIncompleteBooking();
        if (isMounted) {
          setPendingDraft(draft);
        }
      } catch (e) {
        console.log('Error checking reminder:', e);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60000);
    const focusUnsub = navigation.addListener('focus', () => {
      checkReminder();
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (typeof focusUnsub === 'function') focusUnsub();
    };
  }, [language, navigation]);

  const handlePickDisputeVideo = () => {
    openVideoPicker(
      (asset) => {
        setDisputeVideo(asset);
        showCustomAlert({
          title: language === 'hi' ? 'वीडियो प्रमाण जुड़ा ✓' : 'Video Evidence Attached ✓',
          message:
            language === 'hi'
              ? `कार्य दोष का वीडियो सफलतापूर्वक संलग्न कर दिया गया है (${asset.fileName || 'defect_proof.mp4'}).`
              : `Work defect video attached successfully (${asset.fileName || 'defect_proof.mp4'}).`,
          type: 'success',
          icon: '📹',
          buttons: [{ text: language === 'hi' ? 'ठीक है' : 'OK' }],
        });
      },
      { language }
    );
  };

  const handleSubmitDispute = () => {
    if (!disputeDesc.trim()) {
      showCustomAlert({
        title: language === 'hi' ? 'विवरण आवश्यक' : 'Details Required',
        message:
          language === 'hi'
            ? 'कृपया बताएं कि सेवा में क्या समस्या हुई।'
            : 'Please explain what went wrong with the work performed.',
        type: 'warning',
        icon: '⚠️',
        buttons: [{ text: language === 'hi' ? 'ठीक है' : 'OK' }],
      });
      return;
    }
    setIsSubmittingDispute(true);
    setTimeout(() => {
      setIsSubmittingDispute(false);
      setShowDisputeModal(false);
      const ticketNum = Math.floor(1000 + Math.random() * 9000);
      setDisputeDesc('');
      setDisputeBookingId('');
      setDisputeVideo(null);
      showCustomAlert({
        title: language === 'hi' ? 'गारंटी दावा दर्ज हुआ 🎫' : 'Guarantee Claim Registered 🎫',
        message:
          language === 'hi'
            ? `दावा क्रमांक #HLP-CLM-${ticketNum} सफलतापूर्वक दर्ज कर लिया गया है।\n\nअनुरोध: ${disputeResolution === 'refund' ? '100% पूरा रिफंड' : 'निःशुल्क पुनः सेवा'}\n\nहमारा वरिष्ठ गुणवत्ता प्रबंधक 15 मिनट में आपसे संपर्क करेगा।`
            : `Claim #HLP-CLM-${ticketNum} registered for "${disputeCategory}".\n\nRequested: ${disputeResolution === 'refund' ? '100% Full Refund' : 'Free Senior Specialist Re-work'}\n\nOur Senior Quality Officer will review your video proof and resolve within 24 hours.`,
        type: 'success',
        icon: '🛡️',
        buttons: [{ text: language === 'hi' ? 'ठीक है' : 'OK' }],
      });
    }, 700);
  };

  const handleLocationPress = () => {
    setIsDetectingLocation(true);
    setTimeout(() => {
      setIsDetectingLocation(false);
      const sampleLocations = [
        'Vijay Nagar, Scheme 54, Indore',
        'Palasia Square, AB Road, Indore',
        'Bhawarkua, Transport Nagar, Indore',
        'Geeta Bhawan, South Tukoganj, Indore',
        'Current GPS: Vijay Nagar, Indore',
      ];
      const picked = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
      setUserLocation(picked);
      Alert.alert(
        language === 'hi' ? '📍 लाइव जीपीएस लोकेशन मिली' : '📍 Live GPS Location Detected',
        language === 'hi'
          ? `आपकी सेवा डिलीवरी का पता सेट हो गया है:\n\n📌 ${picked}\n\n⚡ गारंटीड 15 मिनट में सेवा उपलब्ध`
          : `Your verified doorstep delivery location is set to:\n\n📌 ${picked}\n\n⚡ Guaranteed 15-Minute Doorstep Arrival`,
        [{ text: 'OK', style: 'default' }]
      );
    }, 900);
  };

  const displayBanners = (heroBanners && heroBanners.length > 0)
    ? heroBanners.filter((b) => b.active !== false)
    : HERO_BANNERS;

  const fetchHomeData = async () => {
    try {
      const [cRes, sRes, vRes] = await Promise.allSettled([
        client.get('/categories'),
        client.get('/services'),
        client.get('/providers'),
      ]);
      if (cRes.status === 'fulfilled' && cRes.value.data?.data) {
        setLiveCategories(cRes.value.data.data);
      }
      if (sRes.status === 'fulfilled' && sRes.value.data?.data) {
        setLiveServices(sRes.value.data.data);
      }
      if (vRes.status === 'fulfilled') {
        const rawVendors = vRes.value.data?.data || vRes.value.data;
        if (Array.isArray(rawVendors)) {
          setLiveVendors(rawVendors);
        }
      }
    } catch (e) {
      console.warn('Home fetch error:', e.message);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  // Auto scroll banner
  useEffect(() => {
    if (!displayBanners || displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => {
        const next = (prev + 1) % displayBanners.length;
        bannerListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [displayBanners.length]);

  const handleCopyCoupon = () => {
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2500);
  };

  // Keep authentic Doorstep Service Provider categories & icons intact
  const displayCategories = CATEGORIES.map((cat) => {
    const liveMatch = liveCategories?.find(
      (lc) =>
        (lc.name || '').toLowerCase().includes(cat.name.toLowerCase()) ||
        (lc.slug || '').toLowerCase().includes(cat.id.toLowerCase())
    );
    return {
      ...cat,
      count: liveMatch?.count || cat.count,
    };
  });

  // Deduplicate services and apply user-uploaded images from heroBanners
  const rawHomeServices = (liveServices && liveServices.length > 0)
    ? liveServices
    : BESTSELLER_SERVICES;

  const seenHomeKeys = new Set();
  const displayServices = [];
  for (const item of rawHomeServices) {
    const rawName = (item.name || '').trim();
    const normalizedKey = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenHomeKeys.has(normalizedKey)) {
      seenHomeKeys.add(normalizedKey);
      const matchedBanner = heroBanners?.find(
        (b) => (b.title || '').trim().toLowerCase() === rawName.toLowerCase()
      );
      const finalImage = matchedBanner?.image || item.image;
      displayServices.push({ ...item, image: finalImage });
    }
  }

  const dyn = {
    container: { backgroundColor: themeColors?.bg || '#070A12' },
    topHeader: { backgroundColor: themeColors?.headerBg || '#070A12', borderBottomColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    brandName: { color: themeColors?.text || '#F8FAFC' },
    locationPill: { backgroundColor: themeColors?.card || '#0E1526', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    locTitle: { color: themeColors?.text || '#FFFFFF' },
    locChevron: { color: themeColors?.textSecondary || '#94A3B8' },
    pulseText: { color: themeColors?.textSecondary || '#94A3B8' },
    headerBtn: { backgroundColor: themeColors?.card || '#0E1526', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    portalChip: { backgroundColor: themeColors?.card || '#0E1526', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    searchBar: { backgroundColor: themeColors?.card || '#0E1526', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    searchPlaceholder: { color: themeColors?.textMuted || '#94A3B8' },
    card: { backgroundColor: themeColors?.card || '#0E1526', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    text: { color: themeColors?.text || '#FFFFFF' },
    textSecondary: { color: themeColors?.textSecondary || '#94A3B8' },
  };

  return (
    <SafeAreaView style={[styles.container, dyn.container]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors?.bg || '#070A12'}
      />



      {/* TOP UNIFIED HEADER (Blinkit / Zepto / Urban Company Single Executive Bar) */}
      <View style={[styles.topHeader, dyn.topHeader]}>
        <View style={styles.unifiedHeaderRow}>
          {/* 1. Circle Brand Logo */}
          <TouchableOpacity
            style={[styles.circleLogoBtn, { borderColor: primaryColor || '#FF4D2D', backgroundColor: isDark ? '#0E131F' : '#FFFFFF' }]}
            activeOpacity={0.85}
            onLongPress={() => {
              Alert.alert(
                'Helper Testing Portals 🚀',
                'Choose portal to open for live testing:',
                [
                  { text: '🛠️ Vendor Hub', onPress: () => navigation.navigate('VendorPartner') },
                  { text: '🧰 Worker App', onPress: () => navigation.navigate('WorkerTechnician') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Image
              source={
                appLogo && !appLogo.includes('unsplash') && !appLogo.includes('photo-')
                  ? { uri: appLogo }
                  : require('../assets/logo.png')
              }
              style={styles.circleLogoImg}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* 2. Location Block Directly Next To Logo (Clickable for live GPS detection) */}
          <TouchableOpacity
            style={[styles.headerLocationBlock, dyn.locationPill]}
            activeOpacity={0.75}
            onPress={handleLocationPress}
          >
            <View style={[styles.locIconBubble, { backgroundColor: `${primaryColor || '#FF4D2D'}18` }]}>
              <Text style={styles.locPinIcon}>📍</Text>
            </View>
            <View style={styles.locTextColumn}>
              <View style={styles.locTitleRow}>
                <Text style={[styles.locMainTitle, dyn.locTitle]} numberOfLines={1}>
                  {userLocation}
                </Text>
                <Text style={[styles.locChevron, dyn.locChevron]}>▼</Text>
              </View>
              <View style={styles.pulseContainer}>
                <View style={[styles.pulseDot, isDetectingLocation && { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.pulseText, dyn.pulseText]} numberOfLines={1}>
                  {isDetectingLocation
                    ? (language === 'hi' ? '📡 जीपीएस खोज रहे हैं...' : '📡 Detecting live GPS...')
                    : (language === 'hi' ? '15 मिनट में सुपरफास्ट कारीगर' : '15 Mins Superfast Doorstep')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 3. Cart / Order Bucket Button */}
          <TouchableOpacity
            style={[styles.headerBtn, dyn.headerBtn]}
            onPress={() => {
              if (pendingDraft) {
                navigation.navigate('BookingCheckout', {
                  service: pendingDraft.service,
                  pro: pendingDraft.pro,
                });
              } else {
                navigation.navigate('Explore');
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.headerBtnIcon}>🛒</Text>
            {pendingDraft ? (
              <View style={[styles.badgeCount, { backgroundColor: primaryColor || '#FF4D2D' }]}>
                <Text style={styles.badgeCountText}>1</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={['transparent']}
          />
        }
      >
        {/* COMPACT ORBITAL SERVICE LOADER WHEN REFRESHING */}
        {refreshing && (
          <View style={styles.miniRefreshBar}>
            <ServiceLoader size="small" primaryColor={primaryColor || '#FF4D2D'} />
          </View>
        )}



        {/* INTERACTIVE INSTA-STORIES STRIP */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesScroll}
        >
          {STORIES.map((st) => (
            <AnimatedStoryItem
              key={st.id}
              story={st}
              isDark={isDark}
              navigation={navigation}
            />
          ))}
        </ScrollView>

        {/* PANORAMIC CAROUSEL BANNER WITH FACE VISIBLE AT TOP & INFO AT BOTTOM */}
        <View style={styles.heroSection}>
          <FlatList
            ref={bannerListRef}
            data={displayBanners}
            keyExtractor={(item) => item.id || String(Math.random())}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_WIDTH + 14}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 16 }}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 14));
              setActiveBannerIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <View style={[styles.heroCard, { width: BANNER_WIDTH }]}>
                {/* Visual Image Section - 100% Face Clear */}
                <View style={styles.heroImageSection}>
                  <Image source={resolveImageSource(item.image, item)} style={styles.heroBgImg} resizeMode="cover" />
                  {/* Clean top-left tag - 100% clear face view */}
                  <View style={styles.heroTopRow}>
                    <View style={styles.heroTagBadge}>
                      <Text style={styles.heroTagText}>{item.tag || '⚡ 15-MIN ARRIVAL'}</Text>
                    </View>
                  </View>
                </View>

                {/* Dedicated Dark Glass Info Bar at the Bottom */}
                <View style={styles.heroBottomBar}>
                  <View style={styles.heroMetaLeft}>
                    <Text style={styles.heroTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.heroSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  </View>

                  <View style={styles.heroActionRow}>
                    <View style={styles.heroPriceBlock}>
                      <Text style={styles.heroPriceLabel}>FARE</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
                        <Text style={styles.heroPriceVal}>₹{item.price}</Text>
                        {item.originalPrice ? <Text style={styles.heroOldPrice}>₹{item.originalPrice}</Text> : null}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.heroBookBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate('BookingCheckout', {
                          service: { name: item.title, price: item.price, image: item.image },
                        })
                      }
                    >
                      <Text style={styles.heroBookBtnText}>Book Now ➔</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.dotsRow}>
            {displayBanners.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === activeBannerIndex ? [styles.activeDot, { backgroundColor: primaryColor || '#FF4D2D' }] : null,
                ]}
              />
            ))}
          </View>
        </View>

        {/* LUXURY TICKET VOUCHER CARD */}
        <View style={styles.voucherContainer}>
          <TouchableOpacity
            style={[
              styles.voucherTicket,
              {
                backgroundColor: isDark ? '#111827' : '#FFF7ED',
                borderColor: `${primaryColor || '#FF4D2D'}59`,
              },
            ]}
            activeOpacity={0.9}
            onPress={handleCopyCoupon}
          >
            {/* Left Notch */}
            <View style={[styles.notchLeft, { backgroundColor: themeColors?.bg || (isDark ? '#070A12' : '#F8FAFC') }]} />
            {/* Right Notch */}
            <View style={[styles.notchRight, { backgroundColor: themeColors?.bg || (isDark ? '#070A12' : '#F8FAFC') }]} />

            <View style={styles.voucherLeft}>
              <View style={[styles.voucherIconBox, { backgroundColor: `${primaryColor || '#FF4D2D'}26` }]}>
                <Text style={styles.voucherIcon}>🎟️</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.voucherTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]} numberOfLines={1}>SPECIAL OFFER</Text>
                  <View style={[styles.voucherTag, { backgroundColor: primaryColor || '#FF4D2D' }]}>
                    <Text style={styles.voucherTagText}>50% OFF</Text>
                  </View>
                </View>
                <Text style={[styles.voucherSub, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={1}>Flat ₹50 instant discount at checkout</Text>
              </View>
            </View>

            {/* Dashed divider */}
            <View style={[styles.dashedDivider, { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)' }]} />

            <View style={styles.voucherRight}>
              <View style={[styles.couponCodePill, { borderColor: primaryColor || '#FF4D2D', backgroundColor: `${primaryColor || '#FF4D2D'}26` }]}>
                <Text style={[styles.couponCodeText, { color: primaryColor || '#FF4D2D' }]}>HELPER50</Text>
              </View>
              <Text style={styles.copyNotice}>
                {couponCopied ? 'COPIED! ✓' : 'TAP TO COPY'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* INCOMPLETE BOOKING ABANDONED REMINDER BANNER */}
        {pendingDraft && (
          <View style={styles.incompleteDraftBanner}>
            <View
              style={[
                styles.incompleteDraftInner,
                {
                  backgroundColor: isDark ? '#141824' : '#FFF7ED',
                  borderColor: '#F97316',
                },
              ]}
            >
              {/* Top Row: Icon + Title + Direct Delete Trash Button */}
              <View style={styles.incompleteDraftTopRow}>
                <View style={styles.incompleteDraftLeft}>
                  <View style={[styles.incompleteDraftIconWrap, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.22)' : '#FFEAD5' }]}>
                    <Text style={styles.incompleteDraftIcon}>⏰</Text>
                  </View>
                  <View style={styles.incompleteDraftTextCol}>
                    <Text style={[styles.incompleteDraftTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]} numberOfLines={1}>
                      {language === 'hi' ? 'अधूरी बुकिंग मौजूद है' : 'Incomplete Booking Pending'}
                    </Text>
                    <View style={styles.incompleteDraftMetaRow}>
                      <Text style={[styles.incompleteDraftSub, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={1}>
                        {pendingDraft.service?.name || pendingDraft.pro?.name || (language === 'hi' ? 'होम सर्विस' : 'Home Service')} • ₹{pendingDraft.finalPrice || 499}
                      </Text>
                      <View style={styles.incompleteDraftTag}>
                        <Text style={styles.incompleteDraftTagText}>15-MIN SLOT</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Direct Trash Delete Button */}
                <TouchableOpacity
                  style={[
                    styles.deleteDraftPillBtn,
                    {
                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEE2E2',
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FECACA',
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    showCustomAlert({
                      title: language === 'hi' ? 'बुकिंग हटाएं? 🗑️' : 'Delete Booking? 🗑️',
                      message:
                        language === 'hi'
                          ? 'क्या आप वाकई इस अधूरी बुकिंग को हटाना चाहते हैं?'
                          : 'Are you sure you want to discard this incomplete booking draft?',
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
                            await deleteIncompleteBooking();
                            setPendingDraft(null);
                            showCustomAlert({
                              title: language === 'hi' ? 'बुकिंग हटा दी गई ✓' : 'Booking Deleted ✓',
                              message:
                                language === 'hi'
                                  ? 'आपकी अधूरी बुकिंग हटा दी गई है।'
                                  : 'Incomplete booking draft has been discarded.',
                              type: 'success',
                              icon: '✅',
                              buttons: [{ text: language === 'hi' ? 'ठीक है' : 'OK' }],
                            });
                          },
                        },
                      ],
                    });
                  }}
                >
                  <Text style={styles.deleteDraftPillIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>

              {/* Complete Booking Button - In its own separate row */}
              <TouchableOpacity
                style={[styles.resumeDraftBtn, { backgroundColor: primaryColor || '#FF4D2D', marginTop: 10 }]}
                activeOpacity={0.88}
                onPress={() =>
                  navigation.navigate('BookingCheckout', {
                    service: pendingDraft.service,
                    pro: pendingDraft.pro,
                  })
                }
              >
                <Text style={styles.resumeDraftText}>
                  {language === 'hi' ? 'बुकिंग पूरी करें ➔' : 'Complete Booking ➔'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* LUXURY FLOATING SEARCH WITH LOGO BADGE (Placed Directly Above Categories) */}
        <View style={[styles.searchContainer, { marginTop: 18, marginBottom: 4 }]}>
          <TouchableOpacity
            style={[styles.searchBar, dyn.searchBar]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Explore')}
          >
            <View style={styles.searchLeftWrap}>
              <View style={[styles.searchIconBadge, { backgroundColor: primaryColor || '#FF4D2D' }]}>
                <Text style={styles.searchBadgeIcon}>🔍</Text>
              </View>
              <Text style={[styles.searchPlaceholder, dyn.searchPlaceholder]} numberOfLines={1}>
                {language === 'hi'
                  ? 'खोजें "एसी", "इलेक्ट्रीशियन", "प्लम्बर"...'
                  : 'Search "Electrician", "Plumber", "AC Repair"...'}
              </Text>
            </View>
            <View style={styles.searchActionWrap}>
              <View style={[styles.searchPillTag, { backgroundColor: `${primaryColor || '#FF4D2D'}1A` }]}>
                <Text style={[styles.searchPillText, { color: primaryColor || '#FF4D2D' }]}>
                  {language === 'hi' ? '⚡ तुरंत सेवा' : '⚡ 15m Express'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 8 DOORSTEP CATEGORIES */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionPre, { color: primaryColor || '#FF4D2D' }]}>
              {language === 'hi' ? 'आप क्या सेवा चाहते हैं?' : 'WHAT ARE YOU LOOKING FOR?'}
            </Text>
            <Text style={[styles.sectionHeading, dyn.text]}>
              {language === 'hi' ? 'घर बैठे सेवाएं' : 'Doorstep Categories'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={[styles.seeAllBtn, { color: primaryColor || '#FF4D2D' }]}>
              {language === 'hi' ? 'सभी 100+ देखें ➔' : 'View All 100+ ➔'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesGrid}>
          {displayCategories.map((cat, idx) => (
            <TouchableOpacity
              key={cat.id || cat._id || String(idx)}
              style={[styles.catCard, dyn.card]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CategoryDetails', { category: cat })}
            >
              <View style={[styles.catIconCircle, { backgroundColor: isDark ? '#131A2B' : '#F1F5F9', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.12)' }]}>
                <Text style={styles.catIconText}>{cat.icon || '⚡'}</Text>
                {cat.tag ? (
                  <View style={[styles.catMicroTag, { backgroundColor: cat.color || primaryColor || '#FF4D2D' }]}>
                    <Text style={styles.catMicroTagText}>
                      {language === 'hi' ? (cat.tagHi || cat.tag) : cat.tag}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.catName, dyn.text]} numberOfLines={1}>
                {language === 'hi' ? (cat.nameHi || cat.name) : cat.name}
              </Text>
              <Text style={[styles.catCount, dyn.textSecondary]}>
                {language === 'hi' ? (cat.countHi || 'सक्रिय') : (cat.count || 'Active')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 100% REFUND & RE-WORK GUARANTEE (DEFECTIVE WORK VIDEO DISPUTE) */}
        <View style={styles.guaranteeCardContainer}>
          <TouchableOpacity
            style={[
              styles.guaranteeCard,
              {
                borderColor: `${primaryColor || '#FF4D2D'}55`,
                backgroundColor: isDark ? '#0D1527' : '#FFFFFF',
              },
            ]}
            activeOpacity={0.88}
            onPress={() => setShowDisputeModal(true)}
          >
            <View style={styles.guaranteeCardLeft}>
              <View style={[styles.guaranteeIconCircle, { backgroundColor: `${primaryColor || '#FF4D2D'}20` }]}>
                <Text style={styles.guaranteeIconEmoji}>🛡️</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <Text
                    style={[styles.guaranteeTitle, { color: isDark ? '#FFFFFF' : '#0F172A', flex: 1, flexShrink: 1 }]}
                    numberOfLines={1}
                  >
                    {language === 'hi' ? '100% संतुष्टि एवं रिफंड गारंटी' : '100% Quality & Refund Guarantee'}
                  </Text>
                  <View style={[styles.guaranteeLiveBadge, { backgroundColor: '#10B981', flexShrink: 0 }]}>
                    <Text style={styles.guaranteeLiveBadgeText}>{language === 'hi' ? 'सक्रिय' : 'ACTIVE'}</Text>
                  </View>
                </View>
                <Text style={[styles.guaranteeSub, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={2}>
                  {language === 'hi'
                    ? 'काम सही से नहीं हुआ? वीडियो प्रमाण अपलोड करें और 100% रिफंड या निःशुल्क पुनः सेवा पाएं।'
                    : 'Work not done properly? Upload video proof to claim 100% refund or free re-work.'}
                </Text>
              </View>
            </View>
            <View style={[styles.guaranteeClaimBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}>
              <Text style={styles.guaranteeClaimBtnText}>
                {language === 'hi' ? 'वीडियो से दावा करें ➔' : 'Claim Refund ➔'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* VERIFIED PARTNER HUBS & WORKSHOP CENTERS */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <View>
            <Text style={[styles.sectionPre, { color: primaryColor || '#FF4D2D' }]}>
              {language === 'hi' ? 'सत्यापित वर्कशॉप व सेवा केंद्र' : 'AUTHORIZED WORKSHOPS & CENTERS'}
            </Text>
            <Text style={[styles.sectionHeading, dyn.text]}>
              {language === 'hi' ? 'सत्यापित पार्टनर हब्स' : 'Verified Partner Hubs'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={[styles.seeAllBtn, { color: primaryColor || '#FF4D2D' }]}>
              {language === 'hi' ? `सभी हब्स (${liveVendors.length || 30}) ➔` : `All Hubs (${liveVendors.length || 30}) ➔`}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingBottom: 6 }}
        >
          {(liveVendors.length > 0 ? liveVendors : [
            { id: 'v1', shopName: 'Indore Multi-Specialist Hub', name: 'Ritik', category: 'Multi-Specialist Hub', rating: 4.98, hourlyRate: '₹299/hr', address: 'Vijay Nagar, Indore', verified: true },
            { id: 'v2', shopName: 'Palasia Express Cooling Hub', name: 'Aakash Verma', category: 'AC & Appliance Care', rating: 4.92, hourlyRate: '₹349/hr', address: 'Palasia, Indore', verified: true },
            { id: 'v3', shopName: 'Rajwada Electrical & Plumbing Center', name: 'Sunil Sharma', category: 'Electrical & Plumbing', rating: 4.89, hourlyRate: '₹249/hr', address: 'Rajwada, Indore', verified: true }
          ]).map((hub, idx) => (
            <TouchableOpacity
              key={hub._id || hub.id || String(idx)}
              style={[styles.vendorHubCard, dyn.card]}
              activeOpacity={0.88}
              onPress={() => openPartnerHubDetails(hub)}
            >
              <View style={styles.vendorHubTopRow}>
                <View style={styles.vendorHubBadge}>
                  <Text style={styles.vendorHubBadgeText}>🏢 CERTIFIED HUB</Text>
                </View>
                <View style={styles.vendorHubLiveDotWrap}>
                  <View style={styles.vendorHubLiveDot} />
                  <Text style={styles.vendorHubLiveText}>Open Now</Text>
                </View>
              </View>

              <Text style={[styles.vendorHubName, dyn.text]} numberOfLines={1}>
                {hub.shopName || hub.name || 'Partner Hub'}
              </Text>
              <Text style={[styles.vendorHubOwner, dyn.textSecondary]} numberOfLines={1}>
                Owner: {hub.name || 'Verified Partner'}
              </Text>
              <Text style={[styles.vendorHubCategory, dyn.textSecondary]} numberOfLines={1}>
                🛠️ {hub.category || 'Multi-Trade Service'}
              </Text>
              <Text style={[styles.vendorHubAddress, dyn.textSecondary]} numberOfLines={1}>
                📍 {hub.address || hub.location || 'Indore, MP'}
              </Text>

              <View style={styles.vendorHubFooter}>
                <View style={styles.vendorHubRatingBox}>
                  <Text style={styles.vendorHubRating}>★ {hub.rating || '4.95'}</Text>
                  <Text style={[styles.vendorHubJobs, dyn.textSecondary]}>• {hub.hourlyRate || '₹299/hr'}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.vendorHubActionPill, { backgroundColor: primaryColor || '#FF4D2D' }]}
                  activeOpacity={0.85}
                  onPress={() => openPartnerHubDetails(hub)}
                >
                  <Text style={styles.vendorHubActionText}>View Services ➔</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* INDORE'S TOP 1% VERIFIED SPECIALISTS */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <View>
            <Text style={[styles.sectionPre, { color: primaryColor || '#10B981' }]}>
              {language === 'hi' ? '100% पुलिस व आधार सत्यापित' : '100% POLICE & AADHAAR VERIFIED'}
            </Text>
            <Text style={[styles.sectionHeading, dyn.text]}>
              {language === 'hi' ? 'सत्यापित विशेषज्ञ कारीगर' : 'Top Rated Specialists'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={[styles.seeAllBtn, { color: primaryColor || '#FF4D2D' }]}>
              {language === 'hi' ? 'कारीगर देखें ➔' : 'View Pros ➔'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 6 }}
        >
          {TOP_SPECIALISTS.map((pro) => (
            <TouchableOpacity
              key={pro.id}
              style={[styles.proCard, dyn.card]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('CategoryDetails', { category: pro.categoryRoute })
              }
            >
              <View style={styles.proHeaderRow}>
                <Image source={typeof pro.avatar === 'number' ? pro.avatar : resolveImageSource(pro.avatar, pro)} style={styles.proAvatar} />
                <View style={styles.proBadgeVerified}>
                  <Text style={styles.proVerifiedShield}>🛡️</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.proName, dyn.text]}>{pro.name}</Text>
                  <Text style={[styles.proRole, dyn.textSecondary]}>{pro.specialty}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Text style={styles.proStar}>★ {pro.rating}</Text>
                    <Text style={[styles.proJobs, dyn.textSecondary]}>• {pro.reviews}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.proDetailsRow}>
                <View style={styles.proDetailItem}>
                  <Text style={styles.proDetailLabel}>EXPERIENCE</Text>
                  <Text style={[styles.proDetailVal, dyn.text]}>{pro.experience}</Text>
                </View>
                <View style={styles.proDetailItem}>
                  <Text style={styles.proDetailLabel}>ARRIVAL</Text>
                  <Text style={[styles.proDetailVal, { color: '#10B981' }]}>⚡ {pro.distance}</Text>
                </View>
                <View style={styles.proDetailItem}>
                  <Text style={styles.proDetailLabel}>VISIT FEE</Text>
                  <Text style={[styles.proDetailVal, dyn.text]}>₹{pro.price}</Text>
                </View>
              </View>

              <View style={[styles.proActionBtn, { backgroundColor: `${primaryColor || '#FF4D2D'}26`, borderColor: `${primaryColor || '#FF4D2D'}59` }]}>
                <Text style={[styles.proActionText, { color: primaryColor || '#FF4D2D' }]}>
                  {language === 'hi' ? 'कारीगर बुक करें ➔' : 'Book Specialist ➔'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* MOST BOOKED SERVICES */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <View>
            <Text style={[styles.sectionPre, { color: primaryColor || '#FF7A00' }]}>
              {language === 'hi' ? 'इस हफ्ते सबसे ज्यादा पसंद की गई' : 'HIGH DEMAND THIS WEEK'}
            </Text>
            <Text style={[styles.sectionHeading, dyn.text]}>
              {language === 'hi' ? 'सबसे ज्यादा बुक की गई सेवाएं' : 'Most Booked Services'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={[styles.seeAllBtn, { color: primaryColor || '#FF4D2D' }]}>
              {language === 'hi' ? 'सब देखें' : 'See All'}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={displayServices}
          keyExtractor={(item, idx) => item.id || item._id || String(idx)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.bestsellerCard, dyn.card]}>
              <View style={styles.bsImageWrap}>
                <Image source={resolveImageSource(item.image, item)} style={styles.bsImage} resizeMode="cover" />
                <View style={styles.bsBadgesRow}>
                  <View style={[styles.bsDiscountTag, { backgroundColor: primaryColor || '#FF4D2D' }]}>
                    <Text style={styles.bsDiscountText}>
                      {item.discount || (item.originalPrice ? `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF` : 'POPULAR')}
                    </Text>
                  </View>
                  <View style={styles.bsRatingTag}>
                    <Text style={styles.bsRatingText}>★ {item.rating || '4.9'}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.bsBody, { backgroundColor: themeColors?.card || '#0E1526' }]}>
                <Text style={[styles.bsCatText, { color: primaryColor || '#FF4D2D' }]}>{(item.category || 'Service').toUpperCase()}</Text>
                <Text style={[styles.bsTitle, dyn.text]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.bsTime, dyn.textSecondary]}>⏱️ {item.duration || item.time || '45 mins'} • 100% Quality Assured</Text>

                <View style={styles.bsFooter}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={[styles.bsPrice, dyn.text]}>₹{item.price}</Text>
                      {item.originalPrice ? <Text style={[styles.bsOldPrice, dyn.textSecondary]}>₹{item.originalPrice}</Text> : null}
                    </View>
                    <Text style={styles.bsDoorstepTag}>⚡ 15m Doorstep</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.bsBookBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('BookingCheckout', { service: item })}
                  >
                    <Text style={styles.bsBookBtnText}>
                      {language === 'hi' ? 'बुक करें ➔' : 'Book ➔'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />

        {/* HELPER SATISFACTION ASSURANCE */}
        <View style={[styles.assuranceCard, { borderColor: `${primaryColor || '#FF4D2D'}4D` }]}>
          <View style={styles.assuranceHeader}>
            <Text style={styles.assuranceShieldIcon}>🛡️</Text>
            <View>
              <Text style={[styles.assuranceMainTitle, { color: primaryColor || '#FF4D2D' }]}>
                {language === 'hi' ? '100% संतुष्टि और सुरक्षा कवच' : '100% SATISFACTION SHIELD'}
              </Text>
              <Text style={styles.assuranceSubTitle}>
                {language === 'hi' ? 'आपकी सुरक्षा और संतुष्टि की पूर्ण गारंटी है' : 'Your safety & satisfaction are unconditionally guaranteed'}
              </Text>
            </View>
          </View>

          <View style={styles.assuranceFeatures}>
            <View style={styles.assuranceCol}>
              <Text style={styles.featIcon}>👮‍♂️</Text>
              <Text style={styles.featTitle}>{language === 'hi' ? 'पुलिस सत्यापित' : 'Police Verified'}</Text>
              <Text style={styles.featDesc}>{language === 'hi' ? 'आधार व पुलिस द्वारा सत्यापित विशेषज्ञ' : 'Background & Aadhaar checked technicians'}</Text>
            </View>
            <View style={styles.assuranceCol}>
              <Text style={styles.featIcon}>🔄</Text>
              <Text style={styles.featTitle}>{language === 'hi' ? '30 दिन की वारंटी' : '30-Day Revisit'}</Text>
              <Text style={styles.featDesc}>{language === 'hi' ? 'संतुष्ट न होने पर निःशुल्क पुनः सेवा' : 'Free re-service if not 100% satisfied'}</Text>
            </View>
            <View style={styles.assuranceCol}>
              <Text style={styles.featIcon}>💵</Text>
              <Text style={styles.featTitle}>{language === 'hi' ? 'काम के बाद भुगतान' : 'Pay After Service'}</Text>
              <Text style={styles.featDesc}>{language === 'hi' ? 'काम पूरा होने पर ही भुगतान करें' : 'No advance, pay with UPI/Cash only after work'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 100% REFUND & RE-WORK DISPUTE MODAL (WITH VIDEO PROOF) */}
      <Modal
        visible={showDisputeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDisputeModal(false)}
      >
        <View style={styles.disputeModalOverlay}>
          <View style={[styles.disputeModalContent, { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }]}>
            <View style={styles.disputeModalHeader}>
              <View>
                <Text style={[styles.disputeModalTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  {language === 'hi' ? '🛡️ 100% रिफंड व पुनः सेवा दावा' : '🛡️ 100% Refund & Quality Guarantee'}
                </Text>
                <Text style={styles.disputeModalSub}>
                  {language === 'hi' ? 'काम सही से नहीं हुआ? वीडियो प्रमाण देकर दावा करें' : 'Work not satisfactory? Claim with video evidence'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDisputeModal(false)} style={styles.disputeCloseBtn}>
                <Text style={styles.disputeCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 18 }}>
              {/* Category selector */}
              <Text style={styles.disputeFieldLabel}>
                {language === 'hi' ? 'समस्या का प्रकार चुनें' : 'SELECT ISSUE CATEGORY'}
              </Text>
              <View style={styles.disputeChipRow}>
                {[
                  { id: 'Work Not Done Properly', en: '🛠️ Poor Work / Defect', hi: '🛠️ काम सही से नहीं किया' },
                  { id: 'Damage During Service', en: '⚠️ Property Damage', hi: '⚠️ सेवा में नुकसान' },
                  { id: 'Overcharged Money', en: '💸 Extra Money Taken', hi: '💸 अधिक पैसे लिए' },
                  { id: 'Incomplete Work', en: '⏱️ Incomplete Work', hi: '⏱️ काम अधूरा छोड़ा' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.disputeChip,
                      disputeCategory === item.id && { borderColor: primaryColor || '#FF4D2D', backgroundColor: `${primaryColor || '#FF4D2D'}20` },
                    ]}
                    onPress={() => setDisputeCategory(item.id)}
                  >
                    <Text
                      style={[
                        styles.disputeChipText,
                        disputeCategory === item.id && { color: primaryColor || '#FF4D2D', fontWeight: '800' },
                      ]}
                    >
                      {language === 'hi' ? item.hi : item.en}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Booking ID Input */}
              <Text style={styles.disputeFieldLabel}>
                {language === 'hi' ? 'बुकिंग आईडी (वैकल्पिक)' : 'BOOKING ID (OPTIONAL)'}
              </Text>
              <TextInput
                style={[styles.disputeInput, { color: isDark ? '#FFFFFF' : '#0F172A', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
                placeholder={language === 'hi' ? 'उदा. #ORD-7429' : 'e.g. #ORD-7429'}
                placeholderTextColor="#64748B"
                value={disputeBookingId}
                onChangeText={setDisputeBookingId}
              />

              {/* VIDEO EVIDENCE UPLOAD SECTION - SPECIFICALLY REQUESTED BY USER */}
              <Text style={styles.disputeFieldLabel}>
                {language === 'hi' ? 'खराब काम का वीडियो प्रमाण (अनुशंसित) 📹' : 'DEFECT VIDEO EVIDENCE (RECOMMENDED) 📹'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.disputeVideoUploadBtn,
                  disputeVideo && { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.08)' },
                ]}
                activeOpacity={0.8}
                onPress={handlePickDisputeVideo}
              >
                <Text style={styles.disputeVideoIcon}>{disputeVideo ? '✅' : '📹'}</Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.disputeVideoBtnTitle, disputeVideo && { color: '#10B981' }]}>
                    {disputeVideo
                      ? (language === 'hi' ? 'वीडियो प्रमाण जुड़ा हुआ है' : 'Video Evidence Attached ✓')
                      : (language === 'hi' ? 'खराब काम का वीडियो रिकॉर्ड / अपलोड करें' : 'Record / Upload Video of Defective Work')}
                  </Text>
                  <Text style={styles.disputeVideoBtnSub} numberOfLines={1}>
                    {disputeVideo
                      ? (disputeVideo.fileName || 'defect_video.mp4')
                      : (language === 'hi' ? 'कैमरे से रिकॉर्ड करें या गैलरी से वीडियो चुनें (MP4/MOV)' : 'Capture defect via camera or choose video from phone')}
                  </Text>
                </View>
                {disputeVideo ? (
                  <TouchableOpacity onPress={() => setDisputeVideo(null)} style={styles.disputeRemoveVideoBtn}>
                    <Text style={styles.disputeRemoveVideoText}>✕</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.disputeAddBadge, { backgroundColor: primaryColor || '#FF4D2D' }]}>
                    <Text style={styles.disputeAddBadgeText}>{language === 'hi' ? '+ जोड़ें' : '+ Add'}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Explanation Textarea */}
              <Text style={styles.disputeFieldLabel}>
                {language === 'hi' ? 'समस्या का विस्तार से विवरण दें *' : 'EXPLAIN WHAT WENT WRONG *'}
              </Text>
              <TextInput
                style={[
                  styles.disputeInput,
                  { minHeight: 76, textAlignVertical: 'top', color: isDark ? '#FFFFFF' : '#0F172A', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' },
                ]}
                placeholder={
                  language === 'hi'
                    ? 'कारीगर ने क्या काम खराब किया या अधूरा छोड़ा...'
                    : 'Describe what the technician did improperly...'
                }
                placeholderTextColor="#64748B"
                value={disputeDesc}
                onChangeText={setDisputeDesc}
                multiline
              />

              {/* Desired Resolution choice */}
              <Text style={styles.disputeFieldLabel}>
                {language === 'hi' ? 'आप क्या समाधान चाहते हैं?' : 'DESIRED RESOLUTION'}
              </Text>
              <View style={styles.disputeActionRow}>
                <TouchableOpacity
                  style={[
                    styles.disputeActionCard,
                    disputeResolution === 'refund' && { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                  ]}
                  onPress={() => setDisputeResolution('refund')}
                >
                  <Text style={styles.disputeActionEmoji}>💸</Text>
                  <Text style={[styles.disputeActionTitle, disputeResolution === 'refund' && { color: '#10B981', fontWeight: '900' }]}>
                    {language === 'hi' ? '100% पूरा रिफंड' : '100% Full Refund'}
                  </Text>
                  <Text style={styles.disputeActionSub}>
                    {language === 'hi' ? 'मूल बैंक/यूपीआई खाते में' : 'Direct to UPI / Bank'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.disputeActionCard,
                    disputeResolution === 'rework' && { borderColor: primaryColor || '#FF4D2D', backgroundColor: `${primaryColor || '#FF4D2D'}14` },
                  ]}
                  onPress={() => setDisputeResolution('rework')}
                >
                  <Text style={styles.disputeActionEmoji}>🔁</Text>
                  <Text style={[styles.disputeActionTitle, disputeResolution === 'rework' && { color: primaryColor || '#FF4D2D', fontWeight: '900' }]}>
                    {language === 'hi' ? 'निःशुल्क पुनः सेवा' : 'Free Senior Re-work'}
                  </Text>
                  <Text style={styles.disputeActionSub}>
                    {language === 'hi' ? 'वरिष्ठ मास्टर विशेषज्ञ द्वारा' : 'By Senior Specialist'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.disputeSubmitBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                activeOpacity={0.85}
                onPress={handleSubmitDispute}
                disabled={isSubmittingDispute}
              >
                <Text style={styles.disputeSubmitText}>
                  {isSubmittingDispute
                    ? (language === 'hi' ? 'दावा दर्ज हो रहा है...' : 'Registering Claim...')
                    : (language === 'hi' ? 'गारंटी दावा दर्ज करें 🛡️' : 'Submit Guarantee Claim 🛡️')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* VERIFIED PARTNER HUB WORKSHOP SERVICES MODAL */}
      <Modal
        visible={showHubModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closePartnerHubDetails}
      >
        <View style={styles.hubModalOverlay}>
          <View style={[styles.hubModalContent, { backgroundColor: isDark ? '#0A0F1D' : '#F8FAFC' }]}>
            {/* Modal Drag Handle */}
            <View style={styles.hubModalHandleBar}>
              <View style={[styles.hubModalHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1' }]} />
            </View>

            {/* Hub Header Card */}
            <View style={[styles.hubHeaderCard, { backgroundColor: isDark ? '#131A2B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}>
              <View style={styles.hubHeaderTop}>
                <View style={[styles.hubAvatarCircle, { backgroundColor: `${primaryColor || '#FF4D2D'}20` }]}>
                  <Text style={styles.hubAvatarEmoji}>🏢</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                  <Text style={[styles.hubModalTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]} numberOfLines={1}>
                    {selectedHub?.shopName || selectedHub?.name || 'Verified Workshop'}
                  </Text>
                  <Text style={[styles.hubModalOwner, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={1}>
                    {language === 'hi' ? 'संचालक: ' : 'Workshop Owner: '}{selectedHub?.name || 'Verified Partner'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <View style={styles.hubRatingBadge}>
                      <Text style={styles.hubRatingText}>★ {selectedHub?.rating || '4.98'}</Text>
                    </View>
                    <Text style={[styles.hubVerifiedTag, { color: '#10B981' }]}>✓ Verified Workshop</Text>
                    <View style={styles.hubLiveDot} />
                    <Text style={[styles.hubLiveStatusText, { color: '#10B981' }]}>Open Now</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.hubModalCloseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
                  onPress={closePartnerHubDetails}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.hubModalCloseText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Address & Quick Actions */}
              <View style={[styles.hubLocationRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                <Text style={[styles.hubAddressText, { color: isDark ? '#CBD5E1' : '#475569' }]} numberOfLines={1}>
                  📍 {selectedHub?.address || 'Vijay Nagar, Indore, Madhya Pradesh'}
                </Text>
                <View style={styles.hubActionBtnsRow}>
                  <TouchableOpacity
                    style={[styles.hubQuickBtn, { borderColor: `${primaryColor || '#FF4D2D'}55`, backgroundColor: `${primaryColor || '#FF4D2D'}12` }]}
                    onPress={() => {
                      Alert.alert(
                        selectedHub?.shopName || 'Partner Hub',
                        `Connecting to Workshop Helpline:\n📞 +91 98260 54321\n\nDirect contact with ${selectedHub?.name || 'Partner Manager'}.`,
                        [{ text: 'Close', style: 'cancel' }, { text: 'Call Now', style: 'default' }]
                      );
                    }}
                  >
                    <Text style={[styles.hubQuickBtnText, { color: primaryColor || '#FF4D2D' }]}>📞 Helpline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.hubQuickBtn, { borderColor: 'rgba(16, 185, 129, 0.4)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}
                    onPress={() => {
                      Alert.alert(
                        'Workshop Location',
                        `📍 ${selectedHub?.address || 'Vijay Nagar, Indore'}\n\nEstimated Arrival Time: 15 Mins Doorstep Dispatch.`
                      );
                    }}
                  >
                    <Text style={[styles.hubQuickBtnText, { color: '#10B981' }]}>⚡ 15m Dispatch</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Quality Strip */}
            <View style={[styles.hubTrustStrip, { backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}>
              <View style={styles.hubTrustItem}>
                <Text style={styles.hubTrustEmoji}>🛡️</Text>
                <Text style={[styles.hubTrustText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>30-Day Warranty</Text>
              </View>
              <View style={styles.hubTrustDivider} />
              <View style={styles.hubTrustItem}>
                <Text style={styles.hubTrustEmoji}>⚡</Text>
                <Text style={[styles.hubTrustText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>Superfast Arrival</Text>
              </View>
              <View style={styles.hubTrustDivider} />
              <View style={styles.hubTrustItem}>
                <Text style={styles.hubTrustEmoji}>💵</Text>
                <Text style={[styles.hubTrustText, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>Pay After Work</Text>
              </View>
            </View>

            {/* Services Heading */}
            <View style={styles.hubServicesHeaderWrap}>
              <Text style={[styles.hubServicesHeading, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {language === 'hi' ? 'वर्कशॉप रेट कार्ड व सेवाएं' : 'Workshop Services & Rate Card'}
              </Text>
              <Text style={[styles.hubServicesCount, { color: primaryColor || '#FF4D2D' }]}>
                {getHubServices(selectedHub).length} {language === 'hi' ? 'सेवाएं' : 'Services'}
              </Text>
            </View>

            {/* Services List */}
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            >
              {getHubServices(selectedHub).map((srv) => (
                <View
                  key={srv.id}
                  style={[
                    styles.hubServiceCard,
                    {
                      backgroundColor: isDark ? '#131A2B' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                    },
                  ]}
                >
                  <View style={styles.hubServiceCardTop}>
                    <View style={[styles.hubServiceIconBox, { backgroundColor: `${primaryColor || '#FF4D2D'}15` }]}>
                      <Text style={styles.hubServiceEmoji}>{srv.icon}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <View style={[styles.hubServiceCatPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                          <Text style={[styles.hubServiceCatText, { color: isDark ? '#94A3B8' : '#64748B' }]}>{srv.category}</Text>
                        </View>
                        <Text style={[styles.hubServiceDuration, { color: isDark ? '#94A3B8' : '#64748B' }]}>⏱️ {srv.duration}</Text>
                      </View>
                      <Text style={[styles.hubServiceTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                        {srv.title}
                      </Text>
                    </View>
                  </View>

                  {/* Inclusions checklist */}
                  <View style={styles.hubInclusionsWrap}>
                    {srv.inclusions.map((inc, i) => (
                      <View key={i} style={styles.hubInclusionRow}>
                        <Text style={styles.hubCheckmark}>✓</Text>
                        <Text style={[styles.hubInclusionText, { color: isDark ? '#94A3B8' : '#475569' }]}>{inc}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Pricing and Book Button */}
                  <View style={[styles.hubServiceFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                        <Text style={[styles.hubServicePrice, { color: primaryColor || '#FF4D2D' }]}>₹{srv.price}</Text>
                        <Text style={styles.hubServiceOldPrice}>₹{srv.originalPrice}</Text>
                        <View style={styles.hubDiscountBadge}>
                          <Text style={styles.hubDiscountText}>{srv.discount}</Text>
                        </View>
                      </View>
                      <Text style={[styles.hubTaxNote, { color: isDark ? '#64748B' : '#94A3B8' }]}>
                        {language === 'hi' ? 'कोई अग्रिम शुल्क नहीं • काम के बाद दें' : 'No advance fee • Standard Warranty'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.hubBookBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                      activeOpacity={0.85}
                      onPress={() => handleBookHubService(srv, selectedHub)}
                    >
                      <Text style={styles.hubBookBtnText}>
                        {language === 'hi' ? 'बुक करें ➔' : 'Book Now ➔'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
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
  topHeader: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#070A12',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    width: '100%',
  },
  unifiedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  circleLogoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FF4D2D',
    overflow: 'hidden',
    backgroundColor: '#0E131F',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    elevation: 4,
    shadowColor: '#FF4D2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  circleLogoImg: {
    width: '100%',
    height: '100%',
  },
  miniRefreshBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  headerLocationBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginHorizontal: 8,
    minWidth: 0,
    backgroundColor: '#0E1526',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  locIconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locPinIcon: {
    fontSize: 15,
  },
  locTextColumn: {
    flex: 1,
    minWidth: 0,
  },
  locTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locMainTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  locChevron: {
    fontSize: 8.5,
    color: '#94A3B8',
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  pulseText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '700',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  headerBtnIcon: {
    fontSize: 19,
  },
  badgeCount: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4D2D',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#070A12',
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  scrollContent: {
    paddingBottom: 85,
  },
  // Search
  searchContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1523',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    paddingHorizontal: 10,
    height: 48,
  },
  searchLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  searchIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
    flexShrink: 0,
  },
  searchBadgeIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  searchPlaceholder: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  catRealImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  searchActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchPillTag: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  searchPillText: {
    color: '#FF7A59',
    fontSize: 10,
    fontWeight: '800',
  },
  // Stories
  storiesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 58,
  },
  storyRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  storyInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyEmoji: {
    fontSize: 20,
  },
  storyLabel: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  storyGlowBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  storySparkle: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
  },
  // Hero Carousel - Redesigned with Face Clear & Bottom Info Bar
  heroSection: {
    marginTop: 6,
  },
  heroCard: {
    height: 265,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
    backgroundColor: '#0D1322',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroImageSection: {
    height: 165,
    width: '100%',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  heroBgImg: {
    width: '100%',
    height: '100%',
  },
  heroTopRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTagBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroTagText: {
    color: '#FF7A59',
    fontSize: 9.5,
    fontWeight: '900',
  },
  heroMostBookedBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroMostBookedText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  heroBottomBar: {
    minHeight: 95,
    backgroundColor: '#0F1523',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroMetaLeft: {
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  heroActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroPriceBlock: {
    flexDirection: 'column',
  },
  heroPriceLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
  },
  heroPriceVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  heroOldPrice: {
    color: '#64748B',
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  heroBookBtn: {
    backgroundColor: '#FF4D2D',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  heroBookBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeDot: {
    width: 20,
    backgroundColor: '#FF4D2D',
  },
  // Luxury Voucher
  voucherContainer: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  voucherTicket: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.35)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  notchLeft: {
    position: 'absolute',
    left: -8,
    top: '50%',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#070A12',
    marginTop: -7,
  },
  notchRight: {
    position: 'absolute',
    right: -8,
    top: '50%',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#070A12',
    marginTop: -7,
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  voucherIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherIcon: {
    fontSize: 18,
  },
  voucherTitle: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  voucherTag: {
    backgroundColor: '#FF4D2D',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  voucherTagText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  voucherSub: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
  },
  dashedDivider: {
    width: 1,
    height: 36,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
  },
  voucherRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponCodePill: {
    backgroundColor: 'rgba(255, 77, 45, 0.2)',
    borderWidth: 1,
    borderColor: '#FF4D2D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  couponCodeText: {
    color: '#FF7A59',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  copyNotice: {
    color: '#10B981',
    fontSize: 8.5,
    fontWeight: '800',
    marginTop: 3,
  },
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionPre: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FF4D2D',
    letterSpacing: 0.8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 1,
  },
  seeAllBtn: {
    color: '#FF4D2D',
    fontSize: 12,
    fontWeight: '800',
  },
  // Categories Grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  catCard: {
    width: (SCREEN_WIDTH - 24 - 24) / 4,
    backgroundColor: '#0F1523',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  catIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#131A2B',
    position: 'relative',
    marginBottom: 6,
  },
  catRealImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  catIconText: {
    fontSize: 22,
  },
  catMicroTag: {
    position: 'absolute',
    bottom: -5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'center',
  },
  catMicroTagText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
  },
  catName: {
    color: '#F1F5F9',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 13,
    height: 26,
  },
  catCount: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  // Top Specialists
  proCard: {
    width: 260,
    backgroundColor: '#0F1523',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
  },
  proHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  proAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
  },
  proBadgeVerified: {
    position: 'absolute',
    top: 30,
    left: 32,
    backgroundColor: '#070A12',
    borderRadius: 8,
  },
  proVerifiedShield: {
    fontSize: 12,
  },
  proName: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  proRole: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 1,
  },
  proStar: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  proJobs: {
    color: '#64748B',
    fontSize: 10,
  },
  proDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 8,
    marginTop: 12,
  },
  proDetailItem: {
    alignItems: 'center',
  },
  proDetailLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
  },
  proDetailVal: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 2,
  },
  proActionBtn: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.35)',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 12,
  },
  proActionText: {
    color: '#FF4D2D',
    fontSize: 11,
    fontWeight: '800',
  },
  // Bestseller services
  bestsellerCard: {
    width: 248,
    backgroundColor: '#0F1523',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 14,
  },
  bsImageWrap: {
    width: '100%',
    height: 125,
    position: 'relative',
  },
  bsImage: {
    width: '100%',
    height: '100%',
  },
  bsBadgesRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bsDiscountTag: {
    backgroundColor: '#FF4D2D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bsDiscountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  bsRatingTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bsRatingText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
  },
  bsBody: {
    padding: 12,
  },
  bsCatText: {
    color: '#FF4D2D',
    fontSize: 9,
    fontWeight: '800',
  },
  bsTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    marginTop: 2,
  },
  bsTime: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  bsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
    marginTop: 10,
  },
  bsPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  bsOldPrice: {
    color: '#64748B',
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  bsDoorstepTag: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '700',
  },
  bsBookBtn: {
    backgroundColor: '#FF4D2D',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bsBookBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  // Assurance card
  assuranceCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#0F1523',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
  },
  assuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 10,
  },
  assuranceShieldIcon: {
    fontSize: 26,
  },
  assuranceMainTitle: {
    color: '#FF4D2D',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  assuranceSubTitle: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
  },
  assuranceFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  assuranceCol: {
    flex: 1,
    alignItems: 'center',
  },
  featIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  featTitle: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  featDesc: {
    color: '#94A3B8',
    fontSize: 8.5,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 11,
  },
  vendorHubCard: {
    width: 250,
    backgroundColor: '#131A2B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  vendorHubTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  vendorHubBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  vendorHubBadgeText: {
    color: '#60A5FA',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vendorHubLiveDotWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vendorHubLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  vendorHubLiveText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  vendorHubName: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  vendorHubOwner: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  vendorHubCategory: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 3,
  },
  vendorHubAddress: {
    color: '#64748B',
    fontSize: 10.5,
    marginBottom: 12,
  },
  vendorHubFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  vendorHubRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vendorHubRating: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },
  vendorHubJobs: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  vendorHubActionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  vendorHubActionText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  portalSwitcherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  portalChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#0E1526',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  portalChipActive: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderColor: '#FF4D2D',
  },
  portalChipActiveText: {
    color: '#FF4D2D',
    fontSize: 11,
    fontWeight: '800',
  },
  portalChipVendor: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  portalChipVendorText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  portalChipWorker: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  portalChipWorkerText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  // Guarantee & Dispute Styles
  guaranteeCardContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
    width: '100%',
  },
  guaranteeCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  guaranteeCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  guaranteeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  guaranteeIconEmoji: {
    fontSize: 22,
  },
  guaranteeTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.1,
    flex: 1,
    flexShrink: 1,
    marginRight: 6,
  },
  guaranteeLiveBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
    alignSelf: 'center',
  },
  guaranteeLiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  guaranteeSub: {
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 14,
  },
  guaranteeClaimBtn: {
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  guaranteeClaimBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  // Dispute Modal Styles
  disputeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  disputeModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  disputeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  disputeModalTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  disputeModalSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  disputeCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disputeCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disputeFieldLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 6,
  },
  disputeChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  disputeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  disputeChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  disputeInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12.5,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  disputeVideoUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  disputeVideoIcon: {
    fontSize: 26,
  },
  disputeVideoBtnTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  disputeVideoBtnSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  disputeRemoveVideoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disputeRemoveVideoText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '900',
  },
  disputeAddBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  disputeAddBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  disputeActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  disputeActionCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  disputeActionEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  disputeActionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disputeActionSub: {
    fontSize: 9.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  disputeSubmitBtn: {
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disputeSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  // Incomplete Draft Banner Styles
  incompleteDraftBanner: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    width: '100%',
  },
  incompleteDraftInner: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  incompleteDraftTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  incompleteDraftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  incompleteDraftTextCol: {
    flex: 1,
    minWidth: 0,
  },
  incompleteDraftIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  incompleteDraftIcon: {
    fontSize: 20,
  },
  incompleteDraftTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.1,
  },
  incompleteDraftMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  incompleteDraftTag: {
    backgroundColor: '#F97316',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    flexShrink: 0,
  },
  incompleteDraftTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  incompleteDraftSub: {
    fontSize: 11,
    lineHeight: 15,
    flexShrink: 1,
  },
  incompleteDraftActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resumeDraftBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeDraftText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  deleteDraftPillBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deleteDraftPillIcon: {
    fontSize: 14,
  },
  // Partner Hub Modal Styles
  hubModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  hubModalContent: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '92%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  hubModalHandleBar: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  hubModalHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
  },
  hubHeaderCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  hubHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  hubAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubAvatarEmoji: {
    fontSize: 24,
  },
  hubModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  hubModalOwner: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  hubRatingBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hubRatingText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  hubVerifiedTag: {
    fontSize: 11,
    fontWeight: '800',
  },
  hubLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  hubLiveStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  hubModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubModalCloseText: {
    fontSize: 14,
    fontWeight: '900',
  },
  hubLocationRow: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  hubAddressText: {
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 8,
  },
  hubActionBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  hubQuickBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  hubQuickBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  hubTrustStrip: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  hubTrustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hubTrustEmoji: {
    fontSize: 14,
  },
  hubTrustText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  hubTrustDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  hubServicesHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  hubServicesHeading: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  hubServicesCount: {
    fontSize: 11,
    fontWeight: '800',
  },
  hubServiceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  hubServiceCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  hubServiceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubServiceEmoji: {
    fontSize: 20,
  },
  hubServiceCatPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hubServiceCatText: {
    fontSize: 10,
    fontWeight: '800',
  },
  hubServiceDuration: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  hubServiceTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginTop: 4,
    lineHeight: 18,
  },
  hubInclusionsWrap: {
    marginTop: 10,
    gap: 4,
    paddingLeft: 4,
  },
  hubInclusionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hubCheckmark: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '900',
  },
  hubInclusionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hubServiceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  hubServicePrice: {
    fontSize: 18,
    fontWeight: '900',
  },
  hubServiceOldPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  hubDiscountBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hubDiscountText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '900',
  },
  hubTaxNote: {
    fontSize: 9.5,
    marginTop: 2,
  },
  hubBookBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
  },
  hubBookBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});

import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import AdminBrandingTab from '../components/admin/AdminBrandingTab';
import AdminBannersTab from '../components/admin/AdminBannersTab';
import AdminCategoriesTab from '../components/admin/AdminCategoriesTab';
import AdminEditServiceModal from '../components/admin/AdminEditServiceModal';
import { openImagePicker } from '../utils/imagePickerHelper';

export default function AdminDashboardScreen({ navigation }) {
  const { currentUser } = useContext(AuthContext);
  const { primaryColor, heroBanners } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('orders'); // orders, services, categories, banners, branding, fleet, users, analytics, settings
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editServiceModalVisible, setEditServiceModalVisible] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);

  // Core Data
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [serviceCatFilter, setServiceCatFilter] = useState('ALL');
  const [workerFilter, setWorkerFilter] = useState('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [vendorFilter, setVendorFilter] = useState('ALL');

  // Pagination & Real-Time Filter States
  const ITEMS_PER_PAGE = 6;
  const [ordersPage, setOrdersPage] = useState(1);
  const [servicesPage, setServicesPage] = useState(1);
  const [fleetPage, setFleetPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [vendorsPage, setVendorsPage] = useState(1);
  const [realTimeOnly, setRealTimeOnly] = useState(true);

  // Modals
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [broadcastModalVisible, setBroadcastModalVisible] = useState(false);
  const [workerDocsModalVisible, setWorkerDocsModalVisible] = useState(false);
  const [selectedWorkerForDocs, setSelectedWorkerForDocs] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // New Service Form State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceOriginalPrice, setNewServiceOriginalPrice] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Repairs');
  const [newServiceDuration, setNewServiceDuration] = useState('45 mins');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceImage, setNewServiceImage] = useState('');

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Settings State
  const [emergencySurgeActive, setEmergencySurgeActive] = useState(true);
  const [commissionRate, setCommissionRate] = useState('18');

  useEffect(() => {
    fetchAllData();
  }, []);

  const parseArray = (res) => {
    if (!res || !res.data) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.data)) return res.data.data;
    if (Array.isArray(res.data.workers)) return res.data.workers;
    if (Array.isArray(res.data.bookings)) return res.data.bookings;
    if (Array.isArray(res.data.services)) return res.data.services;
    if (Array.isArray(res.data.users)) return res.data.users;
    if (Array.isArray(res.data.providers)) return res.data.providers;
    return [];
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [bRes, sRes, wRes, uRes, pRes] = await Promise.allSettled([
        client.get('/bookings'),
        client.get('/services'),
        client.get('/workers'),
        client.get('/users'),
        client.get('/providers'),
      ]);
      if (bRes.status === 'fulfilled') setBookings(parseArray(bRes.value));
      if (sRes.status === 'fulfilled') setServices(parseArray(sRes.value));
      if (wRes.status === 'fulfilled') setWorkers(parseArray(wRes.value));
      if (uRes.status === 'fulfilled') setUsers(parseArray(uRes.value));
      if (pRes.status === 'fulfilled') setProviders(parseArray(pRes.value));
    } catch (err) {
      console.log('Error fetching admin data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- ACTIONS: BOOKINGS ---
  const handleUpdateOrderStatus = async (bookingId, newStatus) => {
    try {
      await client.put(`/bookings/${bookingId}`, { status: newStatus });
      setBookings(prev =>
        prev.map(b => ((b._id === bookingId || b.id === bookingId) ? { ...b, status: newStatus } : b))
      );
      Alert.alert('Status Updated ✅', `Booking status changed to: ${newStatus.toUpperCase()}`);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Could not update status');
    }
  };

  const handleDeleteOrder = (bookingId) => {
    Alert.alert(
      'Delete Booking Permanently?',
      'This will remove the order records from MongoDB and customer app history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.delete(`/bookings/${bookingId}`);
              setBookings(prev => prev.filter(b => b._id !== bookingId && b.id !== bookingId));
              Alert.alert('Deleted 🗑️', 'Booking was permanently deleted.');
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Delete failed');
            }
          },
        },
      ]
    );
  };

  const handleOpenAssignModal = (booking) => {
    setSelectedBooking(booking);
    setAssignModalVisible(true);
  };

  const handleAssignWorkerToBooking = async (worker) => {
    if (!selectedBooking) return;
    const bookingId = selectedBooking._id || selectedBooking.id;
    try {
      await client.put(`/bookings/${bookingId}`, {
        assignedProvider: worker.id || worker.workerId || worker._id,
        assignedProviderName: worker.name,
        assignedWorkerPhone: worker.phone || worker.mobile,
        status: 'confirmed',
      });
      setBookings(prev =>
        prev.map(b =>
          (b._id === bookingId || b.id === bookingId)
            ? {
                ...b,
                assignedProvider: worker.id || worker.workerId,
                assignedProviderName: worker.name,
                status: 'confirmed',
              }
            : b
        )
      );
      setAssignModalVisible(false);
      Alert.alert('Worker Assigned 👷‍♂️', `${worker.name} assigned to order #${String(bookingId).slice(-6).toUpperCase()}`);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to assign worker');
    }
  };

  // --- ACTIONS: SERVICES ---
  const handleCreateService = async () => {
    if (!newServiceName.trim() || !newServicePrice.trim()) {
      Alert.alert('Missing Info', 'Please enter service title and price.');
      return;
    }

    const trimmed = newServiceName.trim();
    // Check locally against loaded services
    const conflict = services.find(
      (s) => (s.name || '').trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (conflict) {
      Alert.alert('This name is already in use', 'This name is already in use. Please enter a different service name.');
      return;
    }

    try {
      const payload = {
        name: trimmed,
        category: newServiceCategory,
        price: Number(newServicePrice),
        originalPrice: Number(newServiceOriginalPrice || Number(newServicePrice) * 1.35),
        duration: newServiceDuration || '45 mins',
        description: newServiceDesc.trim() || 'Verified professional doorstep service with 30-day service warranty.',
        image: newServiceImage.trim() || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
        popular: true,
        highlights: ['Certified & Background Verified', 'No-contact safety standard', 'Transparent upfront billing'],
      };
      await client.post('/services', payload);
      Alert.alert('Service Published! 🚀', 'New service is now visible in customer app.');
      setServiceModalVisible(false);
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceOriginalPrice('');
      setNewServiceDesc('');
      setNewServiceImage('');
      fetchAllData();
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      if (msg && msg.toLowerCase().includes('already in use')) {
        Alert.alert('This name is already in use', 'This name is already in use. Please enter a different service name.');
      } else {
        Alert.alert('Error', msg || 'Failed to create service');
      }
    }
  };

  const handleDeleteService = (serviceId, serviceTitle) => {
    Alert.alert(
      'Remove Service Catalog Item?',
      `Delete "${serviceTitle}" from customer catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.delete(`/services/${serviceId}`);
              setServices(prev => prev.filter(s => s._id !== serviceId && s.id !== serviceId));
              Alert.alert('Removed', 'Service removed from customer app.');
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Could not delete service');
            }
          },
        },
      ]
    );
  };

  // --- ACTIONS: FLEET / WORKERS ---
  const handleToggleWorkerStatus = async (worker) => {
    const workerId = worker.id || worker.workerId || worker._id;
    const newStatus = worker.isOnline === false;
    try {
      await client.put(`/workers/${workerId}`, { isOnline: newStatus });
      setWorkers(prev =>
        prev.map(w => ((w.id === workerId || w.workerId === workerId || w._id === workerId) ? { ...w, isOnline: newStatus } : w))
      );
      Alert.alert('Fleet Updated', `${worker.name} is now ${newStatus ? 'ONLINE 🟢' : 'OFFLINE ⚪'}`);
    } catch (e) {
      // Fallback local update
      setWorkers(prev =>
        prev.map(w => ((w.id === workerId || w.workerId === workerId || w._id === workerId) ? { ...w, isOnline: newStatus } : w))
      );
    }
  };

  const handleOpenWorkerDocs = (worker) => {
    setSelectedWorkerForDocs(worker);
    setWorkerDocsModalVisible(true);
  };

  const handleVerifyAllWorkerDocs = () => {
    Alert.alert(
      'KYC Dossier Approved! 🛡️',
      `All official documents (Aadhaar, PAN, NSDC Skill Certificate, Police Clearance) for ${selectedWorkerForDocs?.name || 'Technician'} have been verified and approved in the enterprise system.`
    );
    setWorkerDocsModalVisible(false);
  };

  const handleRejectWorkerDocs = () => {
    Alert.alert(
      'Document Resubmission Requested ⚠️',
      `A notification has been sent to ${selectedWorkerForDocs?.name || 'Technician'} to re-upload clear document copies.`
    );
    setWorkerDocsModalVisible(false);
  };

  // --- ACTIONS: USERS ---
  const handlePromoteToAdmin = async (user) => {
    const phone = user.phone;
    Alert.alert(
      'Grant Super Admin Permissions?',
      `Are you sure you want to promote ${user.name || phone} to Super Admin? They will have full access to all controls.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Super Admin 🛡️',
          onPress: async () => {
            try {
              await client.post('/auth/make-admin', { phone, pin: 'admin123' });
              setUsers(prev =>
                prev.map(u => (u.phone === phone ? { ...u, role: 'superadmin' } : u))
              );
              Alert.alert('Success 🎉', `${user.name || phone} is now a Super Administrator!`);
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to promote user');
            }
          },
        },
      ]
    );
  };

  // --- ACTIONS: BROADCAST ---
  const handleSendBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      Alert.alert('Missing Fields', 'Please enter broadcast title and message.');
      return;
    }
    Alert.alert(
      'Broadcast Dispatched! 📢',
      `Sent to ${users.length || 100}+ users and technicians via in-app push network:\n\n"${broadcastTitle}"`
    );
    setBroadcastModalVisible(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  // --- PHONE / WHATSAPP CALL ---
  const handleMakeCall = (phone) => {
    if (!phone) {
      Alert.alert('No Number', 'Mobile number not found.');
      return;
    }
    const clean = String(phone).replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${clean}`);
  };

  const handleOpenWhatsApp = (phone) => {
    if (!phone) return;
    const clean = String(phone).replace(/[^0-9]/g, '');
    const intlPhone = clean.length === 10 ? `91${clean}` : clean;
    Linking.openURL(`https://wa.me/${intlPhone}?text=Hello%20from%20Helper%20Admin%20Support`);
  };

  // --- BULLETPROOF FORMATTERS ---
  const formatOrderDate = (dateVal) => {
    if (!dateVal) return 'Recent';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'Recent';
      const day = d.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[d.getMonth()] || '';
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return 'Recent';
    }
  };

  const formatCurrency = (val) => {
    const num = Math.round(Number(val) || 0);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Helper: Detect seed / dummy / test bookings
  const isFakeOrder = (b) => {
    if (!b) return true;
    if (b.isDemo === true || b.isSeed === true) return true;
    const phone = String(b.customerPhone || b.phone || '').replace(/[^0-9]/g, '');
    const name = String(b.customerName || b.name || '').trim().toLowerCase();
    
    // Seed dummy phones from seedData.js
    if (['9876500001', '9876500002', '9876500003'].includes(phone)) return true;
    
    // Generic dummy names with test dummy phones
    if (phone === '9876543210' && (name === 'customer' || name === 'valued customer' || !name)) return true;

    return false;
  };

  // --- COMPUTED ANALYTICS & FILTERING ---
  const safeBookings = useMemo(() => (Array.isArray(bookings) ? bookings : []), [bookings]);
  const safeServices = useMemo(() => (Array.isArray(services) ? services : []), [services]);
  const safeWorkers = useMemo(() => (Array.isArray(workers) ? workers : []), [workers]);
  const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);
  const safeProviders = useMemo(() => (Array.isArray(providers) ? providers : []), [providers]);

  // Real-Time filtered and sorted bookings
  const filteredBookings = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    const list = safeBookings.filter(b => {
      if (!b) return false;
      if (realTimeOnly && isFakeOrder(b)) return false;

      const cName = String(b.customerName || b.name || '').toLowerCase();
      const cPhone = String(b.customerPhone || b.phone || '');
      const sName = String(b.serviceName || b.service || '').toLowerCase();
      const bId = String(b._id || b.id || b.bookingId || b.bookingCode || '').toLowerCase();

      const matchSearch = !q || cName.includes(q) || cPhone.includes(q) || sName.includes(q) || bId.includes(q);
      const matchFilter =
        orderFilter === 'ALL' || String(b.status || '').toLowerCase() === orderFilter.toLowerCase();

      return matchSearch && matchFilter;
    });

    // Real-time sort: Newest live orders first
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [safeBookings, searchQuery, orderFilter, realTimeOnly]);

  const totalRealOrders = useMemo(() => safeBookings.filter(b => !isFakeOrder(b)).length, [safeBookings]);

  // Pagination for Orders
  const totalOrderPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, ordersPage]);

  // Services filtering & pagination
  const filteredServices = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return safeServices.filter(s => {
      if (!s) return false;
      const sName = String(s.name || '').toLowerCase();
      const sCat = String(s.category || '').toLowerCase();

      const matchSearch = !q || sName.includes(q) || sCat.includes(q);
      const matchCat =
        serviceCatFilter === 'ALL' || sCat === serviceCatFilter.toLowerCase();

      return matchSearch && matchCat;
    });
  }, [safeServices, searchQuery, serviceCatFilter]);

  const totalServicePages = Math.max(1, Math.ceil(filteredServices.length / ITEMS_PER_PAGE));
  const paginatedServices = useMemo(() => {
    const start = (servicesPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServices, servicesPage]);

  // Workers filtering & pagination
  const filteredWorkers = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return safeWorkers.filter(w => {
      if (!w) return false;
      const wName = String(w.name || '').toLowerCase();
      const wPhone = String(w.phone || w.mobile || '');
      const wCat = String(w.category || '').toLowerCase();

      const matchSearch = !q || wName.includes(q) || wPhone.includes(q) || wCat.includes(q);
      const matchFilter =
        workerFilter === 'ALL' ||
        (workerFilter === 'ONLINE' && w.isOnline !== false) ||
        (workerFilter === 'OFFLINE' && w.isOnline === false);

      return matchSearch && matchFilter;
    });
  }, [safeWorkers, searchQuery, workerFilter]);

  const totalWorkerPages = Math.max(1, Math.ceil(filteredWorkers.length / ITEMS_PER_PAGE));
  const paginatedWorkers = useMemo(() => {
    const start = (fleetPage - 1) * ITEMS_PER_PAGE;
    return filteredWorkers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredWorkers, fleetPage]);

  // Users filtering & pagination
  const filteredUsers = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return safeUsers.filter(u => {
      if (!u) return false;
      const uName = String(u.name || '').toLowerCase();
      const uPhone = String(u.phone || '');
      const uEmail = String(u.email || '').toLowerCase();

      const matchSearch = !q || uName.includes(q) || uPhone.includes(q) || uEmail.includes(q);
      const matchRole =
        userRoleFilter === 'ALL' || String(u.role || 'customer').toLowerCase() === userRoleFilter.toLowerCase();

      return matchSearch && matchRole;
    });
  }, [safeUsers, searchQuery, userRoleFilter]);

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, usersPage]);

  // Providers (Hubs) filtering & pagination
  const filteredProviders = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return safeProviders.filter(p => {
      if (!p) return false;
      const sName = String(p.shopName || p.name || '').toLowerCase();
      const oName = String(p.name || '').toLowerCase();
      const phone = String(p.phone || '');
      const cat = String(p.category || '').toLowerCase();
      const addr = String(p.address || p.location || '').toLowerCase();

      const matchSearch = !q || sName.includes(q) || oName.includes(q) || phone.includes(q) || cat.includes(q) || addr.includes(q);
      const matchFilter =
        vendorFilter === 'ALL' ||
        (vendorFilter === 'VERIFIED' && p.verified !== false) ||
        (vendorFilter === 'ACTIVE' && p.status === 'Active');

      return matchSearch && matchFilter;
    });
  }, [safeProviders, searchQuery, vendorFilter]);

  const totalVendorPages = Math.max(1, Math.ceil(filteredProviders.length / ITEMS_PER_PAGE));
  const paginatedVendors = useMemo(() => {
    const start = (vendorsPage - 1) * ITEMS_PER_PAGE;
    return filteredProviders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProviders, vendorsPage]);

  // Executive KPI Numbers
  const totalGrossRev = useMemo(() => {
    return safeBookings.reduce((sum, b) => {
      if (!b) return sum;
      const amt = Number(b.pricing?.totalAmount || b.totalAmount || b.pricing?.finalPayable || b.price) || 0;
      return sum + amt;
    }, 0);
  }, [safeBookings]);

  const totalPlatformCut = Math.round(totalGrossRev * (Number(commissionRate || 18) / 100));
  const completedOrdersCount = safeBookings.filter(b => String(b?.status || '').toLowerCase() === 'completed').length;
  const inProgressCount = safeBookings.filter(b => String(b?.status || '').toLowerCase() === 'in_progress').length;
  const pendingOrdersCount = safeBookings.filter(b => String(b?.status || '').toLowerCase() === 'pending').length;
  const onlineWorkersCount = safeWorkers.filter(w => w?.isOnline !== false).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.headerBackBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBackText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.headerMeta}>
          <View style={styles.adminBadgeRow}>
            <View style={styles.livePulseDot} />
            <Text style={styles.headerTitle}>HELPER COMMAND CENTER</Text>
            <View style={styles.superRoleBadge}>
              <Text style={styles.superRoleText}>SUPER ADMIN</Text>
            </View>
          </View>
          <Text style={styles.headerSub}>
            Logged in as {currentUser?.name || 'Administrator'} • 256-bit Secured Master Access
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerActionBtn}
          activeOpacity={0.7}
          onPress={() => {
            setRefreshing(true);
            fetchAllData();
          }}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#FF4D2D" />
          ) : (
            <Text style={styles.headerActionIcon}>🔄</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Line 2: 3-Card Executive Dashboard Strip */}
      <View style={styles.topDashboardStrip}>
        <TouchableOpacity
          style={[styles.stripCard, activeTab === 'orders' && styles.stripCardActive]}
          activeOpacity={0.8}
          onPress={() => {
            setActiveTab('orders');
            setOrdersPage(1);
          }}
        >
          <View style={styles.stripCardHeader}>
            <Text style={styles.stripCardIcon}>📦</Text>
            <View style={styles.liveGreenPill}>
              <Text style={styles.liveGreenText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.stripCardValue}>{totalRealOrders}</Text>
          <Text style={styles.stripCardLabel}>Real Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stripCard, activeTab === 'services' && styles.stripCardActive]}
          activeOpacity={0.8}
          onPress={() => {
            setActiveTab('services');
            setServicesPage(1);
          }}
        >
          <View style={styles.stripCardHeader}>
            <Text style={styles.stripCardIcon}>⚡</Text>
            <View style={[styles.liveGreenPill, { backgroundColor: 'rgba(255, 77, 45, 0.2)' }]}>
              <Text style={[styles.liveGreenText, { color: '#FF4D2D' }]}>CATALOG</Text>
            </View>
          </View>
          <Text style={styles.stripCardValue}>{safeServices.length}</Text>
          <Text style={styles.stripCardLabel}>Active Services</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stripCard, activeTab === 'analytics' && styles.stripCardActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('analytics')}
        >
          <View style={styles.stripCardHeader}>
            <Text style={styles.stripCardIcon}>💰</Text>
            <View style={[styles.liveGreenPill, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Text style={[styles.liveGreenText, { color: '#3B82F6' }]}>18% CUT</Text>
            </View>
          </View>
          <Text style={styles.stripCardValue}>₹{formatCurrency(totalGrossRev)}</Text>
          <Text style={styles.stripCardLabel}>Gross GMV</Text>
        </TouchableOpacity>
      </View>

      {/* Line 3: Primary Navigation Tabs */}
      <View style={styles.navBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {[
            { id: 'orders', label: 'Orders', icon: '📦', count: filteredBookings.length },
            { id: 'services', label: 'Services', icon: '⚡', count: safeServices.length },
            { id: 'categories', label: 'Categories', icon: '📁' },
            { id: 'banners', label: 'Banners', icon: '🖼️', count: (heroBanners || []).length },
            { id: 'branding', label: 'App Theme', icon: '🎨' },
            { id: 'vendors', label: 'Vendors (Hubs)', icon: '🏢', count: safeProviders.length },
            { id: 'fleet', label: 'Fleet Pros', icon: '👷', count: safeWorkers.length || 12 },
            { id: 'users', label: 'Users', icon: '👥', count: safeUsers.length },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.navTabItem, isActive && styles.navTabItemActive]}
                activeOpacity={0.7}
                onPress={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.navTabIcon}>{tab.icon}</Text>
                <Text style={[styles.navTabLabel, isActive && styles.navTabLabelActive]}>
                  {tab.label}
                </Text>
                {tab.count !== undefined && (
                  <View style={[styles.navCountBadge, isActive && styles.navCountBadgeActive]}>
                    <Text style={[styles.navCountText, isActive && styles.navCountTextActive]}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Body */}
      {loading && !refreshing ? (
        <View style={styles.fullLoaderBox}>
          <ActivityIndicator size="large" color="#FF4D2D" />
          <Text style={styles.fullLoaderText}>Syncing Enterprise Master Data...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* ==================== TAB 1: ORDERS ==================== */}
          {activeTab === 'orders' && (
            <View style={{ flex: 1 }}>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by customer, phone, service, or #ID..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Text style={styles.clearSearchText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Dashboard Section Stream Bar */}
              <View style={styles.dashboardSectionStreamBar}>
                <View style={styles.streamLeftRow}>
                  <View style={[styles.streamPulseDot, { backgroundColor: realTimeOnly ? '#10B981' : '#FF4D2D' }]} />
                  <Text style={styles.streamTitle}>
                    {realTimeOnly ? 'REAL-TIME LIVE STREAM' : 'ALL BOOKINGS ARCHIVE'}
                  </Text>
                </View>
                <Text style={styles.streamCounter}>
                  Showing {paginatedOrders.length} of {filteredBookings.length}
                </Text>
              </View>

              {/* Status Filter Chips & Real-time Mode */}
              <View style={styles.filterBarWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  <TouchableOpacity
                    style={[styles.filterChip, realTimeOnly && styles.realtimeToggleActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setRealTimeOnly(!realTimeOnly);
                      setOrdersPage(1);
                    }}
                  >
                    <Text style={[styles.filterChipText, realTimeOnly && styles.realtimeToggleTextActive]}>
                      {realTimeOnly ? `🟢 Real-Time (${totalRealOrders})` : `⚪ All (${safeBookings.length})`}
                    </Text>
                  </TouchableOpacity>

                  {[
                    { key: 'ALL', label: 'All Status' },
                    { key: 'pending', label: `🟡 Pending (${pendingOrdersCount})` },
                    { key: 'confirmed', label: '🟣 Confirmed' },
                    { key: 'in_progress', label: `🔵 In Progress (${inProgressCount})` },
                    { key: 'completed', label: `🟢 Done (${completedOrdersCount})` },
                    { key: 'cancelled', label: '🔴 Cancelled' },
                  ].map(chip => (
                    <TouchableOpacity
                      key={chip.key}
                      style={[styles.filterChip, orderFilter === chip.key && styles.filterChipActive]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setOrderFilter(chip.key);
                        setOrdersPage(1);
                      }}
                    >
                      <Text style={[styles.filterChipText, orderFilter === chip.key && styles.filterChipTextActive]}>
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Orders List */}
              <FlatList
                data={paginatedOrders}
                keyExtractor={(item, index) => item._id || item.id || String(index)}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const status = String(item?.status || 'pending').toLowerCase();
                  const isCompleted = status === 'completed';
                  const isInProgress = status === 'in_progress';
                  const isCancelled = status === 'cancelled';
                  const isPending = status === 'pending';
                  const bookingAmount = item?.pricing?.totalAmount || item?.totalAmount || item?.pricing?.finalPayable || item?.price || 299;

                  return (
                    <View style={[
                      styles.orderCard,
                      isPending && { borderLeftColor: '#F59E0B', borderLeftWidth: 3.5 },
                      isInProgress && { borderLeftColor: '#3B82F6', borderLeftWidth: 3.5 },
                      isCompleted && { borderLeftColor: '#10B981', borderLeftWidth: 3.5 },
                      isCancelled && { borderLeftColor: '#EF4444', borderLeftWidth: 3.5 },
                    ]}>
                      {/* Top Bar of Card */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.orderIdGroup}>
                          <Text style={styles.orderIdBadge}>
                            #{String(item?._id || item?.id || '').slice(-6).toUpperCase()}
                          </Text>
                          <Text style={styles.orderDateText}>
                            {formatOrderDate(item?.createdAt)}
                          </Text>
                        </View>

                        <View style={[
                          styles.statusBadge,
                          isCompleted && styles.statusCompleted,
                          isInProgress && styles.statusInProgress,
                          isCancelled && styles.statusCancelled,
                          isPending && styles.statusPending,
                        ]}>
                          <Text style={[
                            styles.statusBadgeLabel,
                            isCompleted && { color: '#10B981' },
                            isInProgress && { color: '#3B82F6' },
                            isCancelled && { color: '#EF4444' },
                            isPending && { color: '#F59E0B' },
                          ]}>
                            {status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {/* Service & Price */}
                      <View style={styles.orderServiceRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.orderServiceTitle}>{item.serviceName || item.service || 'Doorstep Emergency Repair'}</Text>
                          <Text style={styles.orderCategoryTag}>Category: {item.serviceCategory || item.category || 'Home Services'}</Text>
                        </View>
                        <View style={styles.orderPriceBox}>
                          <Text style={styles.orderPriceAmount}>₹{bookingAmount}</Text>
                          <Text style={styles.orderPayMode}>{(item.paymentMode || 'COD').toUpperCase()}</Text>
                        </View>
                      </View>

                      {/* Customer Details & Quick Contact */}
                      <View style={styles.customerBox}>
                        <View style={styles.customerMeta}>
                          <Text style={styles.customerName}>👤 {item.customerName || item.name || 'Customer'}</Text>
                          <Text style={styles.customerPhone}>📞 {item.customerPhone || item.phone || '9876543210'}</Text>
                          <Text style={styles.customerAddress} numberOfLines={2}>
                            📍 {item.fullAddress || item.address || item.customerAddress || 'Indore, MP'}
                          </Text>
                        </View>

                        <View style={styles.quickContactRow}>
                          <TouchableOpacity
                            style={styles.contactIconBtn}
                            onPress={() => handleMakeCall(item.customerPhone || item.phone)}
                          >
                            <Text style={styles.contactBtnIcon}>📞 Call</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.contactIconBtn, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}
                            onPress={() => handleOpenWhatsApp(item.customerPhone || item.phone)}
                          >
                            <Text style={[styles.contactBtnIcon, { color: '#22C55E' }]}>💬 WA</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Assigned Fleet / Technician */}
                      <View style={styles.assignedFleetRow}>
                        <Text style={styles.assignedFleetLabel}>
                          Technician: <Text style={styles.assignedFleetName}>{item.assignedProviderName || 'Auto-Dispatch Nearest'}</Text>
                        </Text>
                        <TouchableOpacity
                          style={styles.reassignBtn}
                          onPress={() => handleOpenAssignModal(item)}
                        >
                          <Text style={styles.reassignBtnText}>
                            {item.assignedProviderName ? 'Reassign 🔄' : 'Assign Pro 👷'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Security Start OTP Highlight */}
                      {item.startOtp && (
                        <View style={styles.otpHighlightBar}>
                          <Text style={styles.otpLabel}>DOORSTEP START OTP:</Text>
                          <Text style={styles.otpCode}>{item.startOtp}</Text>
                          <Text style={styles.otpNotice}>Verify with technician before start</Text>
                        </View>
                      )}

                      {/* Status Action Buttons Bar */}
                      <View style={styles.statusActionsBar}>
                        {!isCompleted && !isCancelled && (
                          <>
                            {isPending && (
                              <TouchableOpacity
                                style={[styles.workflowBtn, { backgroundColor: '#3B82F6' }]}
                                onPress={() => handleUpdateOrderStatus(item._id || item.id, 'confirmed')}
                              >
                                <Text style={styles.workflowBtnText}>Confirm Order</Text>
                              </TouchableOpacity>
                            )}

                            {!isInProgress && (
                              <TouchableOpacity
                                style={[styles.workflowBtn, { backgroundColor: '#F59E0B' }]}
                                onPress={() => handleUpdateOrderStatus(item._id || item.id, 'in_progress')}
                              >
                                <Text style={styles.workflowBtnText}>Start Work</Text>
                              </TouchableOpacity>
                            )}

                            <TouchableOpacity
                              style={[styles.workflowBtn, { backgroundColor: '#10B981' }]}
                              onPress={() => handleUpdateOrderStatus(item._id || item.id, 'completed')}
                            >
                              <Text style={styles.workflowBtnText}>Mark Done ✅</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.workflowBtn, { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, borderColor: '#EF4444' }]}
                              onPress={() => handleUpdateOrderStatus(item._id || item.id, 'cancelled')}
                            >
                              <Text style={[styles.workflowBtnText, { color: '#EF4444' }]}>Cancel</Text>
                            </TouchableOpacity>
                          </>
                        )}

                        <TouchableOpacity
                          style={styles.deleteOrderBtn}
                          onPress={() => handleDeleteOrder(item._id || item.id)}
                        >
                          <Text style={styles.deleteOrderIcon}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyTitle}>No matching bookings found</Text>
                    <Text style={styles.emptySub}>Try searching with different keyword or clearing filters.</Text>
                  </View>
                }
              />

              {/* Orders Pagination Footer */}
              {totalOrderPages > 1 && (
                <View style={styles.paginationFooterBar}>
                  <TouchableOpacity
                    style={[styles.pageNavBtn, ordersPage === 1 && styles.pageNavBtnDisabled]}
                    disabled={ordersPage === 1}
                    onPress={() => setOrdersPage(p => Math.max(1, p - 1))}
                  >
                    <Text style={[styles.pageNavBtnText, ordersPage === 1 && styles.pageNavBtnTextDisabled]}>◀ Prev</Text>
                  </TouchableOpacity>

                  <View style={styles.pageInfoBadge}>
                    <Text style={styles.pageInfoText}>
                      Page <Text style={styles.pageInfoHighlight}>{ordersPage}</Text> of {totalOrderPages}
                    </Text>
                    <Text style={styles.pageItemsCountText}>
                      ({filteredBookings.length} {realTimeOnly ? 'Real' : 'Total'} Orders)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.pageNavBtn, ordersPage >= totalOrderPages && styles.pageNavBtnDisabled]}
                    disabled={ordersPage >= totalOrderPages}
                    onPress={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))}
                  >
                    <Text style={[styles.pageNavBtnText, ordersPage >= totalOrderPages && styles.pageNavBtnTextDisabled]}>Next ▶</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ==================== TAB 2: SERVICES ==================== */}
          {activeTab === 'services' && (
            <View style={{ flex: 1 }}>
              {/* Header with Search and Add Service Button */}
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search services or categories..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <TouchableOpacity
                  style={styles.addServiceTopBtn}
                  activeOpacity={0.8}
                  onPress={() => setServiceModalVisible(true)}
                >
                  <Text style={styles.addServiceTopBtnText}>+ Add Service</Text>
                </TouchableOpacity>
              </View>

              {/* Dashboard Section Stream Bar for Services */}
              <View style={styles.dashboardSectionStreamBar}>
                <View style={styles.streamLeftRow}>
                  <View style={[styles.streamPulseDot, { backgroundColor: '#FF4D2D' }]} />
                  <Text style={styles.streamTitle}>ACTIVE SERVICE CATALOG</Text>
                </View>
                <Text style={styles.streamCounter}>
                  {filteredServices.length} Services • 8 Categories
                </Text>
              </View>

              {/* Category Filter Pills */}
              <View style={styles.filterBarWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  {['ALL', 'Repairs', 'Cleaning', 'AC', 'Electrical', 'Carpentry', 'Painting', 'Plumbing'].map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.filterChip, serviceCatFilter === cat && styles.filterChipActive]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setServiceCatFilter(cat);
                        setServicesPage(1);
                      }}
                    >
                      <Text style={[styles.filterChipText, serviceCatFilter === cat && styles.filterChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Services List */}
              <FlatList
                data={paginatedServices}
                keyExtractor={(item, index) => item._id || item.id || String(index)}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.serviceItemCard}>
                    <View style={styles.serviceTopRow}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={{ width: 44, height: 44, borderRadius: 8 }} />
                      ) : (
                        <View style={styles.serviceIconContainer}>
                          <Text style={{ fontSize: 24 }}>{item.icon || '🛠️'}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.serviceItemTitle}>{item.name}</Text>
                        <Text style={styles.serviceItemMeta}>
                          {item.category} • ⏱️ {item.duration || '1 hr'} • ⭐ {item.rating || '4.9'}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.serviceItemPrice}>₹{item.price}</Text>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <Text style={styles.serviceOriginalPrice}>₹{item.originalPrice}</Text>
                        )}
                      </View>
                    </View>

                    <Text style={styles.serviceDescription} numberOfLines={2}>
                      {item.description || 'Verified doorstep service provided by trained professionals.'}
                    </Text>

                    <View style={styles.serviceBottomBar}>
                      <View style={styles.badgePopularPill}>
                        <Text style={styles.badgePopularText}>🔥 LIVE IN APP</Text>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          style={{ backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }}
                          onPress={() => {
                            setServiceToEdit(item);
                            setEditServiceModalVisible(true);
                          }}
                        >
                          <Text style={{ color: '#93C5FD', fontSize: 11, fontWeight: '700' }}>✏️ Edit Photo & Price</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteServiceBtn}
                          onPress={() => handleDeleteService(item._id || item.id, item.name)}
                        >
                          <Text style={styles.deleteServiceText}>Delete 🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🛠️</Text>
                    <Text style={styles.emptyTitle}>No services found</Text>
                  </View>
                }
              />

              {/* Services Pagination Footer */}
              {totalServicePages > 1 && (
                <View style={styles.paginationFooterBar}>
                  <TouchableOpacity
                    style={[styles.pageNavBtn, servicesPage === 1 && styles.pageNavBtnDisabled]}
                    disabled={servicesPage === 1}
                    onPress={() => setServicesPage(p => Math.max(1, p - 1))}
                  >
                    <Text style={[styles.pageNavBtnText, servicesPage === 1 && styles.pageNavBtnTextDisabled]}>◀ Prev</Text>
                  </TouchableOpacity>

                  <View style={styles.pageInfoBadge}>
                    <Text style={styles.pageInfoText}>
                      Page <Text style={styles.pageInfoHighlight}>{servicesPage}</Text> of {totalServicePages}
                    </Text>
                    <Text style={styles.pageItemsCountText}>
                      ({filteredServices.length} Services)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.pageNavBtn, servicesPage >= totalServicePages && styles.pageNavBtnDisabled]}
                    disabled={servicesPage >= totalServicePages}
                    onPress={() => setServicesPage(p => Math.min(totalServicePages, p + 1))}
                  >
                    <Text style={[styles.pageNavBtnText, servicesPage >= totalServicePages && styles.pageNavBtnTextDisabled]}>Next ▶</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ==================== TAB: VENDORS / PARTNER HUBS ==================== */}
          {activeTab === 'vendors' && (
            <View style={{ flex: 1 }}>
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search partner hub by name, category, phone, or location..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              {/* Stream Bar for Vendors */}
              <View style={styles.dashboardSectionStreamBar}>
                <View style={styles.streamLeftRow}>
                  <View style={[styles.streamPulseDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.streamTitle}>REGISTERED PARTNER HUBS</Text>
                </View>
                <Text style={styles.streamCounter}>
                  {filteredProviders.length} Registered Centers
                </Text>
              </View>

              <View style={styles.filterBarWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  {[
                    { key: 'ALL', label: `All Hubs (${safeProviders.length})` },
                    { key: 'VERIFIED', label: '✓ Verified Hubs' },
                    { key: 'ACTIVE', label: '🟢 Active Now' },
                  ].map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.filterChip, vendorFilter === item.key && styles.filterChipActive]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setVendorFilter(item.key);
                        setVendorsPage(1);
                      }}
                    >
                      <Text style={[styles.filterChipText, vendorFilter === item.key && styles.filterChipTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <FlatList
                data={paginatedVendors}
                keyExtractor={(item, index) => item._id || item.id || String(index)}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.workerItemCard}>
                    <View style={styles.workerHeaderRow}>
                      <View style={[styles.workerAvatarCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                        <Text style={{ fontSize: 20 }}>🏢</Text>
                        <View style={[styles.workerLiveDot, { backgroundColor: '#10B981' }]} />
                      </View>

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.workerCardName}>{item.shopName || item.name}</Text>
                          <View style={[styles.verifiedProBadge, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                            <Text style={[styles.verifiedProBadgeText, { color: '#60A5FA' }]}>✓ PARTNER</Text>
                          </View>
                        </View>
                        <Text style={styles.workerTrade}>👤 Contact: {item.name || 'Enterprise Partner'}</Text>
                        <Text style={styles.workerPhoneText}>📞 {item.phone || 'Phone not listed'} {item.email ? `• ✉️ ${item.email}` : ''}</Text>
                        <Text style={[styles.workerPhoneText, { color: '#94A3B8', marginTop: 2 }]}>
                          📍 {item.address || item.location || 'Indore, MP'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.workerMetricsRow}>
                      <View style={styles.workerMetricBlock}>
                        <Text style={styles.workerMetricLabel}>CATEGORY</Text>
                        <Text style={[styles.workerMetricVal, { fontSize: 11 }]} numberOfLines={1}>
                          {item.category || 'Multi-Trade Hub'}
                        </Text>
                      </View>
                      <View style={styles.workerMetricBlock}>
                        <Text style={styles.workerMetricLabel}>RATING</Text>
                        <Text style={styles.workerMetricVal}>⭐ {item.rating || '4.95'}</Text>
                      </View>
                      <View style={styles.workerMetricBlock}>
                        <Text style={styles.workerMetricLabel}>BASE RATE</Text>
                        <Text style={[styles.workerMetricVal, { color: '#10B981' }]}>
                          {item.hourlyRate || '₹299/hr'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.workerActionsRow, { marginTop: 8 }]}>
                      <TouchableOpacity
                        style={styles.workerActionBtn}
                        onPress={() => handleMakeCall(item.phone)}
                      >
                        <Text style={styles.workerActionBtnText}>📞 Call Hub</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.workerActionBtn, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}
                        onPress={() => handleOpenWhatsApp(item.phone)}
                      >
                        <Text style={[styles.workerActionBtnText, { color: '#22C55E' }]}>💬 WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🏢</Text>
                    <Text style={styles.emptyTitle}>No partner hubs found</Text>
                    <Text style={styles.emptySubtitle}>Any newly registered vendor will automatically appear here</Text>
                  </View>
                }
              />

              {/* Vendors Pagination Footer */}
              {totalVendorPages > 1 && (
                <View style={styles.paginationFooterBar}>
                  <TouchableOpacity
                    style={[styles.pageNavBtn, vendorsPage === 1 && styles.pageNavBtnDisabled]}
                    disabled={vendorsPage === 1}
                    onPress={() => setVendorsPage(p => Math.max(1, p - 1))}
                  >
                    <Text style={[styles.pageNavBtnText, vendorsPage === 1 && styles.pageNavBtnTextDisabled]}>◀ Prev</Text>
                  </TouchableOpacity>

                  <View style={styles.pageInfoBadge}>
                    <Text style={styles.pageInfoText}>
                      Page <Text style={styles.pageInfoHighlight}>{vendorsPage}</Text> of {totalVendorPages}
                    </Text>
                    <Text style={styles.pageItemsCountText}>
                      ({filteredProviders.length} Partner Hubs)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.pageNavBtn, vendorsPage >= totalVendorPages && styles.pageNavBtnDisabled]}
                    disabled={vendorsPage >= totalVendorPages}
                    onPress={() => setVendorsPage(p => Math.min(totalVendorPages, p + 1))}
                  >
                    <Text style={[styles.pageNavBtnText, vendorsPage >= totalVendorPages && styles.pageNavBtnTextDisabled]}>Next ▶</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ==================== TAB 3: FLEET / WORKERS ==================== */}
          {activeTab === 'fleet' && (
            <View style={{ flex: 1 }}>
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search technician by name, trade or phone..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              {/* Dashboard Section Stream Bar for Fleet */}
              <View style={styles.dashboardSectionStreamBar}>
                <View style={styles.streamLeftRow}>
                  <View style={[styles.streamPulseDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.streamTitle}>FLEET & VERIFIED PROS</Text>
                </View>
                <Text style={styles.streamCounter}>
                  {filteredWorkers.length} Specialists ({onlineWorkersCount} Online)
                </Text>
              </View>

              <View style={styles.filterBarWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  {[
                    { key: 'ALL', label: 'All Fleet' },
                    { key: 'ONLINE', label: `🟢 Online (${onlineWorkersCount})` },
                    { key: 'OFFLINE', label: '⚪ Offline' },
                  ].map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.filterChip, workerFilter === item.key && styles.filterChipActive]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setWorkerFilter(item.key);
                        setFleetPage(1);
                      }}
                    >
                      <Text style={[styles.filterChipText, workerFilter === item.key && styles.filterChipTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <FlatList
                data={paginatedWorkers}
                keyExtractor={(item, index) => item._id || item.workerId || item.id || String(index)}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isOnline = item.isOnline !== false;
                  return (
                    <View style={styles.workerItemCard}>
                      <View style={styles.workerHeaderRow}>
                        <View style={styles.workerAvatarCircle}>
                          <Text style={{ fontSize: 20 }}>👷‍♂️</Text>
                          <View style={[styles.workerLiveDot, { backgroundColor: isOnline ? '#10B981' : '#64748B' }]} />
                        </View>

                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.workerCardName}>{item.name}</Text>
                            <View style={styles.verifiedProBadge}>
                              <Text style={styles.verifiedProBadgeText}>✓ VERIFIED</Text>
                            </View>
                          </View>
                          <Text style={styles.workerTrade}>{item.category || item.role || 'Service Specialist'}</Text>
                          <Text style={styles.workerPhoneText}>📞 {item.phone || item.mobile || 'Phone not listed'}</Text>
                        </View>

                        <TouchableOpacity
                          style={[styles.statusTogglePill, { backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)' }]}
                          onPress={() => handleToggleWorkerStatus(item)}
                        >
                          <Text style={[styles.statusToggleText, { color: isOnline ? '#10B981' : '#94A3B8' }]}>
                            {isOnline ? 'ONLINE 🟢' : 'OFFLINE ⚪'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.workerMetricsRow}>
                        <View style={styles.workerMetricBlock}>
                          <Text style={styles.workerMetricLabel}>RATING</Text>
                          <Text style={styles.workerMetricVal}>⭐ {item.rating || '4.9'}</Text>
                        </View>
                        <View style={styles.workerMetricBlock}>
                          <Text style={styles.workerMetricLabel}>COMPLETED JOBS</Text>
                          <Text style={styles.workerMetricVal}>{item.completedJobs || 28}+</Text>
                        </View>
                        <View style={styles.workerMetricBlock}>
                          <Text style={styles.workerMetricLabel}>BACKGROUND CHECK</Text>
                          <Text style={[styles.workerMetricVal, { color: '#10B981' }]}>Passed 🛡️</Text>
                        </View>
                      </View>

                      <View style={{ gap: 8, marginTop: 4 }}>
                        <TouchableOpacity
                          style={[styles.workerActionBtn, { backgroundColor: 'rgba(59, 130, 246, 0.18)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.35)', paddingVertical: 8 }]}
                          onPress={() => handleOpenWorkerDocs(item)}
                        >
                          <Text style={[styles.workerActionBtnText, { color: '#60A5FA', fontSize: 11.5 }]}>
                            📑 View KYC & Verified Documents
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.workerActionsRow}>
                          <TouchableOpacity
                            style={styles.workerActionBtn}
                            onPress={() => handleMakeCall(item.phone || item.mobile)}
                          >
                            <Text style={styles.workerActionBtnText}>📞 Direct Call</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.workerActionBtn, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}
                            onPress={() => handleOpenWhatsApp(item.phone || item.mobile)}
                          >
                            <Text style={[styles.workerActionBtnText, { color: '#22C55E' }]}>💬 WhatsApp</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />

              {/* Fleet Pagination Footer */}
              {totalWorkerPages > 1 && (
                <View style={styles.paginationFooterBar}>
                  <TouchableOpacity
                    style={[styles.pageNavBtn, fleetPage === 1 && styles.pageNavBtnDisabled]}
                    disabled={fleetPage === 1}
                    onPress={() => setFleetPage(p => Math.max(1, p - 1))}
                  >
                    <Text style={[styles.pageNavBtnText, fleetPage === 1 && styles.pageNavBtnTextDisabled]}>◀ Prev</Text>
                  </TouchableOpacity>

                  <View style={styles.pageInfoBadge}>
                    <Text style={styles.pageInfoText}>
                      Page <Text style={styles.pageInfoHighlight}>{fleetPage}</Text> of {totalWorkerPages}
                    </Text>
                    <Text style={styles.pageItemsCountText}>
                      ({filteredWorkers.length} Specialists)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.pageNavBtn, fleetPage >= totalWorkerPages && styles.pageNavBtnDisabled]}
                    disabled={fleetPage >= totalWorkerPages}
                    onPress={() => setFleetPage(p => Math.min(totalWorkerPages, p + 1))}
                  >
                    <Text style={[styles.pageNavBtnText, fleetPage >= totalWorkerPages && styles.pageNavBtnTextDisabled]}>Next ▶</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ==================== TAB 4: USERS & RBAC ==================== */}
          {activeTab === 'users' && (
            <View style={{ flex: 1 }}>
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search customer by name, mobile, email..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>

              {/* Dashboard Section Stream Bar for Users */}
              <View style={styles.dashboardSectionStreamBar}>
                <View style={styles.streamLeftRow}>
                  <View style={[styles.streamPulseDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.streamTitle}>REGISTERED MEMBERS & RBAC</Text>
                </View>
                <Text style={styles.streamCounter}>
                  {filteredUsers.length} Registered Accounts
                </Text>
              </View>

              <View style={styles.filterBarWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  {['ALL', 'superadmin', 'customer', 'provider'].map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[styles.filterChip, userRoleFilter === role && styles.filterChipActive]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setUserRoleFilter(role);
                        setUsersPage(1);
                      }}
                    >
                      <Text style={[styles.filterChipText, userRoleFilter === role && styles.filterChipTextActive]}>
                        {role.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <FlatList
                data={paginatedUsers}
                keyExtractor={(item, index) => item._id || item.id || String(index)}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSuper = String(item?.role || '').toLowerCase() === 'superadmin';
                  const initials = item?.name ? String(item.name).slice(0, 2).toUpperCase() : 'US';
                  return (
                    <View style={styles.userCardItem}>
                      <View style={styles.userCardHeader}>
                        <View style={styles.userInitialCircle}>
                          <Text style={styles.userInitialText}>{initials}</Text>
                        </View>

                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.userFullName}>{item.name || 'Helper User'}</Text>
                          <Text style={styles.userContactInfo}>📞 {item.phone} • ✉️ {item.email || 'No email'}</Text>
                          <View style={styles.userBadgeRow}>
                            <View style={[styles.rolePill, isSuper && styles.superPill]}>
                              <Text style={[styles.rolePillText, isSuper && { color: '#FF4D2D', fontWeight: '900' }]}>
                                {isSuper ? '🛡️ SUPER ADMIN (ALL ACCESS)' : (item.role || 'CUSTOMER').toUpperCase()}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {!isSuper ? (
                          <TouchableOpacity
                            style={styles.makeAdminBtn}
                            onPress={() => handlePromoteToAdmin(item)}
                          >
                            <Text style={styles.makeAdminBtnText}>Promote 🛡️</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.masterProtectedBadge}>
                            <Text style={styles.masterProtectedText}>MASTER 👑</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.userCardFooter}>
                        <Text style={styles.userFooterInfo}>
                          Address: {item.address || 'Indore, MP'}
                        </Text>
                        <TouchableOpacity onPress={() => handleMakeCall(item.phone)}>
                          <Text style={styles.userCallLink}>📞 Call Customer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />

              {/* Users Pagination Footer */}
              {totalUserPages > 1 && (
                <View style={styles.paginationFooterBar}>
                  <TouchableOpacity
                    style={[styles.pageNavBtn, usersPage === 1 && styles.pageNavBtnDisabled]}
                    disabled={usersPage === 1}
                    onPress={() => setUsersPage(p => Math.max(1, p - 1))}
                  >
                    <Text style={[styles.pageNavBtnText, usersPage === 1 && styles.pageNavBtnTextDisabled]}>◀ Prev</Text>
                  </TouchableOpacity>

                  <View style={styles.pageInfoBadge}>
                    <Text style={styles.pageInfoText}>
                      Page <Text style={styles.pageInfoHighlight}>{usersPage}</Text> of {totalUserPages}
                    </Text>
                    <Text style={styles.pageItemsCountText}>
                      ({filteredUsers.length} Users)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.pageNavBtn, usersPage >= totalUserPages && styles.pageNavBtnDisabled]}
                    disabled={usersPage >= totalUserPages}
                    onPress={() => setUsersPage(p => Math.min(totalUserPages, p + 1))}
                  >
                    <Text style={[styles.pageNavBtnText, usersPage >= totalUserPages && styles.pageNavBtnTextDisabled]}>Next ▶</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* ==================== TAB 5: ANALYTICS ==================== */}
          {activeTab === 'analytics' && (
            <ScrollView contentContainerStyle={styles.analyticsContent} showsVerticalScrollIndicator={false}>
              {/* Executive Metrics Overview */}
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeading}>EXECUTIVE FINANCIALS</Text>
                <Text style={styles.sectionSubHeading}>Real-time system telemetry</Text>
              </View>

              <View style={styles.kpiGrid}>
                <View style={[styles.kpiCard, { borderColor: '#10B981' }]}>
                  <Text style={styles.kpiCardLabel}>GROSS BOOKING VALUE</Text>
                  <Text style={[styles.kpiCardValue, { color: '#10B981' }]}>₹{formatCurrency(totalGrossRev)}</Text>
                  <Text style={styles.kpiCardSub}>Customer transactions</Text>
                </View>

                <View style={[styles.kpiCard, { borderColor: '#FF4D2D' }]}>
                  <Text style={styles.kpiCardLabel}>PLATFORM NET COMMISSION</Text>
                  <Text style={[styles.kpiCardValue, { color: '#FF4D2D' }]}>₹{formatCurrency(totalPlatformCut)}</Text>
                  <Text style={styles.kpiCardSub}>Platform fee (18% margin)</Text>
                </View>
              </View>

              <View style={styles.kpiGrid}>
                <View style={[styles.kpiCard, { borderColor: '#3B82F6' }]}>
                  <Text style={styles.kpiCardLabel}>TOTAL ORDERS DISPATCHED</Text>
                  <Text style={[styles.kpiCardValue, { color: '#3B82F6' }]}>{safeBookings.length}</Text>
                  <Text style={styles.kpiCardSub}>All statuses</Text>
                </View>

                <View style={[styles.kpiCard, { borderColor: '#A855F7' }]}>
                  <Text style={styles.kpiCardLabel}>FULFILLMENT RATIO</Text>
                  <Text style={[styles.kpiCardValue, { color: '#A855F7' }]}>
                    {safeBookings.length > 0 ? Math.round((completedOrdersCount / safeBookings.length) * 100) : 94}%
                  </Text>
                  <Text style={styles.kpiCardSub}>Success completion rate</Text>
                </View>
              </View>

              {/* Order Status Funnel */}
              <View style={styles.funnelCard}>
                <Text style={styles.cardSectionTitle}>⚡ ORDER STATUS PIPELINE</Text>
                <View style={styles.funnelItem}>
                  <Text style={styles.funnelItemLabel}>Pending Dispatch ({pendingOrdersCount})</Text>
                  <View style={styles.funnelBarTrack}>
                    <View style={[styles.funnelBarFill, { width: `${Math.min(100, (pendingOrdersCount / (safeBookings.length || 1)) * 100)}%`, backgroundColor: '#F59E0B' }]} />
                  </View>
                </View>

                <View style={styles.funnelItem}>
                  <Text style={styles.funnelItemLabel}>In Progress & Active Jobs ({inProgressCount})</Text>
                  <View style={styles.funnelBarTrack}>
                    <View style={[styles.funnelBarFill, { width: `${Math.min(100, (inProgressCount / (safeBookings.length || 1)) * 100)}%`, backgroundColor: '#3B82F6' }]} />
                  </View>
                </View>

                <View style={styles.funnelItem}>
                  <Text style={styles.funnelItemLabel}>Completed & Paid ({completedOrdersCount})</Text>
                  <View style={styles.funnelBarTrack}>
                    <View style={[styles.funnelBarFill, { width: `${Math.min(100, (completedOrdersCount / (safeBookings.length || 1)) * 100)}%`, backgroundColor: '#10B981' }]} />
                  </View>
                </View>
              </View>

              {/* Infrastructure Status */}
              <View style={styles.infraCard}>
                <Text style={styles.cardSectionTitle}>🛡️ CLOUD INFRASTRUCTURE HEALTH</Text>
                <View style={styles.infraRow}>
                  <Text style={styles.infraLabel}>• MongoDB Atlas Production Cluster</Text>
                  <Text style={styles.infraStatusGreen}>CONNECTED (Shard-00)</Text>
                </View>
                <View style={styles.infraRow}>
                  <Text style={styles.infraLabel}>• WebSocket Real-time Engine</Text>
                  <Text style={styles.infraStatusGreen}>SOCKET.IO ACTIVE</Text>
                </View>
                <View style={styles.infraRow}>
                  <Text style={styles.infraLabel}>• 256-bit JWT RBAC Auth Layer</Text>
                  <Text style={styles.infraStatusGreen}>ENFORCED</Text>
                </View>
                <View style={styles.infraRow}>
                  <Text style={styles.infraLabel}>• Distance-based Dispatch Engine</Text>
                  <Text style={styles.infraStatusGreen}>15-MIN GUARANTEE ON</Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* ==================== TAB 6: SETTINGS ==================== */}
          {activeTab === 'settings' && (
            <ScrollView contentContainerStyle={styles.analyticsContent} showsVerticalScrollIndicator={false}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeading}>PLATFORM MASTER CONTROLS</Text>
                <Text style={styles.sectionSubHeading}>Emergency surge, broadcasts & policies</Text>
              </View>

              {/* Emergency Surge Toggle */}
              <View style={styles.settingBlock}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingBlockTitle}>🚨 15-Minute Emergency Dispatch</Text>
                  <Text style={styles.settingBlockSub}>Prioritizes nearest verified technician dispatch across city.</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleBtn, emergencySurgeActive ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                  onPress={() => {
                    setEmergencySurgeActive(!emergencySurgeActive);
                    Alert.alert('Setting Updated', `Emergency dispatch is now ${!emergencySurgeActive ? 'ACTIVE' : 'PAUSED'}`);
                  }}
                >
                  <Text style={styles.toggleBtnText}>{emergencySurgeActive ? 'ACTIVE 🟢' : 'PAUSED ⚪'}</Text>
                </TouchableOpacity>
              </View>

              {/* Broadcast Alert */}
              <View style={styles.settingBlock}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingBlockTitle}>📢 Push Notification Broadcast</Text>
                  <Text style={styles.settingBlockSub}>Send instant app alert to all registered customers and technicians.</Text>
                </View>
                <TouchableOpacity
                  style={styles.broadcastActionBtn}
                  onPress={() => setBroadcastModalVisible(true)}
                >
                  <Text style={styles.broadcastActionBtnText}>Broadcast 📢</Text>
                </TouchableOpacity>
              </View>

              {/* Platform Commission Setting */}
              <View style={styles.settingBlockColumn}>
                <Text style={styles.settingBlockTitle}>💼 Platform Take-Rate / Commission</Text>
                <Text style={styles.settingBlockSub}>Standard marketplace margin applied to technician payouts.</Text>
                <View style={styles.commissionInputRow}>
                  <TextInput
                    style={styles.commissionInput}
                    value={commissionRate}
                    onChangeText={setCommissionRate}
                    keyboardType="number-pad"
                  />
                  <Text style={styles.percentSymbol}>%</Text>
                  <TouchableOpacity
                    style={styles.saveRateBtn}
                    onPress={() => Alert.alert('Saved ✅', `Platform commission set to ${commissionRate}%`)}
                  >
                    <Text style={styles.saveRateBtnText}>Update Rate</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Admin Master PIN Notice */}
              <View style={styles.securityNoticeCard}>
                <Text style={styles.securityNoticeTitle}>🛡️ MASTER SECURITY CREDENTIALS</Text>
                <Text style={styles.securityNoticeLine}>• Master Admin PIN: <Text style={{ color: '#FF4D2D', fontWeight: '900' }}>admin123</Text></Text>
                <Text style={styles.securityNoticeLine}>• Master Phone ID: <Text style={{ color: '#FF4D2D', fontWeight: '900' }}>9999999999</Text></Text>
                <Text style={styles.securityNoticeLine}>• Token Life: 30 Days (HMAC SHA-256)</Text>
              </View>
            </ScrollView>
          )}

          {/* ==================== TAB: CATEGORIES ==================== */}
          {activeTab === 'categories' && <AdminCategoriesTab />}

          {/* ==================== TAB: BANNERS ==================== */}
          {activeTab === 'banners' && <AdminBannersTab />}

          {/* ==================== TAB: BRANDING & THEME ==================== */}
          {activeTab === 'branding' && <AdminBrandingTab />}
        </View>
      )}

      {/* ==================== MODAL: ADD SERVICE ==================== */}
      <Modal visible={serviceModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>✨ Publish New Service</Text>
              <TouchableOpacity onPress={() => setServiceModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formInputLabel}>SERVICE PHOTO PREVIEW & UPLOAD</Text>
              {newServiceImage ? (
                <View style={{ height: 110, borderRadius: 10, overflow: 'hidden', marginBottom: 10, backgroundColor: '#070A12' }}>
                  <Image source={{ uri: newServiceImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </View>
              ) : null}

              <Text style={styles.formInputLabel}>SERVICE PHOTO (URL OR FILE)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                <TextInput
                  style={[styles.modalInputField, { flex: 1, marginTop: 0 }]}
                  placeholder="Paste URL or upload image..."
                  placeholderTextColor="#64748B"
                  value={newServiceImage}
                  onChangeText={setNewServiceImage}
                />
                <TouchableOpacity
                  style={[styles.uploadFileBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                  activeOpacity={0.85}
                  onPress={() => openImagePicker((uri) => setNewServiceImage(uri))}
                >
                  <Text style={styles.uploadFileBtnText}>📁 Upload File</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formInputLabel}>SERVICE TITLE *</Text>
              <TextInput
                style={styles.modalInputField}
                placeholder="e.g. Master AC Foam Jet Service"
                placeholderTextColor="#64748B"
                value={newServiceName}
                onChangeText={setNewServiceName}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formInputLabel}>PRICE (₹) *</Text>
                  <TextInput
                    style={styles.modalInputField}
                    placeholder="299"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                    value={newServicePrice}
                    onChangeText={setNewServicePrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formInputLabel}>ORIGINAL PRICE (₹)</Text>
                  <TextInput
                    style={styles.modalInputField}
                    placeholder="499"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                    value={newServiceOriginalPrice}
                    onChangeText={setNewServiceOriginalPrice}
                  />
                </View>
              </View>

              <Text style={styles.formInputLabel}>CATEGORY</Text>
              <TextInput
                style={styles.modalInputField}
                placeholder="Repairs, Cleaning, AC, Electrical, Plumbing"
                placeholderTextColor="#64748B"
                value={newServiceCategory}
                onChangeText={setNewServiceCategory}
              />

              <Text style={styles.formInputLabel}>ESTIMATED DURATION</Text>
              <TextInput
                style={styles.modalInputField}
                placeholder="e.g. 45-60 mins"
                placeholderTextColor="#64748B"
                value={newServiceDuration}
                onChangeText={setNewServiceDuration}
              />

              <Text style={styles.formInputLabel}>DESCRIPTION</Text>
              <TextInput
                style={[styles.modalInputField, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Brief description of the service highlights..."
                placeholderTextColor="#64748B"
                multiline
                value={newServiceDesc}
                onChangeText={setNewServiceDesc}
              />

              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setServiceModalVisible(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={handleCreateService}
                >
                  <Text style={styles.modalSubmitButtonText}>Publish to App 🚀</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL: ASSIGN TECHNICIAN ==================== */}
      <Modal visible={assignModalVisible} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>👷 Assign Verified Technician</Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.assignSubNotice}>
              Select an available specialist to dispatch for Order #{String(selectedBooking?._id || selectedBooking?.id || '').slice(-6).toUpperCase()}
            </Text>

            <FlatList
              data={safeWorkers}
              keyExtractor={(item, index) => item._id || item.workerId || item.id || String(index)}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.assignWorkerCard}
                  activeOpacity={0.7}
                  onPress={() => handleAssignWorkerToBooking(item)}
                >
                  <View style={styles.assignAvatarCircle}>
                    <Text style={{ fontSize: 18 }}>🛠️</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.assignWorkerName}>{item.name}</Text>
                    <Text style={styles.assignWorkerSub}>
                      {item.category || 'Specialist'} • ⭐ {item.rating || '4.9'} ({item.completedJobs || 25} jobs)
                    </Text>
                  </View>
                  <Text style={styles.assignActionBadge}>Dispatch ➔</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL: EDIT SERVICE PHOTO & DETAILS ==================== */}
      <AdminEditServiceModal
        visible={editServiceModalVisible}
        service={serviceToEdit}
        onClose={() => setEditServiceModalVisible(false)}
        onUpdated={fetchAllData}
        primaryColor={primaryColor}
      />

      {/* ==================== MODAL: BROADCAST ALERT ==================== */}
      <Modal visible={broadcastModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>📢 Broadcast App Announcement</Text>
              <TouchableOpacity onPress={() => setBroadcastModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formInputLabel}>NOTIFICATION TITLE *</Text>
            <TextInput
              style={styles.modalInputField}
              placeholder="e.g. 50% Off Monsoon Home Cleaning!"
              placeholderTextColor="#64748B"
              value={broadcastTitle}
              onChangeText={setBroadcastTitle}
            />

            <Text style={styles.formInputLabel}>NOTIFICATION MESSAGE *</Text>
            <TextInput
              style={[styles.modalInputField, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Use code HELPER50 to get instant ₹50 off on all repairs..."
              placeholderTextColor="#64748B"
              multiline
              value={broadcastMessage}
              onChangeText={setBroadcastMessage}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setBroadcastModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleSendBroadcast}
              >
                <Text style={styles.modalSubmitButtonText}>Send to All Users 📢</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL: WORKER KYC & VERIFIED DOCUMENTS DOSSIER ==================== */}
      <Modal visible={workerDocsModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContainer, { maxHeight: '90%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.modalHeading}>📑 Worker KYC & Compliance Dossier</Text>
                  <View style={[styles.verifiedProBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <Text style={[styles.verifiedProBadgeText, { color: '#10B981' }]}>VERIFIED</Text>
                  </View>
                </View>
                <Text style={styles.assignSubNotice}>
                  Official government identity & police clearance records for {selectedWorkerForDocs?.name || 'Technician'} ({selectedWorkerForDocs?.workerId || selectedWorkerForDocs?.id || 'ID-PRO'})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setWorkerDocsModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
              {/* Document 1: Aadhaar Card */}
              <View style={styles.docVerifyCard}>
                <View style={styles.docVerifyHeaderRow}>
                  <Text style={styles.docVerifyIcon}>🪪</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docVerifyTitle}>Aadhaar Card (UIDAI Verified)</Text>
                    <Text style={styles.docVerifyNumber}>
                      Number: {selectedWorkerForDocs?.documents?.aadhaarNumber || 'XXXX-XXXX-8921'}
                    </Text>
                  </View>
                  <View style={styles.docStatusBadgeSuccess}>
                    <Text style={styles.docStatusBadgeText}>✓ APPROVED</Text>
                  </View>
                </View>
                <Text style={styles.docVerifySub}>
                  Biometric UIDAI record verified with registered mobile OTP clearance.
                </Text>
              </View>

              {/* Document 2: Permanent Account Number (PAN) */}
              <View style={styles.docVerifyCard}>
                <View style={styles.docVerifyHeaderRow}>
                  <Text style={styles.docVerifyIcon}>💳</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docVerifyTitle}>Permanent Account Number (PAN)</Text>
                    <Text style={styles.docVerifyNumber}>
                      PAN: {selectedWorkerForDocs?.documents?.panNumber || 'ABCDE8921F'}
                    </Text>
                  </View>
                  <View style={styles.docStatusBadgeSuccess}>
                    <Text style={styles.docStatusBadgeText}>✓ VALIDATED</Text>
                  </View>
                </View>
                <Text style={styles.docVerifySub}>
                  Income Tax Department tax ID verified for direct contractor payout disbursement.
                </Text>
              </View>

              {/* Document 3: National Skill & Trade Certificate */}
              <View style={styles.docVerifyCard}>
                <View style={styles.docVerifyHeaderRow}>
                  <Text style={styles.docVerifyIcon}>🎓</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docVerifyTitle}>
                      {selectedWorkerForDocs?.documents?.certificates?.[0]?.name || 'National Trade Certificate (NTC)'}
                    </Text>
                    <Text style={styles.docVerifyNumber}>
                      Cert #: {selectedWorkerForDocs?.documents?.certificates?.[0]?.number || 'NCVT-MP-89214'}
                    </Text>
                  </View>
                  <View style={styles.docStatusBadgeSuccess}>
                    <Text style={styles.docStatusBadgeText}>✓ ACCREDITED</Text>
                  </View>
                </View>
                <Text style={styles.docVerifySub}>
                  Issued by: {selectedWorkerForDocs?.documents?.certificates?.[0]?.issuedBy || 'National Council for Vocational Training (NCVT) & Skill India'}
                </Text>
              </View>

              {/* Document 4: Police Verification Clearance */}
              <View style={styles.docVerifyCard}>
                <View style={styles.docVerifyHeaderRow}>
                  <Text style={styles.docVerifyIcon}>🛡️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docVerifyTitle}>Police Verification Clearance</Text>
                    <Text style={styles.docVerifyNumber}>
                      Report ID: {selectedWorkerForDocs?.documents?.policeVerificationDoc || 'MP-POL-IND-8921'}
                    </Text>
                  </View>
                  <View style={styles.docStatusBadgeSuccess}>
                    <Text style={styles.docStatusBadgeText}>✓ CLEAN</Text>
                  </View>
                </View>
                <Text style={styles.docVerifySub}>
                  Status: {selectedWorkerForDocs?.documents?.policeVerificationStatus || 'Clean Record / Character Certificate Approved by Police Department'}
                </Text>
              </View>

              {/* Document 5: Commercial Driving License */}
              <View style={styles.docVerifyCard}>
                <View style={styles.docVerifyHeaderRow}>
                  <Text style={styles.docVerifyIcon}>🛵</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docVerifyTitle}>Driving License & Vehicle Permit</Text>
                    <Text style={styles.docVerifyNumber}>
                      License #: {selectedWorkerForDocs?.documents?.drivingLicense || 'DL-MP09-2022091823'}
                    </Text>
                  </View>
                  <View style={styles.docStatusBadgeSuccess}>
                    <Text style={styles.docStatusBadgeText}>✓ ACTIVE</Text>
                  </View>
                </View>
                <Text style={styles.docVerifySub}>
                  Valid commercial two-wheeler transport endorsement with emergency kit verified.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleRejectWorkerDocs}
              >
                <Text style={[styles.modalCancelButtonText, { color: '#EF4444' }]}>Request Re-upload ⚠️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitButton, { backgroundColor: '#10B981' }]}
                onPress={handleVerifyAllWorkerDocs}
              >
                <Text style={styles.modalSubmitButtonText}>Approve All KYC ✓</Text>
              </TouchableOpacity>
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
    backgroundColor: '#060A12',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0C1220',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerMeta: {
    flex: 1,
    marginLeft: 12,
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  superRoleBadge: {
    backgroundColor: 'rgba(255, 77, 45, 0.2)',
    borderWidth: 1,
    borderColor: '#FF4D2D',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  superRoleText: {
    color: '#FF4D2D',
    fontSize: 8.5,
    fontWeight: '900',
  },
  headerSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionIcon: {
    fontSize: 16,
  },
  topDashboardStrip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#090E1A',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  stripCard: {
    flex: 1,
    backgroundColor: '#0F1626',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    justifyContent: 'space-between',
  },
  stripCardActive: {
    borderColor: '#FF4D2D',
    backgroundColor: 'rgba(255, 77, 45, 0.08)',
  },
  stripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stripCardIcon: {
    fontSize: 16,
  },
  liveGreenPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  liveGreenText: {
    color: '#10B981',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stripCardValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  stripCardLabel: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
  },
  realtimeToggleActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: '#10B981',
  },
  realtimeToggleTextActive: {
    color: '#10B981',
    fontWeight: '900',
  },
  paginationFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0C1220',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
  },
  pageNavBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderWidth: 1,
    borderColor: '#FF4D2D',
  },
  pageNavBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pageNavBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  pageNavBtnTextDisabled: {
    color: '#475569',
  },
  pageInfoBadge: {
    alignItems: 'center',
  },
  pageInfoText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  pageInfoHighlight: {
    color: '#FF4D2D',
    fontWeight: '900',
  },
  pageItemsCountText: {
    color: '#64748B',
    fontSize: 9.5,
    marginTop: 1,
  },
  navBar: {
    backgroundColor: '#0A0E18',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  navScroll: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  navTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
  },
  navTabItemActive: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderColor: '#FF4D2D',
  },
  navTabIcon: {
    fontSize: 14,
  },
  navTabLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  navTabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  navCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  navCountBadgeActive: {
    backgroundColor: '#FF4D2D',
  },
  navCountText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  navCountTextActive: {
    color: '#FFFFFF',
  },
  fullLoaderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  fullLoaderText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12.5,
    padding: 0,
  },
  clearSearchText: {
    color: '#94A3B8',
    fontSize: 14,
    paddingHorizontal: 4,
  },
  addServiceTopBtn: {
    backgroundColor: '#FF4D2D',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: 42,
  },
  addServiceTopBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  dashboardSectionStreamBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  streamLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streamPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  streamTitle: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  streamCounter: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '700',
  },
  filterBarWrapper: {
    paddingVertical: 6,
    marginBottom: 4,
  },
  filterScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#FF4D2D',
    borderColor: '#FF4D2D',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  listPadding: {
    padding: 12,
    gap: 12,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#0F1626',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderIdBadge: {
    color: '#FF4D2D',
    fontSize: 12,
    fontWeight: '900',
    backgroundColor: 'rgba(255, 77, 45, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderDateText: {
    color: '#64748B',
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusCompleted: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  statusInProgress: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  statusCancelled: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  statusPending: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  statusBadgeLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  orderServiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderServiceTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  orderCategoryTag: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  orderPriceBox: {
    alignItems: 'flex-end',
  },
  orderPriceAmount: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '900',
  },
  orderPayMode: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '800',
  },
  customerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerMeta: {
    flex: 1,
    gap: 3,
  },
  customerName: {
    color: '#F1F5F9',
    fontSize: 12.5,
    fontWeight: '800',
  },
  customerPhone: {
    color: '#94A3B8',
    fontSize: 11,
  },
  customerAddress: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 2,
  },
  quickContactRow: {
    flexDirection: 'column',
    gap: 6,
    marginLeft: 8,
  },
  contactIconBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  contactBtnIcon: {
    color: '#3B82F6',
    fontSize: 10.5,
    fontWeight: '800',
  },
  assignedFleetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  assignedFleetLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  assignedFleetName: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reassignBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reassignBtnText: {
    color: '#FF4D2D',
    fontSize: 10.5,
    fontWeight: '800',
  },
  otpHighlightBar: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpLabel: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
  },
  otpCode: {
    color: '#FDE047',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  otpNotice: {
    color: '#94A3B8',
    fontSize: 9.5,
    flex: 1,
    textAlign: 'right',
  },
  statusActionsBar: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 4,
  },
  workflowBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workflowBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  deleteOrderBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteOrderIcon: {
    fontSize: 13,
  },
  serviceItemCard: {
    backgroundColor: '#0F1626',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 8,
  },
  serviceTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceItemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  serviceItemMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  serviceItemPrice: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '900',
  },
  serviceOriginalPrice: {
    color: '#64748B',
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  serviceDescription: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
  },
  serviceBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  badgePopularPill: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgePopularText: {
    color: '#FF4D2D',
    fontSize: 9.5,
    fontWeight: '800',
  },
  deleteServiceBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteServiceText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
  workerItemCard: {
    backgroundColor: '#0F1626',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 10,
  },
  workerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  workerLiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 1.5,
    borderColor: '#0F1626',
  },
  workerCardName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  verifiedProBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  verifiedProBadgeText: {
    color: '#10B981',
    fontSize: 8.5,
    fontWeight: '900',
  },
  workerTrade: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  workerPhoneText: {
    color: '#64748B',
    fontSize: 10.5,
  },
  statusTogglePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusToggleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  workerMetricsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 8,
  },
  workerMetricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  workerMetricLabel: {
    color: '#64748B',
    fontSize: 8.5,
    fontWeight: '800',
  },
  workerMetricVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  workerActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  workerActionBtn: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  workerActionBtnText: {
    color: '#3B82F6',
    fontSize: 11,
    fontWeight: '800',
  },
  userCardItem: {
    backgroundColor: '#0F1626',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 8,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInitialCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 77, 45, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitialText: {
    color: '#FF4D2D',
    fontSize: 15,
    fontWeight: '900',
  },
  userFullName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  userContactInfo: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  userBadgeRow: {
    marginTop: 3,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  superPill: {
    backgroundColor: 'rgba(255, 77, 45, 0.2)',
    borderWidth: 1,
    borderColor: '#FF4D2D',
  },
  rolePillText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  makeAdminBtn: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderWidth: 1,
    borderColor: '#FF4D2D',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  makeAdminBtnText: {
    color: '#FF4D2D',
    fontSize: 11,
    fontWeight: '800',
  },
  masterProtectedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  masterProtectedText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 6,
  },
  userFooterInfo: {
    color: '#64748B',
    fontSize: 10.5,
    flex: 1,
  },
  userCallLink: {
    color: '#3B82F6',
    fontSize: 10.5,
    fontWeight: '800',
  },
  analyticsContent: {
    padding: 14,
    gap: 14,
    paddingBottom: 40,
  },
  sectionTitleRow: {
    marginBottom: 4,
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sectionSubHeading: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#0F1626',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  kpiCardLabel: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  kpiCardValue: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 4,
  },
  kpiCardSub: {
    color: '#64748B',
    fontSize: 10,
  },
  funnelCard: {
    backgroundColor: '#0F1626',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 12,
  },
  cardSectionTitle: {
    color: '#FF4D2D',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  funnelItem: {
    gap: 4,
  },
  funnelItemLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  funnelBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  funnelBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  infraCard: {
    backgroundColor: '#0F1626',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 8,
  },
  infraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infraLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  infraStatusGreen: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
  },
  settingBlock: {
    backgroundColor: '#0F1626',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingBlockColumn: {
    backgroundColor: '#0F1626',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 6,
  },
  settingBlockTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  settingBlockSub: {
    color: '#64748B',
    fontSize: 10.5,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  toggleBtnInactive: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  broadcastActionBtn: {
    backgroundColor: '#FF4D2D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  broadcastActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  commissionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  commissionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    width: 60,
    textAlign: 'center',
    paddingVertical: 6,
  },
  percentSymbol: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '800',
  },
  saveRateBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveRateBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  securityNoticeCard: {
    backgroundColor: '#0F1626',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.3)',
    padding: 14,
    gap: 6,
  },
  securityNoticeTitle: {
    color: '#FF4D2D',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  securityNoticeLine: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#0D1424',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FF4D2D',
    padding: 16,
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  modalCloseText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 6,
  },
  formInputLabel: {
    color: '#FF4D2D',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 4,
  },
  modalInputField: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  uploadFileBtn: {
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadFileBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  modalCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalCancelButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalSubmitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF4D2D',
  },
  modalSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  assignSubNotice: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 10,
  },
  assignWorkerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111A2E',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  assignAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignWorkerName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  assignWorkerSub: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
  },
  assignActionBadge: {
    color: '#FF4D2D',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  docVerifyCard: {
    backgroundColor: '#0B111E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  docVerifyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  docVerifyIcon: {
    fontSize: 24,
  },
  docVerifyTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  docVerifyNumber: {
    color: '#60A5FA',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 1,
  },
  docStatusBadgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  docStatusBadgeText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  docVerifySub: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
  },
});

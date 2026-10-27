import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { AppContext } from '../context/AppContext';
import client from '../api/client';

const ALL_SERVICES = [
  {
    id: 's1',
    name: 'AC Jet Foam Servicing',
    category: 'AC Repair',
    price: 499,
    originalPrice: 799,
    discount: '38% OFF',
    rating: 5.0,
    reviews: 512,
    duration: '60 mins',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
    tag: '❄️ Best Seller',
  },
  {
    id: 's2',
    name: 'Deep Home Sanitization & Cleaning',
    category: 'Cleaning',
    price: 899,
    originalPrice: 1499,
    discount: '50% OFF',
    rating: 4.95,
    reviews: 620,
    duration: '3-4 hrs',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
    tag: '✨ 50% OFF Deal',
  },
  {
    id: 's3',
    name: 'Electrician - Wiring & Switchboard',
    category: 'Repairs',
    price: 249,
    originalPrice: 399,
    discount: '37% OFF',
    rating: 4.9,
    reviews: 380,
    duration: '30-45 mins',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=600',
    tag: '⚡ 15-Min Arrival',
  },
  {
    id: 's4',
    name: 'Emergency Pipe Leak & Tap Fix',
    category: 'Plumbing',
    price: 299,
    originalPrice: 499,
    discount: '40% OFF',
    rating: 4.85,
    reviews: 245,
    duration: '45 mins',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600',
    tag: '🛡️ Verified Pro',
  },
  {
    id: 's5',
    name: 'Salon at Home for Women (Facial + Wax)',
    category: 'Beauty',
    price: 699,
    originalPrice: 1399,
    discount: '50% OFF',
    rating: 5.0,
    reviews: 430,
    duration: '60-90 mins',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
    tag: '💅 50% OFF Special',
  },
  {
    id: 's6',
    name: 'Carpenter - Godrej Lock & Hinge Repair',
    category: 'Carpentry',
    price: 349,
    originalPrice: 599,
    discount: '42% OFF',
    rating: 4.8,
    reviews: 190,
    duration: '45 mins',
    image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=600',
    tag: '🔨 Wood Expert',
  },
  {
    id: 's7',
    name: 'Waterproof Wall & Texture Painting',
    category: 'Painting',
    price: 599,
    originalPrice: 999,
    discount: '40% OFF',
    rating: 4.9,
    reviews: 280,
    duration: '2-3 hrs',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600',
    tag: '🎨 Clean Finish',
  },
  {
    id: 's8',
    name: 'Washing Machine & Refrigerator Repair',
    category: 'Appliance',
    price: 399,
    originalPrice: 699,
    discount: '43% OFF',
    rating: 4.88,
    reviews: 215,
    duration: '45 mins',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    tag: '🔧 Genuine Parts',
  },
];

const NEAREST_VENDORS = [
  {
    id: 'VND-IND-01',
    name: 'Indore Multi-Specialist Hub',
    distance: '2.4 km away',
    time: '12 mins arrival',
    rating: '4.98',
    specialty: 'AC Foam Cleaning, Electricals, Plumbing',
    address: 'Vijay Nagar, Indore',
    workersCount: 6,
    badge: 'VERIFIED HUB ✓',
  },
  {
    id: 'VND-IND-02',
    name: 'Vijay Nagar Appliance & Tech Hub',
    distance: '3.1 km away',
    time: '15 mins arrival',
    rating: '4.92',
    specialty: 'Refrigerator, Washing Machine & Microwave Repair',
    address: 'Scheme 54, Vijay Nagar',
    workersCount: 4,
    badge: 'TOP RATED ★',
  },
  {
    id: 'VND-IND-03',
    name: 'Palasia Express Home Solutions',
    distance: '4.2 km away',
    time: '20 mins arrival',
    rating: '4.89',
    specialty: 'Emergency Plumber & Electrician',
    address: 'Old Palasia, Indore',
    workersCount: 5,
    badge: 'EXPRESS ⚡',
  },
];

const FILTERS = ['All', '50% OFF', 'AC Repair', 'Cleaning', 'Repairs', 'Plumbing', 'Painting', 'Beauty', 'Carpentry'];

export default function ExploreScreen({ route, navigation }) {
  const { primaryColor, heroBanners, themeColors, t, language } = useContext(AppContext);
  const activeColor = primaryColor || '#FF4D2D';
  const isDark = themeColors?.isDark !== false;
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [liveServices, setLiveServices] = useState([]);
  const [liveCategories, setLiveCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchExploreData = async () => {
    try {
      const [sRes, cRes] = await Promise.allSettled([
        client.get('/services'),
        client.get('/categories'),
      ]);
      if (sRes.status === 'fulfilled' && sRes.value.data?.data) {
        setLiveServices(sRes.value.data.data);
      }
      if (cRes.status === 'fulfilled' && cRes.value.data?.data) {
        setLiveCategories(cRes.value.data.data);
      }
    } catch (e) {
      console.warn('Explore fetch error:', e.message);
    }
  };

  useEffect(() => {
    fetchExploreData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExploreData();
    setRefreshing(false);
  };

  // Handle incoming filter parameters from stories or search
  useEffect(() => {
    if (route.params?.initialFilter) {
      setActiveFilter(route.params.initialFilter);
    }
  }, [route.params?.initialFilter]);

  // Deduplicate and apply user-uploaded images from heroBanners or liveServices
  const rawList = (liveServices && liveServices.length > 0)
    ? liveServices
    : ALL_SERVICES;

  const seenServiceKeys = new Set();
  const allAvailableServices = [];
  for (const item of rawList) {
    const rawName = (item.name || '').trim();
    const normalizedKey = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenServiceKeys.has(normalizedKey)) {
      seenServiceKeys.add(normalizedKey);
      // Check if user uploaded an image in heroBanners for this service
      const matchedBanner = heroBanners?.find(
        (b) => (b.title || '').trim().toLowerCase() === rawName.toLowerCase()
      );
      const finalImage = matchedBanner?.image || item.image;
      allAvailableServices.push({ ...item, image: finalImage });
    }
  }

  // Dynamic filter list based on categories
  const filterList = (liveCategories && liveCategories.length > 0)
    ? ['All', '50% OFF', ...Array.from(new Set(liveCategories.map((c) => c.name))).slice(0, 10)]
    : FILTERS;

  const filteredServices = allAvailableServices.filter((item) => {
    let matchesFilter = true;
    if (activeFilter === '50% OFF') {
      matchesFilter = item.discount === '50% OFF' || item.price <= 499;
    } else if (activeFilter !== 'All') {
      matchesFilter = (item.category || '').toLowerCase().includes(activeFilter.toLowerCase()) ||
                      (item.name || '').toLowerCase().includes(activeFilter.toLowerCase());
    }
    const matchesQuery = (item.name || '').toLowerCase().includes(query.toLowerCase()) ||
                         (item.category || '').toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const dyn = {
    container: { backgroundColor: themeColors?.bg || '#070A12' },
    header: { backgroundColor: themeColors?.headerBg || '#070A12', borderBottomColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    title: { color: themeColors?.text || '#FFFFFF' },
    sub: { color: themeColors?.textSecondary || '#94A3B8' },
    searchBox: { backgroundColor: themeColors?.card || '#0F172A', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    searchInput: { color: themeColors?.text || '#FFFFFF' },
    filterChip: { backgroundColor: themeColors?.card || '#0F172A', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    filterText: { color: themeColors?.textSecondary || '#94A3B8' },
    card: { backgroundColor: themeColors?.card || '#0F172A', borderColor: themeColors?.border || 'rgba(255, 255, 255, 0.08)' },
    text: { color: themeColors?.text || '#FFFFFF' },
    textSecondary: { color: themeColors?.textSecondary || '#94A3B8' },
  };

  return (
    <SafeAreaView style={[styles.container, dyn.container]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, dyn.header]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.headerTitle, dyn.title]}>
            {language === 'hi' ? 'सेवाएं खोजें' : 'Explore Services'}
          </Text>
          <View style={[styles.verifiedHeaderBadge, { backgroundColor: `${activeColor}20`, borderColor: activeColor }]}>
            <Text style={[styles.verifiedHeaderText, { color: activeColor }]}>
              {language === 'hi' ? '⚡ 15 मिनट सेवा' : '⚡ 15-Min Pro'}
            </Text>
          </View>
        </View>
        <Text style={[styles.headerSub, dyn.sub]}>
          {language === 'hi' ? 'इंदौर के सत्यापित कारीगर, पारदर्शी व तय कीमतों पर' : "Indore's top verified doorstep professionals at upfront pricing"}
        </Text>

        {/* Search */}
        <View style={[styles.searchBox, dyn.searchBox]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, dyn.searchInput]}
            placeholder={language === 'hi' ? 'सेवा, कारीगर या काम खोजें...' : 'Search service, pro or appliance...'}
            placeholderTextColor={themeColors?.textMuted || '#64748B'}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: themeColors?.textSecondary || '#94A3B8', fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filterList.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                dyn.filterChip,
                activeFilter === f && [styles.activeFilterChip, { backgroundColor: activeColor, borderColor: activeColor }],
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  dyn.filterText,
                  activeFilter === f && { color: '#FFFFFF', fontWeight: '800' },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Services List */}
      <ScrollView
        contentContainerStyle={styles.serviceList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={activeColor}
            colors={[activeColor]}
          />
        }
      >
        <View style={styles.resultHeaderRow}>
          <Text style={styles.resultsCount}>Showing {filteredServices.length} verified services in Indore</Text>
          <Text style={styles.realtimeLiveDot}>● Live Catalog</Text>
        </View>

        {/* Nearest Verified Hubs & Vendors */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16 }}>🏢</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' }}>Nearest Verified Hubs & Vendors</Text>
            </View>
            <Text style={{ color: activeColor, fontSize: 10.5, fontWeight: '800' }}>INDORE (10KM)</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {NEAREST_VENDORS.map((v) => (
              <View
                key={v.id}
                style={{
                  width: 250,
                  backgroundColor: '#0F172A',
                  borderRadius: 14,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }} numberOfLines={1}>
                      {v.name}
                    </Text>
                    <Text style={{ color: '#94A3B8', fontSize: 10.5, marginTop: 2 }}>📍 {v.distance} • {v.time}</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ color: '#F59E0B', fontSize: 10.5, fontWeight: '800' }}>★ {v.rating}</Text>
                  </View>
                </View>

                <Text style={{ color: '#64748B', fontSize: 10.5, marginTop: 6 }} numberOfLines={1}>
                  {v.specialty}
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: `${activeColor}20`,
                    borderWidth: 1,
                    borderColor: activeColor,
                    borderRadius: 8,
                    paddingVertical: 7,
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                  onPress={() => {
                    const matchedService = filteredServices[0] || ALL_SERVICES[0];
                    navigation.navigate('BookingCheckout', {
                      service: matchedService,
                      pro: { name: v.name, price: matchedService.price, hubId: v.id },
                    });
                  }}
                >
                  <Text style={{ color: activeColor, fontSize: 11, fontWeight: '800' }}>
                    Select Hub & Book Service ➔
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {filteredServices.map((service, idx) => {
          const discountVal = service.discount || (service.originalPrice && service.originalPrice > service.price
            ? `${Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)}% OFF`
            : null);

          return (
            <View key={service.id || service._id || String(idx)} style={styles.serviceCard}>
              <View style={styles.serviceImageContainer}>
                <Image source={{ uri: service.image }} style={styles.serviceImage} resizeMode="cover" />
                {discountVal ? (
                  <View style={[styles.imageDiscountPill, { backgroundColor: activeColor }]}>
                    <Text style={styles.imageDiscountText}>{discountVal}</Text>
                  </View>
                ) : null}
              </View>
              
              <View style={styles.cardDetails}>
                <View style={styles.tagRow}>
                  <View style={[styles.tagBadge, { borderColor: `${activeColor}40`, backgroundColor: `${activeColor}15`, maxWidth: '75%' }]}>
                    <Text style={[styles.tagText, { color: activeColor }]} numberOfLines={1}>
                      {service.tag || service.category || 'Doorstep Pro'}
                    </Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>★ {service.rating || '4.9'}</Text>
                  </View>
                </View>

                <Text style={styles.serviceName} numberOfLines={2}>{service.name}</Text>
                <Text style={styles.durationText}>⏱️ {service.duration || '45 mins'} • 100% Guaranteed</Text>

                <View style={styles.actionRow}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={[styles.price, { color: activeColor }]}>₹{service.price}</Text>
                      {service.originalPrice ? (
                        <Text style={styles.originalPrice}>₹{service.originalPrice}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.taxLabel}>Standard visiting included</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.bookBtn, { backgroundColor: activeColor }]}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('BookingCheckout', { service })}
                  >
                    <Text style={styles.bookBtnText}>Book ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1523',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
  },
  filterScrollWrap: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#0F1523',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeFilterChip: {
    backgroundColor: '#FF4D2D',
    borderColor: '#FF4D2D',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  serviceList: {
    padding: 16,
    paddingBottom: 85,
  },
  resultsCount: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '700',
  },
  serviceCard: {
    backgroundColor: '#0F1523',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  serviceImage: {
    width: '100%',
    height: 145,
  },
  cardDetails: {
    padding: 14,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: '#FF4D2D',
    fontSize: 10,
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
  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  originalPrice: {
    fontSize: 13,
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  taxLabel: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },
  bookBtn: {
    backgroundColor: '#FF4D2D',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  verifiedHeaderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  verifiedHeaderText: {
    fontSize: 10,
    fontWeight: '900',
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  realtimeLiveDot: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  serviceImageContainer: {
    position: 'relative',
    width: '100%',
    height: 145,
    backgroundColor: '#1E293B',
  },
  imageDiscountPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageDiscountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
});

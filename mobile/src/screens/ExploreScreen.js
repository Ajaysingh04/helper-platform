import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const ALL_SERVICES = [
  {
    id: 's1',
    name: 'AC Jet Foam Deep Cleaning',
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
    name: 'Full Home Deep Sanitization',
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

const FILTERS = ['All', '50% OFF', 'AC Repair', 'Cleaning', 'Repairs', 'Plumbing', 'Painting', 'Beauty', 'Carpentry'];

export default function ExploreScreen({ route, navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');

  // Handle incoming filter parameters from stories or search
  useEffect(() => {
    if (route.params?.initialFilter) {
      setActiveFilter(route.params.initialFilter);
    }
  }, [route.params?.initialFilter]);

  const filteredServices = ALL_SERVICES.filter((item) => {
    let matchesFilter = true;
    if (activeFilter === '50% OFF') {
      matchesFilter = item.discount === '50% OFF' || item.price <= 499;
    } else if (activeFilter !== 'All') {
      matchesFilter = item.category.toLowerCase().includes(activeFilter.toLowerCase()) ||
                      item.name.toLowerCase().includes(activeFilter.toLowerCase());
    }
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase()) ||
                         item.category.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore 100+ Services</Text>
        <Text style={styles.headerSub}>Doorstep delivery in 15-30 minutes across Indore</Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search service, pro or appliance..."
            placeholderTextColor="#64748B"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: '#94A3B8', fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.activeFilterChip]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Services List */}
      <ScrollView contentContainerStyle={styles.serviceList} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>Showing {filteredServices.length} verified services in Indore</Text>

        {filteredServices.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <Image source={{ uri: service.image }} style={styles.serviceImage} />
            
            <View style={styles.cardDetails}>
              <View style={styles.tagRow}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{service.tag}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>★ {service.rating}</Text>
                </View>
              </View>

              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.durationText}>⏱️ {service.duration} • 100% Quality Guaranteed</Text>

              <View style={styles.actionRow}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                    <Text style={styles.price}>₹{service.price}</Text>
                    <Text style={styles.originalPrice}>₹{service.originalPrice}</Text>
                  </View>
                  <Text style={styles.taxLabel}>Standard visiting included</Text>
                </View>

                <TouchableOpacity
                  style={styles.bookBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('BookingCheckout', { service })}
                >
                  <Text style={styles.bookBtnText}>Book ➔</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
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
    paddingBottom: 30,
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
});

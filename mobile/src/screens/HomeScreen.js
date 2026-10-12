import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import client from '../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

const HERO_BANNERS = [
  {
    id: 'b1',
    title: 'Professional Home Cleaning',
    subtitle: 'Verified Experts & Safe Equipments',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    tag: '⚡ 15-MIN EXPRESS',
  },
  {
    id: 'b2',
    title: 'AC Repair & Jet Servicing',
    subtitle: 'Deep Coil Foam Cleaning & Gas Refill',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
    tag: '❄️ 4.9 RATED',
  },
  {
    id: 'b3',
    title: 'Certified Electricians',
    subtitle: 'Instant Wiring, MCB & Switchboard Fix',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=800',
    tag: '🛡️ POLICE VERIFIED',
  },
];

const CATEGORIES = [
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', color: '#10B981', count: '24 Pros' },
  { id: 'ac-repair-services', name: 'AC Repair', icon: '❄️', color: '#38BDF8', count: '18 Pros' },
  { id: 'electricians', name: 'Electrician', icon: '⚡', color: '#F59E0B', count: '32 Pros' },
  { id: 'plumbers', name: 'Plumber', icon: '🚰', color: '#6366F1', count: '15 Pros' },
  { id: 'painters', name: 'Painting', icon: '🎨', color: '#EC4899', count: '12 Pros' },
  { id: 'carpenters', name: 'Carpenter', icon: '🔨', color: '#8B5CF6', count: '20 Pros' },
  { id: 'beauty-parlours', name: 'Salon', icon: '💇‍♀️', color: '#F43F5E', count: '28 Pros' },
  { id: 'appliance-repair', name: 'Appliances', icon: '📺', color: '#14B8A6', count: '19 Pros' },
];

const POPULAR_SERVICES = [
  {
    id: 's1',
    name: 'AC Repair & Jet Foam',
    category: 'AC Repair',
    price: 499,
    originalPrice: 799,
    rating: 5.0,
    reviews: 420,
    badge: 'HOT',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 's2',
    name: 'Complete Wall Painting',
    category: 'Painting',
    price: 599,
    originalPrice: 999,
    rating: 4.9,
    reviews: 312,
    badge: 'TRENDING',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 's3',
    name: 'Deep Home Cleaning',
    category: 'Cleaning',
    price: 899,
    originalPrice: 1499,
    rating: 4.9,
    reviews: 580,
    badge: 'BESTSELLER',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
  },
];

export default function HomeScreen({ navigation }) {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const bannerListRef = useRef(null);

  // Auto scroll banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % HERO_BANNERS.length;
        bannerListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brandTitle}>
            HELPER<Text style={{ color: colors.primary }}>.</Text>
          </Text>
          <TouchableOpacity style={styles.locationPill}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>Indore, MP</Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconCircle}>
            <Text style={styles.headerIcon}>🛒</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search 'AC Repair', 'Cleaning', 'Plumber'..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={{ color: '#94A3B8', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero Banner Carousel */}
        <View style={styles.carouselSection}>
          <FlatList
            ref={bannerListRef}
            data={HERO_BANNERS}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 16 }}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 16));
              setActiveBannerIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <View style={[styles.bannerCard, { width: BANNER_WIDTH }]}>
                <Image source={{ uri: item.image }} style={styles.bannerImage} />
                <View style={styles.bannerOverlay}>
                  <View style={styles.bannerTag}>
                    <Text style={styles.bannerTagText}>{item.tag}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                  <TouchableOpacity
                    style={styles.bannerBtn}
                    onPress={() => navigation.navigate('BookingCheckout', { service: { name: item.title, price: 499, image: item.image } })}
                  >
                    <Text style={styles.bannerBtnText}>Book Now ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {HERO_BANNERS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === activeBannerIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTag}>EXPLORE SERVICES</Text>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.viewAllText}>View All ➔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => navigation.navigate('CategoryDetails', { category: cat })}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIconWrap, { backgroundColor: `${cat.color}20` }]}>
                <Text style={styles.categoryIconText}>{cat.icon}</Text>
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
              <Text style={styles.categoryCount}>{cat.count}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Services Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View>
            <Text style={[styles.sectionTag, { color: colors.secondary }]}>TOP RATED EXPERTS</Text>
            <Text style={styles.sectionTitle}>Our Services</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.viewAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={POPULAR_SERVICES}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.serviceCard}>
              <View style={styles.serviceImageWrap}>
                <Image source={{ uri: item.image }} style={styles.serviceImage} />
                <View style={styles.hotBadge}>
                  <Text style={styles.hotBadgeText}>{item.badge}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>★ {item.rating}</Text>
                </View>
              </View>

              <View style={styles.serviceDetails}>
                <Text style={styles.serviceTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.serviceCategory}>{item.category}</Text>

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.startsAtLabel}>STARTS AT</Text>
                    <Text style={styles.servicePrice}>₹{item.price}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => navigation.navigate('BookingCheckout', { service: item })}
                  >
                    <Text style={styles.bookBtnText}>Book ⚡</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  locationPin: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F1F5F9',
    maxWidth: 90,
  },
  chevron: {
    fontSize: 11,
    color: '#94A3B8',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 13,
  },
  carouselSection: {
    marginTop: 16,
  },
  bannerCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 16,
    backgroundColor: colors.darkCard,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.65)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 77, 45, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  bannerTagText: {
    color: '#FF6B4A',
    fontSize: 10,
    fontWeight: '800',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 10,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bannerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  activeDot: {
    width: 18,
    backgroundColor: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 24 - 24) / 4,
    backgroundColor: colors.darkCard,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryIconText: {
    fontSize: 22,
  },
  categoryName: {
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  categoryCount: {
    color: '#64748B',
    fontSize: 9.5,
    marginTop: 2,
  },
  serviceCard: {
    width: 220,
    backgroundColor: colors.darkCard,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderDark,
    marginRight: 14,
  },
  serviceImageWrap: {
    width: '100%',
    height: 125,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  hotBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF7A00',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hotBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  serviceDetails: {
    padding: 12,
  },
  serviceTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  serviceCategory: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: 8,
  },
  startsAtLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
  servicePrice: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
});

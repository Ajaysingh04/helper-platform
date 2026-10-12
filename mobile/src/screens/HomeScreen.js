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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

// Stories / Flash Highlight Row
const STORIES = [
  { id: 'st1', label: 'Offer 50%', icon: '🏷️', color: '#FF4D2D', border: '#FF4D2D' },
  { id: 'st2', label: '15m Express', icon: '⚡', color: '#10B981', border: '#10B981' },
  { id: 'st3', label: 'AC Foam', icon: '❄️', color: '#06B6D4', border: '#06B6D4' },
  { id: 'st4', label: 'Cleaning', icon: '🧹', color: '#8B5CF6', border: '#8B5CF6' },
  { id: 'st5', label: 'Verified', icon: '🛡️', color: '#F59E0B', border: '#F59E0B' },
  { id: 'st6', label: 'Salon', icon: '💇‍♀️', color: '#EC4899', border: '#EC4899' },
  { id: 'st7', label: 'Pay Later', icon: '💵', color: '#14B8A6', border: '#14B8A6' },
];

const HERO_BANNERS = [
  {
    id: 'b1',
    title: 'AC Jet Foam Servicing',
    subtitle: 'Deep indoor coil wash & 2X cooling guarantee',
    tag: '⚡ 15-MIN ARRIVAL',
    badge: 'MOST BOOKED',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=900',
    price: 499,
    originalPrice: 799,
  },
  {
    id: 'b2',
    title: 'Deep Home Sanitization',
    subtitle: 'Hospital-grade chemical wash & sofa steam clean',
    tag: '✨ 100% SAFE',
    badge: 'TOP RATED',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=900',
    price: 899,
    originalPrice: 1499,
  },
  {
    id: 'b3',
    title: 'Certified Electricians',
    subtitle: 'Short circuit, MCB, switchboard & fan mounting',
    tag: '🛡️ POLICE VERIFIED',
    badge: 'EMERGENCY',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=900',
    price: 249,
    originalPrice: 399,
  },
];

const CATEGORIES = [
  { id: 'ac-repair-services', name: 'AC Repair', icon: '❄️', color: '#06B6D4', count: '28 Pros', tag: 'Fast' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', color: '#10B981', count: '35 Pros', tag: 'Popular' },
  { id: 'electricians', name: 'Electrician', icon: '⚡', color: '#F59E0B', count: '42 Pros', tag: 'Express' },
  { id: 'plumbers', name: 'Plumber', icon: '🚰', color: '#6366F1', count: '20 Pros', tag: '24/7' },
  { id: 'painters', name: 'Painting', icon: '🎨', color: '#EC4899', count: '16 Pros', tag: 'Warranty' },
  { id: 'carpenters', name: 'Carpenter', icon: '🔨', color: '#8B5CF6', count: '24 Pros', tag: 'Custom' },
  { id: 'beauty-parlours', name: 'Salon', icon: '💇‍♀️', color: '#F43F5E', count: '31 Pros', tag: 'At Home' },
  { id: 'appliance-repair', name: 'Appliances', icon: '📺', color: '#14B8A6', count: '22 Pros', tag: 'Genuine' },
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
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
    verified: true,
    price: 249,
  },
  {
    id: 'pro2',
    name: 'Sunil Verma',
    specialty: 'Certified AC Specialist',
    rating: '5.0',
    reviews: '640+ jobs',
    experience: '11 yrs exp',
    distance: '12 mins away',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    verified: true,
    price: 499,
  },
  {
    id: 'pro3',
    name: 'Pooja Rathore',
    specialty: 'Home Deep Clean Lead',
    rating: '4.98',
    reviews: '410+ jobs',
    experience: '7 yrs exp',
    distance: '14 mins away',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    verified: true,
    price: 899,
  },
];

const BESTSELLER_SERVICES = [
  {
    id: 'bs1',
    name: 'AC Jet Foam Servicing',
    category: 'AC Repair',
    price: 499,
    originalPrice: 799,
    discount: '38% OFF',
    rating: 5.0,
    reviews: 420,
    time: '45 mins',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'bs2',
    name: 'Switchboard & MCB Repair',
    category: 'Electrician',
    price: 249,
    originalPrice: 399,
    discount: '37% OFF',
    rating: 4.9,
    reviews: 312,
    time: '30 mins',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'bs3',
    name: 'Full Home Deep Cleaning',
    category: 'Cleaning',
    price: 899,
    originalPrice: 1499,
    discount: '40% OFF',
    rating: 4.9,
    reviews: 580,
    time: '3-4 hrs',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'bs4',
    name: 'Tap Leakage & Blockage Fix',
    category: 'Plumber',
    price: 299,
    originalPrice: 499,
    discount: '40% OFF',
    rating: 4.8,
    reviews: 245,
    time: '40 mins',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=600',
  },
];

export default function HomeScreen({ navigation }) {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [couponCopied, setCouponCopied] = useState(false);
  const bannerListRef = useRef(null);

  // Auto scroll banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => {
        const next = (prev + 1) % HERO_BANNERS.length;
        bannerListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCoupon = () => {
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#070A12" />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>HELPER</Text>
            <View style={styles.proTag}>
              <Text style={styles.proTagText}>PRO</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.locationPill} activeOpacity={0.8}>
            <Text style={styles.locIcon}>📍</Text>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={styles.locTitle}>Vijay Nagar, Indore</Text>
                <Text style={styles.locChevron}>▼</Text>
              </View>
              <View style={styles.pulseContainer}>
                <View style={styles.pulseDot} />
                <Text style={styles.pulseText}>15 Mins Superfast Doorstep</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('BookingCheckout')}
            activeOpacity={0.8}
          >
            <Text style={styles.headerBtnIcon}>🛒</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* LUXURY FLOATING SEARCH */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Explore')}
          >
            <View style={styles.searchLeftWrap}>
              <Text style={styles.searchLens}>🔍</Text>
              <Text style={styles.searchPlaceholder}>Search "AC Repair", "Cleaning", "Plumber"...</Text>
            </View>
            <View style={styles.searchActionWrap}>
              <View style={styles.searchPillTag}>
                <Text style={styles.searchPillText}>⚡ Express</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* INTERACTIVE INSTA-STORIES STRIP */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesScroll}
        >
          {STORIES.map((st) => (
            <TouchableOpacity
              key={st.id}
              style={styles.storyItem}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Explore')}
            >
              <View style={[styles.storyRing, { borderColor: st.border }]}>
                <View style={[styles.storyInner, { backgroundColor: '#131A2B' }]}>
                  <Text style={styles.storyEmoji}>{st.icon}</Text>
                </View>
              </View>
              <Text style={styles.storyLabel} numberOfLines={1}>{st.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* PANORAMIC CAROUSEL BANNER */}
        <View style={styles.heroSection}>
          <FlatList
            ref={bannerListRef}
            data={HERO_BANNERS}
            keyExtractor={(item) => item.id}
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
                <Image source={{ uri: item.image }} style={styles.heroBgImg} />
                <View style={styles.heroOverlay}>
                  <View style={styles.heroTopRow}>
                    <View style={styles.heroTagBadge}>
                      <Text style={styles.heroTagText}>{item.tag}</Text>
                    </View>
                    <View style={styles.heroMostBookedBadge}>
                      <Text style={styles.heroMostBookedText}>{item.badge}</Text>
                    </View>
                  </View>

                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={styles.heroTitle}>{item.title}</Text>
                    <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
                  </View>

                  <View style={styles.heroBottomRow}>
                    <View>
                      <Text style={styles.heroPriceLabel}>LIMITED TIME FARE</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                        <Text style={styles.heroPriceVal}>₹{item.price}</Text>
                        <Text style={styles.heroOldPrice}>₹{item.originalPrice}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.heroBookBtn}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate('BookingCheckout', {
                          service: { name: item.title, price: item.price, image: item.image },
                        })
                      }
                    >
                      <Text style={styles.heroBookBtnText}>Book in 15 Mins ➔</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.dotsRow}>
            {HERO_BANNERS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === activeBannerIndex ? styles.activeDot : null,
                ]}
              />
            ))}
          </View>
        </View>

        {/* LUXURY TICKET VOUCHER CARD */}
        <View style={styles.voucherContainer}>
          <TouchableOpacity
            style={styles.voucherTicket}
            activeOpacity={0.9}
            onPress={handleCopyCoupon}
          >
            {/* Left Notch */}
            <View style={styles.notchLeft} />
            {/* Right Notch */}
            <View style={styles.notchRight} />

            <View style={styles.voucherLeft}>
              <View style={styles.voucherIconBox}>
                <Text style={styles.voucherIcon}>🎟️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.voucherTitle}>SPECIAL FIRST BOOKING</Text>
                  <View style={styles.voucherTag}>
                    <Text style={styles.voucherTagText}>50% OFF</Text>
                  </View>
                </View>
                <Text style={styles.voucherSub}>Flat ₹50 instant discount applied at checkout</Text>
              </View>
            </View>

            {/* Dashed divider */}
            <View style={styles.dashedDivider} />

            <View style={styles.voucherRight}>
              <View style={styles.couponCodePill}>
                <Text style={styles.couponCodeText}>HELPER50</Text>
              </View>
              <Text style={styles.copyNotice}>
                {couponCopied ? 'COPIED! ✓' : 'TAP TO COPY'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 8 DOORSTEP CATEGORIES */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionPre}>WHAT ARE YOU LOOKING FOR?</Text>
            <Text style={styles.sectionHeading}>Doorstep Categories</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAllBtn}>View All 100+ ➔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.catCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CategoryDetails', { category: cat })}
            >
              <View style={[styles.catIconCircle, { backgroundColor: `${cat.color}18`, borderColor: `${cat.color}50` }]}>
                <Text style={styles.catIconText}>{cat.icon}</Text>
                <View style={[styles.catMicroTag, { backgroundColor: cat.color }]}>
                  <Text style={styles.catMicroTagText}>{cat.tag}</Text>
                </View>
              </View>
              <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
              <Text style={styles.catCount}>{cat.count}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* INDORE'S TOP 1% VERIFIED SPECIALISTS */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <View>
            <Text style={[styles.sectionPre, { color: '#10B981' }]}>100% POLICE & AADHAAR VERIFIED</Text>
            <Text style={styles.sectionHeading}>Top Rated Specialists</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAllBtn}>View Pros</Text>
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
              style={styles.proCard}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('BookingCheckout', {
                  service: { name: `${pro.specialty} Inspection`, price: pro.price, image: pro.avatar },
                  pro,
                })
              }
            >
              <View style={styles.proHeaderRow}>
                <Image source={{ uri: pro.avatar }} style={styles.proAvatar} />
                <View style={styles.proBadgeVerified}>
                  <Text style={styles.proVerifiedShield}>🛡️</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.proName}>{pro.name}</Text>
                  <Text style={styles.proRole}>{pro.specialty}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Text style={styles.proStar}>★ {pro.rating}</Text>
                    <Text style={styles.proJobs}>• {pro.reviews}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.proDetailsRow}>
                <View style={styles.proDetailItem}>
                  <Text style={styles.proDetailLabel}>EXPERIENCE</Text>
                  <Text style={styles.proDetailVal}>{pro.experience}</Text>
                </View>
                <View style={styles.proDetailItem}>
                  <Text style={styles.proDetailLabel}>ARRIVAL</Text>
                  <Text style={[styles.proDetailVal, { color: '#10B981' }]}>⚡ {pro.distance}</Text>
                </View>
                <View style={styles.proDetailItem}>
                  <Text style={styles.proDetailLabel}>VISIT FEE</Text>
                  <Text style={styles.proDetailVal}>₹{pro.price}</Text>
                </View>
              </View>

              <View style={styles.proActionBtn}>
                <Text style={styles.proActionText}>Book Specialist ➔</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* MOST BOOKED SERVICES */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <View>
            <Text style={[styles.sectionPre, { color: '#FF7A00' }]}>HIGH DEMAND THIS WEEK</Text>
            <Text style={styles.sectionHeading}>Most Booked Services</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAllBtn}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={BESTSELLER_SERVICES}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <View style={styles.bestsellerCard}>
              <View style={styles.bsImageWrap}>
                <Image source={{ uri: item.image }} style={styles.bsImage} />
                <View style={styles.bsBadgesRow}>
                  <View style={styles.bsDiscountTag}>
                    <Text style={styles.bsDiscountText}>{item.discount}</Text>
                  </View>
                  <View style={styles.bsRatingTag}>
                    <Text style={styles.bsRatingText}>★ {item.rating}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.bsBody}>
                <Text style={styles.bsCatText}>{item.category.toUpperCase()}</Text>
                <Text style={styles.bsTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.bsTime}>⏱️ {item.time} • 100% Quality Assured</Text>

                <View style={styles.bsFooter}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={styles.bsPrice}>₹{item.price}</Text>
                      <Text style={styles.bsOldPrice}>₹{item.originalPrice}</Text>
                    </View>
                    <Text style={styles.bsDoorstepTag}>⚡ 15m Doorstep</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.bsBookBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('BookingCheckout', { service: item })}
                  >
                    <Text style={styles.bsBookBtnText}>Book ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />

        {/* HELPER SATISFACTION ASSURANCE */}
        <View style={styles.assuranceCard}>
          <View style={styles.assuranceHeader}>
            <Text style={styles.assuranceShieldIcon}>🛡️</Text>
            <View>
              <Text style={styles.assuranceMainTitle}>HELPER 100% SATISFACTION SHIELD</Text>
              <Text style={styles.assuranceSubTitle}>Your safety & satisfaction are unconditionally guaranteed</Text>
            </View>
          </View>

          <View style={styles.assuranceFeatures}>
            <View style={styles.assuranceCol}>
              <Text style={styles.featIcon}>👮‍♂️</Text>
              <Text style={styles.featTitle}>Police Verified</Text>
              <Text style={styles.featDesc}>Background & Aadhaar checked technicians</Text>
            </View>
            <View style={styles.assuranceCol}>
              <Text style={styles.featIcon}>🔄</Text>
              <Text style={styles.featTitle}>30-Day Revisit</Text>
              <Text style={styles.featDesc}>Free re-service if not 100% satisfied</Text>
            </View>
            <View style={styles.assuranceCol}>
              <Text style={styles.featIcon}>💵</Text>
              <Text style={styles.featTitle}>Pay After Service</Text>
              <Text style={styles.featDesc}>No advance, pay with UPI/Cash only after work</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A12',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#070A12',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 45, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  brandName: {
    color: '#FF4D2D',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  proTag: {
    backgroundColor: '#FF4D2D',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 5,
  },
  proTagText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locIcon: {
    fontSize: 14,
  },
  locTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  locChevron: {
    color: '#94A3B8',
    fontSize: 9,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBtnIcon: {
    fontSize: 16,
  },
  badgeCount: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FF4D2D',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  // Search
  searchContainer: {
    paddingHorizontal: 16,
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
    paddingHorizontal: 14,
    height: 46,
  },
  searchLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchLens: {
    fontSize: 14,
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
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
  // Hero Carousel
  heroSection: {
    marginTop: 6,
  },
  heroCard: {
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 14,
    backgroundColor: '#0F1523',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroBgImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 10, 18, 0.72)',
    padding: 14,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTagBadge: {
    backgroundColor: 'rgba(255, 77, 45, 0.25)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroMostBookedText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 6,
  },
  heroSubtitle: {
    fontSize: 11.5,
    color: '#CBD5E1',
    marginTop: 2,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 8,
  },
  heroPriceLabel: {
    color: '#94A3B8',
    fontSize: 8.5,
    fontWeight: '800',
  },
  heroPriceVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  heroOldPrice: {
    color: '#64748B',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  heroBookBtn: {
    backgroundColor: '#FF4D2D',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
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
    paddingVertical: 12,
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
    position: 'relative',
    marginBottom: 6,
  },
  catIconText: {
    fontSize: 22,
  },
  catMicroTag: {
    position: 'absolute',
    bottom: -4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  catMicroTagText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
  },
  catName: {
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 3,
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
    width: 230,
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
    paddingHorizontal: 7,
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
    paddingHorizontal: 7,
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
    paddingHorizontal: 14,
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
});

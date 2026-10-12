import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const PROS_DATA = [
  {
    id: 'p1',
    name: 'Ramesh Sharma',
    badge: 'GOLD SPECIALIST',
    specialty: 'Master Electrician & Wireman',
    rating: 4.9,
    reviews: 184,
    jobsDone: '520+ jobs',
    price: 299,
    originalPrice: 499,
    experience: '9 yrs exp',
    arrival: '12 mins away',
    verified: true,
    image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
    skills: ['MCB Tripping', 'Short Circuit Fix', 'Appliance Wiring', 'Safety Tested'],
  },
  {
    id: 'p2',
    name: 'Sunil Verma',
    badge: 'TOP RATED',
    specialty: 'Senior Certified Technician',
    rating: 5.0,
    reviews: 215,
    jobsDone: '640+ jobs',
    price: 349,
    originalPrice: 599,
    experience: '11 yrs exp',
    arrival: '15 mins away',
    verified: true,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    skills: ['Police Verified', 'Precision Tools', 'Clean Finish', '30-Day Warranty'],
  },
  {
    id: 'p3',
    name: 'Amit Patel',
    badge: 'EXPRESS PRO',
    specialty: 'Installation & Repair Expert',
    rating: 4.8,
    reviews: 140,
    jobsDone: '390+ jobs',
    price: 249,
    originalPrice: 399,
    experience: '7 yrs exp',
    arrival: '20 mins away',
    verified: true,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    skills: ['Switchboard Mounting', 'Fan Regulator', 'Inverter Setup'],
  },
];

const FILTERS = ['All Experts', '⭐ 4.9+ Rated', '⚡ Express (15m)', '💰 Low Price'];

export default function CategoryDetailsScreen({ route, navigation }) {
  const { category } = route.params || { category: { name: 'Service', icon: '⚡' } };
  const [activeFilter, setActiveFilter] = useState('All Experts');

  const handleBook = (pro) => {
    navigation.navigate('BookingCheckout', {
      service: {
        name: `${category.name} Inspection & Repair`,
        price: pro.price,
        category: category.name,
        image: pro.image,
      },
      pro,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <Text style={styles.headerTitle}>{category.icon} {category.name}</Text>
          <Text style={styles.headerSub}>Verified Specialists in Indore</Text>
        </View>
        <TouchableOpacity style={styles.searchSmallBtn} onPress={() => navigation.navigate('Explore')}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <View style={styles.expressTag}>
              <Text style={styles.expressTagText}>⚡ 15-MINUTE EXPRESS ARRIVAL</Text>
            </View>
            <Text style={styles.bannerHeadline}>Book Trusted {category.name} Pros</Text>
            <Text style={styles.bannerSubline}>
              100% Background-checked • Upfront transparent prices • 30-Day guarantee
            </Text>
          </View>
          <View style={styles.heroEmojiCircle}>
            <Text style={styles.heroBigEmoji}>{category.icon}</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
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
        </View>

        <Text style={styles.sectionTitle}>Available Specialists Near You ({PROS_DATA.length})</Text>

        {PROS_DATA.map((pro) => (
          <View key={pro.id} style={styles.proCard}>
            {/* Top row with Pro Avatar & Badge */}
            <View style={styles.proTopRow}>
              <View style={styles.avatarWrap}>
                <Image source={{ uri: pro.image }} style={styles.avatarImg} />
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.proInfoWrap}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.proName}>{pro.name}</Text>
                  <View style={styles.goldBadge}>
                    <Text style={styles.goldBadgeText}>{pro.badge}</Text>
                  </View>
                </View>

                <Text style={styles.proRole}>{pro.specialty}</Text>

                <View style={styles.ratingExpRow}>
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingText}>★ {pro.rating}</Text>
                    <Text style={styles.reviewCount}>({pro.reviews})</Text>
                  </View>
                  <Text style={styles.expDot}>•</Text>
                  <Text style={styles.expText}>{pro.experience}</Text>
                  <Text style={styles.expDot}>•</Text>
                  <Text style={styles.jobsText}>{pro.jobsDone}</Text>
                </View>
              </View>
            </View>

            {/* Arrival & Verification Strip */}
            <View style={styles.arrivalStrip}>
              <Text style={styles.arrivalNote}>📍 {pro.arrival}</Text>
              <Text style={styles.verifiedTag}>🛡️ Police & KYC Verified</Text>
            </View>

            {/* Skills Chips */}
            <View style={styles.skillsRow}>
              {pro.skills.map((skill, idx) => (
                <View key={idx} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>

            {/* Price & Book Action */}
            <View style={styles.priceActionRow}>
              <View>
                <Text style={styles.visitingLabel}>VISITING & INSPECTION FEE</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text style={styles.proPrice}>₹{pro.price}</Text>
                  <Text style={styles.proOldPrice}>₹{pro.originalPrice}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bookBtn}
                activeOpacity={0.85}
                onPress={() => handleBook(pro)}
              >
                <Text style={styles.bookBtnText}>Book Specialist ➔</Text>
              </TouchableOpacity>
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
    backgroundColor: colors.darkBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    gap: 12,
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
  headerMeta: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  searchSmallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  heroBanner: {
    flexDirection: 'row',
    backgroundColor: colors.darkCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.35)',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLeft: {
    flex: 1,
  },
  expressTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 77, 45, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  expressTagText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bannerHeadline: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  bannerSubline: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
  },
  heroEmojiCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  heroBigEmoji: {
    fontSize: 30,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flex: 1,
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeFilterChip: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderColor: colors.primary,
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  activeFilterText: {
    color: colors.primary,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  proCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 15,
    marginBottom: 14,
  },
  proTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
    width: 66,
    height: 66,
  },
  avatarImg: {
    width: 66,
    height: 66,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 77, 45, 0.4)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: colors.darkCard,
  },
  proInfoWrap: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  goldBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  goldBadgeText: {
    color: '#F59E0B',
    fontSize: 8.5,
    fontWeight: '900',
  },
  proRole: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 2,
  },
  ratingExpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  reviewCount: {
    color: '#94A3B8',
    fontSize: 9.5,
  },
  expDot: {
    color: '#64748B',
    fontSize: 12,
  },
  expText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  jobsText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  arrivalStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  arrivalNote: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '700',
  },
  verifiedTag: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '700',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 10,
  },
  skillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  skillText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
  },
  priceActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: 12,
    marginTop: 12,
  },
  visitingLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
  },
  proPrice: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  proOldPrice: {
    color: '#64748B',
    fontSize: 12.5,
    textDecorationLine: 'line-through',
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
});

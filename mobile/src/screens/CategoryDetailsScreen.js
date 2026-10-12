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

const PROS_BY_CATEGORY = {
  'ac-repair-services': [
    {
      id: 'ac1',
      name: 'Sunil Verma',
      badge: 'AC MASTER',
      specialty: 'Senior Inverter AC Specialist',
      rating: 5.0,
      reviews: 320,
      jobsDone: '640+ jobs',
      price: 499,
      originalPrice: 799,
      experience: '11 yrs exp',
      arrival: '12 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      skills: ['Jet Foam Coil Wash', 'Gas Leak Check', 'PCB Circuit Repair', 'Cooling Test'],
    },
    {
      id: 'ac2',
      name: 'Imran Khan',
      badge: 'TOP RATED',
      specialty: 'Split & Window AC Technician',
      rating: 4.9,
      reviews: 210,
      jobsDone: '480+ jobs',
      price: 449,
      originalPrice: 699,
      experience: '8 yrs exp',
      arrival: '15 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      skills: ['Compressor Repair', 'Outdoor Unit Clean', 'Thermostat Fix'],
    },
    {
      id: 'ac3',
      name: 'Rahul Joshi',
      badge: 'EXPRESS PRO',
      specialty: 'Daikin & Voltas Specialist',
      rating: 4.8,
      reviews: 145,
      jobsDone: '310+ jobs',
      price: 399,
      originalPrice: 599,
      experience: '6 yrs exp',
      arrival: '18 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      skills: ['Anti-Bacterial Wash', 'Drain Pipe Leakage', 'Power Capacitor'],
    },
  ],
  'cleaning': [
    {
      id: 'cl1',
      name: 'Pooja Rathore',
      badge: 'SANITIZATION LEAD',
      specialty: 'Deep Home & Sofa Shampooing Expert',
      rating: 4.98,
      reviews: 410,
      jobsDone: '580+ jobs',
      price: 899,
      originalPrice: 1499,
      experience: '7 yrs exp',
      arrival: '14 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      skills: ['Hospital Grade Disinfection', 'Sofa Steam Clean', 'Kitchen Degreasing', 'Balcony Wash'],
    },
    {
      id: 'cl2',
      name: 'Suman Verma',
      badge: 'TOP RATED',
      specialty: 'Full Villa & Flat Deep Clean Pro',
      rating: 4.9,
      reviews: 260,
      jobsDone: '390+ jobs',
      price: 799,
      originalPrice: 1299,
      experience: '6 yrs exp',
      arrival: '20 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      skills: ['Floor Buffing', 'Bathroom Descaling', 'Eco-friendly Chemicals'],
    },
    {
      id: 'cl3',
      name: 'Manoj Mehra',
      badge: 'EXPRESS PRO',
      specialty: 'Mattress & Carpet Deep Clean Pro',
      rating: 4.85,
      reviews: 180,
      jobsDone: '290+ jobs',
      price: 649,
      originalPrice: 999,
      experience: '5 yrs exp',
      arrival: '10 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
      skills: ['Stain Removal', 'Steam Sanitizing', 'Odor Neutralization'],
    },
  ],
  'electricians': [
    {
      id: 'el1',
      name: 'Ramesh Sharma',
      badge: 'GOLD SPECIALIST',
      specialty: 'Master Electrician & Wireman',
      rating: 4.95,
      reviews: 520,
      jobsDone: '740+ jobs',
      price: 249,
      originalPrice: 399,
      experience: '9 yrs exp',
      arrival: '8 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
      skills: ['MCB Tripping Fix', 'Short Circuit Check', 'Switchboard Repair', 'Heavy Load Wiring'],
    },
    {
      id: 'el2',
      name: 'Amit Patel',
      badge: 'CERTIFIED PRO',
      specialty: 'Inverter & Smart Home Setup',
      rating: 4.9,
      reviews: 240,
      jobsDone: '360+ jobs',
      price: 299,
      originalPrice: 449,
      experience: '7 yrs exp',
      arrival: '15 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
      skills: ['Ceiling Fan Mounting', 'Inverter Battery Setup', 'Earthing Test'],
    },
    {
      id: 'el3',
      name: 'Dinesh Yadav',
      badge: 'EMERGENCY PRO',
      specialty: '24/7 Power Breakdown Tech',
      rating: 4.85,
      reviews: 190,
      jobsDone: '310+ jobs',
      price: 199,
      originalPrice: 349,
      experience: '5 yrs exp',
      arrival: '12 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
      skills: ['Light Fitting', 'Socket Replacement', 'Main Line Tripping'],
    },
  ],
  'plumbers': [
    {
      id: 'pl1',
      name: 'Vinod Yadav',
      badge: 'MASTER PLUMBER',
      specialty: 'High-Pressure Pipeline & Tap Expert',
      rating: 4.92,
      reviews: 380,
      jobsDone: '520+ jobs',
      price: 299,
      originalPrice: 499,
      experience: '10 yrs exp',
      arrival: '12 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400',
      skills: ['Concealed Leakage Fix', 'Tap & Mixer Replacement', 'Water Tank Cleaning', 'Drainage Unclog'],
    },
    {
      id: 'pl2',
      name: 'Rajesh Solanki',
      badge: 'TOP RATED',
      specialty: 'Bathroom Sanitary & Geyser Setup',
      rating: 4.88,
      reviews: 210,
      jobsDone: '340+ jobs',
      price: 249,
      originalPrice: 399,
      experience: '8 yrs exp',
      arrival: '16 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
      skills: ['Commode Flush Valve', 'Motor Pump Repair', 'Basin Installation'],
    },
  ],
  'painters': [
    {
      id: 'pa1',
      name: 'Dilip Chawla',
      badge: 'PAINT MASTER',
      specialty: 'Waterproof Wall & Texture Painter',
      rating: 4.95,
      reviews: 280,
      jobsDone: '410+ jobs',
      price: 599,
      originalPrice: 999,
      experience: '12 yrs exp',
      arrival: '18 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      skills: ['Asian Paints Royale', 'Damp-Proof Primer', 'Clean Wall Masking', 'Zero Mess Cleanup'],
    },
  ],
  'carpenters': [
    {
      id: 'cp1',
      name: 'Harish Carpenter',
      badge: 'WOOD CRAFTSMAN',
      specialty: 'Door Lock, Hinge & Furniture Repair',
      rating: 4.9,
      reviews: 230,
      jobsDone: '350+ jobs',
      price: 349,
      originalPrice: 599,
      experience: '9 yrs exp',
      arrival: '15 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      skills: ['Door Fitting', 'Godrej Lock Installation', 'Bed Repair', 'Cabinet Drawer Channel'],
    },
  ],
  'beauty-parlours': [
    {
      id: 'bp1',
      name: 'Neha Sen',
      badge: 'BEAUTY EXPERT',
      specialty: 'Facial, Waxing, Manicure & Hair Spa',
      rating: 5.0,
      reviews: 430,
      jobsDone: '620+ jobs',
      price: 699,
      originalPrice: 1199,
      experience: '8 yrs exp',
      arrival: '15 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      skills: ['O3+ Facial Treatment', 'Rica Waxing', 'Sara Pedicure', 'Sterilized Kits'],
    },
  ],
  'appliance-repair': [
    {
      id: 'ap1',
      name: 'Devendra Gour',
      badge: 'APPLIANCE PRO',
      specialty: 'Washing Machine, Fridge & Microwave Pro',
      rating: 4.88,
      reviews: 215,
      jobsDone: '320+ jobs',
      price: 399,
      originalPrice: 699,
      experience: '7 yrs exp',
      arrival: '14 mins away',
      verified: true,
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
      skills: ['Drum Bearing Fix', 'Gas Filling', 'Sensor Replacement', 'Original Spare Parts'],
    },
  ],
};

const FILTERS = ['All Experts', '⭐ 4.9+ Rated', '⚡ Express (15m)', '💰 Low Price'];

export default function CategoryDetailsScreen({ route, navigation }) {
  const { category } = route.params || { category: { id: 'ac-repair-services', name: 'Service', icon: '⚡' } };
  const [activeFilter, setActiveFilter] = useState('All Experts');

  const categoryId = category.id || 'ac-repair-services';
  const rawPros = PROS_BY_CATEGORY[categoryId] || PROS_BY_CATEGORY['ac-repair-services'];

  const filteredPros = rawPros.filter((pro) => {
    if (activeFilter === '⭐ 4.9+ Rated') return pro.rating >= 4.9;
    if (activeFilter === '⚡ Express (15m)') {
      const mins = parseInt(pro.arrival.replace(/[^0-9]/g, ''), 10) || 20;
      return mins <= 15;
    }
    return true;
  }).sort((a, b) => {
    if (activeFilter === '💰 Low Price') return a.price - b.price;
    return b.rating - a.rating;
  });

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
        <TouchableOpacity
          style={styles.searchSmallBtn}
          onPress={() => navigation.navigate('Explore', { initialFilter: category.name })}
        >
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

        <Text style={styles.sectionTitle}>Available Specialists Near You ({filteredPros.length})</Text>

        {filteredPros.map((pro) => (
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
    backgroundColor: '#070A12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#070A12',
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
    fontSize: 22,
    marginTop: -2,
  },
  headerMeta: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 11,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1523',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 45, 0.3)',
    padding: 16,
    marginBottom: 16,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  expressTag: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  expressTagText: {
    color: '#FF7A59',
    fontSize: 9.5,
    fontWeight: '900',
  },
  bannerHeadline: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  bannerSubline: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  heroEmojiCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBigEmoji: {
    fontSize: 28,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#0F1523',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  activeFilterChip: {
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
    borderColor: '#FF4D2D',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  activeFilterText: {
    color: '#FF4D2D',
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  proCard: {
    backgroundColor: '#0F1523',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
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
    borderColor: '#0F1523',
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
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
    marginTop: 12,
  },
  visitingLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
  },
  proPrice: {
    color: '#FF4D2D',
    fontSize: 18,
    fontWeight: '900',
  },
  proOldPrice: {
    color: '#64748B',
    fontSize: 12.5,
    textDecorationLine: 'line-through',
  },
  bookBtn: {
    backgroundColor: '#FF4D2D',
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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const PROS_DATA = [
  {
    id: 'p1',
    name: 'Ramesh Sharma',
    specialty: 'Master Specialist',
    rating: 4.9,
    reviews: 142,
    jobsDone: '450+ jobs',
    price: 399,
    experience: '8 yrs exp',
    verified: true,
    image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
    skills: ['Emergency Repair', 'Precision Tools', 'Same-day Fix'],
  },
  {
    id: 'p2',
    name: 'Sunil Verma',
    specialty: 'Certified Professional',
    rating: 5.0,
    reviews: 98,
    jobsDone: '320+ jobs',
    price: 499,
    experience: '6 yrs exp',
    verified: true,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    skills: ['Police Verified', 'High Satisfaction', 'Clean Work'],
  },
  {
    id: 'p3',
    name: 'Amit Patel',
    specialty: 'Senior Expert',
    rating: 4.8,
    reviews: 210,
    jobsDone: '600+ jobs',
    price: 349,
    experience: '10 yrs exp',
    verified: true,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    skills: ['Warranty Included', 'Fast Arrival', 'Genuine Parts'],
  },
];

export default function CategoryDetailsScreen({ route, navigation }) {
  const { category } = route.params || { category: { name: 'Service', icon: '⚡' } };
  const [selectedPro, setSelectedPro] = useState(null);

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
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{category.icon} {category.name}</Text>
          <Text style={styles.headerSub}>Top verified experts in Indore</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Chip */}
        <View style={styles.trustBanner}>
          <Text style={styles.trustBannerText}>
            🛡️ 100% Background Verified • Instant 30-Min Arrival • Helper Guarantee
          </Text>
        </View>

        <Text style={styles.sectionHeading}>Available Professionals ({PROS_DATA.length})</Text>

        {PROS_DATA.map((pro) => (
          <View key={pro.id} style={styles.proCard}>
            <View style={styles.proRow}>
              <View style={styles.proAvatarWrap}>
                <Image source={{ uri: pro.image }} style={styles.proAvatar} />
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                </View>
              </View>

              <View style={styles.proMeta}>
                <View style={styles.nameRow}>
                  <Text style={styles.proName}>{pro.name}</Text>
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingText}>★ {pro.rating}</Text>
                  </View>
                </View>

                <Text style={styles.proSpecialty}>{pro.specialty} • {pro.experience}</Text>
                <Text style={styles.proJobsDone}>{pro.jobsDone} completed</Text>

                <View style={styles.skillsRow}>
                  {pro.skills.map((skill, idx) => (
                    <View key={idx} style={styles.skillChip}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Price & Action Row */}
            <View style={styles.actionRow}>
              <View>
                <Text style={styles.visitingFeeLabel}>STARTING VISITING FEE</Text>
                <Text style={styles.proPrice}>₹{pro.price}</Text>
              </View>

              <TouchableOpacity style={styles.bookBtn} onPress={() => handleBook(pro)}>
                <Text style={styles.bookBtnText}>Book Now ➔</Text>
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
  backText: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 28,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  trustBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  trustBannerText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  proCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 14,
    marginBottom: 14,
  },
  proRow: {
    flexDirection: 'row',
    gap: 12,
  },
  proAvatarWrap: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  proAvatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.darkCard,
  },
  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  proMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ratingPill: {
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
  proSpecialty: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  proJobsDone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  skillChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skillText: {
    color: '#CBD5E1',
    fontSize: 9.5,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: 10,
    marginTop: 12,
  },
  visitingFeeLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
  proPrice: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
});

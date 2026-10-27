import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { AppContext } from '../../context/AppContext';
import { openImagePicker } from '../../utils/imagePickerHelper';

const PRESET_BANNER_IMAGES = [
  { name: 'AC Foam Jet', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=900' },
  { name: 'Home Sanitization', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=900' },
  { name: 'Electrician Pro', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=900' },
  { name: 'Plumber Leak Fix', url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=900' },
  { name: 'Wood Carpentry', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=900' },
  { name: 'Home Painting', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=900' },
];

export default function AdminBannersTab() {
  const { heroBanners, addHeroBanner, updateHeroBanner, deleteHeroBanner, primaryColor } =
    useContext(AppContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('MOST BOOKED');
  const [tag, setTag] = useState('⚡ 15-MIN ARRIVAL');
  const [image, setImage] = useState(PRESET_BANNER_IMAGES[0].url);
  const [price, setPrice] = useState('499');
  const [originalPrice, setOriginalPrice] = useState('799');

  const openAddModal = () => {
    setEditingBannerId(null);
    setTitle('');
    setSubtitle('');
    setBadge('MOST BOOKED');
    setTag('⚡ 15-MIN ARRIVAL');
    setImage(PRESET_BANNER_IMAGES[0].url);
    setPrice('499');
    setOriginalPrice('799');
    setModalVisible(true);
  };

  const openEditModal = (b) => {
    setEditingBannerId(b.id);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setBadge(b.badge || 'SPECIAL');
    setTag(b.tag || '⚡ POPULAR');
    setImage(b.image || PRESET_BANNER_IMAGES[0].url);
    setPrice(String(b.price || ''));
    setOriginalPrice(String(b.originalPrice || ''));
    setModalVisible(true);
  };

  const handleSaveBanner = async () => {
    if (!title.trim() || !image.trim()) {
      Alert.alert('Required', 'Please enter a banner title and image URL.');
      return;
    }

    const bannerData = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      badge: badge.trim(),
      tag: tag.trim(),
      image: image.trim(),
      price: Number(price) || 0,
      originalPrice: Number(originalPrice) || 0,
      active: true,
    };

    if (editingBannerId) {
      await updateHeroBanner(editingBannerId, bannerData);
      Alert.alert('Updated! ✅', 'Banner updated in mobile app.');
    } else {
      await addHeroBanner(bannerData);
      Alert.alert('Added! 🎉', 'New banner published to Home Screen.');
    }
    setModalVisible(false);
  };

  const handleDelete = (id, bannerTitle) => {
    Alert.alert('Delete Banner?', `Remove "${bannerTitle}" from home slider?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHeroBanner(id);
        },
      },
    ]);
  };

  const handleToggleActive = async (b) => {
    await updateHeroBanner(b.id, { active: !b.active });
  };

  return (
    <View style={styles.container}>
      {/* Top Header Row with Add Button */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topHeading}>HOME SLIDER BANNERS</Text>
          <Text style={styles.topSub}>{(heroBanners || []).length} active carousel banners</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBannerBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
          activeOpacity={0.85}
          onPress={openAddModal}
        >
          <Text style={styles.addBannerBtnText}>+ Add Banner</Text>
        </TouchableOpacity>
      </View>

      {/* List of Banners */}
      <FlatList
        data={heroBanners || []}
        keyExtractor={(item) => item.id || String(Math.random())}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.bannerCard}>
            <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
            
            <View style={styles.bannerInfo}>
              <View style={styles.bannerTagsRow}>
                <View style={[styles.badgePill, { backgroundColor: primaryColor || '#FF4D2D' }]}>
                  <Text style={styles.badgeText}>{item.badge || 'OFFER'}</Text>
                </View>
                <Text style={styles.tagText}>{item.tag || '⚡ SPECIAL'}</Text>
                <TouchableOpacity
                  style={[styles.statusToggle, item.active ? styles.statusActive : styles.statusInactive]}
                  onPress={() => handleToggleActive(item)}
                >
                  <Text style={styles.statusToggleText}>{item.active !== false ? 'ACTIVE 🟢' : 'PAUSED ⚪'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.bannerTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.bannerSubtitle} numberOfLines={1}>{item.subtitle}</Text>

              <View style={styles.bannerBottomRow}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text style={styles.bannerPrice}>₹{item.price}</Text>
                  {item.originalPrice ? <Text style={styles.bannerOriginalPrice}>₹{item.originalPrice}</Text> : null}
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEditModal(item)}
                  >
                    <Text style={styles.editBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id, item.title)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 36 }}>🖼️</Text>
            <Text style={styles.emptyTitle}>No banners added yet</Text>
            <Text style={styles.emptySub}>Tap "+ Add Banner" to add an offer slider to home screen.</Text>
          </View>
        }
      />

      {/* Add / Edit Banner Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBannerId ? '✏️ Edit Banner' : '✨ Add New Home Banner'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Live Preview */}
              <Text style={styles.label}>LIVE BANNER PREVIEW</Text>
              <View style={styles.previewBox}>
                <Image source={{ uri: image }} style={styles.previewBoxImg} resizeMode="cover" />
                <View style={styles.previewOverlay}>
                  <Text style={styles.previewBoxTitle} numberOfLines={1}>{title || 'Banner Title'}</Text>
                  <Text style={styles.previewBoxSub} numberOfLines={1}>{subtitle || 'Subtitle / guarantee line'}</Text>
                </View>
              </View>

              <Text style={styles.label}>BANNER TITLE *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. AC Jet Foam Servicing"
                placeholderTextColor="#64748B"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>SUBTITLE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Deep indoor coil wash & 2X cooling"
                placeholderTextColor="#64748B"
                value={subtitle}
                onChangeText={setSubtitle}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>BADGE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MOST BOOKED"
                    placeholderTextColor="#64748B"
                    value={badge}
                    onChangeText={setBadge}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>TAG</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="⚡ 15-MIN ARRIVAL"
                    placeholderTextColor="#64748B"
                    value={tag}
                    onChangeText={setTag}
                  />
                </View>
              </View>

              <Text style={styles.label}>BANNER IMAGE *</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Paste URL or upload image..."
                  placeholderTextColor="#64748B"
                  value={image}
                  onChangeText={setImage}
                />
                <TouchableOpacity
                  style={[styles.uploadBannerBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                  activeOpacity={0.85}
                  onPress={() => openImagePicker((uri) => setImage(uri))}
                >
                  <Text style={styles.uploadBannerBtnText}>📁 Upload File</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Image Presets */}
              <Text style={styles.subLabel}>Or Pick from High-Quality Presets:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {PRESET_BANNER_IMAGES.map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.presetImgChip, image === p.url && styles.presetImgChipActive]}
                    onPress={() => setImage(p.url)}
                  >
                    <Image source={{ uri: p.url }} style={styles.presetChipImg} />
                    <Text style={styles.presetChipTxt}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>OFFER PRICE (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="499"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>ORIGINAL PRICE (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="799"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                    value={originalPrice}
                    onChangeText={setOriginalPrice}
                  />
                </View>
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                  onPress={handleSaveBanner}
                >
                  <Text style={styles.submitBtnText}>
                    {editingBannerId ? 'Update Banner 💾' : 'Publish Banner 🚀'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topHeading: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  topSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  addBannerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  bannerCard: {
    backgroundColor: '#0F1523',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bannerImage: {
    width: '100%',
    height: 120,
  },
  bannerInfo: {
    padding: 12,
  },
  bannerTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  tagText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '700',
    flex: 1,
    marginLeft: 8,
  },
  statusToggle: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusInactive: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  statusToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  bannerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  bannerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  bannerPrice: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '900',
  },
  bannerOriginalPrice: {
    color: '#64748B',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  editBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  editBtnText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0F1523',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  modalClose: {
    color: '#94A3B8',
    fontSize: 18,
    padding: 4,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '800',
    marginBottom: 5,
    marginTop: 10,
  },
  subLabel: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#070A12',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#FFFFFF',
    fontSize: 13,
  },
  previewBox: {
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  previewBoxImg: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7, 10, 18, 0.85)',
    padding: 8,
  },
  previewBoxTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  previewBoxSub: {
    color: '#94A3B8',
    fontSize: 10,
  },
  presetImgChip: {
    alignItems: 'center',
    backgroundColor: '#070A12',
    borderRadius: 8,
    padding: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetImgChipActive: {
    borderColor: '#FF4D2D',
  },
  presetChipImg: {
    width: 50,
    height: 35,
    borderRadius: 4,
    marginBottom: 4,
  },
  presetChipTxt: {
    color: '#CBD5E1',
    fontSize: 9,
    fontWeight: '700',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  uploadBannerBtn: {
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

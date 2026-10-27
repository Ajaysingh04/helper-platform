import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import client from '../../api/client';
import { AppContext } from '../../context/AppContext';
import { openImagePicker } from '../../utils/imagePickerHelper';

const PRESET_CAT_IMAGES = [
  { name: 'AC', icon: '❄️', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Cleaning', icon: '🧹', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80' },
  { name: 'Electrician', icon: '⚡', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80' },
  { name: 'Plumber', icon: '🚰', url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80' },
  { name: 'Carpentry', icon: '🪚', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80' },
  { name: 'Painting', icon: '🎨', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80' },
];

export default function AdminCategoriesTab() {
  const { primaryColor } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);

  // Form
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('⚡');
  const [catImage, setCatImage] = useState(PRESET_CAT_IMAGES[0].url);
  const [catGroup, setCatGroup] = useState('Services');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await client.get('/categories');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      } else if (Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (e) {
      console.log('Error fetching categories:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCatId(null);
    setCatName('');
    setCatIcon('⚡');
    setCatImage(PRESET_CAT_IMAGES[0].url);
    setCatGroup('Services');
    setModalVisible(true);
  };

  const openEditModal = (c) => {
    setEditingCatId(c.id || c._id);
    setCatName(c.name || '');
    setCatIcon(c.icon || '⚡');
    setCatImage(c.image || PRESET_CAT_IMAGES[0].url);
    setCatGroup(c.group || 'Services');
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }

    const trimmed = catName.trim();
    // Check locally if another category has the same name
    const conflict = categories.find(
      (c) => (c.name || '').trim().toLowerCase() === trimmed.toLowerCase() && (c.id || c._id) !== editingCatId
    );
    if (conflict) {
      Alert.alert('This name is already in use', 'This name is already in use. Please choose a different category name.');
      return;
    }

    const payload = {
      name: trimmed,
      icon: catIcon.trim() || '⚡',
      image: catImage.trim(),
      group: catGroup.trim() || 'Services',
      active: true,
    };

    try {
      if (editingCatId) {
        await client.put(`/categories/${editingCatId}`, payload);
        Alert.alert('Updated! ✅', `Category "${trimmed}" updated.`);
      } else {
        await client.post('/categories', payload);
        Alert.alert('Created! 🎉', `New category "${trimmed}" added.`);
      }
      setModalVisible(false);
      fetchCategories();
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      if (msg && msg.toLowerCase().includes('already in use')) {
        Alert.alert('This name is already in use', 'This name is already in use. Please choose a different category name.');
      } else {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleDeleteCategory = (catId, name) => {
    Alert.alert('Delete Category?', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/categories/${catId}`);
            setCategories((prev) => prev.filter((c) => (c.id || c._id) !== catId));
            Alert.alert('Deleted', 'Category removed.');
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Could not delete category');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topHeading}>CATEGORIES CATALOG</Text>
          <Text style={styles.topSub}>{categories.length} available service categories</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
          onPress={openAddModal}
        >
          <Text style={styles.addBtnText}>+ Add Category</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator color={primaryColor || '#FF4D2D'} size="large" />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item, idx) => item.id || item._id || String(idx)}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.catCard}>
              <View style={styles.catCardLeft}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.catImage} />
                ) : (
                  <View style={styles.catIconWrap}>
                    <Text style={{ fontSize: 22 }}>{item.icon || '🛠️'}</Text>
                  </View>
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 16 }}>{item.icon || '🛠️'}</Text>
                    <Text style={styles.catName} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text style={styles.catMeta}>
                    {item.group || 'Services'} • {item.count || 'Active'}
                  </Text>
                </View>
              </View>

              <View style={styles.catActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.delBtn}
                  onPress={() => handleDeleteCategory(item.id || item._id, item.name)}
                >
                  <Text style={styles.delBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add / Edit Category Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCatId ? '✏️ Edit Category' : '✨ Add New Category'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Live Preview */}
              <Text style={styles.label}>CATEGORY PREVIEW</Text>
              <View style={styles.catPreviewCard}>
                {catImage ? (
                  <Image source={{ uri: catImage }} style={styles.previewCatImg} />
                ) : null}
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontSize: 20 }}>{catIcon}</Text>
                  <Text style={styles.previewCatName}>{catName || 'Category Title'}</Text>
                </View>
              </View>

              <Text style={styles.label}>CATEGORY NAME *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. AC Repair & Servicing"
                placeholderTextColor="#64748B"
                value={catName}
                onChangeText={setCatName}
              />

              <Text style={styles.label}>EMOJI ICON</Text>
              <TextInput
                style={styles.input}
                placeholder="❄️, 🧹, ⚡, 🚰, 🎨, 🪚"
                placeholderTextColor="#64748B"
                value={catIcon}
                onChangeText={setCatIcon}
              />

              <Text style={styles.label}>CATEGORY IMAGE</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Paste URL or upload image..."
                  placeholderTextColor="#64748B"
                  value={catImage}
                  onChangeText={setCatImage}
                />
                <TouchableOpacity
                  style={[styles.uploadCatBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                  activeOpacity={0.85}
                  onPress={() => openImagePicker((uri) => setCatImage(uri))}
                >
                  <Text style={styles.uploadCatBtnText}>📁 Upload File</Text>
                </TouchableOpacity>
              </View>

              {/* Presets */}
              <Text style={styles.subLabel}>Or Pick from Presets:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {PRESET_CAT_IMAGES.map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.presetChip, catImage === p.url && styles.presetChipActive]}
                    onPress={() => {
                      setCatImage(p.url);
                      setCatIcon(p.icon);
                      if (!catName) setCatName(p.name);
                    }}
                  >
                    <Image source={{ uri: p.url }} style={styles.presetChipImg} />
                    <Text style={styles.presetChipTxt}>{p.icon} {p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>GROUP / SECTION</Text>
              <TextInput
                style={styles.input}
                placeholder="Services, Home, Repairs, Cleaning"
                placeholderTextColor="#64748B"
                value={catGroup}
                onChangeText={setCatGroup}
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                  onPress={handleSaveCategory}
                >
                  <Text style={styles.submitBtnText}>
                    {editingCatId ? 'Save Changes 💾' : 'Create Category 🚀'}
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
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1523',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  catCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  catImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  catMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  catActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  delBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  delBtnText: {
    color: '#EF4444',
    fontSize: 12,
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
  catPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070A12',
    padding: 10,
    borderRadius: 10,
  },
  previewCatImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  previewCatName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  presetChip: {
    alignItems: 'center',
    backgroundColor: '#070A12',
    borderRadius: 8,
    padding: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetChipActive: {
    borderColor: '#FF4D2D',
  },
  presetChipImg: {
    width: 45,
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
  uploadCatBtn: {
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCatBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

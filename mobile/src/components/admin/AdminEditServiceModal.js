import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import client from '../../api/client';
import { openImagePicker } from '../../utils/imagePickerHelper';

const PRESET_SERVICE_IMAGES = [
  { name: 'AC Foam Jet', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sanitization', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80' },
  { name: 'Electrician', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80' },
  { name: 'Plumber', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Carpentry', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80' },
  { name: 'Painting', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80' },
];

export default function AdminEditServiceModal({ visible, service, onClose, onUpdated, primaryColor }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setPrice(String(service.price || ''));
      setOriginalPrice(String(service.originalPrice || ''));
      setCategory(service.category || 'Repairs');
      setDuration(service.duration || '45 mins');
      setDescription(service.description || '');
      setImage(service.image || PRESET_SERVICE_IMAGES[0].url);
    }
  }, [service]);

  if (!service) return null;

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Required', 'Please enter title and price.');
      return;
    }

    const serviceId = service._id || service.id;
    const payload = {
      name: name.trim(),
      price: Number(price),
      originalPrice: Number(originalPrice || Number(price) * 1.3),
      category: category.trim(),
      duration: duration.trim(),
      description: description.trim(),
      image: image.trim(),
    };

    try {
      await client.put(`/services/${serviceId}`, payload);
      Alert.alert('Updated! ✅', `"${name.trim()}" details and photo updated.`);
      if (onUpdated) onUpdated();
      onClose();
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      if (msg && msg.toLowerCase().includes('already in use')) {
        Alert.alert('This name is already in use', 'This name is already in use. Please enter a different service name.');
      } else {
        Alert.alert('Error', msg || 'Could not update service');
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>✏️ Edit Service & Photo</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Live Image Preview */}
            <Text style={styles.label}>PHOTO PREVIEW</Text>
            <View style={styles.previewBox}>
              <Image source={{ uri: image }} style={styles.previewImg} resizeMode="cover" />
              <View style={styles.previewOverlay}>
                <Text style={styles.previewName}>{name || 'Service Title'}</Text>
                <Text style={styles.previewPrice}>₹{price || '0'}</Text>
              </View>
            </View>

            <Text style={styles.label}>SERVICE IMAGE URL</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Paste URL or upload image..."
                placeholderTextColor="#64748B"
                value={image}
                onChangeText={setImage}
              />
              <TouchableOpacity
                style={[styles.uploadBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                activeOpacity={0.85}
                onPress={() => openImagePicker((uri) => setImage(uri))}
              >
                <Text style={styles.uploadBtnText}>📁 Upload File</Text>
              </TouchableOpacity>
            </View>

            {/* Presets */}
            <Text style={styles.subLabel}>Or Pick from Presets:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {PRESET_SERVICE_IMAGES.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetChip, image === p.url && styles.presetChipActive]}
                  onPress={() => setImage(p.url)}
                >
                  <Image source={{ uri: p.url }} style={styles.presetChipImg} />
                  <Text style={styles.presetChipTxt}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>SERVICE TITLE *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Electrician - Wiring & Switchboard"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>PRICE (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="249"
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
                  placeholder="399"
                  placeholderTextColor="#64748B"
                  keyboardType="number-pad"
                  value={originalPrice}
                  onChangeText={setOriginalPrice}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CATEGORY</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repairs, Cleaning, etc."
                  placeholderTextColor="#64748B"
                  value={category}
                  onChangeText={setCategory}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>DURATION</Text>
                <TextInput
                  style={styles.input}
                  placeholder="45 mins"
                  placeholderTextColor="#64748B"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
            </View>

            <Text style={styles.label}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="Service description and warranty details..."
              placeholderTextColor="#64748B"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: primaryColor || '#FF4D2D' }]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Save Changes 💾</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#0F1523',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  close: {
    color: '#94A3B8',
    fontSize: 18,
    padding: 4,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 10.5,
    fontWeight: '800',
    marginBottom: 5,
    marginTop: 8,
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
    marginBottom: 6,
  },
  previewImg: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  previewPrice: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 8,
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
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
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
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  uploadBtn: {
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

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
  ActivityIndicator,
} from 'react-native';
import { AppContext } from '../../context/AppContext';
import { openImagePicker } from '../../utils/imagePickerHelper';

const PRESET_COLORS = [
  { name: 'Electric Orange', hex: '#FF4D2D' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Violet Purple', hex: '#8B5CF6' },
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Cyan Teal', hex: '#06B6D4' },
  { name: 'Midnight Indigo', hex: '#4F46E5' },
];

const PRESET_LOGOS = [
  { name: 'Clean Pro', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=140&q=80' },
  { name: 'Electric Spark', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=140&q=80' },
  { name: 'Gold Shield', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=140&q=80' },
  { name: 'Tool Master', url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=140&q=80' },
];

export default function AdminBrandingTab() {
  const { appName, appLogo, primaryColor, updateSettings } = useContext(AppContext);

  const [name, setName] = useState(appName || 'Helper');
  const [logoUrl, setLogoUrl] = useState(appLogo || '');
  const [selectedColor, setSelectedColor] = useState(primaryColor || '#FF4D2D');
  const [customHex, setCustomHex] = useState(primaryColor || '#FF4D2D');
  const [saving, setSaving] = useState(false);

  const handleSelectColor = (hex) => {
    setSelectedColor(hex);
    setCustomHex(hex);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter an App Name.');
      return;
    }
    setSaving(true);
    try {
      const res = await updateSettings({
        appName: name.trim(),
        appLogo: logoUrl.trim(),
        primaryColor: selectedColor,
      });

      if (res?.success !== false) {
        Alert.alert(
          'Branding Updated! 🎉',
          `App name set to "${name.trim()}" and Theme Color updated across the app!`
        );
      } else {
        Alert.alert('Error', res?.error || 'Could not update branding');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Info */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🎨 APP BRANDING & VISUAL IDENTITY</Text>
        <Text style={styles.sectionSub}>Change app name, logo image, and theme color live</Text>
      </View>

      {/* Live Preview Card */}
      <View style={[styles.previewCard, { borderColor: selectedColor }]}>
        <Text style={styles.previewCardLabel}>LIVE APP HEADER PREVIEW</Text>
        <View style={styles.previewHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.previewLogoImg} resizeMode="cover" />
            ) : (
              <View style={[styles.previewLogoPlaceholder, { backgroundColor: selectedColor }]}>
                <Text style={{ fontSize: 16 }}>🛠️</Text>
              </View>
            )}
            <Text style={styles.previewAppName}>{name.toUpperCase() || 'APP NAME'}</Text>
            <View style={[styles.previewBadge, { backgroundColor: selectedColor }]}>
              <Text style={styles.previewBadgeText}>PRO</Text>
            </View>
          </View>
          <View style={[styles.previewActionButton, { backgroundColor: selectedColor }]}>
            <Text style={styles.previewActionBtnText}>Book Now</Text>
          </View>
        </View>
      </View>

      {/* App Name Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>APP DISPLAY NAME *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Helper, UrbanFix, QuickPro"
          placeholderTextColor="#64748B"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* App Logo URL Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>APP LOGO IMAGE</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Paste URL or upload..."
            placeholderTextColor="#64748B"
            value={logoUrl}
            onChangeText={setLogoUrl}
          />
          <TouchableOpacity
            style={[styles.uploadFileBtn, { backgroundColor: selectedColor }]}
            activeOpacity={0.85}
            onPress={() => openImagePicker((uri) => setLogoUrl(uri))}
          >
            <Text style={styles.uploadFileBtnText}>📁 Upload File</Text>
          </TouchableOpacity>
        </View>

        {/* Preset Logo Quick Select */}
        <Text style={styles.presetSubLabel}>Or Choose a Premium Preset Logo:</Text>
        <View style={styles.presetLogoRow}>
          {PRESET_LOGOS.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.presetLogoItem, logoUrl === p.url && styles.presetLogoItemActive]}
              onPress={() => setLogoUrl(p.url)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: p.url }} style={styles.presetThumbnail} />
              <Text style={styles.presetLogoName} numberOfLines={1}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Theme Color Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>PRIMARY THEME COLOR</Text>
        <Text style={styles.presetSubLabel}>Select a curated theme color for buttons & highlights:</Text>

        <View style={styles.colorPaletteGrid}>
          {PRESET_COLORS.map((c) => {
            const isSelected = selectedColor.toLowerCase() === c.hex.toLowerCase();
            return (
              <TouchableOpacity
                key={c.hex}
                style={[
                  styles.colorChip,
                  isSelected && styles.colorChipSelected,
                ]}
                activeOpacity={0.85}
                onPress={() => handleSelectColor(c.hex)}
              >
                <View style={[styles.colorCircle, { backgroundColor: c.hex }]} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.colorName}>{c.name}</Text>
                  <Text style={styles.colorHex}>{c.hex}</Text>
                </View>
                {isSelected && <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Hex Color Input */}
        <View style={styles.customHexRow}>
          <Text style={styles.customHexLabel}>Custom Hex:</Text>
          <TextInput
            style={styles.customHexInput}
            placeholder="#FF4D2D"
            placeholderTextColor="#64748B"
            value={customHex}
            onChangeText={(txt) => {
              setCustomHex(txt);
              if (txt.startsWith('#') && (txt.length === 7 || txt.length === 4)) {
                setSelectedColor(txt);
              }
            }}
          />
          <View style={[styles.customHexColorPreview, { backgroundColor: selectedColor }]} />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: selectedColor }]}
        activeOpacity={0.85}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>Save Branding Changes 🚀</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sectionSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },
  previewCard: {
    backgroundColor: '#0F1523',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  previewCardLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#070A12',
    padding: 10,
    borderRadius: 10,
  },
  previewLogoImg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 8,
  },
  previewLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAppName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  previewBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  previewActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  previewActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  presetSubLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 8,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#0F1523',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#FFFFFF',
    fontSize: 13,
  },
  presetLogoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetLogoItem: {
    flex: 1,
    backgroundColor: '#0F1523',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetLogoItemActive: {
    borderColor: '#FF4D2D',
    backgroundColor: 'rgba(255, 77, 45, 0.15)',
  },
  presetThumbnail: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginBottom: 4,
  },
  presetLogoName: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  colorPaletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1523',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  colorChipSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#1E293B',
  },
  colorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  colorName: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  colorHex: {
    color: '#64748B',
    fontSize: 10,
  },
  customHexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  customHexLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  customHexInput: {
    flex: 1,
    backgroundColor: '#0F1523',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    color: '#FFFFFF',
    fontSize: 13,
  },
  customHexColorPreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  uploadFileBtn: {
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadFileBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

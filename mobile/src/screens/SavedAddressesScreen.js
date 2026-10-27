import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { AppContext } from '../context/AppContext';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const DEFAULT_ADDRESSES = [
  {
    id: 'addr-1',
    tag: 'Home',
    icon: '🏠',
    name: 'Ajay Singh',
    phone: '+91 7389451349',
    flat: 'Flat 402, Royal Palms',
    street: 'Vijay Nagar, Near Scheme 54',
    city: 'Indore',
    pincode: '452010',
    landmark: 'Opposite C21 Mall',
    isDefault: true,
  },
  {
    id: 'addr-2',
    tag: 'Office',
    icon: '🏢',
    name: 'Ajay Singh (Office)',
    phone: '+91 7389451349',
    flat: 'Tower B, 3rd Floor',
    street: 'Crystal IT Park, Ring Road',
    city: 'Indore',
    pincode: '452001',
    landmark: 'Next to Tech Hub',
    isDefault: false,
  },
];

const TAG_OPTIONS = [
  { label: 'Home', icon: '🏠' },
  { label: 'Office', icon: '🏢' },
  { label: 'Parents', icon: '🏡' },
  { label: 'Other', icon: '📍' },
];

export default function SavedAddressesScreen({ navigation }) {
  const { primaryColor } = useContext(AppContext);
  const { setBookingAddress } = useContext(CartContext);
  const { currentUser } = useContext(AuthContext);
  const activeColor = primaryColor || colors.primary;

  const [addresses, setAddresses] = useState(DEFAULT_ADDRESSES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form States
  const [tag, setTag] = useState('Home');
  const [name, setName] = useState(currentUser?.name || 'Ajay Singh');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 7389451349');
  const [flat, setFlat] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Indore');
  const [pincode, setPincode] = useState('452010');
  const [landmark, setLandmark] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);

  // Load from Storage
  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const raw = await AsyncStorage.getItem('helper_saved_addresses');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
        }
      }
    } catch (e) {
      console.log('Error loading saved addresses', e);
    }
  };

  const saveToStorage = async (list) => {
    try {
      await AsyncStorage.setItem('helper_saved_addresses', JSON.stringify(list));
    } catch (e) {
      console.log('Error saving addresses to storage', e);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setTag('Home');
    setName(currentUser?.name || 'Ajay Singh');
    setPhone(currentUser?.phone || '+91 7389451349');
    setFlat('');
    setStreet('');
    setCity('Indore');
    setPincode('452010');
    setLandmark('');
    setMakeDefault(addresses.length === 0);
    setModalVisible(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr.id);
    setTag(addr.tag || 'Home');
    setName(addr.name || '');
    setPhone(addr.phone || '');
    setFlat(addr.flat || '');
    setStreet(addr.street || '');
    setCity(addr.city || 'Indore');
    setPincode(addr.pincode || '');
    setLandmark(addr.landmark || '');
    setMakeDefault(addr.isDefault || false);
    setModalVisible(true);
  };

  const handleSaveAddress = () => {
    if (!flat.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert('Incomplete Address', 'Please fill in flat, street, city and pincode.');
      return;
    }

    const selectedTagObj = TAG_OPTIONS.find((t) => t.label === tag) || TAG_OPTIONS[0];

    let updatedList = [...addresses];

    if (editingId) {
      updatedList = updatedList.map((addr) => {
        if (addr.id === editingId) {
          return {
            ...addr,
            tag,
            icon: selectedTagObj.icon,
            name: name.trim() || 'Ajay Singh',
            phone: phone.trim() || '+91 7389451349',
            flat: flat.trim(),
            street: street.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
            landmark: landmark.trim(),
            isDefault: makeDefault ? true : addr.isDefault,
          };
        }
        return makeDefault ? { ...addr, isDefault: false } : addr;
      });
    } else {
      const newAddr = {
        id: `addr-${Date.now()}`,
        tag,
        icon: selectedTagObj.icon,
        name: name.trim() || 'Ajay Singh',
        phone: phone.trim() || '+91 7389451349',
        flat: flat.trim(),
        street: street.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        landmark: landmark.trim(),
        isDefault: makeDefault || addresses.length === 0,
      };

      if (newAddr.isDefault) {
        updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
      }
      updatedList.unshift(newAddr);
    }

    setAddresses(updatedList);
    saveToStorage(updatedList);

    // Sync default address with CartContext
    const currentDefault = updatedList.find((a) => a.isDefault);
    if (currentDefault && setBookingAddress) {
      setBookingAddress({
        street: `${currentDefault.flat}, ${currentDefault.street}`,
        city: currentDefault.city,
        pincode: currentDefault.pincode,
        type: currentDefault.tag,
      });
    }

    setModalVisible(false);
    Alert.alert('Saved! 📍', editingId ? 'Address updated successfully.' : 'New address added successfully.');
  };

  const handleSetDefault = (addrId) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addrId,
    }));
    setAddresses(updated);
    saveToStorage(updated);

    const picked = updated.find((a) => a.id === addrId);
    if (picked && setBookingAddress) {
      setBookingAddress({
        street: `${picked.flat}, ${picked.street}`,
        city: picked.city,
        pincode: picked.pincode,
        type: picked.tag,
      });
    }
  };

  const handleDeleteAddress = (addrId) => {
    if (addresses.length <= 1) {
      Alert.alert('Cannot Delete', 'You need at least one saved address for home service bookings.');
      return;
    }
    Alert.alert('Delete Address?', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete 🗑️',
        style: 'destructive',
        onPress: () => {
          const filtered = addresses.filter((a) => a.id !== addrId);
          if (!filtered.some((a) => a.isDefault) && filtered.length > 0) {
            filtered[0].isDefault = true;
          }
          setAddresses(filtered);
          saveToStorage(filtered);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity
          style={[styles.addHeaderBtn, { backgroundColor: activeColor }]}
          activeOpacity={0.8}
          onPress={openAddModal}
        >
          <Text style={styles.addHeaderText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Manage service locations for instant 1-tap bookings
        </Text>

        {addresses.map((addr) => (
          <View
            key={addr.id}
            style={[
              styles.addressCard,
              addr.isDefault && { borderColor: `${activeColor}80`, backgroundColor: 'rgba(255, 77, 45, 0.04)' },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.tagWrap}>
                <Text style={styles.tagIcon}>{addr.icon || '📍'}</Text>
                <Text style={styles.tagLabel}>{addr.tag}</Text>
              </View>
              {addr.isDefault ? (
                <View style={[styles.defaultBadge, { backgroundColor: `${activeColor}20` }]}>
                  <Text style={[styles.defaultBadgeText, { color: activeColor }]}>★ DEFAULT</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.makeDefaultBtn}
                  activeOpacity={0.7}
                  onPress={() => handleSetDefault(addr.id)}
                >
                  <Text style={styles.makeDefaultText}>Set Default</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.residentName}>{addr.name}</Text>
              <Text style={styles.addressLine}>
                {addr.flat}, {addr.street}
              </Text>
              {addr.landmark ? (
                <Text style={styles.landmarkLine}>Landmark: {addr.landmark}</Text>
              ) : null}
              <Text style={styles.cityPincode}>
                {addr.city} - {addr.pincode}
              </Text>
              <Text style={styles.phoneLine}>📞 {addr.phone}</Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.7}
                onPress={() => openEditModal(addr)}
              >
                <Text style={styles.actionText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteActionBtn]}
                activeOpacity={0.7}
                onPress={() => handleDeleteAddress(addr.id)}
              >
                <Text style={styles.deleteActionText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Big Add Button */}
        <TouchableOpacity
          style={[styles.bigAddBtn, { borderColor: `${activeColor}60` }]}
          activeOpacity={0.8}
          onPress={openAddModal}
        >
          <Text style={[styles.bigAddIcon, { color: activeColor }]}>＋</Text>
          <Text style={[styles.bigAddText, { color: activeColor }]}>Add Another Location</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add / Edit Address Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Tag Selector */}
              <Text style={styles.inputLabel}>ADDRESS TYPE</Text>
              <View style={styles.tagSelectorRow}>
                {TAG_OPTIONS.map((t) => {
                  const isPicked = tag === t.label;
                  return (
                    <TouchableOpacity
                      key={t.label}
                      style={[
                        styles.tagChoice,
                        isPicked && { borderColor: activeColor, backgroundColor: `${activeColor}20` },
                      ]}
                      onPress={() => setTag(t.label)}
                    >
                      <Text style={styles.tagChoiceIcon}>{t.icon}</Text>
                      <Text
                        style={[
                          styles.tagChoiceLabel,
                          isPicked && { color: '#FFFFFF', fontWeight: '800' },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Flat / House */}
              <Text style={styles.inputLabel}>HOUSE / FLAT / BUILDING *</Text>
              <TextInput
                style={styles.modalInput}
                value={flat}
                onChangeText={setFlat}
                placeholder="e.g. Flat 301, Sunshine Heights"
                placeholderTextColor="#64748B"
              />

              {/* Street / Area */}
              <Text style={styles.inputLabel}>STREET / COLONY / AREA *</Text>
              <TextInput
                style={styles.modalInput}
                value={street}
                onChangeText={setStreet}
                placeholder="e.g. 54 Scheme, Vijay Nagar"
                placeholderTextColor="#64748B"
              />

              {/* Landmark */}
              <Text style={styles.inputLabel}>LANDMARK (OPTIONAL)</Text>
              <TextInput
                style={styles.modalInput}
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g. Behind C21 Mall"
                placeholderTextColor="#64748B"
              />

              {/* City and Pincode */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CITY *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Indore"
                    placeholderTextColor="#64748B"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>PINCODE *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="452010"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Contact Name and Phone */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CONTACT NAME</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Name"
                    placeholderTextColor="#64748B"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CONTACT PHONE</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Mobile"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: activeColor }]}
                activeOpacity={0.85}
                onPress={handleSaveAddress}
              >
                <Text style={styles.modalSaveText}>
                  {editingId ? 'Update Address' : 'Save Address 📍'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    backgroundColor: '#090D16',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  addHeaderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addHeaderText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginBottom: 16,
    fontWeight: '500',
  },
  addressCard: {
    backgroundColor: colors.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDark,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  tagIcon: {
    fontSize: 14,
  },
  tagLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  makeDefaultBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  makeDefaultText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '700',
  },
  cardBody: {
    marginBottom: 12,
  },
  residentName: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  addressLine: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  landmarkLine: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  cityPincode: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '600',
  },
  phoneLine: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: 10,
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteActionBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteActionText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  bigAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 6,
  },
  bigAddIcon: {
    fontSize: 20,
    fontWeight: '900',
  },
  bigAddText: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
  },
  modalScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 10,
  },
  tagSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tagChoice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tagChoiceIcon: {
    fontSize: 14,
  },
  tagChoiceLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  modalSaveBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});

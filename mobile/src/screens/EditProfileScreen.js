import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { openImagePicker, pickFromCamera, pickFromGallery } from '../utils/imagePickerHelper';

export default function EditProfileScreen({ navigation }) {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const { primaryColor, themeColors, t, language } = useContext(AppContext);
  const activeColor = primaryColor || '#FF4D2D';
  const isDark = themeColors?.isDark !== false;

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [userPhoto, setUserPhoto] = useState(currentUser?.photo || currentUser?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const saveBtnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(language === 'hi' ? 'नाम अनिवार्य है' : 'Required Field', language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert(language === 'hi' ? 'मोबाइल अनिवार्य है' : 'Required Field', language === 'hi' ? 'कृपया अपना मोबाइल नंबर दर्ज करें।' : 'Please enter your mobile number.');
      return;
    }

    Animated.sequence([
      Animated.timing(saveBtnScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(saveBtnScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        bio: bio.trim(),
        photo: userPhoto,
        avatar: userPhoto,
      });

      Alert.alert(
        t('profileUpdated'),
        language === 'hi' ? 'आपकी प्रोफाइल जानकारी सफलतापूर्वक सुरक्षित हो गई है।' : 'Your profile details have been saved successfully.',
        [
          {
            text: language === 'hi' ? 'ठीक है 👍' : 'Great 👍',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      Alert.alert(language === 'hi' ? 'सहेजने में त्रुटि' : 'Save Failed', language === 'hi' ? 'प्रोफाइल अपडेट नहीं हो सकी। कृपया पुनः प्रयास करें।' : 'Could not update your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const dynamic = {
    container: { backgroundColor: themeColors.bg },
    header: { backgroundColor: themeColors.headerBg, borderBottomColor: themeColors.border },
    headerTitle: { color: themeColors.text },
    backBtn: { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
    backArrow: { color: themeColors.text },
    card: { backgroundColor: themeColors.card, borderColor: themeColors.border },
    sectionTitle: { color: themeColors.textMuted },
    inputLabel: { color: themeColors.textSecondary },
    inputBox: { backgroundColor: themeColors.inputBg, borderColor: themeColors.border },
    textInput: { color: themeColors.text },
  };

  return (
    <SafeAreaView style={[styles.container, dynamic.container]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, dynamic.header]}>
        <TouchableOpacity
          style={[styles.backBtn, dynamic.backBtn]}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backArrow, dynamic.backArrow]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamic.headerTitle]}>{t('editProfileHeader')}</Text>
        <Animated.View style={{ transform: [{ scale: saveBtnScale }] }}>
          <TouchableOpacity
            style={[styles.headerSaveBtn, { backgroundColor: activeColor }]}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.headerSaveText}>{isSaving ? t('savingChanges') : t('save')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Avatar & Photo Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
                    borderColor: userPhoto ? activeColor : (isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1'),
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => openImagePicker((uri) => setUserPhoto(uri), { language })}
              >
                {userPhoto ? (
                  <Image source={{ uri: userPhoto }} style={styles.avatarRealPhoto} resizeMode="cover" />
                ) : (
                  <Text style={[styles.avatarInitials, { color: activeColor }]}>
                    {name
                      ? name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'AS'}
                  </Text>
                )}
                <View style={[styles.cameraBadge, { backgroundColor: activeColor }]}>
                  <Text style={styles.cameraBadgeIcon}>📷</Text>
                </View>
              </TouchableOpacity>

              <Text style={[styles.photoTitleText, { color: themeColors.text }]}>
                {userPhoto
                  ? (language === 'hi' ? 'प्रोफाइल फोटो सुरक्षित है ✓' : 'Profile Photo Added ✓')
                  : (language === 'hi' ? 'प्रोफाइल फोटो जोड़ें' : 'Add Profile Photo')}
              </Text>
              <Text style={[styles.photoSubText, { color: themeColors.textSecondary }]}>
                {language === 'hi'
                  ? 'कैमरे से तुरंत सेल्फी लें या गैलरी से फोटो चुनें'
                  : 'Take a direct camera photo or choose from gallery'}
              </Text>

              {/* Direct Action Buttons: Camera and Gallery */}
              <View style={styles.photoActionsRow}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { backgroundColor: activeColor, borderColor: activeColor }]}
                  activeOpacity={0.8}
                  onPress={() => pickFromCamera((uri) => setUserPhoto(uri))}
                >
                  <Text style={styles.photoActionBtnPrimaryText}>
                    📷 {language === 'hi' ? 'कैमरा से लें' : 'Open Camera'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.photoActionBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                      borderColor: themeColors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => pickFromGallery((uri) => setUserPhoto(uri))}
                >
                  <Text style={[styles.photoActionBtnSecondaryText, { color: themeColors.text }]}>
                    🖼️ {language === 'hi' ? 'गैलरी' : 'Gallery'}
                  </Text>
                </TouchableOpacity>

                {userPhoto ? (
                  <TouchableOpacity
                    style={[styles.photoActionBtn, styles.removePhotoBtn]}
                    activeOpacity={0.8}
                    onPress={() => setUserPhoto('')}
                  >
                    <Text style={styles.removePhotoText}>
                      🗑️ {language === 'hi' ? 'हटाएं' : 'Remove'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Form Fields */}
            <View style={[styles.card, dynamic.card]}>
              <Text style={[styles.sectionTitle, dynamic.sectionTitle]}>{t('personalDetails')}</Text>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamic.inputLabel]}>{t('fullName')}</Text>
                <View style={[styles.inputBox, dynamic.inputBox]}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={[styles.textInput, dynamic.textInput]}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Ajay Singh"
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              {/* Mobile Number */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.inputLabel, dynamic.inputLabel]}>{t('phoneNumber')}</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                </View>
                <View style={[styles.inputBox, dynamic.inputBox]}>
                  <Text style={styles.inputIcon}>📱</Text>
                  <TextInput
                    style={[styles.textInput, dynamic.textInput]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+91 9876543210"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamic.inputLabel]}>{t('emailAddress')}</Text>
                <View style={[styles.inputBox, dynamic.inputBox]}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={[styles.textInput, dynamic.textInput]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* City / Location */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamic.inputLabel]}>{t('cityState')}</Text>
                <View style={[styles.inputBox, dynamic.inputBox]}>
                  <Text style={styles.inputIcon}>📍</Text>
                  <TextInput
                    style={[styles.textInput, dynamic.textInput]}
                    value={city}
                    onChangeText={setCity}
                    placeholder="e.g. Indore, Madhya Pradesh"
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              {/* Bio / Delivery Note */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, dynamic.inputLabel]}>{t('aboutYou')}</Text>
                <View style={[styles.inputBox, styles.textAreaBox, dynamic.inputBox]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea, dynamic.textInput]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="e.g. Available after 5 PM, ring bell twice..."
                    placeholderTextColor="#64748B"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.largeSaveBtn, { backgroundColor: activeColor }]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.largeSaveText}>
                {isSaving ? t('savingChanges') : t('saveChanges')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  headerSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarRealPhoto: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#090D16',
    elevation: 4,
  },
  cameraBadgeIcon: {
    fontSize: 13,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  photoTitleText: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  photoSubText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
    marginBottom: 14,
    textAlign: 'center',
  },
  photoActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  photoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    elevation: 2,
  },
  photoActionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  photoActionBtnSecondaryText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  removePhotoBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  removePhotoText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 12,
  },
  textAreaBox: {
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
  largeSaveBtn: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  largeSaveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});

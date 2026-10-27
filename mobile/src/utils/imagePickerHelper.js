import { Alert, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const getAppLanguage = async (providedLang) => {
  if (providedLang) return providedLang;
  try {
    const saved = await AsyncStorage.getItem('@helper_language');
    if (saved && (saved.startsWith('hi') || saved.includes('हिन्दी'))) return 'hi';
  } catch (e) {}
  return 'en';
};

/**
 * Request runtime camera permission on Android devices
 */
export const requestCameraPermission = async (language = 'en') => {
  if (Platform.OS !== 'android') return true;

  try {
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (alreadyGranted) return true;

    const isHi = language === 'hi';
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: isHi ? 'कैमरा अनुमति 📷' : 'Camera Permission 📷',
        message: isHi
          ? 'फ़ोटो लेने के लिए कृपया हेल्पर ऐप को कैमरे की अनुमति प्रदान करें।'
          : 'Helper needs camera access to capture your photo.',
        buttonPositive: isHi ? 'अनुमति दें' : 'Allow',
        buttonNegative: isHi ? 'रद्द करें' : 'Cancel',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission check error:', err);
    return false;
  }
};

/**
 * Universal Image Picker
 * Allows choosing from Gallery or Camera with clean English or pure Hindi
 */
export const openImagePicker = async (onSuccess, options = {}) => {
  const lang = await getAppLanguage(options.language);
  const isHi = lang === 'hi';

  Alert.alert(
    isHi ? 'प्रोफ़ाइल फ़ोटो 📸' : 'Profile Photo 📸',
    isHi ? 'फ़ोटो का स्रोत चुनें:' : 'Choose photo source:',
    [
      {
        text: isHi ? '📷 कैमरा' : '📷 Camera',
        onPress: () => pickFromCamera(onSuccess, { ...options, language: lang }),
      },
      {
        text: isHi ? '🖼️ गैलरी' : '🖼️ Gallery / Photos',
        onPress: () => pickFromGallery(onSuccess, { ...options, language: lang }),
      },
      {
        text: isHi ? 'रद्द करें' : 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

export const pickFromGallery = async (onSuccess, options = {}) => {
  const lang = await getAppLanguage(options.language);
  const isHi = lang === 'hi';

  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.85,
      selectionLimit: 1,
      ...options,
    });

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert(
        isHi ? 'गैलरी त्रुटि' : 'Gallery Error',
        result.errorMessage || (isHi ? 'फ़ोटो का चयन नहीं हो सका।' : 'Could not select photo.')
      );
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const mime = asset.type || 'image/jpeg';
      const formattedUri = asset.base64
        ? `data:${mime};base64,${asset.base64}`
        : asset.uri;
      onSuccess(formattedUri, asset);
    }
  } catch (err) {
    Alert.alert(
      isHi ? 'त्रुटि' : 'Error',
      err.message || (isHi ? 'गैलरी खोलने में विफल।' : 'Failed to open gallery.')
    );
  }
};

export const pickFromCamera = async (onSuccess, options = {}) => {
  const lang = await getAppLanguage(options.language);
  const isHi = lang === 'hi';

  try {
    const hasPermission = await requestCameraPermission(lang);
    if (!hasPermission) {
      Alert.alert(
        isHi ? 'कैमरा अनुमति आवश्यक है' : 'Camera Access Required',
        isHi
          ? 'कृपया फ़ोन सेटिंग में जाकर कैमरा अनुमति चालू करें।'
          : 'Please enable Camera access in your phone settings to take a photo.'
      );
      return;
    }

    const cameraOptions = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.85,
      saveToPhotos: false,
      ...options,
    };

    const result = await launchCamera(cameraOptions);

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert(
        isHi ? 'कैमरा त्रुटि' : 'Camera Error',
        result.errorMessage || (isHi ? 'कैमरा शुरू करने में असमर्थ।' : 'Could not launch camera.')
      );
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const mime = asset.type || 'image/jpeg';
      const formattedUri = asset.base64
        ? `data:${mime};base64,${asset.base64}`
        : asset.uri;
      onSuccess(formattedUri, asset);
    }
  } catch (err) {
    Alert.alert(
      isHi ? 'त्रुटि' : 'Error',
      err.message || (isHi ? 'कैमरा खोलने में विफल।' : 'Failed to open camera.')
    );
  }
};

/**
 * Video Evidence Picker for Refund / Quality Dispute
 * Allows recording or picking a video of defective or incomplete work
 */
export const openVideoPicker = async (onSuccess, options = {}) => {
  const lang = await getAppLanguage(options.language);
  const isHi = lang === 'hi';

  Alert.alert(
    isHi ? 'कार्य दोष वीडियो प्रमाण 📹' : 'Work Defect Video Proof 📹',
    isHi
      ? 'कृपया अधूरा या ख़राब काम दिखाने के लिए वीडियो चुनें या रिकॉर्ड करें:'
      : 'Record or choose a video showing the improper work or defect:',
    [
      {
        text: isHi ? '🎥 नया वीडियो रिकॉर्ड करें' : '🎥 Record New Video',
        onPress: async () => {
          const hasPerm = await requestCameraPermission(lang);
          if (!hasPerm) return;
          try {
            const res = await launchCamera({
              mediaType: 'video',
              videoQuality: 'high',
              durationLimit: 120,
            });
            if (res.didCancel) return;
            if (res.assets && res.assets.length > 0) {
              onSuccess(res.assets[0]);
            }
          } catch (e) {
            Alert.alert(isHi ? 'त्रुटि' : 'Error', isHi ? 'वीडियो रिकॉर्ड नहीं हो सका।' : 'Could not record video.');
          }
        },
      },
      {
        text: isHi ? '📁 गैलरी से वीडियो चुनें' : '📁 Choose from Gallery',
        onPress: async () => {
          try {
            const res = await launchImageLibrary({
              mediaType: 'video',
              selectionLimit: 1,
            });
            if (res.didCancel) return;
            if (res.assets && res.assets.length > 0) {
              onSuccess(res.assets[0]);
            }
          } catch (e) {
            Alert.alert(isHi ? 'त्रुटि' : 'Error', isHi ? 'वीडियो लोड नहीं हो सका।' : 'Could not load video.');
          }
        },
      },
      {
        text: isHi ? 'रद्द करें' : 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';
import { colors as baseColors } from '../theme/colors';
import { translations } from '../utils/translations';
import CustomAlertModal from '../components/CustomAlertModal';

export const AppContext = createContext();

let globalAlertHandler = null;

export const setGlobalAlertHandler = (handler) => {
  globalAlertHandler = handler;
};

export const triggerCustomAlert = (config) => {
  if (globalAlertHandler) {
    globalAlertHandler(config);
  }
};

const SETTINGS_STORAGE_KEY = '@helper_app_settings_v1';

export function AppProvider({ children }) {
  const [appName, setAppName] = useState('Helper');
  const [appLogo, setAppLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#FF4D2D');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [themeMode, setThemeModeState] = useState('light');
  const [language, setLanguageState] = useState('en');
  const [heroBanners, setHeroBanners] = useState([]);
  const [settings, setSettings] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Global Animated Custom Alert State
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning',
    icon: '⚠️',
    buttons: [],
  });

  const showCustomAlert = useCallback(
    ({
      title = '',
      message = '',
      type = 'warning',
      icon = '⚠️',
      buttons = [],
    }) => {
      setAlertState({
        visible: true,
        title,
        message,
        type,
        icon,
        buttons,
      });
    },
    []
  );

  const hideCustomAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    setGlobalAlertHandler(showCustomAlert);
    return () => setGlobalAlertHandler(null);
  }, [showCustomAlert]);

  const setThemeMode = async (mode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem('@helper_theme_mode', mode).catch(() => {});
  };

  const setLanguage = async (lang) => {
    const code = lang.startsWith('hi') || lang.includes('हिन्दी') ? 'hi' : 'en';
    setLanguageState(code);
    await AsyncStorage.setItem('@helper_language', code).catch(() => {});
  };

  const t = useCallback(
    (key) => {
      const activeDict = translations[language] || translations.en;
      return activeDict[key] || translations.en[key] || key;
    },
    [language]
  );

  // Load cached settings first, then fetch live from backend
  useEffect(() => {
    AsyncStorage.getItem('@helper_theme_v2_initialized').then(async (init) => {
      if (!init) {
        // Fresh download: Default to clean white/light theme
        setThemeModeState('light');
        await AsyncStorage.setItem('@helper_theme_v2_initialized', 'true').catch(() => {});
        await AsyncStorage.setItem('@helper_theme_mode', 'light').catch(() => {});
      } else {
        const saved = await AsyncStorage.getItem('@helper_theme_mode').catch(() => null);
        if (saved) setThemeModeState(saved);
      }
    }).catch(() => {});
    AsyncStorage.getItem('@helper_language').then((savedLang) => {
      if (savedLang) setLanguageState(savedLang);
    }).catch(() => {});
    loadCachedSettings();
    fetchSettings();
  }, []);

  const sanitizeForCache = (data) => {
    if (!data) return {};
    const copy = { ...data };
    if (copy.appLogo && copy.appLogo.startsWith('data:image')) {
      copy.appLogo = ''; // don't cache multi-megabyte base64 strings in SQLite
    }
    if (Array.isArray(copy.heroBanners)) {
      copy.heroBanners = copy.heroBanners.map((b) => ({
        ...b,
        image: (b.image && b.image.startsWith('data:image')) ? '' : b.image,
      }));
    }
    return copy;
  };

  const loadCachedSettings = async () => {
    try {
      const cached = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        applySettingsData(parsed);
      }
    } catch (e) {
      console.log('Recovering from oversized cached settings:', e.message);
      await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY).catch(() => {});
    }
  };

  const applySettingsData = (data) => {
    if (!data) return;
    setSettings(data);
    if (data.appName) setAppName(data.appName);
    if (data.appLogo) setAppLogo(data.appLogo);
    if (data.primaryColor) setPrimaryColor(data.primaryColor);
    if (data.accentColor) setAccentColor(data.accentColor);
    if (Array.isArray(data.heroBanners) && data.heroBanners.length > 0) {
      setHeroBanners(data.heroBanners);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await client.get('/settings');
      if (res.data?.success && res.data?.data) {
        applySettingsData(res.data.data);
        const safeCache = sanitizeForCache(res.data.data);
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(safeCache)).catch(() => {});
      }
    } catch (err) {
      console.log('Error fetching app settings from backend:', err.message);
    } finally {
      setLoadingSettings(false);
    }
  };

  const updateSettings = async (updatedFields) => {
    try {
      // Optimistic update
      applySettingsData({ ...settings, ...updatedFields });

      const res = await client.put('/settings', updatedFields);
      if (res.data?.success && res.data?.data) {
        applySettingsData(res.data.data);
        const safeCache = sanitizeForCache(res.data.data);
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(safeCache)).catch(() => {});
        return { success: true, data: res.data.data };
      }
      return { success: true };
    } catch (err) {
      console.log('Error updating settings:', err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  // Banner helpers
  const saveBanners = async (bannersList) => {
    setHeroBanners(bannersList);
    const result = await updateSettings({ heroBanners: bannersList });
    // Auto-sync banner images to matching services by title in the backend
    try {
      client.get('/services').then((res) => {
        const services = res.data?.data || [];
        for (const banner of bannersList) {
          if (banner.title && banner.image) {
            const match = services.find(
              (s) => (s.name || '').trim().toLowerCase() === banner.title.trim().toLowerCase()
            );
            if (match && match.image !== banner.image) {
              client.put(`/services/${match.id || match._id}`, { image: banner.image }).catch(() => {});
            }
          }
        }
      }).catch(() => {});
    } catch (_) {}
    return result;
  };

  const addHeroBanner = async (banner) => {
    const newBanner = {
      id: `b_${Date.now()}`,
      active: true,
      ...banner,
    };
    const updated = [newBanner, ...heroBanners];
    return await saveBanners(updated);
  };

  const updateHeroBanner = async (id, updatedFields) => {
    const updated = heroBanners.map((b) => (b.id === id ? { ...b, ...updatedFields } : b));
    return await saveBanners(updated);
  };

  const deleteHeroBanner = async (id) => {
    const updated = heroBanners.filter((b) => b.id !== id);
    return await saveBanners(updated);
  };

  // Dynamic theme colors that automatically react to themeMode and primaryColor
  const themeColors = useMemo(() => {
    const isDark = themeMode === 'dark';
    return {
      ...baseColors,
      isDark,
      primary: primaryColor || baseColors.primary,
      accentGreen: accentColor || baseColors.accentGreen,
      borderAccent: `${primaryColor}4D`,
      glowOrange: `${primaryColor}26`,

      // Reactive Background & Surfaces
      bg: isDark ? '#070A12' : '#F8FAFC',
      card: isDark ? '#0F1523' : '#FFFFFF',
      cardElevated: isDark ? '#171F33' : '#FFFFFF',
      headerBg: isDark ? '#090D16' : '#FFFFFF',
      inputBg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',

      // Reactive Typography
      text: isDark ? '#F8FAFC' : '#0F172A',
      textSecondary: isDark ? '#94A3B8' : '#475569',
      textMuted: isDark ? '#64748B' : '#94A3B8',

      // Reactive Borders & Lines
      border: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
      borderDark: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
      borderLight: isDark ? 'rgba(255, 255, 255, 0.15)' : '#CBD5E1',
    };
  }, [themeMode, primaryColor, accentColor]);

  const isDark = themeColors.isDark;
  const toggleTheme = useCallback(() => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  }, [themeMode]);

  return (
    <AppContext.Provider
      value={{
        appName,
        appLogo,
        primaryColor,
        accentColor,
        heroBanners,
        settings,
        loadingSettings,
        themeColors,
        themeMode,
        setThemeMode,
        isDark,
        toggleTheme,
        language,
        setLanguage,
        t,
        fetchSettings,
        updateSettings,
        addHeroBanner,
        updateHeroBanner,
        deleteHeroBanner,
        showCustomAlert,
        hideCustomAlert,
      }}
    >
      {children}
      <CustomAlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        icon={alertState.icon}
        buttons={alertState.buttons}
        onClose={hideCustomAlert}
        isDark={isDark}
        primaryColor={primaryColor}
      />
    </AppContext.Provider>
  );
}

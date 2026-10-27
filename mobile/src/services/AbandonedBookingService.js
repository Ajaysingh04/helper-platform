import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerCustomAlert } from '../context/AppContext';

const STORAGE_KEY = '@helper_pending_booking_draft';
const HOURLY_INTERVAL_MS = 60 * 60 * 1000; // 1 hour = 3600000 ms

/**
 * Save an incomplete/draft booking when user opens Review & Book
 */
export const saveIncompleteBooking = async (bookingData) => {
  try {
    const existingStr = await AsyncStorage.getItem(STORAGE_KEY);
    const existing = existingStr ? JSON.parse(existingStr) : null;

    const draft = {
      id: bookingData.id || existing?.id || 'DRAFT-' + Date.now(),
      service: bookingData.service || existing?.service,
      pro: bookingData.pro || existing?.pro,
      selectedDate: bookingData.selectedDate || existing?.selectedDate || 'Today',
      customTime: bookingData.customTime || existing?.customTime || '11:00 AM',
      finalPrice: bookingData.finalPrice || existing?.finalPrice || 499,
      initiatedAt: existing?.initiatedAt || Date.now(),
      lastNotificationAt: existing?.lastNotificationAt || 0,
      notificationCount: existing?.notificationCount || 0,
      status: 'incomplete',
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    return draft;
  } catch (error) {
    console.warn('Error saving incomplete booking draft:', error);
    return null;
  }
};

/**
 * Delete/discard the incomplete booking draft (user requested action in Review & Book)
 */
export const deleteIncompleteBooking = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('Error deleting incomplete booking draft:', error);
    return false;
  }
};

/**
 * Retrieve the active incomplete booking draft
 */
export const getIncompleteBooking = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Error fetching incomplete booking draft:', error);
    return null;
  }
};

/**
 * Check if 1 hour has elapsed since initiated or since last notification
 * If so, returns notification payload and updates lastNotificationAt
 */
export const checkHourlyBookingNotification = async (language = 'en') => {
  try {
    const draft = await getIncompleteBooking();
    if (!draft || draft.status !== 'incomplete') {
      return null;
    }

    const now = Date.now();
    const referenceTime = draft.lastNotificationAt > 0 ? draft.lastNotificationAt : draft.initiatedAt;
    const elapsed = now - referenceTime;

    // Check if 1 hour has passed (or first reminder 1 hour after leaving)
    if (elapsed >= HOURLY_INTERVAL_MS) {
      draft.lastNotificationAt = now;
      draft.notificationCount = (draft.notificationCount || 0) + 1;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft));

      const isHi = language === 'hi';
      const serviceName = draft.service?.name || draft.pro?.name || (isHi ? 'होम सर्विस' : 'Home Service');

      return {
        shouldNotify: true,
        draft,
        notificationNumber: draft.notificationCount,
        title: isHi
          ? 'अधूरी बुकिंग अनुस्मारक ⏰'
          : 'Incomplete Booking Reminder ⏰',
        message: isHi
          ? `आपने "${serviceName}" की बुकिंग अधूरी छोड़ दी है। अपनी स्लॉट और ₹50 की छूट सुरक्षित करने के लिए अभी बुकिंग पूरी करें!`
          : `You left your booking for "${serviceName}" incomplete! Complete your order now to secure your 15-minute arrival slot & discount.`,
        btnComplete: isHi ? 'अभी पूरा करें ➔' : 'Complete Booking ➔',
        btnDelete: isHi ? 'बुकिंग हटाएं 🗑️' : 'Delete Booking 🗑️',
      };
    }

    return null;
  } catch (error) {
    console.warn('Error in checkHourlyBookingNotification:', error);
    return null;
  }
};

/**
 * Prompt user with Hourly Notification Alert and handle direct actions:
 * - "Complete Booking" -> Navigates to Review & Book
 * - "Delete Booking" -> Deletes draft and cancels future reminders
 */
export const showHourlyBookingAlert = (notificationData, navigation, language = 'en') => {
  if (!notificationData) return;
  const isHi = language === 'hi';

  triggerCustomAlert({
    title: notificationData.title,
    message: notificationData.message,
    type: 'warning',
    icon: '⏰',
    buttons: [
      {
        text: notificationData.btnDelete,
        style: 'destructive',
        onPress: async () => {
          await deleteIncompleteBooking();
          triggerCustomAlert({
            title: isHi ? 'बुकिंग हटा दी गई ✓' : 'Booking Deleted ✓',
            message: isHi
              ? 'आपकी अधूरी बुकिंग हटा दी गई है और 1 घंटे वाले अनुस्मारक बंद कर दिए गए हैं।'
              : 'Your incomplete booking draft has been removed and reminders stopped.',
            type: 'success',
            icon: '🗑️',
            buttons: [{ text: isHi ? 'ठीक है' : 'OK' }],
          });
        },
      },
      {
        text: isHi ? 'बाद में' : 'Later',
        style: 'cancel',
      },
      {
        text: notificationData.btnComplete,
        style: 'default',
        onPress: () => {
          if (navigation) {
            navigation.navigate('BookingCheckout', {
              service: notificationData.draft.service,
              pro: notificationData.draft.pro,
            });
          }
        },
      },
    ],
  });
};

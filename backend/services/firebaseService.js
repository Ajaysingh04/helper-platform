const { initializeApp, cert, getApps, getApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const path = require("path");
const fs = require("fs");

let firebaseApp = null;
let messaging = null;

try {
  let serviceAccount = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf8");
        serviceAccount = JSON.parse(decoded);
      } catch (e) {
        console.warn("[Firebase] Could not parse FIREBASE_SERVICE_ACCOUNT env var:", e.message);
      }
    }
  }

  const serviceAccountPath = path.join(__dirname, "../config/helper-b2e32-firebase-adminsdk-fbsvc-052ce0c300.json");
  if (!serviceAccount && fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
  }

  if (serviceAccount) {
    const existingApps = getApps();
    if (!existingApps || existingApps.length === 0) {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      firebaseApp = getApp();
    }
    messaging = getMessaging(firebaseApp);
    console.log("[Firebase] Admin SDK initialized successfully for project:", serviceAccount.project_id);
  } else {
    console.log("[Firebase] Notice: Service account not provided. Push notifications operating in fallback mode.");
  }
} catch (error) {
  console.error("[Firebase] Initialization failed:", error.message);
}

/**
 * Send push notification to a specific FCM device registration token
 */
async function sendToToken(token, title, body, data = {}) {
  if (!messaging || !token) {
    console.log(`[FCM Mock] Token: ${token} | Title: ${title} | Body: ${body}`);
    return { success: false, reason: "messaging_not_ready_or_token_missing" };
  }
  try {
    const message = {
      token,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "helper_orders_channel",
          priority: "max"
        }
      }
    };
    const response = await messaging.send(message);
    console.log("✅ [FCM] Notification sent to token:", response);
    return { success: true, messageId: response };
  } catch (err) {
    console.error("❌ [FCM] Failed to send to token:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send push notification to an FCM topic (e.g. 'partners', 'all_vendors', 'workers')
 */
async function sendToTopic(topic, title, body, data = {}) {
  if (!messaging) {
    console.log(`[FCM Mock Topic: ${topic}] Title: ${title} | Body: ${body}`);
    return { success: false, reason: "messaging_not_ready" };
  }
  try {
    const message = {
      topic,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "helper_orders_channel",
          priority: "max"
        }
      }
    };
    const response = await messaging.send(message);
    console.log(`✅ [FCM] Notification broadcast to topic '${topic}':`, response);
    return { success: true, messageId: response };
  } catch (err) {
    console.error(`❌ [FCM] Failed to broadcast to topic '${topic}':`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Broadcast when a customer places a new booking
 */
async function notifyNewBooking(booking) {
  const serviceName = booking.serviceName || booking.service || "Home Service";
  const customerName = booking.customerName || booking.name || "Customer";
  const price = booking.finalPrice || booking.amount || booking.price || 499;
  const bookingId = booking.bookingCode || booking.id || booking._id || "NEW";

  const title = `⚡ New Order Alert: ${serviceName}`;
  const body = `${customerName} booked for ₹${price}. Tap to review & accept on Radar!`;

  return sendToTopic("partners", title, body, {
    type: "NEW_ORDER",
    bookingId: String(bookingId),
    serviceName: String(serviceName),
    price: String(price),
    customerName: String(customerName)
  });
}

/**
 * Send status update push notification (e.g. accepted, on_the_way, reached, completed)
 */
async function notifyBookingStatus(booking, status) {
  const serviceName = booking.serviceName || booking.service || "Service";
  const bookingId = booking.bookingCode || booking.id || booking._id || "";

  let title = `Helper Order Update`;
  let body = `Your booking for ${serviceName} is now ${status}.`;

  if (status === "accepted" || status === "dispatched") {
    title = `🎉 Order Accepted!`;
    body = `A certified partner has accepted your ${serviceName} booking. Specialist is being dispatched.`;
  } else if (status === "on_the_way") {
    title = `🛵 Specialist On The Way!`;
    body = `Your technician is heading towards your location now.`;
  } else if (status === "reached") {
    title = `📍 Specialist Arrived at Doorstep`;
    body = `Please share your 4-digit start OTP with the specialist to start work.`;
  } else if (status === "completed") {
    title = `✅ Service Completed Successfully!`;
    body = `Your ${serviceName} work is completed. Thank you for choosing Helper!`;
  }

  return sendToTopic("customers", title, body, {
    type: "ORDER_STATUS_UPDATE",
    bookingId: String(bookingId),
    status: String(status)
  });
}

module.exports = {
  isFirebaseReady: () => Boolean(messaging),
  sendToToken,
  sendToTopic,
  notifyNewBooking,
  notifyBookingStatus
};

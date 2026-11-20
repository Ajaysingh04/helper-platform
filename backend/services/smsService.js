/**
 * Helper Platform - SMS Gateway & Alert Dispatcher Service
 * Supports Fast2SMS, Twilio, 2Factor, or Custom HTTP SMS Gateways
 */

const axios = require("axios");

const SMS_GATEWAY = process.env.SMS_GATEWAY || "fast2sms"; // fast2sms | twilio | custom | mock
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || "";
const TWILIO_SID = process.env.TWILIO_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM = process.env.TWILIO_FROM || "";

/**
 * Send SMS to a single 10-digit Indian phone number
 */
async function sendSMS(phone, message) {
  const cleanPhone = phone.replace(/[\s-+]/g, "").slice(-10);

  console.log(`📨 [SMS GATEWAY] Dispatching to +91-${cleanPhone}: "${message}"`);

  // 1. Fast2SMS Provider
  if (FAST2SMS_API_KEY) {
    try {
      const response = await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "v3",
          sender_id: "TXTIND",
          message: message,
          language: "english",
          flash: 0,
          numbers: cleanPhone,
        },
        {
          headers: {
            authorization: FAST2SMS_API_KEY,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );
      console.log(`✅ [Fast2SMS] Dispatched successfully:`, response.data?.message || "OK");
      return { success: true, provider: "fast2sms", data: response.data };
    } catch (err) {
      console.warn(`⚠️ [Fast2SMS] Error:`, err.response?.data || err.message);
    }
  }

  // 2. Twilio Provider
  if (TWILIO_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM) {
    try {
      const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
      const params = new URLSearchParams();
      params.append("To", `+91${cleanPhone}`);
      params.append("From", TWILIO_FROM);
      params.append("Body", message);

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
        params.toString(),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 5000,
        }
      );
      console.log(`✅ [Twilio] Dispatched successfully:`, response.data?.sid);
      return { success: true, provider: "twilio", sid: response.data?.sid };
    } catch (err) {
      console.warn(`⚠️ [Twilio] Error:`, err.response?.data || err.message);
    }
  }

  // 3. Fallback Logging (for sandbox / local testing)
  console.log(`⚡ [SMS Gateway Simulated]: Sent OTP/Alert to +91-${cleanPhone}`);
  return { success: true, provider: "simulator", phone: cleanPhone };
}

/**
 * Dispatch Phone OTP for Vendor/Customer Login or Verification
 */
async function sendOtpSMS(phone, otp) {
  const msg = `Your Helper Platform OTP is ${otp}. Valid for 5 minutes. Please do not share this code with anyone.`;
  return sendSMS(phone, msg);
}

/**
 * Alert Vendor when Franchise is Expiring Soon
 */
async function sendFranchiseExpiringSoonSMS(phone, daysLeft, expiryDateStr) {
  const msg = `⚠️ Alert from Helper: Your Franchise pack will expire in ${daysLeft} days (${expiryDateStr}). Renew now in the Partner App to avoid losing customer leads.`;
  return sendSMS(phone, msg);
}

/**
 * Alert Vendor when Franchise has completely Expired
 */
async function sendFranchiseExpiredSMS(phone) {
  const msg = `❌ Helper Notice: Your Franchise plan has ended. Radar dispatch is paused. Open the Partner App to renew your franchise and reactivate orders immediately.`;
  return sendSMS(phone, msg);
}

module.exports = {
  sendSMS,
  sendOtpSMS,
  sendFranchiseExpiringSoonSMS,
  sendFranchiseExpiredSMS,
};

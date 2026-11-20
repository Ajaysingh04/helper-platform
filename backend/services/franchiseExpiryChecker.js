/**
 * Helper Platform - Franchise Expiry & Renewal Automated Monitor
 * Automatically checks vendor franchise expiration dates,
 * dispatches proactive push notifications & SMS alerts 3 days before expiration,
 * and deactivates expired franchises, prompting immediate renewal.
 */

const Provider = require("../models/Provider");
const { getStatus } = require("../config/db");
const dbStore = require("../data/dbStore");
const firebaseService = require("./firebaseService");
const smsService = require("./smsService");

async function checkFranchiseExpiries() {
  try {
    const now = new Date();
    let providers = [];

    if (getStatus()) {
      providers = await Provider.find({
        $or: [{ franchiseActive: true }, { franchiseExpiry: { $exists: true } }]
      });
    } else {
      const allPros = dbStore.getAll("providers") || [];
      providers = allPros.filter(p => p.franchiseActive || p.franchiseExpiry);
    }

    console.log(`🛡️ [Franchise Monitor] Checking ${providers.length} provider memberships for expiry status...`);

    for (const pro of providers) {
      if (!pro.franchiseExpiry) continue;

      const expiryDate = new Date(pro.franchiseExpiry);
      const diffMs = expiryDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const expiryFormatted = expiryDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      // 1. Pack has EXPIRED
      if (diffMs <= 0 && pro.franchiseActive) {
        console.log(`❌ [Franchise Expired] Provider: ${pro.name} (${pro.phone}) expired on ${expiryFormatted}. Locking hub.`);
        pro.franchiseActive = false;
        pro.franchiseExpiredAt = now;

        if (getStatus() && pro.save) {
          await pro.save();
        } else {
          dbStore.update("providers", pro.id || pro._id, {
            franchiseActive: false,
            franchiseExpiredAt: now
          });
        }

        // Send Push Notification
        await firebaseService.sendToTopic(
          "partners",
          "❌ Your Helper Franchise Pack Has Expired",
          `Hello ${pro.name}, your ${pro.franchisePlan || "Hub"} franchise plan has ended. Renew now to reactivate customer radar!`,
          {
            type: "FRANCHISE_EXPIRED",
            providerId: String(pro.id || pro._id),
            action: "RENEW_FRANCHISE"
          }
        ).catch(() => {});

        // Send SMS
        if (pro.phone) {
          await smsService.sendFranchiseExpiredSMS(pro.phone).catch(() => {});
        }
      }
      // 2. Pack is EXPIRING SOON (within 3 days)
      else if (daysLeft > 0 && daysLeft <= 3 && pro.franchiseActive) {
        // Prevent duplicate spam warnings within the same 20 hours
        const lastWarn = pro.lastExpiryWarningSentAt ? new Date(pro.lastExpiryWarningSentAt) : null;
        const hoursSinceWarn = lastWarn ? (now.getTime() - lastWarn.getTime()) / (1000 * 60 * 60) : 999;

        if (hoursSinceWarn > 20) {
          console.log(`⚠️ [Franchise Expiring Soon] Provider: ${pro.name} has ${daysLeft} day(s) left. Dispatching alerts.`);
          pro.lastExpiryWarningSentAt = now;

          if (getStatus() && pro.save) {
            await pro.save();
          } else {
            dbStore.update("providers", pro.id || pro._id, { lastExpiryWarningSentAt: now });
          }

          // Send FCM Push Notification
          await firebaseService.sendToTopic(
            "partners",
            `⚠️ Helper Franchise Pack Ends in ${daysLeft} Day${daysLeft > 1 ? "s" : ""}!`,
            `Your ${pro.franchisePlan || "Monthly"} pack ends on ${expiryFormatted}. Renew early to ensure non-stop orders.`,
            {
              type: "FRANCHISE_EXPIRING_SOON",
              providerId: String(pro.id || pro._id),
              daysLeft: String(daysLeft),
              action: "RENEW_FRANCHISE"
            }
          ).catch(() => {});

          // Send SMS
          if (pro.phone) {
            await smsService.sendFranchiseExpiringSoonSMS(pro.phone, daysLeft, expiryFormatted).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ [Franchise Monitor Error]:", err.message);
  }
}

// Start recurring check every 30 minutes
let monitorTimer = null;
function startFranchiseMonitor() {
  if (monitorTimer) clearInterval(monitorTimer);
  checkFranchiseExpiries(); // Immediate run on startup
  monitorTimer = setInterval(checkFranchiseExpiries, 30 * 60 * 1000);
  console.log("⏰ [Franchise Monitor] Background expiry monitor active (runs every 30 mins).");
}

module.exports = {
  checkFranchiseExpiries,
  startFranchiseMonitor
};

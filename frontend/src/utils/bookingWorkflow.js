// ============================================================================
// HELPER PLATFORM - REAL-TIME BOOKING WORKFLOW & SCHEDULE CALCULATOR
// Seamless 3-Party Dispatch: Demo User -> Demo Vendor -> Demo Worker
// Real-time synchronization across multi-tabs with broadcast & local storage
// ============================================================================

export const DEMO_VENDOR = {
  id: "vdr_demo_01",
  _id: "vdr_demo_01",
  name: "Ramesh Kumar",
  shopName: "Ramesh Express Plumbing & Home Care",
  phone: "+91 98765 00001",
  rating: 4.9,
  verified: true,
  category: "Plumber",
  location: "Palasia Square, Indore, MP",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300"
};

export const DEMO_WORKER = {
  id: "WRK-101",
  workerId: "WRK-101",
  name: "Sunil Verma",
  phone: "+91 98765 00101",
  category: "Plumber",
  role: "Senior Master Technician",
  rating: 4.95,
  totalJobs: 148,
  experience: "6+ Years Experience",
  verified: true,
  avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300",
  vendorName: "Ramesh Express Plumbing & Home Care",
  availability: { isOnline: true }
};

// BroadcastChannel for instant 0ms tab-to-tab synchronization
let syncChannel = null;
try {
  if (typeof window !== "undefined" && window.BroadcastChannel) {
    syncChannel = new window.BroadcastChannel("helper_booking_sync");
  }
} catch (e) {
  syncChannel = null;
}

/**
 * Calculates accurate schedule, remaining hours until start,
 * and estimated service work duration based on user booking input.
 */
export function calculateScheduleDetails(booking, currentNow = Date.now()) {
  if (!booking) return null;

  const dateStr = String(booking.scheduledDate || booking.bookingDate || "Today").trim();
  const timeStr = String(booking.scheduledTime || booking.timeSlot || "11:00 AM").trim();

  let targetTimestamp = booking.scheduledTimestamp ? Number(booking.scheduledTimestamp) : 0;

  if (!targetTimestamp || isNaN(targetTimestamp)) {
    const monthMap = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const now = new Date(currentNow);
    let year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();

    const lowerDate = dateStr.toLowerCase();

    if (lowerDate.includes("tomorrow")) {
      const tm = new Date(currentNow + 86400000);
      year = tm.getFullYear();
      month = tm.getMonth();
      day = tm.getDate();
    } else if (lowerDate.includes("today")) {
      // today is current day
    } else {
      const isoMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (isoMatch) {
        year = parseInt(isoMatch[1], 10);
        month = parseInt(isoMatch[2], 10) - 1;
        day = parseInt(isoMatch[3], 10);
      } else {
        const dMatch = dateStr.match(/(\d{1,2})\s+([a-zA-Z]{3})/i) || dateStr.match(/([a-zA-Z]{3})\s+(\d{1,2})/i);
        if (dMatch) {
          const first = dMatch[1];
          const second = dMatch[2];
          const num = isNaN(parseInt(first, 10)) ? parseInt(second, 10) : parseInt(first, 10);
          const monStr = (isNaN(parseInt(first, 10)) ? first : second).toLowerCase().slice(0, 3);
          if (monthMap[monStr] !== undefined) {
            month = monthMap[monStr];
            day = num;
          }
        }
      }
    }

    // Parse time
    let hours = 11;
    let minutes = 0;
    const tMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
    if (tMatch) {
      let h = parseInt(tMatch[1], 10);
      const m = tMatch[2] ? parseInt(tMatch[2], 10) : 0;
      const ampm = tMatch[3].toLowerCase();
      if (ampm === "pm" && h < 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;
      hours = h;
      minutes = m;
    }

    const calculatedDate = new Date(year, month, day, hours, minutes, 0, 0);
    targetTimestamp = calculatedDate.getTime();
  }

  const diffMs = targetTimestamp - currentNow;
  const isPast = diffMs <= 0;

  const totalHours = Math.max(0, Math.floor(diffMs / 3600000));
  const days = Math.floor(totalHours / 24);
  const remHours = totalHours % 24;
  const minutes = Math.max(0, Math.floor((diffMs % 3600000) / 60000));
  const seconds = Math.max(0, Math.floor((diffMs % 60000) / 1000));

  // Determine estimated service time based on category/service
  const serviceCategory = String(booking.serviceCategory || booking.serviceName || booking.service || "").toLowerCase();
  let estimatedServiceHours = 1.5;
  let estimatedDurationText = "1.5 - 2 Hours";

  if (serviceCategory.includes("clean") || serviceCategory.includes("deep")) {
    estimatedServiceHours = 3.0;
    estimatedDurationText = "2.5 - 3 Hours";
  } else if (serviceCategory.includes("ac") || serviceCategory.includes("appliance")) {
    estimatedServiceHours = 2.0;
    estimatedDurationText = "1.5 - 2 Hours";
  } else if (serviceCategory.includes("paint") || serviceCategory.includes("packers")) {
    estimatedServiceHours = 4.0;
    estimatedDurationText = "4 - 5 Hours";
  } else {
    estimatedServiceHours = 1.5;
    estimatedDurationText = "1 - 2 Hours";
  }

  // Determine human-readable time countdown string
  const isTomorrow = dateStr.toLowerCase().includes("tomorrow") || days === 1;
  const isToday = dateStr.toLowerCase().includes("today") || (days === 0 && !isPast);

  let countdownTitle = "";
  let arrivalBadgeText = "";
  let fullExplanation = "";

  if (isPast) {
    countdownTitle = "🟢 Slot is Active Now";
    arrivalBadgeText = "Technician Slot Live";
    fullExplanation = `Scheduled slot is active now. Estimated service duration: ~${estimatedDurationText}.`;
  } else if (days > 0) {
    countdownTitle = `Starts in ${days} Day${days > 1 ? "s" : ""} ${remHours} Hour${remHours !== 1 ? "s" : ""}`;
    arrivalBadgeText = `⏳ ${totalHours} hrs left until arrival`;
    fullExplanation = `Technician will arrive in ${totalHours} hours (${dateStr} at ${timeStr}). Service duration: ~${estimatedDurationText}.`;
  } else if (totalHours > 0) {
    countdownTitle = `Starts in ${totalHours} Hr${totalHours > 1 ? "s" : ""} ${minutes} Min${minutes !== 1 ? "s" : ""}`;
    arrivalBadgeText = `⏳ ${totalHours}h ${minutes}m left`;
    fullExplanation = isTomorrow
      ? `Tomorrow at ${timeStr} (in ${totalHours} hrs ${minutes} mins). Estimated service duration: ~${estimatedDurationText}.`
      : `Today at ${timeStr} (in ${totalHours} hrs ${minutes} mins). Estimated service duration: ~${estimatedDurationText}.`;
  } else {
    countdownTitle = `Arriving in ${minutes} Min${minutes !== 1 ? "s" : ""} ${seconds}s`;
    arrivalBadgeText = `⚡ In ${minutes} mins`;
    fullExplanation = `Technician arriving shortly (${timeStr}). Estimated service duration: ~${estimatedDurationText}.`;
  }

  return {
    targetTimestamp,
    diffMs,
    isPast,
    isTomorrow,
    isToday,
    days,
    totalHours,
    remHours,
    minutes,
    seconds,
    estimatedServiceHours,
    estimatedDurationText,
    countdownTitle,
    arrivalBadgeText,
    fullExplanation,
    scheduledDate: dateStr,
    scheduledTime: timeStr
  };
}

/**
 * Universal broadcast synchronizer: updates localStorage and notifies all tabs.
 */
export function broadcastBookingSync(bookingId, patchData) {
  if (!bookingId) return;
  const key = String(bookingId);

  // 1. Update helper_user_bookings
  try {
    const raw = localStorage.getItem("helper_user_bookings");
    let list = raw ? JSON.parse(raw) : [];
    let updated = false;
    list = list.map((b) => {
      const bKey = String(b.bookingId || b.id || b._id || b.bookingCode || "");
      if (bKey === key) {
        updated = true;
        return { ...b, ...patchData };
      }
      return b;
    });
    if (!updated && patchData) {
      list.unshift({ bookingId: key, id: key, ...patchData });
    }
    localStorage.setItem("helper_user_bookings", JSON.stringify(list));
  } catch (e) {}

  // 2. Update helper_bookings
  try {
    const rawB = localStorage.getItem("helper_bookings");
    let listB = rawB ? JSON.parse(rawB) : [];
    listB = listB.map((b) => {
      const bKey = String(b.bookingId || b.id || b._id || b.bookingCode || "");
      if (bKey === key) return { ...b, ...patchData };
      return b;
    });
    localStorage.setItem("helper_bookings", JSON.stringify(listB));
  } catch (e) {}

  // 3. Post to BroadcastChannel
  try {
    if (syncChannel) {
      syncChannel.postMessage({
        type: "BOOKING_WORKFLOW_UPDATE",
        bookingId: key,
        patch: patchData,
        timestamp: Date.now()
      });
    }
  } catch (e) {}

  // 4. Dispatch DOM custom events
  try {
    window.dispatchEvent(
      new CustomEvent("booking_workflow_updated", {
        detail: { bookingId: key, patch: patchData }
      })
    );
    window.dispatchEvent(new CustomEvent("user_bookings_updated"));
    window.dispatchEvent(
      new CustomEvent("booking_updated", {
        detail: { bookingId: key, ...patchData }
      })
    );
  } catch (e) {}

  // 5. Ping localStorage for storage event trigger
  try {
    localStorage.setItem(
      "helper_sync_ping",
      JSON.stringify({ bookingId: key, timestamp: Date.now() })
    );
  } catch (e) {}
}

/**
 * Handle Demo Vendor accepting a booking request.
 * Sets status to "ready_for_worker" and dispatches to Demo Worker.
 */
export async function handleDemoVendorAccept(booking, customWorker = null) {
  const key = String(booking.bookingId || booking.id || booking._id || booking.bookingCode);
  const workerObj = customWorker || DEMO_WORKER;
  const vendorObj = DEMO_VENDOR;

  const patch = {
    status: "ready_for_worker",
    workerStatus: "assigned",
    vendorAccepted: true,
    vendorAcceptedAt: new Date().toISOString(),
    assignedProvider: `${vendorObj.shopName} • ${vendorObj.name}`,
    assignedProviderName: vendorObj.name,
    assignedProviderPhone: vendorObj.phone,
    providerId: vendorObj.id,
    assignedWorker: workerObj,
    assignedWorkerName: workerObj.name,
    assignedWorkerPhone: workerObj.phone,
    assignedWorkers: [workerObj]
  };

  broadcastBookingSync(key, patch);

  // Notify worker dashboard specifically
  try {
    window.dispatchEvent(
      new CustomEvent("worker_new_offer", {
        detail: { ...booking, ...patch }
      })
    );
  } catch (e) {}

  return patch;
}

/**
 * Handle Demo Worker accepting a booking request.
 * Locks the slot, updates workerStatus to "accepted", unlocks worker's name, phone, and time calculation.
 */
export async function handleDemoWorkerAccept(booking, customWorker = null) {
  const key = String(booking.bookingId || booking.id || booking._id || booking.bookingCode);
  const workerObj = customWorker || DEMO_WORKER;

  const patch = {
    status: "slot_confirmed",
    workerStatus: "accepted",
    slotConfirmed: true,
    workerAcceptedAt: new Date().toISOString(),
    assignedWorker: workerObj,
    assignedWorkerName: workerObj.name,
    assignedWorkerPhone: workerObj.phone,
    assignedWorkers: [workerObj]
  };

  broadcastBookingSync(key, patch);

  try {
    window.dispatchEvent(
      new CustomEvent("worker_job_accepted", {
        detail: { bookingId: key, ...patch }
      })
    );
  } catch (e) {}

  return patch;
}

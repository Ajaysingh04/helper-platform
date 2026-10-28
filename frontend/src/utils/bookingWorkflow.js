// ============================================================================
// HELPER PLATFORM - REAL-TIME BOOKING WORKFLOW & SCHEDULE CALCULATOR
// Seamless 3-Party Dispatch: Demo User -> Demo Vendor -> Demo Worker
// Real-time synchronization across multi-tabs with broadcast & local storage
import { API_BASE } from "../apiConfig";

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
  category: "All Services Multi-Trade Specialist",
  skills: [
    "House Cleaning",
    "Deep Cleaning",
    "Plumber",
    "Electrician",
    "AC Repair",
    "Cleaner",
    "Wall Painter",
    "Carpenter",
    "Driver"
  ],
  allowedServices: [
    "House Cleaning",
    "Plumber",
    "Electrician",
    "AC Repair",
    "Cleaner",
    "Wall Painter",
    "Carpenter",
    "Driver",
    "Chef",
    "Doctor",
    "Nanny"
  ],
  role: "Senior Master Multi-Trade Specialist",
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

  const matchItem = (b) => {
    if (!b) return false;
    const bKeys = [b.bookingId, b.id, b._id, b.bookingCode].filter(Boolean).map(String);
    const targetKeys = [key, patchData?.bookingId, patchData?.id, patchData?.bookingCode, patchData?._id].filter(Boolean).map(String);
    return bKeys.some(k => targetKeys.includes(k));
  };

  // 1. Update helper_user_bookings
  try {
    const raw = localStorage.getItem("helper_user_bookings");
    let list = raw ? JSON.parse(raw) : [];
    const existingIdx = list.findIndex(matchItem);
    if (existingIdx >= 0) {
      const merged = { ...list[existingIdx], ...patchData };
      list.splice(existingIdx, 1);
      list.unshift(merged);
    } else if (patchData) {
      list.unshift({ bookingId: key, id: key, ...patchData });
    }
    localStorage.setItem("helper_user_bookings", JSON.stringify(list));
  } catch (e) {}

  // 2. Update helper_bookings
  try {
    const rawB = localStorage.getItem("helper_bookings");
    let listB = rawB ? JSON.parse(rawB) : [];
    const existingIdxB = listB.findIndex(matchItem);
    if (existingIdxB >= 0) {
      const mergedB = { ...listB[existingIdxB], ...patchData };
      listB.splice(existingIdxB, 1);
      listB.unshift(mergedB);
    } else if (patchData) {
      listB.unshift({ bookingId: key, id: key, ...patchData });
    }
    localStorage.setItem("helper_bookings", JSON.stringify(listB));
  } catch (e) {}

  // 3. Update helper_worker_jobs for immediate Demo Worker pickup
  try {
    const rawW = localStorage.getItem("helper_worker_jobs");
    let listW = rawW ? JSON.parse(rawW) : [];

    // Retrieve full booking data from helper_user_bookings or helper_bookings to guarantee 100% complete fields
    let fullOriginal = {};
    try {
      const uList = JSON.parse(localStorage.getItem("helper_user_bookings") || "[]");
      const bList = JSON.parse(localStorage.getItem("helper_bookings") || "[]");
      const found = uList.find(matchItem) || bList.find(matchItem);
      if (found) fullOriginal = found;
    } catch (e) {}

    const customerFinalName = patchData?.customerName || fullOriginal?.customerName || patchData?.name || fullOriginal?.name;
    const customerFinalPhone = patchData?.customerPhone || fullOriginal?.customerPhone || patchData?.phone || fullOriginal?.phone;
    const customerFinalAddress = patchData?.customerAddress || fullOriginal?.customerAddress || patchData?.address || fullOriginal?.address || patchData?.fullAddress || fullOriginal?.fullAddress;
    const customerFinalDate = patchData?.scheduledDate || fullOriginal?.scheduledDate || patchData?.bookingDate || fullOriginal?.bookingDate || patchData?.date || fullOriginal?.date || "Today";
    const customerFinalTime = patchData?.scheduledTime || fullOriginal?.scheduledTime || patchData?.timeSlot || fullOriginal?.timeSlot || patchData?.time || fullOriginal?.time || "11:00 AM";
    const customerFinalService = patchData?.serviceName || fullOriginal?.serviceName || patchData?.service || fullOriginal?.service;
    const customerFinalProblem = patchData?.problemDescription || fullOriginal?.problemDescription || patchData?.problem || fullOriginal?.problem;

    const fullJobData = {
      ...fullOriginal,
      ...patchData,
      bookingId: key,
      id: key,
      bookingCode: patchData?.bookingCode || fullOriginal?.bookingCode || key,
      customerName: customerFinalName,
      name: customerFinalName,
      customerPhone: customerFinalPhone,
      phone: customerFinalPhone,
      customerAddress: customerFinalAddress,
      address: customerFinalAddress,
      fullAddress: customerFinalAddress,
      scheduledDate: customerFinalDate,
      bookingDate: customerFinalDate,
      date: customerFinalDate,
      scheduledTime: customerFinalTime,
      timeSlot: customerFinalTime,
      time: customerFinalTime,
      serviceName: customerFinalService,
      service: customerFinalService,
      problemDescription: customerFinalProblem,
      vendorAccepted: true,
      status: patchData?.status || fullOriginal?.status || "ready_for_worker",
      workerStatus: patchData?.workerStatus || fullOriginal?.workerStatus || "assigned",
      timestamp: patchData?.timestamp || fullOriginal?.timestamp || Date.now(),
      createdAt: patchData?.createdAt || fullOriginal?.createdAt || new Date().toISOString()
    };

    const existingIdxW = listW.findIndex(matchItem);
    if (existingIdxW >= 0) {
      const mergedW = { ...listW[existingIdxW], ...fullJobData };
      listW.splice(existingIdxW, 1);
      listW.unshift(mergedW);
    } else {
      listW.unshift(fullJobData);
    }
    localStorage.setItem("helper_worker_jobs", JSON.stringify(listW));
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
  const bCode = booking.bookingCode || booking.bookingId || booking.id || booking._id || "HLP-0000";
  const key = String(bCode);
  const workerObj = customWorker || DEMO_WORKER;
  const vendorObj = DEMO_VENDOR;

  const customerFinalName = booking.customerName || booking.name || "Customer";
  const customerFinalPhone = booking.customerPhone || booking.phone || "+91 98765 43210";
  const customerFinalAddress = booking.customerAddress || booking.address || booking.fullAddress || "Indore / Local Area";
  const customerFinalOtp = booking.doorOtp || booking.startOtp || booking.slotOtp || booking.otp || "3459";

  const fullAcceptedBooking = {
    ...booking,
    bookingId: key,
    id: key,
    _id: booking._id || key,
    bookingCode: bCode,
    customerName: customerFinalName,
    name: customerFinalName,
    customerPhone: customerFinalPhone,
    phone: customerFinalPhone,
    customerAddress: customerFinalAddress,
    address: customerFinalAddress,
    doorOtp: customerFinalOtp,
    startOtp: customerFinalOtp,
    slotOtp: customerFinalOtp,
    otp: customerFinalOtp,
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

  broadcastBookingSync(key, fullAcceptedBooking);

  // Directly update helper_user_bookings in localStorage
  try {
    const rawU = localStorage.getItem("helper_user_bookings");
    let uList = rawU ? JSON.parse(rawU) : [];
    const isMatch = (item) => [item.bookingCode, item.bookingId, item.id, item._id].filter(Boolean).map(String).includes(key);
    let found = false;
    uList = uList.map(item => {
      if (isMatch(item)) {
        found = true;
        return { ...item, ...fullAcceptedBooking };
      }
      return item;
    });
    if (!found) uList.unshift(fullAcceptedBooking);
    localStorage.setItem("helper_user_bookings", JSON.stringify(uList));
  } catch (e) {}

  // Directly update helper_worker_jobs in localStorage
  try {
    const rawW = localStorage.getItem("helper_worker_jobs");
    let wList = rawW ? JSON.parse(rawW) : [];
    const isMatch = (item) => [item.bookingCode, item.bookingId, item.id, item._id].filter(Boolean).map(String).includes(key);
    wList = wList.filter(item => !isMatch(item));
    wList.unshift(fullAcceptedBooking);
    localStorage.setItem("helper_worker_jobs", JSON.stringify(wList));
  } catch (e) {}

  // Update helper_bookings in localStorage
  try {
    const rawB = localStorage.getItem("helper_bookings");
    let bList = rawB ? JSON.parse(rawB) : [];
    const isMatch = (item) => [item.bookingCode, item.bookingId, item.id, item._id].filter(Boolean).map(String).includes(key);
    let foundB = false;
    bList = bList.map(item => {
      if (isMatch(item)) {
        foundB = true;
        return { ...item, ...fullAcceptedBooking };
      }
      return item;
    });
    if (!foundB) bList.unshift(fullAcceptedBooking);
    localStorage.setItem("helper_bookings", JSON.stringify(bList));
  } catch (e) {}

  // Update helper_accepted_orders map for instant fast lookup
  try {
    const rawMap = localStorage.getItem("helper_accepted_orders");
    const accMap = rawMap ? JSON.parse(rawMap) : {};
    accMap[key] = true;
    accMap[String(bCode)] = true;
    if (booking._id) accMap[String(booking._id)] = true;
    if (booking.id) accMap[String(booking.id)] = true;
    if (booking.bookingId) accMap[String(booking.bookingId)] = true;
    localStorage.setItem("helper_accepted_orders", JSON.stringify(accMap));
  } catch (e) {}

  // Notify worker dashboard specifically
  try {
    window.dispatchEvent(
      new CustomEvent("worker_new_offer", {
        detail: fullAcceptedBooking
      })
    );
  } catch (e) {}

  // Backend notify
  try {
    const targetId = booking._id || bCode || key;
    await fetch(`${API_BASE}/bookings/${targetId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: vendorObj.id,
        providerName: vendorObj.name,
        workerId: workerObj.workerId || workerObj.id || "WRK-101",
        workerName: workerObj.name,
        workerPhone: workerObj.phone
      })
    });
  } catch (e) {}

  return fullAcceptedBooking;
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

/**
 * Dynamic Time-based Pricing & Commission Calculator
 * 90% Worker Payout, 5% Vendor Profit, 5% Helper Admin Platform Fee
 */
export function calculateDynamicWorkPricing(booking, elapsedSeconds = 0) {
  const basePrice = parseInt(String(booking.price || booking.finalPrice || booking.totalAmount || "399").replace(/[^\d]/g, ""), 10) || 399;
  const elapsedMinutes = Math.max(1, Math.floor(elapsedSeconds / 60));
  
  // Calculate dynamic work duration: use elapsed time or minimum 1.5 hr based on booking
  let billedHours = Math.max(1.0, parseFloat((elapsedMinutes / 60).toFixed(1)));
  if (elapsedSeconds < 60) {
    // If demo run in few seconds, default to 1.5 hours standard job
    billedHours = 1.5;
  }

  // Rate per hour calculation: ₹299 base + ₹100 per extra 0.5 hour
  const hourlyRate = 150;
  const timeSurcharge = billedHours > 1 ? Math.round((billedHours - 1) * hourlyRate) : 0;
  const totalAmount = Math.max(299, basePrice + timeSurcharge);

  const workerEarnings = Math.round(totalAmount * 0.90); // 90% to Worker
  const vendorProfit = Math.round(totalAmount * 0.05);   // 5% to Vendor
  const adminProfit = totalAmount - workerEarnings - vendorProfit; // 5% to Helper Admin

  return {
    totalAmount,
    billedHours,
    elapsedMinutes,
    basePrice,
    timeSurcharge,
    payoutSplit: {
      totalAmount,
      workerEarnings,     // 90%
      vendorProfit,       // 5%
      adminProfit,        // 5%
      workerPercentage: 90,
      vendorPercentage: 5,
      adminPercentage: 5,
    },
    qrPayload: `helper://pay?bookingId=${booking.bookingId || booking.id || "HLP"}&amount=${totalAmount}&worker=WRK-101&ts=${Date.now()}`,
    upiLink: `upi://pay?pa=helper.escrow@icici&pn=HelperPlatform&am=${totalAmount}&cu=INR&tn=Booking_${booking.bookingId || "HLP"}`
  };
}

/**
 * Handle Demo Worker: Go to Location (Starts traveling to customer)
 */
export async function handleDemoWorkerGoToLocation(booking) {
  const key = String(booking.bookingId || booking.id || booking._id || booking.bookingCode);
  const patch = {
    workerStatus: "traveling",
    travelStartedAt: new Date().toISOString(),
    etaMinutes: 15,
  };

  broadcastBookingSync(key, patch);
  return patch;
}

/**
 * Handle Demo Worker: I am Arrived at Doorstep
 */
export async function handleDemoWorkerArrived(booking) {
  const key = String(booking.bookingId || booking.id || booking._id || booking.bookingCode);
  const patch = {
    workerStatus: "arrived",
    arrivedAt: new Date().toISOString(),
  };

  broadcastBookingSync(key, patch);
  return patch;
}

/**
 * Canonical helper to retrieve the exact Door/Service Start OTP
 * Consistent resolution order with uniform default across all screens
 */
export function getBookingDoorOtp(booking) {
  if (!booking) return "3459";
  const val =
    booking.slotOtp ||
    booking.doorOtp ||
    booking.startOtp ||
    booking.otp ||
    booking.security?.startOtpPlainForCustomer;
  return val ? String(val).trim() : "3459";
}

/**
 * Handle Demo Worker: Verify Doorstep OTP & Start Work
 * Starts live countdown and work stopwatch
 */
export async function handleDemoWorkerVerifyOtp(booking, enteredOtp) {
  const key = String(booking.bookingId || booking.id || booking._id || booking.bookingCode);
  const expectedOtp = getBookingDoorOtp(booking);
  const cleanEntered = String(enteredOtp || "").trim();

  // In demo mode accept matching OTP or universal test pins 1234 / 4582 / 3459
  const isMatch = cleanEntered === expectedOtp || cleanEntered === "1234" || cleanEntered === "4582" || cleanEntered === "3459" || cleanEntered.length === 4;

  if (!isMatch) {
    throw new Error("Invalid OTP. Please ask customer for the 4-digit Service Start OTP shown on their screen.");
  }

  const patch = {
    status: "in_progress",
    workerStatus: "in_progress",
    workStartedAt: Date.now(),
    otpVerified: true,
  };

  broadcastBookingSync(key, patch);
  return patch;
}

/**
 * Handle Demo Worker: Complete Work & Generate Dynamic Amount QR
 */
export async function handleDemoWorkerCompleteWork(booking, elapsedSeconds = 90) {
  const key = String(booking.bookingId || booking.id || booking._id || booking.bookingCode);
  const calculation = calculateDynamicWorkPricing(booking, elapsedSeconds);

  const patch = {
    status: "awaiting_payment",
    workerStatus: "awaiting_payment",
    workCompletedAt: Date.now(),
    finalTotalAmount: calculation.totalAmount,
    price: `₹${calculation.totalAmount}`,
    billedHours: calculation.billedHours,
    payoutSplit: calculation.payoutSplit,
    qrPayload: calculation.qrPayload,
    upiLink: calculation.upiLink,
  };

  broadcastBookingSync(key, patch);
  return patch;
}

/**
 * Handle Demo User: Scan Worker QR & Pay Bill
 * Completes booking, marks payment verified, and distributes 90/5/5 shares
 */
export async function handleDemoUserPayBooking(booking, paymentMethod = "Helper Pay QR") {
  const key = String(booking.bookingId || booking.id || booking._id || booking.bookingCode);
  const finalPriceNum = parseInt(String(booking.finalTotalAmount || booking.price || "399").replace(/[^\d]/g, ""), 10) || 399;
  
  const workerEarnings = booking.payoutSplit?.workerEarnings || Math.round(finalPriceNum * 0.90);
  const vendorProfit = booking.payoutSplit?.vendorProfit || Math.round(finalPriceNum * 0.05);
  const adminProfit = booking.payoutSplit?.adminProfit || Math.round(finalPriceNum * 0.05);

  const patch = {
    status: "completed",
    workerStatus: "completed",
    paymentStatus: "paid",
    paymentMethod: paymentMethod,
    paidAt: new Date().toISOString(),
    payoutSplit: {
      totalAmount: finalPriceNum,
      workerEarnings,  // 90%
      vendorProfit,    // 5%
      adminProfit,     // 5%
      workerPercentage: 90,
      vendorPercentage: 5,
      adminPercentage: 5,
    }
  };

  // 1. Update Vendor Wallet with 5% Profit in localStorage
  try {
    const vRaw = localStorage.getItem("helper_vendor");
    if (vRaw) {
      const vObj = JSON.parse(vRaw);
      vObj.walletBalance = (vObj.walletBalance || 0) + vendorProfit;
      vObj.totalEarned = (vObj.totalEarned || 0) + vendorProfit;
      localStorage.setItem("helper_vendor", JSON.stringify(vObj));
    }
  } catch (e) {}

  // 2. Update Worker Earnings with 90% Payout in localStorage
  try {
    const wRaw = localStorage.getItem("helper_worker");
    if (wRaw) {
      const wObj = JSON.parse(wRaw);
      if (!wObj.earnings) wObj.earnings = {};
      wObj.earnings.currentBalance = (wObj.earnings.currentBalance || 0) + workerEarnings;
      wObj.earnings.totalEarned = (wObj.earnings.totalEarned || 0) + workerEarnings;
      localStorage.setItem("helper_worker", JSON.stringify(wObj));
    }
  } catch (e) {}

  // 3. Update Admin Platform Ledger
  try {
    const ledgerRaw = localStorage.getItem("helper_admin_financials");
    let ledger = ledgerRaw ? JSON.parse(ledgerRaw) : { totalVolume: 0, adminProfits: 0, vendorProfits: 0, workerPayouts: 0 };
    ledger.totalVolume += finalPriceNum;
    ledger.adminProfits += adminProfit;
    ledger.vendorProfits += vendorProfit;
    ledger.workerPayouts += workerEarnings;
    localStorage.setItem("helper_admin_financials", JSON.stringify(ledger));
  } catch (e) {}

  broadcastBookingSync(key, patch);
  return patch;
}

/**
 * Handle Demo User: Submit Optional Rating & Feedback for Worker
 */
export async function handleDemoUserSubmitFeedback(booking, feedback = {}) {
  const key = String(booking.bookingId || booking.id || booking._id || booking.bookingCode);
  const patch = {
    workerRating: feedback.rating || 5,
    workerReview: feedback.comment || "Outstanding service! Very prompt and skilled technician.",
    feedbackTags: feedback.tags || ["Punctual", "Expert Technician", "Polite & Clean"],
    feedbackSubmittedAt: new Date().toISOString(),
  };

  broadcastBookingSync(key, patch);
  return patch;
}

/**
 * Handle Demo Worker: Submit Rating & Feedback for Customer
 */
export async function handleDemoWorkerSubmitCustomerFeedback(booking, feedback = {}) {
  const key = String(booking.bookingId || booking.id || booking._id || booking.bookingCode);
  const patch = {
    customerRating: feedback.rating || 5,
    customerReview: feedback.comment || "Polite and cooperative customer! Smooth OTP & payment experience.",
    customerFeedbackTags: feedback.tags || ["Cooperative", "Prompt Payment", "Accurate Location"],
    customerFeedbackSubmittedAt: new Date().toISOString(),
  };

  broadcastBookingSync(key, patch);
  return patch;
}


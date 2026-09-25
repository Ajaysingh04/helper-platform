const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      unique: true,
      index: true,
      default: () => "HLP-" + Math.floor(10000 + Math.random() * 90000)
    },
    bookingId: {
      type: String,
      default: function() { return this.bookingCode; }
    },
    id: {
      type: String,
      default: function() { return this.bookingCode; }
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, trim: true },
    
    provider: { type: mongoose.Schema.Types.Mixed, ref: "Provider", index: true },
    providerId: { type: String, index: true },
    assignedProvider: { type: String },
    assignedProviderName: { type: String, default: "Searching Nearest Pro..." },
    phone: { type: String },
    address: { type: String },
    customerAddress: { type: String },
    price: { type: String },
    doorOtp: { type: String, default: "1234" },
    
    serviceName: { type: String, required: true, trim: true },
    service: { type: String },
    serviceCategory: { type: String, default: "General" },
    
    serviceAddress: {
      addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
      fullAddress: { type: String, default: "Ahinsa Tower, Indore, MP" },
      coordinates: { type: [Number], default: [77.3653, 28.6280] } // [lng, lat]
    },

    // 9-Stage Operational State Machine
    status: {
      type: String,
      enum: [
        "requested",
        "searching_provider",
        "assigned",
        "slot_confirmed",
        "accepted",
        "on_the_way",
        "arrived",
        "in_progress",
        "work_completed",
        "completed",
        "cancelled",
        "disputed",
        // Legacy uppercase aliases
        "Pending",
        "Confirmed",
        "In Progress",
        "Completed",
        "Cancelled"
      ],
      default: "assigned",
      index: true
    },

    // Problem Notes
    problemDescription: { type: String, default: "" },

    // Security & Slot Confirmation Protocol
    slotOtp: { type: String, default: () => Math.floor(1000 + Math.random() * 9000).toString() },
    slotConfirmed: { type: Boolean, default: false },
    slotConfirmedAt: { type: Date },
    startQrCode: { type: String },

    // Live Work Stopwatch & Dynamic Hourly Tracking
    workStartedAt: { type: Date },
    workEndedAt: { type: Date },
    workDurationSeconds: { type: Number, default: 0 },
    workDurationFormatted: { type: String, default: "0m" },
    homeServiceCharge: { type: Number, default: 149 },
    hourlyRate: { type: Number, default: 299 },
    finalCalculatedAmount: { type: Number },
    billBreakdown: { type: mongoose.Schema.Types.Mixed },

    // Security OTP Protocol
    security: {
      startOtpHash: { type: String },
      startOtpPlainForCustomer: { type: String }, // Shown ONLY in Customer API payload
      startOtpVerifiedAt: { type: Date }
    },

    isEmergency: { type: Boolean, default: false, index: true },
    scheduledDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    scheduledTime: { type: String, default: "11:00 AM" },
    scheduledTimestamp: { type: Number },
    
    // Algorithmic Pricing Breakdown
    pricing: {
      baseAmount: { type: Number, default: 149 },
      distanceCharge: { type: Number, default: 0 },
      emergencyCharge: { type: Number, default: 0 },
      nightSurgeCharge: { type: Number, default: 0 },
      platformFee: { type: Number, default: 29 },
      discountAmount: { type: Number, default: 0 },
      couponCode: { type: String },
      totalAmount: { type: Number, default: 328 },
      adminCommissionAmount: { type: Number, default: 59 },
      providerEarningsAmount: { type: Number, default: 269 }
    },

    paymentMode: {
      type: String,
      enum: ["razorpay_online", "upi", "cash_after_service", "wallet"],
      default: "cash_after_service"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "authorized", "captured", "refunded", "failed"],
      default: "pending",
      index: true
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,

    liveTracking: {
      providerCurrentCoords: [Number], // [lng, lat]
      etaMinutes: { type: Number, default: 25 },
      distanceRemainingKm: { type: Number, default: 3.2 },
      lastLocationUpdateAt: Date
    },

    cancellation: {
      cancelledBy: { type: String, enum: ["customer", "provider", "admin", "system_timeout"] },
      reason: String,
      cancelledAt: Date
    }
  },
  { timestamps: true }
);

BookingSchema.index({ "serviceAddress.coordinates": "2dsphere" });
BookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", BookingSchema);

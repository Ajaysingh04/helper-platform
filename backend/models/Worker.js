const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema(
  {
    workerId: {
      type: String,
      unique: true,
      index: true,
      default: () => "WRK-" + Math.floor(10000 + Math.random() * 90000)
    },
    id: {
      type: String,
      default: function() { return this.workerId; }
    },
    vendorId: {
      type: String,
      required: true,
      index: true
    },
    vendorName: {
      type: String,
      default: "Helper Partner"
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      default: "worker123"
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200"
    },
    address: {
      type: String,
      default: "City Center, Sector 18"
    },
    category: {
      type: String,
      required: true,
      index: true // e.g. "Plumber", "Electrician", "Driver (Chauffeur)", "AC Repair & Refill", "Carpenter", "Wall Painter", "Home Cleaner", "Nanny", "Chef", "Doctor"
    },
    skills: [
      {
        type: String
      }
    ],
    experienceYears: {
      type: Number,
      default: 3
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "verified",
      index: true
    },
    onboardingFeePaid: {
      type: Boolean,
      default: false
    },
    feeAmount: {
      type: Number,
      default: 399
    },
    feeTxnId: {
      type: String,
      default: ""
    },
    onboardingPaidAt: {
      type: Date
    },
    documents: {
      aadhaarNumber: { type: String, default: "" },
      aadhaarDoc: { type: String, default: "" },
      panNumber: { type: String, default: "" },
      panDoc: { type: String, default: "" },
      certificates: [{ type: String }],
      policeVerificationDoc: { type: String, default: "" }
    },
    availability: {
      isOnline: { type: Boolean, default: true, index: true },
      isEmergencyAvailable: { type: Boolean, default: true },
      workingHours: {
        start: { type: String, default: "08:00" },
        end: { type: String, default: "20:00" }
      },
      workingDays: {
        type: [String],
        default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      },
      leaves: [
        {
          id: { type: String, default: () => "LV-" + Math.floor(1000 + Math.random() * 9000) },
          startDate: { type: String },
          endDate: { type: String },
          reason: { type: String },
          status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
          appliedAt: { type: Date, default: Date.now }
        }
      ]
    },
    currentLocation: {
      coordinates: {
        type: [Number], // [lng, lat]
        default: [77.3653, 28.6280]
      },
      address: { type: String, default: "Sector 18, City Hub" },
      lastUpdated: { type: Date, default: Date.now }
    },
    performance: {
      completedJobs: { type: Number, default: 0 },
      rating: { type: Number, default: 4.9, min: 1, max: 5 },
      totalReviews: { type: Number, default: 0 },
      attendanceRate: { type: Number, default: 96 }, // %
      jobCompletionRate: { type: Number, default: 98 }, // %
      onTimeRate: { type: Number, default: 95 } // %
    },
    earnings: {
      salaryType: {
        type: String,
        enum: ["commission", "fixed", "hourly"],
        default: "commission"
      },
      commissionPercent: { type: Number, default: 90 }, // 90% to worker, 10% royalty to shop
      fixedMonthlySalary: { type: Number, default: 0 },
      hourlyRate: { type: Number, default: 249 },
      totalEarned: { type: Number, default: 0 },
      pendingPayout: { type: Number, default: 0 },
      payoutHistory: [
        {
          id: { type: String, default: () => "PAY-" + Math.floor(10000 + Math.random() * 90000) },
          amount: { type: Number, required: true },
          upiId: { type: String, required: true },
          date: { type: String, default: () => new Date().toISOString().split("T")[0] },
          status: { type: String, default: "Completed" },
          txHash: { type: String }
        }
      ]
    },
    attendance: [
      {
        id: { type: String, default: () => "ATT-" + Math.floor(10000 + Math.random() * 90000) },
        date: { type: String },
        checkIn: { type: String },
        checkOut: { type: String },
        status: { type: String, enum: ["present", "half_day", "leave", "holiday"], default: "present" },
        hours: { type: Number, default: 8 },
        location: { type: String, default: "Sector 18, City Hub" }
      }
    ]
  },
  { timestamps: true }
);

WorkerSchema.index({ "currentLocation.coordinates": "2dsphere" });
WorkerSchema.index({ vendorId: 1, status: 1 });

module.exports = mongoose.model("Worker", WorkerSchema);

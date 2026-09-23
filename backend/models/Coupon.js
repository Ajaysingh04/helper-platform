const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: String,
    discountType: { type: String, enum: ["percentage", "flat"], default: "percentage" },
    discountValue: { type: Number, required: true, min: 1 },
    maxDiscountAmount: { type: Number, default: 200 },
    minBookingAmount: { type: Number, default: 299 },
    validTill: { type: Date, required: true },
    usageLimitPerUser: { type: Number, default: 1 },
    totalUsageLimit: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);

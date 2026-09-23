const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["customer", "provider", "admin", "superadmin"],
      default: "customer",
      index: true
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200"
    },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    savedAddresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    walletBalance: { type: Number, default: 0, min: 0 },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fcmTokens: [{ type: String }],
    totalBookings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Encrypt password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);

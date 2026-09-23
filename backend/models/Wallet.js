const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
    ownerType: { type: String, required: true, enum: ["User", "Provider"], default: "Provider" },
    currentBalance: { type: Number, default: 0, min: 0 },
    lockedHoldBalance: { type: Number, default: 0, min: 0 },
    totalLifetimeEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", WalletSchema);

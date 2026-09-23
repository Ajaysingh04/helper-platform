const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", index: true },
    type: {
      type: String,
      enum: [
        "booking_payout",
        "admin_commission",
        "withdrawal",
        "refund",
        "emergency_bonus",
        "referral_bonus"
      ],
      required: true,
      index: true
    },
    direction: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    runningBalanceAfter: { type: Number, required: true },
    gatewayReference: String,
    status: { type: String, enum: ["pending", "success", "failed"], default: "success" },
    description: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);

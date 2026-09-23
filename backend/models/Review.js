const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    reviewText: { type: String, trim: true, default: "" },
    servicePunctuality: { type: Number, min: 1, max: 5, default: 5 },
    workQuality: { type: Number, min: 1, max: 5, default: 5 },
    behaviorRating: { type: Number, min: 1, max: 5, default: 5 },
    helpfulCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);

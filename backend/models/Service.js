const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    duration: { type: String, default: "1 hr" },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80"
    },
    popular: { type: Boolean, default: false },
    description: { type: String, default: "" },
    highlights: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);

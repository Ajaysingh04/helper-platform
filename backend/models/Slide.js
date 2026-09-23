const mongoose = require("mongoose");

const SlideSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    desc: { type: String },
    badge: { type: String },
    tag: { type: String },
    discount: { type: String },
    code: { type: String },
    bgGradient: { type: String },
    image: { type: String },
    ctaText: { type: String, default: "Book Now" },
    btnText: { type: String, default: "Book Now" },
    ctaLink: { type: String, default: "/services" },
    actionPath: { type: String, default: "/services" },
    icon: { type: String, default: "🎁" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slide", SlideSchema);

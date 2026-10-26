const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "global_settings" },
    platformCommission: { type: mongoose.Schema.Types.Mixed, default: "12%" },
    serviceRadius: { type: String, default: "20 km" },
    supportHotline: { type: String, default: "+91 98765 43210" },
    supportEmail: { type: String, default: "ajayworkon04@gmail.com" },
    maintenanceMode: { type: Boolean, default: false },
    instantBookingEnabled: { type: Boolean, default: true },
    taxPercent: { type: String, default: "5%" },
    appName: { type: String, default: "Helper" },
    appLogo: { type: String, default: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=120&q=80" },
    primaryColor: { type: String, default: "#FF4D2D" },
    accentColor: { type: String, default: "#10B981" },
    expertShowcaseImage: { type: String, default: "/images/verified_expert_pro.jpg" },
    heroSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        slideSpeed: 2500,
        continuousSlide: true,
        showIndicators: false,
        imagePosition: "center top"
      }
    },
    heroBanners: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    }
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);

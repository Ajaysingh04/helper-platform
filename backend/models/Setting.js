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
    taxPercent: { type: String, default: "5%" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", SettingSchema);

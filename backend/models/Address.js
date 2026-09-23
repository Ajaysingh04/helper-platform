const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tag: { type: String, enum: ["home", "work", "other"], default: "home" },
    flatBuilding: { type: String, required: true, trim: true },
    streetArea: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, index: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

AddressSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Address", AddressSchema);

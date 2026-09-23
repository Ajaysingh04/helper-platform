const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema(
  {
    id: { type: String, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true },
    name: { type: String, required: true, trim: true }, // Service man / Specialist name
    shopName: { type: String, trim: true }, // Service / Business / Centre name
    category: { type: String, required: true, index: true }, // Category (e.g. "Body Massage Centres", "Plumbing")
    serviceCategories: [{ type: String, index: true }],
    servicesOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    phone: { type: String, required: true, index: true }, // Contact number
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, default: "vendor123" },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200"
    },
    hourlyRate: { type: String, default: "₹299/hr" },
    location: { type: String, default: "Sector 18, Central Zone" },
    address: { type: String, default: "14 Palm Avenue, Metro Zone, City Central" },
    experience: { type: String, default: "5+ Years" }, // Experience text (e.g. "8+ Years")
    experienceYears: { type: Number, default: 5 },
    distance: { type: String, default: "1.2 km" }, // Distance in KM
    distanceKm: { type: Number, default: 1.2 },
    rating: { type: Number, default: 4.9, min: 1, max: 5, index: true }, // Rating
    totalReviewsCount: { type: Number, default: 120 },
    jobsCompleted: { type: Number, default: 45 },
    verified: { type: Boolean, default: true },
    status: { type: String, default: "Active" },
    bio: { type: String, default: "Certified expert with background verified tools and warranty-backed service." },
    facilities: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Provider", ProviderSchema);

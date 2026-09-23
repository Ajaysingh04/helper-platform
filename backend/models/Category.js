const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "🔧" },
    path: { type: String },
    count: { type: String, default: "50+ Pros" },
    tag: { type: String, default: "General" },
    group: { type: String, default: "Services" },
    popular: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);

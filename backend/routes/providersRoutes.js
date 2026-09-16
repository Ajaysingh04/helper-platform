const express = require("express");
const router = express.Router();
const dbStore = require("../data/dbStore");

// GET /api/providers
router.get("/", (req, res) => {
  const { category, verified } = req.query;
  let providers = dbStore.getAll("providers");
  if (category) {
    providers = providers.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  if (verified !== undefined) {
    providers = providers.filter((p) => String(p.verified) === verified);
  }
  res.json({ success: true, count: providers.length, data: providers });
});

// GET /api/providers/:id
router.get("/:id", (req, res) => {
  const provider = dbStore.getById("providers", req.params.id);
  if (!provider) {
    return res.status(404).json({ success: false, message: "Provider not found" });
  }
  res.json({ success: true, data: provider });
});

// POST /api/providers
router.post("/", (req, res) => {
  const { name, category, phone, location, experience } = req.body;
  if (!name || !category || !phone) {
    return res.status(400).json({ success: false, message: "Name, category, and phone are required" });
  }

  const newProvider = {
    id: `p${Date.now()}`,
    name,
    category,
    experience: experience || "3+ Years",
    rating: 5.0,
    jobsCompleted: 0,
    verified: false,
    phone,
    location: location || "Delhi NCR",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
  };

  const saved = dbStore.insert("providers", newProvider);
  res.status(201).json({ success: true, message: "Provider profile created successfully", data: saved });
});

// PUT /api/providers/:id
router.put("/:id", (req, res) => {
  const updated = dbStore.update("providers", req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Provider not found" });
  }
  res.json({ success: true, message: "Provider profile updated successfully", data: updated });
});

// DELETE /api/providers/:id
router.delete("/:id", (req, res) => {
  const success = dbStore.delete("providers", req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: "Provider not found" });
  }
  res.json({ success: true, message: "Provider deleted successfully" });
});

module.exports = router;

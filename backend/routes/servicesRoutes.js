const express = require("express");
const router = express.Router();
const dbStore = require("../data/dbStore");

// GET /api/services
router.get("/", (req, res) => {
  const services = dbStore.getAll("services");
  res.json({ success: true, count: services.length, data: services });
});

// GET /api/services/:id
router.get("/:id", (req, res) => {
  const service = dbStore.getById("services", req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }
  res.json({ success: true, data: service });
});

// POST /api/services
router.post("/", (req, res) => {
  const { name, category, price, originalPrice, duration, description, image, popular, highlights } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ success: false, message: "Name, category, and price are required" });
  }

  const newService = {
    id: `s${Date.now()}`,
    name,
    category,
    price: Number(price),
    originalPrice: Number(originalPrice || price * 1.3),
    rating: 5.0,
    reviewsCount: 1,
    duration: duration || "1 hr",
    description: description || "",
    image: image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    popular: Boolean(popular),
    highlights: Array.isArray(highlights) ? highlights : ["Professional service", "Verified provider"]
  };

  const saved = dbStore.insert("services", newService);
  res.status(201).json({ success: true, message: "Service created successfully", data: saved });
});

// PUT /api/services/:id
router.put("/:id", (req, res) => {
  const updated = dbStore.update("services", req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }
  res.json({ success: true, message: "Service updated successfully", data: updated });
});

// DELETE /api/services/:id
router.delete("/:id", (req, res) => {
  const success = dbStore.delete("services", req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }
  res.json({ success: true, message: "Service deleted successfully" });
});

module.exports = router;

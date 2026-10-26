const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const dbStore = require("../data/dbStore");
const { getStatus } = require("../config/db");

// GET /api/services
router.get("/", async (req, res) => {
  try {
    if (getStatus()) {
      const services = await Service.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: services.length, data: services });
    }
    const services = dbStore.getAll("services");
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/services/:id
router.get("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      const service = await Service.findOne({ id: req.params.id }) || await Service.findById(req.params.id).catch(() => null);
      if (!service) return res.status(404).json({ success: false, message: "Service not found" });
      return res.json({ success: true, data: service });
    }
    const service = dbStore.getById("services", req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/services
router.post("/", async (req, res) => {
  try {
    const { name, category, price, originalPrice, duration, description, image, popular, highlights } = req.body;
    if (!name || !name.trim() || !category || !price) {
      return res.status(400).json({ success: false, message: "Name, category, and price are required" });
    }

    const trimmedName = name.trim();

    // Check duplicate service name (case-insensitive)
    if (getStatus()) {
      const existing = await Service.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, "i") }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: "This name is already in use" });
      }
    } else {
      const all = dbStore.getAll("services") || [];
      const existing = all.find(s => (s.name || "").trim().toLowerCase() === trimmedName.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: "This name is already in use" });
      }
    }

    const newService = {
      id: `s${Date.now()}`,
      name: trimmedName,
      category: category.trim(),
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

    if (getStatus()) {
      const saved = await Service.create(newService);
      return res.status(201).json({ success: true, message: "Service created successfully", data: saved });
    }

    const saved = dbStore.insert("services", newService);
    res.status(201).json({ success: true, message: "Service created successfully", data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/services/:id
router.put("/:id", async (req, res) => {
  try {
    const { name, category, price, originalPrice, duration, description, image } = req.body;
    const servId = req.params.id;

    if (getStatus()) {
      const currentService = await Service.findOne({ id: servId }) || await Service.findById(servId).catch(() => null);
      if (!currentService) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }

      const oldName = currentService.name;
      const newName = name ? name.trim() : oldName;

      // If name is changing, check for duplicates (case-insensitive, excluding this service)
      if (name && newName.toLowerCase() !== oldName.toLowerCase()) {
        const existing = await Service.findOne({
          _id: { $ne: currentService._id },
          id: { $ne: servId },
          name: { $regex: new RegExp(`^${newName}$`, "i") }
        });
        if (existing) {
          return res.status(400).json({ success: false, message: "This name is already in use" });
        }
      }

      const updatePayload = { ...req.body };
      if (name) updatePayload.name = newName;
      if (category) updatePayload.category = category.trim();

      const updated = await Service.findByIdAndUpdate(currentService._id, updatePayload, { returnDocument: 'after' });

      // CASCADE: If name changed, update all bookings referencing oldName
      if (newName.toLowerCase() !== oldName.toLowerCase()) {
        console.log(`[Service Update] Cascading service name change from "${oldName}" to "${newName}"`);
        await Booking.updateMany(
          {
            $or: [
              { serviceName: { $regex: new RegExp(`^${oldName}$`, "i") } },
              { service: currentService.id || currentService._id.toString() }
            ]
          },
          { $set: { serviceName: newName, service: newName } }
        );
      }

      return res.json({ success: true, message: "Service updated successfully", data: updated });
    }

    // Local DB / dbStore fallback
    const all = dbStore.getAll("services") || [];
    const currentService = all.find(s => s.id === servId || s._id === servId);
    if (!currentService) return res.status(404).json({ success: false, message: "Service not found" });

    const oldName = currentService.name;
    const newName = name ? name.trim() : oldName;

    if (name && newName.toLowerCase() !== oldName.toLowerCase()) {
      const existing = all.find(s => (s.id !== servId && s._id !== servId) && (s.name || "").trim().toLowerCase() === newName.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: "This name is already in use" });
      }
    }

    const updated = dbStore.update("services", servId, { ...req.body, name: newName });
    res.json({ success: true, message: "Service updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/services/:id
router.delete("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      let deleted = await Service.findOneAndDelete({ id: req.params.id });
      if (!deleted) {
        deleted = await Service.findByIdAndDelete(req.params.id).catch(() => null);
      }
      if (!deleted) return res.status(404).json({ success: false, message: "Service not found" });
      return res.json({ success: true, message: "Service deleted successfully" });
    }

    const success = dbStore.delete("services", req.params.id);
    if (!success) return res.status(404).json({ success: false, message: "Service not found" });
    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

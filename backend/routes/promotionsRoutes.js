const express = require("express");
const router = express.Router();
const Slide = require("../models/Slide");
const dbStore = require("../data/dbStore");
const { getStatus } = require("../config/db");

// GET /api/promotions (slides)
router.get("/", async (req, res) => {
  try {
    if (getStatus()) {
      const slides = await Slide.find().sort({ createdAt: 1 });
      return res.json({ success: true, count: slides.length, data: slides });
    }
    const slides = dbStore.getAll("slides");
    res.json({ success: true, count: slides.length, data: slides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/promotions
router.post("/", async (req, res) => {
  try {
    const { title, subtitle, desc, badge, tag, discount, code, bgGradient, image, ctaText, btnText, ctaLink, actionPath } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Slide title is required" });
    }

    const newSlide = {
      id: `sl${Date.now()}`,
      title,
      subtitle: subtitle || desc || "",
      desc: desc || subtitle || "",
      badge: badge || tag || "Special Promo",
      tag: tag || badge || "Special Promo",
      discount: discount || "Special Offer",
      code: code || "HELPER",
      bgGradient: bgGradient || "linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(168, 85, 247, 0.85) 100%)",
      image: image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
      ctaText: ctaText || btnText || "Explore Now",
      btnText: btnText || ctaText || "Explore Now",
      ctaLink: ctaLink || actionPath || "/services",
      actionPath: actionPath || ctaLink || "/services",
      active: true
    };

    if (getStatus()) {
      const saved = await Slide.create(newSlide);
      return res.status(201).json({ success: true, message: "Promotion slide added", data: saved });
    }

    const saved = dbStore.insert("slides", newSlide);
    res.status(201).json({ success: true, message: "Promotion slide added", data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/promotions/:id
router.put("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      let updated = await Slide.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
      if (!updated) {
        updated = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true }).catch(() => null);
      }
      if (!updated) return res.status(404).json({ success: false, message: "Slide not found" });
      return res.json({ success: true, message: "Promotion slide updated", data: updated });
    }

    const updated = dbStore.update("slides", req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Slide not found" });
    res.json({ success: true, message: "Promotion slide updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/promotions/:id
router.delete("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      let deleted = await Slide.findOneAndDelete({ id: req.params.id });
      if (!deleted) {
        deleted = await Slide.findByIdAndDelete(req.params.id).catch(() => null);
      }
      if (!deleted) return res.status(404).json({ success: false, message: "Slide not found" });
      return res.json({ success: true, message: "Promotion slide deleted" });
    }

    const success = dbStore.delete("slides", req.params.id);
    if (!success) return res.status(404).json({ success: false, message: "Slide not found" });
    res.json({ success: true, message: "Promotion slide deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

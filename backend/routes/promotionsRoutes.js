const express = require("express");
const router = express.Router();
const dbStore = require("../data/dbStore");

// GET /api/promotions (slides)
router.get("/", (req, res) => {
  const slides = dbStore.getAll("slides");
  res.json({ success: true, count: slides.length, data: slides });
});

// POST /api/promotions
router.post("/", (req, res) => {
  const { title, subtitle, badge, discount, code, bgGradient, image, ctaText, ctaLink } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: "Slide title is required" });
  }

  const newSlide = {
    id: `sl${Date.now()}`,
    title,
    subtitle: subtitle || "",
    badge: badge || "Special Promo",
    discount: discount || "Special Offer",
    code: code || "HELPER",
    bgGradient: bgGradient || "linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(168, 85, 247, 0.85) 100%)",
    image: image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    ctaText: ctaText || "Explore Now",
    ctaLink: ctaLink || "/services"
  };

  const saved = dbStore.insert("slides", newSlide);
  res.status(201).json({ success: true, message: "Promotion slide added", data: saved });
});

// PUT /api/promotions/:id
router.put("/:id", (req, res) => {
  const updated = dbStore.update("slides", req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Slide not found" });
  }
  res.json({ success: true, message: "Promotion slide updated", data: updated });
});

// DELETE /api/promotions/:id
router.delete("/:id", (req, res) => {
  const success = dbStore.delete("slides", req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: "Slide not found" });
  }
  res.json({ success: true, message: "Promotion slide deleted" });
});

module.exports = router;

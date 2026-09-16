const express = require("express");
const router = express.Router();
const dbStore = require("../data/dbStore");

// GET /api/settings
router.get("/", (req, res) => {
  const settings = dbStore.getSettings();
  res.json({ success: true, data: settings });
});

// PUT /api/settings
router.put("/", (req, res) => {
  const updated = dbStore.updateSettings(req.body);
  res.json({ success: true, message: "Settings updated successfully", data: updated });
});

// POST /api/settings/reset
router.post("/reset", (req, res) => {
  const data = dbStore.resetAll();
  res.json({ success: true, message: "Factory data reset completed", data });
});

module.exports = router;

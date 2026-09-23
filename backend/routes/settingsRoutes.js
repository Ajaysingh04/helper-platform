const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");
const dbStore = require("../data/dbStore");
const { getStatus } = require("../config/db");

// GET /api/settings
router.get("/", async (req, res) => {
  try {
    if (getStatus()) {
      let settings = await Setting.findOne({ key: "global_settings" });
      if (!settings) {
        settings = await Setting.create({ key: "global_settings" });
      }
      return res.json({ success: true, data: settings });
    }
    const settings = dbStore.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/settings
router.put("/", async (req, res) => {
  try {
    if (getStatus()) {
      const updated = await Setting.findOneAndUpdate(
        { key: "global_settings" },
        { $set: req.body },
        { new: true, upsert: true }
      );
      return res.json({ success: true, message: "Settings updated successfully", data: updated });
    }

    const updated = dbStore.updateSettings(req.body);
    res.json({ success: true, message: "Settings updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/settings/reset
router.post("/reset", async (req, res) => {
  try {
    const data = dbStore.resetAll();
    res.json({ success: true, message: "Factory data reset completed", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

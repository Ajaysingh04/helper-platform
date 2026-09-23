const express = require("express");
const router = express.Router();
const User = require("../models/User");
const dbStore = require("../data/dbStore");
const { getStatus } = require("../config/db");

// GET /api/users
router.get("/", async (req, res) => {
  try {
    if (getStatus()) {
      const users = await User.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, data: users });
    }
    const users = dbStore.getAll("users");
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      const user = await User.findOne({ id: req.params.id }) || await User.findById(req.params.id).catch(() => null);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      return res.json({ success: true, data: user });
    }
    const user = dbStore.getById("users", req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone are required" });
    }

    const newUser = {
      id: `u${Date.now()}`,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone,
      role: role || "Customer",
      totalBookings: 0,
      bookingsCount: 0,
      status: "Active",
      joined: new Date().toISOString().split("T")[0]
    };

    if (getStatus()) {
      const saved = await User.create(newUser);
      return res.status(201).json({ success: true, message: "User account created", data: saved });
    }

    const saved = dbStore.insert("users", newUser);
    res.status(201).json({ success: true, message: "User account created", data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      let updated = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
      if (!updated) {
        updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).catch(() => null);
      }
      if (!updated) return res.status(404).json({ success: false, message: "User not found" });
      return res.json({ success: true, message: "User updated successfully", data: updated });
    }

    const updated = dbStore.update("users", req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      let deleted = await User.findOneAndDelete({ id: req.params.id });
      if (!deleted) {
        deleted = await User.findByIdAndDelete(req.params.id).catch(() => null);
      }
      if (!deleted) return res.status(404).json({ success: false, message: "User not found" });
      return res.json({ success: true, message: "User removed successfully" });
    }

    const success = dbStore.delete("users", req.params.id);
    if (!success) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

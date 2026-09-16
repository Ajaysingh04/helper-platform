const express = require("express");
const router = express.Router();
const dbStore = require("../data/dbStore");

// GET /api/users
router.get("/", (req, res) => {
  const users = dbStore.getAll("users");
  res.json({ success: true, count: users.length, data: users });
});

// GET /api/users/:id
router.get("/:id", (req, res) => {
  const user = dbStore.getById("users", req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, data: user });
});

// POST /api/users
router.post("/", (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: "Name and phone are required" });
  }

  const newUser = {
    id: `u${Date.now()}`,
    name,
    email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    phone,
    totalBookings: 0,
    status: "Active",
    joined: new Date().toISOString().split("T")[0]
  };

  const saved = dbStore.insert("users", newUser);
  res.status(201).json({ success: true, message: "User account created", data: saved });
});

// PUT /api/users/:id
router.put("/:id", (req, res) => {
  const updated = dbStore.update("users", req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, message: "User updated successfully", data: updated });
});

// DELETE /api/users/:id
router.delete("/:id", (req, res) => {
  const success = dbStore.delete("users", req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, message: "User removed successfully" });
});

module.exports = router;

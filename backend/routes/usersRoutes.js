const express = require("express");
const router = express.Router();
const User = require("../models/User");
const dbStore = require("../data/dbStore");
const { getStatus } = require("../config/db");
const mongoose = require("mongoose");

// GET /api/users
router.get("/", async (req, res) => {
  try {
    let allBookings = [];
    if (getStatus()) {
      const Booking = require("../models/Booking");
      allBookings = await Booking.find().lean().catch(() => []);
    } else {
      allBookings = dbStore.getAll("bookings") || [];
    }

    if (getStatus()) {
      const users = await User.find().sort({ createdAt: -1 });
      const mapped = users.map(u => {
        const uObj = u.toObject ? u.toObject() : u;
        const isBlocked = Boolean(uObj.isBlocked || uObj.status === "Blocked" || uObj.status === "Suspended");
        const status = isBlocked ? "Suspended" : (uObj.status || (uObj.isActive === false ? "Suspended" : "Active"));

        const cleanPhone = String(uObj.phone || "").replace(/\D/g, "");
        const userBookings = (allBookings || []).filter(b => {
          const bPhone = String(b.customerPhone || b.phone || "").replace(/\D/g, "");
          const bEmail = String(b.customerEmail || b.email || "").toLowerCase().trim();
          const uEmail = String(uObj.email || "").toLowerCase().trim();
          const bUserId = String(b.userId || b.customerId || "");
          const uId = String(uObj.id || uObj._id || "");
          return (cleanPhone && bPhone && bPhone.endsWith(cleanPhone.slice(-10))) ||
                 (uEmail && bEmail && bEmail === uEmail) ||
                 (uId && bUserId && bUserId === uId);
        });

        const totalBookings = Math.max(userBookings.length, uObj.totalBookings || 0, uObj.bookingsCount || 0);
        const source = uObj.source || (uObj.phone && !uObj.email?.includes('@example.com') ? "app" : "web");
        const avatar = uObj.avatar || uObj.photo || uObj.profileImage || uObj.image || "";

        return {
          ...uObj,
          id: uObj.id || String(uObj._id),
          _id: uObj._id,
          status,
          isBlocked,
          source,
          avatar,
          photo: avatar,
          bookingsCount: totalBookings,
          totalBookings: totalBookings,
          joined: uObj.createdAt ? new Date(uObj.createdAt).toISOString().split("T")[0] : (uObj.joined || "Recently")
        };
      });
      return res.json({ success: true, count: mapped.length, data: mapped });
    }

    const rawUsers = dbStore.getAll("users") || [];
    const users = rawUsers.map(u => {
      const isBlocked = Boolean(u.isBlocked || u.status === "Blocked" || u.status === "Suspended");
      const status = isBlocked ? "Suspended" : (u.status || (u.isActive === false ? "Suspended" : "Active"));
      const cleanPhone = String(u.phone || "").replace(/\D/g, "");
      const userBookings = (allBookings || []).filter(b => {
        const bPhone = String(b.customerPhone || b.phone || "").replace(/\D/g, "");
        const bEmail = String(b.customerEmail || b.email || "").toLowerCase().trim();
        const uEmail = String(u.email || "").toLowerCase().trim();
        const bUserId = String(b.userId || b.customerId || "");
        const uId = String(u.id || u._id || "");
        return (cleanPhone && bPhone && bPhone.endsWith(cleanPhone.slice(-10))) ||
               (uEmail && bEmail && bEmail === uEmail) ||
               (uId && bUserId && bUserId === uId);
      });
      const totalBookings = Math.max(userBookings.length, u.totalBookings || 0, u.bookingsCount || 0);
      const source = u.source || (u.phone && !u.email?.includes('@example.com') ? "app" : "web");
      const avatar = u.avatar || u.photo || u.profileImage || u.image || "";

      return {
        ...u,
        status,
        isBlocked,
        source,
        avatar,
        photo: avatar,
        bookingsCount: totalBookings,
        totalBookings: totalBookings,
      };
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      const filter = mongoose.Types.ObjectId.isValid(req.params.id)
        ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
        : { id: req.params.id };

      const user = await User.findOne(filter);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      const uObj = user.toObject ? user.toObject() : user;
      return res.json({
        success: true,
        data: {
          ...uObj,
          id: uObj.id || String(uObj._id),
          status: uObj.isBlocked ? "Suspended" : (uObj.status || "Active")
        }
      });
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
      role: role || "customer",
      totalBookings: 0,
      bookingsCount: 0,
      status: "Active",
      isBlocked: false,
      isActive: true,
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

// PUT /api/users/:id/block
router.put("/:id/block", async (req, res) => {
  try {
    const { isBlocked, status } = req.body || {};
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    let target = null;
    if (getStatus()) {
      target = await User.findOne(filter);
    }
    if (!target) {
      target = dbStore.getById("users", req.params.id);
    }
    if (!target) return res.status(404).json({ success: false, message: "User not found" });

    const newBlocked = typeof isBlocked === "boolean" ? isBlocked : !(target.isBlocked || target.status === "Blocked" || target.status === "Suspended");
    const newStatus = status || (newBlocked ? "Suspended" : "Active");
    const updatePayload = { isBlocked: newBlocked, status: newStatus, isActive: !newBlocked };

    if (getStatus()) {
      let updated = await User.findOneAndUpdate(filter, { $set: updatePayload }, { new: true });
      dbStore.update("users", req.params.id, updatePayload);
      return res.json({ success: true, message: `User account is now ${newStatus}`, data: updated });
    }

    const updated = dbStore.update("users", req.params.id, updatePayload);
    res.json({ success: true, message: `User account is now ${newStatus}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;

    if (updateData.status) {
      if (updateData.status === "Blocked" || updateData.status === "Suspended" || updateData.status === "blocked") {
        updateData.isBlocked = true;
        updateData.isActive = false;
        updateData.status = "Suspended";
      } else if (updateData.status === "Active") {
        updateData.isBlocked = false;
        updateData.isActive = true;
        updateData.status = "Active";
      }
    }
    if (typeof updateData.isBlocked === "boolean") {
      updateData.status = updateData.isBlocked ? "Suspended" : "Active";
      updateData.isActive = !updateData.isBlocked;
    }

    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    if (getStatus()) {
      let updated = await User.findOneAndUpdate(filter, { $set: updateData }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "User not found" });
      dbStore.update("users", req.params.id, updateData);
      return res.json({ success: true, message: "User updated successfully", data: updated });
    }

    const updated = dbStore.update("users", req.params.id, updateData);
    if (!updated) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    if (getStatus()) {
      let deleted = await User.findOneAndDelete(filter);
      dbStore.delete("users", req.params.id);
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

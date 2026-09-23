const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const dbStore = require("../data/dbStore");
const { getStatus } = require("../config/db");

// GET /api/tickets
router.get("/", async (req, res) => {
  try {
    if (getStatus()) {
      const tickets = await Ticket.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: tickets.length, data: tickets });
    }
    const tickets = dbStore.getAll("tickets");
    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tickets
router.post("/", async (req, res) => {
  try {
    const { customerName, name, email, phone, subject, priority, description, message } = req.body;
    const finalName = customerName || name;
    if (!finalName || !subject) {
      return res.status(400).json({ success: false, message: "Customer name and subject are required" });
    }

    const newTicket = {
      id: `TK-${Math.floor(100 + Math.random() * 900)}`,
      customerName: finalName,
      name: finalName,
      email: email || "",
      phone: phone || "",
      subject,
      message: message || description || "",
      priority: priority || "Medium",
      status: "Open",
      date: new Date().toISOString().split("T")[0]
    };

    if (getStatus()) {
      const saved = await Ticket.create(newTicket);
      return res.status(201).json({ success: true, message: "Support ticket registered", data: saved });
    }

    const saved = dbStore.insert("tickets", newTicket);
    res.status(201).json({ success: true, message: "Support ticket registered", data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/tickets/:id
router.put("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      let updated = await Ticket.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
      if (!updated) {
        updated = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true }).catch(() => null);
      }
      if (!updated) return res.status(404).json({ success: false, message: "Ticket not found" });
      return res.json({ success: true, message: "Ticket updated", data: updated });
    }

    const updated = dbStore.update("tickets", req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Ticket not found" });
    res.json({ success: true, message: "Ticket updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/tickets/:id
router.delete("/:id", async (req, res) => {
  try {
    if (getStatus()) {
      let deleted = await Ticket.findOneAndDelete({ id: req.params.id });
      if (!deleted) {
        deleted = await Ticket.findByIdAndDelete(req.params.id).catch(() => null);
      }
      if (!deleted) return res.status(404).json({ success: false, message: "Ticket not found" });
      return res.json({ success: true, message: "Ticket deleted" });
    }

    const success = dbStore.delete("tickets", req.params.id);
    if (!success) return res.status(404).json({ success: false, message: "Ticket not found" });
    res.json({ success: true, message: "Ticket deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

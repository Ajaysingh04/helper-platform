const express = require("express");
const router = express.Router();
const dbStore = require("../data/dbStore");

// GET /api/tickets
router.get("/", (req, res) => {
  const tickets = dbStore.getAll("tickets");
  res.json({ success: true, count: tickets.length, data: tickets });
});

// POST /api/tickets
router.post("/", (req, res) => {
  const { customerName, subject, priority, description } = req.body;
  if (!customerName || !subject) {
    return res.status(400).json({ success: false, message: "Customer name and subject are required" });
  }

  const newTicket = {
    id: `TK-${Math.floor(100 + Math.random() * 900)}`,
    customerName,
    subject,
    priority: priority || "Medium",
    status: "Open",
    date: new Date().toISOString().split("T")[0],
    description: description || ""
  };

  const saved = dbStore.insert("tickets", newTicket);
  res.status(201).json({ success: true, message: "Support ticket registered", data: saved });
});

// PUT /api/tickets/:id
router.put("/:id", (req, res) => {
  const updated = dbStore.update("tickets", req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Ticket not found" });
  }
  res.json({ success: true, message: "Ticket updated", data: updated });
});

// DELETE /api/tickets/:id
router.delete("/:id", (req, res) => {
  const success = dbStore.delete("tickets", req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: "Ticket not found" });
  }
  res.json({ success: true, message: "Ticket deleted" });
});

module.exports = router;

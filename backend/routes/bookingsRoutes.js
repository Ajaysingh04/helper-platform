const express = require("express");
const router = express.Router();
const dbStore = require("../data/dbStore");

// GET /api/bookings
router.get("/", (req, res) => {
  const { status, customerPhone } = req.query;
  let bookings = dbStore.getAll("bookings");
  if (status) {
    bookings = bookings.filter((b) => b.status.toLowerCase() === status.toLowerCase());
  }
  if (customerPhone) {
    bookings = bookings.filter((b) => b.customerPhone === customerPhone);
  }
  res.json({ success: true, count: bookings.length, data: bookings });
});

// GET /api/bookings/:id
router.get("/:id", (req, res) => {
  const booking = dbStore.getById("bookings", req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.json({ success: true, data: booking });
});

// POST /api/bookings
router.post("/", (req, res) => {
  const { customerName, customerPhone, customerAddress, serviceName, servicePrice, date, time } = req.body;
  if (!customerName || !customerPhone || !serviceName) {
    return res.status(400).json({ success: false, message: "Customer details and service name are required" });
  }

  const newBooking = {
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName,
    customerPhone,
    customerAddress: customerAddress || "Customer Address Provided",
    serviceName,
    servicePrice: Number(servicePrice || 0),
    date: date || new Date().toISOString().split("T")[0],
    time: time || "10:00 AM",
    status: "Pending",
    assignedProvider: "Unassigned",
    createdAt: new Date().toISOString().replace("T", " ").substring(0, 16)
  };

  const saved = dbStore.insert("bookings", newBooking);
  res.status(201).json({ success: true, message: "Booking registered successfully", data: saved });
});

// PUT /api/bookings/:id
router.put("/:id", (req, res) => {
  const updated = dbStore.update("bookings", req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.json({ success: true, message: "Booking updated successfully", data: updated });
});

// DELETE /api/bookings/:id
router.delete("/:id", (req, res) => {
  const success = dbStore.delete("bookings", req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.json({ success: true, message: "Booking deleted successfully" });
});

module.exports = router;

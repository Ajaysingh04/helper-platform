const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    customerName: { type: String },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String },
    priority: { type: String, default: "Medium" },
    status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
    date: { type: String, default: "Today" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "*"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Helper REST API Server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use("/api/services", require("./routes/servicesRoutes"));
app.use("/api/categories", require("./routes/categoriesRoutes"));
app.use("/api/bookings", require("./routes/bookingsRoutes"));
app.use("/api/providers", require("./routes/providersRoutes"));
app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/promotions", require("./routes/promotionsRoutes"));
app.use("/api/tickets", require("./routes/ticketsRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// 404 Route handler
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Helper API Server running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

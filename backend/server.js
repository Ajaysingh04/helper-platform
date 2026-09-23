const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
// Reload trigger: 2026-09-22T17:11

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const { initSocket } = require("./services/socketService");
initSocket(io);

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from localhost, Vercel, or mobile/REST clients
    callback(null, true);
  },
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

const { connectDB, getStatus } = require("./config/db");

// Connect to MongoDB
connectDB();

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: getStatus() ? "MongoDB Connected" : "Local Database Mode (Fallback)",
    mongoConnected: getStatus(),
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
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/payments", require("./routes/paymentsRoutes"));

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

server.listen(PORT, () => {
  console.log(`🚀 Helper HTTP + WebSocket Server running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

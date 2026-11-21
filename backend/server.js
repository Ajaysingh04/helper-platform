const express = require("express");
const http = require("http");
const fs = require("fs");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
process.on('uncaughtException', err => console.error('Unhandled Exception:', err));
process.on('unhandledRejection', reason => console.error('Unhandled Rejection:', reason));
// Reload trigger: 2026-09-29T11:55

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

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static images (Helper uniform photos, banners & assets)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "public", "uploads", req.params.filename);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  return res.status(404).json({ success: false, error: "Uploaded file not found" });
});
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(express.static(path.join(__dirname, "public")));

// Serve compiled React frontend (Admin panel, Web Portal)
const frontendBuildPath = path.join(__dirname, "..", "frontend", "build");
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// URL Normalization Middleware (rewrite /api/api/* to /api/*)
app.use((req, res, next) => {
  if (req.url.startsWith("/api/api/")) {
    req.url = req.url.replace(/^\/api\/api\//, "/api/");
  }
  next();
});

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const { connectDB, getStatus } = require("./config/db");

// Connect to MongoDB
connectDB();

// Direct APK Download Endpoints for Mobile Chrome
app.get("/download/partner-apk", (req, res) => {
  const apkPath = path.join(__dirname, "public", "Helper_Partner_Latest.apk");
  res.download(apkPath, "Helper_Partner_Latest.apk");
});

app.get("/download", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Download Helper Partner App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0B1120; color: #FFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
          .card { background: #131C31; border-radius: 20px; padding: 36px 24px; max-width: 420px; width: 100%; text-align: center; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
          .icon { width: 72px; height: 72px; background: rgba(16,185,129,0.15); border: 2px solid #10B981; border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 34px; margin: 0 auto 18px auto; }
          .badge { display: inline-block; background: #D97706; color: #FFF; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
          h1 { font-size: 22px; font-weight: 900; margin-bottom: 8px; color: #F8FAFC; }
          p { color: #94A3B8; font-size: 13.5px; line-height: 1.6; margin-bottom: 24px; }
          .btn { display: block; width: 100%; background: linear-gradient(135deg, #10B981, #059669); color: #FFF; font-weight: 800; font-size: 16px; padding: 16px 20px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 16px rgba(16,185,129,0.4); }
          .info { margin-top: 20px; color: #64748B; font-size: 12px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">👑</div>
          <span class="badge">LATEST RELEASE APK</span>
          <h1>Helper Partner Hub</h1>
          <p>Official Partner App with complete Aadhaar KYC, Dual OTP & Franchise Payment Gateway.</p>
          <a class="btn" href="/Helper_Partner_V3.apk">⬇️ Download Partner APK (35.3 MB)</a>
          <div class="info">
            Package: <b>com.helperindiapartner.app</b><br>
            Direct Wi-Fi download &bull; Tap above to start install
          </div>
        </div>
      </body>
    </html>
  `);
});

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
app.use("/api/workers", require("./routes/workersRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

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

// Client-side React SPA fallback for Web & Super Admin Portal
app.get("*", (req, res, next) => {
  if (req.url.startsWith("/api") || req.url.startsWith("/download") || req.url.startsWith("/images") || req.url.startsWith("/uploads") || req.url.startsWith("/socket.io")) {
    return next();
  }
  const indexPath = path.join(__dirname, "..", "frontend", "build", "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

server.listen(PORT, () => {
  console.log(`🚀 Helper HTTP + WebSocket Server running at http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  try {
    const { startFranchiseMonitor } = require("./services/franchiseExpiryChecker");
    startFranchiseMonitor();
  } catch (e) {
    console.warn("⚠️ Franchise monitor init notice:", e.message);
  }
});

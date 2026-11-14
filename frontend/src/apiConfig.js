// Helper Platform Unified Cloud API Configuration
// Connects the Web Admin Panel, Website, and Mobile Applications (Customer, Vendor, Worker)
// to the exact same live 24/7 MongoDB Atlas database on Render.

export const CLOUD_BACKEND_URL = "https://helper-backend-api-8878.onrender.com";
export const LOCAL_BACKEND_URL = "http://localhost:5000";

const getBackendUrl = () => {
  // 1. Explicit env configuration takes top priority
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "");
  }

  // 2. Allow optional manual override in browser localStorage for offline debugging
  if (typeof window !== "undefined") {
    try {
      const explicit = localStorage.getItem("helper_backend_override");
      if (explicit) return explicit.replace(/\/api\/?$/, "");
    } catch (e) {}
  }

  // 3. By default, ALWAYS connect to the live 24/7 cloud backend so Web Admin has full live control
  // over all mobile apps (Android Customer, Vendor Partner, Worker Technician).
  return CLOUD_BACKEND_URL;
};

export const BACKEND_URL = getBackendUrl();
export const API_BASE = `${BACKEND_URL}/api`;
export const SOCKET_URL = BACKEND_URL;

export default API_BASE;

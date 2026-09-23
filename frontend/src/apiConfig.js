// Helper Platform API Configuration
// Automatically points to live Render backend in production and localhost in development

const isProduction =
  process.env.NODE_ENV === "production" ||
  (typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1");

export const BACKEND_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "")
  : (isProduction
      ? "https://helper-backend-api-8878.onrender.com"
      : "http://localhost:5000");

export const API_BASE = `${BACKEND_URL}/api`;
export const SOCKET_URL = BACKEND_URL;

export default API_BASE;

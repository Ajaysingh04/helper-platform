// Helper Platform API Configuration
// Automatically connects to local Wi-Fi backend (192.168.1.8 / localhost) when testing on same network,
// and falls back to live cloud backend in true public production environments.

const getBackendUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/api\/?$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Localhost, LAN IP (e.g. 192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      /^192\.168\./.test(host) ||
      /^10\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return `http://${host}:5000`;
    }
  }

  return "http://192.168.1.8:5000";
};

export const BACKEND_URL = getBackendUrl();
export const API_BASE = `${BACKEND_URL}/api`;
export const SOCKET_URL = BACKEND_URL;

export default API_BASE;

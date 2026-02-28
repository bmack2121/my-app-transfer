import axios from "axios";
import { hapticNotification } from "../utils/haptics";

// ✅ THE FIX: Swap the local IP for your Production Render URL
// We keep the process.env check for flexibility, but the fallback is now global.
const CLOUD_API_URL = "https://autosalespro-backend.onrender.com/api";
const API_URL = process.env.REACT_APP_API_URL || CLOUD_API_URL;

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20000, // Added timeout to handle Render "Cold Starts"
  headers: {
    "Content-Type": "application/json",
  },
});

// 📤 Request Interceptor: Inject JWT from LocalStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 📥 Response Interceptor: Global Error Handling
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🌐 Handle Network Failures (Offline or Render Sleep)
    if (!error.response) {
      console.error("🏁 VinPro Cloud: Request failed. Render may be waking up or you are offline.");
    }

    // 🛡️ Auto-Logout on Expired Token (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Safe haptic wrapper (triggers on physical device via Capacitor)
      try {
        await hapticNotification("error");
      } catch (e) {
        console.warn("Haptics not available in this environment.");
      }

      console.warn("🔒 Session expired. Redirecting to login...");

      localStorage.removeItem("token");

      // Force a redirect to login if we aren't already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
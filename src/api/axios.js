\import axios from "axios";
import { hapticNotification } from "../utils/haptics";

// 📡 Use your static network IP for mobile testing, or localhost for web dev
const API_URL = process.env.REACT_APP_API_URL || "http://192.168.0.73:5000/api";

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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

    // 🛡️ Auto-Logout on Expired Token (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Safe haptic wrapper (browser-safe)
      await hapticNotification("error");

      console.warn("🔒 Session expired. Redirecting to login...");

      localStorage.removeItem("token");

      // Force a redirect to login if we aren't already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
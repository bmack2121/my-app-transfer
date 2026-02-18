import axios from 'axios';
import { hapticWarning, hapticError } from "../utils/haptics";

const axiosClient = axios.create({
  // ✅ FIX: Using your development machine's local IP (192.168.0.73) 
  // This allows the physical phone to reach your Node.js server over Wi-Fi.
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://192.168.0.73:5000/api", 
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 📤 Request Interceptor: Auth & FormData Handling
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Auto-detect FormData (important for future image/video uploads)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 📥 Response Interceptor: Resilience & Session Management
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, code, config } = error;

    // 1. Handle Network/Timeout Errors (Common on dealership lots)
    // ERR_NETWORK usually means the IP is wrong or the server is down.
    if (code === "ECONNABORTED" || code === "ERR_NETWORK") {
      await hapticWarning();
      console.error(`🏁 VinPro Sync Timeout: Failed to reach ${config.baseURL}. Check IP.`);
    }

    // 2. Handle Session Expiry (401)
    if (response?.status === 401) {
      await hapticError();
      localStorage.removeItem("token");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=true";
      }
    }

    // 3. Handle Backend Validation Errors (The "Did not save" issue)
    if (response?.status === 400) {
      console.warn("Validation Error:", response.data.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
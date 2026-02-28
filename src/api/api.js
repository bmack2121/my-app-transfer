import axios from "axios";

// ✅ THE FIX: We prioritize the Environment Variable, but we change the 
// hardcoded fallback to your LIVE Render URL. 
const cloudBaseURL = "https://autosalespro-backend.onrender.com/api";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || cloudBaseURL,
  withCredentials: true,
  timeout: 20000, // Increased to 20s to allow for Render "Cold Starts" on the Free Tier
});

// 📤 Request Interceptor: Auth & Identity
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 📥 Response Interceptor: Resilience & Session Management
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Capture Network Failures (Essential for 5G/LTE roaming)
    if (!error.response) {
      console.error("🏁 VinPro Engine: Cloud Unreachable. Check Render Status or Internet.");
    }

    // Handle Session Expiry (401)
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Removing token...");
      localStorage.removeItem("token");
      
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
import axios from "axios";

const api = axios.create({
  // ✅ FIX: Use process.env for Create React App (CRA)
  // We check for the ENV variable first, then fall back to the hardcoded IP.
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://192.168.0.73:5000/api",
  withCredentials: true,
  timeout: 15000, 
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
    // ✅ Capture Network Failures (Essential for dealership Wi-Fi)
    if (!error.response) {
      console.error("🏁 VinPro Engine: Network Unreachable. Check your .73 IP and Firewall.");
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
import axios from 'axios';
import { hapticWarning, hapticError } from "../utils/haptics";

// ✅ FIX: Safely support both Vite and Create React App environment variables
const API_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) || 
  "http://192.168.0.73:5000/api";

const axiosClient = axios.create({
  baseURL: API_URL, 
  timeout: 120000, // 2 minutes: generous for lot acquisitions/photo uploads
  
  // Required for maintaining sessions across requests (must match backend CORS)
  withCredentials: true, 

  headers: {
    "Content-Type": "application/json",
  },
});

/* -------------------------------------------
 * 📤 REQUEST INTERCEPTOR
 * ------------------------------------------- */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    // Use Axios 1.x compliant header setting
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // Auto-detect FormData for vehicle photo/video uploads
    if (config.data instanceof FormData) {
      // Axios automatically calculates the multipart/form-data boundary. 
      // We MUST delete the manual JSON header so it doesn't overwrite it.
      config.headers.delete("Content-Type");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------------------------
 * 📥 RESPONSE INTERCEPTOR
 * ------------------------------------------- */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, code, config } = error;

    // 1. Handle Connectivity Failures (Physical device range issues on the lot)
    if (code === "ECONNABORTED" || code === "ERR_NETWORK" || !response) {
      await hapticWarning().catch(() => {}); // Catch prevents unhandled promise if haptics fail
      console.error(`🏁 VinPro Sync: Unreachable. Target: ${config?.baseURL}.`);
    }

    // 2. Handle Unauthorized / Expired Sessions
    if (response?.status === 401) {
      await hapticError().catch(() => {});
      localStorage.removeItem("token");

      // Use History API for a seamless client-side route change 
      // instead of window.location.href to prevent a white-screen reload in Capacitor
      if (!window.location.pathname.includes("/login")) {
        window.history.pushState({}, '', '/login?expired=true');
        // Dispatch a custom event so React Router picks up the change natively
        window.dispatchEvent(new Event('popstate')); 
      }
    }

    // 3. Handle Bad Requests / Validation Errors
    if (response?.status === 400) {
      console.warn("VinPro Engine - Validation Error:", response.data?.message || "Invalid data");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
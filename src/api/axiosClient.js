import axios from 'axios';
import { hapticWarning, hapticError } from "../utils/haptics";

// ✅ THE FIX: Swap the local IP fallback for your LIVE Render URL
const CLOUD_API_URL = "https://autosalespro-backend.onrender.com/api";

const API_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) || 
  CLOUD_API_URL;

const axiosClient = axios.create({
  baseURL: API_URL, 
  timeout: 120000, // 2 minutes: essential for uploading high-res vehicle photos to Render
  
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
    
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // Auto-detect FormData for vehicle photo/video uploads
    if (config.data instanceof FormData) {
      // Deleting Content-Type allows Axios to set the multipart boundary correctly
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

    // 1. Handle Connectivity Failures (Render waking up or 5G/LTE dead zones)
    if (code === "ECONNABORTED" || code === "ERR_NETWORK" || !response) {
      await hapticWarning().catch(() => {}); 
      console.error(`🏁 VinPro Sync: Cloud Unreachable. Target: ${config?.baseURL}. Render may be warming up.`);
    }

    // 2. Handle Unauthorized / Expired Sessions
    if (response?.status === 401) {
      await hapticError().catch(() => {});
      localStorage.removeItem("token");

      // Seamless navigation to prevent "White Screen" in Capacitor
      if (!window.location.pathname.includes("/login")) {
        window.history.pushState({}, '', '/login?expired=true');
        window.dispatchEvent(new Event('popstate')); 
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
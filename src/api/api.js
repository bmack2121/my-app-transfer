import axios from "axios";

const api = axios.create({
  // Pointing to your specific LAN IP for lot-speed connectivity
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://192.168.0.73:5000/api",
  withCredentials: true,
  timeout: 15000, // 15-second timeout for dealership Wi-Fi stability
});



// 📤 Request Interceptor: Inject JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 📥 Response Interceptor: Handle Session Expiry (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401, the token is likely expired or invalid
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Removing token and redirecting...");
      
      localStorage.removeItem("token");
      
      // Force a redirect to login if we aren't already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
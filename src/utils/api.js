// utils/api.js - Create axios instance with base configuration
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`, // ✅ Using environment variable
  timeout: 10000, // Request timeout (10 seconds)
  withCredentials: true, // Important for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - runs before every request
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if you switch to token-based auth
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.message);
    return Promise.reject(error); // Never redirect here
  }
);

export default api;

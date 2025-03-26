// src/api/axiosInstance.js
import axios from "axios";

// Create an Axios instance with your base URL (adjust as needed)
const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Add a request interceptor to attach the token from localStorage to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

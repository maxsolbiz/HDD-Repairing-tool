// src/api/api.js
import axiosInstance from "./axiosInstance";

// Sign up now accepts additional fields (username and role) if provided.
export const signUp = async (email, password, username = "", role = "user") => {
  try {
    const response = await axiosInstance.post("/auth/signup", { email, password, username, role });
    return response.data;
  } catch (error) {
    console.error("Error signing up:", error.response?.data || error.message);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    const response = await axiosInstance.post("/auth/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    console.error("Error signing in:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchDrives = async () => {
  try {
    const response = await axiosInstance.get("/drives");
    return response.data;
  } catch (error) {
    console.error("Error fetching drives:", error.response?.data || error.message);
    return { drives: [] };
  }
};

export const fetchUserInfo = async (token) => {
  try {
    const response = await axiosInstance.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error.response?.data || error.message);
    throw error;
  }
};

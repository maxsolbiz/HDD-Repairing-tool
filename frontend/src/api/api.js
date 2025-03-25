// src/api/api.js
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000"; // Adjust if necessary

export const signUp = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, { email, password });
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
    const response = await axios.post(`${BASE_URL}/auth/token`, formData, {
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
    const response = await axios.get(`${BASE_URL}/drives`);
    return response.data;
  } catch (error) {
    console.error("Error fetching drives:", error.response?.data || error.message);
    return { drives: [] };
  }
};

export const fetchUserInfo = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error.response?.data || error.message);
    throw error;
  }
};

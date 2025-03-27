// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserInfo } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (currentToken) => {
    if (currentToken) {
      try {
        const fetchedUser = await fetchUserInfo(currentToken);
        console.log("AuthContext: Fetched user =", fetchedUser);
        setUser(fetchedUser);
        localStorage.setItem("cachedUser", JSON.stringify(fetchedUser));
      } catch (error) {
        console.error("AuthContext: Error fetching user", error);
        setUser(null);
      }
    } else {
      console.warn("AuthContext: No token found");
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadUser(token);
  }, [token]);

  const updateToken = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cachedUser");
    setToken(null);
    setUser(null);
  };

  // Auto logout after 30 minutes of inactivity
  useEffect(() => {
    let timer;
    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        // Optionally show a toast notification for auto logout
        console.info("Auto-logout due to inactivity");
      }, 30 * 60 * 1000); // 30 minutes
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, updateToken, logout, loading, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserInfo } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize from cached data if available
  const initialUser = localStorage.getItem("cachedUser")
    ? JSON.parse(localStorage.getItem("cachedUser"))
    : null;
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("token");
    console.log("AuthContext: Token from localStorage =", token);
    if (token) {
      try {
        const data = await fetchUserInfo(token);
        console.log("AuthContext: Fetched user =", data);
        setUser(data);
        localStorage.setItem("cachedUser", JSON.stringify(data));
      } catch (error) {
        console.error("AuthContext: Error fetching user", error);
        setUser(null);
      }
    } else {
      console.warn("AuthContext: No token found");
      setUser(null);
    }
    setLoading(false);
    console.log("AuthContext: Loading finished, user =", user);
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

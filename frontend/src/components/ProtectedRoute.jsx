// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  console.log("ProtectedRoute: loading =", loading, "user =", user);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading authentication...</div>;
  }
  if (!user) {
    console.error("ProtectedRoute: No user found, redirecting to sign in");
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    console.error("ProtectedRoute: user not admin, redirecting");
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;

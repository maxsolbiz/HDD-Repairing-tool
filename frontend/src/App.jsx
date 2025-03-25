// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext"; // Import your ThemeContext provider
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy load pages (e.g. HomePage)
const HomePage = lazy(() => import("./pages/HomePage"));

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    // Display a splash screen while authentication data is loading.
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-screen">
                Loading page...
              </div>
            }
          >
            <AppContent />
          </Suspense>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

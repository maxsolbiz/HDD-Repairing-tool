// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const AdminLogsPage = lazy(() => import("./pages/AdminLogsPage"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));

const AppContent = () => {
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
      {/* Admin logs route (only for admin). We'll do a separate route */}
      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLogsPage />
          </ProtectedRoute>
        }
      />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
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
              <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
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

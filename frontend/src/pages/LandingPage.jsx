// src/pages/LandingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, signIn } from "../api/api";
import { toast } from "react-toastify";
import PublicLayout from "../components/PublicLayout";
import { useAuth } from "../contexts/AuthContext";

const LandingPage = () => {
  const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { updateToken, loadUser } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const data = await signUp(email, password);
      updateToken(data.access_token);
      // Optionally, you can call loadUser(data.access_token) to force re-fetch.
      await loadUser(data.access_token);
      toast.success("Signup successful!");
      navigate("/home");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Signup failed.");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const data = await signIn(email, password);
      updateToken(data.access_token);
      await loadUser(data.access_token);
      toast.success("Login successful!");
      navigate("/home");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed.");
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </h2>
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              // Use CSS variable for background so it matches the header/footer.
              style={{ backgroundColor: "var(--header-bg)" }}
              className="w-full py-2 px-4 text-white rounded-md hover:opacity-90 transition"
            >
              {mode === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </form>
          <div className="mt-4 text-center">
            {mode === "signin" ? (
              <p>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-blue-600 dark:text-blue-300 hover:underline">
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-blue-600 dark:text-blue-300 hover:underline">
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LandingPage;

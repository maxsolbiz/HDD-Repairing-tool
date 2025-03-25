// src/pages/LandingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, signIn } from "../api/api";
import { toast } from "react-toastify";

const LandingPage = () => {
  const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const data = await signUp(email, password);
      localStorage.setItem("token", data.access_token);
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
      localStorage.setItem("token", data.access_token);
      toast.success("Login successful!");
      navigate("/home");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>
        <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>
        <div className="mt-4 text-center">
          {mode === "signin" ? (
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-blue-600 hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="text-blue-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

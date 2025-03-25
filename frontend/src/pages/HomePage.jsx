// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { fetchDrives } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const [drives, setDrives] = useState([]);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("HomePage: loading =", loading, "user =", user);
    if (!loading && !user) {
      console.error("HomePage: No user data after loading, redirecting to landing page");
      navigate("/");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    fetchDrives()
      .then((data) => {
        console.log("HomePage: Drives fetched =", data.drives);
        setDrives(data.drives);
      })
      .catch((error) => console.error("HomePage: Error fetching drives", error));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          Loading user information...
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          No user data available. Please sign in again.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Welcome {user.email}</h1>
        <p className="mt-2">Manage, diagnose, and repair your drives.</p>
      </header>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Available Drives</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b text-left text-sm font-medium">Drive Name</th>
                <th className="px-6 py-3 border-b text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {drives.map((drive, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 border-b text-sm">{drive}</td>
                  <td className="px-6 py-4 border-b text-sm">Idle</td>
                </tr>
              ))}
              {drives.length === 0 && (
                <tr>
                  <td colSpan="2" className="px-6 py-4 text-center text-sm">
                    No drives found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
